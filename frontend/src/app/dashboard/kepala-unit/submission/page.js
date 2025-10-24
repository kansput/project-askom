"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HasilUjianPage() {
    // dummy data sementara
    const [hasil] = useState([
        {
            nama: "Andi",
            npk: "P001",
            unit: "ICU",
            topik: "Manajemen Luka",
            penguji1: 3.8,
            penguji2: 3.6,
            final: 3.7,
            grade: "A",
        },
        {
            nama: "Budi",
            npk: "P002",
            unit: "IGD",
            topik: "Resusitasi Jantung",
            penguji1: 3.0,
            penguji2: 3.2,
            final: 3.1,
            grade: "B",
        },
        {
            nama: "Citra",
            npk: "P003",
            unit: "Rawat Inap",
            topik: "Perawatan Luka Dekubitus",
            penguji1: 2.5,
            penguji2: 2.7,
            final: 2.6,
            grade: "C",
        },
    ]);

    const getGradeStyle = (grade) => {
        switch (grade) {
            case "A":
                return "bg-emerald-100 text-emerald-700";
            case "B":
                return "bg-blue-100 text-blue-700";
            case "C":
                return "bg-amber-100 text-amber-700";
            default:
                return "bg-red-100 text-red-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <Navbar title="Hasil Ujian Perawat" />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Rekapitulasi Hasil Ujian</h1>
                    <p className="text-gray-600">Lihat hasil akhir ujian presentasi perawat</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama perawat..."
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Semua Unit</option>
                        <option>ICU</option>
                        <option>IGD</option>
                        <option>Rawat Inap</option>
                    </select>
                </div>

                {/* Tabel Hasil */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-black">Nama</th>
                                <th className="px-6 py-3 text-left font-semibold text-black">NPK</th>
                                <th className="px-6 py-3 text-left font-semibold text-black">Unit</th>
                                <th className="px-6 py-3 text-left font-semibold text-black">Topik</th>
                                <th className="px-6 py-3 text-center font-semibold text-black">Penguji I</th>
                                <th className="px-6 py-3 text-center font-semibold text-black">Penguji II</th>
                                <th className="px-6 py-3 text-center font-semibold text-black">Nilai Akhir</th>
                                <th className="px-6 py-3 text-center font-semibold text-black">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {hasil.map((h, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 text-black">{h.nama}</td>
                                    <td className="px-6 py-3 text-black">{h.npk}</td>
                                    <td className="px-6 py-3 text-black">{h.unit}</td>
                                    <td className="px-6 py-3 text-black">{h.topik}</td>
                                    <td className="px-6 py-3 text-center text-black">{h.penguji1}</td>
                                    <td className="px-6 py-3 text-center text-black">{h.penguji2}</td>
                                    <td className="px-6 py-3 text-center font-semibold text-black">{h.final}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeStyle(h.grade)}`}>
                                            {h.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </main>

            <Footer />
        </div>
    );
}
