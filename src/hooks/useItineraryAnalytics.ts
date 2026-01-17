// src/hooks/useItineraryAnalytics.ts
// Hook para trackear analytics desde el cliente

import { useEffect, useRef, useCallback } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os?: string;
  browser?: string;
  screenWidth?: number;
  screenHeight?: number;
}

interface TrafficInfo {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

interface SessionData {
  sessionId: string;
  device: DeviceInfo;
  traffic: TrafficInfo;
  language: string;
  timezone: string;
  isNewUser: boolean;
  visitCount: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  return 'desktop';
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { type: 'desktop' };
  }

  const ua = navigator.userAgent;
  
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  let browser = 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  return {
    type: detectDeviceType(),
    os,
    browser,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  };
}

function getTrafficSource(): TrafficInfo {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer;

  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');

  let inferredSource = source;
  if (!inferredSource && referrer) {
    if (referrer.includes('google.com')) inferredSource = 'google';
    else if (referrer.includes('facebook.com')) inferredSource = 'facebook';
    else if (referrer.includes('instagram.com')) inferredSource = 'instagram';
    else if (referrer.includes('twitter.com') || referrer.includes('x.com')) inferredSource = 'twitter';
    else if (referrer.includes('linkedin.com')) inferredSource = 'linkedin';
    else if (referrer.includes('tiktok.com')) inferredSource = 'tiktok';
    else {
      try {
        inferredSource = new URL(referrer).hostname;
      } catch {
        inferredSource = 'unknown';
      }
    }
  }

  return {
    source: inferredSource || 'direct',
    medium: medium || (referrer ? 'referral' : 'none'),
    campaign: campaign || undefined,
    referrer: referrer || undefined
  };
}

function getOrCreateSession(): SessionData {
  const SESSION_KEY = 'va_session';
  const VISIT_COUNT_KEY = 'va_visit_count';
  
  if (typeof window === 'undefined') {
    return {
      sessionId: generateSessionId(),
      device: { type: 'desktop' },
      traffic: {},
      language: 'es',
      timezone: 'America/Bogota',
      isNewUser: true,
      visitCount: 1
    };
  }

  // Verificar sesión existente
  let sessionId: string;
  let isNewUser = true;
  let visitCount = 1;

  const existingSession = sessionStorage.getItem(SESSION_KEY);
  if (existingSession) {
    sessionId = existingSession;
  } else {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // Contar visitas
  const storedVisits = localStorage.getItem(VISIT_COUNT_KEY);
  if (storedVisits) {
    isNewUser = false;
    visitCount = parseInt(storedVisits, 10) + 1;
  }
  localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());

  return {
    sessionId,
    device: getDeviceInfo(),
    traffic: getTrafficSource(),
    language: navigator.language || 'es',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota',
    isNewUser,
    visitCount
  };
}

// =============================================================================
// HOOK: useItineraryAnalytics
// =============================================================================

export function useItineraryAnalytics() {
  const sessionRef = useRef<SessionData | null>(null);
  const plannerStartTimeRef = useRef<number | null>(null);

  // Inicializar sesión
  useEffect(() => {
    sessionRef.current = getOrCreateSession();
  }, []);

  // Obtener datos de sesión para enviar con requests
  const getSessionData = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = getOrCreateSession();
    }
    return sessionRef.current;
  }, []);

  // Iniciar timer del planner
  const startPlannerTimer = useCallback(() => {
    plannerStartTimeRef.current = Date.now();
  }, []);

  // Obtener tiempo en el planner
  const getPlannerTime = useCallback(() => {
    if (!plannerStartTimeRef.current) return 0;
    return Date.now() - plannerStartTimeRef.current;
  }, []);

  // Preparar datos de analytics para el request de generación
  const getAnalyticsPayload = useCallback(() => {
    const session = getSessionData();
    return {
      sessionId: session.sessionId,
      device: session.device,
      traffic: session.traffic,
      language: session.language,
      timezone: session.timezone,
      isNewUser: session.isNewUser,
      visitCount: session.visitCount,
      funnelTime: getPlannerTime()
    };
  }, [getSessionData, getPlannerTime]);

  return {
    getSessionData,
    startPlannerTimer,
    getPlannerTime,
    getAnalyticsPayload
  };
}

// =============================================================================
// HOOK: useItineraryEngagement
// =============================================================================

interface UseItineraryEngagementProps {
  itineraryId: string;
  enabled?: boolean;
}

export function useItineraryEngagement({ itineraryId, enabled = true }: UseItineraryEngagementProps) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const hasTrackedViewRef = useRef<boolean>(false);

  // Trackear vista inicial
  useEffect(() => {
    if (!enabled || !itineraryId || hasTrackedViewRef.current) return;

    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'view',
            itineraryId
          })
        });
        hasTrackedViewRef.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [itineraryId, enabled]);

  // Trackear scroll depth
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  // Trackear tiempo en página al salir
  useEffect(() => {
    if (!enabled || !itineraryId) return;

    const trackTimeOnPage = async () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'time_update',
            itineraryId,
            data: {
              timeOnPage,
              scrollDepth: maxScrollRef.current
            }
          })
        });
      } catch (error) {
        console.error('Error tracking time:', error);
      }
    };

    // Trackear al salir de la página
    const handleBeforeUnload = () => {
      // Usar sendBeacon para asegurar que se envíe
      const data = JSON.stringify({
        event: 'time_update',
        itineraryId,
        data: {
          timeOnPage: Math.round((Date.now() - startTimeRef.current) / 1000),
          scrollDepth: maxScrollRef.current
        }
      });
      
      navigator.sendBeacon('/api/analytics/track', data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // También trackear periódicamente
    const interval = setInterval(trackTimeOnPage, 30000); // cada 30 segundos

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      trackTimeOnPage(); // Trackear al desmontar
    };
  }, [itineraryId, enabled]);

  // Función para trackear share
  const trackShare = useCallback(async (method: string) => {
    if (!enabled || !itineraryId) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'share',
          itineraryId,
          data: { shareMethod: method }
        })
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [itineraryId, enabled]);

  // Función para trackear descarga de PDF
  const trackPdfDownload = useCallback(async () => {
    if (!enabled || !itineraryId) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'pdf',
          itineraryId
        })
      });
    } catch (error) {
      console.error('Error tracking PDF:', error);
    }
  }, [itineraryId, enabled]);

  // Función para trackear click en lugar
  const trackPlaceClick = useCallback(async (placeId: string) => {
    if (!enabled || !itineraryId) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'place_click',
          itineraryId,
          data: { placeId }
        })
      });
    } catch (error) {
      console.error('Error tracking place click:', error);
    }
  }, [itineraryId, enabled]);

  return {
    trackShare,
    trackPdfDownload,
    trackPlaceClick
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { getOrCreateSession, getDeviceInfo, getTrafficSource };
export type { SessionData, DeviceInfo, TrafficInfo };