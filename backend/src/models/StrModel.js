// models/StrModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StrDocument = sequelize.define(
  "StrDocument",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Data Perawat & Riwayat
    tahunSelesai: { type: DataTypes.STRING },
    pendidikanterakhir: { type: DataTypes.STRING },
    masaKerja: { type: DataTypes.STRING },
    lamaNaikJenjang: { type: DataTypes.STRING },
    asalSekolah: { type: DataTypes.STRING },
    fileIjazah: { type: DataTypes.STRING }, // simpan path/URL ijazah

    // STR
    nomorSTR: { type: DataTypes.STRING },
    tglBerakhirSTR: { type: DataTypes.DATE },
    fileSTR: { type: DataTypes.STRING },

    // SIP
    nomorSIP: { type: DataTypes.STRING },
    tglBerakhirSIP: { type: DataTypes.DATE },
    fileSIP: { type: DataTypes.STRING },

    // RKK
    nomorRKK: { type: DataTypes.STRING },
    rkkMasaBerlaku: { type: DataTypes.STRING },
    masaBerlakuRKK: { type: DataTypes.DATE },

    // Metadata
    userId: { type: DataTypes.INTEGER },
  },
  {
    tableName: "str_documents",
    timestamps: true,
  }
);

export default StrDocument;
