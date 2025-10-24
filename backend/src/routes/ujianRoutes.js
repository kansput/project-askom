import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createUjian, startUjian, getAllUjian, deleteUjian, getUjianById, stopUjian, submitUjian } from "../controllers/ujianController.js";


const router = Router();

router.use(verifyToken);

// buat ujian draft (pilih batch soal)
router.post("/", createUjian);

// start ujian (ubah status draft -> active)
router.post("/:id/start", startUjian);

// dapatkan ujian
router.get("/", getAllUjian);
// delete draft ujian
router.delete("/:id", deleteUjian);

// dapatkan ujian by ID
router.get("/:id", getUjianById);

// stop ujian (ubah status active -> selesai)
router.post("/:id/stop", stopUjian);

//  submitUjian
router.post("/:id/submit", submitUjian);

export default router;
