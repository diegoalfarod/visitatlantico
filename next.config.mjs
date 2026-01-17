/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Configuración optimizada para Core Web Vitals
    remotePatterns: [
      {
        protocol: "https",
        hostname: "visitatlantico.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "cdn.visitatlantico.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/maps/api/place/photo/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "appdevelopi.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    // Formatos modernos para mejor performance
    formats: ["image/avif", "image/webp"],
    // Tamaños responsive optimizados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;