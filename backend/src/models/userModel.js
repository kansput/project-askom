// userModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  npk: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("perawat", "kepala unit", "mitra bestari"),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
    areaKlinis: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "areaKlinis",
  },
  jenjangKarir: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "jenjangKarir",
  },
  tanggalLahir: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    allowNull: true,
    field: "tanggalLahir",
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  currentToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: "Users",
  timestamps: true,
});

export default User;