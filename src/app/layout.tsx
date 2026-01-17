import "@/styles/globals.css";
import "../styles/planner.css";

import { Josefin_Sans, Montserrat } from "next/font/google";
import { ReactNode, Suspense } from "react";
import type { Metadata } from "next";

import ClientInitializer from "@/components/ClientInitializer";
import GeminiWidget from "@/components/gemini/GeminiWidget";
import TopLoadingBar from "@/components/TopLoadingBar";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/GoogleTagManager";
import {
  OrganizationSchema,
  WebSiteSchema,
} from "@/components/schemas/OrganizationSchema";

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
  metadataBase: new URL("https://visitatlantico.com"),
  title: {
    default: "VisitAtlántico | Turismo en el Caribe Colombiano 🌴",
    template: "%s | VisitAtlántico",
  },
  description:
    "Descubre el Atlántico: Carnaval de Barranquilla (Patrimonio UNESCO), playas Blue Flag certificadas, gastronomía caribeña auténtica y 17 municipios llenos de cultura. Tu aventura en el Caribe colombiano comienza aquí.",
  keywords: [
    "turismo atlántico colombia",
    "carnaval de barranquilla",
    "playas atlántico",
    "salinas del rey blue flag",
    "puerto velero kitesurf",
    "turismo barranquilla",
    "gastronomía caribeña",
    "ecoturismo atlántico",
    "qué hacer en barranquilla",
    "mejores playas colombia",
  ],
  authors: [{ name: "VisitAtlántico" }],
  creator: "VisitAtlántico",
  publisher: "VisitAtlántico",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-CO": "/es",
      "en-US": "/en",
    },
  },
  openGraph: {
    siteName: "VisitAtlántico",
    locale: "es_CO",
    type: "website",
    title: "VisitAtlántico | Turismo en el Caribe Colombiano 🌴",
    description:
      "✨ Carnaval de Barranquilla (UNESCO) | 🏖️ Playas Blue Flag | 🍽️ Gastronomía Caribeña | 🎭 17 Municipios de Cultura y Tradición. Planifica tu viaje perfecto al Atlántico, Colombia.",
    url: "https://visitatlantico.com",
    images: [
      {
        url: "/images/og-image-main.jpg",
        width: 1200,
        height: 630,
        alt: "Atlántico, Colombia - Carnaval de Barranquilla, Playas Blue Flag y Cultura Caribeña",
        type: "image/jpeg",
      },
      {
        url: "/images/og-image-carnaval.jpg",
        width: 1200,
        height: 630,
        alt: "Carnaval de Barranquilla - Patrimonio UNESCO",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@visitatlantico",
    creator: "@visitatlantico",
    title: "VisitAtlántico | Turismo en el Caribe Colombiano 🌴",
    description:
      "🎉 Carnaval UNESCO | 🏖️ Playas Blue Flag | 🌮 Gastronomía Auténtica. Descubre 17 municipios llenos de magia en el Atlántico, Colombia.",
    images: ["/images/og-image-main.jpg"],
  },
  verification: {
    google: "tu-codigo-de-verificacion-google",
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
        {/* Google Tag Manager */}
        <GoogleTagManager />
        {/* Structured Data for SEO */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>

      <body className="font-montserrat antialiased">
        {/* Google Tag Manager (noscript) */}
        <GoogleTagManagerNoScript />

        <ClientInitializer />

        {/* 🎯 Barra de progreso global */}
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>

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