"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusActions from "@/components/StatusActions";

export default function PenilaianPage() {
  // Data rubrik penilaian
  const rubrik = useMemo(() => [
    {
      kategori: "A",
      nama: "Makalah/Laporan Kasus",
      bobot: 1,
      items: [
        { no: "A.1", komponen: "Kelengkapan dan Kejelasan isi", nilai: 0 },
        { no: "A.2", komponen: "Sistematika Penulisan", nilai: 0 },
        { no: "A.3", komponen: "Pembahasan, Kesimpulan dan Saran", nilai: 0 }
      ]
    },
    {
      kategori: "BI",
      nama: "Persiapan Presentasi",
      bobot: 0.5,
      items: [
        { no: "BI.1", komponen: "Sistematika Penulisan", nilai: 0 },
        { no: "BI.2", komponen: "Kalimat/Bahasa", nilai: 0 },
        { no: "BI.3", komponen: "Teknik Penulisan", nilai: 0 }
      ]
    },
    {
      kategori: "BII",
      nama: "Pelaksanaan Presentasi",
      bobot: 1,
      items: [
        { no: "BII.1", komponen: "Penggunaan waktu yang ditentukan", nilai: 0 },
        { no: "BII.2", komponen: "Kejelasan Mengemukakan intisari Kasus", nilai: 0 },
        { no: "BII.3", komponen: "Kemampuan Menyajikan", nilai: 0 }
      ]
    },
    {
      kategori: "BIII",
      nama: "Isi Presentasi",
      bobot: 1,
      items: [
        { no: "BIII.1", komponen: "Kelengkapan data", nilai: 0 },
        { no: "BIII.2", komponen: "Ketepatan menentukan diagnosa", nilai: 0 },
        { no: "BIII.3", komponen: "Ketepatan rencana keperawatan/asuhan kebidanan", nilai: 0 },
        { no: "BIII.4", komponen: "Kesesuaian Catatan keperawatan dengan rencana asuhan", nilai: 0 },
        { no: "BIII.5", komponen: "Evaluasi", nilai: 0 }
      ]
    },
    {
      kategori: "BIV",
      nama: "Diskusi",
      bobot: 1.5,
      items: [
        { no: "BIV.1", komponen: "Kejelasan menjawab", nilai: 0 },
        { no: "BIV.2", komponen: "Ketepatan argumentasi", nilai: 0 }
      ]
    }
  ], []);

  const defaultNilaiMatrix = useCallback(() =>
    rubrik.map(k => k.items.map(i => ({ ...i, nilai: 0 })))
    , [rubrik]);

  // State declarations
  const [perawatList, setPerawatList] = useState([]);
  const [selectedNpk, setSelectedNpk] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedNama, setSelectedNama] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [topik, setTopik] = useState("");
  const [tempTanggal, setTempTanggal] = useState("");
  const [tempTopik, setTempTopik] = useState("");
  const [tempNpk, setTempNpk] = useState("");
  const [penilaianId, setPenilaianId] = useState("");
  const [status, setStatus] = useState("draft");
  const [lockedBy, setLockedBy] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [penguji1, setPenguji1] = useState("Belum dinilai");
  const [penguji2, setPenguji2] = useState("Belum dinilai");
  const [penguji1Id, setPenguji1Id] = useState("");
  const [penguji2Id, setPenguji2Id] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State nilai - GUNAKAN function initializer
  const [nilaiPenguji1, setNilaiPenguji1] = useState(() => defaultNilaiMatrix());
  const [nilaiPenguji2, setNilaiPenguji2] = useState(() => defaultNilaiMatrix());

  // ... sisanya tetap sama

  const nilaiOptions = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4];

  // Ambil info user dari token
  // Ambil info user dari token
  // Ambil info user dari token (aman untuk SSR)
  useEffect(() => {
    const getUserInfo = () => {
      try {
        if (typeof window !== "undefined") { // ✅ pastikan hanya jalan di client
          const token = localStorage.getItem("token");
          if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setCurrentUser(payload.userId || payload.npk || "penguji");
          } else {
            setCurrentUser("penguji");
          }
        }
      } catch {
        setCurrentUser("penguji");
      }
    };

    getUserInfo();
    loadMyPenilaian();
  }, []);


  // Fetch list perawat
  useEffect(() => {
    const fetchPerawat = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/only`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) setPerawatList(result.data || []);
      } catch (e) {
        console.error("Error fetch perawat:", e);
      }
    };
    fetchPerawat();
  }, []);


  const resetToDefault = useCallback(() => {
    setPenilaianId("");
    setStatus("draft");
    setLockedBy("");
    setPenguji1("Belum dinilai");
    setPenguji2("Belum dinilai");
    setPenguji1Id("");
    setPenguji2Id("");
    setNilaiPenguji1(defaultNilaiMatrix());
    setNilaiPenguji2(defaultNilaiMatrix());
    setCurrentUserRole("");
  }, [defaultNilaiMatrix]);

  // Load penilaian yang sudah ada
  // GANTI fungsi loadExistingPenilaian yang lama dengan ini:
  const loadExistingPenilaian = useCallback(async () => {
    if (!selectedNpk || !tanggal || !topik) {
      console.warn("Data tidak lengkap, skip load penilaian");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian?npk=${selectedNpk}&tanggal=${tanggal}&topik=${encodeURIComponent(topik)}`;
      console.log("Loading penilaian dengan:", { selectedNpk, tanggal, topik });

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!result.success || !result.data) {
        // Data tidak ditemukan, reset ke default
        console.log("Data penilaian tidak ditemukan, reset ke default");
        resetToDefault();
        return;
      }

      // Data ditemukan, update state
      const data = result.data;
      setPenilaianId(data.id || "");
      setStatus(data.status || "draft");
      setLockedBy(data.locked_by || "");
      setPenguji1(data.penguji1?.username || "Belum dinilai");
      setPenguji2(data.penguji2?.username || "Belum dinilai");

      // PERBAIKAN: Gunakan penguji1_npk dan penguji2_npk (bukan penguji1_id)
      setPenguji1Id(data.penguji1_npk || "");
      setPenguji2Id(data.penguji2_npk || "");

      // ✅ TAMBAHKAN 2 BARIS INI
      setSelectedNama(data.perawat?.username || "");
      setSelectedUnit(data.perawat?.unit || "");

      const defaultMatrix = rubrik.map(k => k.items.map(i => ({ ...i, nilai: 0 })));
      setNilaiPenguji1(data.nilai_penguji1 ? JSON.parse(data.nilai_penguji1) : defaultMatrix);
      setNilaiPenguji2(data.nilai_penguji2 ? JSON.parse(data.nilai_penguji2) : defaultMatrix);

      // Tentukan role user berdasarkan data yang diterima (inline)
      try {
        const tokenInner = localStorage.getItem("token");
        if (!tokenInner) {
          setCurrentUserRole("viewer");
        } else {
          const payload = JSON.parse(atob(tokenInner.split(".")[1] || "{}"));
          const currentUserNpk = payload.userId || payload.npk;
          if (!currentUserNpk) {
            setCurrentUserRole("viewer");
          } else if (data.penguji1_npk === currentUserNpk) {
            setCurrentUserRole("penguji1");
          } else if (data.penguji2_npk === currentUserNpk) {
            setCurrentUserRole("penguji2");
          } else if (!data.penguji1_npk || !data.penguji2_npk) {
            setCurrentUserRole("pending");
          } else {
            setCurrentUserRole("viewer");
          }
        }
      } catch (err) {
        console.error("Error determine user role (inline):", err);
        setCurrentUserRole("viewer");
      }

    } catch (e) {
      console.error("Error load penilaian:", e);
      resetToDefault();
    } finally {
      setIsLoading(false);
    }
  }, [selectedNpk, tanggal, topik, rubrik, resetToDefault]);

  // Tambahkan fungsi ini setelah loadExistingPenilaian
  const loadMyPenilaian = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userNpk = payload.userId || payload.npk;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        // Cari penilaian yang belum final dan user terlibat
        const myPenilaian = result.data.find(p =>
          p.status !== 'final' &&
          (p.penguji1_npk === userNpk || p.penguji2_npk === userNpk)
        );

        if (myPenilaian) {
          // Auto-load data yang sudah ada
          setSelectedNpk(myPenilaian.perawat_npk);
          setTanggal(myPenilaian.tanggal_presentasi);
          setTopik(myPenilaian.topik);
          // Data akan di-load otomatis oleh useEffect
          setSelectedNama(myPenilaian.perawat?.username || "");
          setSelectedUnit(myPenilaian.perawat?.unit || "");
          setPenilaianId(myPenilaian.id || "");
        }
      }
    } catch (e) {
      console.error("Error load my penilaian:", e);
    }
  };

  // Tentukan role user berdasarkan data penilaian
  // GANTI fungsi determineUserRole dengan ini:
  const determineUserRole = (data) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserRole("viewer");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentUserNpk = payload.userId || payload.npk;

      if (!currentUserNpk) {
        setCurrentUserRole("viewer");
        return;
      }

      console.log("Determine role:", {
        currentUserNpk,
        penguji1: data.penguji1_npk,
        penguji2: data.penguji2_npk
      });

      // PERBAIKAN: Gunakan penguji1_npk dan penguji2_npk (bukan _id)
      if (data.penguji1_npk === currentUserNpk) {
        setCurrentUserRole("penguji1");
        console.log("User role: penguji1");
      } else if (data.penguji2_npk === currentUserNpk) {
        setCurrentUserRole("penguji2");
        console.log("User role: penguji2");
      } else {
        // User belum menjadi penguji
        if (!data.penguji1_npk) {
          setCurrentUserRole("pending");
          console.log("User role: pending (bisa jadi Penguji 1)");
        } else if (!data.penguji2_npk) {
          setCurrentUserRole("pending");
          console.log("User role: pending (bisa jadi Penguji 2)");
        } else {
          setCurrentUserRole("viewer");
          console.log("User role: viewer");
        }
      }
    } catch (error) {
      console.error("Error determine user role:", error);
      setCurrentUserRole("viewer");
    }
  };



  // Handle pilih perawat (temporary)
  const handleTempPerawatChange = (e) => {
    const npk = e.target.value;
    const selected = perawatList.find(p => p.npk === npk);
    if (selected) {
      setTempNpk(selected.npk);
    } else {
      setTempNpk("");
    }
  };


  const submitDataPresentasi = async () => {
    if (new Date(tempTanggal) > new Date()) {
      alert("Tanggal presentasi tidak boleh lebih dari hari ini!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const selectedPerawat = perawatList.find(p => p.npk === tempNpk);

      const payload = {
        perawat_npk: tempNpk,
        tanggal_presentasi: tempTanggal,
        topik: tempTopik,
        status: "draft",
        // Tidak perlu kirim penguji1_npk - backend akan auto-assign
      };

      console.log("Submitting data presentasi:", payload);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian`;
      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        console.log("Data presentasi berhasil dibuat:", result.data);
        setPenilaianId(result.data.id);
        setSelectedNpk(tempNpk);
        setTanggal(tempTanggal);
        setTopik(tempTopik);
        setSelectedUnit(selectedPerawat?.unit || "");
        setSelectedNama(selectedPerawat?.username || "");

        // Setelah berhasil, load data yang baru dibuat
        await loadExistingPenilaian();

        alert("Data presentasi berhasil dibuat! Anda otomatis menjadi Penguji 1.");
      } else {
        console.error("Gagal membuat data:", result);
        alert(result.message || "Gagal menyimpan data presentasi");
      }
    } catch (e) {
      console.error("Error submit data presentasi:", e);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pilih role untuk penguji kedua


  // Handle perubahan nilai
  const handleNilaiChange = (kategoriIndex, itemIndex, nilai, penguji) => {
    if (!canEdit(penguji)) return;

    const newNilai = parseFloat(nilai);
    if (Number.isNaN(newNilai)) return;

    if (penguji === 1) {
      setNilaiPenguji1(prev => {
        const copy = prev.map(row => [...row]);
        if (copy[kategoriIndex]?.[itemIndex]) {
          copy[kategoriIndex][itemIndex] = {
            ...copy[kategoriIndex][itemIndex],
            nilai: newNilai
          };
        }
        return copy;
      });
    } else {
      setNilaiPenguji2(prev => {
        const copy = prev.map(row => [...row]);
        if (copy[kategoriIndex]?.[itemIndex]) {
          copy[kategoriIndex][itemIndex] = {
            ...copy[kategoriIndex][itemIndex],
            nilai: newNilai
          };
        }
        return copy;
      });
    }
  };

  // Perhitungan nilai
  const hitungNilaiKategori = (kategoriIndex, penguji) => {
    const nilaiData = (penguji === 1 ? nilaiPenguji1 : nilaiPenguji2)[kategoriIndex] || [];
    const kategori = rubrik[kategoriIndex];
    const total = nilaiData.reduce((s, it) => s + (it?.nilai || 0), 0);
    const rata = nilaiData.length ? total / nilaiData.length : 0;
    return rata * kategori.bobot;
  };

  const hitungTotalPenguji = (penguji) => {
    const A = hitungNilaiKategori(0, penguji);
    const BI = hitungNilaiKategori(1, penguji);
    const BII = hitungNilaiKategori(2, penguji);
    const BIII = hitungNilaiKategori(3, penguji);
    const BIV = hitungNilaiKategori(4, penguji);
    const B = (BI + BII + BIII + BIV) / 4;
    return Math.min(4, (0.2 * A) + (0.8 * B));
  };

  const total1 = hitungTotalPenguji(1);
  const total2 = hitungTotalPenguji(2);
  const nilaiFinal = Math.min(4, (total1 + total2) / 2);

  const getGrade = (n) => (n >= 3.6 ? "A" : n >= 2.8 ? "B" : n >= 2.0 ? "C" : "D");

  // Submit penilaian
  // UPDATE fungsi submitPenilaian:
  const submitPenilaian = async (pengujiNumber) => {
    if (!selectedNpk || !tanggal || !topik) {
      alert("Harap lengkapi data presentasi terlebih dahulu!");
      return;
    }

    if (!canEdit(pengujiNumber)) {
      alert("Form ini sedang terkunci untuk peran Anda atau sudah disubmit.");
      return;
    }

    // Validasi: pastikan ada nilai yang diisi
    const nilaiData = pengujiNumber === 1 ? nilaiPenguji1 : nilaiPenguji2;
    const hasValue = nilaiData.some(kategori =>
      kategori.some(item => item.nilai > 0)
    );

    if (!hasValue) {
      alert("Harap isi minimal satu nilai sebelum menyimpan!");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const freshTotal = hitungTotalPenguji(pengujiNumber);
      const newStatus = pengujiNumber === 1 ? "penguji1_selesai" : "penguji2_selesai";

      const payload = {
        perawat_npk: selectedNpk,
        tanggal_presentasi: tanggal,
        topik,
        [`nilai_penguji${pengujiNumber}`]: JSON.stringify(nilaiData),
        [`total_penguji${pengujiNumber}`]: freshTotal,
        status: newStatus,
        locked_by: currentUser
      };


      console.log(`Submitting penilaian penguji ${pengujiNumber}:`, payload);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${penilaianId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan penilaian");
        return;
      }

      setStatus(newStatus);
      setLockedBy(currentUser);

      alert(`Penilaian Penguji ${pengujiNumber} berhasil disimpan!`);
      await loadExistingPenilaian();

    } catch (e) {
      console.error("Error submitting penilaian:", e);
      alert("Gagal menyimpan penilaian! Periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalisasi penilaian
  const finalizePenilaian = async () => {
    if (status !== "penguji2_selesai") {
      alert("Kedua penguji harus menyelesaikan penilaian terlebih dahulu!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${penilaianId}/finalize`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nilai_final: nilaiFinal,
          grade: getGrade(nilaiFinal)
        }),
      });

      const result = await res.json();
      if (result.success) {
        setStatus("final");
        alert("Penilaian berhasil difinalisasi!");
        await loadExistingPenilaian();
      } else {
        alert(result.message || "Gagal memfinalisasi penilaian");
      }
    } catch (e) {
      console.error("Error finalizing penilaian:", e);
      alert("Gagal memfinalisasi penilaian!");
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-100";
      case "B": return "text-blue-600 bg-blue-100";
      case "C": return "text-yellow-600 bg-yellow-100";
      case "D": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };


  // TAMBAHKAN fungsi ini:
  // UPDATE fungsi handleNilaiChangeWithAutoAssign:
  const handleNilaiChangeWithAutoAssign = async (kategoriIndex, itemIndex, nilai, penguji) => {
    // Jika user status "pending", coba auto-assign dulu
    if (currentUserRole === "pending") {
      console.log("Trigger auto-assign for pending user...");
      await triggerAutoAssign();
      // Setelah auto-assign, tunggu sebentar untuk load data baru
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Lanjutkan dengan perubahan nilai
    handleNilaiChange(kategoriIndex, itemIndex, nilai, penguji);
  };

  // TAMBAHKAN fungsi untuk trigger auto-assign
  const triggerAutoAssign = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        perawat_npk: selectedNpk,
        tanggal_presentasi: tanggal,
        topik: topik,
        // Data kosong, hanya untuk trigger auto-assign
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${penilaianId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        // Reload data untuk mendapatkan role yang baru
        await loadExistingPenilaian();
      }
    } catch (error) {
      console.error("Error trigger auto-assign:", error);
    }
  };

  // UPDATE fungsi canEdit untuk lebih robust:
  const canEdit = (pengujiNumber) => {
    // Tidak bisa edit jika status final
    if (status === "final") return false;

    // Jika user belum memiliki role (masih loading)
    if (!currentUserRole) return false;

    // Jika status pending, user bisa edit form yang sesuai dengan slot kosong
    if (currentUserRole === "pending") {
      if (pengujiNumber === 1 && !penguji1Id) return true;
      if (pengujiNumber === 2 && !penguji2Id) return true;
      return false;
    }

    // User hanya bisa edit jika role-nya sesuai
    if (pengujiNumber === 1 && currentUserRole !== "penguji1") return false;
    if (pengujiNumber === 2 && currentUserRole !== "penguji2") return false;

    // Validasi status untuk mencegah edit setelah submit
    if (pengujiNumber === 1 && status === "penguji1_selesai") return false;
    if (pengujiNumber === 2 && status === "penguji2_selesai") return false;


    return true;
  };

  // Di dalam PenilaianPage
  useEffect(() => {
    const saveDraft = async () => {
      if (!tempNpk || !tempTanggal || !tempTopik) {
        console.warn("Data tidak lengkap, skip save draft");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const payload = {
          perawat_npk: tempNpk,
          tanggal_presentasi: tempTanggal,
          topik: tempTopik,
          status: "draft",
        };
        const url = penilaianId
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${penilaianId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian`;
        const method = penilaianId ? "PUT" : "POST";

        console.log("Saving draft:", payload); // Debug
        const res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (result.success) {
          setPenilaianId(result.data.id);
        } else {
          console.error("Gagal simpan draft:", result.message);
        }
      } catch (e) {
        console.error("Error simpan draft:", e);
      }
    };

    const timer = setTimeout(() => {
      saveDraft();
    }, 500);

    return () => clearTimeout(timer);
  }, [tempNpk, tempTanggal, tempTopik, penilaianId]);

  // Auto load ketika data lengkap
  useEffect(() => {
    if (selectedNpk && tanggal && topik) {
      loadExistingPenilaian();
    }
  }, [selectedNpk, tanggal, topik, loadExistingPenilaian]);

  // Cek apakah perlu menampilkan modal pilihan role


  // Fungsi untuk mendapatkan nilai dengan safe access
  const getNilai = (penguji, kategoriIndex, itemIndex) => {
    const data = penguji === 1 ? nilaiPenguji1 : nilaiPenguji2;
    return data?.[kategoriIndex]?.[itemIndex]?.nilai || 0;
  };

  // Render modal pilihan role


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data penilaian...</p>
          <p className="text-sm text-gray-500 mt-2">Silakan tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar title="Form Penilaian Presentasi" />



      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Penilaian Presentasi</h1>
            <p className="text-gray-600 text-lg">Sistem Penilaian Makalah dan Presentasi Keperawatan</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Data Presentasi */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Presentasi</h2>

            {!selectedNpk ? (
              // Form input data presentasi (untuk pengguna pertama)
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Presentasi</label>
                    <input
                      type="date"
                      value={tempTanggal}
                      onChange={(e) => setTempTanggal(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Topik</label>
                    <input
                      type="text"
                      value={tempTopik}
                      onChange={(e) => setTempTopik(e.target.value)}
                      placeholder="Topik presentasi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Perawat</label>
                    <select
                      value={tempNpk}
                      onChange={handleTempPerawatChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Pilih Perawat</option>
                      {perawatList.map((p) => (
                        <option key={p.npk} value={p.npk}>{p.username}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitDataPresentasi}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Data Presentasi"}
                  </button>
                </div>
              </div>
            ) : (
              // Tampilan data presentasi yang sudah disimpan
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Presentasi</label>
                    <input
                      type="text"
                      value={tanggal}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Topik</label>
                    <input
                      type="text"
                      value={topik}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Perawat</label>
                    <input
                      type="text"
                      value={selectedNama}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NPK</label>
                    <input
                      type="text"
                      value={selectedNpk}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Kerja</label>
                    <input
                      type="text"
                      value={selectedUnit}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peran Anda</label>
                    <input
                      type="text"
                      value={currentUserRole === "penguji1" ? "Penguji 1" : currentUserRole === "penguji2" ? "Penguji 2" : "Peninjau"}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hanya tampilkan form penilaian jika data presentasi sudah disimpan */}
          {selectedNpk && (
            <>
              {/* Komponen Penilaian */}
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Komponen Penilaian</h2>
                  <div className="space-y-6">
                    {rubrik.map((kategori, kategoriIndex) => (
                      <div key={kategoriIndex} className="bg-gray-50 rounded-xl p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {kategori.kategori}. {kategori.nama}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Bobot: {kategori.bobot}
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-600 to-gray-700">
                                <th className="p-3 text-left text-white font-semibold text-sm">No</th>
                                <th className="p-3 text-left text-white font-semibold text-sm">Komponen Penilaian</th>
                                <th className="p-3 text-center text-white font-semibold text-sm">Penguji 1</th>
                                <th className="p-3 text-center text-white font-semibold text-sm">Penguji 2</th>
                              </tr>
                            </thead>
                            <tbody>
                              {kategori.items.map((item, itemIndex) => (
                                <tr key={`${kategoriIndex}-${itemIndex}`} className={`${itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                  <td className="p-3 font-medium text-gray-900 text-sm">{item.no}</td>
                                  <td className="p-3 font-medium text-gray-900 text-sm">{item.komponen}</td>
                                  <td className="p-3 text-center">
                                    <select
                                      value={getNilai(1, kategoriIndex, itemIndex)}
                                      onChange={(e) => handleNilaiChange(kategoriIndex, itemIndex, e.target.value, 1)}
                                      disabled={!canEdit(1)}
                                      className="w-20 h-10 border-2 border-gray-300 rounded-lg text-center text-gray-900 font-medium focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                      {nilaiOptions.map(nilai => (
                                        <option key={nilai} value={nilai}>{nilai}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3 text-center">
                                    <select
                                      value={getNilai(2, kategoriIndex, itemIndex)}
                                      onChange={(e) => handleNilaiChangeWithAutoAssign(kategoriIndex, itemIndex, e.target.value, 2)}
                                      disabled={!canEdit(2)}
                                      className="w-20 h-10 border-2 border-gray-300 rounded-lg text-center text-gray-900 font-medium focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                      {nilaiOptions.map(nilai => (
                                        <option key={nilai} value={nilai}>{nilai}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detail Perhitungan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {[1, 2].map(penguji => (
                  <div key={penguji} className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Detail Perhitungan Penguji {penguji}</h3>
                    <div className="space-y-3">
                      {rubrik.map((kategori, idx) => {
                        const nilaiKategori = hitungNilaiKategori(idx, penguji);
                        return (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">{kategori.kategori}. {kategori.nama}</span>
                            <span className="font-semibold text-gray-900">{nilaiKategori.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                        <span className="font-medium text-gray-900">Total Penguji {penguji}</span>
                        <span className="text-xl font-bold text-blue-600">{(penguji === 1 ? total1 : total2).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hasil Akhir */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Hasil Penilaian</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 text-center">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Penguji 1</h3>
                    <p className="text-3xl font-bold text-gray-900">{total1.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 text-center">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Penguji 2</h3>
                    <p className="text-3xl font-bold text-gray-900">{total2.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 text-center">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Akhir</h3>
                    <p className="text-3xl font-bold text-gray-900">{nilaiFinal.toFixed(2)}</p>
                    <div className="mt-2">
                      <span className={`text-lg font-bold px-3 py-1 rounded-lg ${getGradeColor(getGrade(nilaiFinal))}`}>
                        Grade {getGrade(nilaiFinal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <StatusActions
                lockedBy={lockedBy}
                currentUser={currentUser}
                status={status}
                canEdit={canEdit}
                submitPenilaian={submitPenilaian}
                finalizePenilaian={finalizePenilaian}
                currentUserRole={currentUserRole}
              />

              {/* Di bagian Informasi Penguji - GANTI dengan ini: */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penguji</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penguji 1</label>
                    <input
                      type="text"
                      value={penguji1}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                    {currentUserRole === "penguji1" && (
                      <span className="text-sm text-green-600 font-medium">✓ Anda</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penguji 2</label>
                    <input
                      type="text"
                      value={penguji2}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                    {currentUserRole === "penguji2" && (
                      <span className="text-sm text-green-600 font-medium">✓ Anda</span>
                    )}
                  </div>
                </div>

                {/* Di bagian Informasi Penguji - UPDATE status text: */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Status Anda:</strong>{" "}
                    {currentUserRole === "penguji1" && "Penguji 1 - Isi form penilaian bagian kiri"}
                    {currentUserRole === "penguji2" && "Penguji 2 - Isi form penilaian bagian kanan"}
                    {currentUserRole === "pending" && "Menunggu penugasan - Silakan mulai mengisi form, Anda akan otomatis diassign sebagai penguji"}
                    {currentUserRole === "viewer" && "Peninjau - Hanya dapat melihat penilaian"}
                    {!currentUserRole && "Memuat..."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}