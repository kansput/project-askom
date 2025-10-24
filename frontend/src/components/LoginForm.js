"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginUser, getRoleBasedRoute } from "../utils/auth";

// Icon sederhana
const UserIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function LoginForm() {
  const [npk, setNpk] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { success, token, user, message } = await loginUser(npk, password);
      if (!success) return setError(message);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ⬇️ Tambahin pengecekan mustChangePassword
      if (user.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push(getRoleBasedRoute(user.role));
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/Logo rumah sakit St Carolus 3.png"
          alt="Logo RS Carolus"
          width={260}
          height={80}
          priority
          className="object-contain"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NPK */}
        <div className="space-y-2">
          <label htmlFor="npk" className="block text-sm font-semibold text-gray-700">NPK</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon />
            </div>
            <input
              type="text"
              id="npk"
              value={npk}
              onChange={(e) => setNpk(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
              placeholder="Masukkan NPK"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
              placeholder="Masukkan Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-700 hover:to-blue-800"
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Toggle Instructions Button */}
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 py-2 transition-colors"
        >
          <InfoIcon />
          <span>{showInstructions ? "Sembunyikan" : "Lihat"} Panduan Login</span>
        </button>
      </form>

      {/* Login Instructions */}
      {showInstructions && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl animate-fadeIn">
          <div className="flex items-start">
            <InfoIcon />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Informasi Login</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Password default menggunakan format tanggal lahir Anda: <span className="font-mono font-semibold bg-blue-100 px-2 py-0.5 rounded">YYYYMMDD</span>
              </p>
              <p className="text-xs text-blue-600 mt-1.5">
                Contoh: Jika lahir 15 Agustus 1990, gunakan <span className="font-mono font-semibold">19900815</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
          <div className="flex items-center">
            <AlertCircleIcon />
            <p className="text-red-700 text-sm font-medium ml-2">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}