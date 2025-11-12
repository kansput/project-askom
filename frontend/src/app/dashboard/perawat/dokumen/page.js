"use client";
import { useState } from "react";
import { Upload, FileText, Calendar, CheckCircle2, AlertCircle, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function DokumenPage() {
  const [tanggal, setTanggal] = useState("");
  const [files, setFiles] = useState({
    kredensial: null,
    spkk: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrag = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setDragTarget(target);
    } else if (e.type === "dragleave") {
      setDragActive(false);
      setDragTarget(null);
    }
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    // Inisialisasi state files jika masih kosong
    setFiles((prev) => ({
      ...((prev || {}) ?? {}),
      [target]: file,
    }));

    toast.success(`${target === 'kredensial' ? 'Kredensial' : 'SPKK'} berhasil diupload!`);
  };


  const handleFileChange = (e, target) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

      // Cek ekstensi manual
      const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
        return;
      }

      setFiles((prev) => ({ ...prev, [target]: file }));
      toast.success(`${target === 'kredensial' ? 'Kredensial' : 'SPKK'} berhasil diupload!`);
    }
  };



  const removeFile = (target) => {
    setFiles(prev => ({
      ...prev,
      [target]: null
    }));
    toast.success(`${target === 'kredensial' ? 'Kredensial' : 'SPKK'} berhasil dihapus!`);
  };

  const handleSubmit = async () => {
    if (!tanggal) {
      toast.error('Pilih tanggal terlebih dahulu!', {
        icon: '📅',
        duration: 3000,
      });
      return;
    }
    if (!files.kredensial || !files.spkk) {
      toast.error('Harap upload kedua dokumen (Kredensial dan SPKK)!', {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);


    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('🔍 Upload ke:', `${API_BASE_URL}/api/kredokumen/upload`);

    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('fileKredensial', files.kredensial);
    formData.append('fileSPKK', files.spkk);

    // JANGAN set Content-Type header, biarkan browser yang handle

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/kredokumen/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('🔍 Response status:', response.status);

      const result = await response.json();
      console.log('🔍 Response data:', result);

      if (result.success) {
        toast.success('Dokumen berhasil diupload! 🎉');
        setTanggal("");
        setFiles({ kredensial: null, spkk: null });
      } else {
        toast.error(result.message || 'Gagal mengupload dokumen.');
      }
    } catch (error) {
      console.error(' Upload error:', error);
      toast.error('Terjadi kesalahan saat mengupload dokumen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allFilesUploaded = files.kredensial && files.spkk;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* React Hot Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
          },
          success: {
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
          },
          loading: {
            style: {
              border: '1px solid #3b82f6',
            },
          },
        }}
      />

      <Navbar title="Dokumen Kredensial & SPKK" />

      <main className="flex-grow container mx-auto px-4 py-5 max-w-4xl">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-5 border-l-4 border-blue-600">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Form Permohonan Kredensial & SPKK</h2>
              <p className="text-sm text-gray-600">Upload kedua dokumen kredensial dan SPKK secara bersamaan</p>
            </div>
          </div>
        </div>

        {/* Pilih Bulan */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <label className="flex items-center gap-2 mb-2 font-semibold text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            Periode Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        {/* Upload Section - Dual Cards */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload Dokumen Kredensial & SPKK</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Kredensial Card */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800">Permohonan Kredensial</h3>
              </div>

              <div
                onDragEnter={(e) => handleDrag(e, "kredensial")}
                onDragLeave={handleDrag}
                onDragOver={(e) => handleDrag(e, "kredensial")}
                onDrop={(e) => handleDrop(e, "kredensial")}
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${dragActive && dragTarget === "kredensial"
                  ? "border-blue-500 bg-blue-50"
                  : files.kredensial
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
              >
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "kredensial")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />

                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  {files.kredensial ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xs text-gray-800 mb-0.5 truncate max-w-full">
                          {files.kredensial.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(files.kredensial.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xs text-gray-800 mb-0.5">
                          Drag & drop atau klik untuk upload
                        </p>
                        <p className="text-xs text-gray-600">
                          Format: PDF, DOC/DOCX, atau XLS/XLSX
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {files.kredensial && (
                <button
                  type="button"
                  onClick={() => removeFile("kredensial")}
                  className="w-full mt-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Hapus File
                </button>
              )}
            </div>

            {/* SPKK Card */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800">Permohonan SPKK</h3>
              </div>

              <div
                onDragEnter={(e) => handleDrag(e, "spkk")}
                onDragLeave={handleDrag}
                onDragOver={(e) => handleDrag(e, "spkk")}
                onDrop={(e) => handleDrop(e, "spkk")}
                className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${dragActive && dragTarget === "spkk"
                  ? "border-blue-500 bg-blue-50"
                  : files.spkk
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}
              >
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "spkk")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />

                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  {files.spkk ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xs text-gray-800 mb-0.5 truncate max-w-full">
                          {files.spkk.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(files.spkk.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xs text-gray-800 mb-0.5">
                          Drag & drop atau klik untuk upload
                        </p>
                        <p className="text-xs text-gray-600">
                          Format: PDF, DOC/DOCX, atau XLS/XLSX
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {files.spkk && (
                <button
                  type="button"
                  onClick={() => removeFile("spkk")}
                  className="w-full mt-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Hapus File
                </button>
              )}
            </div>
          </div>

          {/* Upload Status */}
          <div className={`rounded-lg p-3 mb-4 transition-all duration-300 ${allFilesUploaded
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
            }`}>
            <div className="flex items-center gap-2">
              {allFilesUploaded ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              )}
              <div className="text-xs">
                <p className="font-semibold mb-1">Status Upload:</p>
                <div className="text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${files.kredensial ? "bg-green-500" : "bg-gray-300"
                      }`} />
                    <span>Permohonan Kredensial: {files.kredensial ? " Terupload" : "Belum diupload"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${files.spkk ? "bg-green-500" : "bg-gray-300"
                      }`} />
                    <span>Permohonan SPKK: {files.spkk ? " Terupload" : "Belum diupload"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <p className="font-semibold mb-1">Informasi Penting:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                <li>Pastikan kedua dokumen sudah ditandatangani</li>
                <li>File harus dalam format PDF, DOC/DOCX, atau XLS/XLSX</li>
                <li>Ukuran file maksimal 10MB per dokumen</li>
                <li>Kedua dokumen harus diupload sebelum dikirim</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allFilesUploaded || !tanggal || isSubmitting} //  Ganti !bulan -> !tanggal
            className={`w-full px-5 py-2.5 text-sm rounded-lg transition-all font-semibold shadow-md flex items-center justify-center gap-2 group ${allFilesUploaded && tanggal && !isSubmitting //  Ganti bulan -> tanggal
              ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengupload...
              </>
            ) : (
              <>
                <CheckCircle2 className={`w-4 h-4 transition-transform ${allFilesUploaded && tanggal ? "group-hover:scale-110" : "" //  Ganti bulan -> tanggal
                  }`} />
                {allFilesUploaded && tanggal //  Ganti bulan -> tanggal
                  ? "Kirim Kedua Dokumen"
                  : "Upload Kedua Dokumen Terlebih Dahulu"}
              </>
            )}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}