// src/app/layout.tsx
declare global {
  interface Window {
    Weglot: any;
  }
}

import "./globals.css";
import { Poppins, Merriweather_Sans } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";

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

export const metadata = {
  title: "VisitAtlántico",
  description: "Explora el paraíso costero del Atlántico, Colombia.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host") || "";
  const isEn = host.startsWith("en.");

  return (
    <html
      lang={isEn ? "en" : "es"}
      className={`${poppins.variable} ${merriweatherSans.variable}`}
    >
      <head>
        <link
          rel="alternate"
          hrefLang="es"
          href="https://www.visitatlantico.com"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://en.visitatlantico.com"
        />

        <Script
          src="https://cdn.weglot.com/weglot.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window.Weglot !== "undefined") {
              if (isEn) {
                window.Weglot.options = {
                  ...window.Weglot.options,
                  language: "en",
                };
              }
              window.Weglot.initialize({
                api_key: "wg_69286db837a9e6437be697681a5d2bd63",
              });
            }
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
