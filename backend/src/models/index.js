import User from "./userModel.js";
import Ujian from "./ujianModel.js";
import BatchSoal from "./batchSoalModel.js";
import Soal from "./soalModel.js";
import PesertaUjian from "./pesertaUjianModel.js";
import JawabanOpsi from "./jawabanOpsiModel.js";
import StrDocument from "./StrModel.js";
import Sertifikat from "./sertifikatModel.js";
import KredoDokumen from "./kredokumenModel.js";
import PenilaianKeterampilan from "./penilaianketerampilanModel.js";

/* ============================================================
   USER ↔ UJIAN
   ============================================================ */
User.hasMany(Ujian, { as: "createdUjian", foreignKey: "createdBy" });
Ujian.belongsTo(User, { as: "creator", foreignKey: "createdBy" });

/* ============================================================
    UJIAN ↔ BATCH SOAL ↔ SOAL
   ============================================================ */
BatchSoal.hasMany(Ujian, { as: "ujians", foreignKey: "batchSoalId" });
Ujian.belongsTo(BatchSoal, { as: "batchSoal", foreignKey: "batchSoalId" });

BatchSoal.hasMany(Soal, { as: "soals", foreignKey: "batchSoalId" });
Soal.belongsTo(BatchSoal, { as: "batchSoal", foreignKey: "batchSoalId" });

/* ============================================================
    SOAL ↔ JAWABAN OPSI
   ============================================================ */
Soal.hasMany(JawabanOpsi, { as: "jawabanOpsi", foreignKey: "soalId" });
JawabanOpsi.belongsTo(Soal, { as: "soal", foreignKey: "soalId" });

/* ============================================================
    UJIAN ↔ PESERTA UJIAN ↔ USER
   ============================================================ */
// Relasi utama hasil ujian
Ujian.hasMany(PesertaUjian, { as: "pesertaUjian", foreignKey: "ujianId" });
PesertaUjian.belongsTo(Ujian, { as: "ujian", foreignKey: "ujianId" });

// Setiap peserta ujian terhubung dengan user (perawat)
User.hasMany(PesertaUjian, { as: "pesertaUjianUser", foreignKey: "userId" });
PesertaUjian.belongsTo(User, { as: "pesertaUser", foreignKey: "userId" });

/* ============================================================
    PESERTA UJIAN ↔ JAWABAN OPSI
   ============================================================ */
PesertaUjian.hasMany(JawabanOpsi, { as: "jawabanOpsiPeserta", foreignKey: "pesertaUjianId" });
JawabanOpsi.belongsTo(PesertaUjian, { as: "pesertaUjian", foreignKey: "pesertaUjianId" });

/* ============================================================
    USER ↔ STR, SERTIFIKAT, KREDO
   ============================================================ */
User.hasMany(StrDocument, { foreignKey: "userId", as: "StrDocuments", onDelete: "CASCADE" });
StrDocument.belongsTo(User, { foreignKey: "userId", as: "User" });

User.hasMany(Sertifikat, { foreignKey: "userId", as: "Sertifikats", onDelete: "CASCADE" });
Sertifikat.belongsTo(User, { foreignKey: "userId", as: "User" });

User.hasMany(KredoDokumen, { foreignKey: "userId", as: "KredoDokumens", onDelete: "CASCADE" });
KredoDokumen.belongsTo(User, { foreignKey: "userId", as: "User" });

/* ============================================================
    USER ↔ PENILAIAN KETERAMPILAN
   ============================================================ */
User.hasMany(PenilaianKeterampilan, {
  foreignKey: "perawat_npk",
  sourceKey: "npk",
  as: "penilaianKeterampilanSebagaiPerawat",
});

User.hasMany(PenilaianKeterampilan, {
  foreignKey: "penilai_npk",
  sourceKey: "npk",
  as: "penilaianKeterampilanSebagaiPenilai",
});

PenilaianKeterampilan.belongsTo(User, {
  foreignKey: "perawat_npk",
  targetKey: "npk",
  as: "perawatKeterampilan",
});

PenilaianKeterampilan.belongsTo(User, {
  foreignKey: "penilai_npk",
  targetKey: "npk",
  as: "penilaiKeterampilan",
});

/* ============================================================
   EXPORT SEMUA MODEL
   ============================================================ */
export { User, Ujian, BatchSoal, Soal, PesertaUjian, JawabanOpsi, StrDocument, Sertifikat, KredoDokumen, PenilaianKeterampilan, };