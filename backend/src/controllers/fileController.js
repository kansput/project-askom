import File from "../models/fileModel.js";
import path from "path";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const newFile = await File.create({
      name: file.originalname,
      path: `/uploads/${file.filename}`,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.mimetype,
      uploaded_by: req.body.uploaded_by || "unknown",
    });

    res.status(201).json(newFile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.findAll({ order: [["uploaded_at", "DESC"]] });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "src", file.path);
    res.download(filePath, file.name);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "src", file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // hapus file dari folder uploads
    }

    await file.destroy(); // hapus metadata dari DB
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
