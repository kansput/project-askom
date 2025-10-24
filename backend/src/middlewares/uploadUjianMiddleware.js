import multer from "multer";
import path from "path";
import fs from "fs";

// Folder khusus untuk gambar soal ujian
const ujianDir = path.join(process.cwd(), "src/uploads/ujian");

// Pastikan folder ada (kalau belum, buat)
if (!fs.existsSync(ujianDir)) {
  fs.mkdirSync(ujianDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ujianDir);
  },
  filename: (req, file, cb) => {
    // Nama file = timestamp + nama file asli (dilindungi dari karakter aneh)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

// Batas ukuran maksimal 10MB (cukup buat soal dengan gambar)
const limits = { fileSize: 10 * 1024 * 1024 };

const uploadUjian = multer({ storage, limits });

export default uploadUjian;
