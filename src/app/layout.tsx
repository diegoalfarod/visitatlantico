// src/app/layout.tsx

import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";

const poppins = localFont({
  src: "../../public/fonts/FivoSans-Regular.woff",
  variable: "--font-poppins",
  weight: "400",
  style: "normal",
});
const merriweatherSans = localFont({
  src: "../../public/fonts/Baloo2-Regular.woff",
  variable: "--font-merriweather-sans",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "VisitAtlántico · Explora el paraíso costero",
  description: "Descubre playas, cultura y aventuras en Atlántico, Colombia.",
  robots: "index, follow",
  alternates: {
    canonical: "https://visitatlantico.com",
    languages: {
      es: "https://visitatlantico.com",
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

// Mover viewport y themeColor a generateViewport
export function generateViewport() {
  return {
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#006994",
  };
}

export default function RootLayout(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
) {
  const { children, locale = 'es' } = props;
  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${merriweatherSans.variable}`}
    >
      <head>
        {/* Next.js inyecta aquí todos los meta tags definidos en `metadata` */}

        <link rel="manifest" href="/manifest.json" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://visitatlantico.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://visitatlantico.com",
              name: "VisitAtlántico",
              description: "Explora el paraíso costero del Atlántico, Colombia.",
              publisher: {
                "@type": "Organization",
                name: "VisitAtlántico",
                logo: {
                  "@type": "ImageObject",
                  url: "https://visitatlantico.com/favicon.ico",
                },
              },
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'));}`,
          }}
        />
      </body>
    </html>
  );
}
