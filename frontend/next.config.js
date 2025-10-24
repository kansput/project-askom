/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'http://172.16.158.78:3000', // frontend diakses dari LAN
      'http://localhost:3000'
    ],
  },
};

module.exports = nextConfig;
