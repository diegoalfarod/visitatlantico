"use client";

/**
 * Google Tag Manager para VisitAtlántico
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crea una cuenta en https://tagmanager.google.com
 * 2. Obtén tu ID de contenedor (GTM-XXXXXXX)
 * 3. Reemplaza 'GTM-XXXXXXX' con tu ID real
 * 4. Configura tags en GTM para:
 *    - Google Analytics 4
 *    - Meta Pixel
 *    - Conversiones personalizadas
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX";

export function GoogleTagManager() {
  if (GTM_ID === "GTM-XXXXXXX") {
    console.warn(
      "⚠️ Google Tag Manager: Configura NEXT_PUBLIC_GTM_ID en tu archivo .env.local"
    );
  }

  return (
    <script
      id="gtm-script"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `,
      }}
    />
  );
}

export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

/**
 * Hook para trackear eventos personalizados
 *
 * @example
 * const { trackEvent } = useGTM();
 * trackEvent('view_destination', { destination: 'Salinas del Rey' });
 */
export function useGTM() {
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
  };

  return { trackEvent };
}

/**
 * Componente para trackear vistas de página automáticamente
 */
export function GTMPageView() {
  const { trackEvent } = useGTM();

  if (typeof window !== "undefined") {
    trackEvent("page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }

  return null;
}
