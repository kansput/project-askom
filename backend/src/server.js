import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import fs from "fs";
import sequelize from "./config/db.js";
import "./models/index.js";

import User from "./models/userModel.js";
import StrDocument from "./models/StrModel.js";
import Sertifikat from "./models/sertifikatModel.js";
import KredoDokumen from "./models/kredokumenModel.js";

import authRoutes from "./routes/authRoutes.js";
import perawatRoutes from "./routes/perawatRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import batchSoalRoutes from "./routes/batchSoalRoutes.js";
import ujianRoutes from "./routes/ujianRoutes.js";
import strRoutes from "./routes/strRoutes.js";
import sertifikatRoutes from "./routes/sertifikatRoutes.js";
import kredokumenRoutes from "./routes/kredokumenRoutes.js";
import penilaianPresentasiRoutes from "./routes/penilaianpresentasiRoutes.js";
import penilaianKeterampilanRoutes from "./routes/penilaianketerampilanRoutes.js";


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// MIDDLEWARE CONFIGURATION
// ===================================

// CORS Configuration
app.use(
  cors({
    origin: [
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}`,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
app.use(morgan("dev"));

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ===================================
// SERVE STATIC FILES (FIXED: FROM ROOT PROJECT)
// ===================================

// Naik 1 level dari /src ke root project
const uploadsPath = path.join(process.cwd(), "src", "uploads");
console.log("Serving static files from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

const kredokumenPath = path.join(uploadsPath, "kredokumen");
app.use("/kredokumen", express.static(kredokumenPath));

// Buat folder uploads jika belum ada
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Created uploads directory:", uploadsPath);
}

// Buat subfolder ujian
const ujianDir = path.join(uploadsPath, "ujian");
if (!fs.existsSync(ujianDir)) {
  fs.mkdirSync(ujianDir, { recursive: true });
  console.log("Created ujian directory:", ujianDir);
}

// Buat subfolder kredokumen (jika digunakan)
const kredokumenDir = path.join(uploadsPath, "kredokumen");
if (!fs.existsSync(kredokumenDir)) {
  fs.mkdirSync(kredokumenDir, { recursive: true });
  console.log("Created kredokumen directory:", kredokumenDir);
}

// ===================================
// API ROUTES
// ===================================
app.use("/api/auth", authRoutes);
app.use("/api/perawat", perawatRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/batchsoal", batchSoalRoutes);
app.use("/api/ujian", ujianRoutes);
app.use("/api/str", strRoutes);
app.use("/api/sertifikat", sertifikatRoutes);
app.use("/api/kredokumen", kredokumenRoutes);
app.use("/api/penilaian", penilaianPresentasiRoutes);
app.use("/api/penilaian-keterampilan", penilaianKeterampilanRoutes);


// ===================================
// HEALTH CHECK & TEST ENDPOINTS
// ===================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Server is running",
    timestamp: new Date().toISOString(),
    uploadsPath: uploadsPath,
  });
});

app.get("/test-uploads", (req, res) => {
  const testPath = path.join(uploadsPath, "ujian");
  const exists = fs.existsSync(testPath);

  res.json({
    success: true,
    uploadsBase: uploadsPath,
    ujianPath: testPath,
    ujianExists: exists,
    cwd: process.cwd(),
  });
});

// ===================================
// 404 & ERROR HANDLER
// ===================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/api/auth",
      "/api/perawat",
      "/api/kredokumen",
      "/api/str",
      "/api/sertifikat",
      "/api/batchsoal",
      "/api/ujian",
    ],
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ===================================
// DATABASE & SERVER START
// ===================================

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.sync({ alter: true });
    console.log("Database models synced successfully");

    console.log("Registered Models:", Object.keys(sequelize.models));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Uploads path: ${uploadsPath}`);
      console.log(`JWT Secret: ${process.env.JWT_SECRET ? "Set" : "Not Set"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing server...");
  await sequelize.close();
  process.exit(0);
});

startServer();