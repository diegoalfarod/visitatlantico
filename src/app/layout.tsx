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
  const htmlLang = host.startsWith("en.") ? "en" : "es";

  return (
    <html
      lang={htmlLang}
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

        {/* Fuerza el idioma inglés si el subdominio es "en" */}
        <Script
          id="weglot-force-subdomain"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname.startsWith('en.')) {
                window.Weglot = window.Weglot || {};
                Weglot.options = {
                  ...Weglot.options,
                  language: 'en'
                };
                console.log('🌐 Subdomain detected: forcing English language');
              }
            `,
          }}
        />

        {/* Script principal de Weglot */}
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
                api_key: 'wg_69286db837a9e6437be697681a5d2bd63'
              });
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
