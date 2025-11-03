"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Download, Calendar, Award, ShieldCheck, Search, ChevronDown, ChevronUp, Filter, User, AlertCircle, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import toastConfirm from "@/utils/toastConfirm";

export default function StrRiwayatPage() {
    const router = useRouter();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const itemsPerPage = 10;



    const fetchDocs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
                setLoading(false);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
                return;
            }

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;
            const role = payload.role;

            let url;
            if (role === "kepala unit" || role === "admin") {
                url = `${process.env.NEXT_PUBLIC_API_URL}/api/str/all`;
            } else {
                url = `${process.env.NEXT_PUBLIC_API_URL}/api/str/user/${userId}`;
            }

            console.log("Fetching documents from:", url);

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            console.log("📡 Response status:", res.status);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "Gagal mengambil data" }));
                throw new Error(errorData.message || `HTTP Error ${res.status}`);
            }

            const result = await res.json();
            console.log("✅ Response data:", result);

            if (result.success) {
                setDocs(result.data || []);
                setError(null);
            } else {
                throw new Error(result.message || "Gagal memuat dokumen");
            }
        } catch (err) {
            console.error(" Error fetch:", err);
            setError(err.message || "Terjadi kesalahan saat mengambil data");

            if (err.message.includes("401") || err.message.includes("403") || err.message.includes("Token")) {
                setTimeout(() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    const handleDelete = async (docId) => {
        // 1. KONFIRMASI DULU (pakai confirm biasa)
        if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
            return; // Batal
        }

        // 2. Kalau ya, lanjut proses hapus dengan toast.promise
        const deletePromise = async () => {
            setDeletingId(docId);
            const token = localStorage.getItem("token");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/str/${docId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: "Gagal menghapus" }));
                throw new Error(err.message || "Gagal menghapus dokumen");
            }

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            // Refresh data
            await fetchDocs();
            return result;
        };

        // 3. Toast: loading → success / error
        toast.promise(
            deletePromise(),
            {
                loading: "Menghapus dokumen...",
                success: "Dokumen berhasil dihapus!",
                error: (err) => err.message,
            },
            {
                style: { minWidth: '260px' },
                success: { duration: 3000 },
                error: { duration: 5000 },
            }
        );
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDocs = [...docs].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredDocs = sortedDocs.filter(doc => {
        const text = [
            doc.nomorSTR,
            doc.nomorSIP,
            doc.nomorRKK,
            doc.tahunSelesai,
            doc.pendidikanterakhir,
            doc.username || "",
            doc.npk || ""
        ].join(" ").toLowerCase();

        const matchesSearch = text.includes(searchTerm.toLowerCase());

        if (filterType === "all") return matchesSearch;
        if (filterType === "str") return matchesSearch && doc.nomorSTR;
        if (filterType === "sip") return matchesSearch && doc.nomorSIP;
        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocs = filteredDocs.slice(startIndex, endIndex);

    const getStatusBadge = (doc) => {
        const today = new Date();
        if (doc.masaBerlakuRKK) {
            const expiry = new Date(doc.masaBerlakuRKK);
            const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry < 0) {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Expired</span>;
            } else if (daysUntilExpiry < 90) {
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Segera Berakhir</span>;
            }
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">-</span>;
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronDown className="w-4 h-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-green-600" />
            : <ChevronDown className="w-4 h-4 text-green-600" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Toast Notification */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Navbar title="Riwayat Dokumen STR & SIP" />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Dokumen</h1>
                    </div>
                    <p className="text-gray-600 ml-14">Kelola dan pantau Data Riwayat Hidup , STR, & SIP </p>
                </div>

                {/* Stats Cards */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{docs.length}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Dokumen STR</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {docs.filter(d => d.nomorSTR).length}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Dokumen SIP</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {docs.filter(d => d.nomorSIP).length}
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Aktif</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {docs.filter(d => {
                                            if (!d.masaBerlakuRKK) return false;
                                            const expiry = new Date(d.masaBerlakuRKK);
                                            return expiry > new Date();
                                        }).length}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter Section */}
                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Cari NPK, nama, nomor STR, SIP, RKK, tahun, atau ijazah..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition   text-gray-900 placeholder-gray-500 bg-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterType("all")}
                                    className={`px-4 py-2 rounded-lg font-medium transition text-sm ${filterType === "all"
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setFilterType("str")}
                                    className={`px-4 py-2 rounded-lg font-medium transition text-sm ${filterType === "str"
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    STR
                                </button>
                                <button
                                    onClick={() => setFilterType("sip")}
                                    className={`px-4 py-2 rounded-lg font-medium transition text-sm ${filterType === "sip"
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    SIP
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Memuat dokumen...</p>
                    </div>
                ) : error ? null : filteredDocs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || filterType !== "all" ? "Tidak ada hasil" : "Belum ada dokumen"}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || filterType !== "all"
                                ? "Coba ubah pencarian atau filter Anda"
                                : "Mulai upload dokumen STR dan SIP Anda"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('npk')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    NPK
                                                    <SortIcon columnKey="npk" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('username')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    Nama Perawat
                                                    <SortIcon columnKey="username" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('nomorSTR')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    Nomor STR
                                                    <SortIcon columnKey="nomorSTR" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('nomorSIP')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    Nomor SIP
                                                    <SortIcon columnKey="nomorSIP" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('nomorRKK')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    Nomor RKK
                                                    <SortIcon columnKey="nomorRKK" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('tahunSelesai')}
                                                    className="flex items-center gap-1 hover:text-green-100 transition"
                                                >
                                                    Tahun
                                                    <SortIcon columnKey="tahunSelesai" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Ijazah</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">File</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentDocs.map((doc, index) => (
                                            <tr
                                                key={doc.id}
                                                className={`hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-gray-900">{doc.npk || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-900">{doc.username || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {doc.nomorSTR ? (
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm font-medium text-gray-900">{doc.nomorSTR}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {doc.nomorSIP ? (
                                                        <div className="flex items-center gap-2">
                                                            <Award className="w-4 h-4 text-purple-600" />
                                                            <span className="text-sm font-medium text-gray-900">{doc.nomorSIP}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.nomorRKK ? (
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-blue-600" />
                                                                <span className="text-sm font-medium text-gray-900">{doc.nomorRKK}</span>
                                                            </div>
                                                            {doc.rkkMasaBerlaku && (
                                                                <span className="text-xs text-gray-500 ml-6">
                                                                    Periode: {doc.rkkMasaBerlaku}
                                                                </span>
                                                            )}
                                                            {doc.masaBerlakuRKK && (
                                                                <span className="text-xs text-gray-500 ml-6 block">
                                                                    s/d {new Date(doc.masaBerlakuRKK).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">{doc.tahunSelesai || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900">{doc.pendidikanterakhir || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {getStatusBadge(doc)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {doc.fileSTR && (
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_API_URL}/${doc.fileSTR}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-green-100 hover:bg-green-200 rounded transition"
                                                                title="Download STR"
                                                            >
                                                                <Download className="w-4 h-4 text-green-700" />
                                                            </a>
                                                        )}
                                                        {doc.fileSIP && (
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_API_URL}/${doc.fileSIP}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition"
                                                                title="Download SIP"
                                                            >
                                                                <Download className="w-4 h-4 text-purple-700" />
                                                            </a>
                                                        )}

                                                        {doc.fileRKK && (
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_API_URL}/${doc.fileRKK}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-red-100 hover:bg-red-200 rounded transition"
                                                                title="Download RKK"
                                                            >
                                                                <Download className="w-4 h-4 text-red-700" />
                                                            </a>
                                                        )}

                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        disabled={deletingId === doc.id}
                                                        className="p-2 bg-red-100 hover:bg-red-200 rounded transition disabled:opacity-50"
                                                        title="Hapus Dokumen"
                                                    >
                                                        {deletingId === doc.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 text-red-700" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Menampilkan</span>
                                    <span className="font-semibold text-gray-900">{startIndex + 1}</span>
                                    <span>-</span>
                                    <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredDocs.length)}</span>
                                    <span>dari</span>
                                    <span className="font-semibold text-gray-900">{filteredDocs.length}</span>
                                    <span>dokumen</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Sebelumnya
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                                                        ? 'bg-green-600 text-white shadow-md'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}