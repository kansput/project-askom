import multer from "multer";
import path from "path";
import fs from "fs";

// Folder dasar untuk FILE UMUM (bukan gambar ujian)
const baseDir = path.join(process.cwd(), "src/uploads");

// Pastikan folder ada (kalau belum, buat)
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, baseDir);
  },
  filename: (req, file, cb) => {
    // Amankan nama file dari karakter aneh
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

// Batas ukuran 20MB (sesuai sebelumnya)
const limits = { fileSize: 20 * 1024 * 1024 };

const upload = multer({ storage, limits });

export default upload;
