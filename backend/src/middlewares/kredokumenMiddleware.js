import KredoDokumen from "../models/kredokumenModel.js";

//  Middleware untuk cek ownership dokumen kredokumen
export const checkKredoOwnership = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    // Cari dokumen
    const document = await KredoDokumen.findByPk(documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: " Dokumen tidak ditemukan" 
      });
    }

    // Kepala unit & mitra bestari bisa akses semua dokumen
    if (req.user.role === "kepala unit" || req.user.role === "mitra bestari") {
      return next();
    }

    // Perawat hanya bisa akses dokumen sendiri
    if (document.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: " Anda tidak memiliki akses ke dokumen ini" 
      });
    }

    next();
  } catch (error) {
    console.error(" Error in checkKredoOwnership:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server" 
    });
  }
};

//  Middleware untuk authorize roles khusus kredokumen
export const authorizeKredoRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: " User tidak terautentikasi" 
      });
    }

    console.log("🔍 User role:", req.user.role);
    console.log("🔍 Allowed roles:", allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: ` Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk mengakses kredokumen.` 
      });
    }

    next();
  };
};

//  Middleware untuk validasi input upload - PERBAIKI DENGAN DEBUG
export const validateKredoUpload = (req, res, next) => {
  console.log("🔍 Validating upload data...");
  console.log("📝 Request body:", req.body);
  console.log("📁 Request files:", req.files);
  
  const { tanggal } = req.body;

  if (!tanggal) {
    console.log(" Validation failed: tanggal is missing");
    return res.status(400).json({
      success: false,
      message: "Tanggal harus diisi"
    });
  }

  // Validasi format tanggal (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) {
    console.log(" Validation failed: invalid date format");
    return res.status(400).json({
      success: false,
      message: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD"
    });
  }

  console.log(" Validation passed");
  next();
};