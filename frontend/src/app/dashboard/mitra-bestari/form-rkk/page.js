"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

export default function UploadJadwalPage() {
  const [bulan, setBulan] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bulan || !file) {
      toast.error("Pilih bulan dan upload file dulu!");
      return;
    }
    console.log("Bulan:", bulan, "File:", file.name);
    toast.success("Jadwal berhasil dipilih, nanti dihubungkan ke backend ");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title="Upload Form RKK" />

      <main className="flex-grow p-6">
        {/* Header */}
        <div className="bg-blue-900 text-white font-semibold px-4 py-2 rounded shadow-md mb-4">
          Form Upload Form RKK (Kepala Unit)
        </div>

        {/* Pilih Bulan */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Pilih Bulan
          </label>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-64 bg-white text-gray-900"
          >
            <option value="">Bulan</option>
            <option value="januari">Januari</option>
            <option value="februari">Februari</option>
            <option value="maret">Maret</option>
            <option value="april">April</option>
            <option value="mei">Mei</option>
            <option value="juni">Juni</option>
            <option value="juli">Juli</option>
            <option value="agustus">Agustus</option>
            <option value="september">September</option>
            <option value="oktober">Oktober</option>
            <option value="november">November</option>
            <option value="desember">Desember</option>
          </select>
        </div>

        {/* Upload form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded shadow-md p-4 mb-6"
        >
          <div className="bg-blue-900 text-white font-semibold px-4 py-2 rounded mb-4">
            Detail Upload Form RKK
          </div>

          <label className="block mb-2 font-medium text-gray-700">
            Upload Form RKK
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 block border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
          >
            Simpan Jadwal
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
