import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FilePermission = sequelize.define(
  "FilePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    can_download: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    granted_by: {
      type: DataTypes.INTEGER, // ID user yang memberikan akses
      allowNull: false,
    },
    granted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "file_permissions",
    timestamps: false,
  }
);

export default FilePermission;