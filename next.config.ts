/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["es", "en", "fr"], // Puedes agregar más si los activas en Linguise
    defaultLocale: "es",
  },
};

export default nextConfig;
