/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}`, // frontend diakses dari LAN
      'http://localhost:3000'
    ],
  },
};

module.exports = nextConfig;
