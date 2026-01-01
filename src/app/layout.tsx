import "@/styles/globals.css";
import "../styles/planner.css";

import { Josefin_Sans, Montserrat } from "next/font/google";
import { ReactNode } from "react";
import type { Metadata } from "next";

import ClientInitializer from "@/components/ClientInitializer";
import GeminiWidget from "@/components/gemini/GeminiWidget";

// =============================================================================
// TIPOGRAFÍAS - Marca Atlántico
// Josefin Sans: Títulos, navegación, CTAs
// Montserrat: Cuerpo de texto, descripciones
// =============================================================================

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
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

export function generateViewport() {
  return {
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#007BC4", // Azul Barranquero
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${josefinSans.variable} ${montserrat.variable}`}
    >
      <head>
        <link rel="canonical" href="https://visitatlantico.com" />
      </head>

      <body className="font-montserrat antialiased">
        <ClientInitializer />
        {children}

        {/* 💬 Widget flotante de Gemini */}
        <GeminiWidget />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://visitatlantico.com",
              name: "VisitAtlántico",
              description:
                "Explora el paraíso costero del Atlántico, Colombia.",
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
      </body>
    </html>
  );
}