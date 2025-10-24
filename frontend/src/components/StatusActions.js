// components/StatusActions.jsx
export default function StatusActions({
  // lockedBy,            // sudah tidak dipakai (akses by-role)
  currentUser,
  status,
  canEdit,               // (roleNumber) => boolean
  submitPenilaian,       // (roleNumber) => void
  finalizePenilaian,     // () => void
  canFinalize,           // () => boolean  <-- BARU (opsional)
  currentUserRole        // opsional: tidak jadi sumber kebenaran akses
}) {
  const getStatusInfo = () => {
    switch (status) {
      case "draft":
        return { text: "Draft", color: "bg-yellow-100 text-yellow-800" };
      case "penguji1_selesai":
        return { text: "Penguji 1 Selesai", color: "bg-blue-100 text-blue-800" };
      case "penguji2_selesai":
        return { text: "Penguji 2 Selesai", color: "bg-green-100 text-green-800" };
      case "final":
        return { text: "Final", color: "bg-purple-100 text-purple-800" };
      default:
        return { text: status || "Draft", color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusInfo = getStatusInfo();
  const showFinalize = typeof canFinalize === "function" ? canFinalize() : (status === "penguji2_selesai");

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Badge */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          {/* lockedBy dihapus: kontrol akses by-role melalui canEdit */}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Tampilkan tombol simpan sesuai hak edit masing-masing role */}
          {canEdit?.(1) && (
            <button
              onClick={() => submitPenilaian(1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Simpan Penilaian Penguji 1
            </button>
          )}

          {canEdit?.(2) && (
            <button
              onClick={() => submitPenilaian(2)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Simpan Penilaian Penguji 2
            </button>
          )}

          {/* Finalisasi bisa oleh siapapun dari dua penguji setelah keduanya submit */}
          {status !== "final" && showFinalize && (
            <button
              onClick={finalizePenilaian}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              title="Finalisasi penilaian setelah kedua penguji submit"
            >
              Finalisasi Penilaian
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
