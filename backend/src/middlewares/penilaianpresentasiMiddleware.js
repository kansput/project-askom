import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Cek user dan token di database (untuk single session)
    const user = await User.findOne({
      where: { npk: decoded.npk || decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Cek jika token sama dengan currentToken di database
    if (user.currentToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Token invalid or expired"
      });
    }

    req.user = {
      npk: user.npk,
      userId: user.npk,
      username: user.username,
      role: user.role,
      unit: user.unit
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// Middleware khusus untuk penilaian presentasi (hanya kepala unit dan mitra bestari)
export const authorizePenilai = (req, res, next) => {
  const allowedRoles = ["kepala unit", "mitra bestari"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Hanya kepala unit dan mitra bestari yang dapat mengakses penilaian presentasi"
    });
  }
  next();
};