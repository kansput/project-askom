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
    console.error("❌ Error createUjian:", err);
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
    console.error("❌ Error startUjian:", err);
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
    console.error("❌ Error getAllUjian:", err);
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
    console.error("❌ Error deleteUjian:", err);
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
          include: [{ model: Soal, as: "soals" }],
        },
        {
          model: PesertaUjian,
          as: "pesertaUjian",
          include: [
            {
              model: User,
              as: "pesertaUser",
              attributes: ["id", "username", "email", "role"], // ✅ pakai username
            },
          ],
        },
      ],
    });

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
    console.error("❌ Error getUjianById:", err);
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
    console.error("❌ Error stopUjian:", err);
    res.status(500).json({ success: false, message: "Gagal menghentikan ujian" });
  }
};
// ========== SUBMIT UJIAN ==========
export const submitUjian = async (req, res) => {
  const transaction = await sequelize.transaction(); // ✅ Tambah transaction untuk atomicity
  try {
    const { id } = req.params; // ujianId
    const { jawaban, exitAttempts = 0, tabSwitchCount = 0 } = req.body; // Default 0 jika undefined
    const userId = req.user.id;

    // ✅ Cek jawaban gak boleh kosong
    if (!jawaban || Object.keys(jawaban).length === 0) {
      return res.status(400).json({ success: false, message: "Jawaban tidak boleh kosong" });
    }

    const ujian = await Ujian.findByPk(id, {
      include: [{ model: BatchSoal, as: "batchSoal", include: [{ model: Soal, as: "soals" }] }],
      transaction, // Pass transaction
    });
    if (!ujian) {
      return res.status(404).json({ success: false, message: "Ujian tidak ditemukan" });
    }

    if (ujian.status !== "active") {
      return res.status(400).json({ success: false, message: "Ujian tidak aktif" });
    }

    // Cek apakah user adalah peserta
    const peserta = await PesertaUjian.findOne({ where: { ujianId: id, userId }, transaction });
    if (!peserta) {
      return res.status(403).json({ success: false, message: "Anda bukan peserta ujian ini" });
    }

    // ✅ Prevent multiple submits
    if (peserta.completedAt) {
      return res.status(400).json({ success: false, message: "Ujian sudah disubmit sebelumnya" });
    }

    const now = new Date();
    if (now > ujian.waktuSelesai) {
      return res.status(400).json({ success: false, message: "Waktu ujian sudah habis" });
    }

    // Validasi jawaban: Pastikan soalId valid dari batch
    const soalIdsValid = ujian.batchSoal.soals.map(s => s.id.toString());
    const invalidSoal = Object.keys(jawaban).find(key => !soalIdsValid.includes(key));
    if (invalidSoal) {
      return res.status(400).json({ success: false, message: `Soal ID ${invalidSoal} tidak valid` });
    }

    // Simpan jawaban per soal (bulk create)
    const jawabanData = Object.entries(jawaban).map(([soalId, pilihan]) => {
      const soal = ujian.batchSoal.soals.find(s => s.id.toString() === soalId);
      return {
        pesertaUjianId: peserta.id,
        soalId: parseInt(soalId),
        jawabanPeserta: pilihan,
        isBenar: soal.jawabanBenar === pilihan, // Auto-grading (asumsi string match)
        waktuSelesai: now,
      };
    });

    await JawabanOpsi.bulkCreate(jawabanData, { ignoreDuplicates: true, transaction });

    // Update status peserta (asumsi field completedAt ada; simpan anti-cheat juga jika field tersedia)
    peserta.completedAt = now;
    peserta.exitAttempts = exitAttempts; // ✅ Simpan anti-cheat (tambah field di model jika belum)
    peserta.tabSwitchCount = tabSwitchCount;
    await peserta.save({ transaction });

    // Hitung skor total (perbaiki: total soal = semua soal, answered = yang dijawab)
    const totalSoal = ujian.batchSoal.soals.length;
    const answeredSoal = jawabanData.length;
    const skor = jawabanData.filter(j => j.isBenar).length;
    console.log(`User ${userId} submit ujian ${id}: Skor ${skor}/${totalSoal} (answered: ${answeredSoal}), Exit: ${exitAttempts}, Tab: ${tabSwitchCount}`);

    await transaction.commit(); // ✅ Commit jika sukses

    res.json({
      success: true,
      message: "Ujian berhasil disubmit",
      data: { skor, totalSoal, answeredSoal, exitAttempts, tabSwitchCount } // ✅ Tambah answeredSoal
    });
  } catch (err) {
    await transaction.rollback(); // ✅ Rollback jika error
    console.error("❌ Error submitUjian:", err);
    res.status(500).json({ success: false, message: "Gagal submit ujian" });
  }
};

