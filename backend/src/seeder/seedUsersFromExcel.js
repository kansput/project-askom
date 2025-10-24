import bcrypt from "bcryptjs";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/db.js";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Format ke yyyymmdd (buat password default)
function yyyymmdd(date) {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

// Parse tanggal dari Excel (serial number atau string/Date)
function parseExcelDate(d) {
  if (typeof d === "number") {
    const parsed = XLSX.SSF.parse_date_code(d);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const dateObj = new Date(d);
  return isNaN(dateObj) ? null : dateObj;
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connected");

    const file = path.join(__dirname, "../data/mitra_clean.xlsx");
    const wb = XLSX.readFile(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

    const batch = [];

    for (const r of rows) {
      const npk = r["NPK"]?.toString().trim();
      const username = (r["NAMA"] || "").toString().trim();

      if (!npk || !username) {
        console.log("⏩ Skip row (missing NPK/NAMA):", r);
        continue;
      }

      const unit = r["UNIT"] || null;
      const jenjangKarir = r["JENJANGKARIR"] || null;
      const role = (r["ROLE"] || "kepala unit").toLowerCase();

      // Ambil tanggal lahir
      const dobRaw = r["TANGGALLAHIR"];
      const dob = parseExcelDate(dobRaw);
      if (!dob) {
        console.log("⏩ Skip row (invalid TANGGALLAHIR):", r);
        continue;
      }

      // Password default dari tanggal lahir
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
        jenjangKarir,
        tanggalLahir: dob,
        mustChangePassword: true,
        passwordChangedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await User.bulkCreate(batch, { ignoreDuplicates: true });
    console.log(`✅ Inserted ${batch.length} users`);
  } catch (e) {
    console.error("❌ Error seeding:", e);
  } finally {
    await sequelize.close();
  }
}

run();
