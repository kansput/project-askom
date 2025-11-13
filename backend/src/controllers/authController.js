import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


export const register = async (req, res) => {
  try {
    const { npk, username, email, password, role } = req.body;

    if (!npk || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "NPK, password, dan role wajib diisi" });
    }

    const existingUser = await User.findOne({ where: { npk } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "NPK sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      npk,
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error saat register" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { npk, password } = req.body;

    if (!npk || !password) {
      return res
        .status(400)
        .json({ success: false, message: "NPK dan password wajib diisi" });
    }

    const user = await User.findOne({ where: { npk } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "NPK tidak ditemukan" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        npk: user.npk,
        role: user.role,
        unit: user.unit,            // 
        areaKlinis: user.areaKlinis // 
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    // 🚀 simpan token ke DB (single session)
    user.currentToken = token;
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        npk: user.npk,
        username: user.username,
        email: user.email,
        role: user.role,
        unit: user.unit,
        jenjangKarir: user.jenjangKarir,
        areaKlinis: user.areaKlinis,
        mustChangePassword: user.mustChangePassword,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error saat login" });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (user) {
      user.currentToken = null; // hapus sesi
      await user.save();
    }

    res.json({ success: true, message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error saat logout" });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Semua field wajib diisi" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Konfirmasi password tidak cocok" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const validOld = await bcrypt.compare(oldPassword, user.password);
    if (!validOld) {
      return res
        .status(401)
        .json({ success: false, message: "Password lama salah" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    user.currentToken = null; // paksa logout setelah ganti password
    await user.save();

    res.json({
      success: true,
      message: "Password berhasil diubah. Silakan login ulang.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error saat ubah password" });
  }
};

export const handleSSO = async (req, res) => {
  try {

    const { token: tokenFromAppA } = req.body; // token dari App A
    if (!tokenFromAppA) {
      return res.status(400).json({ error: 'Token dari App A diperlukan' });
    }

    // Decode token dari App A untuk dapat NPK
    const decoded = jwt.decode(tokenFromAppA); // ← PAKAI DECODE, BUKAN VERIFY
    const npk = decoded.id_pegawai;

    // Setelah decode token, tambahkan:
    const user = await User.findOne({ where: { npk } });
    if (!user) {
      return res.status(404).json({ error: 'NPK tidak ditemukan' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        npk: user.npk,
        role: user.role,
        unit: user.unit,
        areaKlinis: user.areaKlinis
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );


    user.currentToken = token;
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        npk: user.npk,
        username: user.username,
        email: user.email,
        role: user.role,
        unit: user.unit,
        jenjangKarir: user.jenjangKarir,
        areaKlinis: user.areaKlinis,
        mustChangePassword: user.mustChangePassword,
      },
    });

    // Lanjut ke generate JWT
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};