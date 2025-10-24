import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PesertaUjian = sequelize.define("PesertaUjian", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ujianId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("belum mulai", "sedang ujian", "selesai"),
    allowNull: false,
    defaultValue: "belum mulai",
  },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  finishedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: "PesertaUjian",
  timestamps: true,
});

export default PesertaUjian;
