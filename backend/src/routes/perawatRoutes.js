import { Router } from "express";
import { verifyToken , authorizeRoles } from "../middlewares/authMiddleware.js";
import { authorizePenilai } from "../middlewares/penilaianpresentasiMiddleware.js"; // Tambahkan ini
import { getProfile, getAllPerawat, getOnlyPerawat, updatePerawat } from "../controllers/perawatController.js";


const router = Router();

// semua route butuh token
router.use(verifyToken);

// endpoint untuk cek profile perawat
router.get("/profile", getProfile);

// endpoint daftar semua perawat - hanya untuk penilai
router.get("/list", authorizePenilai, getAllPerawat);

// endpoint daftar perawat - hanya untuk penilai
router.get("/only", authorizePenilai, getOnlyPerawat);

// edit areaKlinis, unit, jenjangKarir (role-check nanti via middleware terpisah)
router.patch("/:id", updatePerawat);

router.patch("/:id", verifyToken, authorizeRoles("kepala_unit"), updatePerawat);

export default router;