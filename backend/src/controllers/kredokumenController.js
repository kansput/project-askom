import KredoDokumen from "../models/kredokumenModel.js";
import { User } from "../models/index.js";
import path from "path";
import fs from "fs";

// ============================================================================
// 🔧 HELPER FUNCTIONS
// ============================================================================

// Ambil path relatif dari "src/"
const makePublicPath = (filePath) => {
    if (!filePath) return null;
    const normalized = filePath.replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    if (uploadsIndex !== -1) {
        // hasil: "kredokumen/1/fileSPKK-....pdf"
        return normalized.substring(uploadsIndex + "uploads/".length);
    }
    return normalized;
};


// Hapus file fisik dengan aman
const deleteFile = (relativePath) => {
    if (!relativePath) return;

    const fullPath = path.join(process.cwd(), "src", relativePath);
    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("🗑️ File deleted:", fullPath);
        } else {
            console.log("⚠️ File not found:", fullPath);
        }
    } catch (err) {
        console.error("❌ Error deleting file:", err);
    }
};

// Base URL (fallback ke localhost)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============================================================================
// 📦 CREATE (UPLOAD DOKUMEN)
// ============================================================================
export const uploadKredoDokumen = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tanggal } = req.body;

        if (!tanggal) {
            return res.status(400).json({
                success: false,
                message: "Tanggal wajib diisi!",
            });
        }

        if (!req.files?.fileKredensial || !req.files?.fileSPKK) {
            return res.status(400).json({
                success: false,
                message: "Kedua file (Kredensial dan SPKK) wajib diunggah.",
            });
        }

        // Ambil path relatif
        const fileKredensialPath = makePublicPath(req.files.fileKredensial[0].path);
        const fileSPKKPath = makePublicPath(req.files.fileSPKK[0].path);

        // Simpan ke database
        const newDoc = await KredoDokumen.create({
            tanggal,
            fileKredensial: fileKredensialPath,
            fileSPKK: fileSPKKPath,
            userId,
        });

        console.log("✅ New document uploaded:", newDoc.id);

        return res.status(201).json({
            success: true,
            message: "Dokumen berhasil diunggah.",
            data: {
                ...newDoc.toJSON(),
                fileKredensialUrl: `${BASE_URL}/${fileKredensialPath}`,
                fileSPKKUrl: `${BASE_URL}/${fileSPKKPath}`,
            },
        });
    } catch (error) {
        console.error("❌ Error uploadKredoDokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengunggah dokumen.",
        });
    }
};

// ============================================================================
// 📋 GET ALL (ADMIN / KEPALA UNIT / MITRA BESTARI)
// ============================================================================
export const getAllKredoDokumen = async (req, res) => {
    try {
        const docs = await KredoDokumen.findAll({
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "npk", "username", "unit", "jenjangKarir"],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const result = docs.map((doc) => {
            const d = doc.toJSON();
            return {
                ...d,
                npk: d.User?.npk || null,
                username: d.User?.username || null,
                unit: d.User?.unit || null,
                jenjangKarir: d.User?.jenjangKarir || null,
                fileKredensialUrl: d.fileKredensial ? `${BASE_URL}/${d.fileKredensial}` : null,
                fileSPKKUrl: d.fileSPKK ? `${BASE_URL}/${d.fileSPKK}` : null,
                User: undefined,
            };
        });

        return res.json({
            success: true,
            data: result,
            total: result.length,
        });
    } catch (error) {
        console.error("❌ Error getAllKredoDokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil semua dokumen.",
        });
    }
};

// ============================================================================
// 👤 GET BY USER
// ============================================================================
export const getKredoDokumenByUser = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;

        const docs = await KredoDokumen.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "npk", "username", "unit", "jenjangKarir"],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const result = docs.map((doc) => {
            const d = doc.toJSON();
            return {
                ...d,
                npk: d.User?.npk || null,
                username: d.User?.username || null,
                unit: d.User?.unit || null,
                jenjangKarir: d.User?.jenjangKarir || null,
                fileKredensialUrl: d.fileKredensial ? `${BASE_URL}/${d.fileKredensial}` : null,
                fileSPKKUrl: d.fileSPKK ? `${BASE_URL}/${d.fileSPKK}` : null,
                User: undefined,
            };
        });

        return res.json({
            success: true,
            data: result,
            total: result.length,
        });
    } catch (error) {
        console.error("❌ Error getKredoDokumenByUser:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil dokumen user.",
        });
    }
};

// ============================================================================
// 📄 GET BY DOCUMENT ID
// ============================================================================
export const getKredoDokumenById = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await KredoDokumen.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "npk", "username", "unit", "jenjangKarir"],
                },
            ],
        });

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: `Dokumen dengan id=${id} tidak ditemukan.`,
            });
        }

        const d = doc.toJSON();

        return res.json({
            success: true,
            data: {
                ...d,
                npk: d.User?.npk || null,
                username: d.User?.username || null,
                unit: d.User?.unit || null,
                jenjangKarir: d.User?.jenjangKarir || null,
                fileKredensialUrl: d.fileKredensial ? `${BASE_URL}/${d.fileKredensial}` : null,
                fileSPKKUrl: d.fileSPKK ? `${BASE_URL}/${d.fileSPKK}` : null,
            },
        });
    } catch (error) {
        console.error("❌ Error getKredoDokumenById:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil dokumen.",
        });
    }
};

// ============================================================================
// 🗑️ DELETE DOKUMEN
// ============================================================================
export const deleteKredoDokumen = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await KredoDokumen.findByPk(id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: `Dokumen dengan id=${id} tidak ditemukan.`,
            });
        }

        // Simpan path dulu
        const fileKredensialPath = doc.fileKredensial;
        const fileSPKKPath = doc.fileSPKK;

        await doc.destroy();

        // Hapus file fisik
        deleteFile(fileKredensialPath);
        deleteFile(fileSPKKPath);

        return res.json({
            success: true,
            message: "Dokumen berhasil dihapus.",
        });
    } catch (error) {
        console.error("❌ Error deleteKredoDokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal menghapus dokumen.",
        });
    }
};
