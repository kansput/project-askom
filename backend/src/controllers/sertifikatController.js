import fs from "fs";
import path from "path";
import Sertifikat from "../models/sertifikatModel.js";
import { User } from "../models/index.js";

// Helper path publik
const makePublicPath = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, "/").replace(/^src\//, "");
};

// CREATE
export const createSertifikat = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // ambil dari auth atau body

    // Buat folder khusus user
    const userFolder = path.join(process.cwd(), "src/uploads/sertifikat", String(userId));
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "❌ File sertifikat wajib diupload" });
    }

    // Generate nama unik
    const originalExt = path.extname(req.file.originalname);
    const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${originalExt}`;
    const newPath = path.join(userFolder, newFilename);

    fs.renameSync(req.file.path, newPath);

    const sertifikat = await Sertifikat.create({
      kategori: req.body.kategori,
      judul: req.body.judul,
      tanggal: req.body.tanggal,
      penyelenggara: req.body.penyelenggara,
      filePath: makePublicPath(newPath),
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "✅ Sertifikat berhasil disimpan",
      data: sertifikat,
    });
  } catch (error) {
    console.error("❌ Error createSertifikat:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL (include User info)
export const getAllSertifikat = async (req, res) => {
  try {
    const data = await Sertifikat.findAll({
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "unit", "npk"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = data.map((d) => {
      const obj = d.toJSON();
      return {
        ...obj,
        username: obj.User?.username || "-",
        npk: obj.User?.npk || "-",
        unit: obj.User?.unit || "-",
      };
    });

    return res.json({ success: true, data: result, total: result.length });
  } catch (error) {
    console.error("❌ Error getAllSertifikat:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// GET BY USER
export const getSertifikatByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Sertifikat.findAll({
      where: { userId: id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error("❌ Error getSertifikatByUser:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteSertifikat = async (req, res) => {
  try {
    const { id } = req.params;
    const sertifikat = await Sertifikat.findByPk(id);
    if (!sertifikat) {
      return res.status(404).json({ success: false, message: " Sertifikat tidak ditemukan" });
    }

    if (sertifikat.filePath) {
      const fileToDelete = path.join(process.cwd(), "src", sertifikat.filePath);
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
      }
    }

    await sertifikat.destroy();
    return res.json({ success: true, message: "✅ Sertifikat berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error deleteSertifikat:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
