"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";

const UNIT_OPTIONS = ["AUDIT INTERNAL", "PAP", "IRJ", "ANASTESI", "IGNATIUS", "BPMKP", "IMMANUEL", "K3RS", "MCU", "CAROLUS", "TUGAS BELAJAR", "PRESEPTORSHIP", "LUKAS", "CASE MANAJER", "HR OPERASIONAL", "PKR", "KAMAR BEDAH (ok)", "FRANSISKUS-MARIA", "LIOBA", "ELISABETH", "ENDOSKOPI", "RADIOLOGI", "DIALISIS", "YACINTA", "KOMITE KEPERAWATAN", "DAMIANUS", "PKRS", "YOSEPH", "STERILISASI", "IGD", "PPI", "THERESIA", "XAVERIUS", "GORETY", "CICC", "YOHANES", "CARLO", "REHAB MEDIK", "BIDANG KEP", "JAMINAN","KLINIK PRATAMA"]
const AREA_KLINIS_OPTIONS = ["AUDIT INTERNAL", "IRJ", "ANASTESI", "IMMANUEL", "KAMAR BEDAH", "MUTU", "PSIKIATRI", "KEMOTERAPI", "ENDOSKOPI", "RADIOLOGI", "DIALISIS", "IPI DEWASA", "BPPRS", "MATERNITAS", "IPI ANAK", "ANAK", "IGD", "PPI", "MEDIKAL BEDAH", "CICC", "KESPAS", "REHAB MEDIK"];
const JENJANG_KARIR_OPTIONS = ["PRA PK", "PK I", "PK II", "PK III", "PK IV", "PKWT", "BP I", "BP II", "BP III"]

export default function EditPerawatDialog({ perawat, onClose, onSave }) {
  const [formData, setFormData] = useState({
    unit: perawat?.unit || "",
    areaKlinis: perawat?.areaKlinis || "",
    jenjangKarir: perawat?.jenjangKarir || "",
    role: perawat?.role || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.unit) newErrors.unit = "Unit harus diisi";
    if (!formData.areaKlinis) newErrors.areaKlinis = "Area Klinis harus diisi";
    if (!formData.jenjangKarir) newErrors.jenjangKarir = "Jenjang Karir harus diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Data Perawat</h2>
          <p className="text-sm text-gray-600 mt-1">Perbarui informasi perawat</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          {/* Unit Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.unit ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="" className="text-gray-500">Pilih Unit</option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit} className="text-gray-900">
                  {unit}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.unit}
              </p>
            )}
          </div>

          {/* Area Klinis Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Area Klinis <span className="text-red-500">*</span>
            </label>
            <select
              name="areaKlinis"
              value={formData.areaKlinis}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.areaKlinis ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="" className="text-gray-500">Pilih Area Klinis</option>
              {AREA_KLINIS_OPTIONS.map((area) => (
                <option key={area} value={area} className="text-gray-900">
                  {area}
                </option>
              ))}
            </select>
            {errors.areaKlinis && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.areaKlinis}
              </p>
            )}
          </div>

          {/* Jenjang Karir Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Jenjang Karir <span className="text-red-500">*</span>
            </label>
            <select
              name="jenjangKarir"
              value={formData.jenjangKarir}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.jenjangKarir ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="" className="text-gray-500">Pilih Jenjang Karir</option>
              {JENJANG_KARIR_OPTIONS.map((jenjang) => (
                <option key={jenjang} value={jenjang} className="text-gray-900">
                  {jenjang}
                </option>
              ))}
            </select>
            {errors.jenjangKarir && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.jenjangKarir}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role || perawat?.role || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="text-gray-500">Pilih Role</option>
              <option value="perawat">Perawat</option>
              <option value="mitra bestari">mitra bestari</option>
            </select>
          </div>


          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditPerawatDialog.propTypes = {
  perawat: PropTypes.shape({
    unit: PropTypes.string,
    areaKlinis: PropTypes.string,
    jenjangKarir: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};