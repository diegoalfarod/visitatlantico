/** @type {import('next').NextConfig} */
const nextConfig = {
    // Habilitar modo estricto de React
    reactStrictMode: true,
    
    // Usar SWC para minificación (más rápido)
    swcMinify: true,
    
    // Configuración de imágenes
    images: {
      domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
      unoptimized: process.env.NODE_ENV === 'development',
    },
    
    // Configuración específica para desarrollo
    ...(process.env.NODE_ENV === 'development' && {
      webpack: (config) => {
        // Mejorar el watching en desarrollo
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
        return config;
      },
    }),
    
    // Deshabilitar telemetría de Next.js
    telemetry: {
      disabled: true,
    },
    
    // Configuración experimental para mejorar el rendimiento
    experimental: {
      // Optimizar el tamaño del bundle
      optimizeCss: true,
      // Mejorar la velocidad de compilación
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
    },
  };
  
  export default nextConfig;