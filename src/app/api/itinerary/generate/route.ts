// src/app/api/itinerary/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import EnhancedGooglePlacesItineraryGenerator from '@/lib/enhancedGooglePlacesItineraryGenerator';
import { convertItineraryToFrontendFormat } from '@/lib/itinerary-converter';

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

function createEnhancedProfile(profile: any): EnhancedUserProfile {
  console.log("Creando perfil mejorado con:", profile);
  
  // Validaciones
  if (!profile.days || profile.days < 1 || profile.days > 14) {
    throw new Error('La duración del viaje debe estar entre 1 y 14 días');
  }
  if (!profile.interests || !Array.isArray(profile.interests) || profile.interests.length === 0) {
    throw new Error('Debes especificar al menos un interés');
  }
  if (!['economico', 'moderado', 'premium'].includes(profile.budget)) {
    throw new Error('El presupuesto es inválido');
  }
  
  // MAPEAR TIPOS DE VIAJE DEL FRONTEND AL BACKEND
  const mapTripType = (type: string): 'solo' | 'pareja' | 'familia' | 'amigos' | 'negocios' => {
    const typeMap: Record<string, 'solo' | 'pareja' | 'familia' | 'amigos' | 'negocios'> = {
      'solo': 'solo',
      'pareja': 'pareja',
      'solo_pareja': 'pareja',  // Mapear solo_pareja a pareja
      'familia': 'familia',
      'amigos': 'amigos',
      'grupo': 'amigos',  // Mapear grupo a amigos
      'negocios': 'negocios'
    };
    return typeMap[type] || 'familia'; // Default a familia si no se reconoce
  };
  
  // Mapear pace desde español
  const mapPace = (pace: string): 'relaxed' | 'moderate' | 'intensive' => {
    const paceMap: Record<string, 'relaxed' | 'moderate' | 'intensive'> = {
      'relajado': 'relaxed',
      'moderado': 'moderate',
      'intenso': 'intensive',
      'intensivo': 'intensive',
      'relaxed': 'relaxed',
      'moderate': 'moderate',
      'intensive': 'intensive'
    };
    return paceMap[pace] || 'moderate';
  };

  // Mapear maxDistance a kilómetros
  const getMaxDistance = (distance: string): number => {
    const distanceMap: Record<string, number> = {
      'cerca': 20,
      'medio': 40,
      'lejos': 60
    };
    return distanceMap[distance] || 40;
  };

  // Funciones de inferencia
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
    if (p.tripType === 'pareja' || p.tripType === 'solo_pareja' || p.interests.includes('relax')) return 'avoid';
    if (p.tripType === 'amigos' || p.tripType === 'grupo' || p.interests.includes('festivales') || p.interests.includes('vida_nocturna')) return 'doesnt_matter';
    return 'moderate';
  };

  // Determinar locationRange basado en maxDistance
  const getLocationRange = (distance: string): 'barranquilla' | 'todo_atlantico' => {
    return distance === 'cerca' ? 'barranquilla' : 'todo_atlantico';
  };

  const mappedTripType = mapTripType(profile.tripType);
  console.log(`Tipo de viaje mapeado: ${profile.tripType} -> ${mappedTripType}`);

  return {
    days: Number(profile.days),
    email: profile.email || '',
    interests: profile.interests.filter((i: any) => typeof i === 'string' && i.trim().length > 0),
    tripType: mappedTripType,
    budget: profile.budget,
    locationRange: getLocationRange(profile.maxDistance || 'medio'),
    startLocation: profile.startLocation,
    preferredPace: mapPace(profile.travelPace || 'moderado'),
    maxTravelDistance: getMaxDistance(profile.maxDistance || 'medio'),
    culturalDepth: inferCulturalDepth(profile),
    foodAdventure: profile.interests.includes("gastronomia") || profile.interests.includes("gastronomia_local"),
    physicalActivity: inferPhysicalActivity(profile),
    crowdTolerance: inferCrowdTolerance(profile)
  };
}

