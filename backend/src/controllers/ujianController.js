import sequelize from "../config/db.js";
import Ujian from "../models/ujianModel.js";
import PesertaUjian from "../models/pesertaUjianModel.js";
import User from "../models/userModel.js";
import BatchSoal from "../models/batchSoalModel.js";
import Soal from "../models/soalModel.js";
import JawabanOpsi from "../models/jawabanOpsiModel.js";

// ========== CREATE UJIAN ==========
export const createUjian = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa membuat ujian" });
    }

    const { judul, deskripsi, waktuMulai, waktuSelesai, batchSoalId, pesertaIds } = req.body;

    const batch = await BatchSoal.findByPk(batchSoalId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch soal tidak ditemukan" });
    }

    const ujian = await Ujian.create({
      judul,
      deskripsi,
      waktuMulai,
      waktuSelesai,
      batchSoalId,
      createdBy: req.user.id,
    });

    if (pesertaIds && pesertaIds.length > 0) {
      const pesertaData = pesertaIds.map((id) => ({
        ujianId: ujian.id,
        userId: id,
      }));
      await PesertaUjian.bulkCreate(pesertaData);
    }

    res.json({ success: true, data: ujian, message: "Ujian berhasil dibuat" });
  } catch (err) {
    console.error(" Error createUjian:", err);
    res.status(500).json({ success: false, message: "Gagal membuat ujian" });
  }
};

// ========== START UJIAN ==========
export const startUjian = async (req, res) => {
  try {
    const { id } = req.params;
    const ujian = await Ujian.findByPk(id);

    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    if (ujian.status !== "draft") {
      return res.status(400).json({ success: false, message: "Ujian sudah dimulai atau sudah selesai" });
    }

    const now = new Date();

    // 🚫 Hilangkan validasi "now < waktuMulai"
    if (now > ujian.waktuSelesai) {
      return res.status(400).json({ success: false, message: "Ujian sudah lewat waktu" });
    }

    ujian.status = "active";
    await ujian.save();

    res.json({ success: true, message: "Ujian dimulai", data: ujian });
  } catch (err) {
    console.error(" Error startUjian:", err);
    res.status(500).json({ success: false, message: "Gagal memulai ujian" });
  }
};



// ========== GET ALL UJIAN ==========
export const getAllUjian = async (req, res) => {
  try {
    const ujianList = await Ujian.findAll({ order: [["createdAt", "DESC"]] });
    const now = new Date();

    // update otomatis jika ada yang sudah habis
    for (const ujian of ujianList) {
      if (ujian.status === "active" && now > ujian.waktuSelesai) {
        ujian.status = "closed";
        await ujian.save();
      }
    }

    res.json({ success: true, data: ujianList });
  } catch (err) {
    console.error(" Error getAllUjian:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil daftar ujian" });
  }
};


// ========== DELETE UJIAN ==========
export const deleteUjian = async (req, res) => {
  try {
    const { id } = req.params;
    const ujian = await Ujian.findByPk(id);

    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    if (ujian.status !== "draft") {
      return res.status(400).json({ success: false, message: "Hanya draft yang bisa dihapus" });
    }

    await ujian.destroy();
    res.json({ success: true, message: "Draft ujian berhasil dihapus" });
  } catch (err) {
    console.error(" Error deleteUjian:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus ujian" });
  }
};

