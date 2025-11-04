"use client";

import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import EditPerawatDialog from "@/components/EditPerawatDialog";
import AddPerawatDialog from "@/components/AddPerawatDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">No</th>
              <th className="w-24 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NPK</th>
              <th className="w-48 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nama</th>
              <th className="w-64 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
              <th className="w-40 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Unit</th>
              <th className="w-40 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Area Klinis</th>
              <th className="w-40 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Jenjang Karir</th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
              <th className="w-40 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tanggal Lahir</th>
              <th className="w-40 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
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
                  <div className="flex gap-2"> {/* Tambah div wrapper dengan flex */}
                    <button
                      onClick={() => onEdit(p)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      title="Edit data"
                    >
                      <svg className="w-3.5 h-3.5 -ml-0.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Hapus data"
                    >
                      <svg className="w-3.5 h-3.5 -ml-0.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
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
          <span>🔍</span> Filter Perawat
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            🔄 Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Cari Nama/NPK/Email</label>
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
          <label className="block text-sm font-medium text-black mb-2">Unit</label>
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
          <label className="block text-sm font-medium text-black mb-2">Jenjang Karir</label>
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
          <label className="block text-sm font-medium text-black mb-2">Role</label>
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
          <label className="block text-sm font-medium text-black mb-2">Area Klinis</label>
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
      console.error("❌ Error fetch:", err);
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
        toast.success("Data perawat berhasil diperbarui ✅");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal memperbarui data");
      }
    } catch (err) {
      console.error("Error PATCH:", err);
      toast.error(err.message || "Gagal memperbarui data ❌");
    }
  };



  const handleDelete = async (perawatId) => {
    try {
      console.log("🔄 Starting DELETE process for perawat ID:", perawatId);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan");
        return;
      }

      console.log("📤 Sending DELETE request to:", `${process.env.NEXT_PUBLIC_API_URL}/api/perawat/${perawatId}`);
      console.log("🔑 Token exists:", !!token);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/${perawatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response ok:", res.ok);

      // Cek status response
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server error response:", errorText);
        console.error("❌ Response headers:", Object.fromEntries(res.headers.entries()));

        let errorMessage = "Gagal menghapus perawat";
        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
          console.error("❌ Parsed error result:", errorResult);
        } catch (e) {
          // Jika response bukan JSON, gunakan status text
          errorMessage = `Error ${res.status}: ${res.statusText}`;
          console.error("❌ Response is not JSON:", errorText);
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("✅ Delete success result:", result);

      if (result.success) {
        toast.success("Perawat berhasil dihapus ✅");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal menghapus perawat");
      }
    } catch (err) {
      console.error("💥 Error DELETE:", err);
      console.error("💥 Error stack:", err.stack);
      toast.error(err.message || "Gagal menghapus perawat ❌");
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

      console.log("📤 Sending POST request to add perawat");

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
        toast.success("Perawat baru berhasil ditambahkan ✅");
        await fetchPerawat();
      } else {
        throw new Error(result.message || "Gagal menambahkan perawat");
      }
    } catch (err) {
      console.error("Error POST:", err);
      toast.error(err.message || "Gagal menambahkan perawat ❌");
    }
  };
  useEffect(() => {
    fetchPerawat();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Daftar Perawat" />

      {/* Header + Tombol Tambah Perawat (khusus kepala unit) */}
      <div className="flex justify-between items-center px-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">📋</span> Daftar Perawat
        </h2>

        {typeof window !== "undefined" && (() => {
          try {
            const userData = JSON.parse(localStorage.getItem("user"));
            return userData?.role === "kepala unit";
          } catch {
            return false;
          }
        })() && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              + Tambah Perawat
            </button>
          )}
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
