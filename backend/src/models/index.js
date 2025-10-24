import User from "./userModel.js";
import Ujian from "./ujianModel.js";
import BatchSoal from "./batchSoalModel.js";
import Soal from "./soalModel.js";
import PesertaUjian from "./pesertaUjianModel.js";
import JawabanOpsi from "./jawabanOpsiModel.js";
import StrDocument from "./StrModel.js";
import Sertifikat from "./sertifikatModel.js";
import KredoDokumen from "./kredokumenModel.js";
import PenilaianKeterampilan from "./penilaianketerampilanModel.js"; // <--- Tambahkan import

// =======================
// Relasi User ↔ Ujian
// =======================
User.hasMany(Ujian, { as: "createdUjian", foreignKey: "createdBy" });
Ujian.belongsTo(User, { as: "creator", foreignKey: "createdBy" });

// =======================
// Relasi Ujian ↔ BatchSoal
// =======================
BatchSoal.hasMany(Ujian, { as: "ujians", foreignKey: "batchSoalId" });
Ujian.belongsTo(BatchSoal, { as: "batchSoal", foreignKey: "batchSoalId" });

// =======================
// Relasi BatchSoal ↔ Soal
// =======================
BatchSoal.hasMany(Soal, { as: "soals", foreignKey: "batchSoalId" });
Soal.belongsTo(BatchSoal, { as: "batchSoal", foreignKey: "batchSoalId" });

// =======================
// Relasi Soal ↔ JawabanOpsi
// =======================
Soal.hasMany(JawabanOpsi, { as: "jawabanOpsi", foreignKey: "soalId" });
JawabanOpsi.belongsTo(Soal, { as: "soal", foreignKey: "soalId" });

// =======================
// Relasi Ujian ↔ PesertaUjian ↔ User
// =======================
Ujian.hasMany(PesertaUjian, { as: "pesertaUjian", foreignKey: "ujianId" });
PesertaUjian.belongsTo(Ujian, { as: "ujian", foreignKey: "ujianId" });

PesertaUjian.belongsTo(User, { as: "pesertaUser", foreignKey: "userId" });
User.hasMany(PesertaUjian, { as: "pesertaUjian", foreignKey: "userId" });

// =======================
// Relasi PesertaUjian ↔ JawabanOpsi
// =======================
PesertaUjian.hasMany(JawabanOpsi, { as: "jawabanOpsi", foreignKey: "pesertaUjianId" });
JawabanOpsi.belongsTo(PesertaUjian, { as: "pesertaUjian", foreignKey: "pesertaUjianId" });

// =======================
// ✅ Relasi User ↔ StrDocument
// =======================
User.hasMany(StrDocument, {
  foreignKey: "userId",
  as: "StrDocuments",
  onDelete: "CASCADE",
});

StrDocument.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

// =======================
// ✅ Relasi User ↔ Sertifikat
// =======================
User.hasMany(Sertifikat, {
  foreignKey: "userId",
  as: "Sertifikats",
  onDelete: "CASCADE",
});

Sertifikat.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

// =======================
// ✅ Relasi User ↔ KredoDokumen
// =======================
User.hasMany(KredoDokumen, {
  foreignKey: "userId",
  as: "KredoDokumens",
  onDelete: "CASCADE",
});

KredoDokumen.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

// =======================
// ✅ Relasi User ↔ PenilaianKeterampilan (PERBAIKAN DI SINI)
// =======================

// Relasi dari User ke PenilaianKeterampilan (sebagai perawat)
User.hasMany(PenilaianKeterampilan, {
  foreignKey: 'perawat_npk',
  sourceKey: 'npk',
  as: 'penilaianKeterampilanSebagaiPerawat' // Ganti alias menjadi unik
});

// Relasi dari User ke PenilaianKeterampilan (sebagai penilai)
User.hasMany(PenilaianKeterampilan, {
  foreignKey: 'penilai_npk',
  sourceKey: 'npk',
  as: 'penilaianKeterampilanSebagaiPenilai' // Ganti alias menjadi unik
});

// Relasi dari PenilaianKeterampilan ke User (untuk perawat)
PenilaianKeterampilan.belongsTo(User, {
  foreignKey: 'perawat_npk',
  targetKey: 'npk',
  as: 'perawatKeterampilan' // Ganti alias menjadi unik
});

// Relasi dari PenilaianKeterampilan ke User (untuk penilai)
PenilaianKeterampilan.belongsTo(User, {
  foreignKey: 'penilai_npk',
  targetKey: 'npk',
  as: 'penilaiKeterampilan' // Ganti alias menjadi unik
});

// =======================
// EXPORT ALL MODELS
// =======================
export {
  User,
  Ujian,
  BatchSoal,
  Soal,
  PesertaUjian,
  JawabanOpsi,
  StrDocument,
  Sertifikat,
  KredoDokumen,
  PenilaianKeterampilan,
};