// ========== GET UJIAN BY ID ==========
export const getUjianById = async (req, res) => {
  try {
    const { id } = req.params;
    const ujian = await Ujian.findByPk(id, {
      include: [
        {
          model: BatchSoal,
          as: "batchSoal",
          include: [
            { model: Soal, as: "soals" }
          ],
        },
        {
          model: PesertaUjian,
          as: "pesertaUjian",
          include: [
            {
              model: User,
              as: "pesertaUser",
              attributes: ["id", "username", "email", "role"],
            },
          ],
        },
      ],
    });

    // 
    if (req.user.role === "perawat" && ujian.batchSoal?.soals) {
      ujian.batchSoal.soals = ujian.batchSoal.soals.sort(() => Math.random() - 0.5);
    }


    if (!ujian) {
      return res
        .status(404)
        .json({ success: false, message: "Ujian tidak ditemukan" });
    }

    // auto close kalau sudah lewat waktu selesai
    const now = new Date();
    if (ujian.status === "active" && now > ujian.waktuSelesai) {
      ujian.status = "closed";
      await ujian.save();
    }

    res.json({ success: true, data: ujian });
  } catch (err) {
    console.error(" Error getUjianById:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil detail ujian" });
  }
};
// ========== STOP UJIAN ==========
export const stopUjian = async (req, res) => {
  try {
    const { id } = req.params;
    const ujian = await Ujian.findByPk(id);

    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    if (ujian.status !== "active") {
      return res.status(400).json({ success: false, message: "Ujian belum aktif atau sudah ditutup" });
    }

    ujian.status = "closed";
    await ujian.save();

    res.json({ success: true, message: "Ujian berhasil dihentikan", data: ujian });
  } catch (err) {
    console.error(" Error stopUjian:", err);
    res.status(500).json({ success: false, message: "Gagal menghentikan ujian" });
  }
};
// ========== START UJIAN PESERTA (PERAWAT) ==========
export const startUjianPeserta = async (req, res) => {
  try {
    const { id } = req.params; // ujianId
    const userId = req.user.id;

    console.log("\n====== DEBUG startUjianPeserta ======");
    console.log("ujianId:", id);
    console.log("userId:", userId);

    // 🔍 Cek ujian
    const ujian = await Ujian.findByPk(id);
    if (!ujian) {
      console.log(" Tidak ada ujian dengan id:", id);
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    console.log("Ujian status:", ujian.status);
    console.log("Ujian waktuMulai:", ujian.waktuMulai);
    console.log("Ujian waktuSelesai:", ujian.waktuSelesai);

    if (ujian.status !== "active") {
      console.log(" Status bukan active, nilai:", ujian.status);
      return res.status(400).json({ success: false, message: "Ujian belum dimulai atau sudah ditutup" });
    }

    const now = new Date();
    console.log("Sekarang:", now);
    if (now > ujian.waktuSelesai) {
      console.log(" Waktu sekarang > waktuSelesai");
      return res.status(400).json({ success: false, message: "Ujian sudah berakhir" });
    }

    // 🔍 Cek peserta ujian
    let peserta = await PesertaUjian.findOne({ where: { ujianId: id, userId } });
    console.log("Peserta ditemukan?", !!peserta);

    // 🧩 Kalau belum ada, buat otomatis
    if (!peserta) {
      console.log(" Membuat peserta baru...");
      peserta = await PesertaUjian.create({
        ujianId: id,
        userId,
        status: "sedang ujian",
        startedAt: now,
        exitAttempts: 0,
        tabSwitchCount: 0,
      });
    } else if (!peserta.startedAt) {
      console.log(" Peserta sudah ada tapi belum mulai, update waktu mulai...");
      peserta.startedAt = now;
      peserta.status = "sedang ujian";
      await peserta.save();
    } else {
      console.log(" Peserta sudah mulai sebelumnya");
    }

    console.log(" PesertaUjian record:", peserta.dataValues);

    //  Kirim respons sukses
    return res.json({
      success: true,
      message: "Ujian peserta dimulai",
      data: {
        startedAt: peserta.startedAt,
        waktuSelesai: ujian.waktuSelesai,
        durasi: ujian.durasi,
      },
    });

  } catch (err) {
    console.error(" Error startUjianPeserta:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memulai ujian peserta",
      error: err.message,
    });
  }
};


