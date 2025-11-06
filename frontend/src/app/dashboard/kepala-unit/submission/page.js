"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HasilUjianPage({ params }) {
    const [hasil, setHasil] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterNama, setFilterNama] = useState("");
    const [filterUnit, setFilterUnit] = useState("Semua Unit");
    const [token, setToken] = useState("");

    // === Ambil token setelah komponen siap (biar gak null) ===
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            setToken(storedToken);
            console.log("DEBUG TOKEN:", storedToken);
        }
    }, []);

    // === Fetch data hasil ujian ===
    useEffect(() => {
        const fetchHasil = async () => {
            if (!token) return; // jangan fetch kalau belum ada token
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${params?.id || 1}/hasil`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();
                console.log("DEBUG hasil ujian:", data);

                if (data.success) {
                    setHasil(Array.isArray(data.data) ? data.data : [data.data]);
                } else {
                    setHasil([]);
                }
            } catch (err) {
                console.error(" Gagal memuat hasil ujian:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHasil();
    }, [params?.id, token]);



    // === Style grade ===
    const getGradeStyle = (grade) => {
        switch (grade) {
            case "A":
                return "bg-emerald-100 text-emerald-800 border border-emerald-200";
            case "B":
                return "bg-blue-100 text-blue-800 border border-blue-200";
            case "C":
                return "bg-amber-100 text-amber-800 border border-amber-200";
            default:
                return "bg-red-100 text-red-800 border border-red-200";
        }
    };

    // === Filter hasil ===
    const filtered =
        hasil?.filter(
            (h) =>
                (!filterNama ||
                    h.nama?.toLowerCase().includes(filterNama.toLowerCase())) &&
                (filterUnit === "Semua Unit" || h.unit === filterUnit)
        ) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
            <Navbar title="Hasil Ujian Perawat" />

            <main className="container mx-auto px-4 py-10 max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Rekapitulasi Hasil Ujian
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Pantau performa perawat, skor akhir, dan pelanggaran selama ujian
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama perawat..."
                            value={filterNama}
                            onChange={(e) => setFilterNama(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                        />
                    </div>

                    <select
                        value={filterUnit}
                        onChange={(e) => setFilterUnit(e.target.value)}
                        className="w-full md:w-48 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    >
                        <option value="Semua Unit">Semua Unit</option>
                        {[...new Set(hasil.map((h) => h.unit).filter(Boolean))].map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="inline-flex items-center gap-3 text-gray-500">
                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-medium">Memuat data hasil ujian...</span>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">Tidak ada data hasil ujian</p>
                            <p className="text-sm mt-1">Coba ubah filter atau pastikan ujian telah selesai</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Nama Perawat
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Unit
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Skor
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Exit Attempts
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Tab Switch
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-900 uppercase tracking-wider text-xs">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filtered.map((h, idx) => {
                                        const grade = h.skor >= 80 ? "A" : h.skor >= 70 ? "B" : h.skor >= 60 ? "C" : "D";
                                        return (
                                            <tr
                                                key={idx}
                                                className="hover:bg-blue-50/50 transition-all duration-150"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {h.nama}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {h.unit || <span className="text-gray-400 italic">Tidak ada unit</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-lg text-gray-900">
                                                    {h.skor?.toFixed?.(1) ?? "0"}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-700">
                                                    {h.exitAttempts ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-700">
                                                    {h.tabSwitchCount ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${h.status === "Selesai"
                                                        ? "bg-green-100 text-green-800"
                                                        : h.status === "Dalam Proses"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getGradeStyle(
                                                            grade
                                                        )}`}
                                                    >
                                                        {grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats (Opsional, bisa ditambahkan nanti) */}
                {filtered.length > 0 && (
                    <div className="mt-6 text-sm text-gray-600 text-right">
                        Menampilkan <span className="font-semibold">{filtered.length}</span> dari <span className="font-semibold">{hasil.length}</span> peserta
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}