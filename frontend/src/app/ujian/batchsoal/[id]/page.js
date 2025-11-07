"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DetailBatchSoalPage() {
  const { id } = useParams(); // ambil :id dari URL
  const [batch, setBatch] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading] = useState(true);

  // state untuk preview modal
  const [previewUrl, setPreviewUrl] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // fetch detail batch (sudah include soal + opsi di backend)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setBatch(data.data);
          setSoalList(data.data.soals || []);
        } else {
          setBatch(null);
        }
      } catch (err) {
        console.error("Gagal fetch detail batch soal:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchDetail();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium">Batch tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar title="Detail Batch Soal" />

      <main className="flex-grow max-w-5xl mx-auto p-6 w-full space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800">{batch.nama}</h1>
          <Link
            href="/ujian/batchsoal"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke daftar batch
          </Link>
        </div>

        {/* List Soal */}
        {soalList.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow border border-slate-200 text-center">
            <p className="text-slate-600">Belum ada soal dalam batch ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {soalList.map((s, idx) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow border border-slate-200 p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {s.pertanyaan}
                    </p>
                    {s.gambar && (
                      <div className="mt-3">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${s.gambar}`}
                          alt="gambar soal"
                          className="max-w-md max-h-48 rounded-lg border shadow-sm cursor-pointer hover:opacity-90"
                          width={400}
                          height={192}
                          unoptimized
                          onClick={() =>
                            setPreviewUrl(
                              `${process.env.NEXT_PUBLIC_API_URL}${s.gambar}`
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-12 space-y-2">
                  {s.opsi?.map((opt) => {
                    const kodeTrim = opt.kode;
                    const textTrim = opt.text;

                    return (
                      <div
                        key={kodeTrim}
                        className={`flex items-center gap-3 p-3 rounded-lg ${kodeTrim === s.jawabanBenar
                          ? "bg-green-50 border border-green-300"
                          : "bg-slate-50 border border-slate-200"
                          }`}
                      >
                        <span
                          className={`font-bold ${kodeTrim === s.jawabanBenar ? "text-green-700" : "text-slate-600"
                            }`}
                        >
                          {kodeTrim}.
                        </span>
                        <span
                          className={`flex-1 ${kodeTrim === s.jawabanBenar
                            ? "text-slate-800 font-medium"
                            : "text-slate-700"
                            }`}
                        >
                          {textTrim}
                        </span>
                        {kodeTrim === s.jawabanBenar && (
                          <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Benar</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)} // klik background untuk tutup
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // biar klik gambar gak nutup
          >
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-slate-100"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
            <Image
              src={previewUrl}
              alt="Preview"
              className="rounded-lg object-contain"
              style={{ maxHeight: "90vh", width: "auto", height: "auto" }}
              width={800}
              height={600}
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
