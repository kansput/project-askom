import BatchSoal from "../models/batchSoalModel.js";
import Soal from "../models/soalModel.js";

// ========== BUAT BATCH SOAL ==========
export const createBatchSoal = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa membuat batch soal" });
    }

    const { nama, deskripsi } = req.body;
    const batch = await BatchSoal.create({
      nama,
      deskripsi,
      createdBy: req.user.id,
    });

    res.json({ success: true, message: "Batch soal berhasil dibuat", data: batch });
  } catch (err) {
    console.error("❌ Error createBatchSoal:", err);
    res.status(500).json({ success: false, message: "Gagal membuat batch soal" });
  }
};

// ========== TAMBAH SOAL KE BATCH ==========
export const addSoalToBatch = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa menambah soal" });
    }

    const { id } = req.params; // batchSoalId
    let { pertanyaan, jawabanBenar, opsi } = req.body;

    if (typeof opsi === "string") {
      try {
        opsi = JSON.parse(opsi);
      } catch {
        return res.status(400).json({ success: false, message: "Format opsi tidak valid" });
      }
    }

    if (!pertanyaan || !jawabanBenar || !opsi || opsi.length < 2) {
      return res.status(400).json({ success: false, message: "Pertanyaan, jawabanBenar, dan minimal 2 opsi diperlukan" });
    }

    let gambarPath = null;
    if (req.file) {
      gambarPath = `/uploads/ujian/${req.file.filename}`;
    }

    const soal = await Soal.create({
      batchSoalId: id,
      pertanyaan,
      gambar: gambarPath,
      jawabanBenar,
      opsi, // ✅ simpan langsung array string
    });

    res.json({ success: true, message: "Soal berhasil ditambahkan ke batch", data: soal });
  } catch (err) {
    console.error("❌ Error addSoalToBatch:", err);
    res.status(500).json({ success: false, message: "Gagal menambah soal ke batch" });
  }
};

// ========== UPDATE SOAL ==========
export const updateSoalInBatch = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa update soal" });
    }

    const { batchId, soalId } = req.params;
    let { pertanyaan, jawabanBenar, opsi } = req.body;

    if (typeof opsi === "string") {
      try {
        opsi = JSON.parse(opsi);
      } catch {
        return res.status(400).json({ success: false, message: "Format opsi tidak valid" });
      }
    }

    const soal = await Soal.findOne({ where: { id: soalId, batchSoalId: batchId } });
    if (!soal) return res.status(404).json({ success: false, message: "Soal tidak ditemukan" });

    let gambarPath = soal.gambar;
    if (req.file) {
      gambarPath = `/uploads/ujian/${req.file.filename}`;
    }

    await soal.update({
      pertanyaan,
      jawabanBenar,
      opsi,
      gambar: gambarPath,
    });

    res.json({ success: true, message: "Soal berhasil diperbarui", data: soal });
  } catch (err) {
    console.error("❌ Error updateSoalInBatch:", err);
    res.status(500).json({ success: false, message: "Gagal update soal" });
  }
};

// ========== DELETE SOAL ==========
export const deleteSoalInBatch = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa hapus soal" });
    }

    const { batchId, soalId } = req.params;
    const soal = await Soal.findOne({ where: { id: soalId, batchSoalId: batchId } });
    if (!soal) return res.status(404).json({ success: false, message: "Soal tidak ditemukan" });

    await soal.destroy();

    res.json({ success: true, message: "Soal berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteSoalInBatch:", err);
    res.status(500).json({ success: false, message: "Gagal hapus soal" });
  }
};

// ========== LIST SOAL DI BATCH ==========
export const getSoalInBatch = async (req, res) => {
  try {
    const { id } = req.params; // batchSoalId
    const soal = await Soal.findAll({ where: { batchSoalId: id } });
    res.json({ success: true, data: soal });
  } catch (err) {
    console.error("❌ Error getSoalInBatch:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil soal di batch" });
  }
};

// ========== LIST SEMUA BATCH ==========
export const getAllBatchSoal = async (req, res) => {
  try {
    const batchList = await BatchSoal.findAll({
      include: [{ model: Soal, as: "soals" }],
    });
    res.json({ success: true, data: batchList });
  } catch (err) {
    console.error("❌ Error getAllBatchSoal:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil daftar batch soal" });
  }
};

// ========== GET BATCH BY ID ==========
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await BatchSoal.findByPk(id, {
      include: [{ model: Soal, as: "soals" }],
    });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch tidak ditemukan" });
    }
    res.json({ success: true, data: batch });
  } catch (err) {
    console.error("❌ Error getBatchById:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil detail batch" });
  }
};

// ========== UPDATE BATCH SOAL ==========
export const updateBatchSoal = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa update batch" });
    }
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    const batch = await BatchSoal.findByPk(id);
    if (!batch) return res.status(404).json({ success: false, message: "Batch tidak ditemukan" });

    batch.nama = nama || batch.nama;
    batch.deskripsi = deskripsi || batch.deskripsi;
    await batch.save();

    res.json({ success: true, message: "Batch soal berhasil diperbarui", data: batch });
  } catch (err) {
    console.error("❌ Error updateBatchSoal:", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui batch soal" });
  }
};

// ========== DELETE BATCH SOAL ==========
export const deleteBatchSoal = async (req, res) => {
  try {
    if (req.user.role !== "kepala unit") {
      return res.status(403).json({ success: false, message: "Hanya kepala unit yang bisa hapus batch" });
    }
    const { id } = req.params;
    const batch = await BatchSoal.findByPk(id);
    if (!batch) return res.status(404).json({ success: false, message: "Batch tidak ditemukan" });

    await Soal.destroy({ where: { batchSoalId: id } });
    await batch.destroy();

    res.json({ success: true, message: "Batch soal berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteBatchSoal:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus batch soal" });
  }
};
