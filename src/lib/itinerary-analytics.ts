// src/lib/itinerary-analytics.ts
// Sistema de analytics para itinerarios generados

import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    increment,
    arrayUnion,
    Timestamp 
  } from 'firebase/firestore';
  
  // =============================================================================
  // TIPOS DE ANALYTICS
  // =============================================================================
  
  /**
   * Datos del usuario/sesión (anónimo)
   */
  export interface UserSessionData {
    sessionId: string;
    
    // Información del dispositivo
    device: {
      type: 'mobile' | 'tablet' | 'desktop';
      os?: string;
      browser?: string;
      screenWidth?: number;
      screenHeight?: number;
    };
    
    // Ubicación aproximada (si disponible)
    location?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
    
    // Fuente de tráfico
    traffic: {
      source?: string;      // google, facebook, direct, etc.
      medium?: string;      // organic, cpc, referral, etc.
      campaign?: string;    // nombre de campaña
      referrer?: string;    // URL de referencia
    };
    
    // Idioma preferido
    language?: string;
    
    // Primera visita vs recurrente
    isNewUser: boolean;
    visitCount: number;
  }
  
  /**
   * Datos del itinerario generado
   */
  export interface ItineraryAnalytics {
    // Identificadores
    itineraryId: string;
    sessionId: string;
    
    // Timestamps
    createdAt: Date;
    generationTime: number; // ms que tomó generar
    
    // Perfil del viajero
    profile: {
      days: number;
      tripType: string;
      budget: string;
      pace: string;
      interests: string[];
      startLocation?: string;
    };
    
    // Resultado
    result: {
      success: boolean;
      totalStops: number;
      totalDays: number;
      estimatedCost: number;
      municipalities: string[];
      categories: string[];
      aiModel: 'claude' | 'local';
      personalizationScore: number;
    };
    
    // Sesión del usuario
    session: UserSessionData;
    
    // Engagement posterior (se actualiza después)
    engagement?: {
      viewed: boolean;
      viewedAt?: Date;
      timeOnPage?: number;      // segundos
      scrollDepth?: number;     // porcentaje
      sharedVia?: string[];     // whatsapp, email, copy
      savedToPdf?: boolean;
      clickedPlace?: string[];  // IDs de lugares clickeados
    };
  }
  
  /**
   * Agregados diarios para dashboard
   */
  export interface DailyAggregates {
    date: string; // YYYY-MM-DD
    
    // Conteos
    totalItineraries: number;
    successfulGenerations: number;
    failedGenerations: number;
    
    // Distribución de días
    dayDistribution: Record<number, number>; // { 1: 5, 2: 12, 3: 45, ... }
    
    // Distribución de tipo de viaje
    tripTypeDistribution: Record<string, number>;
    
    // Distribución de presupuesto
    budgetDistribution: Record<string, number>;
    
    // Intereses más populares
    interestCounts: Record<string, number>;
    
    // Lugares más incluidos en itinerarios
    placeInclusionCounts: Record<string, number>;
    
    // Métricas de engagement
    totalViews: number;
    averageTimeOnPage: number;
    shareCount: number;
    
    // Fuentes de tráfico
    trafficSources: Record<string, number>;
    
    // Dispositivos
    deviceTypes: Record<string, number>;
  }
  
  /**
   * Evento de funnel del planner
   */
  export interface PlannerFunnelEvent {
    sessionId: string;
    timestamp: Date;
    step: number;
    stepName: string;
    action: 'enter' | 'complete' | 'abandon';
    timeSpent: number; // segundos en el paso
    selections?: Record<string, any>; // qué seleccionó en ese paso
  }
  
  // =============================================================================
  // CLASE PRINCIPAL DE ANALYTICS
  // =============================================================================
  
  export class ItineraryAnalyticsService {
    private db: ReturnType<typeof getFirestore> | null = null;
    private isEnabled: boolean = false;
  
    constructor(firebaseApp?: any) {
      if (firebaseApp) {
        try {
          this.db = getFirestore(firebaseApp);
          this.isEnabled = true;
          console.log('✅ Analytics service initialized');
        } catch (error) {
          console.error('Error initializing analytics:', error);
          this.isEnabled = false;
        }
      }
    }
  
    // ===========================================================================
    // TRACKING DE ITINERARIOS
    // ===========================================================================
  
    /**
     * Registrar un itinerario generado
     */
    async trackItineraryGenerated(data: ItineraryAnalytics): Promise<void> {
      if (!this.isEnabled || !this.db) {
        console.log('Analytics disabled, skipping track');
        return;
      }
  
      try {
        // 1. Guardar documento individual del itinerario
        const itineraryRef = doc(this.db, 'analytics_itineraries', data.itineraryId);
        await setDoc(itineraryRef, {
          ...data,
          createdAt: Timestamp.fromDate(data.createdAt),
          updatedAt: Timestamp.now()
        });
  
        // 2. Actualizar agregados diarios
        await this.updateDailyAggregates(data);
  
        // 3. Actualizar contadores globales
        await this.updateGlobalCounters(data);
  
        console.log(`📊 Analytics tracked for itinerary: ${data.itineraryId}`);
      } catch (error) {
        console.error('Error tracking itinerary:', error);
        // No lanzar error - analytics no debe romper el flujo principal
      }
    }
  
    /**
     * Actualizar engagement de un itinerario
     */
    async trackItineraryEngagement(
      itineraryId: string,
      engagement: Partial<ItineraryAnalytics['engagement']>
    ): Promise<void> {
      if (!this.isEnabled || !this.db) return;
  
      try {
        const itineraryRef = doc(this.db, 'analytics_itineraries', itineraryId);
        
        const updateData: Record<string, any> = {
          'engagement.viewed': true,
          'engagement.viewedAt': Timestamp.now(),
          updatedAt: Timestamp.now()
        };
  
        if (engagement.timeOnPage) {
          updateData['engagement.timeOnPage'] = engagement.timeOnPage;
        }
        if (engagement.scrollDepth) {
          updateData['engagement.scrollDepth'] = engagement.scrollDepth;
        }
        if (engagement.sharedVia) {
          updateData['engagement.sharedVia'] = arrayUnion(...engagement.sharedVia);
        }
        if (engagement.savedToPdf) {
          updateData['engagement.savedToPdf'] = true;
        }
        if (engagement.clickedPlace) {
          updateData['engagement.clickedPlace'] = arrayUnion(...engagement.clickedPlace);
        }
  
        await updateDoc(itineraryRef, updateData);
      } catch (error) {
        console.error('Error tracking engagement:', error);
      }
    }
  
    // ===========================================================================
    // TRACKING DE FUNNEL
    // ===========================================================================
  
    /**
     * Registrar evento del funnel del planner
     */
    async trackFunnelEvent(event: PlannerFunnelEvent): Promise<void> {
      if (!this.isEnabled || !this.db) return;
  
      try {
        const eventId = `${event.sessionId}_${event.step}_${Date.now()}`;
        const eventRef = doc(this.db, 'analytics_funnel', eventId);
        
        await setDoc(eventRef, {
          ...event,
          timestamp: Timestamp.fromDate(event.timestamp)
        });
  
        // Actualizar agregados de funnel
        const today = new Date().toISOString().split('T')[0];
        const dailyFunnelRef = doc(this.db, 'analytics_funnel_daily', today);
        
        await setDoc(dailyFunnelRef, {
          [`step${event.step}_${event.action}`]: increment(1),
          updatedAt: Timestamp.now()
        }, { merge: true });
  
      } catch (error) {
        console.error('Error tracking funnel event:', error);
      }
    }
  
    // ===========================================================================
    // AGREGADOS
    // ===========================================================================
  
    /**
     * Actualizar agregados diarios
     */
    private async updateDailyAggregates(data: ItineraryAnalytics): Promise<void> {
      if (!this.db) return;
  
      const today = new Date().toISOString().split('T')[0];
      const dailyRef = doc(this.db, 'analytics_daily', today);
  
      const updates: Record<string, any> = {
        date: today,
        totalItineraries: increment(1),
        updatedAt: Timestamp.now()
      };
  
      // Resultado
      if (data.result.success) {
        updates.successfulGenerations = increment(1);
      } else {
        updates.failedGenerations = increment(1);
      }
  
      // Distribución de días
      updates[`dayDistribution.${data.profile.days}`] = increment(1);
  
      // Distribución de tipo de viaje
      updates[`tripTypeDistribution.${data.profile.tripType}`] = increment(1);
  
      // Distribución de presupuesto
      updates[`budgetDistribution.${data.profile.budget}`] = increment(1);
  
      // Intereses
      for (const interest of data.profile.interests) {
        updates[`interestCounts.${interest}`] = increment(1);
      }
  
      // Fuente de tráfico
      if (data.session.traffic.source) {
        updates[`trafficSources.${data.session.traffic.source}`] = increment(1);
      }
  
      // Tipo de dispositivo
      updates[`deviceTypes.${data.session.device.type}`] = increment(1);
  
      await setDoc(dailyRef, updates, { merge: true });
    }
  
    /**
     * Actualizar contadores globales
     */
    private async updateGlobalCounters(data: ItineraryAnalytics): Promise<void> {
      if (!this.db) return;
  
      const globalRef = doc(this.db, 'analytics_global', 'counters');
  
      const updates: Record<string, any> = {
        totalItineraries: increment(1),
        lastUpdated: Timestamp.now()
      };
  
      // Lugares incluidos en itinerarios
      for (const municipality of data.result.municipalities) {
        updates[`municipalityCounts.${municipality}`] = increment(1);
      }
  
      // Por tipo de viaje
      updates[`lifetimeTripTypes.${data.profile.tripType}`] = increment(1);
  
      await setDoc(globalRef, updates, { merge: true });
    }
  }
  
  // =============================================================================
  // FUNCIONES HELPER PARA RECOLECTAR DATOS
  // =============================================================================
  
  /**
   * Generar ID de sesión único
   */
  export function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Detectar tipo de dispositivo
   */
  export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
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
  
  /**
   * Obtener información del dispositivo
   */
  export function getDeviceInfo(): UserSessionData['device'] {
    if (typeof window === 'undefined') {
      return { type: 'desktop' };
    }
  
    const ua = navigator.userAgent;
    
    // Detectar OS
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
    // Detectar browser
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
  
  /**
   * Obtener fuente de tráfico desde URL
   */
  export function getTrafficSource(): UserSessionData['traffic'] {
    if (typeof window === 'undefined') {
      return {};
    }
  
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
  
    // UTM parameters
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
  
    // Si no hay UTM, inferir de referrer
    let inferredSource = source;
    if (!inferredSource && referrer) {
      if (referrer.includes('google.com')) inferredSource = 'google';
      else if (referrer.includes('facebook.com')) inferredSource = 'facebook';
      else if (referrer.includes('instagram.com')) inferredSource = 'instagram';
      else if (referrer.includes('twitter.com') || referrer.includes('x.com')) inferredSource = 'twitter';
      else if (referrer.includes('linkedin.com')) inferredSource = 'linkedin';
      else if (referrer.includes('tiktok.com')) inferredSource = 'tiktok';
      else inferredSource = new URL(referrer).hostname;
    }
  
    return {
      source: inferredSource || 'direct',
      medium: medium || (referrer ? 'referral' : 'none'),
      campaign: campaign || undefined,
      referrer: referrer || undefined
    };
  }
  
  /**
   * Obtener timezone del usuario
   */
  export function getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Crear objeto de sesión completo
   */
  export function createSessionData(existingSessionId?: string): UserSessionData {
    const sessionId = existingSessionId || generateSessionId();
    
    // Verificar si es usuario nuevo (no tiene sessionId guardado)
    let isNewUser = true;
    let visitCount = 1;
    
    if (typeof localStorage !== 'undefined') {
      const storedVisits = localStorage.getItem('va_visit_count');
      if (storedVisits) {
        isNewUser = false;
        visitCount = parseInt(storedVisits, 10) + 1;
      }
      localStorage.setItem('va_visit_count', visitCount.toString());
    }
  
    return {
      sessionId,
      device: getDeviceInfo(),
      location: {
        timezone: getUserTimezone()
      },
      traffic: getTrafficSource(),
      language: typeof navigator !== 'undefined' ? navigator.language : 'es',
      isNewUser,
      visitCount
    };
  }
  
  // =============================================================================
  // FUNCIONES PARA USAR EN EL FRONTEND
  // =============================================================================
  
  /**
   * Hook-friendly function para crear analytics data
   */
  export function createItineraryAnalyticsData(params: {
    itineraryId: string;
    sessionData: UserSessionData;
    profile: ItineraryAnalytics['profile'];
    result: ItineraryAnalytics['result'];
    generationTime: number;
  }): ItineraryAnalytics {
    return {
      itineraryId: params.itineraryId,
      sessionId: params.sessionData.sessionId,
      createdAt: new Date(),
      generationTime: params.generationTime,
      profile: params.profile,
      result: params.result,
      session: params.sessionData
    };
  }
  
  // =============================================================================
  // EXPORT SINGLETON
  // =============================================================================
  
  let analyticsInstance: ItineraryAnalyticsService | null = null;
  
  export function initializeAnalytics(firebaseApp: any): ItineraryAnalyticsService {
    if (!analyticsInstance) {
      analyticsInstance = new ItineraryAnalyticsService(firebaseApp);
    }
    return analyticsInstance;
  }
  
  export function getAnalyticsService(): ItineraryAnalyticsService | null {
    return analyticsInstance;
  }
  
  export default ItineraryAnalyticsService;