import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const File = sequelize.define(
  "File",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    uploaded_by: {
      type: DataTypes.STRING,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "documents", // nama tabel di database
    timestamps: false, // kita pakai kolom uploaded_at sendiri
  }
);

export default File;
