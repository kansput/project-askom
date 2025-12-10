"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import { exportUjianDetailPDF } from "@/utils/exportUjianPDF";


export default function HasilUjianAllPage() {
    const [loading, setLoading] = useState(true);
    const [hasilList, setHasilList] = useState([]);
    const [currentUser, setCurrentUser] = useState({});
    const [filter, setFilter] = useState({
        nama: "",
        unit: "",
        skorMin: "",
        skorMax: ""
    });

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setCurrentUser({
                    userId: payload.userId || payload.npk,
                    role: payload.role,
                    username: payload.username,
                });
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }, []);

    const fetchAllHasil = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/hasil/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const result = await res.json();
            if (result.success) {
                setHasilList(result.data || []);
            } else {
                toast.error(result.message || "Gagal mengambil data");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan server");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser.role === "kepala unit") {
            fetchAllHasil();
        }
    }, [currentUser, fetchAllHasil]);

    const formatDateTime = (d) => {
        if (!d) return "-";
        return new Date(d).toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getSkorColor = (skor) => {
        if (skor == null) return "text-gray-600 bg-gray-100 border-gray-200";
        const s = Number(skor);
        if (s >= 85) return "text-green-600 bg-green-100 border-green-200";
        if (s >= 70) return "text-blue-600 bg-blue-100 border-blue-200";
        if (s >= 50) return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };

    const filteredData = hasilList.filter(item => {
        return (
            (filter.nama === "" || item.nama.toLowerCase().includes(filter.nama.toLowerCase())) &&
            (filter.unit === "" || item.unit.toLowerCase().includes(filter.unit.toLowerCase())) &&
            (filter.skorMin === "" || item.skor >= Number(filter.skorMin)) &&
            (filter.skorMax === "" || item.skor <= Number(filter.skorMax))
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                <Navbar title="Hasil Ujian" />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleDownloadPDF = async (item) => {
        try {
            const token = localStorage.getItem("token");

            // 1. Ambil detail ujian
            const ujianRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${item.ujianId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ujianData = (await ujianRes.json()).data;

            // 2. Ambil jawaban peserta
            const jawabanRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${item.ujianId}/peserta/${item.pesertaUjianId}/jawaban`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const jawabanPeserta = (await jawabanRes.json()).data;

            // 3. Generate PDF lengkap
            exportUjianDetailPDF(ujianData, item, jawabanPeserta);

        } catch (err) {
            console.error(err);
            toast.error("Gagal membuat PDF");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <Navbar title="Hasil Ujian Teori" />

            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Hasil Ujian Teori Perawat
                        </h1>
                        <p className="text-lg text-gray-600">
                            Monitoring hasil ujian teori seluruh perawat di unit
                        </p>
                        <div className="w-32 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Filter & Stats - UBAH INI */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                            <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                            Filter & Pencarian
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Nama perawat..."
                                value={filter.nama}
                                onChange={e => setFilter({ ...filter, nama: e.target.value })}
                                className="px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-800 font-medium text-base transition"
                            />
                            <input
                                type="text"
                                placeholder="Unit..."
                                value={filter.unit}
                                onChange={e => setFilter({ ...filter, unit: e.target.value })}
                                className="px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-800 font-medium text-base transition"
                            />
                            <input
                                type="number"
                                placeholder="Skor min..."
                                value={filter.skorMin}
                                onChange={e => setFilter({ ...filter, skorMin: e.target.value })}
                                className="px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-800 font-medium text-base transition"
                            />
                            <input
                                type="number"
                                placeholder="Skor max..."
                                value={filter.skorMax}
                                onChange={e => setFilter({ ...filter, skorMax: e.target.value })}
                                className="px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-800 font-medium text-base transition"
                            />
                        </div>
                    </div>

                    <div className="mb-6 flex justify-between items-center">
                        <p className="text-gray-600">
                            Menampilkan <span className="font-bold text-blue-600">{filteredData.length}</span> dari {hasilList.length} hasil ujian
                        </p>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">Empty</div>
                                <h3 className="text-xl font-semibold text-black">Tidak ada data ditemukan</h3>
                                <p className="text-gray-500 mt-2">Coba ubah filter pencarian</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase">No</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase">Ujian</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase">Perawat</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase">Unit</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase">Skor</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase">Exit</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase">Tab Switch</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredData.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-center text-black font-medium">{i + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{item.ujianJudul}</div>
                                                    <div className="text-xs text-gray-500">{formatDateTime(item.waktuMulai)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">{item.nama}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                        {item.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-4 py-2 rounded-full text-lg font-bold border-2 ${getSkorColor(item.skor)}`}>
                                                        {item.skor}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "lulus" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {item.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-orange-600">
                                                    {item.exitAttempts}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-purple-600">
                                                    {item.tabSwitchCount}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDownloadPDF(item)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow hover:from-emerald-700 hover:to-emerald-800 transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Legend Skor */}
                    <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Kriteria Penilaian Skor</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-green-50 border-2 border-green-200">
                                <div className="text-2xl font-bold text-green-600">≥ 85</div>
                                <div className="text-sm text-gray-600">Sangat Baik</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">70-84</div>
                                <div className="text-sm text-gray-600">Baik</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-600">50-69</div>
                                <div className="text-sm text-gray-600">Cukup</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-50 border-2 border-red-200">
                                <div className="text-2xl font-bold text-red-600">&lt; 50</div>
                                <div className="text-sm text-gray-600">Kurang</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}