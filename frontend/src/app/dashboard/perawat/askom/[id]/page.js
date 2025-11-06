"use client";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

// Placeholder components to resolve import errors
const Navbar = ({ title }) => (
  <nav className="bg-white shadow-md p-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
    </div>
  </nav>
);

export default function UjianDetailPage() {
  const [id, setId] = useState(null);
  const [ujian, setUjian] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSoal, setCurrentSoal] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-cheat states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false); // Ini yang langsung pop saat ESC
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const examContainerRef = useRef(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Get ID from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const examId = pathParts[pathParts.length - 1];
      if (examId) {
        setId(examId);
      }
    }
  }, []);



  // Enter fullscreen - MUST be called from user interaction
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowExitWarning(false); // Tutup warning kalau sukses
      return true;
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(" Gagal masuk mode fullscreen. Pastikan Anda mengizinkan di browser.");
      return false;
    }
  };

  // Tambahkan ini setelah state declarations
  useEffect(() => {
    const updateFullscreenStyles = () => {
      const root = document.documentElement;
      const body = document.body;

      if (isFullscreen) {
        // Force background terang saat fullscreen
        root.style.backgroundColor = '#f9fafb'; // Equivalent ke bg-gray-50
        body.style.backgroundColor = '#f9fafb';
        root.style.color = '#111827'; // Teks gelap (text-gray-900)

        // Optional: Hapus margin/padding default
        root.style.margin = '0';
        root.style.padding = '0';
        body.style.margin = '0';
        body.style.padding = '0';

        // Kalau pakai dark mode, force light mode
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.remove('dark');
          body.classList.remove('dark');
        }
      } else {
        // Reset saat keluar fullscreen (biar nggak permanen)
        root.style.backgroundColor = '';
        body.style.backgroundColor = '';
        root.style.color = '';
        root.style.margin = '';
        root.style.padding = '';
        body.style.margin = '';
        body.style.padding = '';
      }
    };

    // Panggil fungsi ini pas fullscreen berubah
    if (typeof window !== 'undefined') {
      updateFullscreenStyles();
    }

    // Listener untuk perubahan fullscreen (udah ada di kode, tapi tambah call fungsi)
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
      updateFullscreenStyles(); // Tambah ini!

      // ... (sisa kode handleFullscreenChange yang udah ada)
    };

    // Update listener yang udah ada (ganti yang lama dengan ini)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen]); // Dependency ke isFullscreen biar reactive

  // Exit fullscreen (only for submit)
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  // Handle start exam button - user interaction triggers fullscreen
  const handleStartExam = async () => {
    const success = await enterFullscreen();
    if (success) {
      setExamStarted(true);
    }
  };

  // Handle re-enter from warning overlay
  const handleReEnterFromWarning = () => {
    enterFullscreen();
  };

  // Fullscreen change handler - IMMEDIATE warning on exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isNowFullscreen);

      // Langsung trigger warning kalau keluar fullscreen (tanpa submit & exam started)
      if (!isNowFullscreen && !isSubmitting && examStarted) {
        setExitAttempts((prev) => {
          const newAttempts = prev + 1;
          
          if (newAttempts === 1) {
            toast.error("⚠️ Jangan keluar dari fullscreen! Ujian sedang berlangsung. Kembali sekarang.");
          }
          return newAttempts;
        });
        setShowExitWarning(true); // Muncul IMMEDIATE overlay dengan tombol re-enter

        // Auto-submit kalau terlalu banyak attempt
        if (exitAttempts >= 3) { // Ubah ke 2 biar lebih ketat, atau sesuaikan
          setTimeout(() => {
            if (!isFullscreen) {
              toast.error(" Terlalu banyak percobaan keluar. Ujian disubmit otomatis!");
              handleSubmit(true);
            }
          }, 3000);
        }
      } else if (isNowFullscreen && showExitWarning) {
        // Tutup warning kalau balik fullscreen (tapi gak trigger lagi)
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
  }, [isSubmitting, examStarted, exitAttempts, handleSubmit, isFullscreen, showExitWarning]); // Dependencies biar reactive

  // Tab visibility detection - only when exam started
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitting) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);

        setTimeout(() => {
          setShowTabWarning(false);
        }, 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSubmitting, examStarted]);

  // Disable right-click, copy-paste, print - only when exam started
  useEffect(() => {
    if (!examStarted) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCopyPaste = (e) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a")) {
        e.preventDefault();
        return false;
      }
    };

    const handlePrint = (e) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleCopyPaste);
    document.addEventListener("keydown", handlePrint);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleCopyPaste);
      document.removeEventListener("keydown", handlePrint);
    };
  }, [examStarted]);

  // Disable dev tools shortcuts - only when exam started
  useEffect(() => {
    if (!examStarted) return;

    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examStarted]);

  // Fetch ujian data
  useEffect(() => {
    const fetchUjian = async () => {
      try {
        if (!token) {
          window.location.href = "/login"; // Redirect jika no token
          return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUjian(data.data);
          setSoalList(data.data.batchSoal?.soals || []);
          if (data.data.durasi) {
            setTimeRemaining(data.data.durasi * 60);
          }
        } else {
          toast.error(" Ujian tidak ditemukan atau akses ditolak.");
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.error(" Gagal ambil detail ujian:", err);
        toast.error("Terjadi kesalahan koneksi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchUjian();
  }, [id, token]);

  // Timer countdown - pause if tab hidden for fairness
  useEffect(() => {
    if (!examStarted || timeRemaining === null || timeRemaining <= 0) return;

    let timer;
    let paused = false;

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

    // Pause/resume on visibility change
    const handleVisibility = () => {
      paused = document.hidden;
    };
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

  const handleJawab = (soalId, pilihan) => {
    setJawaban((prev) => ({ ...prev, [soalId]: pilihan }));
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    setShowExitWarning(false); // Tutup warning

    // Exit fullscreen on submit
    exitFullscreen();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}/submit`, {
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
      if (data.success) {
        toast.success(autoSubmit ? " Waktu habis! Ujian otomatis disubmit." : " Ujian berhasil disubmit!");
        window.location.href = "/dashboard";
      } else {
        toast.error(" Gagal submit ujian: " + data.message);
      }
    } catch (err) {
      console.error(" Error submit ujian:", err);
      toast.error("Terjadi kesalahan saat submit ujian.");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, token, jawaban, exitAttempts, tabSwitchCount]);

  const getProgressPercentage = () => {
    if (soalList.length === 0) return 0;
    return (Object.keys(jawaban).length / soalList.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat ujian...</p>
        </div>
      </div>
    );
  }

  if (!ujian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Ujian tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  // Intro screen sebelum start ujian

  const currentSoalData = soalList[currentSoal];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900" ref={examContainerRef}>
      {/* Exit Warning Overlay - SEKARANG DENGAN TOMBOL RE-ENTER DI DALAMNYA */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-red-50 flex items-center justify-center z-[100] animate-pulse">
          <div className="text-center p-8 max-w-md w-full mx-4">
            <svg className="w-24 h-24 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-3xl font-bold text-red-900 mb-4">⚠️ PERINGATAN!</h2>
            <p className="text-xl text-red-800 mb-2">Anda keluar dari mode ujian!</p>
            <p className="text-lg text-red-700 mb-4">Percobaan keluar: {exitAttempts}</p>
            {exitAttempts >= 2 && <p className="text-red-900 mb-6 bg-red-200 p-3 rounded-lg">⚠️ Terlalu sering! Ujian akan disubmit otomatis dalam 3 detik...</p>}

            {/* Tombol Re-Enter - Ini yang bikin user gesture */}
            <button
              onClick={handleReEnterFromWarning}
              disabled={isSubmitting || exitAttempts >= 2}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2 mx-auto"
              aria-label="Kembali ke mode fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Kembali ke Fullscreen</span>
            </button>

            {/* Kalau terlalu banyak, tombol submit */}
            {exitAttempts >= 2 && (
              <button
                onClick={() => handleSubmit(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit Ujian Sekarang</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Switch Warning */}
      {showTabWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-2xl z-[99] animate-bounce">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">PERINGATAN: Terdeteksi perpindahan tab/window! ({tabSwitchCount}x)</span>
          </div>
        </div>
      )}

      {/* Fullscreen Status Indicator - Hanya kalau gak ada warning */}
      {!isFullscreen && examStarted && !showExitWarning && (
        <div className="fixed top-4 right-4 bg-red-600 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold text-white">Tidak dalam mode fullscreen!</span>
          </div>
        </div>
      )}

      {/* Header Info & Timer */}
      <div className="bg-white border-b border-gray-200 shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                {ujian.judul}
              </h1>
              <p className="text-sm text-gray-600">{ujian.deskripsi}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Anti-cheat indicators */}
              <div className="flex items-center gap-3 text-xs">
                <div className="bg-gray-100 px-3 py-1 rounded border border-gray-300">
                  <span className="text-gray-600">Exit: </span>
                  <span className="text-yellow-600 font-bold">{exitAttempts}</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded border border-gray-300">
                  <span className="text-gray-600">Tab: </span>
                  <span className="text-yellow-600 font-bold">{tabSwitchCount}</span>
                </div>
              </div>

              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-blue-600 text-white"
                    }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-mono font-bold text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Progress: {Object.keys(jawaban).length} / {soalList.length} soal
              </span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>


      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {soalList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Nomor Soal Navigator */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-4 sticky top-32 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Navigasi Soal</h3>
                <div className="grid grid-cols-5 gap-2">
                  {soalList.map((soal, index) => (
                    <button
                      key={soal.id}
                      onClick={() => setCurrentSoal(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentSoal === index
                          ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-110"
                          : jawaban[soal.id]
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      aria-label={`Pindah ke soal ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-gray-600">Sudah dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Soal aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Belum dijawab</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Soal Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Soal {currentSoal + 1} dari {soalList.length}</h2>
                  {jawaban[currentSoalData.id] && (
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">✓ Terjawab</span>
                  )}
                </div>

                <div className="prose max-w-none mb-6 text-gray-800" dangerouslySetInnerHTML={{ __html: currentSoalData.pertanyaan }} />

                <div className="space-y-4">
                  {["A", "B", "C", "D", "E"].map((pilihan) => {
                    const optionKey = `pilihan_${pilihan.toLowerCase()}`;
                    const optionText = currentSoalData[optionKey];
                    if (!optionText) return null;

                    const isSelected = jawaban[currentSoalData.id] === pilihan;

                    return (
                      <button
                        key={pilihan}
                        onClick={() => handleJawab(currentSoalData.id, pilihan)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-4 ${isSelected
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                            : "bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400 text-gray-900"
                          }`}
                        aria-label={`Pilih jawaban ${pilihan}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center font-bold text-sm ${isSelected ? "bg-white text-blue-600" : "bg-gray-300 text-gray-900"
                          }`}>
                          {pilihan}
                        </div>
                        <div className="flex-1" dangerouslySetInnerHTML={{ __html: optionText }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation and Submit */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentSoal((prev) => Math.max(0, prev - 1))}
                  disabled={currentSoal === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-white disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                  aria-label="Soal sebelumnya"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Sebelumnya</span>
                </button>

                <div className="text-gray-600 font-medium">Soal {currentSoal + 1}</div>

                {currentSoal < soalList.length - 1 ? (
                  <button
                    onClick={() => setCurrentSoal((prev) => Math.min(soalList.length - 1, prev + 1))}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                    aria-label="Soal selanjutnya"
                  >
                    <span>Selanjutnya</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-green-800 disabled:cursor-wait"
                    aria-label="Submit ujian"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Submit Ujian</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <p>Tidak ada soal dalam ujian ini.</p>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4 border border-gray-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900">Konfirmasi Submit Ujian</h3>
              <div className="mt-4">
                <p className="text-base text-gray-700">Anda akan menyelesaikan ujian ini. Pastikan semua soal telah dijawab dengan benar.</p>
                {soalList.length - Object.keys(jawaban).length > 0 && (
                  <p className="mt-3 bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
                    <strong>Perhatian:</strong> Masih ada <strong>{soalList.length - Object.keys(jawaban).length} soal</strong> yang belum Anda jawab.
                  </p>
                )}
                <p className="mt-3 text-sm text-gray-500">Exit attempts: {exitAttempts} | Tab switches: {tabSwitchCount}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:bg-blue-800 disabled:cursor-wait items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Ya, Submit Sekarang"
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}