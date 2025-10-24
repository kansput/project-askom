"use client";
import { useState, useEffect } from "react";
import { Upload, FileText, Calendar, CheckCircle2, AlertCircle, Plus, Award, Building2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SertifikatPage() {
  const [sertifikatUmum, setSertifikatUmum] = useState([
    {
      id: 1,
      judul: "",
      tanggal: "",
      penyelenggara: "",
      file: null,
      dragActive: false
    }
  ]);

  const [sertifikatKhusus, setSertifikatKhusus] = useState([
    {
      id: 1,
      judul: "",
      tanggal: "",
      penyelenggara: "",
      file: null,
      dragActive: false
    }
  ]);

  const [expandedUmum, setExpandedUmum] = useState(true);
  const [expandedKhusus, setExpandedKhusus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allSertifikatData, setAllSertifikatData] = useState([]);

  // Fetch data sertifikat saat komponen mount
  useEffect(() => {
    fetchSertifikat();
  }, []);

  const fetchSertifikat = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sertifikat`);
      if (response.ok) {
        const data = await response.json();
        setAllSertifikatData(data);
        console.log("Data sertifikat:", data);
      }
    } catch (error) {
      console.error("Error fetching sertifikat:", error);
    }
  };

  const addSertifikat = (type) => {
    const list = type === "umum" ? sertifikatUmum : sertifikatKhusus;
    const setList = type === "umum" ? setSertifikatUmum : setSertifikatKhusus;

    if (list.length >= 10) {
      alert("Maksimal 10 sertifikat per kategori!");
      return;
    }

    const newId = Math.max(...list.map(s => s.id)) + 1;
    setList([
      ...list,
      {
        id: newId,
        judul: "",
        tanggal: "",
        penyelenggara: "",
        file: null,
        dragActive: false
      }
    ]);
  };

  const removeSertifikat = (type, id) => {
    const list = type === "umum" ? sertifikatUmum : sertifikatKhusus;
    const setList = type === "umum" ? setSertifikatUmum : setSertifikatKhusus;

    if (list.length === 1) {
      alert("Minimal harus ada 1 sertifikat per kategori!");
      return;
    }
    setList(list.filter(s => s.id !== id));
  };

  const updateSertifikat = (type, id, field, value) => {
    const list = type === "umum" ? sertifikatUmum : sertifikatKhusus;
    const setList = type === "umum" ? setSertifikatUmum : setSertifikatKhusus;

    setList(
      list.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const handleDrag = (e, type, id) => {
    e.preventDefault();
    e.stopPropagation();
    const isDragEnterOrOver = e.type === "dragenter" || e.type === "dragover";
    updateSertifikat(type, id, "dragActive", isDragEnterOrOver);
  };

  const handleDrop = (e, type, id) => {
    e.preventDefault();
    e.stopPropagation();
    updateSertifikat(type, id, "dragActive", false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      updateSertifikat(type, id, "file", e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e, type, id) => {
    if (e.target.files && e.target.files[0]) {
      updateSertifikat(type, id, "file", e.target.files[0]);
    }
  };

  const validateSertifikat = (sertifikat, index, type) => {
    if (!sertifikat.judul) {
      alert(`Sertifikat ${type} #${index + 1}: Judul belum diisi!`);
      return false;
    }
    if (!sertifikat.tanggal) {
      alert(`Sertifikat ${type} #${index + 1}: Tanggal belum diisi!`);
      return false;
    }
    if (!sertifikat.penyelenggara) {
      alert(`Sertifikat ${type} #${index + 1}: Penyelenggara belum diisi!`);
      return false;
    }
    if (!sertifikat.file) {
      alert(`Sertifikat ${type} #${index + 1}: File belum diupload!`);
      return false;
    }
    return true;
  };

  const uploadSertifikat = async (sertifikat, kategori) => {
    const formData = new FormData();
    formData.append("kategori", kategori);
    formData.append("judul", sertifikat.judul);
    formData.append("tanggal", sertifikat.tanggal);
    formData.append("penyelenggara", sertifikat.penyelenggara);
    formData.append("file", sertifikat.file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sertifikat`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload gagal");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validasi Sertifikat Umum
    for (let i = 0; i < sertifikatUmum.length; i++) {
      if (!validateSertifikat(sertifikatUmum[i], i, "Umum")) {
        return;
      }
    }

    // Validasi Sertifikat Khusus
    for (let i = 0; i < sertifikatKhusus.length; i++) {
      if (!validateSertifikat(sertifikatKhusus[i], i, "Khusus")) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const uploadPromises = [];

      // Upload semua sertifikat umum
      sertifikatUmum.forEach(sert => {
        uploadPromises.push(uploadSertifikat(sert, "umum"));
      });

      // Upload semua sertifikat khusus
      sertifikatKhusus.forEach(sert => {
        uploadPromises.push(uploadSertifikat(sert, "khusus"));
      });

      // Tunggu semua upload selesai
      const results = await Promise.all(uploadPromises);

      const totalSertifikat = sertifikatUmum.length + sertifikatKhusus.length;
      alert(`✅ Berhasil! ${totalSertifikat} sertifikat (${sertifikatUmum.length} Umum, ${sertifikatKhusus.length} Khusus) telah tersimpan ke database!`);

      // Reset form
      setSertifikatUmum([{
        id: 1,
        judul: "",
        tanggal: "",
        penyelenggara: "",
        file: null,
        dragActive: false
      }]);

      setSertifikatKhusus([{
        id: 1,
        judul: "",
        tanggal: "",
        penyelenggara: "",
        file: null,
        dragActive: false
      }]);

      // Refresh data
      fetchSertifikat();

    } catch (error) {
      console.error("Error uploading sertifikat:", error);
      alert(`❌ Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSertifikatFromDB = async (id) => {
    if (!confirm("Yakin ingin menghapus sertifikat ini dari database?")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sertifikat/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Sertifikat berhasil dihapus dari database!");
        fetchSertifikat();
      } else {
        const error = await response.json();
        alert(`Gagal menghapus: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting sertifikat:", error);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const renderSertifikatSection = (type, list, expanded, setExpanded) => {
    const isUmum = type === "umum";
    const title = isUmum ? "Sertifikat Umum" : "Sertifikat Khusus";
    const description = isUmum ? "BLS, ACLS, ATLS, dll" : "Spesialisasi";

    const bgColor = isUmum
      ? "from-blue-500 to-blue-600"
      : "from-teal-500 to-teal-600";

    const borderColor = isUmum
      ? "border-blue-500"
      : "border-teal-500";

    const iconBg = isUmum
      ? "from-blue-500 to-blue-600"
      : "from-teal-500 to-teal-600";

    const iconColor = isUmum
      ? "text-blue-600"
      : "text-teal-600";

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`w-full bg-gradient-to-r ${bgColor} text-white p-4 flex items-center justify-between hover:opacity-90 transition-all`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-xs opacity-90">{description} • maksimal 10 sertifikat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              {list.length}/10
            </span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {expanded && (
          <div className="p-4">
            <div className="space-y-4">
              {list.map((sertifikat, index) => (
                <div key={sertifikat.id} className={`border-2 ${borderColor} rounded-lg p-4 relative bg-gray-50`}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className={`bg-gradient-to-r ${iconBg} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {title} #{index + 1}
                      </h4>
                    </div>
                    {list.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSertifikat(type, sertifikat.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Hapus sertifikat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 mb-1.5 font-semibold text-sm text-gray-700">
                        <FileText className={`w-4 h-4 ${iconColor}`} />
                        Judul Sertifikat/Pelatihan
                      </label>
                      <input
                        type="text"
                        value={sertifikat.judul}
                        onChange={(e) => updateSertifikat(type, sertifikat.id, "judul", e.target.value)}
                        placeholder={isUmum ? "Contoh: Basic Life Support (BLS)" : "Contoh: Spesialis Bedah Umum"}
                        className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-1.5 font-semibold text-sm text-gray-700">
                        <Calendar className={`w-4 h-4 ${iconColor}`} />
                        Tanggal Pelaksanaan
                      </label>
                      <input
                        type="date"
                        value={sertifikat.tanggal}
                        onChange={(e) => updateSertifikat(type, sertifikat.id, "tanggal", e.target.value)}
                        className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-1.5 font-semibold text-sm text-gray-700">
                        <Building2 className={`w-4 h-4 ${iconColor}`} />
                        Penyelenggara
                      </label>
                      <input
                        type="text"
                        value={sertifikat.penyelenggara}
                        onChange={(e) => updateSertifikat(type, sertifikat.id, "penyelenggara", e.target.value)}
                        placeholder="Contoh: IDI Cabang Jakarta"
                        className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-1.5 font-semibold text-sm text-gray-700">
                        <Upload className={`w-4 h-4 ${iconColor}`} />
                        Upload File Sertifikat
                      </label>
                      <div
                        onDragEnter={(e) => handleDrag(e, type, sertifikat.id)}
                        onDragLeave={(e) => handleDrag(e, type, sertifikat.id)}
                        onDragOver={(e) => handleDrag(e, type, sertifikat.id)}
                        onDrop={(e) => handleDrop(e, type, sertifikat.id)}
                        className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${sertifikat.dragActive
                          ? "border-blue-500 bg-blue-50"
                          : sertifikat.file
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
                          }`}
                      >
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, type, sertifikat.id)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />

                        <div className="flex items-center gap-3 pointer-events-none">
                          {sertifikat.file ? (
                            <>
                              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">{sertifikat.file.name}</p>
                                <p className="text-xs text-gray-600">
                                  {(sertifikat.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateSertifikat(type, sertifikat.id, "file", null);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium pointer-events-auto flex-shrink-0 px-2 py-1 hover:bg-red-100 rounded"
                              >
                                Hapus
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                                <Upload className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800">
                                  Drag & drop atau klik untuk upload
                                </p>
                                <p className="text-xs text-gray-600">
                                  Format: PDF, JPG, PNG (Max. 5MB)
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {list.length < 10 && (
              <button
                type="button"
                onClick={() => addSertifikat(type)}
                className={`w-full mt-3 px-4 py-3 bg-white border-2 border-dashed ${borderColor} ${iconColor} rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm flex items-center justify-center gap-2 group`}
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Tambah {title} ({list.length}/10)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar title="Upload Sertifikat Kompetensi" />

      <main className="flex-grow container mx-auto px-4 py-5 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-4 mb-5 border-l-4 border-blue-600">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Form Upload Sertifikat</h2>
              <p className="text-sm text-gray-600">Upload sertifikat umum dan khusus yang Anda miliki (maksimal 10 per kategori)</p>
            </div>
          </div>
        </div>

        {renderSertifikatSection("umum", sertifikatUmum, expandedUmum, setExpandedUmum)}
        {renderSertifikatSection("khusus", sertifikatKhusus, expandedKhusus, setExpandedKhusus)}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700">
            <p className="font-semibold mb-1">Informasi Penting:</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              <li>Anda dapat mengisi kedua kategori sertifikat (Umum dan Khusus)</li>
              <li>Setiap kategori maksimal 10 sertifikat</li>
              <li>Pastikan semua data sertifikat terisi dengan benar</li>
              <li>File harus dalam format PDF, JPG, atau PNG (Max. 5MB per file)</li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {isSubmitting ? 'Mengirim...' : `Kirim Semua Sertifikat (${sertifikatUmum.length + sertifikatKhusus.length} Total)`}
        </button>

        {/* Daftar Sertifikat yang Tersimpan */}
        {allSertifikatData.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Sertifikat Tersimpan di Database ({allSertifikatData.length})
            </h3>
            <div className="space-y-2">
              {allSertifikatData.map((sert) => (
                <div key={sert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-gray-800">{sert.judul}</p>
                    <p className="text-xs text-gray-600">
                      {sert.kategori} • {sert.penyelenggara} • {sert.tanggal}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSertifikatFromDB(sert.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}