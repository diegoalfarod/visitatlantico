import "./globals.css";
import { Poppins, Merriweather_Sans } from "next/font/google";
import Script from "next/script";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${merriweatherSans.variable}`}
    >
      <head>
        <Script
          strategy="beforeInteractive"
          src="https://static.linguise.com/script/linguise.js"
        />
        <Script
          id="linguise-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.linguise = {
                api_key: "DQsjmtmecLYU2qPDPTL9I5q0gFhuFtAn",
                auto_mode: true
              };
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
