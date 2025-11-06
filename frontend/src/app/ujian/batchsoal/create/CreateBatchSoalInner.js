
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Plus, Save, Image, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import NextImage from "next/image";

export default function CreateBatchSoalPage() {
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [pertanyaan, setPertanyaan] = useState("");
    const [gambar, setGambar] = useState("");
    const [gambarFile, setGambarFile] = useState(null);
    const [gambarPreview, setGambarPreview] = useState("");
    const [opsi, setOpsi] = useState([
        { kode: "A", text: "" },
        { kode: "B", text: "" },
        { kode: "C", text: "" },
        { kode: "D", text: "" },
    ]);
    const [jawabanBenar, setJawabanBenar] = useState("A");
    const [listSoal, setListSoal] = useState([]);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");


    const openConfirm = (message, action) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirm(true);
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${editId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    setNama(data.data.nama);
                    setDeskripsi(data.data.deskripsi || "");
                    setListSoal(
                        (data.data.soals || []).map((s) => ({
                            id: s.id,
                            pertanyaan: s.pertanyaan,
                            gambar: s.gambar,
                            opsi: s.opsi.map((str) => {
                                const [kode, ...rest] = str.split(".");
                                return { kode: kode.trim(), text: rest.join(".").trim() };
                            }),
                            jawabanBenar: s.jawabanBenar,
                        }))
                    );

                }
            } catch (err) {
                console.error(" Gagal fetch batch detail:", err);
            }
        };
        if (editId && token) fetchDetail();
    }, [editId, token]);



    const ConfirmModal = ({ message, onConfirm, onCancel }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-[380px] shadow-2xl">
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

    const handleAddSoal = (e) => {
        e.preventDefault();
        if (!pertanyaan) return toast.error(" Pertanyaan harus diisi!");
        if (opsi.some((o) => !o.text)) return toast.error(" Semua opsi harus diisi!");

        const newSoal = {
            pertanyaan,
            gambar: gambarPreview,   // buat preview di UI
            gambarFile,              // file asli, buat dikirim ke backend
            opsi,
            jawabanBenar,
        };

        setListSoal([...listSoal, newSoal]);

        // reset form soal
        setPertanyaan("");
        setGambar("");
        setGambarFile(null);
        setGambarPreview("");
        setOpsi([
            { kode: "A", text: "" },
            { kode: "B", text: "" },
            { kode: "C", text: "" },
            { kode: "D", text: "" },
        ]);
        setJawabanBenar("A");
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGambarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setGambarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setGambarFile(null);
        setGambarPreview("");
        setGambar("");
    };

    const handleRemoveSoal = async (index) => {
        const soal = listSoal[index];

        // kalau soal lama (sudah punya id di backend)
        if (soal.id && editId) {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${editId}/soal/${soal.id}`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = await res.json();
                if (!data.success) {
                    toast.error(data.message || " Gagal menghapus soal di server");
                    return;
                }
            } catch (err) {
                console.error(" Error hapus soal:", err);
                toast.error("Terjadi kesalahan saat menghapus soal.");
                return;
            }
        }

        // update state lokal supaya UI langsung berubah
        const newList = listSoal.filter((_, idx) => idx !== index);
        setListSoal(newList);
    };


    const handleSaveBatch = async () => {
        if (!nama) return toast.error("Nama batch wajib diisi!");
        if (listSoal.length === 0) return toast.error("Minimal harus ada 1 soal!");

        let batchId = editId;

        // Buat / Update batch
        if (editId) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nama, deskripsi }),
            });
            const data = await res.json();
            if (!data.success) {
                return toast.error(data.message || " Gagal update batch soal");
            }
        } else {
            const resBatch = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nama, deskripsi }),
            });
            const dataBatch = await resBatch.json();
            if (!dataBatch.success) {
                return toast.error(dataBatch.message || " Gagal membuat batch soal");
            }
            batchId = dataBatch.data.id;
        }

        // Simpan soal satu per satu (PUT untuk soal lama, POST untuk soal baru)
        for (const soal of listSoal) {
            const formData = new FormData();
            formData.append("pertanyaan", soal.pertanyaan);
            formData.append("jawabanBenar", soal.jawabanBenar);

            //  perbaikan di sini
            formData.append("opsi", JSON.stringify(soal.opsi));

            if (soal.gambarFile) {
                formData.append("gambar", soal.gambarFile);
            }

            const isExisting = Boolean(soal.id);
            const url = isExisting
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${batchId}/soal/${soal.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/batchsoal/${batchId}/soal`;
            const method = isExisting ? "PUT" : "POST";

            const resSoal = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` }, // JANGAN set Content-Type saat pakai FormData
                body: formData,
            });

            const dataSoal = await resSoal.json();
            console.log(" Respon simpan soal:", dataSoal);
            if (!dataSoal.success) {
                toast.error(dataSoal.message || " Gagal menyimpan soal");
                return;
            }
        }

        toast.success(` Batch soal berhasil ${editId ? "diperbarui" : "disimpan"}!`);
        setTimeout(() => {
            window.location.href = "/ujian/batchsoal";
        }, 1500);
    };





    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navbar title={editId ? "Edit Batch Soal" : "Buat Batch Soal"} />
            <main className="flex-grow max-w-6xl mx-auto p-6 space-y-6 w-full">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                {editId ? "Edit Batch Soal Ujian" : "Buat Batch Soal Ujian"}
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">
                                {editId ? "Perbarui data dan soal batch ini" : "Kelola dan buat kumpulan soal ujian dengan mudah"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nama Batch <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Ujian Perawat - Batch 1"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all outline-none text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                            <textarea
                                placeholder="Tambahkan deskripsi atau catatan untuk batch soal ini..."
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all outline-none resize-none text-slate-900 placeholder:text-slate-400"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-800">Tambah Soal Baru</h2>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Pertanyaan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Tuliskan pertanyaan soal di sini..."
                                value={pertanyaan}
                                onChange={(e) => setPertanyaan(e.target.value)}
                                className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all outline-none resize-none text-slate-900 placeholder:text-slate-400"
                                rows="4"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Image className="w-4 h-4" alt="" />
                                Upload Gambar (Opsional)
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {gambarPreview && (
                                    <div className="relative inline-block">
                                        <NextImage
                                            src={gambarPreview}
                                            alt="Preview"
                                            width={320}
                                            height={192}
                                            className="max-w-xs max-h-48 rounded-lg border-2 border-slate-200 shadow-sm"
                                            style={{ objectFit: "contain" }}
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                                            title="Hapus gambar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700">
                                Opsi Jawaban <span className="text-red-500">*</span>
                            </label>
                            <div className="grid gap-3">
                                {opsi.map((o, idx) => (
                                    <div key={o.kode} className="flex items-center gap-3 group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
                                            {o.kode}
                                        </div>
                                        <input
                                            type="text"
                                            value={o.text}
                                            onChange={(e) => {
                                                const newOpsi = [...opsi];
                                                newOpsi[idx].text = e.target.value;
                                                setOpsi(newOpsi);
                                            }}
                                            placeholder={`Opsi ${o.kode}`}
                                            className="flex-1 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all outline-none text-slate-900 placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <label className="font-semibold text-slate-700">Jawaban Benar:</label>
                            <select
                                value={jawabanBenar}
                                onChange={(e) => setJawabanBenar(e.target.value)}
                                className="border border-green-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 px-4 py-2 rounded-lg transition-all outline-none font-semibold text-green-700"
                            >
                                {opsi.map((o) => (
                                    <option key={o.kode} value={o.kode}>
                                        Opsi {o.kode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAddSoal}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Tambahkan Soal ke Daftar
                        </button>
                    </div>
                </div>
                {listSoal.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Daftar Soal</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    Total: <span className="font-semibold text-blue-600">{listSoal.length}</span> soal ditambahkan
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {listSoal.map((s, idx) => (
                                <div
                                    key={idx}
                                    className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-slate-50"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800 leading-relaxed">{s.pertanyaan}</p>
                                                {s.gambar && (
                                                    <div className="mt-3">
                                                        <NextImage
                                                            src={s.gambar.startsWith("data:")
                                                                ? s.gambar                   // kalau base64 → pakai langsung
                                                                : `${process.env.NEXT_PUBLIC_API_URL}${s.gambar}`}  // kalau path dari backend
                                                            alt="Gambar soal"
                                                            width={320}
                                                            height={160}
                                                            className="max-w-sm max-h-40 rounded-lg border-2 border-slate-200 shadow-sm"
                                                            style={{ objectFit: "contain" }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSoal(idx)}
                                            className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Hapus soal"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="ml-11 space-y-2">
                                        {s.opsi.map((o) => (
                                            <div
                                                key={o.kode}
                                                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${o.kode === s.jawabanBenar
                                                    ? "bg-green-50 border border-green-200"
                                                    : "bg-slate-50 border border-slate-200"
                                                    }`}
                                            >
                                                <span
                                                    className={`font-bold ${o.kode === s.jawabanBenar ? "text-green-700" : "text-slate-600"
                                                        }`}
                                                >
                                                    {o.kode}.
                                                </span>
                                                <span
                                                    className={`flex-1 ${o.kode === s.jawabanBenar ? "text-slate-800 font-medium" : "text-slate-700"
                                                        }`}
                                                >
                                                    {o.text}
                                                </span>
                                                {o.kode === s.jawabanBenar && (
                                                    <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Benar</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {listSoal.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-800">Belum ada soal</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Silakan tambahkan minimal 1 soal untuk dapat menyimpan batch ini.
                            </p>
                        </div>
                    </div>
                )}
                <div className="flex gap-4 pb-6">
                    <button
                        onClick={handleSaveBatch}
                        disabled={listSoal.length === 0}
                        className={`flex-1 font-semibold px-8 py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 text-lg ${listSoal.length === 0
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                            }`}
                    >
                        <Save className="w-6 h-6" />
                        {editId ? "Perbarui Batch Soal" : "Simpan Batch Soal"}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
