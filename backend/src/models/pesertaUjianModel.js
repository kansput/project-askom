import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PesertaUjian = sequelize.define("PesertaUjian", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ujianId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("belum mulai", "sedang ujian", "selesai"), defaultValue: "belum mulai", allowNull: false, },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  skor: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  exitAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  tabSwitchCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: "PesertaUjian",
  timestamps: true,
});

export default PesertaUjian;
