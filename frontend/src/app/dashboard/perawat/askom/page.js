"use client";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

export default function AskomPage() {
  const router = useRouter();
  const [ujian, setUjian] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSoal, setCurrentSoal] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  // Anti-cheat states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const exitAttemptsRef = useRef(0);

  useEffect(() => {
    exitAttemptsRef.current = exitAttempts;
  }, [exitAttempts]);

  const examContainerRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  console.log("DEBUG token:", token);


  // Fetch ujian aktif + soal
  useEffect(() => {
    const fetchUjian = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Fetch list ujian dulu untuk dapat ID aktif
        const resList = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataList = await resList.json();
        if (dataList.success) {
          const aktif = dataList.data.find((u) => u.status === "active");
          if (aktif) {
            // Fetch detail + soal
            const resDetail = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${aktif.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const dataDetail = await resDetail.json();
            if (dataDetail.success) {
              setUjian(dataDetail.data);
              setSoalList(dataDetail.data.batchSoal?.soals || []);

              if (dataDetail.data.durasi) {
                const durasiDetik = dataDetail.data.durasi * 60;
                const waktuGlobalSelesai = new Date(dataDetail.data.waktuSelesai);
                const waktuMulaiSekarang = new Date();

                // hitung waktu personal + global
                const waktuPribadiSelesai = new Date(waktuMulaiSekarang.getTime() + durasiDetik * 1000);
                const waktuSelesaiFinal =
                  waktuPribadiSelesai < waktuGlobalSelesai
                    ? waktuPribadiSelesai
                    : waktuGlobalSelesai;

                const sisaDetik = Math.max(
                  0,
                  Math.floor((waktuSelesaiFinal - waktuMulaiSekarang) / 1000)
                );

                setTimeRemaining(sisaDetik);
              }
            }
            else {
              setError("Ujian aktif ditemukan tapi detail gagal dimuat.");
            }
          } else {
            setUjian(null); // No active
          }
        } else {
          setError("Gagal memuat data ujian.");
        }
      } catch (err) {
        console.error("Gagal fetch ujian:", err);
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchUjian();
  }, [token, router]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
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
      toast.error(" Gagal masuk fullscreen. Izinkan di browser.");
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn(" Gagal keluar dari fullscreen (sudah nonaktif):", err.message);
    }
  }, []);




  const handleStartExam = async () => {
    const success = await enterFullscreen();
    if (!success) return;

    if (!ujian?.id) {
      toast.error("ID ujian tidak ditemukan.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${ujian.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error("Gagal memulai ujian: " + data.message);
        return;
      }

      setExamStarted(true);
      console.log(" Ujian dimulai:", data.data);
    } catch (err) {
      console.error(" Gagal memulai ujian:", err);
      toast.error("Terjadi kesalahan saat memulai ujian.");
    }
  };


  const handleReEnterFromWarning = () => enterFullscreen();

  const handleJawab = (soalId, pilihan) => setJawaban((prev) => ({ ...prev, [soalId]: pilihan }));

  const handleSubmit = useCallback(
    async (isAuto = false) => {
      exitFullscreen();
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${ujian.id}/submit`, {
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
        });
        const data = await res.json();

        if (!data.success) {
          toast.error(" Gagal submit: " + data.message);
          return;
        }

        toast.success(" Ujian berhasil dikumpulkan!");

        //  Redirect ke dashboard setelah submit sukses
        router.push("/dashboard/perawat");

      } catch (err) {
        console.error(" Gagal submit:", err);
        toast.error("Terjadi kesalahan saat mengirim hasil ujian.");
      } finally {
        setLoading(false);
      }
    },
    [ujian, jawaban, exitAttempts, tabSwitchCount, token, exitFullscreen, router]
  );

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && !isSubmitting && examStarted) {
        setExitAttempts((prev) => {
          const newAttempts = prev + 1;
          if (newAttempts === 1) toast.error("Jangan keluar fullscreen! Kembali sekarang.");
          return newAttempts;
        });
        setShowExitWarning(true);

        // Ganti exitAttempts >= 2 jadi pakai ref
        if (exitAttemptsRef.current >= 2) {
          setTimeout(() => {
            if (!isNowFullscreen) {
              toast.error("Terlalu banyak percobaan. Ujian disubmit otomatis!");
              handleSubmit(true);
            }
          }, 3000);
        }
      } else if (isNowFullscreen && showExitWarning) {
        setShowExitWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [isSubmitting, examStarted, isFullscreen, showExitWarning, handleSubmit]);

  // Tab visibility, disable shortcuts (copy dari detail page)
  useEffect(() => {
    if (!examStarted) return;

    // Tab switch
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitting) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 5000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Disable right-click, copy-paste, print, dev tools
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a" || e.key === "p")) e.preventDefault();
    };
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || (e.ctrlKey && e.keyCode === 85)
      ) e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleCopyPaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleCopyPaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examStarted, isSubmitting]);

  // Timer (pause if hidden)
  useEffect(() => {
    if (!examStarted || timeRemaining === null || timeRemaining <= 0) return;
    let timer, paused = false;
    const tick = () => {
      if (paused || document.hidden) return;
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    };
    timer = setInterval(tick, 1000);
    const handleVisibility = () => (paused = document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [timeRemaining, examStarted, handleSubmit]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };



  const getProgressPercentage = () => (soalList.length === 0 ? 0 : (Object.keys(jawaban).length / soalList.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar title="Ujian Perawat (Askom)" />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat ujian...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ujian) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar title="Ujian Perawat (Askom)" />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 mx-auto">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{error || "Belum Ada Ujian Aktif"}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {error ? error : "Silakan tunggu aktivasi dari kepala unit."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Coba Lagi
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Intro screen (trigger di sini!)
  if (!examStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar title={`Ujian: ${ujian.judul}`} />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">{ujian.judul}</h1>
                <p className="text-blue-100">{ujian.deskripsi}</p>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{soalList.length}</div>
                    <div className="text-sm text-gray-600">Soal</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{ujian.durasi || "-"}</div>
                    <div className="text-sm text-gray-600">Menit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">100</div>
                    <div className="text-sm text-gray-600">Nilai maksimal</div>
                  </div>
                </div>

                {/* Perhatian Penting! (Full seperti yang Anda berikan) */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 mb-2">Perhatian Penting!</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Ujian akan berjalan dalam <strong>mode fullscreen</strong></li>
                        <li>• Jangan keluar dari fullscreen atau pindah tab/window</li>
                        <li>• Sistem akan mencatat setiap percobaan keluar</li>
                        <li>• Right-click, copy-paste, dan shortcut keyboard tertentu akan dinonaktifkan</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Petunjuk Pengerjaan (Full 5 poin seperti yang Anda berikan) */}
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Petunjuk Pengerjaan:
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start"><span className="text-blue-600 font-bold mr-2">1.</span><span>Pastikan koneksi internet stabil selama ujian</span></li>
                    <li className="flex items-start"><span className="text-blue-600 font-bold mr-2">2.</span><span>Baca setiap soal dengan teliti sebelum menjawab</span></li>
                    <li className="flex items-start"><span className="text-blue-600 font-bold mr-2">3.</span><span>Anda dapat navigasi antar soal menggunakan nomor soal</span></li>
                    <li className="flex items-start"><span className="text-blue-600 font-bold mr-2">4.</span><span>Klik tombol &quot;Submit&quot; setelah selesai mengerjakan semua soal</span></li>
                    <li className="flex items-start"><span className="text-blue-600 font-bold mr-2">5.</span><span>Waktu akan berjalan otomatis setelah Anda klik &quot;Mulai Ujian&quot;</span></li>
                  </ul>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartExam}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group text-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mulai Ujian (Fullscreen Mode)</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">Dengan klik di atas, Anda setuju mengikuti aturan ujian.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Exam screen (render setelah start)
  const currentSoalData = soalList[currentSoal];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white" ref={examContainerRef}>
      {/* Exit Warning */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center z-[100] animate-pulse">
          <div className="text-center p-8 max-w-md w-full mx-4">
            <svg className="w-24 h-24 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-3xl font-bold text-white mb-4">⚠️ PERINGATAN!</h2>
            <p className="text-xl text-red-200 mb-2">Anda keluar dari mode ujian!</p>
            <p className="text-lg text-red-300 mb-4">Percobaan: {exitAttempts}</p>
            {exitAttempts >= 2 && <p className="text-white mb-6 bg-red-800 p-3 rounded-lg">Ujian akan disubmit otomatis dalam 3 detik...</p>}
            <button
              onClick={handleReEnterFromWarning}
              disabled={isSubmitting || exitAttempts >= 2}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg disabled:bg-gray-600 mb-4 flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Kembali ke Fullscreen
            </button>
            {exitAttempts >= 2 && (
              <button onClick={() => handleSubmit(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Ujian Sekarang
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Warning */}
      {showTabWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-2xl z-[99] animate-bounce">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">PERINGATAN: Perpindahan tab! ({tabSwitchCount}x)</span>
          </div>
        </div>
      )}

      {!isFullscreen && examStarted && !showExitWarning && (
        <div className="fixed top-4 right-4 bg-red-600 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <span className="text-sm font-semibold">Tidak fullscreen!</span>
        </div>
      )}

      {/* Header & Timer */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                {ujian.judul}
              </h1>
              <p className="text-sm text-gray-400">{ujian.deskripsi}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="bg-gray-700 px-3 py-1 rounded">
                  <span className="text-gray-400">Exit: </span><span className="text-yellow-400 font-bold">{exitAttempts}</span>
                </div>
                <div className="bg-gray-700 px-3 py-1 rounded">
                  <span className="text-gray-400">Tab: </span><span className="text-yellow-400 font-bold">{tabSwitchCount}</span>
                </div>
              </div>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? "bg-red-600 animate-pulse" : "bg-blue-600"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress: {Object.keys(jawaban).length} / {soalList.length} soal</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage()}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {soalList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigasi Soal */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-xl p-4 sticky top-32 border border-gray-700">
                <h3 className="font-semibold text-white mb-4">Navigasi Soal</h3>
                <div className="grid grid-cols-5 gap-2">
                  {soalList.map((soal, index) => (
                    <button
                      key={soal.id}
                      onClick={() => setCurrentSoal(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentSoal === index
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-110"
                        : jawaban[soal.id]
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded"></div><span className="text-gray-300">Dijawab</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded"></div><span className="text-gray-300">Aktif</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded"></div><span className="text-gray-300">Belum</span></div>
                </div>
              </div>
            </div>

            {/* Soal Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-white">Soal {currentSoal + 1} dari {soalList.length}</h2>
                  {jawaban[currentSoalData.id] && <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">✓ Terjawab</span>}
                </div>
                <div className="prose prose-invert max-w-none mb-6 text-gray-300" dangerouslySetInnerHTML={{ __html: currentSoalData.pertanyaan }} />
                {currentSoalData.gambar && (
                  <div className="my-4">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${currentSoalData.gambar}`}
                      alt="Gambar soal"
                      width={600}        // sesuaikan ukuran realistis
                      height={400}       // biar aspect ratio stabil
                      className="rounded-lg border shadow-sm object-contain"
                      unoptimized        // tambahkan ini kalau gambar dari luar domain API
                    />
                  </div>
                )}


                <div className="space-y-4">
                  {Array.isArray(currentSoalData.opsi) && currentSoalData.opsi.length > 0 ? (
                    currentSoalData.opsi.map((opsi) => {
                      const isSelected = jawaban[currentSoalData.id] === opsi.kode;
                      return (
                        <button
                          key={opsi.kode}
                          onClick={() => handleJawab(currentSoalData.id, opsi.kode)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-4 ${isSelected
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
                            }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center font-bold text-sm ${isSelected ? "bg-white text-blue-600" : "bg-gray-600 text-white"
                              }`}
                          >
                            {opsi.kode}
                          </div>
                          <div className="flex-1" dangerouslySetInnerHTML={{ __html: opsi.text }} />
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-sm italic">Opsi tidak tersedia.</p>
                  )}
                </div>

              </div>

              {/* Navigation */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentSoal((prev) => Math.max(0, prev - 1))}
                  disabled={currentSoal === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Sebelumnya
                </button>
                <div className="text-gray-400 font-medium">Soal {currentSoal + 1}</div>
                {currentSoal < soalList.length - 1 ? (
                  <button
                    onClick={() => setCurrentSoal((prev) => Math.min(soalList.length - 1, prev + 1))}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Selanjutnya
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:bg-green-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Ujian
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">Tidak ada soal.</div>
        )}
      </main>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full m-4 border border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500 mb-4">
                <svg className="h-8 w-8 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Konfirmasi Submit</h3>
              <p className="text-base text-gray-300 mt-4">Pastikan semua soal dijawab.</p>
              {soalList.length - Object.keys(jawaban).length > 0 && (
                <p className="mt-3 bg-red-900 text-red-200 p-3 rounded-md">
                  <strong>Perhatian:</strong> {soalList.length - Object.keys(jawaban).length} soal belum dijawab.
                </p>
              )}
              <p className="mt-3 text-sm text-gray-400">Exit: {exitAttempts} | Tab: {tabSwitchCount}</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-800 flex items-center gap-2 justify-center"
              >
                {isSubmitting ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div> : null}
                {isSubmitting ? "Menyimpan..." : "Ya, Submit"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-md"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}