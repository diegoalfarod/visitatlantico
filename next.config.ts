/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    /* dominios con URL fija */
    domains: [
      "firebasestorage.googleapis.com",
      "maps.googleapis.com", // para Static Maps u otros endpoints fijos
    ],

    /* patrones remotos (subdominios variables de Google Photos) */
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh4.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh5.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "lh6.googleusercontent.com", pathname: "/**" },
    ],
  },

  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
