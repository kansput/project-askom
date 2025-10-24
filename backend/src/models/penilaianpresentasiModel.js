import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./userModel.js";

const PenilaianPresentasi = sequelize.define("PenilaianPresentasi", {
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
  tanggal_presentasi: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  topik: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nilai_penguji1: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  nilai_penguji2: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true,
  },
  total_penguji1: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  total_penguji2: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  nilai_final: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  grade: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'penguji1_selesai', 'penguji2_selesai', 'final'),
    defaultValue: 'draft',
  },
  penguji1_npk: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: User,
      key: 'npk'
    }
  },
  penguji2_npk: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: User,
      key: 'npk'
    }
  },
  locked_by: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }
}, {
  tableName: "penilaian_presentasi",
  timestamps: true,
});

// Associations
PenilaianPresentasi.belongsTo(User, {
  foreignKey: 'perawat_npk',
  targetKey: 'npk',
  as: 'perawat'
});

PenilaianPresentasi.belongsTo(User, {
  foreignKey: 'penguji1_npk',
  targetKey: 'npk',
  as: 'penguji1'
});

PenilaianPresentasi.belongsTo(User, {
  foreignKey: 'penguji2_npk',
  targetKey: 'npk',
  as: 'penguji2'
});

export default PenilaianPresentasi;