// ========== SUBMIT UJIAN ==========
export const submitUjian = async (req, res) => {
  try {
    const { id } = req.params; // ujianId
    const userId = req.user.id;
    const { jawaban, exitAttempts, tabSwitchCount } = req.body;

    // 🔍 Cari peserta ujian
    const peserta = await PesertaUjian.findOne({ where: { ujianId: id, userId } });
    if (!peserta) {
      return res.status(403).json({ success: false, message: "Anda bukan peserta ujian ini" });
    }

    if (peserta.status === "selesai") {
      return res.status(400).json({ success: false, message: "Ujian sudah disubmit sebelumnya" });
    }

    // 🔍 Ambil soal dari batch ujian
    const ujian = await Ujian.findByPk(id, {
      include: [{ association: "batchSoal", include: ["soals"] }],
    });
    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    const soals = ujian.batchSoal?.soals || [];
    let totalBenar = 0;

    // 🔢 Cek jawaban benar
    for (const soal of soals) {
      const jawabanPeserta = jawaban[soal.id];
      if (jawabanPeserta && jawabanPeserta === soal.jawabanBenar) {
        totalBenar++;
      }
    }

    const skor = (totalBenar / soals.length) * 100;

    // 🧩 Update data peserta ujian
    peserta.skor = skor;
    peserta.exitAttempts = exitAttempts || 0;
    peserta.tabSwitchCount = tabSwitchCount || 0;
    peserta.completedAt = new Date();
    peserta.status = "selesai";

    await peserta.save(); //  Simpan update-nya ke DB

    return res.json({
      success: true,
      message: "Ujian berhasil disubmit",
      data: {
        skor,
        totalBenar,
        totalSoal: soals.length,
      },
    });
  } catch (err) {
    console.error(" Error submitUjian:", err);
    res.status(500).json({ success: false, message: "Gagal submit ujian", error: err.message });
  }
};


// ========== GET HASIL UJIAN ==========
export const getHasilUjian = async (req, res) => {
  try {
    console.log("🔍 DEBUG getHasilUjian dipanggil");
    console.log("Ujian ID:", req.params.id);
    console.log("User:", req.user);
    const { id } = req.params;
    const user = req.user;

    const ujian = await Ujian.findByPk(id, {
      include: [
        {
          model: PesertaUjian,
          as: "pesertaUjian",
          include: [
            {
              model: User,
              as: "pesertaUser", //  INI YANG BENAR
              attributes: ["id", "username", "unit"],
            },
          ],
        },
      ],
    });

    console.log("DEBUG ujian:", JSON.stringify(ujian?.pesertaUjian, null, 2));

    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    // 💡 Kepala unit lihat semua hasil
    if (user.role === "kepala unit") {
      const hasil = ujian.pesertaUjian.map((p) => ({
        nama: p.pesertaUser?.username || "Tidak diketahui", //  BENAR
        unit: p.pesertaUser?.unit || "-", //  BENAR
        skor: p.skor ?? 0,
        exitAttempts: p.exitAttempts ?? 0,
        tabSwitchCount: p.tabSwitchCount ?? 0,
        status: p.status === "selesai" ? "Selesai" : "Dalam Proses",
      }));

      return res.json({
        success: true, //  HARUS true
        data: hasil,
      });
    }

    // 💡 Perawat lihat hasil miliknya sendiri
    const peserta = ujian.pesertaUjian.find(p => p.userId === user.id);
    if (!peserta) {
      return res.status(403).json({ success: false, message: "Anda tidak mengikuti ujian ini" });
    }

    return res.json({
      success: true,
      data: [{
        nama: peserta.pesertaUser.username,
        unit: peserta.pesertaUser.unit,
        skor: peserta.skor,
        exitAttempts: peserta.exitAttempts,
        tabSwitchCount: peserta.tabSwitchCount,
        status: peserta.status === "selesai" ? "Selesai" : "Dalam Proses",
      }],
    });
  } catch (err) {
    console.error(" Error getHasilUjian:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil hasil ujian",
      error: err.message,
    });
  }
};



