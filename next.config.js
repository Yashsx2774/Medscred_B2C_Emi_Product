/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "m8k2bhtr-3000.inc1.devtunnels.ms"],
      bodySizeLimit: "100mb",
    },
  },
};

module.exports = nextConfig;
