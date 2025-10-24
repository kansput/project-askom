// components/CardItemRect.js
"use client";
import Image from "next/image";
import Link from "next/link";

export default function CardItemRect({ image, title, href }) {
  const safeImage = image || "/default.png";

  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
        {/* Gambar Landscape */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
          <Image
            src={safeImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Konten */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
            {title}
          </h3>
          <div className="mt-2 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium">Lihat Detail</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Dekorasi sudut */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 opacity-5 rounded-bl-3xl"></div>
      </div>
    </Link>
  );
}