// controllers/strController.js
import { StrDocument, User } from "../models/index.js";

// Helper untuk path upload
const makePublicPath = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, "/").replace(/^src\//, "");
};

// CREATE
export const createStrDocument = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = {
      tahunSelesai: req.body.tahunSelesai,
      pendidikanterakhir: req.body.pendidikanterakhir,
      masaKerja: req.body.masaKerja,
      lamaNaikJenjang: req.body.lamaNaikJenjang,
      asalSekolah: req.body.asalSekolah,

      fileIjazah: req.files?.fileIjazah
        ? makePublicPath(req.files.fileIjazah[0].path)
        : null,

      nomorSTR: req.body.nomorSTR,
      tglBerakhirSTR: req.body.tglBerakhirSTR,
      fileSTR: req.files?.fileSTR
        ? makePublicPath(req.files.fileSTR[0].path)
        : null,

      nomorSIP: req.body.nomorSIP,
      tglBerakhirSIP: req.body.tglBerakhirSIP,
      fileSIP: req.files?.fileSIP
        ? makePublicPath(req.files.fileSIP[0].path)
        : null,

      nomorRKK: req.body.nomorRKK,
      rkkMasaBerlaku: req.body.rkkMasaBerlaku,
      masaBerlakuRKK: req.body.masaBerlakuRKK,
      fileRKK: req.files?.fileRKK
        ? makePublicPath(req.files.fileRKK[0].path)
        : null,

      userId,
    };

    const newDoc = await StrDocument.create(data);

    return res.status(201).json({
      success: true,
      message: "✅ STR document berhasil dibuat",
      data: newDoc,
    });
  } catch (error) {
    console.error("❌ Error creating STR document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal membuat dokumen STR",
    });
  }
};

// GET ALL (untuk kepala unit / admin)
export const getAllStrDocuments = async (req, res) => {
  try {
    const docs = await StrDocument.findAll({
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
        User: undefined,
      };
    });

    return res.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("❌ Error fetching all STR documents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil semua dokumen STR",
    });
  }
};

// GET BY USER
export const getStrDocumentsByUser = async (req, res) => {
  try {
    const { id } = req.params;

    const docs = await StrDocument.findAll({
      where: { userId: id },
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
        User: undefined,
      };
    });

    return res.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("❌ Error fetching STR documents by user:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil dokumen STR per user",
    });
  }
};

// GET BY DOCUMENT ID
export const getStrDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await StrDocument.findByPk(id, {
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
        message: `❌ Dokumen dengan id=${id} tidak ditemukan`,
      });
    }

    return res.json({
      success: true,
      data: {
        ...doc.toJSON(),
        npk: doc.User?.npk || null,
        username: doc.User?.username || null,
        unit: doc.User?.unit || null,
        jenjangKarir: doc.User?.jenjangKarir || null,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching STR document by id:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil dokumen STR berdasarkan id",
    });
  }
};

// UPDATE
export const updateStrDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await StrDocument.findByPk(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `❌ Dokumen dengan id=${id} tidak ditemukan`,
      });
    }

    await doc.update(req.body);

    return res.json({
      success: true,
      message: "✅ STR document berhasil diupdate",
      data: doc,
    });
  } catch (error) {
    console.error("❌ Error updating STR document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengupdate dokumen STR",
    });
  }
};

// DELETE
export const deleteStrDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await StrDocument.findByPk(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `❌ Dokumen dengan id=${id} tidak ditemukan`,
      });
    }

    await doc.destroy();

    return res.json({
      success: true,
      message: "✅ STR document berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error deleting STR document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus dokumen STR",
    });
  }
};
