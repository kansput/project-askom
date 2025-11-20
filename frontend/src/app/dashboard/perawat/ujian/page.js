"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import { Calendar, Clock, PlayCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UjianAktifPage() {
  const [ujianList, setUjianList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState(null); // untuk loading per card

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const fetchUjian = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/active/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setUjianList(data.data || []);
        } else {
          toast.error(data.message || "Gagal mengambil daftar ujian");
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("Terjadi kesalahan jaringan");
      }
    };

    if (token) fetchUjian();
  }, [token]);

  const handleStartUjian = async (id) => {
    setStartingId(id);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ujian/${id}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Ujian dimulai! Mengarahkan...");
        setTimeout(() => {
          window.location.href = `/dashboard/perawat/ujian/${id}`;
        }, 800);
      } else {
        toast.error(data.message || "Gagal memulai ujian");
      }
    } catch (err) {
      console.error(err);
      toast.error("Koneksi bermasalah");
    } finally {
      setLoading(false);
      setStartingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar title="Ujian Aktif" />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Ujian Aktif Saat Ini
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih ujian yang ingin kamu ikuti. Pastikan kamu sudah siap sebelum memulai!
            </p>
          </div>

          {/* Empty State */}
          {ujianList.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-200 mb-6">
                <AlertCircle className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Belum Ada Ujian Aktif
              </h3>
              <p className="text-gray-500">
                Tunggu pengumuman dari panitia ya
              </p>
            </div>
          )}

          {/* Card Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {ujianList.map((u) => (
              <div
                key={u.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 group-hover:w-3 transition-all" />

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    {/* Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <PlayCircle className="w-8 h-8 text-blue-600" />
                        {u.judul}
                      </h2>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium">
                            Mulai: <span className="font-semibold text-gray-800">{formatDate(u.waktuMulai)}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium">
                            Selesai: <span className="font-semibold text-gray-800">{formatDate(u.waktuSelesai)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Duration hint (optional, kalau ada data durasi) */}
                      {u.durasi && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Durasi: {u.durasi} menit
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col items-end justify-center">
                      <button
                        onClick={() => handleStartUjian(u.id)}
                        disabled={loading || startingId === u.id}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {startingId === u.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memulai...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                            Mulai Ujian
                          </>
                        )}
                      </button>

                      <p className="mt-3 text-xs text-gray-500">
                        Tekan untuk memulai ujian
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom wave decoration */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}