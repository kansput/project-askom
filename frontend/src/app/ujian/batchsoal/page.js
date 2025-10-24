'use client';
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  FileText,
  Edit,
  Eye,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BatchSoalListPage() {
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ---- Confirm modal state ----
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const openConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirm(true);
  };

  // ---- Komponen Modal Konfirmasi ----
  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[380px] shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Konfirmasi</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );

  // ambil data batch soal
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) {
          setBatchList(data.data);
        }
      } catch (err) {
        console.error("Gagal fetch batch soal", err);
        toast.error("Gagal memuat batch soal");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBatch();
  }, [token]);

  const handleDelete = async (id) => {
    setDeleteLoading(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setBatchList(batchList.filter((batch) => batch.id !== id));
        toast.success("Batch soal berhasil dihapus!");
      } else {
        toast.error(data.message || "Gagal menghapus batch soal");
      }
    } catch (err) {
      console.error("Error deleting batch:", err);
      toast.error("Terjadi kesalahan saat menghapus batch soal");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar title="Daftar Batch Soal" />

      <main className="flex-grow max-w-7xl mx-auto p-6 w-full space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Kelola Batch Soal
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  {loading
                    ? "Memuat..."
                    : `${batchList.length} batch soal tersedia`}
                </p>
              </div>
            </div>
            <Link href="/ujian/batchsoal/create" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buat Batch Baru
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">
              Memuat data batch soal...
            </p>
          </div>
        ) : batchList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Belum Ada Batch Soal
              </h2>
              <p className="text-slate-600 mb-6">
                Mulai dengan membuat batch soal pertama Anda untuk mengelola
                koleksi ujian dengan lebih terorganisir.
              </p>
              <Link href="/ujian/batchsoal/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Buat Batch Soal Pertama
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batchList.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-semibold">
                          {batch.soals?.length || 0} Soal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {batch.nama}
                    </h2>
                    <p className="text-slate-600 text-sm line-clamp-3">
                      {batch.deskripsi ||
                        "Tidak ada deskripsi tersedia untuk batch soal ini."}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {(() => {
                          const d = new Date(batch?.createdAt ?? "");
                          return Number.isNaN(d.getTime())
                            ? "N/A"
                            : d.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              });
                        })()}
                      </span>
                    </div>
                    {batch.updatedAt && batch.updatedAt !== batch.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {(() => {
                            const d = new Date(batch?.updatedAt ?? "");
                            return Number.isNaN(d.getTime())
                              ? "N/A"
                              : `Diperbarui ${d.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <a
                      href={`/ujian/batchsoal/${batch.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-4 py-2.5 rounded-lg transition-all border border-blue-200 hover:border-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Detail</span>
                    </a>

                    <a
                      href={`/ujian/batchsoal/create?edit=${batch.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-4 py-2.5 rounded-lg transition-all border border-amber-200 hover:border-amber-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </a>
                    <button
                      onClick={() =>
                        openConfirm(
                          `Hapus batch soal "${batch.nama}"?`,
                          () => handleDelete(batch.id)
                        )
                      }
                      disabled={deleteLoading === batch.id}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2.5 rounded-lg transition-all border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Hapus batch"
                    >
                      {deleteLoading === batch.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        {batchList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Tips Pengelolaan</p>
              <p className="text-sm text-blue-700 mt-1">
                Klik Detail untuk melihat semua soal dalam batch. Gunakan
                Edit untuk memodifikasi atau menambah soal baru.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ✅ Render ConfirmModal */}
      {showConfirm && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={() => {
            confirmAction?.();
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <Footer />
    </div>
  );
}
