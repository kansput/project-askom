import express from "express";
import upload from "../middlewares/sertifikatUploadMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js"; // ✅ TAMBAHKAN INI
import {createSertifikat,getAllSertifikat,getSertifikatByUser,deleteSertifikat,} from "../controllers/sertifikatController.js";

const router = express.Router();

// GET semua sertifikat (admin/kepala unit)
router.get("/", getAllSertifikat);

// GET sertifikat berdasarkan userId
router.get("/user/:id", getSertifikatByUser);

// POST upload sertifikat (single file)
// ✅ SOLUSI: Tambahkan verifyToken
router.post("/", verifyToken, upload.single("file"), createSertifikat);

// DELETE sertifikat
router.delete("/:id", deleteSertifikat);

export default router;
