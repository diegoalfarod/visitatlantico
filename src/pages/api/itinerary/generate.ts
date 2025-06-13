import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import admin from "firebase-admin";

/* ─────────── Tipos ─────────── */
interface FirestoreDoc {
  coordinates?: { lat: number; lng: number };
  name?: string;
  title?: string;
  description?: string;
  municipality?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
  imagePath?: string;
  imagePaths?: string[];
  schedule?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  priceRange?: string;
  accessibility?: boolean;
}

export interface ItineraryStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  startTime: string;
  durationMinutes: number;
  description: string;
  type: "destination" | "experience";
  category?: string;
  imageUrl?: string;
  photos?: string[];
  tip?: string;
}

interface CacheEntry {
  key: string;
  itinerary: ItineraryStop[];
  timestamp: number;
}

/* ─────────── Constantes y Configuración ─────────── */
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora
const MAX_DISTANCE_KM = 50; // Distancia máxima cuando no quieren otros municipios
const NEARBY_MUNICIPALITIES = ["Barranquilla", "Puerto Colombia", "Soledad", "Malambo"];
const MAX_RETRY_ATTEMPTS = 3;
const AI_TIMEOUT = 30000;

// Velocidades de transporte más realistas para el Atlántico
const TRANSPORT_SPEEDS = {
  car: 25,        // 25 km/h promedio en ciudad (con tráfico)
  taxi: 30,       // Taxis pueden ser un poco más rápidos
  walking: 4,     // Caminando
  publicBus: 20   // Transporte público
};

// Tiempo adicional por tipo de actividad (check-in, esperas, etc)
const ACTIVITY_BUFFER_MINUTES = {
  playa: 15,          // Tiempo para cambiarse, encontrar lugar
  museo: 10,          // Comprar entrada, guardar cosas
  restaurante: 5,     // Esperar mesa
  experiencia: 20,    // Check-in, instrucciones
  default: 10
};

/* ─────────── Helpers Mejorados ─────────── */
const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const R = 6371;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

// Función mejorada para calcular tiempo de viaje realista
const calculateTravelTime = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  timeOfDay?: number // hora del día en minutos
): number => {
  const distance = haversine(from, to);
  
  // Determinar modo de transporte según distancia
  let transportMode: keyof typeof TRANSPORT_SPEEDS = 'taxi';
  if (distance < 1) {
    transportMode = 'walking';
  } else if (distance > 15) {
    transportMode = 'car';
  }
  
  // Ajustar por hora pico (7-9 AM, 5-7 PM)
  let speedMultiplier = 1;
  if (timeOfDay) {
    const hour = Math.floor(timeOfDay / 60);
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      speedMultiplier = 0.7; // 30% más lento en hora pico
    }
  }
  
  const effectiveSpeed = TRANSPORT_SPEEDS[transportMode] * speedMultiplier;
  const travelMinutes = Math.ceil((distance / effectiveSpeed) * 60);
  
  // Mínimo 10 minutos incluso para distancias cortas (tiempo de salir, llegar, etc)
  return Math.max(10, travelMinutes);
};

// Obtener tiempo buffer según categoría
const getActivityBuffer = (category?: string): number => {
  if (!category) return ACTIVITY_BUFFER_MINUTES.default;
  
  const lowerCategory = category.toLowerCase();
  for (const [key, minutes] of Object.entries(ACTIVITY_BUFFER_MINUTES)) {
    if (lowerCategory.includes(key)) return minutes;
  }
  
  return ACTIVITY_BUFFER_MINUTES.default;
};

const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const getMunicipality = (address?: string) =>
  address ? address.split(",")[0].trim() : "Ubicación desconocida";

// Validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar coordenadas
const isValidLocation = (location: any): location is { lat: number; lng: number } => {
  return (
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    Math.abs(location.lat) <= 90 &&
    Math.abs(location.lng) <= 180 &&
    // Verificar que esté cerca del Atlántico, Colombia
    location.lat >= 10.3 && location.lat <= 11.2 &&
    location.lng >= -75.2 && location.lng <= -74.6
  );
};

