import express from "express";
import upload from "../middlewares/sertifikatUploadMiddleware.js";
import {
  createSertifikat,
  getAllSertifikat,
  getSertifikatByUser,
  deleteSertifikat,
} from "../controllers/sertifikatController.js";

const router = express.Router();

// GET semua sertifikat (admin/kepala unit)
router.get("/", getAllSertifikat);

// GET sertifikat berdasarkan userId
router.get("/user/:id", getSertifikatByUser);

// POST upload sertifikat (single file)
router.post("/", upload.single("file"), createSertifikat);

// DELETE sertifikat
router.delete("/:id", deleteSertifikat);

export default router;
