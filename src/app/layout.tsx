// src/app/layout.tsx

import "./globals.css";
import { Poppins, Merriweather_Sans } from "next/font/google";
import Script from "next/script";
import { ReactNode } from "react";
import type { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});
const merriweatherSans = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-merriweather-sans",
});

export const metadata: Metadata = {
  title: "VisitAtlántico · Explora el paraíso costero",
  description: "Descubre playas, cultura y aventuras en Atlántico, Colombia.",
  viewport: { width: "device-width", initialScale: 1 },
  robots: "index, follow",
  themeColor: "#006994",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    languages: {
      es: "https://www.visitatlantico.com",
      en: "https://en.visitatlantico.com",
    },
  },
  openGraph: {
    title: "VisitAtlántico · Explora el paraíso costero",
    description: "Descubre playas, cultura y aventuras en Atlántico, Colombia.",
    url: "https://visitatlantico.com",
    siteName: "VisitAtlántico",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Playas de Atlántico, Colombia",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisitAtlántico · Explora el paraíso costero",
    description: "Descubre playas, cultura y aventuras en Atlántico, Colombia.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweatherSans.variable}`}>
      <head>
        {/* Next.js inyecta aquí todos los meta tags definidos en `metadata` */}

        {/* Canonical URL */}
        <link rel="canonical" href="https://visitatlantico.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://visitatlantico.com",
              "name": "VisitAtlántico",
              "description": "Explora el paraíso costero del Atlántico, Colombia.",
              "publisher": {
                "@type": "Organization",
                "name": "VisitAtlántico",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://visitatlantico.com/favicon.ico"
                }
              }
            })
          }}
        />

        {/* Weglot: carga del bundle sin el widget clásico */}
        <Script
          src="https://cdn.weglot.com/weglot.min.js"
          strategy="beforeInteractive"
        />
        <Script
          id="weglot-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              Weglot.initialize({
                api_key: 'wg_69286db837a9e6437be697681a5d2bd63',
                classic: { enableXClassicWidget: false }
              });
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
