"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Helper function to get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Helper function to format role display
  const formatRole = (role) => {
    if (!role) return "Tidak ada role";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar title="Profil Pengguna" />

      <main className="flex-grow py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Action Button */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Profil Karyawan</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Informasi data karyawan</p>
            </div>
            <button
              onClick={() => router.push("/change-password")}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 hover:scale-105 transition-all duration-300 active:scale-95 w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Ganti Password
            </button>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-blue-900 to-blue-700">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center border-2 sm:border-3 border-white shadow-lg flex-shrink-0">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {getUserInitials(user.username)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    {user.username || "Nama tidak tersedia"}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1 flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="truncate">NPK: {user.npk || "Tidak tersedia"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Informasi Detail
                </h3>
                <span className="px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1 sm:gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Nama Lengkap
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                      {user.username || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Nomor NPK
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-mono font-medium break-all">
                      {user.npk || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-all">
                      {user.email || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Jabatan/Role
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{formatRole(user.role)}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Unit
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                      {user.unit || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Jenjang Karir
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                      {user.jenjangKarir || "Tidak tersedia"}
                    </p>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">
                    Area Klinis
                  </label>
                  <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                      {user.areaKlinis || "Tidak tersedia"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">Login Terakhir: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Keamanan Akun</h4>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Akun Anda dilindungi dengan enkripsi
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Informasi</h4>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Hubungi Team SIRS untuk perubahan data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}