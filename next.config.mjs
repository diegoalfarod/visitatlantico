/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Necesario para Next.js 16
  turbopack: {},
  
  images: {
    // Solo remotePatterns (domains está deprecado)
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
        hostname: "appdevelopi.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;