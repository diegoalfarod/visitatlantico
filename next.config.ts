/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de i18n para subir el sitio en es y en subdominios
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    localeDetection: false,
    domains: [
      {
        domain: 'visitatlantico.com',
        defaultLocale: 'es',
      },
      {
        domain: 'en.visitatlantico.com',
        defaultLocale: 'en',
      },
    ],
  },

  images: {
    domains: ['firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
