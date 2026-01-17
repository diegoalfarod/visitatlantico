"use client";

import Script from "next/script";

/**
 * Google Analytics 4 para VisitAtlántico
 *
 * INSTRUCCIONES:
 * 1. Crea una propiedad GA4 en https://analytics.google.com
 * 2. Obtén tu Measurement ID (G-XXXXXXXXXX)
 * 3. Agrega NEXT_PUBLIC_GA_ID en tu .env.local
 *
 * ALTERNATIVA: Si usas GTM, puedes configurar GA4 desde ahí
 * y no necesitas este componente
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export function GoogleAnalytics() {
  if (!GA_ID) {
    console.warn(
      "⚠️ Google Analytics: Configura NEXT_PUBLIC_GA_ID en tu archivo .env.local"
    );
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Hook para trackear eventos en GA4
 */
export function useGA() {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, eventParams);
    }
  };

  return { trackEvent };
}
