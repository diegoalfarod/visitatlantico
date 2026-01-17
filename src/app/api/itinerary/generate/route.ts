// src/app/api/itinerary/generate/route.ts
// Versión con Analytics integrado

import { NextRequest, NextResponse } from "next/server";
import ClaudeItineraryEnhancer, { 
  type ItineraryProfile,
  type GeneratedItinerary 
} from '@/lib/claudeItineraryEnhancer';
import { getPlaceById } from '@/data/atlantico-places';

// =============================================================================
// TIPOS
// =============================================================================

interface RequestBody {
  profile: {
    days: number;
    email: string;
    interests: string[];
    tripType: string;
    budget: string;
    travelPace?: string;
    maxDistance?: string;
    startLocation?: any;
    itineraryRequestId?: string;
  };
  // Analytics data del cliente
  analytics?: {
    sessionId?: string;
    device?: {
      type: string;
      os?: string;
      browser?: string;
      screenWidth?: number;
      screenHeight?: number;
    };
    traffic?: {
      source?: string;
      medium?: string;
      campaign?: string;
      referrer?: string;
    };
    language?: string;
    timezone?: string;
    isNewUser?: boolean;
    visitCount?: number;
    funnelTime?: number; // tiempo total en el planner (ms)
  };
}

// =============================================================================
// MAPEO DE VALORES DEL FRONTEND
// =============================================================================

function mapTripType(type: string): 'solo' | 'pareja' | 'familia' | 'amigos' {
  const typeMap: Record<string, 'solo' | 'pareja' | 'familia' | 'amigos'> = {
    'solo': 'solo',
    'pareja': 'pareja',
    'solo_pareja': 'pareja',
    'familia': 'familia',
    'amigos': 'amigos',
    'grupo': 'amigos',
  };
  return typeMap[type] || 'familia';
}

function mapBudget(budget: string): 'economico' | 'moderado' | 'premium' {
  const budgetMap: Record<string, 'economico' | 'moderado' | 'premium'> = {
    'economico': 'economico',
    'moderado': 'moderado',
    'premium': 'premium',
  };
  return budgetMap[budget] || 'moderado';
}

function mapPace(pace?: string): 'relajado' | 'moderado' | 'intenso' {
  const paceMap: Record<string, 'relajado' | 'moderado' | 'intenso'> = {
    'relajado': 'relajado',
    'relaxed': 'relajado',
    'moderado': 'moderado',
    'moderate': 'moderado',
    'normal': 'moderado',
    'intenso': 'intenso',
    'intensive': 'intenso',
    'packed': 'intenso',
  };
  return paceMap[pace || 'moderado'] || 'moderado';
}

// =============================================================================
// CONVERTIR A FORMATO DEL FRONTEND
// =============================================================================

