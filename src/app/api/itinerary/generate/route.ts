// src/app/api/itinerary/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import EnhancedGooglePlacesItineraryGenerator from '@/lib/enhancedGooglePlacesItineraryGenerator';
import { convertItineraryToFrontendFormat } from '@/lib/itinerary-converter';

interface ItineraryRequest {
  profile: {
    days: number;
    email: string;
    interests: string[];
    tripType: 'solo' | 'pareja' | 'familia' | 'amigos' | 'negocios';
    budget: 'economico' | 'moderado' | 'premium';
    locationRange: 'barranquilla' | 'todo_atlantico';
    startLocation?: any;
    itineraryRequestId?: string;
  };
  preferences?: {
    pace?: 'relaxed' | 'moderate' | 'intensive' | 'normal';
    maxTravelDistance?: number;
    culturalDepth?: 'surface' | 'deep' | 'immersive';
    foodAdventure?: boolean;
    physicalActivity?: 'low' | 'moderate' | 'high';
    crowdTolerance?: 'avoid' | 'moderate' | 'doesnt_matter';
    timePreference?: string;
  };
}

interface EnhancedUserProfile {
  days: number;
  email: string;
  interests: string[];
  tripType: 'solo' | 'pareja' | 'familia' | 'amigos' | 'negocios';
  budget: 'economico' | 'moderado' | 'premium';
  locationRange: 'barranquilla' | 'todo_atlantico';
  startLocation?: any;
  preferredPace: 'relaxed' | 'moderate' | 'intensive';
  maxTravelDistance: number;
  culturalDepth: 'surface' | 'deep' | 'immersive';
  foodAdventure: boolean;
  physicalActivity: 'low' | 'moderate' | 'high';
  crowdTolerance: 'avoid' | 'moderate' | 'doesnt_matter';
}

function createEnhancedProfile(profile: any, preferences?: any): EnhancedUserProfile {
  // Validaciones
  if (!profile.days || profile.days < 1 || profile.days > 7) {
    throw new Error('La duración del viaje debe estar entre 1 y 7 días');
  }
  if (!profile.interests || !Array.isArray(profile.interests) || profile.interests.length === 0) {
    throw new Error('Debes especificar al menos un interés');
  }
  if (!['solo', 'pareja', 'familia', 'amigos', 'negocios'].includes(profile.tripType)) {
    throw new Error('El tipo de viaje es inválido');
  }
  if (!['economico', 'moderado', 'premium'].includes(profile.budget)) {
    throw new Error('El presupuesto es inválido');
  }
  
  // Mapear 'normal' a 'moderate'
  const mapPace = (pace: string): 'relaxed' | 'moderate' | 'intensive' => {
    const paceMap: Record<string, 'relaxed' | 'moderate' | 'intensive'> = {
      'normal': 'moderate',
      'moderate': 'moderate',
      'relaxed': 'relaxed',
      'intensive': 'intensive'
    };
    return paceMap[pace] || 'moderate';
  };

  // Funciones de inferencia inteligentes
  const inferPaceFromProfile = (p: any): 'relaxed' | 'moderate' | 'intensive' => {
    if (p.tripType === 'familia' || p.interests.includes('relax')) return 'relaxed';
    if (p.tripType === 'negocios' || p.tripType === 'amigos' || p.interests.includes('aventura')) return 'intensive';
    return 'moderate';
  };

  const inferCulturalDepth = (p: any): 'surface' | 'deep' | 'immersive' => {
    const culturalInterests = p.interests.filter((i: string) =>
      ['cultura', 'artesanias', 'ritmos', 'historia', 'patrimonio', 'carnaval_cultura', 'arquitectura_historia'].includes(i)
    ).length;
    if (culturalInterests >= 3) return 'immersive';
    if (culturalInterests >= 1) return 'deep';
    return 'surface';
  };

  const inferPhysicalActivity = (p: any): 'low' | 'moderate' | 'high' => {
    if (p.interests.includes('aventura') || p.interests.includes('deportes-acuaticos') || p.interests.includes('naturaleza_aventura')) return 'high';
    if (p.tripType === 'familia' || p.interests.includes('relax')) return 'low';
    return 'moderate';
  };

  const inferCrowdTolerance = (p: any): 'avoid' | 'moderate' | 'doesnt_matter' => {
    if (p.tripType === 'pareja' || p.interests.includes('relax')) return 'avoid';
    if (p.tripType === 'amigos' || p.interests.includes('festivales') || p.interests.includes('vida_nocturna')) return 'doesnt_matter';
    return 'moderate';
  };

  return {
    days: Number(profile.days),
    email: profile.email || '',
    interests: profile.interests.filter((i: any) => typeof i === 'string' && i.trim().length > 0),
    tripType: profile.tripType,
    budget: profile.budget,
    locationRange: profile.locationRange || 'todo_atlantico',
    startLocation: profile.startLocation,
    preferredPace: preferences?.pace ? mapPace(preferences.pace) : inferPaceFromProfile(profile),
    maxTravelDistance: preferences?.maxTravelDistance || (profile.locationRange === 'barranquilla' ? 20 : 60),
    culturalDepth: preferences?.culturalDepth || inferCulturalDepth(profile),
    foodAdventure: preferences?.foodAdventure ?? (profile.interests.includes("gastronomia") || profile.interests.includes("gastronomia_local")),
    physicalActivity: preferences?.physicalActivity || inferPhysicalActivity(profile),
    crowdTolerance: preferences?.crowdTolerance || inferCrowdTolerance(profile)
  };
}

