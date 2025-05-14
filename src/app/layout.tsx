// src/app/layout.tsx

import "./globals.css";
import { Poppins, Merriweather_Sans } from "next/font/google";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";
import { headers } from "next/headers";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
const merriweatherSans = Merriweather_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-merriweather-sans" });

export const metadata = {
  title: "VisitAtlántico",
  description: "Explora el paraíso costero del Atlántico, Colombia.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host") || "";
  const isEn = host.startsWith("en.");
  const htmlLang = isEn ? "en" : "es";

  return (
    <html lang={htmlLang} className={`${poppins.variable} ${merriweatherSans.variable}`}>
      <head>
        <link rel="alternate" hrefLang="es" href="https://visitatlantico.com" />
        <link rel="alternate" hrefLang="en" href="https://en.visitatlantico.com" />
      </head>
      <body className="font-sans">
        {/* Widget de Google Translate solo en el subdominio /en */}
        {isEn && <GoogleTranslateWidget />}

        {children}
      </body>
    </html>
  );
}
