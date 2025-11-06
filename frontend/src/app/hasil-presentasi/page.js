
"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { handleExportPresentasiPDF } from "@/utils/exportpresentasiPDF";
import { toast } from "react-hot-toast";


export default function HasilPenilaianPage() {
  const [penilaianList, setPenilaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    npk: "",
    tanggal: "",
    status: ""
  });

  // Ambil info user dari token
  const [currentUser, setCurrentUser] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const getUserInfo = () => {
      try {
        if (typeof window !== "undefined") { // pastikan hanya di client
          const token = localStorage.getItem("token");
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser({
              userId: payload.userId || payload.npk,
              role: payload.role,
              username: payload.username
            });
          }
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };
    getUserInfo();
  }, []);


  // Fetch data penilaian

  const fetchPenilaian = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/all`;

      // Jika perawat, hanya ambil penilaian miliknya
      if (currentUser.role === "perawat") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/perawat/${currentUser.userId}`;
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
  }, [currentUser.role, currentUser.userId]);

  useEffect(() => {
    if (currentUser.userId) {
      fetchPenilaian();
    }
  }, [currentUser, fetchPenilaian]);

  // Fungsi untuk menghapus data penilaian
  const handleDelete = async (id, topik) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus penilaian dengan topik "${topik}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Data penilaian berhasil dihapus");
        fetchPenilaian(); // Refresh data
      } else {
        toast.error("Gagal menghapus data: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting penilaian:", error);
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter data
  const filteredData = penilaianList.filter(item => {
    return (
      (filter.npk === "" || item.perawat_npk?.includes(filter.npk)) &&
      (filter.tanggal === "" || item.tanggal_presentasi === filter.tanggal) &&
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
      case "penguji1_selesai": return "text-blue-600 bg-blue-100";
      case "penguji2_selesai": return "text-orange-600 bg-orange-100";
      case "final": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "draft": return "Draft";
      case "penguji1_selesai": return "Penguji 1 Selesai";
      case "penguji2_selesai": return "Penguji 2 Selesai";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar title="Hasil Penilaian Presentasi" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar title="Hasil Penilaian Presentasi" />

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hasil Penilaian Presentasi</h1>
            <p className="text-gray-600 text-lg">
              {currentUser.role === "perawat"
                ? "Lihat hasil penilaian presentasi Anda"
                : "Daftar semua hasil penilaian presentasi"
              }
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Filter Section - hanya untuk penilai */}
          {currentUser.role !== "perawat" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Data</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Presentasi</label>
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
                    <option value="penguji1_selesai">Penguji 1 Selesai</option>
                    <option value="penguji2_selesai">Penguji 2 Selesai</option>
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
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
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
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800">
                      <th className="p-4 text-left text-white font-semibold text-sm">No</th>
                      {currentUser.role !== "perawat" && (
                        <th className="p-4 text-left text-white font-semibold text-sm">Perawat</th>
                      )}
                      <th className="p-4 text-left text-white font-semibold text-sm">Tanggal</th>
                      <th className="p-4 text-left text-white font-semibold text-sm">Topik</th>
                      <th className="p-4 text-center text-white font-semibold text-sm">Nilai Akhir</th>
                      <th className="p-4 text-center text-white font-semibold text-sm">Grade</th>
                      <th className="p-4 text-center text-white font-semibold text-sm">Status</th>
                      <th className="p-4 text-center text-white font-semibold text-sm">Penguji 1</th>
                      <th className="p-4 text-center text-white font-semibold text-sm">Penguji 2</th>
                      {/* Kolom Hapus - hanya untuk admin/penilai */}
                      {currentUser.role !== "perawat" && (
                        <th className="p-4 text-center text-white font-semibold text-sm">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="p-4 text-gray-900 font-medium">{index + 1}</td>

                        {currentUser.role !== "perawat" && (
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {item.perawat?.username || "-"}
                              </div>
                              <div className="text-sm text-gray-500">
                                NPK: {item.perawat_npk}
                              </div>
                              <div className="text-sm text-gray-500">
                                Unit: {item.perawat?.unit || "-"}
                              </div>
                            </div>
                          </td>
                        )}

                        <td className="p-4 text-gray-900">{formatDate(item.tanggal_presentasi)}</td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate" title={item.topik}>
                              {item.topik}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          {item.nilai_final ? (
                            <span className="text-xl font-bold text-blue-600">
                              {parseFloat(item.nilai_final).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {item.grade ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(item.grade)}`}>
                              {item.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </td>

                        <td className="p-4 text-center text-sm text-gray-600">
                          {item.penguji1?.username || "-"}
                        </td>

                        <td className="p-4 text-center text-sm text-gray-600">
                          {item.penguji2?.username || "-"}
                        </td>


                        {currentUser.role !== "perawat" && (
                          <td className="p-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleDelete(item.id, item.topik)}
                                disabled={deletingId === item.id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-all duration-200
          ${deletingId === item.id
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                  }`}
                              >
                                {deletingId === item.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Menghapus...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Hapus</span>
                                  </>
                                )}
                              </button>

                              {item.status === "final" && (
                                <button
                                  onClick={() => handleExportPresentasiPDF(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
                                  title="Export ke PDF"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>PDF</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}


                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Grade Legend */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kriteria Penilaian</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="font-bold text-green-600 text-xl mb-1">A</div>
                <div className="text-sm text-gray-600">&ge; 3.6</div>
                <div className="text-xs text-gray-500">Sangat Baik</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="font-bold text-blue-600 text-xl mb-1">B</div>
                <div className="text-sm text-gray-600">&ge; 2.8</div>
                <div className="text-xs text-gray-500">Baik</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="font-bold text-yellow-600 text-xl mb-1">C</div>
                <div className="text-sm text-gray-600">&ge; 2.0</div>
                <div className="text-xs text-gray-500">Cukup</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="font-bold text-red-600 text-xl mb-1">D</div>
                <div className="text-sm text-gray-600">&lt; 2.0</div>
                <div className="text-xs text-gray-500">Kurang</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
