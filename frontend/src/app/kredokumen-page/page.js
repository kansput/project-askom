"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Download, Calendar, Search, ChevronDown, ChevronUp, Filter, User, AlertCircle, ShieldCheck, Award, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function KredoRiwayatPage() {
    const router = useRouter();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ Function untuk handle sorting
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // ✅ Function untuk fetch documents
    const fetchDocuments = useCallback(async () => {
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
            if (role === "kepala unit" || role === "mitra bestari") {
                url = `${process.env.NEXT_PUBLIC_API_URL}/api/kredokumen`;
            } else {
                url = `${process.env.NEXT_PUBLIC_API_URL}/api/kredokumen/my-documents`;
            }

            console.log("📝 Fetching kredokumen from:", url);

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
                throw new Error(result.message || "Gagal memuat dokumen kredensial");
            }
        } catch (err) {
            console.error("❌ Error fetch kredokumen:", err);
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
        fetchDocuments();
    }, [router, fetchDocuments]);

    const handleDelete = async (documentId) => {
        const confirmed = await new Promise((resolve) => {
            toast.custom(
                (t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } w-80 bg-white rounded-xl shadow-2xl border border-red-100 p-4`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Hapus Dokumen</h3>
                                <p className="text-sm text-gray-600">Data akan dihapus permanen</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    resolve(true);
                                    toast.dismiss(t.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Ya, Hapus
                            </button>
                            <button
                                onClick={() => {
                                    resolve(false);
                                    toast.dismiss(t.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Batal
                            </button>
                        </div>
                    </div>
                ),
                { duration: Infinity, position: 'top-center' }
            );
        });

        if (!confirmed) {
            toast('Penghapusan dibatalkan', {
                icon: '⚠️',
                duration: 2000
            });
            return;
        }

        const deleteToast = toast.loading('Sedang menghapus dokumen...');

        try {
            // ✅ PERBAIKAN: Gunakan full URL dengan environment variable
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/kredokumen/${documentId}`;
            console.log("🗑️ Deleting document:", apiUrl);

            const token = localStorage.getItem("token");
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("🗑️ Delete response status:", response.status);

            // ✅ Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            let result;

            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error("❌ Non-JSON response:", text.substring(0, 200));
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            if (result.success) {
                toast.success('✅ Dokumen berhasil dihapus', { id: deleteToast });
                // ✅ Refresh data setelah delete berhasil
                fetchDocuments();
            } else {
                toast.error(`❌ Gagal: ${result.message}`, { id: deleteToast });
            }
        } catch (error) {
            console.error('❌ Error deleting document:', error);
            toast.error('❌ Terjadi kesalahan sistem: ' + error.message, { id: deleteToast });
        }
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
            doc.tanggal,
            doc.npk || "",
            doc.username || "",
            doc.unit || "",
            "kredensial",
            "spkk"
        ].join(" ").toLowerCase();

        return text.includes(searchTerm.toLowerCase());
    });

    // Pagination
    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocs = filteredDocs.slice(startIndex, endIndex);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronDown className="w-4 h-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-green-600" />
            : <ChevronDown className="w-4 h-4 text-green-600" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Navbar title="Riwayat Dokumen Kredensial & SPKK" />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Dokumen Kredensial & SPKK</h1>
                    </div>
                    <p className="text-gray-600 ml-14">Kelola dan pantau dokumen Kredensial & SPKK yang telah diupload</p>
                </div>

                {/* Stats Cards */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Upload</p>
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
                                    <p className="text-sm font-medium text-gray-600">Dokumen Kredensial</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {docs.filter(d => d.fileKredensial).length}
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
                                    <p className="text-sm font-medium text-gray-600">Dokumen SPKK</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {docs.filter(d => d.fileSPKK).length}
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Section */}
                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Cari NPK, nama, unit, atau tanggal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 bg-white"
                                />
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
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Memuat dokumen kredensial...</p>
                    </div>
                ) : error ? null : filteredDocs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm ? "Tidak ada hasil" : "Belum ada dokumen kredensial"}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? "Coba ubah pencarian Anda"
                                : "Mulai upload dokumen Kredensial & SPKK Anda"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('npk')}
                                                    className="flex items-center gap-1 hover:text-blue-100 transition"
                                                >
                                                    NPK
                                                    <SortIcon columnKey="npk" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('username')}
                                                    className="flex items-center gap-1 hover:text-blue-100 transition"
                                                >
                                                    Nama Perawat
                                                    <SortIcon columnKey="username" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('unit')}
                                                    className="flex items-center gap-1 hover:text-blue-100 transition"
                                                >
                                                    Unit
                                                    <SortIcon columnKey="unit" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    onClick={() => handleSort('tanggal')}
                                                    className="flex items-center gap-1 hover:text-blue-100 transition"
                                                >
                                                    Tanggal Upload
                                                    <SortIcon columnKey="tanggal" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                Periode
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                Dokumen
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                Aksi
                                            </th>
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
                                                    <span className="text-sm text-gray-900">{doc.unit || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-900">
                                                            {doc.createdAt ? formatDate(doc.createdAt) : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {doc.tanggal ? formatDate(doc.tanggal) : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-2">
                                                        {doc.fileKredensial && (
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                                                <span className="text-sm text-gray-700">Kredensial</span>
                                                            </div>
                                                        )}
                                                        {doc.fileSPKK && (
                                                            <div className="flex items-center gap-2">
                                                                <Award className="w-4 h-4 text-purple-600" />
                                                                <span className="text-sm text-gray-700">SPKK</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        {doc.fileKredensial && (
                                                            <a
                                                                href={doc.fileKredensialUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-green-100 hover:bg-green-200 rounded transition flex items-center gap-1"
                                                                title="Download Kredensial"
                                                            >
                                                                <Download className="w-4 h-4 text-green-700" />
                                                                <span className="text-xs font-medium text-green-700">Kredensial</span>
                                                            </a>
                                                        )}
                                                        {doc.fileSPKK && (
                                                            <a
                                                                href={doc.fileSPKKUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-purple-100 hover:bg-purple-200 rounded transition flex items-center gap-1"
                                                                title="Download SPKK"
                                                            >
                                                                <Download className="w-4 h-4 text-purple-700" />
                                                                <span className="text-xs font-medium text-purple-700">SPKK</span>
                                                            </a>
                                                        )}
                                                        {/* Tombol Hapus */}
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="p-2 bg-red-100 hover:bg-red-200 rounded transition flex items-center gap-1"
                                                            title="Hapus Dokumen"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-700" />
                                                            <span className="text-xs font-medium text-red-700">Hapus</span>
                                                        </button>
                                                    </div>
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
                                                        ? 'bg-blue-600 text-white shadow-md'
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