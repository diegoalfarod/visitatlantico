/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    },
    experimental: {
      optimizeCss: false // Temporalmente deshabilitado para evitar el error de critters
    },
    turbopack: {
      // Mover configuración de turbo aquí si la tienes
    },
    eslint: {
      // Durante el build de producción, no fallar por warnings
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Si es necesario, puedes ignorar errores de TypeScript temporalmente
      // ignoreBuildErrors: true,
    }
  };
  
  export default nextConfig;