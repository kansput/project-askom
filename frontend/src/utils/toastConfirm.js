import toast from "react-hot-toast";

/**
 * Custom confirm menggunakan toast dengan tombol Ya/Tidak
 * @param {string} message - Pesan konfirmasi
 * @param {Function} onConfirm - Fungsi yang dijalankan jika klik "Hapus"
 */
const toastConfirm = (message, onConfirm) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-medium text-gray-800">{message}</p>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-4 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            Hapus
          </button>
        </div>
      </div>
    ),
    {
      duration: 10000,
      style: {
        background: "#fff",
        color: "#1f2937",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    }
  );
};

export default toastConfirm;