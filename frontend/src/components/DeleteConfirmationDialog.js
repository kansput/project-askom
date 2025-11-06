"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";

export default function DeleteConfirmationDialog({ perawat, onClose, onConfirm }) {
  const [inputNpk, setInputNpk] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputNpk !== perawat.npk) {
      toast.error("NPK tidak sesuai. Ketik ulang NPK perawat yang akan dihapus.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(perawat.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 bg-red-600 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Hapus Perawat</h2>
          <p className="text-red-100 text-sm mt-1">Konfirmasi penghapusan data</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>

          <div>
            <p className="text-gray-700 mb-2">
              Anda akan menghapus: <strong>{perawat.username}</strong> (NPK: {perawat.npk})
            </p>
            <label className="block text-sm font-medium text-black mb-2">
              Ketik <span className="font-bold">`{perawat.npk}`</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={inputNpk}
              onChange={(e) => setInputNpk(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900"
              placeholder={`Ketik ${perawat.npk}`}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inputNpk !== perawat.npk}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Data"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

DeleteConfirmationDialog.propTypes = {
  perawat: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};