// Cache simple en memoria
const itineraryCache = new Map<string, CacheEntry>();

// Función para hacer reintentos con backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Intento ${attempt + 1} falló:`, error);
      
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Función para limpiar y reparar respuestas de AI
function cleanAIResponse(response: string): string {
  try {
    JSON.parse(response);
    return response;
  } catch {
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^[^{]*{/, '{');
    cleaned = cleaned.replace(/}[^}]*$/, '}');
    cleaned = cleaned.replace(/'/g, '"');
    cleaned = cleaned.replace(/,\s*}/g, '}');
    cleaned = cleaned.replace(/,\s*]/g, ']');
    
    return cleaned;
  }
}

/* ═══════════════════════════════════════════ */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ itinerary?: ItineraryStop[]; error?: string; cached?: boolean; attempts?: number }>
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  let attemptCount = 0;

  try {
    if (!process.env.FIREBASE_SERVICE_JSON || !process.env.OPENAI_API_KEY)
      throw new Error("Configuración del servidor incompleta");

    const { profile, location } = req.body as {
      profile: Record<string, string>;
      location: { lat: number; lng: number } | null;
    };

    // Validaciones mejoradas
    const totalDays = Number(profile?.Días);
    if (!totalDays || totalDays < 1 || totalDays > 7) {
      return res.status(400).json({ 
        error: "Los días deben estar entre 1 y 7" 
      });
    }

    if (!profile?.Motivos) {
      return res.status(400).json({ 
        error: "Debe seleccionar al menos un tipo de experiencia" 
      });
    }

    // Validar email si se proporciona
    if (profile.Email && !isValidEmail(profile.Email)) {
      return res.status(400).json({ 
        error: "Email inválido" 
      });
    }

    // Validar ubicación - usar ubicación por defecto si no hay
    const validatedLocation = isValidLocation(location) ? location : null;
    const defaultLocation = { lat: 10.9878, lng: -74.7889 }; // Centro de Barranquilla
    const userLocation = validatedLocation || defaultLocation;

    // Verificar caché
    const cacheKey = `${totalDays}_${profile.Motivos}_${profile["Otros municipios"] || "No"}`;
    const cached = itineraryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log("Retornando itinerario desde caché");
      return res.status(200).json({ 
        itinerary: cached.itinerary, 
        cached: true 
      });
    }

    /* ── Firebase ── */
    if (!admin.apps.length) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: svc.project_id,
          clientEmail: svc.client_email,
          privateKey: svc.private_key.replace(/\\n/g, "\n"),
        }),
      });
    }
    const db = admin.firestore();

    /* ── Cargar destinos y experiencias con distancias ── */
    let [destinations, experiences] = await Promise.all([
      loadCollection(db, "destinations"),
      loadCollection(db, "experiences"),
    ]);

    // Calcular distancias desde ubicación del usuario
    const addDistances = (stops: ItineraryStop[]) => {
      return stops.map(stop => ({
        ...stop,
        distanceFromUser: haversine(userLocation, { lat: stop.lat, lng: stop.lng })
      }));
    };

    destinations = addDistances(destinations);
    experiences = addDistances(experiences);

    // Filtrar por municipio si el usuario no quiere ir lejos
    if (profile["Otros municipios"] === "No") {
      const filterNearby = (stops: any[]) => {
        return stops.filter(stop => {
          const isNearbyMunicipality = NEARBY_MUNICIPALITIES.some(m => 
            stop.municipality.toLowerCase().includes(m.toLowerCase())
          );
          
          // Filtrar también por distancia real
          return isNearbyMunicipality && stop.distanceFromUser <= MAX_DISTANCE_KM;
        });
      };

      destinations = filterNearby(destinations);
      experiences = filterNearby(experiences);
    }

    const allStops = [...destinations, ...experiences];
    if (!allStops.length) {
      return res.status(404).json({ 
        error: "No hay lugares turísticos disponibles en el área seleccionada" 
      });
    }

    // NUEVO: Función principal con reintentos
    const generateWithRetry = async (): Promise<ItineraryStop[]> => {
      attemptCount++;
      console.log(`Generando itinerario - Intento ${attemptCount}`);

      /* ── Prompts mejorados con coordenadas y distancias ── */
      const systemPrompt = buildSystemPromptWithDistances(
        totalDays,
        allStops,
        userLocation,
        profile["Otros municipios"] === "No",
        attemptCount
      );
      const userPrompt = buildUserPrompt(profile);

      /* ── OpenAI con timeout ── */
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const aiRaw = await Promise.race([
        generateAIItinerary(openai, systemPrompt, userPrompt, attemptCount),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en generación AI')), AI_TIMEOUT)
        )
      ]) as string;

      /* ── Limpiar y validar respuesta ── */
      const cleanedResponse = cleanAIResponse(aiRaw);
      const { validItinerary, invalidIds, partialItinerary } = validateAIResponseFlexible(
        cleanedResponse, 
        allStops,
        totalDays
      );

      // Si tenemos al menos algunos lugares válidos, intentar completar
      if (partialItinerary.length >= Math.min(totalDays * 2, 3)) {
        console.log(`Itinerario parcial con ${partialItinerary.length} paradas válidas`);
        
        // Completar con lugares adicionales si es necesario
        const enrichedItinerary = await enrichPartialItinerary(
          partialItinerary,
          allStops,
          totalDays,
          profile.Motivos
        );
        
        if (enrichedItinerary.length >= totalDays) {
          return enrichedItinerary;
        }
      }

      // Si no hay suficientes lugares válidos, lanzar error para reintentar
      if (validItinerary.length < totalDays) {
        throw new Error(
          `Itinerario insuficiente: ${validItinerary.length} paradas para ${totalDays} días. ` +
          `IDs inválidos: ${invalidIds.join(', ')}`
        );
      }

      return validItinerary;
    };

    // Ejecutar con reintentos automáticos
    const validItinerary = await retryWithBackoff(
      generateWithRetry,
      MAX_RETRY_ATTEMPTS,
      1000
    );

    /* ── Verificar contra Firestore ── */
    const verified = await verifyFirestoreDocuments(db, validItinerary);
    
    if (verified.length < totalDays * 2) {
      return res.status(404).json({ 
        error: "No se pudieron verificar suficientes lugares. Por favor intenta nuevamente." 
      });
    }

    /* ── Horarios finales con cálculo realista de distancias ── */
    const finalItinerary = calculateRealisticTimings(verified, userLocation);

    // Agregar tips basados en los intereses
    const enrichedItinerary = enrichItineraryWithTips(finalItinerary, profile.Motivos);

    // Guardar en caché
    itineraryCache.set(cacheKey, {
      key: cacheKey,
      itinerary: enrichedItinerary,
      timestamp: Date.now()
    });

    // Limpiar caché antiguo
    if (itineraryCache.size > 100) {
      const oldestKey = Array.from(itineraryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      itineraryCache.delete(oldestKey);
    }

    /* ── Persistir solicitud (async) ── */
    savePlanningRequest(db, profile, userLocation, enrichedItinerary, attemptCount)
      .catch(console.error);

    return res.status(200).json({ 
      itinerary: enrichedItinerary,
      cached: false,
      attempts: attemptCount 
    });

  } catch (err) {
    console.error("Error generate.ts:", err);
    
    // Si falló después de todos los reintentos, dar mensaje más amigable
    if (attemptCount >= MAX_RETRY_ATTEMPTS) {
      return res.status(500).json({
        error: "No pudimos crear tu itinerario en este momento. Por favor intenta nuevamente en unos segundos."
      });
    }
    
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Error interno del servidor",
    });
  }
}

