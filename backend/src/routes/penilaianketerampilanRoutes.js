import { Router } from "express";
import {
  createOrUpdatePenilaian,
  getPenilaian,
  finalizePenilaian,
  getPenilaianByPerawat,
  getAllPenilaian,
  deletePenilaian
} from "../controllers/penilaianketerampilanController.js";
import { verifyToken, authorizePenilai } from "../middlewares/penilaianketerampilanMiddleware.js";

const router = Router();

// Semua routes membutuhkan authentication
router.use(verifyToken);

// Routes untuk penilaian keterampilan - hanya penilai
router.post("/", authorizePenilai, createOrUpdatePenilaian);
router.get("/", authorizePenilai, getPenilaian);
router.get("/all", authorizePenilai, getAllPenilaian);
router.put("/:id", authorizePenilai, createOrUpdatePenilaian);
router.put("/:id/finalize", authorizePenilai, finalizePenilaian);
router.delete("/:id", authorizePenilai, deletePenilaian);

// Route untuk perawat melihat penilaian mereka sendiri
router.get("/perawat/:npk", getPenilaianByPerawat);

export default router;