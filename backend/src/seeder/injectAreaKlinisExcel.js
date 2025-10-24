import XLSX from "xlsx";
import sequelize from "./config/db.js";
import User from "./models/userModel.js";

async function injectAreaKlinis() {
  try {
    // 1️⃣ Baca file Excel
    const workbook = XLSX.readFile("data.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`📄 Membaca ${rows.length} baris dari Excel...`);

    // 2️⃣ Tes koneksi
    await sequelize.authenticate();
    console.log("✅ Database connected");

    let success = 0, fail = 0;

    // 3️⃣ Loop setiap baris Excel
    for (const row of rows) {
      const npk = String(row.npk).trim();
      const areaKlinis = String(row.areaKlinis).trim();

      const [updated] = await User.update(
        { areaKlinis },
        { where: { npk } }
      );

      if (updated > 0) {
        success++;
        console.log(`✅ ${npk} → ${areaKlinis}`);
      } else {
        fail++;
        console.warn(`⚠️ NPK ${npk} tidak ditemukan`);
      }
    }

    console.log(`\n✅ Selesai. Berhasil: ${success}, Gagal: ${fail}`);
  } catch (error) {
    console.error("❌ Error inject:", error);
  } finally {
    await sequelize.close();
  }
}

injectAreaKlinis();
