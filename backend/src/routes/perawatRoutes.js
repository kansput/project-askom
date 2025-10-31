import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { authorizePenilai } from "../middlewares/penilaianpresentasiMiddleware.js";
import { 
  getProfile, 
  getAllPerawat, 
  getOnlyPerawat, 
  updatePerawat, 
  createPerawat, 
  deletePerawat 
} from "../controllers/perawatController.js";

const router = Router();

// semua route butuh token
router.use(verifyToken);

// endpoint untuk cek profile perawat
router.get("/profile", getProfile);

// endpoint daftar semua perawat - hanya untuk penilai
router.get("/list", authorizePenilai, getAllPerawat);

// endpoint daftar perawat - hanya untuk penilai
router.get("/only", authorizePenilai, getOnlyPerawat);

// HAPUS duplikasi route dan gunakan middleware yang benar
router.patch("/:id", authorizeRoles("kepala unit"), updatePerawat);

router.post("/", authorizeRoles("kepala unit"), createPerawat);

router.delete("/:id", authorizeRoles("kepala unit"), deletePerawat);

export default router;