// src/app/layout.tsx

import "./globals.css";
import { Poppins, Merriweather_Sans } from "next/font/google";
import Script from "next/script";
import { ReactNode } from "react";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${merriweatherSans.variable}`}>
      <head>
        {/* SEO hreflang */}
        <link rel="alternate" hrefLang="es" href="https://visitatlantico.com" />
        <link rel="alternate" hrefLang="en" href="https://en.visitatlantico.com" />

        {/* ConveyThis Script Start */}
        <Script
          src="//cdn.conveythis.com/javascript/conveythis.js?api_key=pub_a9e8672d5a83d272d4d95dc2045c6170"
          strategy="beforeInteractive"
        />
        {/* ConveyThis Script End */}
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
