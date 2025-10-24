import PenilaianPresentasi from "../models/penilaianpresentasiModel.js";
import User from "../models/userModel.js";
import { Op } from "sequelize";

/**
 * CREATE atau UPDATE Penilaian Presentasi
 * - Hanya assign penguji saat CREATE atau klaim eksplisit (?claim=1&slot=1|2)
 * - Tidak ada auto-assign tersembunyi saat update nilai
 */
export const createOrUpdatePenilaian = async (req, res) => {
    try {
        const {
            perawat_npk,
            tanggal_presentasi,
            topik,
            nilai_penguji1,
            nilai_penguji2,
            total_penguji1,
            total_penguji2,
            status,
            locked_by,
        } = req.body;

        const currentUserNpk = req.user.npk;

        // Validasi input wajib
        if (!perawat_npk || !tanggal_presentasi || !topik) {
            return res.status(400).json({
                success: false,
                message: "NPK perawat, tanggal presentasi, dan topik harus diisi",
            });
        }

        // Pastikan perawat valid
        const perawat = await User.findOne({
            where: { npk: perawat_npk, role: "perawat" },
        });
        if (!perawat) {
            return res.status(404).json({
                success: false,
                message: "Perawat tidak ditemukan",
            });
        }

        // Cek apakah penilaian sudah ada
        const existing = await PenilaianPresentasi.findOne({
            where: { perawat_npk, tanggal_presentasi, topik },
        });

        let result;

        if (existing) {
            // ======================================================
            // UPDATE PENILAIAN
            // ======================================================

            if (existing.status === "final") {
                return res
                    .status(400)
                    .json({ success: false, message: "Penilaian sudah final" });
            }

            const updateData = {};

            // ==============================
            // CLAIM SLOT (jika diminta)
            // ==============================
            const wantClaim = req.query.claim === "1";
            const claimSlot = req.query.slot; // "1" atau "2"

            const isUserPenguji1 = existing.penguji1_npk === currentUserNpk;
            const isUserPenguji2 = existing.penguji2_npk === currentUserNpk;

            if (wantClaim) {
                if (!isUserPenguji1 && !isUserPenguji2) {
                    if (claimSlot === "1" && !existing.penguji1_npk) {
                        updateData.penguji1_npk = currentUserNpk;
                    } else if (claimSlot === "2" && !existing.penguji2_npk) {
                        updateData.penguji2_npk = currentUserNpk;
                    } else {
                        return res.status(409).json({
                            success: false,
                            message: "Slot penguji tidak tersedia atau sudah terisi",
                        });
                    }
                }
            }

            // ==============================
            // VALIDASI AKSES EDIT
            // ==============================
            if (nilai_penguji1 !== undefined && !isUserPenguji1) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses untuk mengedit nilai Penguji 1",
                });
            }

            if (nilai_penguji2 !== undefined && !isUserPenguji2) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses untuk mengedit nilai Penguji 2",
                });
            }

            // Kunci form hanya boleh diedit oleh yang memiliki lock
            if (
                existing.locked_by &&
                existing.locked_by !== currentUserNpk &&
                (nilai_penguji1 !== undefined || nilai_penguji2 !== undefined)
            ) {
                return res.status(423).json({
                    success: false,
                    message: "Form sedang dikunci oleh user lain",
                });
            }

            // ==============================
            // UPDATE NILAI & STATUS
            // ==============================
            if (nilai_penguji1 !== undefined) updateData.nilai_penguji1 = nilai_penguji1;
            if (nilai_penguji2 !== undefined) updateData.nilai_penguji2 = nilai_penguji2;
            if (total_penguji1 !== undefined) updateData.total_penguji1 = total_penguji1;
            if (total_penguji2 !== undefined) updateData.total_penguji2 = total_penguji2;
            if (locked_by !== undefined) updateData.locked_by = locked_by;

            // Ubah status otomatis sesuai progres
            if (nilai_penguji1 !== undefined && isUserPenguji1)
                updateData.status = "penguji1_selesai";
            if (nilai_penguji2 !== undefined && isUserPenguji2)
                updateData.status = "penguji2_selesai";
            if (status) updateData.status = status;

            result = await existing.update(updateData);
        } else {
            // ======================================================
            // CREATE PENILAIAN BARU
            // ======================================================
            result = await PenilaianPresentasi.create({
                perawat_npk,
                tanggal_presentasi,
                topik,
                nilai_penguji1: nilai_penguji1 || null,
                nilai_penguji2: nilai_penguji2 || null,
                total_penguji1: total_penguji1 || null,
                total_penguji2: total_penguji2 || null,
                status: "draft",
                penguji1_npk: currentUserNpk, // user pertama otomatis penguji1
                penguji2_npk: null,
                locked_by: locked_by || null,
            });
        }

        const updated = await PenilaianPresentasi.findByPk(result.id, {
            include: [
                { model: User, as: "perawat", attributes: ["npk", "username", "unit"] },
                { model: User, as: "penguji1", attributes: ["npk", "username"] },
                { model: User, as: "penguji2", attributes: ["npk", "username"] },
            ],
        });

        res.json({
            success: true,
            message: existing ? "Penilaian berhasil diupdate" : "Penilaian berhasil dibuat",
            data: updated,
        });
    } catch (err) {
        console.error("❌ Error createOrUpdatePenilaian:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

/**
 * GET satu penilaian berdasarkan perawat + tanggal + topik
 */
export const getPenilaian = async (req, res) => {
    try {
        const { npk, tanggal, topik } = req.query;
        if (!npk || !tanggal || !topik) {
            return res.status(400).json({
                success: false,
                message: "NPK, tanggal, dan topik wajib diisi",
            });
        }

        const penilaian = await PenilaianPresentasi.findOne({
            where: { perawat_npk: npk, tanggal_presentasi: tanggal, topik },
            include: [
                { model: User, as: "perawat", attributes: ["npk", "username", "unit"] },
                { model: User, as: "penguji1", attributes: ["npk", "username"], required: false },
                { model: User, as: "penguji2", attributes: ["npk", "username"], required: false },
            ],
        });

        if (!penilaian)
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        res.json({ success: true, data: penilaian });
    } catch (err) {
        console.error("❌ Error getPenilaian:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * FINALIZE penilaian jika kedua penguji sudah selesai
 */
export const finalizePenilaian = async (req, res) => {
    try {
        const { id } = req.params;
        const { nilai_final, grade } = req.body;

        const data = await PenilaianPresentasi.findByPk(id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        if (data.status !== "penguji2_selesai") {
            return res.status(400).json({
                success: false,
                message: "Finalisasi hanya bisa dilakukan setelah dua penguji selesai",
            });
        }

        await data.update({
            status: "final",
            nilai_final,
            grade,
            locked_by: null,
        });

        res.json({ success: true, message: "Penilaian berhasil difinalisasi", data });
    } catch (err) {
        console.error("❌ Error finalizePenilaian:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * GET semua penilaian untuk satu perawat
 */
export const getPenilaianByPerawat = async (req, res) => {
    try {
        const { npk } = req.params;
        const list = await PenilaianPresentasi.findAll({
            where: { perawat_npk: npk },
            include: [
                { model: User, as: "perawat", attributes: ["npk", "username", "unit"] },
                { model: User, as: "penguji1", attributes: ["npk", "username"] },
                { model: User, as: "penguji2", attributes: ["npk", "username"] },
            ],
            order: [["tanggal_presentasi", "DESC"]],
        });
        res.json({ success: true, data: list });
    } catch (err) {
        console.error("❌ Error getPenilaianByPerawat:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * GET semua penilaian (untuk admin)
 */
export const getAllPenilaian = async (req, res) => {
    try {
        const list = await PenilaianPresentasi.findAll({
            include: [
                { model: User, as: "perawat", attributes: ["npk", "username", "unit"] },
                { model: User, as: "penguji1", attributes: ["npk", "username"] },
                { model: User, as: "penguji2", attributes: ["npk", "username"] },
            ],
            order: [["tanggal_presentasi", "DESC"]],
        });
        res.json({ success: true, data: list });
    } catch (err) {
        console.error("❌ Error getAllPenilaian:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * DELETE penilaian
 */
export const deletePenilaian = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await PenilaianPresentasi.findByPk(id);
        if (!data)
            return res
                .status(404)
                .json({ success: false, message: "Data penilaian tidak ditemukan" });

        await data.destroy();
        res.json({ success: true, message: "Data berhasil dihapus" });
    } catch (err) {
        console.error("❌ Error deletePenilaian:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
