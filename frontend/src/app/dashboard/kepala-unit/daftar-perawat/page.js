"use client";

import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import EditPerawatDialog from "@/components/EditPerawatDialog";
import AddPerawatDialog from "@/components/AddPerawatDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, RotateCcw, UserPlus, Edit, Trash2, Users, SlidersHorizontal, User, UserCircle, Mail, Calendar, Shield, Settings, Building, MapPin, TrendingUp } from "lucide-react";


/* =================================================================
   TABEL PERAWAT
================================================================= */
const NurseTable = ({ title, perawat, headerColor, onEdit, onDelete }) => {
  if (!perawat || perawat.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="text-center py-6 bg-white rounded-lg shadow">
          <p className="text-gray-500">Tidak ada data untuk {title.toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  const truncateText = (text, maxLength) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className={headerColor}>
            <tr>
              <th className="w-16 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
              <th className="w-24 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  NPK
                </div>
              </th>
              <th className="w-48 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <UserCircle className="w-3 h-3" />
                  Nama
                </div>
              </th>
              <th className="w-64 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
              </th>
              <th className="w-40 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Unit
                </div>
              </th>
              <th className="w-40 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Area Klinis
                </div>
              </th>
              <th className="w-40 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Jenjang Karir
                </div>
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Role
                </div>
              </th>
              <th className="w-40 px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Tgl Lahir
                </div>
              </th>
              <th className="w-40 px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Aksi
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {perawat.map((p, idx) => (
              <tr key={p.id ?? p.npk ?? idx} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-4 text-sm text-gray-900">{idx + 1}</td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.npk || "-"}>{truncateText(p.npk, 10)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.username || "-"}>{truncateText(p.username, 20)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.email || "-"}>{truncateText(p.email, 30)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.unit || "-"}>{truncateText(p.unit, 30)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.areaKlinis || "-"}>{truncateText(p.areaKlinis, 30)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.jenjangKarir || "-"}>{truncateText(p.jenjangKarir, 30)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 truncate">
                  <span title={p.role || "-"}>{truncateText(p.role, 15)}</span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {p.tanggalLahir
                    ? new Date(p.tanggalLahir).toLocaleDateString("id-ID", {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                    : "-"
                  }
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      title="Edit data"
                    >
                      <Edit className="w-3.5 h-3.5 -ml-0.5 transition-transform group-hover:scale-110" />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Hapus data"
                    >
                      <Trash2 className="w-3.5 h-3.5 -ml-0.5 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

NurseTable.propTypes = {
  title: PropTypes.string.isRequired,
  perawat: PropTypes.arrayOf(
    PropTypes.shape({
      npk: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string,
      unit: PropTypes.string,
      areaKlinis: PropTypes.string,
      jenjangKarir: PropTypes.string,
      role: PropTypes.string,
      tanggalLahir: PropTypes.string,
    })
  ).isRequired,
  headerColor: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* =================================================================
   FILTER
================================================================= */
const FilterSection = ({ filters, setFilters, allPerawat, filteredCount }) => {
  const units = useMemo(() => {
    const uniqueUnits = [...new Set(allPerawat.map(p => p.unit).filter(Boolean))];
    return uniqueUnits.sort();
  }, [allPerawat]);

  const jenjangKarirList = useMemo(() => {
    const uniqueJenjang = [...new Set(allPerawat.map(p => p.jenjangKarir).filter(Boolean))];
    return uniqueJenjang.sort();
  }, [allPerawat]);

  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(allPerawat.map(p => p.role).filter(Boolean))];
    return uniqueRoles.sort();
  }, [allPerawat]);

  const handleReset = () => {
    setFilters({
      search: "",
      unit: "",
      areaKlinis: "",
      jenjangKarir: "",
      role: "",
    });
  };

  const hasActiveFilters = filters.search || filters.unit || filters.jenjangKarir || filters.role || filters.areaKlinis;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filter Perawat
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <Search className="w-4 h-4" />
            Cari Nama / NPK / Email
          </label>
          <input
            type="text"
            placeholder="Ketik untuk mencari..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <Building className="w-4 h-4" />
            Unit
          </label>
          <select
            value={filters.unit}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-black"
          >
            <option value="">Semua Unit</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Jenjang Karir */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <TrendingUp className="w-4 h-4" />
            Jenjang Karir
          </label>
          <select
            value={filters.jenjangKarir}
            onChange={(e) => setFilters({ ...filters, jenjangKarir: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-black"
          >
            <option value="">Semua Jenjang</option>
            {jenjangKarirList.map((jenjang) => (
              <option key={jenjang} value={jenjang}>{jenjang}</option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <Shield className="w-4 h-4" />
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-black"
          >
            <option value="">Semua Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Area Klinis */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            <MapPin className="w-4 h-4" />
            Area Klinis
          </label>
          <select
            value={filters.areaKlinis}
            onChange={(e) => setFilters({ ...filters, areaKlinis: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-black"
          >
            <option value="">Semua Area</option>
            {[...new Set(allPerawat.map(p => p.areaKlinis).filter(Boolean))].sort().map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Count */}
      {hasActiveFilters && (
        <div className="mt-4 text-sm text-gray-900">
          Menampilkan <span className="font-semibold text-blue-600">{filteredCount}</span> dari{" "}
          <span className="font-semibold">{allPerawat.length}</span> perawat
        </div>
      )}
    </div>
  );
};

FilterSection.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    unit: PropTypes.string,
    areaKlinis: PropTypes.string,
    jenjangKarir: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  allPerawat: PropTypes.array.isRequired,
  filteredCount: PropTypes.number.isRequired,
};

/* =================================================================
   TIPE PERAWAT (untuk grouping tabel)
================================================================= */
const NURSE_TYPES = [
  { key: "kepala unit", title: "Kepala Unit", headerColor: "bg-red-600" },
  { key: "mitra bestari", title: "Mitra Bestari", headerColor: "bg-green-600" },
  { key: "perawat", title: "Perawat", headerColor: "bg-blue-600" },
];

/* =================================================================
   LIST SECTION (TANPA urus showAddDialog)
================================================================= */
const NurseList = ({ perawat, loading, error, onSave, onDelete }) => {
  const [filters, setFilters] = useState({ search: "", unit: "", areaKlinis: "", jenjangKarir: "", role: "" });
  const [selectedPerawat, setSelectedPerawat] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Filter client-side
  const filteredPerawat = useMemo(() => {
    return perawat.filter((p) => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch =
        !filters.search ||
        p.username?.toLowerCase().includes(searchLower) ||
        p.npk?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower);

      const matchUnit = !filters.unit || p.unit === filters.unit;
      const matchJenjang = !filters.jenjangKarir || p.jenjangKarir === filters.jenjangKarir;
      const matchRole = !filters.role || p.role === filters.role;
      const matchArea = !filters.areaKlinis || p.areaKlinis === filters.areaKlinis;

      return matchSearch && matchUnit && matchJenjang && matchRole && matchArea;
    });
  }, [perawat, filters]);

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">


      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Filter */}
          <FilterSection
            filters={filters}
            setFilters={setFilters}
            allPerawat={perawat}
            filteredCount={filteredPerawat.length}
          />

          {/* Tabel per role */}
          {NURSE_TYPES.map(({ key, title, headerColor }) => {
            const normalize = (str) => (str || "").toLowerCase().replace(/[_-]/g, " ").trim();
            const filteredByRole = filteredPerawat
              .filter((p) => normalize(p.role) === key)
              .sort((a, b) => a.username?.localeCompare(b.username || "", "id", { sensitivity: "base" }));

            return (
              <NurseTable
                key={key}
                title={title}
                perawat={filteredByRole}
                headerColor={headerColor}
                onEdit={(p) => {
                  setSelectedPerawat(p);
                  setShowEditDialog(true);
                }}
                onDelete={(p) => {
                  setSelectedPerawat(p);
                  setShowDeleteDialog(true);
                }}
              />
            );
          })}
        </>
      )}

      {/* Edit Modal */}
      {showEditDialog && selectedPerawat && (
        <EditPerawatDialog
          perawat={selectedPerawat}
          onClose={() => setShowEditDialog(false)}
          onSave={async (updatedData) => {
            await onSave(updatedData, selectedPerawat.id);
            setShowEditDialog(false);
          }}
        />
      )}

      {/* TAMBAH DELETE MODAL */}
      {showDeleteDialog && selectedPerawat && (
        <DeleteConfirmationDialog
          perawat={selectedPerawat}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={async () => {
            await onDelete(selectedPerawat.id);
            setShowDeleteDialog(false);
          }}
        />
      )}

    </main>
  );
};

NurseList.propTypes = {
  perawat: PropTypes.arrayOf(
    PropTypes.shape({
      npk: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string,
      unit: PropTypes.string,
      areaKlinis: PropTypes.string,
      jenjangKarir: PropTypes.string,
      role: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* =================================================================
   PAGE UTAMA: state showAddDialog DITANGANI DI SINI
================================================================= */
export default function DaftarPerawatPage() {
  const [perawat, setPerawat] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isKepalaUnit, setIsKepalaUnit] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        setIsKepalaUnit(userData?.role === "kepala unit");
      } catch {
        setIsKepalaUnit(false);
      }
    }
  }, []);

  const fetchPerawat = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `HTTP error! status: ${res.status}`;

        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          // Jika response bukan JSON
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();
      if (result.success) {
        setPerawat(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error(" Error fetch:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData, perawatId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/${perawatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Gagal memperbarui data";

        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();

      if (result.success) {
        toast.success("Data perawat berhasil diperbarui ");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal memperbarui data");
      }
    } catch (err) {
      console.error("Error PATCH:", err);
      toast.error(err.message || "Gagal memperbarui data ");
    }
  };



  const handleDelete = async (perawatId) => {
    try {
      console.log(" Starting DELETE process for perawat ID:", perawatId);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan");
        return;
      }

      console.log(" Sending DELETE request to:", `${process.env.NEXT_PUBLIC_API_URL}/api/perawat/${perawatId}`);
      console.log(" Token exists:", !!token);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/${perawatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(" Response status:", res.status);
      console.log(" Response ok:", res.ok);

      // Cek status response
      if (!res.ok) {
        const errorText = await res.text();
        console.error(" Server error response:", errorText);
        console.error(" Response headers:", Object.fromEntries(res.headers.entries()));

        let errorMessage = "Gagal menghapus perawat";
        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
          console.error(" Parsed error result:", errorResult);
        } catch (e) {
          // Jika response bukan JSON, gunakan status text
          errorMessage = `Error ${res.status}: ${res.statusText}`;
          console.error(" Response is not JSON:", errorText);
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log(" Delete success result:", result);

      if (result.success) {
        ("Perawat berhasil dihapus ");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal menghapus perawat");
      }
    } catch (err) {
      console.error(" Error DELETE:", err);
      console.error(" Error stack:", err.stack);
      toast.error(err.message || "Gagal menghapus perawat ");
    }
  };

  // Tambah perawat baru
  // Tambah perawat baru
  const handleAdd = async (newPerawat) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan");
        return;
      }

      console.log(" Sending POST request to add perawat");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPerawat),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Gagal menambahkan perawat";

        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();

      if (result.success) {
        toast.success("Perawat baru berhasil ditambahkan ");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal menambahkan perawat");
      }
    } catch (err) {
      console.error("Error POST:", err);
      toast.error(err.message || "Gagal menambahkan perawat ");
    }
  };
  useEffect(() => {
    fetchPerawat();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Daftar Perawat" />

      {/* Header + Tombol Tambah Perawat (Profesional & Keren) */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 mx-6 mt-6 rounded-xl shadow-2xl p-5 border border-blue-800/40 overflow-hidden">
        <div className="flex justify-between items-center">
          {/* Kiri: Icon + Judul */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Daftar Perawat
              </h2>
              <p className="text-blue-100 text-xs font-medium">
                Kelola data staf medis
              </p>
            </div>
          </div>

          {/* Kanan: Tombol Tambah (Keren Banget) */}
          {isKepalaUnit && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="
          relative px-5 py-2.5 
          bg-gradient-to-r from-cyan-500 to-blue-600 
          text-white font-semibold text-sm 
          rounded-lg 
          shadow-lg hover:shadow-cyan-500/30 
          border border-cyan-400/50 
          overflow-hidden 
          group 
          transition-all duration-300 
          hover:scale-105 
          flex items-center gap-2
        "
            >
              {/* Efek Glow Background */}
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>

              <UserPlus className="w-4.5 h-4.5 transition-transform group-hover:rotate-90 group-hover:scale-110 duration-300" />
              <span className="relative z-10">Tambah Perawat</span>
            </button>
          )}
        </div>
      </div>

      {/* List Section */}
      <NurseList
        perawat={perawat}
        loading={loading}
        error={error}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Modal Tambah Perawat */}
      {showAddDialog && (
        <AddPerawatDialog
          onClose={() => setShowAddDialog(false)}
          onSave={async (payloadBaru) => {
            await handleAdd(payloadBaru);
            setShowAddDialog(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
