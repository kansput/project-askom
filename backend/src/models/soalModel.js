// models/soalModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Soal = sequelize.define("Soal", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },

  batchSoalId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },

  pertanyaan: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  gambar: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },

  // ✅ simpan opsi pilihan sebagai JSON array
  opsi: { 
    type: DataTypes.JSON, 
    allowNull: false, 
    defaultValue: []   // supaya gak error waktu sync
  },

  // simpan kode jawaban benar (misal "A", "B", "C", "D")
  jawabanBenar: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
}, {
  tableName: "Soal",
  timestamps: true,
});

export default Soal;
