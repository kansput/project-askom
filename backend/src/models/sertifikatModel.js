import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // pastikan ada file db.js

const Sertifikat = sequelize.define("Sertifikat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
  kategori: {
    type: DataTypes.ENUM("umum", "khusus"),
    allowNull: false,
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  penyelenggara: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "sertifikat",
  timestamps: true,
});

export default Sertifikat;
