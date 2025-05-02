// next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Permite servir imágenes desde Firebase Storage
    domains: ["firebasestorage.googleapis.com"],
    // En Next.js 13.4+ puedes usar remotePatterns para mayor control
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
