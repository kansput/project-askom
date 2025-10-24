import { Router } from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = Router();

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

// Ambil semua file
router.get("/", getFiles);

// Download file by ID
router.get("/download/:id", downloadFile);

// Hapus file by ID
router.delete("/:id", deleteFile);

export default router;
