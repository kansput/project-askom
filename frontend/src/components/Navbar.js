"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/utils/auth";
import { Home, User, LogOut } from "lucide-react";

export default function Navbar({ title }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const handleHome = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);

        const roleRoutes = {
          "perawat": "/dashboard/perawat",
          "kepala unit": "/dashboard/kepala-unit",
          "mitra bestari": "/dashboard/mitra-bestari",
        };

        const target =
          roleRoutes[user.role?.toLowerCase()] || "/dashboard/perawat";

        router.push(target);
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg shadow">
              <Image
                src="/Logo rumah sakit St Carolus 3.png"
                alt="Logo RS Carolus"
                width={100}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block text-lg font-semibold uppercase tracking-tight text-white">
              {title}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleHome}
              className="px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium bg-red-700 hover:bg-red-800 rounded-md transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none text-2xl"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with slide animation */}
      <div
        className={`md:hidden bg-blue-800 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={handleHome}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 rounded"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 rounded"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-sm font-medium bg-red-700 hover:bg-red-800 rounded text-white"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
