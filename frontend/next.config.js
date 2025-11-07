/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ===================================
  // GAMBAR EKSTERNAL (SOLUSI UTAMA)
  // ===================================
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "172.16.158.78",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },

  // ===================================
  // DEV ORIGINS (UNTUK CORS / LAN)
  // ===================================
  experimental: {
    // Izinkan akses dari LAN (misal: http://192.168.x.x:3000)
    allowedDevOrigins: [
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}`, // contoh: http://172.16.158.78:3000
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
  },

  // ===================================
  // ENV VALIDATION (OPSIONAL)
  // ===================================
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;