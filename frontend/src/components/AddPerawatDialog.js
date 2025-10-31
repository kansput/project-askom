"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";

const UNIT_OPTIONS = ["AUDIT INTERNAL", "PAP", "IRJ", "ANASTESI", "IGNATIUS", "BPMKP", "IMMANUEL", "K3RS", "MCU", "CAROLUS", "TUGAS BELAJAR", "PRESEPTORSHIP", "LUKAS", "CASE MANAJER", "HR OPERASIONAL", "PKR", "KAMAR BEDAH (ok)", "FRANSISKUS-MARIA", "LIOBA", "ELISABETH", "ENDOSKOPI", "RADIOLOGI", "DIALISIS", "YACINTA", "KOMITE KEPERAWATAN", "DAMIANUS", "PKRS", "YOSEPH", "STERILISASI", "IGD", "PPI", "THERESIA", "XAVERIUS", "GORETY", "CICC", "YOHANES", "CARLO", "REHAB MEDIK", "BIDANG KEP", "JAMINAN"];

const AREA_KLINIS_OPTIONS = ["AUDIT INTERNAL", "IRJ", "ANASTESI", "IMMANUEL", "KAMAR BEDAH", "MUTU", "PSIKIATRI", "KEMOTERAPI", "ENDOSKOPI", "RADIOLOGI", "DIALISIS", "IPI DEWASA", "BPPRS", "MATERNITAS", "IPI ANAK", "ANAK", "IGD", "PPI", "MEDIKAL BEDAH", "CICC", "KESPAS", "REHAB MEDIK"];

const JENJANG_KARIR_OPTIONS = [
    "PRA PK", "PK I", "PK II", "PK III", "PK IV", "PKWT", "BP I", "BP II", "BP III"
];

const ROLE_OPTIONS = ["perawat", "mitra bestari"];

export default function AddPerawatDialog({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        npk: "",
        username: "",
        email: "",
        tanggalLahir: "",
        role: "perawat",
        unit: "",
        areaKlinis: "",
        jenjangKarir: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validasi NPK (harus 4 digit angka)
        if (!/^\d{4}$/.test(formData.npk)) {
            setError("NPK harus terdiri dari 4 angka.");
            return;
        }

        // Validasi Nama wajib diisi
        if (!formData.username) {
            setError("Nama wajib diisi.");
            return;
        }

        // Validasi Tanggal Lahir wajib diisi
        if (!formData.tanggalLahir) {
            setError("Tanggal Lahir wajib diisi.");
            return;
        }

        // Email opsional → kalau diisi, harus valid
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Format email tidak valid.");
            return;
        }

        try {

            setIsSubmitting(true);
            // Konversi dari dd/mm/yyyy → YYYYMMDD
            // Handle semua format tanggal
            const parseTanggalLahir = (tanggal) => {
                if (!tanggal) return "default123"; // Fallback jika kosong

                // Cek format dd/mm/yyyy
                if (tanggal.includes('/')) {
                    const parts = tanggal.split('/');
                    if (parts.length === 3) {
                        const day = parts[0].padStart(2, '0');
                        const month = parts[1].padStart(2, '0');
                        const year = parts[2];
                        return year + month + day;
                    }
                }

                // Format YYYY-MM-DD (dari date input)
                return tanggal.replace(/-/g, '');
            };

            const passwordDefault = parseTanggalLahir(formData.tanggalLahir);

            await onSave({
                ...formData,
                password: passwordDefault || null,
                email: formData.email || null // kalau kosong, kirim null
            });
        } catch (err) {
            console.error("❌ Gagal menambahkan:", err);
            setError(err.message || "Terjadi kesalahan saat menyimpan data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header dengan gradient */}
                <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-white">Tambah Perawat Baru</h2>
                    <p className="text-blue-100 mt-1 text-sm">Lengkapi informasi perawat dengan teliti</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                    {/* NPK */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            NPK <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="npk"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={4}
                            value={formData.npk}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d{0,4}$/.test(value)) {
                                    setFormData((prev) => ({ ...prev, npk: value }));
                                }
                            }}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Contoh: 1234"
                        />
                        <p className="text-xs text-gray-600 mt-1.5 ml-1">Harus terdiri dari 4 angka</p>
                    </div>

                    {/* Nama */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Nama Lengkap <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>

                    {/* Email (opsional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Email <span className="text-gray-500 font-normal text-xs">(Opsional)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Contoh: budi@hospital.com"
                        />
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Tanggal Lahir <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            name="tanggalLahir"
                            value={formData.tanggalLahir}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Unit */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Unit <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-white"
                        >
                            <option value="" className="text-gray-500">Pilih Unit</option>
                            {UNIT_OPTIONS.map((u) => (
                                <option key={u} value={u} className="text-gray-900">{u}</option>
                            ))}
                        </select>
                    </div>

                    {/* Area Klinis */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Area Klinis <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="areaKlinis"
                            value={formData.areaKlinis}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-white"
                        >
                            <option value="" className="text-gray-500">Pilih Area Klinis</option>
                            {AREA_KLINIS_OPTIONS.map((a) => (
                                <option key={a} value={a} className="text-gray-900">{a}</option>
                            ))}
                        </select>
                    </div>

                    {/* Jenjang Karir */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Jenjang Karir <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="jenjangKarir"
                            value={formData.jenjangKarir}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-white"
                        >
                            <option value="" className="text-gray-500">Pilih Jenjang Karir</option>
                            {JENJANG_KARIR_OPTIONS.map((j) => (
                                <option key={j} value={j} className="text-gray-900">{j}</option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Role <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-white"
                        >
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r} className="text-gray-900">
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-800 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Simpan Data
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

AddPerawatDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};