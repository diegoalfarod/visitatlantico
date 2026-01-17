import type { MetadataRoute } from "next";

/**
 * Archivo robots.txt para SEO
 * Indica a los bots de búsqueda qué pueden indexar
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: "https://visitatlantico.com/sitemap.xml",
  };
}
