import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Soal = sequelize.define("Soal", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  batchSoalId: { type: DataTypes.INTEGER, allowNull: false, index: true },
  pertanyaan: { type: DataTypes.TEXT, allowNull: false }, // boleh HTML
  gambar: { type: DataTypes.STRING, allowNull: true },    // path file
  opsi: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValid(val) {
        if (!Array.isArray(val) || val.length < 2 || val.length > 5) {
          throw new Error("Opsi harus 2–5 item");
        }

        // PERBAIKAN: Gunakan variabel yang benar
        const kodes = val.map(o => o.kode);
        const texts = val.map(o => o.text);

        const validKode = kodes.every(k => ["A", "B", "C", "D", "E"].includes(k));
        const uniqueKode = new Set(kodes).size === kodes.length;
        const filledText = texts.every(t => typeof t === "string" && t.trim().length > 0);

        if (!validKode || !uniqueKode || !filledText) {
          throw new Error("Format opsi tidak valid");
        }
      }
    }
  },
  jawabanBenar: {
    type: DataTypes.ENUM("A", "B", "C", "D", "E"),
    allowNull: false
  }
}, {
  tableName: "Soal",
  timestamps: true
});

export default Soal;