// Función para limpiar undefined de objetos
function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const value = cleanUndefined(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return obj;
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

    // Limpiar undefined de los días
    const cleanedDays = formattedItinerary.days.map((day: any) => {
      const cleanedDay = { ...day };
      // Si meals es undefined, eliminarlo
      if (cleanedDay.meals === undefined) {
        delete cleanedDay.meals;
      }
      // Limpiar activities
      if (cleanedDay.activities) {
        cleanedDay.activities = cleanedDay.activities.map((activity: any) => {
          const cleanedActivity = { ...activity };
          // Eliminar campos undefined
          Object.keys(cleanedActivity).forEach(key => {
            if (cleanedActivity[key] === undefined) {
              delete cleanedActivity[key];
            }
          });
          return cleanedActivity;
        });
      }
      return cleanedDay;
    });

    if (process.env.FIREBASE_SERVICE_JSON) {
      const { getFirestore } = await import("firebase-admin/firestore");
      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
      const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
      const db = getFirestore(app);

      // Limpiar todos los undefined antes de guardar
      const dataToSave = cleanUndefined({
        profile: JSON.parse(JSON.stringify(profileToSave)),
        days: cleanedDays,
        metadata: {
          ...generationResult.metadata,
          generatedAt: new Date().toISOString(),
          totalActivities: cleanedDays.reduce((acc: number, day: any) => 
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

      const docRef = await db.collection("generated_itineraries").add(dataToSave);
      
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
    console.log("=== INICIO GENERACIÓN ITINERARIO V2.0 ===");
    
    const body = await req.json();
    console.log("Datos recibidos:", JSON.stringify(body, null, 2));
    
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Perfil de usuario requerido" }, { status: 400 });
    }

    console.log(`Perfil: ${profile.days} días, ${profile.tripType}, intereses: ${profile.interests?.join(', ')}`);

    // Verificar API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: Google Places API key no configurada");
      return NextResponse.json(
        { 
          error: "Configuración del servidor incompleta", 
          message: "La API de Google Places no está configurada. Por favor contacta al administrador."
        }, 
        { status: 503 }
      );
    }

    // Crear perfil enriquecido
    let enhancedProfile: EnhancedUserProfile;
    try {
      enhancedProfile = createEnhancedProfile(profile);
      console.log("Perfil enriquecido creado:", {
        tripType: enhancedProfile.tripType,
        pace: enhancedProfile.preferredPace,
        distance: enhancedProfile.maxTravelDistance,
        cultural: enhancedProfile.culturalDepth
      });
    } catch (profileError: any) {
      console.error("Error creando perfil:", profileError.message);
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    // Generar itinerario con Google Places
    console.log("Iniciando generación con Google Places API...");
    const generator = new EnhancedGooglePlacesItineraryGenerator();
    const generationResult = await generator.generateOptimizedItinerary(enhancedProfile);

    // Validar generación
    if (!generationResult || generationResult.itinerary.length === 0) {
      console.error("Error crítico: El generador no produjo un itinerario válido.");
      
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

    // Convertir al formato esperado por el frontend
    const formattedItinerary = convertItineraryToFrontendFormat(
      generationResult.itinerary,
      enhancedProfile
    );

    // Guardar en Firebase
    const saveResult = await saveFormattedItinerary(
      formattedItinerary,
      enhancedProfile,
      generationResult
    );

    if (!saveResult.success) {
      console.error("Error guardando el itinerario, pero continuando:", saveResult.error);
      // No fallar si no se puede guardar, continuar con ID temporal
    }

    const totalTime = Date.now() - startTime;
    console.log(`=== GENERACIÓN COMPLETADA EN ${totalTime}ms ===`);

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      itineraryId: saveResult.itineraryId,
      itinerary: formattedItinerary,
      themes: generationResult.themes,
      validation: generationResult.validation,
      metadata: {
        ...generationResult.metadata,
        processingTime: totalTime,
        apiCalls: generationResult.metadata.totalDays * 3
      }
    });

  } catch (error: any) {
    console.error("=== ERROR CRÍTICO EN GENERACIÓN ===");
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    
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
    } else if (error.message?.includes('tipo de viaje')) {
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