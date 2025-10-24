import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import uploadUjian from "../middlewares/uploadUjianMiddleware.js";
import {
  createBatchSoal,
  addSoalToBatch,
  updateSoalInBatch,
  deleteSoalInBatch,
  getSoalInBatch,
  getAllBatchSoal,
  getBatchById,
  updateBatchSoal,
  deleteBatchSoal,
} from "../controllers/batchSoalController.js";

const router = Router();

router.use(verifyToken);

// buat batch baru
router.post("/", createBatchSoal);

// tambah soal baru ke batch
router.post("/:id/soal", uploadUjian.single("gambar"), addSoalToBatch);

// update soal tertentu
router.put("/:batchId/soal/:soalId", uploadUjian.single("gambar"), updateSoalInBatch);

// hapus soal tertentu
router.delete("/:batchId/soal/:soalId", deleteSoalInBatch);

// ambil semua soal dari batch
router.get("/:id/soal", getSoalInBatch);

// ambil semua batch
router.get("/", getAllBatchSoal);

// ambil detail batch tertentu
router.get("/:id", getBatchById);

// update batch
router.put("/:id", updateBatchSoal);

// hapus batch
router.delete("/:id", deleteBatchSoal);

export default router;
