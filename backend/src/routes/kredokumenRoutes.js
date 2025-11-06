import express from "express";
import {
  uploadKredoDokumen,
  getAllKredoDokumen,
  getKredoDokumenByUser,
  getKredoDokumenById,
  deleteKredoDokumen,
} from "../controllers/kredokumenController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { 
  checkKredoOwnership, 
  authorizeKredoRoles, 
  validateKredoUpload 
} from "../middlewares/kredokumenMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Konfigurasi multer untuk membuat folder per user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.id;
    //  PERBAIKAN: Sesuaikan dengan struktur folder backend/src/uploads
    const uploadPath = path.join(process.cwd(), "src", "uploads", "kredokumen", userId.toString());
    
    console.log(" Creating upload directory:", uploadPath);
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(" Upload directory created");
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname;
    const filename = fieldName + "-" + uniqueSuffix + ext;
    
    console.log("📄 Saving file:", filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xls", ".xlsx"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  console.log("🔍 Checking file:", file.originalname, "Type:", file.mimetype, "Extension:", ext);
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Harap upload file XLS atau XLSX."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Error handler untuk multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Maksimal 10MB.",
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

//  Middleware khusus untuk handle FormData dengan multer
const handleFormData = (req, res, next) => {
  console.log("🔍 Processing FormData...");
  console.log("📝 Headers:", req.headers);
  console.log("📦 Body:", req.body);
  next();
};

const router = express.Router();

// Routes untuk user (perawat) - PERBAIKI URUTAN MIDDLEWARE
router.post(
  "/upload",
  verifyToken,
  //  URUTAN YANG BENAR: Multer dulu, baru validasi
  upload.fields([
    { name: "fileKredensial", maxCount: 1 },
    { name: "fileSPKK", maxCount: 1 },
  ]),
  handleMulterError,
  handleFormData, // Debug middleware
  validateKredoUpload, //  Sekarang req.body sudah terisi
  uploadKredoDokumen
);

// DELETE dokumen by document ID (dengan cek ownership)
router.delete("/:id", verifyToken, checkKredoOwnership, deleteKredoDokumen);

// Perawat bisa lihat dokumen sendiri
router.get("/my-documents", verifyToken, (req, res) => {
  req.params = { id: req.user.id };
  return getKredoDokumenByUser(req, res);
});

// Get dokumen by user ID (dengan cek ownership)
router.get("/user/:id", verifyToken, checkKredoOwnership, getKredoDokumenByUser);

// Get dokumen by document ID (dengan cek ownership)
router.get("/:id", verifyToken, checkKredoOwnership, getKredoDokumenById);

// Routes untuk kepala unit/mitra bestari (bisa lihat semua)
router.get(
  "/",
  verifyToken,
  authorizeKredoRoles("kepala unit", "mitra bestari", "admin"),
  getAllKredoDokumen
);

export default router;