// models/jawabanOpsiModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const JawabanOpsi = sequelize.define("JawabanOpsi", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  pesertaUjianId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { 
      model: "PesertaUjian", 
      key: "id" 
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    validate: {
      notNull: { msg: "PesertaUjian ID wajib diisi" },
      isInt: { msg: "PesertaUjian ID harus berupa angka" }
    }
  },
  soalId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { 
      model: "Soal", 
      key: "id" 
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    validate: {
      notNull: { msg: "Soal ID wajib diisi" },
      isInt: { msg: "Soal ID harus berupa angka" }
    }
  },
  jawabanPeserta: { 
    type: DataTypes.STRING(10), 
    allowNull: false,
    validate: {
      notNull: { msg: "Jawaban peserta wajib diisi" },
      len: { args: [1, 10], msg: "Jawaban peserta terlalu panjang" },
      is: { args: /^[A-Ea-e]$/i, msg: "Jawaban peserta harus A-D" } 
    }
  },
  isBenar: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    validate: {
      isBoolean: { msg: "isBenar harus boolean" }
    }
  },
  waktuSelesai: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: "Waktu selesai harus berupa tanggal" }
    }
  }
}, {
  tableName: "JawabanOpsi",
  timestamps: true, // createdAt/updatedAt otomatis
  indexes: [
    { 
      unique: true, 
      fields: ["pesertaUjianId", "soalId"], 
      name: "unique_peserta_soal" // Cegah duplikat jawaban per peserta per soal
    }
  ]
});



export default JawabanOpsi;