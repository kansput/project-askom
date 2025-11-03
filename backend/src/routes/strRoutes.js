import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { strUpload } from "../middlewares/strUploadMiddleware.js";
import {
  createStrDocument,
  getAllStrDocuments,
  getStrDocumentsByUser,
  getStrDocumentById,
  updateStrDocument,
  deleteStrDocument,
} from "../controllers/strController.js";

const router = express.Router();

// Hanya perawat (user sendiri) bisa upload
// Hanya perawat (user sendiri) bisa upload
router.post(
  "/create",
  verifyToken,
  strUpload.fields([
    { name: "fileIjazah", maxCount: 1 },
    { name: "fileSTR", maxCount: 1 },
    { name: "fileSIP", maxCount: 1 },
    { name: "fileRKK", maxCount: 1 },
  ]),
  createStrDocument
);


// Semua dokumen (kepala unit/admin)
router.get("/all", verifyToken, authorizeRoles("kepala unit", "admin"), getAllStrDocuments);

// Dokumen per user
router.get("/user/:id", verifyToken, getStrDocumentsByUser);

// Detail dokumen per id
router.get("/doc/:id", verifyToken, getStrDocumentById);

// Update dokumen
router.put("/:id", verifyToken, updateStrDocument);

// Hapus dokumen
router.delete("/:id", verifyToken, deleteStrDocument);

export default router;
