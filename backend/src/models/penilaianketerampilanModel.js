// models/penilaianketerampilanModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./userModel.js";

const PenilaianKeterampilan = sequelize.define("PenilaianKeterampilan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  perawat_npk: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: User,
      key: 'npk'
    }
  },
  tanggal_penilaian: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  prosedur: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  penilai_npk: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: User,
      key: 'npk'
    }
  },
  nilai_komponen: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  total_bobot: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_nilai: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  nilai_akhir: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  grade: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'selesai', 'final'),
    defaultValue: 'draft',
  },
  
  keterangan_umum: {
    type: DataTypes.TEXT,
    allowNull: true,
  }

}, {
  tableName: "penilaian_keterampilan",
  timestamps: true,
});

PenilaianKeterampilan.belongsTo(User, {
  foreignKey: 'perawat_npk',
  targetKey: 'npk',
  as: 'perawat'
});

PenilaianKeterampilan.belongsTo(User, {
  foreignKey: 'penilai_npk',
  targetKey: 'npk',
  as: 'penilai'
});

export default PenilaianKeterampilan;