/* ─────────── Funciones Auxiliares Mejoradas ─────────── */

async function loadCollection(
  db: FirebaseFirestore.Firestore,
  collection: "destinations" | "experiences"
) {
  try {
    const snap = await db.collection(collection).get();
    return snap.docs
      .map((doc) => {
        const data = doc.data() as FirestoreDoc;
        if (!data.coordinates?.lat || !data.coordinates?.lng || !data.description)
          return null;

        return {
          id: doc.id,
          name:
            collection === "destinations"
              ? data.name || "Destino sin nombre"
              : data.title || "Experiencia sin nombre",
          lat: data.coordinates.lat,
          lng: data.coordinates.lng,
          municipality:
            data.municipality || getMunicipality(data.address),
          description: data.description,
          category: data.category || "general",
          imageUrl:
            data.imageUrl ||
            data.imagePath ||
            data.imagePaths?.[0] ||
            "/default-image.jpg",
          photos: Array.isArray(data.imagePaths) ? data.imagePaths : undefined,
          type: collection === "destinations" ? "destination" : "experience",
          startTime: "",
          durationMinutes: 0,
        } as ItineraryStop;
      })
      .filter(Boolean) as ItineraryStop[];
  } catch (e) {
    console.error(`Error cargando ${collection}:`, e);
    return [];
  }
}

