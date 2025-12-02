import PenilaianKeterampilan from "../models/penilaianketerampilanModel.js";
import User from "../models/userModel.js";
import { Op } from "sequelize";

export const createOrUpdatePenilaian = async (req, res) => {
  try {
    const {
      perawat_npk,
      tanggal_penilaian,
      prosedur,
      nilai_komponen,
      total_bobot,
      total_nilai,
      nilai_akhir,
      grade,
      status,
      keterangan_umum 
    } = req.body;

    const currentUserNpk = req.user.npk;

    if (!perawat_npk || !tanggal_penilaian || !prosedur || !nilai_komponen) {
      return res.status(400).json({
        success: false,
        message: "NPK perawat, tanggal penilaian, prosedur, dan komponen penilaian harus diisi"
      });
    }

    const perawat = await User.findOne({ where: { npk: perawat_npk, role: 'perawat' } });
    if (!perawat) {
      return res.status(404).json({ success: false, message: "Perawat tidak ditemukan" });
    }

    const existingPenilaian = await PenilaianKeterampilan.findOne({
      where: { perawat_npk, tanggal_penilaian, prosedur }
    });

    let result;

    if (existingPenilaian) {
      const updateData = {
        nilai_komponen: JSON.stringify(nilai_komponen),
        penilai_npk: currentUserNpk
      };

      if (total_bobot !== undefined) updateData.total_bobot = total_bobot;
      if (total_nilai !== undefined) updateData.total_nilai = total_nilai;
      if (nilai_akhir !== undefined) updateData.nilai_akhir = nilai_akhir;
      if (grade !== undefined) updateData.grade = grade;
      if (status !== undefined) updateData.status = status;
      if (keterangan_umum !== undefined) updateData.keterangan_umum = keterangan_umum; 

      result = await existingPenilaian.update(updateData);
    } else {
      result = await PenilaianKeterampilan.create({
        perawat_npk,
        tanggal_penilaian,
        prosedur,
        penilai_npk: currentUserNpk,
        nilai_komponen: JSON.stringify(nilai_komponen),
        total_bobot: total_bobot || 0,
        total_nilai: total_nilai || 0,
        nilai_akhir: nilai_akhir || 0,
        grade: grade || 'D',
        status: status || 'draft',
        keterangan_umum: keterangan_umum || null 
      });
    }
    const updatedPenilaian = await PenilaianKeterampilan.findByPk(result.id, {
      include: [
        // (opsional) sesuaikan alias dengan yang ada di model kamu
        { model: User, as: 'perawat', attributes: ['npk', 'username', 'unit'] },
        { model: User, as: 'penilai', attributes: ['npk', 'username'] }
      ]
    });

    const responseData = {
      ...updatedPenilaian.toJSON(),
      nilai_komponen: JSON.parse(updatedPenilaian.nilai_komponen)
    };

    res.json({
      success: true,
      message: existingPenilaian ? "Penilaian berhasil diupdate" : "Penilaian berhasil dibuat",
      data: responseData
    });

  } catch (error) {
    console.error("Error create/update penilaian:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};



export const getPenilaian = async (req, res) => {
    try {
        const { npk, tanggal, prosedur } = req.query;

        if (!npk || !tanggal || !prosedur) {
            return res.status(400).json({
                success: false,
                message: "NPK, tanggal, dan prosedur harus disertakan"
            });
        }

        const penilaian = await PenilaianKeterampilan.findOne({
            where: {
                perawat_npk: npk,
                tanggal_penilaian: tanggal,
                prosedur: prosedur
            },
            // Di semua bagian yang ada include, ganti alias:
            include: [
                { model: User, as: 'perawatKeterampilan', attributes: ['npk', 'username', 'unit'] },
                { model: User, as: 'penilaiKeterampilan', attributes: ['npk', 'username'] }
            ]
        });

        if (!penilaian) {
            return res.status(404).json({
                success: false,
                message: "Data penilaian tidak ditemukan"
            });
        }

        // Parse nilai_komponen kembali ke JSON
        const responseData = {
            ...penilaian.toJSON(),
            nilai_komponen: JSON.parse(penilaian.nilai_komponen)
        };

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error("Error get penilaian:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const finalizePenilaian = async (req, res) => {
    try {
        const { id } = req.params;

        const penilaian = await PenilaianKeterampilan.findByPk(id, {
            include: [
                { model: User, as: 'penilai', attributes: ['npk', 'username'] }
            ]
        });

        if (!penilaian) {
            return res.status(404).json({
                success: false,
                message: "Data penilaian tidak ditemukan"
            });
        }

        if (penilaian.status !== 'selesai') {
            return res.status(400).json({
                success: false,
                message: "Hanya bisa memfinalisasi penilaian yang sudah selesai"
            });
        }

        // Update ke status final
        await penilaian.update({
            status: 'final'
        });

        // Parse nilai_komponen kembali ke JSON
        const responseData = {
            ...penilaian.toJSON(),
            nilai_komponen: JSON.parse(penilaian.nilai_komponen)
        };

        res.json({
            success: true,
            message: "Penilaian berhasil difinalisasi",
            data: responseData
        });

    } catch (error) {
        console.error("Error finalize penilaian:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getPenilaianByPerawat = async (req, res) => {
    try {
        const { npk } = req.params;

        const penilaianList = await PenilaianKeterampilan.findAll({
            where: { perawat_npk: npk },
            // Di semua bagian yang ada include, ganti alias:
            include: [
                { model: User, as: 'perawatKeterampilan', attributes: ['npk', 'username', 'unit'] },
                { model: User, as: 'penilaiKeterampilan', attributes: ['npk', 'username'] }
            ],
            order: [['tanggal_penilaian', 'DESC']]
        });

        // Parse nilai_komponen untuk setiap penilaian
        const responseData = penilaianList.map(item => ({
            ...item.toJSON(),
            nilai_komponen: JSON.parse(item.nilai_komponen)
        }));

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error("Error get penilaian by perawat:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getAllPenilaian = async (req, res) => {
    try {
        const penilaianList = await PenilaianKeterampilan.findAll({
            // Di semua bagian yang ada include, ganti alias:
            include: [
                { model: User, as: 'perawatKeterampilan', attributes: ['npk', 'username', 'unit'] },
                { model: User, as: 'penilaiKeterampilan', attributes: ['npk', 'username'] }
            ],
            order: [['tanggal_penilaian', 'DESC']]
        });

        // Parse nilai_komponen untuk setiap penilaian
        const responseData = penilaianList.map(item => ({
            ...item.toJSON(),
            nilai_komponen: JSON.parse(item.nilai_komponen)
        }));

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error("Error get all penilaian:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const deletePenilaian = async (req, res) => {
    try {
        const { id } = req.params;

        const penilaian = await PenilaianKeterampilan.findByPk(id);

        if (!penilaian) {
            return res.status(404).json({
                success: false,
                message: "Data penilaian tidak ditemukan"
            });
        }

        await penilaian.destroy();

        res.json({
            success: true,
            message: "Penilaian berhasil dihapus"
        });

    } catch (error) {
        console.error("Error delete penilaian:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};