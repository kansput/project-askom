// src/controllers/perawatController.js
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

// Function 1: Get profile perawat yang sedang login
export const getProfile = async (req, res) => {
  try {
    if (req.user.role !== "perawat") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak, bukan role perawat"
      });
    }

    return res.json({
      success: true,
      message: "Profil perawat berhasil diambil",
      data: {
        npk: req.user.npk,
        username: req.user.username,
        role: req.user.role,
        unit: req.user.unit,
        areaKlinis: req.user.areaKlinis,
        jenjangKarir: req.user.jenjangKarir,
      },
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Function tambahan: Hapus perawat (khusus kepala unit)
// Function untuk hapus perawat
// Function untuk hapus perawat - DIPERBAIKI
export const deletePerawat = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔄 Attempting to delete perawat with ID: ${id}`);
    console.log(`👤 User role: ${req.user.role}`);

    // Hanya kepala unit boleh hapus data
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya kepala unit yang boleh menghapus data.",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Perawat tidak ditemukan.",
      });
    }

    console.log(` Found perawat to delete: ${user.username} (${user.npk})`);

    // Coba hapus dengan error handling yang lebih spesifik
    try {
      await user.destroy();

      console.log(`Successfully deleted perawat: ${user.username}`);

      return res.json({
        success: true,
        message: "Perawat berhasil dihapus.",
      });
    } catch (error) {
      console.error(" Database delete error:", error);

      // Handle foreign key constraint error
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          success: false,
          message: "Tidak dapat menghapus perawat karena data masih terkait dengan assessment atau jadwal lainnya. Silakan hubungi administrator.",
        });
      }

      // Handle other database errors
      throw error;
    }

  } catch (error) {
    console.error("💥 Error deletePerawat:", error);

    // Berikan error message yang lebih spesifik
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error.name === 'SequelizeDatabaseError') {
      errorMessage = "Terjadi kesalahan database. Silakan coba lagi.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Function 2: Ambil semua user (untuk admin/penilai)
export const getAllPerawat = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "npk", "username", "email", "unit", "areaKlinis", "jenjangKarir", "role", "tanggalLahir"],
      order: [["npk", "ASC"]],
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error getAllPerawat:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil semua data user",
    });
  }
};

// Update sebagian data perawat (khusus kepala_unit)
// Update sebagian data perawat (khusus kepala_unit)
export const updatePerawat = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaKlinis, unit, jenjangKarir, role } = req.body;

    // Hanya kepala unit boleh ubah data
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya kepala unit yang boleh mengubah data.",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Perawat tidak ditemukan.",
      });
    }

    // Validasi role jika dikirim
    if (role !== undefined) {
      const allowedRoles = ["perawat", "mitra bestari"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" });
      }
      user.role = role;
    }

    if (areaKlinis !== undefined) user.areaKlinis = areaKlinis;
    if (unit !== undefined) user.unit = unit;
    if (jenjangKarir !== undefined) user.jenjangKarir = jenjangKarir;

    await user.save();

    return res.json({
      success: true,
      message: "Data perawat berhasil diperbarui.",
      data: user,
    });
  } catch (error) {
    console.error("Error updatePerawat:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};


export const createPerawat = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya kepala unit yang boleh menambah perawat.",
      });
    }

    const { npk, username, email, password, role, unit, areaKlinis, jenjangKarir, tanggalLahir } = req.body;

    // Validasi
    if (!npk || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "NPK, Nama, dan Password wajib diisi.",
      });
    }

    // HASH PASSWORD SEBELUM DISIMPAN
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cek duplikat NPK
    const existing = await User.findOne({ where: { npk } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "NPK sudah terdaftar.",
      });
    }

    // Buat user baru dengan password yang di-hash
    const newUser = await User.create({
      npk,
      username,
      email: email || null,
      password: hashedPassword, // PAKAI PASSWORD YANG SUDAH DI-HASH
      role: role || "perawat",
      unit,
      areaKlinis,
      jenjangKarir,
      tanggalLahir: tanggalLahir || null,
    });

    return res.status(201).json({
      success: true,
      message: "Perawat baru berhasil ditambahkan.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error createPerawat:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};




// Function 3: Ambil hanya user dengan role "perawat"
export const getOnlyPerawat = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "perawat" },
      attributes: ["id", "npk", "username", "email", "unit", "areaKlinis", "jenjangKarir", "role", "tanggalLahir"],
      order: [["npk", "ASC"]],
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error getOnlyPerawat:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data perawat saja",
    });
  }
};