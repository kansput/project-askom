"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HasilPenilaianKeterampilanPage() {
  const [penilaianList, setPenilaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    npk: "",
    tanggal: "",
    status: ""
  });

  // Ambil info user dari token
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const getUserInfo = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            userId: payload.userId || payload.npk,
            role: payload.role,
            username: payload.username
          });
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };
    getUserInfo();
  }, []);

  // Fetch data penilaian keterampilan
  const fetchPenilaian = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian-keterampilan/all`;

      // Jika perawat, hanya ambil penilaian miliknya
      if (currentUser.role === "perawat") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian-keterampilan/perawat/${currentUser.userId}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (result.success) {
        setPenilaianList(result.data || []);
      } else {
        console.error("Error fetching penilaian:", result.message);
        setPenilaianList([]);
      }
    } catch (error) {
      console.error("Error fetch penilaian:", error);
      setPenilaianList([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser.userId) {
      fetchPenilaian();
    }
  }, [currentUser, fetchPenilaian]);

  // Fungsi hapus data
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data penilaian ini?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian-keterampilan/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert("Data penilaian berhasil dihapus!");
        // Refresh data
        fetchPenilaian();
      } else {
        alert(result.message || "Gagal menghapus data penilaian");
      }
    } catch (error) {
      console.error("Error deleting penilaian:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  // Filter data
  const filteredData = penilaianList.filter(item => {
    return (
      (filter.npk === "" || item.perawat_npk?.includes(filter.npk)) &&
      (filter.tanggal === "" || item.tanggal_penilaian === filter.tanggal) &&
      (filter.status === "" || item.status === filter.status)
    );
  });

  // Helper functions
  const getGradeColor = (grade) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-100 border-green-200";
      case "B": return "text-blue-600 bg-blue-100 border-blue-200";
      case "C": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "D": return "text-red-600 bg-red-100 border-red-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "text-gray-600 bg-gray-100";
      case "selesai": return "text-blue-600 bg-blue-100";
      case "final": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "draft": return "Draft";
      case "selesai": return "Selesai";
      case "final": return "Final";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate grade from nilai_akhir
  const calculateGrade = (nilaiAkhir) => {
    if (nilaiAkhir >= 3.5) return "A";
    if (nilaiAkhir >= 3.0) return "B";
    if (nilaiAkhir >= 2.5) return "C";
    return "D";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Navbar title="Hasil Penilaian Keterampilan" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar title="Hasil Penilaian Keterampilan" />

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hasil Penilaian Keterampilan</h1>
            <p className="text-gray-600 text-lg">
              {currentUser.role === "perawat"
                ? "Lihat hasil penilaian keterampilan Anda"
                : "Daftar semua hasil penilaian keterampilan"
              }
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Filter Section - hanya untuk penilai */}
          {currentUser.role !== "perawat" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                Filter Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NPK Perawat</label>
                  <input
                    type="text"
                    value={filter.npk}
                    onChange={(e) => setFilter({ ...filter, npk: e.target.value })}
                    placeholder="Cari NPK..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penilaian</label>
                  <input
                    type="date"
                    value={filter.tanggal}
                    onChange={(e) => setFilter({ ...filter, tanggal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="selesai">Selesai</option>
                    <option value="final">Final</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Menampilkan <span className="font-semibold">{filteredData.length}</span> hasil penilaian
            </p>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {penilaianList.length === 0 ? "Belum ada data penilaian" : "Data tidak ditemukan"}
                </h3>
                <p className="text-gray-500">
                  {penilaianList.length === 0
                    ? "Data penilaian akan muncul setelah proses penilaian dilakukan"
                    : "Coba ubah filter pencarian Anda"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Perawat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Prosedur
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nilai Akhir
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Penilai
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((item, index) => {
                      const finalGrade = item.grade || calculateGrade(parseFloat(item.nilai_akhir));

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-center font-medium text-gray-900">
                            {index + 1}
                          </td>

                          {/* Kolom Perawat - hanya nama perawat */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {item.perawatKeterampilan?.username || "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              NPK: {item.perawat_npk}
                            </div>
                          </td>

                          {/* Kolom Unit - terpisah */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                              {item.perawatKeterampilan?.unit || "-"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-900">
                            {formatDate(item.tanggal_penilaian)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900" title={item.prosedur}>
                                {item.prosedur}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="text-xl font-bold text-blue-600">
                              {parseFloat(item.nilai_akhir).toFixed(2)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(finalGrade)}`}>
                              {finalGrade}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </td>

                          {/* Kolom Penilai - berdasarkan login yang menilai */}
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {item.penilaiKeterampilan?.username || "-"}
                          </td>

                          {/* Kolom Aksi - Hapus data */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => {
                                  // Tampilkan detail penilaian
                                  const detailText = `Detail Penilaian Keterampilan:\n\nPerawat: ${item.perawatKeterampilan?.username || '-'}\nUnit: ${item.perawatKeterampilan?.unit || '-'}\nProsedur: ${item.prosedur}\nTanggal: ${formatDate(item.tanggal_penilaian)}\nNilai Akhir: ${item.nilai_akhir}\nGrade: ${finalGrade}\nStatus: ${getStatusText(item.status)}\nPenilai: ${item.penilaiKeterampilan?.username || '-'}`;
                                  alert(detailText);
                                }}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                              >
                                Detail
                              </button>

                              {/* Tombol Hapus - hanya untuk penilai (bukan perawat) */}
                              {currentUser.role !== "perawat" && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Grade Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-6 bg-amber-500 rounded mr-3"></div>
              Kriteria Penilaian
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="font-bold text-green-600 text-xl mb-2">A</div>
                <div className="text-sm text-gray-600 font-medium">≥ 3.5</div>
                <div className="text-xs text-gray-500">Sangat Kompeten</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-bold text-blue-600 text-xl mb-2">B</div>
                <div className="text-sm text-gray-600 font-medium">≥ 3.0</div>
                <div className="text-xs text-gray-500">Kompeten</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-600 text-xl mb-2">C</div>
                <div className="text-sm text-gray-600 font-medium">≥ 2.5</div>
                <div className="text-xs text-gray-500">Cukup Kompeten</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="font-bold text-red-600 text-xl mb-2">D</div>
                <div className="text-sm text-gray-600 font-medium">&lt; 2.5</div>
                <div className="text-xs text-gray-500">Perlu Perbaikan</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}