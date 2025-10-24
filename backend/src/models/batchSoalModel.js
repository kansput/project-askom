import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BatchSoal = sequelize.define("BatchSoal", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(200), allowNull: false },
  deskripsi: { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "BatchSoal",
  timestamps: true,
});

export default BatchSoal;
