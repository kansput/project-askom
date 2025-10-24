import { Router } from "express";
import {
  createOrUpdatePenilaian,
  getPenilaian,
  finalizePenilaian,
  getPenilaianByPerawat,
  getAllPenilaian,
  deletePenilaian,
} from "../controllers/penilaianpresentasiController.js";
import {
  verifyToken,
  authorizePenilai,
} from "../middlewares/penilaianpresentasiMiddleware.js";

const router = Router();

// Semua routes membutuhkan authentication
router.use(verifyToken);

/**
 * =====================================================
 * ROUTES PENILAI (Kepala Unit & Mitra Bestari)
 * =====================================================
 */

// Buat atau update penilaian (CREATE/UPDATE)
router.post("/", authorizePenilai, createOrUpdatePenilaian);
router.put("/:id", authorizePenilai, createOrUpdatePenilaian);

// Klaim slot penguji 1 atau 2
// Gunakan query: ?slot=1 atau ?slot=2
// Contoh: PUT /api/penilaian/123/claim?slot=2
router.put("/:id/claim", authorizePenilai, (req, res, next) => {
  // Tambahkan flag query agar controller tahu ini klaim slot
  req.query.claim = "1";
  next();
}, createOrUpdatePenilaian);

// Finalisasi penilaian (setelah dua penguji selesai)
router.put("/:id/finalize", authorizePenilai, finalizePenilaian);

// Hapus penilaian
router.delete("/:id", authorizePenilai, deletePenilaian);

// Ambil 1 data penilaian berdasarkan perawat, tanggal, dan topik
router.get("/", authorizePenilai, getPenilaian);

// Ambil semua data penilaian (untuk admin / penilai overview)
router.get("/all", authorizePenilai, getAllPenilaian);

/**
 * =====================================================
 * ROUTES PERAWAT (melihat hasil penilaian sendiri)
 * =====================================================
 */
router.get("/perawat/:npk", getPenilaianByPerawat);

export default router;
