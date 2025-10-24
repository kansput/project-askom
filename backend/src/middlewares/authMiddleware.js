import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ✅ Middleware untuk verifikasi token JWT + cek single session
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // format: Bearer <token>

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "❌ Token tidak ditemukan. Silakan login terlebih dahulu." 
    });
  }

  try {
    // Verify token dan extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🚀 Ambil user dari DB
    const user = await User.findByPk(decoded.id);

    // ❌ Kalau user tidak ada atau token tidak cocok
    if (!user || user.currentToken !== token) {
      return res.status(403).json({ 
        success: false, 
        message: "❌ Sesi tidak valid atau sudah dipakai di perangkat lain." 
      });
    }

    // ✅ Simpan data user ke req.user
    req.user = {
      id: user.id,
      npk: user.npk,
      username: user.username,
      email: user.email,
      role: user.role,
      unit: user.unit,
      jenjangKarir: user.jenjangKarir,
      areaKlinis: user.areaKlinis,
    };
    
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ 
        success: false, 
        message: "❌ Token telah kadaluarsa. Silakan login kembali." 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: "❌ Token tidak valid atau rusak." 
    });
  }
};

// ✅ Middleware untuk validasi role (opsional, jika butuh role-based access)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "❌ User tidak terautentikasi" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `❌ Akses ditolak. Role '${req.user.role}' tidak memiliki izin.` 
      });
    }

    next();
  };
};

// ✅ Middleware untuk cek ownership dokumen (opsional)
export const checkDocumentOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const documentUserId = req.body.userId || req.params.userId;

    // Admin atau kepala unit bisa akses semua
    if (req.user.role === "admin" || req.user.role === "kepala unit") {
      return next();
    }

    // Perawat hanya bisa akses dokumen sendiri
    if (userId !== parseInt(documentUserId)) {
      return res.status(403).json({ 
        success: false, 
        message: "❌ Anda tidak memiliki akses ke dokumen ini" 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
  