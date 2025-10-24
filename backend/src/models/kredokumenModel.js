import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const KredoDokumen = sequelize.define(
  "KredoDokumen",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fileKredensial: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSPKK: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "kredo_dokumen",
    timestamps: true,
  }
);

export default KredoDokumen;