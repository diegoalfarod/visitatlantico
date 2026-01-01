/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    /* dominios con URL fija */
    domains: [
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com',
      'maps.googleapis.com',
      'images.unsplash.com',
      'appdevelopi.s3.us-east-1.amazonaws.com', // ✨ Agregado para S3
    ],
    
    /* patrones remotos (subdominios variables y APIs) */
    remotePatterns: [
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
        hostname: "appdevelopi.s3.us-east-1.amazonaws.com", // ✨ Agregado para S3
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizeCss: false
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;