// Sistema de prompts mejorado que incluye coordenadas y distancias
function buildSystemPromptWithDistances(
  days: number,
  stops: any[],
  userLocation: { lat: number; lng: number },
  stayNearby: boolean,
  attemptNumber: number
) {
  const dayOfWeek = new Date().toLocaleDateString('es-CO', { weekday: 'long' });
  
  // Simplificar el prompt en reintentos para mayor flexibilidad
  const flexibility = attemptNumber > 1 ? `
FLEXIBILIDAD: Es mejor dar un itinerario funcional que fallar.
- Si no hay suficientes opciones de un tipo, usa las disponibles
- Ajusta duraciones según necesidad (30-180 minutos)
` : '';

  // Agrupar lugares por zonas geográficas
  const zones = {
    norte: stops.filter(s => s.lat > 10.98),
    centro: stops.filter(s => s.lat >= 10.95 && s.lat <= 10.98),
    sur: stops.filter(s => s.lat < 10.95),
    puertoCol: stops.filter(s => s.municipality.includes("Puerto Colombia")),
  };

  // Formatear lugares con coordenadas y distancias
  const stopsFormatted = stops
    .sort((a, b) => (a.distanceFromUser || 0) - (b.distanceFromUser || 0))
    .slice(0, 50) // Limitar a 50 lugares más cercanos
    .map(s => 
      `• ${s.id} | ${s.type.toUpperCase()} | ${s.name} (${s.municipality}) | ${s.lat.toFixed(4)},${s.lng.toFixed(4)} | ${(s.distanceFromUser || 0).toFixed(1)}km desde usuario${s.category ? ` | ${s.category}` : ''}`
    )
    .join('\n');

  return `
Eres un guía turístico experto del Atlántico, Colombia especializado en crear itinerarios REALISTAS y PRÁCTICOS.
Hoy es ${dayOfWeek}. El usuario está en: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
Crea un itinerario de ${days} día(s) considerando DISTANCIAS REALES y TIEMPOS DE VIAJE.

LUGARES DISPONIBLES CON COORDENADAS Y DISTANCIAS:
${stopsFormatted}

ZONAS IDENTIFICADAS:
- Norte (${zones.norte.length} lugares): Zona de playas y residencial
- Centro (${zones.centro.length} lugares): Centro histórico y comercial
- Sur (${zones.sur.length} lugares): Zona industrial y popular
- Puerto Colombia (${zones.puertoCol.length} lugares): Municipio costero turístico

REGLAS CRÍTICAS PARA ITINERARIO REALISTA:
1. USA ÚNICAMENTE los IDs listados arriba
2. ORGANIZA POR PROXIMIDAD: Agrupa lugares cercanos en el mismo día
3. MINIMIZA DESPLAZAMIENTOS: No más de 20km totales por día
4. CONSIDERA TIEMPOS REALES:
   - Velocidad promedio en ciudad: 25 km/h
   - Agregar 10-20 min buffer entre actividades
   - Hora pico (7-9am, 5-7pm): +30% tiempo
5. HORARIOS LÓGICOS:
   - Primera actividad: no antes de 8:00 (dar tiempo para desayuno)
   - Última actividad: terminar antes de 20:00
   - Almuerzo: 12:00-14:00
   - Playas: preferiblemente mañana (menos sol)
6. ${stayNearby ? "SOLO lugares en zonas Centro y Puerto Colombia (máx 15km del usuario)" : "Puedes incluir todos los lugares"}

FORMATO JSON REQUERIDO:
{
  "itinerary": [
    {
      "id": "ID_EXACTO_DE_LA_LISTA",
      "startTime": "HH:MM",
      "durationMinutes": NN,
      "reasoning": "breve explicación de por qué este lugar en este momento"
    }
  ]
}

EJEMPLO DE ORGANIZACIÓN POR DÍA:
- Día 1: Zona Centro (todos los lugares a <5km entre sí)
- Día 2: Puerto Colombia (aprovechar el día completo allá)
- Día 3: Zona Norte + regreso al centro

${flexibility}

IMPORTANTE: El éxito del itinerario depende de que sea EJECUTABLE. Un turista debe poder seguirlo sin estrés.
`.trim();
}