async function saveFormattedItinerary(
  formattedItinerary: any,
  profile: EnhancedUserProfile,
  generationResult: any
): Promise<{ success: boolean; itineraryId: string; error?: string }> {
  try {
    const profileToSave = {
      ...profile,
      startLocation: profile.startLocation || null
    };

    if (process.env.FIREBASE_SERVICE_JSON) {
      const { getFirestore } = await import("firebase-admin/firestore");
      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
      const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
      const db = getFirestore(app);

      // Guardar con el formato correcto
      const docRef = await db.collection("generated_itineraries").add({
        profile: JSON.parse(JSON.stringify(profileToSave)),
        days: formattedItinerary.days, // Estructura correcta para el frontend
        metadata: {
          ...generationResult.metadata,
          generatedAt: new Date().toISOString(),
          totalActivities: formattedItinerary.days.reduce((acc: number, day: any) => 
            acc + (day.activities?.length || 0), 0
          ),
          generationVersion: 'v2.0',
          dataSource: 'google_places_api'
        },
        validation: generationResult.validation,
        themes: generationResult.themes || [],
        createdAt: new Date(),
        status: 'generated_successfully',
        source: 'google_places_api'
      });
      
      console.log("✅ Itinerario guardado con formato correcto, ID:", docRef.id);
      return { success: true, itineraryId: docRef.id };
    } else {
      console.warn("Firebase Admin no configurado. Usando ID local.");
      const fallbackId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      return { success: true, itineraryId: fallbackId };
    }
  } catch (error: any) {
    console.error("❌ Error al guardar itinerario:", error.message);
    return { success: false, itineraryId: `error_${Date.now()}`, error: error.message };
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ItineraryRequest = await req.json();
    const { profile, preferences } = body;

    if (!profile) {
      return NextResponse.json({ error: "Perfil de usuario requerido" }, { status: 400 });
    }

    console.log("=== INICIO GENERACIÓN ITINERARIO V2.0 ===");
    console.log(`Perfil: ${profile.days} días, ${profile.tripType}, intereses: ${profile.interests?.join(', ')}`);

    // Verificar API key
    if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
      console.error("ADVERTENCIA: Google Places API key no configurada");
      console.log("Continuando en modo demo...");
    }

    // Crear perfil enriquecido
    const enhancedProfile = createEnhancedProfile(profile, preferences);
    console.log(`Perfil enriquecido: ${enhancedProfile.preferredPace} pace, ${enhancedProfile.culturalDepth} cultura`);

    // Generar itinerario con Google Places
    console.log("Iniciando generación con Google Places API...");
    const generator = new EnhancedGooglePlacesItineraryGenerator();
    const generationResult = await generator.generateOptimizedItinerary(enhancedProfile);

    // Validar generación
    if (!generationResult || generationResult.itinerary.length === 0) {
      console.error("Error crítico: El generador no produjo un itinerario válido.");
      
      // Verificar si es un error intencional
      if (generationResult && !generationResult.validation.isValid) {
        return NextResponse.json(
          { 
            error: generationResult.validation.errors[0] || "Error generando el itinerario", 
            message: "Por favor, intenta nuevamente en unos segundos.",
            shouldRetry: true
          }, 
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "No se pudo generar el itinerario", 
          message: "El sistema no pudo crear un itinerario. Por favor, intenta nuevamente.",
          shouldRetry: true
        }, 
        { status: 503 }
      );
    }
    
    console.log("=== RESULTADO GENERACIÓN ===");
    console.log(`Total paradas: ${generationResult.itinerary.length}`);
    console.log(`Score calidad: ${generationResult.validation.qualityScore}/100`);
    console.log(`Coherencia: ${generationResult.validation.coherenceScore}/100`);
    console.log(`Personalización: ${generationResult.validation.personalizationScore}/100`);

    // IMPORTANTE: Convertir al formato esperado por el frontend
    const formattedItinerary = convertItineraryToFrontendFormat(
      generationResult.itinerary,
      enhancedProfile
    );

    // Guardar en Firebase con el formato correcto
    const saveResult = await saveFormattedItinerary(
      formattedItinerary,
      enhancedProfile,
      generationResult
    );

    if (!saveResult.success) {
      console.error("Error guardando el itinerario:", saveResult.error);
    }

    const totalTime = Date.now() - startTime;
    console.log(`=== GENERACIÓN COMPLETADA EN ${totalTime}ms ===`);

    // Respuesta exitosa con formato correcto
    return NextResponse.json({
      success: true,
      itineraryId: saveResult.itineraryId,
      itinerary: formattedItinerary, // Formato correcto para el frontend
      themes: generationResult.themes,
      validation: generationResult.validation,
      metadata: {
        ...generationResult.metadata,
        processingTime: totalTime,
        apiCalls: generationResult.metadata.totalDays * 3 // Estimado de llamadas a API
      }
    });

  } catch (error: any) {
    console.error("=== ERROR CRÍTICO EN GENERACIÓN ===", error);
    
    // Manejo detallado de errores
    let errorMessage = "Error generando el itinerario";
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = "Error de configuración del servidor";
      statusCode = 503;
    } else if (error.message?.includes('duración del viaje')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('interés')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('No se pudieron encontrar destinos')) {
      errorMessage = error.message;
      statusCode = 404;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        message: error.message, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { status: statusCode }
    );
  }
}