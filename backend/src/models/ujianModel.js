import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ujian = sequelize.define("Ujian", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  judul: { type: DataTypes.STRING(200), allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true },
  waktuMulai: { type: DataTypes.DATE, allowNull: false },
  waktuSelesai: { type: DataTypes.DATE, allowNull: false },
  durasi: { type: DataTypes.INTEGER, allowNull: true }, // menit, optional
  status: { type: DataTypes.ENUM("draft", "active", "closed"), defaultValue: "draft", allowNull: false, },
  batchSoalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "BatchSoal", key: "id" }, onDelete: "CASCADE", },
  createdBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE", },}, 
  {
  tableName: "Ujian",
  timestamps: true,
});

export default Ujian;
