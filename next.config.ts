// next.config.ts
import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Configuración para imágenes
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

  // Paquetes externos que Next.js debe dejar fuera de su bundle de servidor
  serverExternalPackages: [
    'chrome-aws-lambda',
    'puppeteer-core',
    '@sparticuz/chromium',
  ],

  // Para que el build siga adelante aunque haya advertencias de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (
    config: import('webpack').Configuration,
    { isServer }: { isServer: boolean }
  ) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals || {}]

      config.externals = [
        ...externals,
        {
          'chrome-aws-lambda': 'chrome-aws-lambda',
          'puppeteer-core': 'puppeteer-core',
          '@sparticuz/chromium': '@sparticuz/chromium',
        },
      ]
    }

    return config
  },
}

if (process.env.NODE_ENV === 'production') {
  nextConfig.serverExternalPackages!.push('@sparticuz/chromium-min')
}

export default nextConfig
