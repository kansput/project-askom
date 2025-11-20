"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginUser, getRoleBasedRoute } from "../utils/auth";
import { User, Lock, Eye, EyeOff, AlertCircle, Info, Loader2, } from "lucide-react";

export default function LoginForm({ tokenFromAppA }) {
  const [npk, setNpk] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleSSOLogin = async (token) => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sso`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (data.user.mustChangePassword) {
            router.push("/change-password");
          } else {
            router.push(getRoleBasedRoute(data.user.role));
          }
        } else {
          setError(data.error || "SSO failed");
        }
      } catch (error) {
        setError("SSO Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (tokenFromAppA) {
      handleSSOLogin(tokenFromAppA);
    }
  }, [tokenFromAppA, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { success, token, user, message } = await loginUser(npk, password);
      if (!success) return setError(message);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

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
          <label htmlFor="npk" className="block text-sm font-semibold text-gray-700">
            NPK
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="npk"
              defaultValue={npk}
              onChange={(e) => setNpk(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
              placeholder="Masukkan NPK"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              defaultValue={password}
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
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Toggle Instructions */}
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 py-2 transition-colors"
        >
          <Info className="h-5 w-5" />
          <span>{showInstructions ? "Sembunyikan" : "Lihat"} Panduan Login</span>
        </button>
      </form>

      {/* Login Instructions */}
      {showInstructions && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Informasi Login
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Password default menggunakan format tanggal lahir Anda:{" "}
                <code className="font-mono font-semibold bg-blue-100 px-2 py-0.5 rounded">
                  YYYYMMDD
                </code>
              </p>
              <p className="text-xs text-blue-600 mt-1.5">
                Contoh: Jika lahir 15 Agustus 1990, gunakan{" "}
                <code className="font-mono font-semibold">19900815</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}