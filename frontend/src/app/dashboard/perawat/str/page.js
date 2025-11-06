"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";

export default function StrSipPage() {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handle input text / date
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle upload file (single & multiple)
  const handleFile = (e) => {
    const { name, multiple, files: uploadedFiles } = e.target;

    if (multiple) {
      // multiple file → simpan array
      setFiles({
        ...files,
        [name]: Array.from(uploadedFiles),
      });
    } else {
      // single file
      setFiles({
        ...files,
        [name]: uploadedFiles[0],
      });
    }
  };

  // submit form + kirim ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bulan) {
      toast.error("Pilih periode terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();

    // masukkan semua data text
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    // masukkan semua file
    Object.keys(files).forEach((key) => {
      const value = files[key];
      if (Array.isArray(value)) {
        value.forEach((f) => formDataToSend.append(key, f));
      } else {
        formDataToSend.append(key, value);
      }
    });

    try {
      // debug isi form
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Kamu belum login. Token tidak ditemukan.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/str/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      console.log("Upload result:", data);

      if (data.success) {
        toast.success("Data berhasil diupload ke backend!");
        setFormData({});
        setFiles({});
        e.target.reset();
      } else {
        toast.error("Upload gagal: " + data.message);
      }
    } catch (err) {
      console.error("Error submit:", err);
      toast.error("Gagal upload, cek console untuk detail.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancel = () => {
    if (confirm("Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang.")) {
      setFormData({});
      setFiles({});
      // Reset form
      document.querySelector("form")?.reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title="Dokumen Riwayat Hidup, STR, & SIP " />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold px-6 py-4 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl">Dokumen Riwayat Hidup, STR, & SIP </h2>
          <p className="text-blue-100 text-sm mt-1">Lengkapi semua informasi dokumen dengan teliti</p>
        </div>

        {/* Pilih Bulan */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
          <label htmlFor="bulan" className="block mb-2 font-semibold text-gray-800 text-lg">
            📅 Pilih Periode <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            id="bulan"
            name="bulan"
            value={formData.bulan || ""}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-80 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Data Perawat */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Data Perawat & Riwayat</h3>
                <p className="text-sm text-gray-500">Informasi identitas dan riwayat pendidikan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Tahun Kelulusan</label>
                <input
                  type="text"
                  name="tahunSelesai"
                  value={formData.tahunSelesai || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 2020"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Pendidikan Terakhir</label>
                <input
                  type="text"
                  name="pendidikanterakhir"
                  value={formData.pendidikanterakhir || ""}
                  onChange={handleChange}
                  placeholder="Contoh: D3 Keperawatan"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Asal Sekolah / Perguruan</label>
                <input
                  type="text"
                  name="asalSekolah"
                  value={formData.asalSekolah || ""}
                  onChange={handleChange}
                  placeholder="Contoh: AKADEMI KEPERAWATAN"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Upload Ijazah</label>
                <input
                  type="file"
                  name="fileIjazah"
                  onChange={handleFile}
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-gray-900 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer transition"
                />
                <p className="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Section 2: STR */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">STR (Surat Tanda Registrasi)</h3>
                <p className="text-sm text-gray-500">Informasi dan dokumen STR</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Nomor STR</label>
                <input
                  type="text"
                  name="nomorSTR"
                  value={formData.nomorSTR || ""}
                  onChange={handleChange}
                  placeholder="Contoh: AB12345675587"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Tanggal Berakhir STR</label>
                <input
                  type="date"
                  name="tglBerakhirSTR"
                  value={formData.tglBerakhirSTR || ""}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Upload File STR</label>
                <input
                  type="file"
                  name="fileSTR"
                  onChange={handleFile}
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-gray-900 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer transition"
                />
                <p className="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Section 3: SIP */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
              <div className="bg-purple-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">SIP (Surat Izin Praktik)</h3>
                <p className="text-sm text-gray-500">Informasi dan dokumen SIP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Nomor SIP</label>
                <input
                  type="text"
                  name="nomorSIP"
                  value={formData.nomorSIP || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 11/B.16a/22.11.01.1999.7."
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Tanggal Berakhir SIP</label>
                <input
                  type="date"
                  name="tglBerakhirSIP"
                  value={formData.tglBerakhirSIP || ""}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Upload File SIP</label>
                <input
                  type="file"
                  name="fileSIP"
                  onChange={handleFile}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-gray-900 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer transition"
                />
                <p className="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>



          {/* Section 5: RKK */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">RKK (Rincian Kewenangan Klinis)</h3>
                <p className="text-sm text-gray-500">Informasi RKK dan masa berlaku</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Nomor RKK</label>
                <input
                  type="text"
                  name="nomorRKK"
                  value={formData.nomorRKK || ""}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: XX/ABC/0X/XX/DIRUT/20XX"
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Masa Berlaku RKK (Periode)</label>
                <input
                  type="text"
                  name="rkkMasaBerlaku"
                  value={formData.rkkMasaBerlaku || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 5 tahun"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Tanggal Berakhir RKK</label>
                <input
                  type="date"
                  name="masaBerlakuRKK"
                  value={formData.masaBerlakuRKK || ""}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Upload File RKK</label>
                <input
                  type="file"
                  name="fileRKK"
                  onChange={handleFile}
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-gray-900 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer transition"
                />
                <p className="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG (Max 5MB)</p>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}