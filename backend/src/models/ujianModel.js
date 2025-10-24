import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ujian = sequelize.define("Ujian", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  judul: { type: DataTypes.STRING(200), allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true },
  waktuMulai: { type: DataTypes.DATE, allowNull: false },
  waktuSelesai: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM("draft", "active", "closed"),
    allowNull: false,
    defaultValue: "draft",
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },

  // 🔥 foreign key ke batch soal
  batchSoalId: { 
    type: DataTypes.INTEGER,
    allowNull: false
  },

}, {
  tableName: "Ujian",
  timestamps: true,
});

export default Ujian;
