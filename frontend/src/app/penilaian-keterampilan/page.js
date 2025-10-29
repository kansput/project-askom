"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Select from "react-select";

export default function PenilaianPage() {
    const [perawatList, setPerawatList] = useState([]);
    const [selectedNpk, setSelectedNpk] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");
    const [selectedNama, setSelectedNama] = useState("");
    const [tanggal, setTanggal] = useState("");
    const [prosedur, setProsedur] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const [penilaian, setPenilaian] = useState([
        { no: "1.1", komponen: "Menilai kembali kebutuhan perawatan pasien", bobot: 1, nilai: 0, keterangan: "" },
        { no: "2.1", komponen: "Menetapkan cara pelaksanaan tindakan", bobot: 1, nilai: 0, keterangan: "" },
        { no: "3.1", komponen: "Menyiapkan alat sesuai tindakan", bobot: 1, nilai: 0, keterangan: "" },
        {
            no: "3.2",
            komponen: `Menjelaskan tujuan dan alasan:
            • Menyiapkan lingkungan yang memadai
            • Melakukan prosedur perawatan sesuai langkah & teknik
            • Mencegah komplikasi akibat prosedur
            • Melakukan perawatan dengan lembut`,
            bobot: 10,
            nilai: 0,
            keterangan: ""
        },
        { no: "3.3", komponen: "Mengumpulkan alat & kembalikan", bobot: 1, nilai: 0, keterangan: "" },
        { no: "4.1", komponen: "Mengobservasi reaksi pasien", bobot: 1, nilai: 0, keterangan: "" },
        { no: "4.2", komponen: "Melakukan komunikasi selama tindakan", bobot: 1, nilai: 0, keterangan: "" },
    ]);

    // Fetch hanya perawat
    useEffect(() => {
        const fetchPerawat = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perawat/only`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const result = await res.json();
                if (result.success) {
                    setPerawatList(result.data);
                }
            } catch (err) {
                console.error("⚠ Error fetch perawat:", err);
            }
        };
        fetchPerawat();
    }, []);

    const handlePerawatChange = (option) => {
        const selected = perawatList.find((p) => p.npk === option.value);
        if (selected) {
            setSelectedNpk(selected.npk);
            setSelectedUnit(selected.unit || "-");
            setSelectedNama(selected.username || "-");
        } else {
            setSelectedNpk("");
            setSelectedUnit("-");
            setSelectedNama("-");
        }
    };


    const handleNilaiChange = (index, value) => {
        const updated = [...penilaian];
        updated[index].nilai = Math.min(4, Math.max(0, Number(value)));
        setPenilaian(updated);
    };

    const handleKeteranganChange = (index, value) => {
        const updated = [...penilaian];
        updated[index].keterangan = value;
        setPenilaian(updated);
    };

    const totalBobot = penilaian.reduce((acc, item) => acc + item.bobot, 0);
    const totalBobotNilai = penilaian.reduce(
        (acc, item) => acc + item.bobot * (item.nilai || 0),
        0
    );
    const nilaiAkhir = (totalBobot > 0 ? totalBobotNilai / totalBobot : 0).toFixed(2);

    // Grade calculation
    const getGrade = (score) => {
        if (score >= 3.5) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-50" };
        if (score >= 3.0) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50" };
        if (score >= 2.5) return { grade: "C", color: "text-amber-600", bg: "bg-amber-50" };
        return { grade: "D", color: "text-red-600", bg: "bg-red-50" };
    };

    const gradeInfo = getGrade(parseFloat(nilaiAkhir));

    // Fungsi Submit Penilaian
    const handleSubmit = async () => {
        // Validasi form
        if (!selectedNpk || !tanggal || !prosedur) {
            setSubmitMessage({
                type: 'error',
                text: 'Harap lengkapi semua data identitas (Perawat, Tanggal, dan Prosedur)'
            });
            return;
        }

        // Validasi apakah semua komponen sudah dinilai
        const belumDinilai = penilaian.filter(item => item.nilai === 0);
        if (belumDinilai.length > 0) {
            setSubmitMessage({
                type: 'error',
                text: `Masih ada ${belumDinilai.length} komponen yang belum dinilai`
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem("token");

            const dataToSubmit = {
                perawat_npk: selectedNpk,
                tanggal_penilaian: tanggal,
                prosedur: prosedur,
                nilai_komponen: penilaian,
                total_bobot: totalBobot,
                total_nilai: totalBobotNilai,
                nilai_akhir: parseFloat(nilaiAkhir),
                grade: gradeInfo.grade,
                status: 'selesai'
            };

            console.log("Data yang dikirim:", dataToSubmit);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian-keterampilan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit)
            });

            const result = await response.json();

            if (result.success) {
                setSubmitMessage({
                    type: 'success',
                    text: 'Penilaian berhasil disimpan!'
                });

                // Reset form setelah berhasil submit
                setTimeout(() => {
                    resetForm();
                }, 2000);
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: result.message || 'Gagal menyimpan penilaian'
                });
            }
        } catch (error) {
            console.error('Error submitting penilaian:', error);
            setSubmitMessage({
                type: 'error',
                text: 'Terjadi kesalahan saat menyimpan penilaian'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi Reset Form
    const resetForm = () => {
        setSelectedNpk("");
        setSelectedUnit("");
        setSelectedNama("");
        setTanggal("");
        setProsedur("");
        setPenilaian(penilaian.map(item => ({
            ...item,
            nilai: 0,
            keterangan: ""
        })));
        setSubmitMessage({ type: '', text: '' });

        // Tambahan untuk reset react-select
        document.querySelector(".react-select__input")?.blur();
    };


    // Fungsi Simpan Draft
    const handleSaveDraft = async () => {
        if (!selectedNpk || !tanggal || !prosedur) {
            setSubmitMessage({
                type: 'error',
                text: 'Harap lengkapi data identitas terlebih dahulu'
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem("token");

            const dataToSubmit = {
                perawat_npk: selectedNpk,
                tanggal_penilaian: tanggal,
                prosedur: prosedur,
                nilai_komponen: penilaian,
                total_bobot: totalBobot,
                total_nilai: totalBobotNilai,
                nilai_akhir: parseFloat(nilaiAkhir),
                grade: gradeInfo.grade,
                status: 'draft'
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian-keterampilan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit)
            });

            const result = await response.json();

            if (result.success) {
                setSubmitMessage({
                    type: 'success',
                    text: 'Draft penilaian berhasil disimpan!'
                });
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: result.message || 'Gagal menyimpan draft'
                });
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            setSubmitMessage({
                type: 'error',
                text: 'Terjadi kesalahan saat menyimpan draft'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <Navbar title="Penilaian Keterampilan" />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Evaluasi Keterampilan Keperawatan
                    </h1>
                    <p className="text-gray-600">
                        Sistem penilaian prosedur tindakan keperawatan
                    </p>
                </div>

                {/* Form Identitas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                        Data Penilaian
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900">
                                Tanggal Penilaian
                            </label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Perawat</label>
                            <Select
                                options={perawatList.map((p) => ({
                                    value: p.npk,
                                    label: p.username
                                }))}
                                onChange={handlePerawatChange}
                                placeholder="Cari nama perawat..."
                                isSearchable
                                className="text-gray-900"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        padding: '4px',
                                        borderRadius: '0.5rem',
                                        borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB', // biru saat fokus
                                        boxShadow: state.isFocused ? '0 0 0 2px #93C5FD' : 'none',
                                        '&:hover': { borderColor: '#3B82F6' },
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected
                                            ? '#3B82F6'
                                            : state.isFocused
                                                ? '#DBEAFE'
                                                : 'white',
                                        color: state.isSelected ? 'white' : '#111827',
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                NPK
                            </label>
                            <input
                                type="text"
                                value={selectedNpk}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-900"
                                placeholder="Nomor Pegawai"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Unit Kerja
                            </label>
                            <input
                                type="text"
                                value={selectedUnit}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-900"
                                placeholder="Unit"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Prosedur
                            </label>
                            <input
                                value={prosedur}
                                onChange={(e) => setProsedur(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                placeholder="Nama prosedur"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Nama Asli</label>
                        <input
                            type="text"
                            value={selectedNama}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                        />
                    </div>
                </div>

                {/* Tabel Penilaian */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <div className="w-2 h-6 bg-emerald-500 rounded mr-3"></div>
                            Komponen Penilaian
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Komponen Penilaian
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                        Bobot
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                        Nilai
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                        Skor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-80">
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {penilaian.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                                            {item.no}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="whitespace-pre-line text-sm text-gray-900 leading-relaxed">
                                                {item.komponen}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {item.bobot}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select
                                                value={item.nilai}
                                                onChange={(e) => handleNilaiChange(idx, e.target.value)}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium text-black"
                                            >
                                                <option value={0}>-</option>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-900">
                                            {item.bobot * (item.nilai || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                value={item.keterangan}
                                                onChange={(e) => handleKeteranganChange(idx, e.target.value)}
                                                placeholder="Catatan penilaian..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 resize-none"
                                                rows="2"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hasil & Keterangan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Hasil Penilaian */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <div className="w-2 h-6 bg-purple-500 rounded mr-3"></div>
                            Hasil Penilaian
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <span className="text-gray-600">Total Bobot × Nilai</span>
                                <span className="font-semibold text-gray-900">{totalBobotNilai}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <span className="text-gray-600">Total Bobot</span>
                                <span className="font-semibold text-gray-900">{totalBobot}</span>
                            </div>

                            <div className="flex justify-between items-center py-4">
                                <span className="text-lg font-medium text-gray-900">Nilai Akhir</span>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{nilaiAkhir}</div>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${gradeInfo.bg} ${gradeInfo.color} mt-1`}>
                                        Grade {gradeInfo.grade}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keterangan Nilai */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <div className="w-2 h-6 bg-amber-500 rounded mr-3"></div>
                            Keterangan Nilai
                        </h3>

                        <div className="space-y-3">
                            {[
                                { nilai: 4, label: "Baik Sekali", desc: "Sangat kompeten", color: "bg-emerald-50 text-emerald-700" },
                                { nilai: 3, label: "Baik", desc: "Kompeten", color: "bg-blue-50 text-blue-700" },
                                { nilai: 2, label: "Cukup", desc: "Cukup kompeten", color: "bg-amber-50 text-amber-700" },
                                { nilai: 1, label: "Kurang", desc: "Perlu perbaikan", color: "bg-red-50 text-red-700" }
                            ].map((item) => (
                                <div key={item.nilai} className={`p-3 rounded-lg ${item.color}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                {item.nilai}
                                            </span>
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-sm opacity-75">{item.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <div className="w-2 h-6 bg-green-500 rounded mr-3"></div>
                        Simpan Penilaian
                    </h3>

                    {/* Status Message */}
                    {submitMessage.text && (
                        <div className={`mb-4 p-4 rounded-lg ${submitMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {submitMessage.text}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <button
                            onClick={resetForm}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Reset Form
                        </button>

                        <button
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}