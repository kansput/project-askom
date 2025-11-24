"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusActions from "@/components/StatusActions";
import { toast } from "react-hot-toast";

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
  const [tempNama, setTempNama] = useState("");

  // State nilai - TETAP
  const [nilaiPenguji1, setNilaiPenguji1] = useState(() => defaultNilaiMatrix());
  const [nilaiPenguji2, setNilaiPenguji2] = useState(() => defaultNilaiMatrix());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //  STATE BARU YANG MENGGANTIKAN YANG LAMA:
  const [userRole, setUserRole] = useState(null); // 'penguji1', 'penguji2', atau null
  const [penilaianData, setPenilaianData] = useState(null); // Menyimpan semua data penilaian
  const [currentUserNpk, setCurrentUserNpk] = useState(null);

  // ... sisanya tetap sama

  const nilaiOptions = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4];


  const loadPenilaian = useCallback(async () => {
    if (!selectedNpk || !tanggal || !topik || !currentUserNpk) {
      console.warn("Data tidak lengkap atau user belum teridentifikasi, skip load penilaian");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian?npk=${selectedNpk}&tanggal=${tanggal}&topik=${encodeURIComponent(topik)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (!result.success || !result.data) {
        setPenilaianData(null);
        setUserRole(null);
        setNilaiPenguji1(defaultNilaiMatrix());
        setNilaiPenguji2(defaultNilaiMatrix());
        return;
      }

      const data = result.data;
      setPenilaianData(data);
      setPenilaianId(data.id);

      if (data.nilai_penguji1) {
        setNilaiPenguji1(JSON.parse(data.nilai_penguji1));
      }
      if (data.nilai_penguji2) {
        setNilaiPenguji2(JSON.parse(data.nilai_penguji2));
      }

      // 🔥 PINDAHKAN juga logika determineUserRole ke sini
      if (!currentUserNpk || !data) {
        setUserRole(null);
      } else {
        const penguji1Npk = data.penguji1_npk?.toString().trim();
        const penguji2Npk = data.penguji2_npk?.toString().trim();
        const currentNpk = currentUserNpk.toString().trim();

        if (penguji1Npk === currentNpk) {
          setUserRole('penguji1');
        } else if (penguji2Npk === currentNpk) {
          setUserRole('penguji2');
        } else {
          setUserRole(null);
        }
      }

    } catch (error) {
      console.error("Error load penilaian:", error);
      setPenilaianData(null);
      setUserRole(null);
      setNilaiPenguji1(defaultNilaiMatrix());
      setNilaiPenguji2(defaultNilaiMatrix());
    } finally {
      setIsLoading(false);
    }
  }, [selectedNpk, tanggal, topik, currentUserNpk, defaultNilaiMatrix]); //  TAMBAHKAN INI

  // 🔥 PANGGIL fungsi yang sudah dipindahkan


  useEffect(() => {
    // Pastikan kode hanya berjalan di client
    if (typeof window === "undefined") return;

    const getUserInfo = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const npk = payload.userId || payload.npk;
          setCurrentUserNpk(npk || null);
        } else {
          setCurrentUserNpk(null);
        }
      } catch {
        setCurrentUserNpk(null);
      }
    };

    getUserInfo();
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



  const [penilaianId, setPenilaianId] = useState("");

  const submitDataPresentasi = async () => {
    if (!tempTanggal || !tempTopik || !tempNama) {
      toast.error("Harap lengkapi semua field!");
      return;
    }

    const today = new Date();
    const selectedDate = new Date(tempTanggal);
    if (selectedDate > today) {
      toast.error("Tanggal presentasi tidak boleh lebih dari hari ini!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const selectedPerawat = perawatList.find(p =>
        p.username.toLowerCase().includes(tempNama.toLowerCase())
      );

      if (!selectedPerawat) {
        toast.error("Perawat tidak ditemukan! Pastikan nama yang diketik benar.");
        return;
      }

      const payload = {
        perawat_npk: selectedPerawat.npk,
        tanggal_presentasi: tempTanggal,
        topik: tempTopik,
        status: "draft",
      };

      console.log("Submitting data presentasi:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian`, {
        method: "POST",
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
        setSelectedNpk(selectedPerawat.npk);
        setTanggal(tempTanggal);
        setTopik(tempTopik);
        setSelectedUnit(selectedPerawat?.unit || "");
        setSelectedNama(selectedPerawat?.username || "");



        toast.success("Data presentasi berhasil dibuat!");
        loadPenilaian();
      } else {
        console.error("Gagal membuat data:", result);
        toast.error(result.message || "Gagal menyimpan data presentasi");
      }
    } catch (e) {
      console.error("Error submit data presentasi:", e);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pilih role untuk penguji kedua


  // Handle perubahan nilai
  const handleNilaiChange = (kategoriIndex, itemIndex, nilai, penguji) => {
    if (!canEdit(penguji)) return;

    const newNilai = parseFloat(nilai);
    if (isNaN(newNilai) || newNilai < 0 || newNilai > 4) {
      console.warn("Nilai tidak valid:", nilai);
      return;
    }

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

  const submitPenilaian = async (pengujiNumber) => {
    if (!canEdit(pengujiNumber)) {
      toast.error("Anda tidak dapat mengedit form ini");
      return;
    }

    const nilaiData = pengujiNumber === 1 ? nilaiPenguji1 : nilaiPenguji2;
    const hasValue = nilaiData.some(kategori =>
      kategori.some(item => item.nilai > 0)
    );

    if (!hasValue) {
      toast.error("Harap isi minimal satu nilai sebelum menyimpan!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const total = hitungTotalPenguji(pengujiNumber);

      const payload = {
        perawat_npk: selectedNpk,
        tanggal_presentasi: tanggal,
        topik: topik,
        [`nilai_penguji${pengujiNumber}`]: JSON.stringify(nilaiData),
        [`total_penguji${pengujiNumber}`]: total,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${penilaianId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        console.log("Response dari backend:", result);
        toast.success(`Penilaian Penguji ${pengujiNumber} berhasil disimpan!`);

        //  UPDATE STATE DENGAN DATA TERBARU
        setPenilaianData(result.data);

        //  REFRESH DATA UNTUK SINKRONISASI LENGKAP
        await loadPenilaian();

      } else {
        toast.error(result.message || "Gagal menyimpan penilaian");
      }
    } catch (error) {
      console.error("Error submitting penilaian:", error);
      toast.error("Gagal menyimpan penilaian!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalisasi penilaian
  const finalizePenilaian = async () => {
    if (penilaianData?.status !== "penguji2_selesai") {
      toast.error("Kedua penguji harus menyelesaikan penilaian terlebih dahulu!");
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
        toast.success("Penilaian berhasil difinalisasi!");

        setPenilaianData(result.data);
        await loadPenilaian();

      } else {
        toast.error(result.message || "Gagal memfinalisasi penilaian");
      }
    } catch (error) {
      console.error("Error finalizing penilaian:", error);
      toast.error("Gagal memfinalisasi penilaian!");
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


  // Fungsi canEdit yang disederhanakan
  const canEdit = (pengujiNumber) => {
    if (!penilaianData) return false;
    if (penilaianData.status === 'final') return false;

    // User hanya bisa edit jika role-nya sesuai DAN status masih memungkinkan
    if (pengujiNumber === 1) {
      return userRole === 'penguji1' && penilaianData.status === 'draft';
    }
    if (pengujiNumber === 2) {
      // Penguji 2 bisa edit selama status masih draft ATAU penguji1_selesai
      return userRole === 'penguji2' &&
        (penilaianData.status === 'draft' || penilaianData.status === 'penguji1_selesai');
    }

    return false;
  };

  // Di dalam PenilaianPage




  useEffect(() => {
    if (selectedNpk && tanggal && topik && currentUserNpk) {
      loadPenilaian();
    }
  }, [selectedNpk, tanggal, topik, currentUserNpk, loadPenilaian]);

  // Cek apakah perlu menampilkan modal pilihan role


  // Fungsi untuk mendapatkan nilai dengan safe access
  const getNilai = (penguji, kategoriIndex, itemIndex) => {
    const data = penguji === 1 ? nilaiPenguji1 : nilaiPenguji2;
    return data?.[kategoriIndex]?.[itemIndex]?.nilai || 0;
  };




  if (isLoading || currentUserNpk === null) {
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
                    <Select
                      options={perawatList.map((p) => ({
                        value: p.npk,
                        label: p.username
                      }))}
                      onChange={(option) => {
                        if (option) {
                          setTempNama(option.label); // Simpan nama yang dipilih
                        } else {
                          setTempNama(""); // Reset jika dikosongkan
                        }
                      }}
                      placeholder="Ketik nama perawat..."
                      isSearchable
                      className="text-gray-900"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          padding: '4px',
                          borderRadius: '0.5rem',
                          borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
                          boxShadow: state.isFocused ? '0 0 0 2px #93C5FD' : 'none',
                          '&:hover': { borderColor: '#3B82F6' },
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? '#3B82F6'
                            : state.isFocused
                              ? '#DBEAFE'
                              : 'white',
                          color: state.isSelected ? 'white' : '#111827',
                        }),
                      }}
                    />
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
                      value={
                        userRole === "penguji1" ? "Penguji 1" :
                          userRole === "penguji2" ? "Penguji 2" :
                            "Belum Ditugaskan"
                      }
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
                                      onChange={(e) => handleNilaiChange(kategoriIndex, itemIndex, e.target.value, 2)}
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
              {/* Keterangan Nilai – 2 Kolom, Bahasa Bagus & Profesional */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-2 h-6 bg-amber-500 rounded mr-3"></div>
                  Keterangan Nilai (Skala 0 – 4)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kolom Kiri */}
                  <div className="space-y-3">
                    {[
                      { nilai: 4, label: "Sangat Baik", desc: "Sangat kompeten", color: "bg-emerald-50 text-emerald-700" },
                      { nilai: 3.5, label: "Baik", desc: "Hampir sangat kompeten", color: "bg-emerald-50 text-emerald-700" },
                      { nilai: 3, label: "Baik", desc: "Kompeten", color: "bg-blue-50 text-blue-700" },
                      { nilai: 2.5, label: "Cukup Baik", desc: "Cukup kompeten, ada sedikit kekurangan", color: "bg-amber-50 text-amber-700" },
                    ].map((item) => (
                      <div key={item.nilai} className={`p-3 rounded-lg ${item.color} flex items-center space-x-3 transition-all hover:shadow-sm`}>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                          {item.nilai}
                        </span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-80">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-3">
                    {[
                      { nilai: 2, label: "Cukup", desc: "Kurang kompeten, perlu perbaikan", color: "bg-amber-50 text-amber-700" },
                      { nilai: 1.5, label: "Kurang", desc: "Perlu perbaikan signifikan", color: "bg-orange-50 text-orange-700" },
                      { nilai: 1, label: "Sangat Kurang", desc: "Tidak kompeten, perlu bimbingan intensif", color: "bg-red-50 text-red-700" },
                      { nilai: 0, label: "Tidak Dinilai", desc: "Belum diberi nilai", color: "bg-gray-50 text-gray-600" },
                    ].map((item) => (
                      <div key={item.nilai} className={`p-3 rounded-lg ${item.color} flex items-center space-x-3 transition-all hover:shadow-sm`}>
                        <span className="w-9 h-9 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                          {item.nilai}
                        </span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-80">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800 text-center font-medium">
                    Skala penilaian: 0, 1, 1.5, 2, 2.5, 3, 3.5, 4
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <StatusActions
                status={penilaianData?.status || "draft"}
                canEdit={canEdit}
                submitPenilaian={submitPenilaian}
                finalizePenilaian={finalizePenilaian}
                currentUserRole={userRole}
              />

              {/* Informasi Penguji */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penguji</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penguji 1</label>
                    <input
                      type="text"
                      value={penilaianData?.penguji1?.username || "Belum ditugaskan"}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                    {userRole === "penguji1" && (
                      <span className="text-sm text-green-600 font-medium">✓ Anda</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penguji 2</label>
                    <input
                      type="text"
                      value={penilaianData?.penguji2?.username || "Belum ditugaskan"}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                    />
                    {userRole === "penguji2" && (
                      <span className="text-sm text-green-600 font-medium">✓ Anda</span>
                    )}
                  </div>
                </div>

                {/* Status info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Status Penilaian:</strong>{" "}
                    {penilaianData?.status === 'draft' && 'Draft - Menunggu pengisian'}
                    {penilaianData?.status === 'penguji1_selesai' && 'Penguji 1 sudah selesai'}
                    {penilaianData?.status === 'penguji2_selesai' && 'Penguji 2 sudah selesai'}
                    {penilaianData?.status === 'final' && 'Sudah difinalisasi'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Status Anda:</strong>{" "}
                    {userRole === "penguji1" && "Penguji 1 - Isi form penilaian bagian kiri"}
                    {userRole === "penguji2" && "Penguji 2 - Isi form penilaian bagian kanan"}
                    {!userRole && "Menunggu penugasan - Silakan mulai mengisi form"}
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