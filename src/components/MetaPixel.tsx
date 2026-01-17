"use client";

import Script from "next/script";

/**
 * Meta Pixel (Facebook Pixel) para VisitAtlántico
 *
 * INSTRUCCIONES:
 * 1. Crea un Pixel en https://business.facebook.com
 * 2. Obtén tu Pixel ID
 * 3. Agrega NEXT_PUBLIC_META_PIXEL_ID en tu .env.local
 *
 * ALTERNATIVA: Si usas GTM, puedes configurar Meta Pixel desde ahí
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function MetaPixel() {
  if (!PIXEL_ID) {
    console.warn(
      "⚠️ Meta Pixel: Configura NEXT_PUBLIC_META_PIXEL_ID en tu archivo .env.local"
    );
    return null;
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

/**
 * Hook para trackear eventos en Meta Pixel
 */
export function useMetaPixel() {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", eventName, eventParams);
    }
  };

  const trackCustomEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", eventName, eventParams);
    }
  };

  return { trackEvent, trackCustomEvent };
}

/**
 * Eventos estándar de Meta Pixel
 */
export const MetaPixelEvents = {
  // Eventos estándar
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  SEARCH: "Search",
  ADD_TO_CART: "AddToCart",
  INITIATE_CHECKOUT: "InitiateCheckout",
  PURCHASE: "Purchase",
  LEAD: "Lead",
  COMPLETE_REGISTRATION: "CompleteRegistration",

  // Eventos personalizados para VisitAtlántico
  VIEW_DESTINATION: "ViewDestination",
  VIEW_ATTRACTION: "ViewAttraction",
  DOWNLOAD_GUIDE: "DownloadGuide",
  CLICK_HOTEL: "ClickHotel",
  VIEW_EVENT: "ViewEvent",
};
