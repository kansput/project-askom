"use client";
import Image from "next/image";
import Link from "next/link";

export default function CardItem({ image, title, href }) {
  const safeImage = image || "/default.png";

  const CardContent = (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gradient Background Accent */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-br from-blue-900 to-blue-700"></div>

      {/* Content Container */}
      <div className="relative pt-4 pb-4 px-4 flex flex-col items-center">
        {/* Image */}
        <div className="relative mb-3">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-300"></div>
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white shadow-lg group-hover:ring-blue-100 transition-all duration-300">
            <Image
              src={safeImage}
              alt={title}
              width={80}
              height={80}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Title */}
        <div className="w-full">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-3 py-2 border border-blue-200 group-hover:border-blue-300 transition-all duration-300">
            <p className="text-xs font-semibold text-gray-800 text-center leading-tight group-hover:text-blue-700 transition-colors duration-300">
              {title}
            </p>
          </div>
        </div>

        {/* Hover Arrow */}
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-blue-400 opacity-10 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-10 h-10 bg-blue-400 opacity-10 rounded-tr-full"></div>
    </div>
  );

  // Jika href ada → pakai Link, kalau tidak → tampilkan Card statis
  return href ? (
    <Link href={href} className="group">
      {CardContent}
    </Link>
  ) : (
    <div className="cursor-not-allowed opacity-70">{CardContent}</div>
  );
}