// User prompt mejorado
function buildUserPrompt(profile: Record<string, string>) {
  const motivos = profile.Motivos || "";
  const motivosList = motivos.split(",").map(m => m.trim());
  
  const interestsDescription = motivosList.map(motivo => {
    const mappings: Record<string, string> = {
      "relax": "playas tranquilas, spas, lugares de descanso, ambientes relajados",
      "cultura": "museos, sitios históricos, patrimonio cultural, arquitectura",
      "aventura": "deportes extremos, senderismo, actividades al aire libre, adrenalina",
      "gastronomia": "restaurantes típicos, mercados, street food, experiencias culinarias",
      "artesanias": "talleres artesanales, mercados de artesanías, cultura del Carnaval",
      "ritmos": "lugares de salsa y cumbia, peñas, clases de baile, música en vivo",
      "festivales": "eventos culturales, ferias, festividades locales",
      "deportes-acuaticos": "kitesurf, paddle board, snorkel, deportes marinos",
      "avistamiento": "observación de aves, naturaleza, fotografía de fauna",
      "ecoturismo": "manglares, senderos ecológicos, reservas naturales",
      "malecon": "actividades en el Malecón, ciclismo urbano, caminatas",
      "playas-urbanas": "playas accesibles, Puerto Mocho, relax costero",
      "historia-portuaria": "patrimonio marítimo, muelles históricos, cultura portuaria",
      "arte-urbano": "murales, galerías, expresiones artísticas urbanas",
      "sabores-marinos": "mariscos frescos, cocina costera, pescado local",
      "vida-nocturna": "bares elegantes, rooftops, experiencias nocturnas sofisticadas",
      "bienestar": "yoga, meditación, spas, retiros de bienestar",
      "mixto": "variedad completa de experiencias"
    };
    
    return mappings[motivo] || motivo.toLowerCase();
  }).join(", ");

  const hasContrastingInterests = 
    (motivosList.includes("relax") && motivosList.includes("aventura")) ||
    (motivosList.includes("cultura") && motivosList.includes("vida-nocturna"));

  return `
PERFIL DEL VIAJERO:
- Duración: ${profile.Días} día(s)
- Intereses (${motivosList.length}): ${motivos}
- Busca específicamente: ${interestsDescription}
- Otros municipios: ${profile["Otros municipios"] ?? "No"}
${profile.Email ? `- Email: ${profile.Email} (viajero registrado)` : "- Viajero anónimo"}

CONSIDERACIONES ESPECIALES PARA TURISTA:
1. Es su primera vez en el Atlántico - necesita un itinerario claro y sin complicaciones
2. Probablemente se movilizará en taxi/uber - considera costos de múltiples trayectos
3. Necesita tiempo para comidas, descansos e imprevistos
4. El clima es caluroso - no saturar con actividades extenuantes

INSTRUCCIONES PARA ORGANIZACIÓN:
1. AGRUPA geográficamente: todos los lugares de un día deben estar en la misma zona
2. PRIMER DÍA: Comienza con lugares cercanos al usuario (menos de 5km)
3. INCLUYE todos los intereses seleccionados: ${motivosList.join(", ")}
${hasContrastingInterests ? "4. ALTERNA entre actividades contrastantes durante el día" : ""}
5. DEJA espacio para exploración espontánea - no más de 4 actividades por día

IMPORTANTE: El turista debe sentir que aprovechó su tiempo sin agotarse. Calidad sobre cantidad.
`.trim();
}

