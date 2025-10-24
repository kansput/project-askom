// src/controllers/perawatController.js
import User from "../models/userModel.js";

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

// Function 2: Ambil semua user (untuk admin/penilai)
export const getAllPerawat = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id","npk", "username", "email", "unit", "areaKlinis", "jenjangKarir", "role", "tanggalLahir"],
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
export const updatePerawat = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaKlinis, unit, jenjangKarir } = req.body;

    // Cek role
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya kepala unit yang boleh mengubah data.",
      });
    }

    // Temukan user target
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Perawat tidak ditemukan.",
      });
    }

    // Update hanya field yang dikirim
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


// Function 3: Ambil hanya user dengan role "perawat"
export const getOnlyPerawat = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "perawat" },
      attributes: ["id","npk", "username", "email", "unit", "areaKlinis", "jenjangKarir", "role", "tanggalLahir"],
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