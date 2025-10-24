"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileText,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
} from "lucide-react";

export default function SertifikatKepalaUnitPage() {
  const router = useRouter();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
          setLoading(false);
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;

        if (role !== "kepala unit" && role !== "admin") {
          setError("Anda tidak berhak mengakses halaman ini.");
          setLoading(false);
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sertifikat`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Gagal mengambil data" }));
          throw new Error(errorData.message || `HTTP Error ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setDocs(result.data || []);
        } else {
          throw new Error(result.message || "Gagal memuat data sertifikat");
        }
      } catch (err) {
        console.error("❌ Error fetch sertifikat:", err);
        setError(err.message);
        if (
          err.message.includes("401") ||
          err.message.includes("403") ||
          err.message.includes("Token")
        ) {
          setTimeout(() => {
            localStorage.removeItem("token");
            router.push("/login");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [router]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedDocs = [...docs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredDocs = sortedDocs.filter((doc) => {
    const text = [doc.judul, doc.kategori, doc.penyelenggara, doc.username || "", doc.npk || ""]
      .join(" ")
      .toLowerCase();

    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesKategori =
      filterKategori === "all" ? true : doc.kategori?.toLowerCase() === filterKategori;

    return matchesSearch && matchesKategori;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-green-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-green-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar title="Data Sertifikat Perawat" />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Data Sertifikat</h1>
          </div>
          <p className="text-gray-600 ml-14">
            Kepala Unit dapat melihat semua sertifikat perawat di unit ini
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Cari nama, judul, penyelenggara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterKategori("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  filterKategori === "all"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterKategori("umum")}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  filterKategori === "umum"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Umum
              </button>
              <button
                onClick={() => setFilterKategori("khusus")}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  filterKategori === "khusus"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Khusus
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
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

        {/* Loading & Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Memuat sertifikat...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada hasil</h3>
            <p className="text-gray-500">
              {searchTerm || filterKategori !== "all"
                ? "Coba ubah pencarian atau filter Anda"
                : "Belum ada sertifikat yang diupload"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      <button
                        onClick={() => handleSort("username")}
                        className="flex items-center gap-1"
                      >
                        Nama Perawat <SortIcon columnKey="username" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      <button
                        onClick={() => handleSort("judul")}
                        className="flex items-center gap-1"
                      >
                        Judul <SortIcon columnKey="judul" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Penyelenggara</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocs.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {doc.username || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{doc.judul}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {doc.kategori}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {doc.tanggal
                          ? new Date(doc.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{doc.penyelenggara}</td>
                      <td className="px-4 py-3">
                        {doc.filePath && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/${doc.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-100 hover:bg-green-200 rounded transition"
                            title="Download Sertifikat"
                          >
                            <Download className="w-4 h-4 text-green-700" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