interface FrontendActivity {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  location: {
    address: string;
    municipality: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  tips: string[];
  pricing: string;
  rating?: number;
  photos: string[];
  whyRecommended: string;
}

interface FrontendDay {
  day: number;
  date: string;
  title: string;
  description: string;
  theme: string;
  municipality: string;
  activities: FrontendActivity[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  estimatedCost: number;
}

function convertToFrontendFormat(itinerary: GeneratedItinerary): { days: FrontendDay[] } {
  const days: FrontendDay[] = [];

  for (const day of itinerary.days) {
    const activities: FrontendActivity[] = [];

    for (const stop of day.stops) {
      const placeData = getPlaceById(stop.placeId);

      activities.push({
        id: stop.placeId,
        name: stop.name,
        description: stop.personalizedDescription,
        time: stop.startTime,
        duration: `${stop.durationMinutes} min`,
        location: {
          address: placeData?.address || '',
          municipality: placeData?.municipality || day.municipality,
          coordinates: placeData?.coordinates
        },
        category: stop.category,
        tips: [stop.localTip, ...stop.activities].filter(Boolean),
        pricing: formatPrice(stop.estimatedCost),
        rating: placeData?.rating,
        photos: placeData?.images || [],
        whyRecommended: stop.whyHere
      });
    }

    days.push({
      day: day.day,
      date: getDateForDay(day.day),
      title: day.title,
      description: day.description,
      theme: day.theme,
      municipality: day.municipality,
      activities,
      meals: day.meals,
      estimatedCost: day.totalCost
    });
  }

  return { days };
}

function formatPrice(amount: number): string {
  if (amount === 0) return 'Gratis';
  if (amount < 10000) return `$${amount.toLocaleString('es-CO')} COP`;
  return `$${Math.round(amount / 1000)}k COP`;
}

function getDateForDay(dayNumber: number): string {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dayNumber - 1);
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return targetDate.toLocaleDateString('es-CO', options);
}

// =============================================================================
// GUARDAR EN FIREBASE CON ANALYTICS
// =============================================================================

async function saveToFirebaseWithAnalytics(
  itineraryId: string,
  itinerary: GeneratedItinerary,
  frontendData: { days: FrontendDay[] },
  profile: any,
  analytics: RequestBody['analytics'],
  generationTimeMs: number
): Promise<void> {
  if (!process.env.FIREBASE_SERVICE_JSON) {
    console.warn('Firebase no configurado, saltando guardado');
    return;
  }

  try {
    const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // =========================================================================
    // 1. GUARDAR ITINERARIO GENERADO
    // =========================================================================
    await db.collection("generated_itineraries").doc(itineraryId).set({
      days: frontendData.days,
      profile: {
        days: profile.days,
        interests: profile.interests,
        tripType: profile.tripType,
        budget: profile.budget,
        pace: profile.travelPace,
        email: profile.email,
        startLocation: profile.startLocation
      },
      metadata: {
        ...itinerary.metadata,
        createdAt: now,
        version: '2.0-claude',
        dataSource: 'curated_places_db'
      },
      validation: itinerary.validation
    });

    // =========================================================================
    // 2. GUARDAR ANALYTICS DEL ITINERARIO
    // =========================================================================
    const analyticsData = {
      // Identificadores
      itineraryId,
      sessionId: analytics?.sessionId || 'unknown',
      
      // Timestamps
      createdAt: now,
      generationTimeMs,
      
      // Perfil del viajero
      profile: {
        days: profile.days,
        tripType: profile.tripType,
        budget: profile.budget,
        pace: profile.travelPace || 'moderado',
        interests: profile.interests,
        startLocation: profile.startLocation || 'barranquilla_centro'
      },
      
      // Resultado de la generación
      result: {
        success: itinerary.validation.isValid,
        totalStops: itinerary.metadata.totalStops,
        totalDays: itinerary.metadata.totalDays,
        estimatedCost: itinerary.metadata.totalCost,
        municipalities: [...new Set(itinerary.days.map(d => d.municipality))],
        categories: [...new Set(itinerary.days.flatMap(d => d.stops.map(s => s.category)))],
        aiModel: itinerary.metadata.personalizationScore > 75 ? 'claude' : 'local',
        personalizationScore: itinerary.metadata.personalizationScore
      },
      
      // Datos del usuario/sesión
      session: {
        device: analytics?.device || { type: 'unknown' },
        traffic: analytics?.traffic || { source: 'unknown' },
        language: analytics?.language || 'es',
        timezone: analytics?.timezone || 'America/Bogota',
        isNewUser: analytics?.isNewUser ?? true,
        visitCount: analytics?.visitCount || 1
      },
      
      // Métricas del funnel
      funnel: {
        totalTimeMs: analytics?.funnelTime || 0,
        completedSteps: 4
      },
      
      // Engagement (se actualizará después)
      engagement: {
        viewed: false,
        viewedAt: null,
        timeOnPage: 0,
        shared: false,
        sharedVia: [],
        savedPdf: false,
        clickedPlaces: []
      }
    };

    await db.collection("analytics_itineraries").doc(itineraryId).set(analyticsData);

    // =========================================================================
    // 3. ACTUALIZAR AGREGADOS DIARIOS
    // =========================================================================
    const dailyRef = db.collection("analytics_daily").doc(today);
    
    const dailyUpdates: Record<string, any> = {
      date: today,
      totalItineraries: FieldValue.increment(1),
      updatedAt: now
    };

    // Resultado
    if (itinerary.validation.isValid) {
      dailyUpdates.successfulGenerations = FieldValue.increment(1);
    } else {
      dailyUpdates.failedGenerations = FieldValue.increment(1);
    }

    // Distribución de días
    dailyUpdates[`dayDistribution.d${profile.days}`] = FieldValue.increment(1);

    // Distribución de tipo de viaje
    dailyUpdates[`tripTypeDistribution.${profile.tripType}`] = FieldValue.increment(1);

    // Distribución de presupuesto
    dailyUpdates[`budgetDistribution.${profile.budget}`] = FieldValue.increment(1);

    // Intereses
    for (const interest of profile.interests) {
      dailyUpdates[`interestCounts.${interest.replace(/[^a-zA-Z0-9_]/g, '_')}`] = FieldValue.increment(1);
    }

    // Fuente de tráfico
    const trafficSource = analytics?.traffic?.source || 'direct';
    dailyUpdates[`trafficSources.${trafficSource.replace(/[^a-zA-Z0-9_]/g, '_')}`] = FieldValue.increment(1);

    // Tipo de dispositivo
    const deviceType = analytics?.device?.type || 'unknown';
    dailyUpdates[`deviceTypes.${deviceType}`] = FieldValue.increment(1);

    // Tiempo de generación promedio
    dailyUpdates.totalGenerationTimeMs = FieldValue.increment(generationTimeMs);

    await dailyRef.set(dailyUpdates, { merge: true });

    // =========================================================================
    // 4. ACTUALIZAR CONTADORES GLOBALES
    // =========================================================================
    const globalRef = db.collection("analytics_global").doc("counters");
    
    const globalUpdates: Record<string, any> = {
      totalItineraries: FieldValue.increment(1),
      lastUpdated: now
    };

    // Por tipo de viaje (lifetime)
    globalUpdates[`lifetimeTripTypes.${profile.tripType}`] = FieldValue.increment(1);

    // Por presupuesto (lifetime)
    globalUpdates[`lifetimeBudgets.${profile.budget}`] = FieldValue.increment(1);

    // Usuarios únicos (aproximado por sessionId)
    if (analytics?.isNewUser) {
      globalUpdates.estimatedUniqueUsers = FieldValue.increment(1);
    }

    await globalRef.set(globalUpdates, { merge: true });

    // =========================================================================
    // 5. ACTUALIZAR CONTEO DE LUGARES
    // =========================================================================
    const placesRef = db.collection("analytics_global").doc("place_stats");
    
    const placeUpdates: Record<string, any> = {
      lastUpdated: now
    };

    // Contar cada lugar incluido
    for (const day of itinerary.days) {
      for (const stop of day.stops) {
        const safeId = stop.placeId.replace(/[^a-zA-Z0-9_-]/g, '_');
        placeUpdates[`inclusionCount.${safeId}`] = FieldValue.increment(1);
      }
    }

    await placesRef.set(placeUpdates, { merge: true });

    console.log(`✅ Itinerario y analytics guardados: ${itineraryId}`);

  } catch (error) {
    console.error('Error guardando en Firebase:', error);
    throw error;
  }
}

// =============================================================================
// HANDLER PRINCIPAL
// =============================================================================

export async function POST(req: NextRequest) {
  console.log('🚀 POST /api/itinerary/generate - Iniciando');
  const startTime = Date.now();
  
  try {
    // 1. Parsear request
    const body: RequestBody = await req.json();
    const { profile: rawProfile, analytics } = body;

    if (!rawProfile) {
      return NextResponse.json(
        { error: 'Profile es requerido' },
        { status: 400 }
      );
    }

    // 2. Validar campos requeridos
    if (!rawProfile.days || rawProfile.days < 1 || rawProfile.days > 14) {
      return NextResponse.json(
        { error: 'Días debe ser entre 1 y 14' },
        { status: 400 }
      );
    }

    if (!rawProfile.interests || rawProfile.interests.length === 0) {
      return NextResponse.json(
        { error: 'Al menos un interés es requerido' },
        { status: 400 }
      );
    }

    if (!rawProfile.email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // 3. Mapear perfil al formato interno
    const profile: ItineraryProfile = {
      days: rawProfile.days,
      email: rawProfile.email,
      interests: rawProfile.interests,
      tripType: mapTripType(rawProfile.tripType),
      budget: mapBudget(rawProfile.budget),
      travelPace: mapPace(rawProfile.travelPace),
      maxDistance: 'medio',
      startLocation: rawProfile.startLocation
    };

    console.log('📋 Perfil procesado:', {
      days: profile.days,
      tripType: profile.tripType,
      interests: profile.interests,
      budget: profile.budget,
      pace: profile.travelPace
    });

    // 4. Generar itinerario con Claude
    const enhancer = new ClaudeItineraryEnhancer();
    const itinerary = await enhancer.generateItinerary(profile);

    const generationTime = Date.now() - startTime;

    // 5. Verificar que se generó correctamente
    if (!itinerary.validation.isValid) {
      console.error('❌ Itinerario inválido:', itinerary.validation.errors);
      return NextResponse.json(
        { 
          error: 'Error generando itinerario',
          details: itinerary.validation.errors
        },
        { status: 500 }
      );
    }

    // 6. Convertir a formato del frontend
    const frontendData = convertToFrontendFormat(itinerary);

    // 7. Generar ID único
    const itineraryId = rawProfile.itineraryRequestId || 
      `itin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 8. Guardar en Firebase CON ANALYTICS
    try {
      await saveToFirebaseWithAnalytics(
        itineraryId, 
        itinerary, 
        frontendData, 
        profile, 
        analytics,
        generationTime
      );
    } catch (firebaseError) {
      console.error('Error guardando en Firebase (continuando):', firebaseError);
    }

    // 9. Responder
    console.log(`✅ Itinerario generado en ${generationTime}ms`);
    
    return NextResponse.json({
      success: true,
      itineraryId,
      itinerary: frontendData,
      metadata: {
        ...itinerary.metadata,
        generationTimeMs: generationTime,
        warnings: itinerary.validation.warnings
      }
    });

  } catch (error: any) {
    console.error('❌ Error en /api/itinerary/generate:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.0-claude-analytics',
    features: {
      ai: 'claude-sonnet-4-20250514',
      database: 'curated_places',
      storage: 'firebase',
      analytics: 'enabled'
    }
  });
}