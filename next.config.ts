// @ts-check
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  
  // Configuración para imágenes
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

  // Configuración para Puppeteer y PDF generation
  experimental: {
    serverComponentsExternalPackages: [
      'chrome-aws-lambda',
      'puppeteer-core',
      '@sparticuz/chromium'
    ],
  },

  // Configuración de Webpack con tipos correctos
  webpack: (
    config: import('webpack').Configuration,
    { isServer }: { isServer: boolean }
  ) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'chrome-aws-lambda': 'chrome-aws-lambda',
          'puppeteer-core': 'puppeteer-core',
          '@sparticuz/chromium': '@sparticuz/chromium'
        });
      } else if (typeof config.externals === 'object' && config.externals !== null) {
        config.externals = [
          config.externals,
          {
            'chrome-aws-lambda': 'chrome-aws-lambda',
            'puppeteer-core': 'puppeteer-core',
            '@sparticuz/chromium': '@sparticuz/chromium'
          }
        ];
      }
    }

    return config;
  },

  // Configuración para incrementar el límite de tamaño del payload
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

// Configuración específica para producción en Vercel
if (process.env.NODE_ENV === 'production') {
  nextConfig.experimental?.serverComponentsExternalPackages?.push('@sparticuz/chromium-min');
}

export default nextConfig;