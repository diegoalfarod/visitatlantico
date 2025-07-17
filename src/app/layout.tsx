import "@/styles/globals.css";
import "../styles/planner.css";

import { Poppins, Merriweather_Sans } from "next/font/google";
import { ReactNode } from "react";
import type { Metadata } from "next";

import ClientInitializer from "@/components/ClientInitializer";
import GeminiWidget from "@/components/gemini/GeminiWidget";
import { ViewportProvider } from "@/components/ViewportProvider";

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
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    interactiveWidget: "resizes-content",
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweatherSans.variable}`}
    >
      <head>
        <link rel="canonical" href="https://visitatlantico.com" />
        {/* Meta viewport mejorado para móviles */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" 
        />
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#006994" />
      </head>

      <body className="font-sans">
        <ViewportProvider>
          <ClientInitializer />
          {children}

          {/* 💬 Widget de chat Gemini - Solo una vez aquí */}
          <GeminiWidget />
        </ViewportProvider>

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