import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
   createUjian,
   startUjian,
   stopUjian,
   getAllUjian,
   getUjianById,
   deleteUjian,
   submitUjian,
   startUjianPeserta,
   getHasilUjian,
} from "../controllers/ujianController.js";

const router = Router();

/* ================================================================
   🧩 ROUTE HASIL UJIAN — TARUH PALING ATAS!!!
   ================================================================ */
router.get("/:id/hasil", verifyToken, getHasilUjian);

/* ================================================================
   📘 DETAIL UJIAN
   ================================================================ */
router.get("/:id", verifyToken, getUjianById);

/* ================================================================
   📘 KEPALA UNIT
   ================================================================ */
router.post("/", verifyToken, createUjian);
router.post("/:id/start-global", verifyToken, startUjian);
router.post("/:id/stop", verifyToken, stopUjian);
router.delete("/:id", verifyToken, deleteUjian);
router.get("/", verifyToken, getAllUjian);

/* ================================================================
   🧑‍⚕️ PERAWAT
   ================================================================ */
router.post("/:id/start", verifyToken, startUjianPeserta);
router.post("/:id/submit", verifyToken, submitUjian);

export default router;