// Función de generación AI mejorada
async function generateAIItinerary(
  openai: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  attemptNumber: number
) {
  try {
    // Usar GPT-4 solo en el primer intento
    const model = attemptNumber === 1 ? "gpt-4-turbo-preview" : "gpt-3.5-turbo";
    
    console.log(`Usando modelo: ${model}`);
    
    const resp = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 + (attemptNumber * 0.1),
      max_tokens: 2000,
    });
    
    const content = resp.choices[0]?.message?.content ?? "{}";
    console.log(`Respuesta AI (${content.length} chars):`, content.substring(0, 200));
    
    return content;
  } catch (error: any) {
    console.error("Error en OpenAI:", error);
    
    if (error?.status === 429) {
      console.log("Rate limit alcanzado, esperando...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw error;
  }
}

// Validación más flexible
function validateAIResponseFlexible(
  aiJSON: string, 
  allStops: ItineraryStop[],
  expectedDays: number
) {
  const result = {
    validItinerary: [] as ItineraryStop[],
    invalidIds: [] as string[],
    partialItinerary: [] as ItineraryStop[]
  };

  try {
    const parsed = JSON.parse(aiJSON);
    const aiItinerary = 
      parsed.itinerary || 
      parsed.Itinerary || 
      parsed.itinerario || 
      parsed.stops || 
      parsed.activities || 
      [];

    if (!Array.isArray(aiItinerary)) {
      console.error("AI no devolvió un array");
      return result;
    }

    const seen = new Set<string>();

    aiItinerary.forEach((item: any) => {
      if (!item?.id) return;
      
      const cleanId = item.id.toString().trim();
      
      if (seen.has(cleanId)) return;
      seen.add(cleanId);
      
      const found = allStops.find((s) => 
        s.id === cleanId || 
        s.id.toLowerCase() === cleanId.toLowerCase()
      );
      
      if (!found) {
        result.invalidIds.push(cleanId);
        return;
      }
      
      const startTime = validateTimeFlexible(item.startTime);
      const duration = validateDuration(item.durationMinutes || item.duration || 60);
      
      const validStop = {
        ...found,
        startTime: startTime || "09:00",
        durationMinutes: duration,
      };
      
      result.validItinerary.push(validStop);
      result.partialItinerary.push(validStop);
    });

    console.log(`Validación: ${result.validItinerary.length} válidos, ${result.invalidIds.length} inválidos`);

  } catch (e) {
    console.error("Error parseando JSON de IA:", e);
    console.error("JSON recibido:", aiJSON.substring(0, 500));
  }

  return result;
}

// Validación de tiempo flexible
const validateTimeFlexible = (t: any): string => {
  if (!t) return "";
  
  const timeStr = t.toString().trim();
  
  const patterns = [
    /^(\d{1,2}):(\d{2})$/,
    /^(\d{1,2})\.(\d{2})$/,
    /^(\d{1,2})(\d{2})$/,
    /^(\d{1,2})\s*:\s*(\d{2})$/,
  ];
  
  for (const pattern of patterns) {
    const match = timeStr.match(pattern);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2] || "0");
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }
    }
  }
  
  const hourOnly = parseInt(timeStr);
  if (!isNaN(hourOnly) && hourOnly >= 0 && hourOnly <= 23) {
    return `${hourOnly.toString().padStart(2, "0")}:00`;
  }
  
  return "";
};

