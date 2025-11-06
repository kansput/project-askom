import bcrypt from "bcryptjs";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/db.js";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function yyyymmdd(date) {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

function parseExcelDate(d) {
  // Handle format "1/31/2001 0:00:00"
  if (typeof d === 'string' && d.includes('/')) {
    const datePart = d.split(' ')[0]; // Ambil bagian tanggal saja "1/31/2001"
    const [month, day, year] = datePart.split('/');
    const dateObj = new Date(year, month - 1, day);
    return isNaN(dateObj) ? null : dateObj;
  }
  
  // Handle Excel numeric date
  if (typeof d === "number") {
    const parsed = XLSX.SSF.parse_date_code(d);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  
  // Handle Date object
  const dateObj = new Date(d);
  return isNaN(dateObj) ? null : dateObj;
}

function normalizeRow(row) {
  const normalized = {};
  for (const key in row) {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "");
    normalized[cleanKey] = row[key];
  }
  return normalized;
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log(" DB Connected");

    // Ganti dengan path file Excel Anda
    const file = path.join(__dirname, "../data/inject.xlsx");
    const wb = XLSX.readFile(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

    const batch = [];

    for (const raw of rows) {
      const r = normalizeRow(raw);

      const npk = r["npk"]?.toString().trim();
      const username = (r["username"] || "").toString().trim();

      if (!npk || !username) {
        console.log("⏩ Skip row (missing NPK/USERNAME):", r);
        continue;
      }

      const unit = r["unit"] || null;
      const areaKlinis = r["areaklinis"] || null;
      const jenjangKarir = r["jenjangkarir"] || null;
      const role = (r["role"] || "perawat").toLowerCase(); // Default ke "perawat"

      const dobRaw = r["tanggallahir"];
      const dob = parseExcelDate(dobRaw);
      
      if (!dob) {
        console.log("⏩ Skip row (invalid TANGGALLAHIR):", dobRaw);
        continue;
      }

      const plainPwd = yyyymmdd(dob);
      if (!plainPwd) {
        console.log("⏩ Skip row (invalid password date):", r);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(plainPwd, salt);

      batch.push({
        npk,
        username,
        password: hashed,
        role,
        unit,
        areaKlinis,
        jenjangKarir,
        tanggalLahir: dob,
        mustChangePassword: true,
        passwordChangedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await User.bulkCreate(batch, { ignoreDuplicates: true });
    console.log(` Inserted ${batch.length} users`);
  } catch (e) {
    console.error(" Error seeding:", e);
  } finally {
    await sequelize.close();
  }
}

run();