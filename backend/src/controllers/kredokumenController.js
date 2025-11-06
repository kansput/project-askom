import KredoDokumen from "../models/kredokumenModel.js";
import User from "../models/userModel.js";
import path from "path";
import fs from "fs";

// Helper untuk path upload - PERBAIKI
const makePublicPath = (filePath) => {
    if (!filePath) return null;
    
    // Normalize path separator
    let normalizedPath = filePath.replace(/\\/g, "/");
    
    // Debug: log original path
    console.log("📁 Original path:", filePath);
    console.log("📁 Normalized path:", normalizedPath);
    
    // Remove the uploads directory part to make it relative to static serving
    // Sesuaikan dengan struktur folder Anda
    if (normalizedPath.includes("src/uploads/")) {
        normalizedPath = normalizedPath.split("src/uploads/")[1];
    } else if (normalizedPath.includes("uploads/")) {
        normalizedPath = normalizedPath.split("uploads/")[1];
    }
    
    console.log("📁 Public path:", normalizedPath);
    return normalizedPath;
};

// Helper untuk menghapus file fisik
const deleteFile = (filePath) => {
    if (!filePath) return;
    
    try {
        // Reconstruct full path
        const fullPath = path.join(process.cwd(), "src", "uploads", filePath);
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("File deleted:", fullPath);
        } else {
            console.log("⚠️ File not found:", fullPath);
        }
    } catch (error) {
        console.error(" Error deleting file:", error);
    }
};

// CREATE - Upload dokumen kredensial & SPKK - PERBAIKI dengan debug
export const uploadKredoDokumen = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tanggal } = req.body;

        console.log("🔍 Upload request received:");
        console.log("User ID:", userId);
        console.log("Tanggal:", tanggal);
        console.log("Files:", req.files);

        if (!tanggal) {
            return res.status(400).json({
                success: false,
                message: "Pilih tanggal terlebih dahulu!",
            });
        }

        if (!req.files?.fileKredensial || !req.files?.fileSPKK) {
            return res.status(400).json({
                success: false,
                message: "Harap upload kedua dokumen (Kredensial dan SPKK)!",
            });
        }

        // Debug file paths
        console.log("📄 File Kredensial details:");
        console.log("- Original name:", req.files.fileKredensial[0].originalname);
        console.log("- Path:", req.files.fileKredensial[0].path);
        console.log("- Size:", req.files.fileKredensial[0].size);
        
        console.log("📄 File SPKK details:");
        console.log("- Original name:", req.files.fileSPKK[0].originalname);
        console.log("- Path:", req.files.fileSPKK[0].path);
        console.log("- Size:", req.files.fileSPKK[0].size);

        const data = {
            tanggal,
            fileKredensial: makePublicPath(req.files.fileKredensial[0].path),
            fileSPKK: makePublicPath(req.files.fileSPKK[0].path),
            userId,
        };

        console.log("💾 Data to save:", data);

        const newDoc = await KredoDokumen.create(data);

        console.log("Document saved to database:", newDoc.id);

        return res.status(201).json({
            success: true,
            message: "Dokumen Kredensial & SPKK berhasil diupload",
            data: newDoc,
        });
    } catch (error) {
        console.error(" Error uploading kredokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal upload dokumen",
        });
    }
};

// DELETE - Hapus dokumen kredensial & SPKK
export const deleteKredoDokumen = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(" Delete request received:");
        console.log("Document ID:", id);
        console.log("User ID:", userId);
        console.log("User Role:", userRole);

        // Cari dokumen
        const doc = await KredoDokumen.findByPk(id);
        
        if (!doc) {
            return res.status(404).json({
                success: false,
                message: " Dokumen tidak ditemukan",
            });
        }

        // Cek ownership: perawat hanya bisa hapus dokumen sendiri
        // Kepala unit/mitra bestari bisa hapus semua dokumen
        if (userRole === "perawat" && doc.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: " Anda tidak memiliki izin untuk menghapus dokumen ini",
            });
        }

        // Simpan path file sebelum menghapus dari database
        const fileKredensialPath = doc.fileKredensial;
        const fileSPKKPath = doc.fileSPKK;

        // Hapus dari database
        await doc.destroy();

        // Hapus file fisik
        deleteFile(fileKredensialPath);
        deleteFile(fileSPKKPath);

        console.log("Document deleted successfully:", id);

        return res.json({
            success: true,
            message: "Dokumen berhasil dihapus",
        });
    } catch (error) {
        console.error(" Error deleting kredokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal menghapus dokumen",
        });
    }
};

// GET ALL (untuk kepala unit / mitra bestari) - PERBAIKI dengan include file URLs
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
            
            // Tambahkan full URL untuk file
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            
            return {
                ...d,
                npk: d.User?.npk || null,
                username: d.User?.username || null,
                unit: d.User?.unit || null,
                jenjangKarir: d.User?.jenjangKarir || null,
                // Tambahkan full URL untuk download
                fileKredensialUrl: d.fileKredensial ? `${baseUrl}/uploads/${d.fileKredensial}` : null,
                fileSPKKUrl: d.fileSPKK ? `${baseUrl}/uploads/${d.fileSPKK}` : null,
                User: undefined,
            };
        });

        return res.json({
            success: true,
            data: result,
            total: result.length,
        });
    } catch (error) {
        console.error(" Error fetching all kredokumen:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil semua dokumen",
        });
    }
};

// GET BY USER - PERBAIKI dengan include file URLs
export const getKredoDokumenByUser = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;

        console.log("🔍 Fetching documents for user:", userId);

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
            
            // Tambahkan full URL untuk file
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            
            return {
                ...d,
                npk: d.User?.npk || null,
                username: d.User?.username || null,
                unit: d.User?.unit || null,
                jenjangKarir: d.User?.jenjangKarir || null,
                // Tambahkan full URL untuk download
                fileKredensialUrl: d.fileKredensial ? `${baseUrl}/uploads/${d.fileKredensial}` : null,
                fileSPKKUrl: d.fileSPKK ? `${baseUrl}/uploads/${d.fileSPKK}` : null,
                User: undefined,
            };
        });

        console.log(`Found ${result.length} documents for user ${userId}`);

        return res.json({
            success: true,
            data: result,
            total: result.length,
        });
    } catch (error) {
        console.error(" Error fetching kredokumen by user:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil dokumen per user",
        });
    }
};

// GET BY DOCUMENT ID - PERBAIKI dengan include file URLs
export const getKredoDokumenById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("🔍 Fetching document by ID:", id);

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
                message: ` Dokumen dengan id=${id} tidak ditemukan`,
            });
        }

        const docData = doc.toJSON();
        
        // Tambahkan full URL untuk file
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        
        const result = {
            ...docData,
            npk: docData.User?.npk || null,
            username: docData.User?.username || null,
            unit: docData.User?.unit || null,
            jenjangKarir: docData.User?.jenjangKarir || null,
            // Tambahkan full URL untuk download
            fileKredensialUrl: docData.fileKredensial ? `${baseUrl}/uploads/${docData.fileKredensial}` : null,
            fileSPKKUrl: docData.fileSPKK ? `${baseUrl}/uploads/${docData.fileSPKK}` : null,
        };

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(" Error fetching kredokumen by id:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Gagal mengambil dokumen berdasarkan id",
        });
    }
};