const validateDuration = (d: any): number => {
  const duration = Number(d);
  if (isNaN(duration)) return 60;
  return Math.max(30, Math.min(duration, 240));
};

// Función para completar itinerarios parciales
async function enrichPartialItinerary(
  partialItinerary: ItineraryStop[],
  allStops: ItineraryStop[],
  targetDays: number,
  interests: string
): Promise<ItineraryStop[]> {
  const targetStops = targetDays * 3;
  
  if (partialItinerary.length >= targetStops) {
    return partialItinerary;
  }
  
  const userInterests = interests.toLowerCase().split(',').map(i => i.trim());
  
  const usedIds = new Set(partialItinerary.map(s => s.id));
  const availableStops = allStops.filter(stop => {
    if (usedIds.has(stop.id)) return false;
    
    const stopCategory = (stop.category || '').toLowerCase();
    const stopName = stop.name.toLowerCase();
    const stopDesc = stop.description.toLowerCase();
    
    return userInterests.some(interest => 
      stopCategory.includes(interest) ||
      stopName.includes(interest) ||
      stopDesc.includes(interest)
    );
  });
  
  const enriched = [...partialItinerary];
  const stopsNeeded = targetStops - enriched.length;
  
  const candidates = availableStops.slice(0, stopsNeeded);
  enriched.push(...candidates);
  
  if (enriched.length < targetStops) {
    const generalStops = allStops
      .filter(s => !usedIds.has(s.id) && !candidates.includes(s))
      .slice(0, targetStops - enriched.length);
    enriched.push(...generalStops);
  }
  
  return enriched;
}

// Verificación contra Firestore
async function verifyFirestoreDocuments(
  db: FirebaseFirestore.Firestore,
  itinerary: ItineraryStop[]
) {
  const results = await Promise.all(
    itinerary.map(async (s) => {
      try {
        const snap = await db
          .collection(s.type === "destination" ? "destinations" : "experiences")
          .doc(s.id)
          .get();
        return snap.exists ? s : null;
      } catch (error) {
        console.error(`Error verificando documento ${s.id}:`, error);
        return null;
      }
    })
  );
  return results.filter(Boolean) as ItineraryStop[];
}

// NUEVA FUNCIÓN: Cálculo de tiempos realista considerando distancias
function calculateRealisticTimings(
  itinerary: ItineraryStop[],
  userLocation: { lat: number; lng: number }
): ItineraryStop[] {
  if (!itinerary.length) return itinerary;
  
  let currentTime = 9 * 60; // 9:00 AM inicio por defecto
  let previousLocation = userLocation; // Empezar desde ubicación del usuario
  
  return itinerary.map((stop, idx) => {
    // Calcular tiempo de viaje desde ubicación anterior
    if (idx > 0 || previousLocation !== userLocation) {
      const travelTime = calculateTravelTime(
        previousLocation,
        { lat: stop.lat, lng: stop.lng },
        currentTime
      );
      
      currentTime += travelTime;
      
      // Agregar buffer según tipo de actividad
      const buffer = getActivityBuffer(stop.category);
      currentTime += buffer;
      
      // Ajustes especiales para horarios
      const currentHour = Math.floor(currentTime / 60);
      
      // Si es hora de almuerzo y es un restaurante
      if (stop.category?.toLowerCase().includes('restaurante') || 
          stop.category?.toLowerCase().includes('gastronomía')) {
        if (currentHour >= 11 && currentHour < 12) {
          currentTime = 12 * 60; // Ajustar a mediodía
        } else if (currentHour >= 18 && currentHour < 19) {
          currentTime = 19 * 60; // Ajustar para cena
        }
      }
      
      // No empezar actividades muy tarde
      if (currentHour >= 19 && stop.type === 'destination') {
        // Si es muy tarde para un destino turístico, moverlo al día siguiente
        console.warn(`Actividad ${stop.name} muy tarde (${toHHMM(currentTime)}), considerar reorganizar`);
      }
    }
    
    // Usar horario sugerido por AI si es válido y razonable
    let startTime = toHHMM(currentTime);
    if (stop.startTime && validateTimeFlexible(stop.startTime)) {
      const suggestedTime = toMin(stop.startTime);
      // Solo usar el tiempo sugerido si no es antes del tiempo calculado
      if (suggestedTime >= currentTime) {
        startTime = stop.startTime;
        currentTime = suggestedTime;
      }
    }
    
    // Actualizar tiempo actual y ubicación previa
    currentTime += stop.durationMinutes;
    previousLocation = { lat: stop.lat, lng: stop.lng };
    
    return { ...stop, startTime };
  });
}

