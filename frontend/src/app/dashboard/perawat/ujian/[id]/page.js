"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

const Navbar = ({ title }) => (
  <nav className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-5xl mx-auto px-4 py-3">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
    </div>
  </nav>
);

export default function UjianDetailPage() {
  const [id, setId] = useState(null);
  const [ujian, setUjian] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [loading, setLoading] = useState(true);

  const [examStarted, setExamStarted] = useState(false);
  const [currentSoal, setCurrentSoal] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sudahSelesai, setSudahSelesai] = useState(false);

  // modal preview gambar
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ambil id dari URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      const examId = parts[parts.length - 1];
      if (examId) setId(examId);
    }
  }, []);

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();

      setIsFullscreen(true);
      setShowExitWarning(false);
      return true;
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(
        "Gagal masuk mode fullscreen. Pastikan kamu mengizinkan di browser."
      );
      return false;
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const handleStartExam = async () => {
    if (!soalList.length) {
      toast.error("Tidak ada soal di ujian ini.");
      return;
    }
    if (sudahSelesai) {
      toast.error("Anda sudah menyelesaikan ujian ini.");
      return;
    }
    const ok = await enterFullscreen();
    if (ok) {
      setExamStarted(true);
      toast.success("Ujian dimulai. Fokus dan jangan keluar fullscreen.");
    }
  };

  const handleReEnterFromWarning = async () => {
    const ok = await enterFullscreen();
    if (ok) setShowExitWarning(false);
  };

  const handleJawab = (soalId, pilihanKode) => {
    setJawaban((prev) => ({ ...prev, [soalId]: pilihanKode }));
  };

  const getProgressPercentage = () => {
    if (!soalList.length) return 0;
    return (Object.keys(jawaban).length / soalList.length) * 100;
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      setIsSubmitting(true);
      setShowConfirmModal(false);
      setShowExitWarning(false);
      exitFullscreen();

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              jawaban,
              exitAttempts,
              tabSwitchCount,
            }),
          }
        );
        const data = await res.json();

        if (res.ok && data.success) {
          toast.success(
            autoSubmit
              ? "Waktu habis. Ujian disubmit otomatis."
              : "Ujian berhasil disubmit."
          );
          window.location.href = "/dashboard/perawat";
        } else {
          if (
            data.message &&
            data.message.toLowerCase().includes("sudah disubmit")
          ) {
            toast.error("Ujian ini sudah Anda selesaikan sebelumnya.");
            window.location.href = "/dashboard/perawat";
          } else {
            toast.error(data.message || "Gagal submit ujian.");
          }
        }
      } catch (err) {
        console.error("Error submit:", err);
        toast.error("Terjadi kesalahan saat submit ujian.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, token, jawaban, exitAttempts, tabSwitchCount]
  );

  // deteksi keluar fullscreen
  useEffect(() => {
    const onFullChange = () => {
      const active =
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.msFullscreenElement;

      setIsFullscreen(active);

      if (!active && examStarted && !isSubmitting) {
        setExitAttempts((prev) => prev + 1);
        setShowExitWarning(true);
        toast.error("Jangan keluar fullscreen selama ujian.");
      }
    };

    document.addEventListener("fullscreenchange", onFullChange);
    document.addEventListener("webkitfullscreenchange", onFullChange);
    document.addEventListener("msfullscreenchange", onFullChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullChange);
      document.removeEventListener("webkitfullscreenchange", onFullChange);
      document.removeEventListener("msfullscreenchange", onFullChange);
    };
  }, [examStarted, isSubmitting]);

  // deteksi pindah tab
  useEffect(() => {
    if (!examStarted) return;

    const handleVis = () => {
      if (document.hidden && !isSubmitting) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 4000);
      }
    };

    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, [examStarted, isSubmitting]);

  // fetch ujian
  useEffect(() => {
    const fetchUjian = async () => {
      if (!id || !token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok && data.success) {
          const u = data.data;
          setUjian(u);

          const soals = u.batchSoal?.soals || [];
          setSoalList(soals);

          if (u.durasi) setTimeRemaining(u.durasi * 60);

          const pesertaList = u.pesertaUjian || [];
          const pesertaSaya = pesertaList.find(
            (p) => p.userId === data.currentUserId // kalau backend kirim, kalau tidak ada, fallback di bawah
          );
          let selesai = false;

          if (pesertaSaya && pesertaSaya.status) {
            selesai = pesertaSaya.status.toLowerCase() === "selesai";
          } else {
            // fallback: kalau API tidak kirim currentUserId dan hanya ada 1 peserta
            if (pesertaList.length === 1) {
              selesai =
                pesertaList[0].status &&
                pesertaList[0].status.toLowerCase() === "selesai";
            }
          }

          setSudahSelesai(selesai);
          if (selesai) {
            toast.error("Anda sudah menyelesaikan ujian ini.");
          }
        } else {
          toast.error(data.message || "Ujian tidak ditemukan.");
          window.location.href = "/dashboard/perawat";
        }
      } catch (err) {
        console.error("Fetch ujian error:", err);
        toast.error("Gagal mengambil data ujian.");
        window.location.href = "/dashboard/perawat";
      } finally {
        setLoading(false);
      }
    };

    fetchUjian();
  }, [id, token]);

  // timer
  useEffect(() => {
    if (!examStarted || timeRemaining == null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeRemaining, handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Memuat data ujian...</p>
        </div>
      </div>
    );
  }

  if (!ujian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Ujian tidak ditemukan.</p>
      </div>
    );
  }

  const currentSoalData = soalList[currentSoal];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar title="Ujian Online" />

      {/* warning fullscreen */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-red-50/90 flex items-center justify-center z-50">
          <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-6 text-center border border-red-200">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-red-700 mb-2">
              Jangan keluar dari mode ujian
            </h2>
            <p className="text-sm text-red-600 mb-3">
              Percobaan keluar fullscreen:{" "}
              <span className="font-bold">{exitAttempts}</span>
            </p>
            <p className="text-xs text-red-500 mb-4">
              Terlalu sering keluar dapat dianggap sebagai kecurangan.
            </p>
            <button
              onClick={handleReEnterFromWarning}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              Kembali ke Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* warning pindah tab */}
      {showTabWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-yellow-400 text-black text-xs px-4 py-2 rounded-lg shadow-md">
            Terdeteksi perpindahan tab/jendela ({tabSwitchCount}x). Harap fokus
            ke halaman ujian.
          </div>
        </div>
      )}

      {/* header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {ujian.judul}
            </h1>
            <p className="text-xs text-gray-500 line-clamp-1">
              {ujian.deskripsi || "Ujian kompetensi perawat"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                Exit: <span className="font-semibold">{exitAttempts}</span>
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                Tab: <span className="font-semibold">{tabSwitchCount}</span>
              </span>
            </div>

            {timeRemaining != null && (
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${timeRemaining <= 300
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-blue-600 text-white"
                  }`}
              >
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* intro sebelum start */}
      {!examStarted && (
        <main className="flex-grow">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {sudahSelesai ? "Ujian sudah selesai" : "Persiapan Ujian"}
              </h2>

              {sudahSelesai ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Anda sudah menyelesaikan ujian ini. Terima kasih.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/dashboard/perawat")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition"
                  >
                    Kembali ke Dashboard
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Sebelum mulai ujian, pastikan:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 mb-4">
                    <li>Koneksi internet stabil.</li>
                    <li>
                      Perangkat dalam kondisi aman dan tidak dipakai hal lain.
                    </li>
                    <li>Tidak berpindah tab atau keluar fullscreen.</li>
                  </ul>

                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>
                      Jumlah soal:{" "}
                      <span className="font-semibold">
                        {soalList.length || 0}
                      </span>
                    </p>
                    {ujian.durasi && (
                      <p>
                        Durasi:{" "}
                        <span className="font-semibold">
                          {ujian.durasi} menit
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleStartExam}
                    disabled={!soalList.length}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Mulai Ujian & Masuk Fullscreen
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* tampilan saat ujian berjalan */}
      {examStarted && soalList.length > 0 && currentSoalData && (
        <main className="flex-grow">
          <div className="max-w-5xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[220px,1fr]">
            {/* navigasi soal */}
            <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit sticky top-20">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Navigasi Soal
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {soalList.map((soal, idx) => {
                  const isActive = idx === currentSoal;
                  const answered = !!jawaban[soal.id];

                  return (
                    <button
                      key={soal.id}
                      onClick={() => setCurrentSoal(idx)}
                      className={`w-9 h-9 text-xs font-semibold rounded-lg border transition ${isActive
                          ? "bg-blue-600 text-white border-blue-500"
                          : answered
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1 text-[11px] text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-green-500" />
                  Sudah dijawab
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-600" /> Soal aktif
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />{" "}
                  Belum dijawab
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[11px] text-gray-500">
                  Progress:{" "}
                  <span className="font-semibold">
                    {Object.keys(jawaban).length} / {soalList.length} soal (
                    {Math.round(getProgressPercentage())}%)
                  </span>
                </p>
              </div>
            </aside>

            {/* konten soal */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  Soal {currentSoal + 1} dari {soalList.length}
                </h2>
                {jawaban[currentSoalData.id] && (
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-[11px] font-semibold text-green-700">
                    ✓ Terjawab
                  </span>
                )}
              </div>

              {/* gambar soal + preview modal trigger */}
              {currentSoalData.gambar && (
                <div className="mb-4 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(
                        `${process.env.NEXT_PUBLIC_API_URL}${currentSoalData.gambar}`
                      );
                      setShowImageModal(true);
                    }}
                    className="focus:outline-none group"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${currentSoalData.gambar}`}
                      alt="Gambar soal"
                      width={600}
                      height={400}
                      className="max-h-64 rounded-lg object-contain mx-auto group-hover:opacity-90"
                      unoptimized
                    />
                    <p className="mt-2 text-[11px] text-gray-500 text-center group-hover:text-gray-600">
                      Klik gambar untuk memperbesar
                    </p>
                  </button>
                </div>
              )}

              <div className="mb-5 text-sm text-gray-800 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentSoalData.pertanyaan,
                  }}
                />
              </div>

              <div className="space-y-3">
                {Array.isArray(currentSoalData.opsi) &&
                  currentSoalData.opsi.map((opsi) => {
                    const kode = opsi.kode;
                    const text = opsi.text;
                    const selected = jawaban[currentSoalData.id] === kode;

                    return (
                      <button
                        key={kode}
                        onClick={() => handleJawab(currentSoalData.id, kode)}
                        className={`w-full flex items-start gap-3 text-left text-sm rounded-lg border px-3 py-2.5 transition ${selected
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 ${selected
                              ? "bg-white text-blue-600"
                              : "bg-gray-200"
                            }`}
                        >
                          {kode}
                        </span>
                        <div
                          className="flex-1"
                          dangerouslySetInnerHTML={{ __html: text }}
                        />
                      </button>
                    );
                  })}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setCurrentSoal((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSoal === 0}
                  className="w-full sm:w-auto text-xs font-semibold px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 disabled:bg-white disabled:text-gray-400 disabled:border-gray-200"
                >
                  ← Sebelumnya
                </button>

                <span className="text-[11px] text-gray-500">
                  Soal {currentSoal + 1} / {soalList.length}
                </span>

                {currentSoal < soalList.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentSoal((prev) =>
                        Math.min(soalList.length - 1, prev + 1)
                      )
                    }
                    className="w-full sm:w-auto text-xs font-semibold px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
                  >
                    Selanjutnya →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-xs font-semibold px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:bg-green-800"
                  >
                    Submit Ujian
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* modal konfirmasi submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Konfirmasi Submit Ujian
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Pastikan semua jawaban sudah kamu cek. Setelah submit, kamu tidak
              bisa mengubah jawaban.
            </p>
            {soalList.length - Object.keys(jawaban).length > 0 && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                Masih ada{" "}
                <span className="font-semibold">
                  {soalList.length - Object.keys(jawaban).length} soal
                </span>{" "}
                yang belum dijawab.
              </p>
            )}
            <p className="text-[11px] text-gray-500 mb-4">
              Exit fullscreen: {exitAttempts}x • Pindah tab: {tabSwitchCount}x
            </p>

            <div className="flex flex-col sm:flex-row-reverse gap-2">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:bg-blue-800"
              >
                {isSubmitting ? "Menyimpan..." : "Ya, Submit Sekarang"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto border border-gray-300 text-sm font-semibold px-4 py-2 rounded-lg bg-white hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal preview gambar */}
      {showImageModal && previewImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="relative max-w-3xl w-full px-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white text-sm bg-black/60 px-3 py-1 rounded-full hover:bg-black"
            >
              Tutup
            </button>
            <div className="bg-white rounded-xl p-3">
              <div className="relative w-full h-[70vh]">
                <Image
                  src={previewImage}
                  alt="Preview gambar soal"
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
