/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://visitatlantico.com',
    generateRobotsTxt: true,        // genera robots.txt automáticamente
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,              // cuántas rutas por archivo
    alternateRefs: [                // para multilenguaje
      {
        href: 'https://visitatlantico.com',
        hreflang: 'es',
      },
      {
        href: 'https://en.visitatlantico.com',
        hreflang: 'en',
      },
    ],
  };
  