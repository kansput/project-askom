"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";


export default function CreateUjianPage() {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [batchSoalId, setBatchSoalId] = useState("");
  const [batchList, setBatchList] = useState([]);
  const [ujianList, setUjianList] = useState([]);
  const [ujian, setUjian] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ---- Confirm modal state ----
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  // fungsi untuk buka modal konfirmasi
  const openConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirm(true);
  };

  // ---- Komponen Modal Konfirmasi ----
  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[380px] shadow-2xl animate-fade-in">
        {/* Header dengan ikon warning */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Konfirmasi</h2>
        </div>

        {/* Pesan */}
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        {/* Tombol */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );





  // ambil daftar batch soal dari backend
  useEffect(() => {
    const fetchBatchSoal = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBatchList(data.data);
          console.log("Batch soal:", data.data); // cek isi
        }
      } catch (error) {
        console.error("Error fetching batch soal:", error);
      }
    };

    if (token) fetchBatchSoal();
  }, [token]);

  // ambil daftar ujian dari backend
  useEffect(() => {
    const fetchUjian = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUjianList(data.data);
          console.log("Ujian list:", data.data); // debug cek isi
        }
      } catch (error) {
        console.error("Error fetching ujian:", error);
      }
    };

    if (token) fetchUjian();
  }, [token]);




  // buat ujian draft
  const handleCreateUjian = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          waktuMulai,
          waktuSelesai,
          batchSoalId: Number(batchSoalId),
          pesertaIds: []
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 🔥 masukkan draft baru ke daftar
        setUjianList((prev) => [...prev, data.data]);

        // 🔥 reset form biar bisa buat draft lagi
        setJudul("");
        setDeskripsi("");
        setWaktuMulai("");
        setWaktuSelesai("");
        setBatchSoalId("");

        // pastikan state ujian null supaya form tetap kelihatan
        setUjian(null);

        toast.success("✓ Ujian berhasil dibuat sebagai draft");
      } else {
        toast.error(data.message || "Gagal membuat ujian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat membuat ujian");
    } finally {
      setLoading(false);
    }
  };



  // delete draft ujian
  const handleDeleteDraft = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal menghapus draft");
        return;
      }

      if (data.success) {
        setUjianList((prev) => prev.filter((u) => u.id !== id));
        toast.success("✓ Draft ujian berhasil dihapus!");
      } else {
        toast.error(data.message || "Gagal menghapus draft");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // start ujian
  const handleStartUjian = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal memulai ujian");
        return;
      }

      if (data.success) {
        setUjianList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "active" } : u))
        );
        toast.success("✓ Ujian sudah dimulai!");
      } else {
        toast.error(data.message || "Gagal memulai ujian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // stop ujian
  const handleStopUjian = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}/stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal menghentikan ujian");
        return;
      }

      if (data.success) {
        setUjianList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "closed" } : u))
        );
        toast.success("✓ Ujian berhasil dihentikan!");
      } else {
        toast.error(data.message || "Gagal menghentikan ujian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };





  const handleReset = () => {
    setUjian(null);
    setJudul("");
    setDeskripsi("");
    setWaktuMulai("");
    setWaktuSelesai("");
    setBatchSoalId("");
  };

  // cari ujian yang sedang aktif
  const ujianAktif = ujianList.find((u) => u.status === "active");
  const draftList = ujianList.filter((u) => u.status === "draft");






  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar title="Buat Ujian Baru" />

      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Buat Ujian Baru
                </h1>
                <p className="text-gray-600">
                  Kelola dan buat ujian untuk peserta dengan mudah
                </p>
              </div>
              <div className="hidden md:block">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ujian Aktif Section */}
          {ujianAktif && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 mb-6 border-2 border-green-200 relative overflow-hidden">
              {/* Animated Background Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                {/* Header dengan Status Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-3 rounded-xl shadow-md animate-pulse">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-800">
                        Ujian Sedang Berlangsung
                      </h2>
                      <p className="text-sm text-green-600 font-medium">Live Now</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    AKTIF
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() =>
                      openConfirm(
                        "Yakin ingin menghentikan ujian ini sekarang?",
                        () => handleStopUjian(ujianAktif.id)
                      )
                    }
                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    Hentikan Ujian
                  </button>

                </div>


                {/* Content Card */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  {/* Judul Ujian */}
                  <div className="mb-5 pb-5 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Judul Ujian
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {ujianAktif.judul}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="mb-5 pb-5 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Deskripsi
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          {ujianAktif.deskripsi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Jadwal Waktu */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Jadwal
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium mb-1">Mulai</p>
                            <p className="text-sm font-bold text-gray-800">
                              {new Date(ujianAktif.waktuMulai).toLocaleString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium mb-1">Selesai</p>
                            <p className="text-sm font-bold text-gray-800">
                              {new Date(ujianAktif.waktuSelesai).toLocaleString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draft Ujian Section */}
          {draftList.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Draft Ujian
                  </h2>
                  <p className="text-sm text-gray-600">
                    {draftList.length} draft tersimpan
                  </p>
                </div>
                <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium text-sm">
                  Belum Dipublikasi
                </div>
              </div>

              <div className="grid gap-4">
                {draftList.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Info Draft */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">
                          {draft.judul}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Mulai:</span>
                            {new Date(draft.waktuMulai).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Selesai:</span>
                            {new Date(draft.waktuSelesai).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Tombol Mulai */}
                        <button
                          onClick={() => handleStartUjian(draft.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mulai
                        </button>

                        {/* Tombol Hapus dengan modal confirm */}
                        <button
                          onClick={() =>
                            openConfirm(
                              `Hapus draft "${draft.judul}"?`,
                              () => handleDeleteDraft(draft.id)
                            )
                          }
                          className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}




          {/* Form Section */}
          {!ujian && (
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Buat Ujian Baru
                    </h2>
                    <p className="text-sm text-gray-600">
                      Lengkapi form di bawah untuk membuat draft ujian
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateUjian} className="space-y-6">
                {/* Judul */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Judul Ujian
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujian Kompetensi Perawat Batch 1"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full border-2 border-gray-200 text-gray-700 placeholder-gray-400 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Deskripsi
                    <span className="text-gray-400 text-xs ml-2">(Opsional)</span>
                  </label>
                  <textarea
                    placeholder="Masukkan deskripsi ujian..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full border-2 border-gray-200 text-gray-700 placeholder-gray-400 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-28 resize-none"
                  />
                </div>

                {/* Waktu Section */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center text-sm font-semibold text-gray-700 mb-4">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Jadwal Ujian
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <label className="block text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
                        Waktu Mulai
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={waktuMulai}
                        onChange={(e) => setWaktuMulai(e.target.value)}
                        className="w-full border-2 border-green-200 text-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                      <label className="block text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
                        Waktu Selesai
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={waktuSelesai}
                        onChange={(e) => setWaktuSelesai(e.target.value)}
                        className="w-full border-2 border-red-200 text-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Batch Soal */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Pilih Batch Soal
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={batchSoalId}
                    onChange={(e) => setBatchSoalId(e.target.value)}
                    className="w-full border-2 border-gray-200 text-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                  >
                    <option value="">-- Pilih Batch Soal --</option>
                    {batchList.map((b) => (
                      <option key={b.id} value={String(b.id)}>  {/* ✅ selalu string */}
                        {b.nama}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pilih batch soal yang akan digunakan untuk ujian ini
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transform hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        Simpan Draft Ujian
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}


        </div>
      </main>
      {/* ✅ Tambahkan di sini */}
      {showConfirm && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={() => {
            confirmAction?.();
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <Footer />
    </div>
  );
}