// Enriquecer con tips personalizados
function enrichItineraryWithTips(
  itinerary: ItineraryStop[], 
  motivos: string
): ItineraryStop[] {
  const motivosList = motivos.split(",").map(m => m.trim());
  
  return itinerary.map((stop, idx) => {
    let tip = "";
    
    // Tips basados en categoría y motivos
    if (stop.category?.toLowerCase().includes('playa') && motivosList.includes('relax')) {
      tip = "Lleva protector solar SPF 50+, sombrero y agua. Las carpas se alquilan por $30.000-40.000 COP.";
    } else if (stop.category?.toLowerCase().includes('museo') && motivosList.includes('cultura')) {
      tip = "Entrada gratuita el último domingo del mes. Aire acondicionado disponible. Tours guiados cada hora.";
    } else if (stop.category?.toLowerCase().includes('restaurante')) {
      const hour = parseInt(stop.startTime.split(':')[0]);
      if (hour >= 12 && hour <= 14) {
        tip = "Hora pico de almuerzo - reserva o llega 15 min antes. Prueba el menú del día por mejor precio.";
      } else {
        tip = "Prueba el pescado frito con patacones y arroz con coco. Pregunta por la pesca del día.";
      }
    } else if (stop.type === 'experience' && motivosList.includes('aventura')) {
      tip = "Confirma disponibilidad por WhatsApp antes de ir. Lleva efectivo, ropa cómoda y cámara.";
    } else if (stop.municipality.includes('Puerto Colombia')) {
      tip = "45-60 min desde Barranquilla. El Uber/taxi cuesta aprox $35.000-45.000 COP. Atardeceres espectaculares.";
    } else if (idx === 0) {
      tip = "Primera parada del día - desayuna antes o cerca. Llega 10 min antes para evitar filas.";
    }
    
    // Tips de transporte entre actividades
    if (idx < itinerary.length - 1) {
      const nextStop = itinerary[idx + 1];
      const distance = haversine(
        { lat: stop.lat, lng: stop.lng },
        { lat: nextStop.lat, lng: nextStop.lng }
      );
      
      if (distance > 5) {
        tip += ` Siguiente parada a ${distance.toFixed(1)}km - considera pedir taxi/Uber con anticipación.`;
      }
    }
    
    return tip ? { ...stop, tip } : stop;
  });
}

// Guardar solicitud
async function savePlanningRequest(
  db: FirebaseFirestore.Firestore,
  profile: Record<string, string>,
  location: any,
  itinerary: ItineraryStop[],
  attempts: number
) {
  try {
    // Calcular estadísticas del itinerario
    const totalDistance = itinerary.reduce((sum, stop, idx) => {
      if (idx === 0) return sum;
      return sum + haversine(
        { lat: itinerary[idx-1].lat, lng: itinerary[idx-1].lng },
        { lat: stop.lat, lng: stop.lng }
      );
    }, 0);
    
    await db.collection("planner_requests").add({
      email: profile.Email ?? null,
      profile,
      location,
      itinerary,
      totalDays: Number(profile.Días),
      totalStops: itinerary.length,
      totalDistanceKm: Math.round(totalDistance),
      interests: profile.Motivos?.split(",").map(m => m.trim()),
      attempts,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: profile.userAgent || null,
    });
  } catch (e) {
    console.error("Error guardando planner_requests:", e);
  }
}