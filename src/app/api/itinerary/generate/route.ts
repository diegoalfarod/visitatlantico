// src/app/api/itinerary/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ──────────────────────────────────────────────────────────────────────────
   Tipos
   ────────────────────────────────────────────────────────────────────────── */
interface ItineraryRequest {
  profile: {
    days: number;
    email: string;
    interests: string[];
    tripType: string;
    budget: string;
    locationRange: string; // "barranquilla" | "todo_atlantico"
    startLocation?: any;
    itineraryRequestId?: string;
  };
  preferences?: {
    pace?: 'relaxed' | 'moderate' | 'intensive';
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
  tripType: string;
  budget: string;
  locationRange: string;
  startLocation?: any;
  preferredPace: 'relaxed' | 'moderate' | 'intensive';
  maxTravelDistance: number;
  culturalDepth: 'surface' | 'deep' | 'immersive';
  foodAdventure: boolean;
  physicalActivity: 'low' | 'moderate' | 'high';
  crowdTolerance: 'avoid' | 'moderate' | 'doesnt_matter';
}

interface MunicipalityCluster {
  name: string;
  centerCoords: { lat: number; lng: number };
  destinations: any[];
  estimatedTimeToExplore: number;
  accessFromBarranquilla: number;
  bestTransportMode: 'walking' | 'taxi' | 'bus' | 'car_required';
  specialties: string[];
}

interface DayTheme {
  theme: string;
  municipality: string;
  focusCategories: string[];
  estimatedTravelTime: number;
  recommendedStartTime: string;
  maxRecommendedStops: number;
}

interface RouteOptimizationResult {
  optimizedStops: any[];
  totalDistance: number;
  totalTravelTime: number;
  suggestedBreaks: BreakSuggestion[];
  routeAnalysis: RouteAnalysis;
}
interface BreakSuggestion {
  id: string;
  type: 'meal' | 'rest' | 'bathroom' | 'photo';
  name: string;
  description: string;
  insertAfterStopId: string;
  estimatedDuration: number;
  lat: number;
  lng: number;
  category: string;
}
interface RouteAnalysis {
  efficiency: number;
  walkingIntensive: boolean;
  drivingRequired: boolean;
  publicTransportRecommended: boolean;
  peakTrafficWarnings: string[];
  accessibilityNotes: string[];
}

/* ──────────────────────────────────────────────────────────────────────────
   ENV (única definición)
   ────────────────────────────────────────────────────────────────────────── */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_KEY || process.env.GOOGLE_PLACES_API_KEY;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/* ──────────────────────────────────────────────────────────────────────────
   Clusters Municipales
   ────────────────────────────────────────────────────────────────────────── */
const MUNICIPALITY_CLUSTERS: MunicipalityCluster[] = [
  {
    name: "Barranquilla",
    centerCoords: { lat: 10.9878, lng: -74.7889 },
    destinations: [],
    estimatedTimeToExplore: 8,
    accessFromBarranquilla: 0,
    bestTransportMode: 'walking',
    specialties: ['cultura urbana', 'gastronomía', 'malecón', 'museos', 'vida nocturna', 'carnaval']
  },
  {
    name: "Puerto Colombia",
    centerCoords: { lat: 10.9878, lng: -74.9547 },
    destinations: [],
    estimatedTimeToExplore: 6,
    accessFromBarranquilla: 45,
    bestTransportMode: 'taxi',
    specialties: ['playas', 'historia férrea', 'gastronomía costera', 'muelle histórico']
  },
  {
    name: "Soledad",
    centerCoords: { lat: 10.9185, lng: -74.7737 },
    destinations: [],
    estimatedTimeToExplore: 4,
    accessFromBarranquilla: 25,
    bestTransportMode: 'bus',
    specialties: ['comercio popular', 'gastronomía local', 'cultura popular']
  },
  {
    name: "Malambo",
    centerCoords: { lat: 10.8596, lng: -74.7739 },
    destinations: [],
    estimatedTimeToExplore: 3,
    accessFromBarranquilla: 30,
    bestTransportMode: 'bus',
    specialties: ['folclore', 'danza', 'artesanías', 'tradiciones']
  },
  {
    name: "Galapa",
    centerCoords: { lat: 10.8968, lng: -74.8821 },
    destinations: [],
    estimatedTimeToExplore: 4,
    accessFromBarranquilla: 35,
    bestTransportMode: 'car_required',
    specialties: ['naturaleza', 'ecoturismo', 'tranquilidad rural', 'aire puro']
  },
  {
    name: "Tubará",
    centerCoords: { lat: 10.8833, lng: -75.0500 },
    destinations: [],
    estimatedTimeToExplore: 6,
    accessFromBarranquilla: 60,
    bestTransportMode: 'car_required',
    specialties: ['playas vírgenes', 'naturaleza', 'deportes acuáticos', 'kitesurf']
  }
];

/* ──────────────────────────────────────────────────────────────────────────
   Normalización de intereses (fix itinerario vacío)
   ────────────────────────────────────────────────────────────────────────── */
const INTEREST_SYNONYMS: Record<string, string> = {
  "deportes-acuaticos": "aventura",
  "ecoturismo": "aventura",
  "festivales": "ritmos",
  "malecon": "gastronomia",
  "playa": "relax",
};
const SUPPORTED_INTERESTS = new Set(["relax", "cultura", "aventura", "gastronomia", "artesanias", "ritmos"]);

function normalizeInterests(list: string[]) {
  return (list || []).map((i) => INTEREST_SYNONYMS[i] || i);
}

/* ──────────────────────────────────────────────────────────────────────────
   Handler principal
   ────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: ItineraryRequest = await req.json();
    const { profile, preferences } = body;

    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    console.log("🔄 Iniciando generación de itinerario ultra-específico + optimización...");

    // 1) Perfil enriquecido
    const enhancedProfile: EnhancedUserProfile = {
      ...profile,
      preferredPace: preferences?.pace || inferPaceFromProfile(profile),
      maxTravelDistance: preferences?.maxTravelDistance || inferMaxTravelDistance(profile),
      culturalDepth: preferences?.culturalDepth || inferCulturalDepth(profile),
      foodAdventure: preferences?.foodAdventure ?? profile.interests.includes('gastronomia'),
      physicalActivity: preferences?.physicalActivity || inferPhysicalActivity(profile),
      crowdTolerance: preferences?.crowdTolerance || inferCrowdTolerance(profile),
    };

    // 2) Destinos desde Firestore + filtro ultra-específico
    const firebaseDestinations = await getEnhancedDestinations(enhancedProfile);

    // 3) Enriquecer con Google Places (si hay key)
    const enrichedDestinations = GOOGLE_PLACES_KEY
      ? await enrichWithSpecificPlaces(firebaseDestinations, enhancedProfile)
      : firebaseDestinations;

    console.log(`📍 ${enrichedDestinations.length} destinos ultra-específicos encontrados`);

    // 4) Agrupar por municipio + crear temas por día
    const municipalityGroups = groupDestinationsByMunicipality(enrichedDestinations);
    const dailyThemes = createCoherentDailyThemes(enhancedProfile, municipalityGroups);

    // 5) Selección por día + horarios realistas
    const finalItinerary: any[] = [];
    const detailedAnalysis: any[] = [];

    for (let dayIndex = 0; dayIndex < dailyThemes.length; dayIndex++) {
      const theme = dailyThemes[dayIndex];
      const day = dayIndex + 1;

      const municipalityDestinations = municipalityGroups.get(theme.municipality) || [];
      const selectedDestinations = selectUltraSpecificDestinations(theme, municipalityDestinations, enhancedProfile);

      const optimizedOrder = optimizeWithinMunicipality(selectedDestinations);
      const scheduledStops = await scheduleUltraRealisticTiming(optimizedOrder, theme, enhancedProfile);

      finalItinerary.push(
        ...scheduledStops.map((stop: any) => ({
          ...stop,
          day,
          dayTitle: theme.theme,
          municipality: theme.municipality,
          type: "destination",
        }))
      );

      detailedAnalysis.push(analyzeIndividualDay(scheduledStops, theme, enhancedProfile));
    }

    // 6) Métricas de calidad
    const qualityMetrics = calculateItineraryQualityMetrics(finalItinerary, enhancedProfile);

    // 7) Insights personalizados
    const personalizedInsights = generateUltraPersonalizedInsights(finalItinerary, enhancedProfile, qualityMetrics);

    // 8) (Extra) Optimización de rutas por día + breaks + distancias reales
    console.log("🗺️ Optimizando rutas por día...");
    const optimizedItinerary: any[] = [];
    const routeAnalysis: any[] = [];
    const dayGroups = groupItineraryByDay(finalItinerary);

    for (const [day, dayStops] of dayGroups.entries()) {
      const opt = await optimizeRouteForDay(
        dayStops.map((s: any, i: number) => ({
          ...s,
          id: s.id || `day${day}-stop${i + 1}`,
          lat: s.lat || s.coordinates?.lat,
          lng: s.lng || s.coordinates?.lng,
          durationMinutes: s.durationMinutes || 90,
          startTime: s.startTime || "09:00",
        })),
        MAPBOX_TOKEN
      );

      optimizedItinerary.push(
        ...opt.optimizedStops.map((s) => ({
          ...s,
          // mantener campos clave
          municipality: s.municipality,
          day,
          dayTitle: dayStops[0]?.dayTitle || `Día ${day}`,
        }))
      );

      // Insertar breaks sugeridos
      for (const br of opt.suggestedBreaks) {
        optimizedItinerary.push({
          id: br.id,
          day,
          dayTitle: `Día ${day}`,
          name: br.name,
          description: br.description,
          startTime: "12:00",
          endTime: "13:00",
          durationMinutes: br.estimatedDuration,
          category: br.category,
          municipality: "Descanso",
          lat: br.lat,
          lng: br.lng,
          tip: "Parada recomendada para mejorar la experiencia del viaje",
          mustTry: [],
          estimatedCost: br.type === "meal" ? 25000 : 0,
          crowdLevel: "low",
          distance: 0,
          type: "break",
          breakType: br.type,
          imageUrl: null,
          rating: null,
          address: null,
          travelTime: 0,
        });
      }

      routeAnalysis.push({
        day,
        ...opt.routeAnalysis,
        totalDistance: opt.totalDistance,
        totalTravelTime: opt.totalTravelTime,
      });

      console.log(
        `✅ Día ${day} optimizado: ${opt.totalDistance.toFixed(1)}km, ${Math.round(opt.totalTravelTime)}min de viaje`
      );
    }

    // 9) Distancias reales consecutivas
    const itineraryWithRealDistances = await calculateRealDistances(
      optimizedItinerary.sort((a, b) => a.day === b.day ? parseTime(a.startTime) - parseTime(b.startTime) : a.day - b.day),
      MAPBOX_TOKEN
    );

    // 10) Insights de viaje (ruta)
    const travelInsights = generateTravelInsights(itineraryWithRealDistances, routeAnalysis);

    // 11) Guardar (FireStore) - ultra específico + optimizado
    const itineraryId = await saveUltraSpecificItinerary(itineraryWithRealDistances, enhancedProfile, {
      dailyThemes,
      qualityMetrics,
      personalizedInsights,
      municipalitiesVisited: dailyThemes.map((t) => t.municipality),
      optimizationApplied: true,
      specificityLevel: "ultra-high",
      routeAnalysis,
      travelInsights,
    });

    return NextResponse.json({
      success: true,
      itinerary: itineraryWithRealDistances,
      itineraryId,
      dailyThemes,
      qualityMetrics,
      personalizedInsights,
      routeAnalysis,
      travelInsights,
      metadata: {
        municipalitiesVisited: dailyThemes.map((t) => t.municipality),
        totalSpecificityScore: qualityMetrics.specificityScore,
        coherenceScore: qualityMetrics.geographicalCoherence,
        optimizationLevel: "ultra-specific+route-optimized",
        generatedAt: new Date().toISOString(),
      },
      metrics: {
        totalStops: itineraryWithRealDistances.length,
        totalDistance: Number(
          itineraryWithRealDistances.reduce((sum, stop) => sum + (stop.distance || 0), 0).toFixed(1)
        ),
        averageEfficiency:
          routeAnalysis.reduce((sum, d) => sum + (d.efficiency || 0), 0) / Math.max(routeAnalysis.length, 1),
        optimizationApplied: true,
      },
    });
  } catch (error: any) {
    console.error("Error generating ultra-specific itinerary:", error);
    return NextResponse.json(
      { error: error.message || "Error generando el itinerario ultra-específico" },
      { status: 500 }
    );
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Inferencias de preferencias
   ────────────────────────────────────────────────────────────────────────── */
function inferPaceFromProfile(profile: any): 'relaxed' | 'moderate' | 'intensive' {
  if (profile.tripType === 'familia' || profile.budget === 'economico') return 'relaxed';
  if (profile.tripType === 'negocios' || profile.days <= 2) return 'intensive';
  return 'moderate';
}
function inferMaxTravelDistance(profile: any): number {
  if (profile.locationRange === 'barranquilla') return 10;
  if (profile.days >= 5) return 50;
  return 30;
}
function inferCulturalDepth(profile: any): 'surface' | 'deep' | 'immersive' {
  const culturalInterests = (profile.interests || []).filter((i: string) =>
    ['cultura', 'museos', 'historia', 'artesanias', 'ritmos'].includes(i)
  );
  if (culturalInterests.length >= 3) return 'immersive';
  if (culturalInterests.length >= 1) return 'deep';
  return 'surface';
}
function inferPhysicalActivity(profile: any): 'low' | 'moderate' | 'high' {
  const activeInterests = (profile.interests || []).filter((i: string) =>
    ['aventura', 'deportes-acuaticos', 'ecoturismo'].includes(i)
  );
  if (activeInterests.length >= 2) return 'high';
  if (activeInterests.length >= 1) return 'moderate';
  return 'low';
}
function inferCrowdTolerance(profile: any): 'avoid' | 'moderate' | 'doesnt_matter' {
  if ((profile.interests || []).includes('relax') || profile.tripType === 'pareja') return 'avoid';
  if ((profile.interests || []).includes('festivales') || profile.tripType === 'amigos') return 'doesnt_matter';
  return 'moderate';
}

/* ──────────────────────────────────────────────────────────────────────────
   Destinos (Firestore) + filtro ultra-específico (con normalización)
   ────────────────────────────────────────────────────────────────────────── */
async function getEnhancedDestinations(profile: EnhancedUserProfile) {
  try {
    const projectId = "visitatlantico-f5c09";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/destinations`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Firebase no disponible, usando destinos por defecto");
      return getUltraSpecificDefaultDestinations(profile);
    }

    const data = await response.json();
    const destinations =
      data.documents?.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          id: doc.name.split('/').pop(),
          name: fields.name?.stringValue || '',
          description: fields.description?.stringValue || '',
          categories: fields.categories?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
          municipality: fields.municipality?.stringValue || 'Barranquilla',
          address: fields.address?.stringValue || '',
          coordinates: fields.coordinates
            ? {
                lat: fields.coordinates.mapValue?.fields?.lat?.doubleValue || 0,
                lng: fields.coordinates.mapValue?.fields?.lng?.doubleValue || 0,
              }
            : null,
          rating: fields.rating?.doubleValue,
          imageUrl: fields.imageUrl?.stringValue || fields.imagePath?.stringValue,
          typicalDuration: Number(fields.typicalDuration?.integerValue) || 90,
          crowdLevel: fields.crowdLevel?.stringValue || 'medium',
          accessibilityScore: Number(fields.accessibilityScore?.integerValue) || 3,
        };
      }) || [];

    return filterByUltraSpecificCriteria(destinations, profile);
  } catch (error) {
    console.error("Error fetching enhanced destinations:", error);
    return getUltraSpecificDefaultDestinations(profile);
  }
}

function getUltraSpecificDefaultDestinations(profile: EnhancedUserProfile) {
  const baseDestinations = [
    {
      id: "museo_caribe",
      name: "Museo del Caribe",
      description: "Centro cultural interactivo que celebra la identidad caribeña con tecnología moderna",
      categories: ["cultura", "museo", "historia", "tecnología"],
      municipality: "Barranquilla",
      coordinates: { lat: 10.9838, lng: -74.7881 },
      rating: 4.7,
      typicalDuration: 120,
      crowdLevel: "medium",
      accessibilityScore: 5,
    },
    {
      id: "castillo_salgar",
      name: "Castillo de Salgar",
      description: "Fortificación histórica del siglo XIX con vista panorámica al Mar Caribe",
      categories: ["cultura", "historia", "fotografía", "arquitectura"],
      municipality: "Barranquilla",
      coordinates: { lat: 11.0319, lng: -74.8661 },
      rating: 4.5,
      typicalDuration: 90,
      crowdLevel: "low",
      accessibilityScore: 2,
    },
    {
      id: "malecon",
      name: "Gran Malecón del Río",
      description: "Paseo ribereño de 1.2km con gastronomía, entretenimiento y vistas al río Magdalena",
      categories: ["malecon", "gastronomía", "familia", "paseo"],
      municipality: "Barranquilla",
      coordinates: { lat: 10.9878, lng: -74.7889 },
      rating: 4.6,
      typicalDuration: 180,
      crowdLevel: "high",
      accessibilityScore: 5,
    },
    {
      id: "bocas_ceniza",
      name: "Bocas de Ceniza",
      description: "Fenómeno natural único donde el río Magdalena se encuentra con el Mar Caribe",
      categories: ["naturaleza", "fotografía", "geología"],
      municipality: "Barranquilla",
      coordinates: { lat: 11.0953, lng: -74.8556 },
      rating: 4.3,
      typicalDuration: 120,
      crowdLevel: "medium",
      accessibilityScore: 3,
    },
    {
      id: "playa_puerto_colombia",
      name: "Playa de Puerto Colombia",
      description: "Playa histórica con muelle centenario y gastronomía costera auténtica",
      categories: ["playa", "historia", "gastronomía", "relax"],
      municipality: "Puerto Colombia",
      coordinates: { lat: 11.0319, lng: -74.9547 },
      rating: 4.4,
      typicalDuration: 240,
      crowdLevel: "medium",
      accessibilityScore: 3,
    },
    {
      id: "muelle_puerto_colombia",
      name: "Muelle de Puerto Colombia",
      description: "Muelle histórico de hierro, patrimonio de la ingeniería ferroviaria del siglo XIX",
      categories: ["historia", "arquitectura", "ingeniería", "patrimonio"],
      municipality: "Puerto Colombia",
      coordinates: { lat: 11.029, lng: -74.958 },
      rating: 4.2,
      typicalDuration: 60,
      crowdLevel: "low",
      accessibilityScore: 2,
    },
  ];

  return filterByUltraSpecificCriteria(baseDestinations, profile);
}

function filterByUltraSpecificCriteria(destinations: any[], profile: EnhancedUserProfile) {
  const normalized = normalizeInterests(profile.interests || []);
  const hasSupported = normalized.some((i) => SUPPORTED_INTERESTS.has(i));

  return destinations
    .filter((dest) => {
      // Ubicación (solo BAQ si corresponde)
      if (profile.locationRange === "barranquilla") {
        const barranquillaArea = ["barranquilla", "soledad", "malambo"];
        if (!barranquillaArea.some((area) => dest.municipality?.toLowerCase().includes(area))) {
          return false;
        }
      }
      // Evitar multitudes si prefiere evitarlas
      if (profile.crowdTolerance === "avoid" && dest.crowdLevel === "high") return false;
      // Accesibilidad si actividad física baja
      if (profile.physicalActivity === "low" && (dest.accessibilityScore ?? 0) < 3) return false;

      // Afinidad ultra-específica solo si hay intereses soportados
      if ((normalized.length > 0) && hasSupported) {
        const specificityScore = calculateUltraSpecificInterestMatch(dest, { ...profile, interests: normalized } as any);
        return specificityScore > 40;
      }
      // Si no hay intereses soportados (p. ej., solo “malecon”, “festivales”), no bloquear
      return true;
    })
    .map((dest) => ({
      ...dest,
      specificityScore: calculateUltraSpecificInterestMatch(dest, { ...profile, interests: normalized } as any),
    }));
}

/* ──────────────────────────────────────────────────────────────────────────
   Matching ultra-específico
   ────────────────────────────────────────────────────────────────────────── */
function calculateUltraSpecificInterestMatch(destination: any, profile: EnhancedUserProfile): number {
  let score = 0;

  const ultraSpecificMap: Record<string, { keywords: string[]; weight: number; exclusions?: string[] }> = {
    relax: {
      keywords: ['playa', 'spa', 'tranquilo', 'sereno', 'paz', 'descanso', 'relajante'],
      weight: 1.0,
      exclusions: ['ruido', 'multitud', 'bullicio'],
    },
    cultura: {
      keywords: ['museo', 'patrimonio', 'historia', 'arte', 'colonial', 'arquitectura', 'herencia'],
      weight: 1.5,
      exclusions: ['comercial', 'artificial'],
    },
    aventura: {
      keywords: ['extremo', 'adrenalina', 'desafío', 'deporte', 'actividad', 'expedición', 'kitesurf'],
      weight: 1.2,
    },
    gastronomia: {
      keywords: ['auténtico', 'típico', 'local', 'tradicional', 'sabores', 'cocina', 'chef', 'restaurante'],
      weight: 1.3,
      exclusions: ['cadena', 'fast food'],
    },
    artesanias: {
      keywords: ['artesano', 'hecho a mano', 'tradicional', 'auténtico', 'local', 'mercado'],
      weight: 1.1,
    },
    ritmos: {
      keywords: ['folclore', 'tradicional', 'cumbia', 'vallenato', 'música', 'danza', 'carnaval'],
      weight: 1.2,
    },
  };

  const interests = normalizeInterests(profile.interests || []);
  const searchableText = `${destination.name} ${destination.description} ${destination.categories?.join(' ') || ''}`.toLowerCase();

  for (const interest of interests) {
    const config = ultraSpecificMap[interest];
    if (!config) continue;

    let interestScore = 0;

    for (const keyword of config.keywords) {
      if (searchableText.includes(keyword.toLowerCase())) {
        interestScore += 25 * config.weight;
      }
    }

    if (config.exclusions) {
      for (const exclusion of config.exclusions) {
        if (searchableText.includes(exclusion.toLowerCase())) {
          interestScore -= 20;
        }
      }
    }

    score += Math.max(0, interestScore);
  }

  if (destination.rating > 4.2) score += 15;
  if (profile.culturalDepth === 'immersive' && (destination.categories || []).includes('historia')) score += 20;

  return Math.min(100, Math.max(0, score));
}

/* ──────────────────────────────────────────────────────────────────────────
   Agrupar y temas por día
   ────────────────────────────────────────────────────────────────────────── */
function groupDestinationsByMunicipality(destinations: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();
  for (const dest of destinations) {
    const municipality = dest.municipality || 'Barranquilla';
    if (!groups.has(municipality)) groups.set(municipality, []);
    groups.get(municipality)!.push(dest);
  }
  return groups;
}

function createCoherentDailyThemes(profile: EnhancedUserProfile, municipalityGroups: Map<string, any[]>): DayTheme[] {
  const themes: DayTheme[] = [];
  const availableMunicipalities = Array.from(municipalityGroups.keys()).filter((m) => municipalityGroups.get(m)!.length > 0);

  for (let day = 1; day <= profile.days; day++) {
    let selectedMunicipality: string;

    if (day === 1 || profile.locationRange === "barranquilla") {
      selectedMunicipality = "Barranquilla";
    } else {
      const usedMunicipalities = themes.map((t) => t.municipality);
      const options = availableMunicipalities.filter((m) => m !== "Barranquilla" && !usedMunicipalities.includes(m));
      selectedMunicipality = options.length > 0 ? selectOptimalMunicipality(options, profile) : "Barranquilla";
    }

    const cluster = MUNICIPALITY_CLUSTERS.find((c) => c.name === selectedMunicipality);
    if (!cluster) continue;

    const theme = generateDayTheme(profile, selectedMunicipality, cluster);
    themes.push(theme);
  }

  return themes;
}

function selectOptimalMunicipality(municipalities: string[], profile: EnhancedUserProfile): string {
  let bestMunicipality = municipalities[0];
  let bestScore = -Infinity;

  for (const municipality of municipalities) {
    const cluster = MUNICIPALITY_CLUSTERS.find((c) => c.name === municipality);
    if (!cluster) continue;

    let score = 0;

    if (profile.preferredPace === 'relaxed' && cluster.accessFromBarranquilla > 45) score -= 25;

    for (const specialty of cluster.specialties) {
      for (const interestRaw of profile.interests) {
        const interest = INTEREST_SYNONYMS[interestRaw] || interestRaw;
        if (specialty.includes(interest) || interest.includes(specialty.split(' ')[0])) {
          score += 20;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMunicipality = municipality;
    }
  }

  return bestMunicipality;
}

function generateDayTheme(profile: EnhancedUserProfile, municipality: string, cluster: MunicipalityCluster): DayTheme {
  const userInterests = normalizeInterests(profile.interests);
  const specialties = cluster.specialties;

  const matchingSpecialties = specialties.filter((s) =>
    userInterests.some((i) => s.includes(i) || i.includes(s.split(' ')[0]))
  );

  const theme = matchingSpecialties.length > 0
    ? `${municipality}: ${matchingSpecialties[0]}`
    : `Explorando ${municipality}: ${specialties[0]}`;

  let maxStops = 3;
  switch (profile.preferredPace) {
    case 'relaxed': maxStops = 3; break;
    case 'moderate': maxStops = 4; break;
    case 'intensive': maxStops = 5; break;
  }
  if (cluster.accessFromBarranquilla > 45) maxStops = Math.max(2, maxStops - 1);
  if (profile.culturalDepth === 'immersive') maxStops = Math.max(2, maxStops - 1);

  return {
    theme,
    municipality,
    focusCategories: matchingSpecialties.length ? matchingSpecialties : [specialties[0]],
    estimatedTravelTime: cluster.accessFromBarranquilla,
    recommendedStartTime: municipality === "Barranquilla" ? "09:00" : "08:00",
    maxRecommendedStops: maxStops,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   Selección, optimización local y horarios
   ────────────────────────────────────────────────────────────────────────── */
function selectUltraSpecificDestinations(theme: DayTheme, availableDestinations: any[], profile: EnhancedUserProfile): any[] {
  const cluster = MUNICIPALITY_CLUSTERS.find((c) => c.name === theme.municipality);
  const center = cluster?.centerCoords || { lat: 10.9878, lng: -74.7889 };

  const scored = availableDestinations.map((dest) => ({
    ...dest,
    distanceFromCenter: calculateDistance(center, {
      lat: dest.coordinates?.lat ?? dest.lat,
      lng: dest.coordinates?.lng ?? dest.lng,
    }),
  }));

  const ultraRelevant = scored.filter((d) => (d.specificityScore || 0) > 60);

  ultraRelevant.sort((a, b) => {
    const diff = (b.specificityScore || 0) - (a.specificityScore || 0);
    if (Math.abs(diff) < 15) return a.distanceFromCenter - b.distanceFromCenter;
    return diff;
  });

  const selected: any[] = [];
  const maxDistance = profile.preferredPace === 'relaxed' ? 2 : profile.preferredPace === 'moderate' ? 4 : 6;

  for (const dest of ultraRelevant) {
    if (selected.length >= theme.maxRecommendedStops) break;

    const tooFar = selected.some((s) =>
      calculateDistance(
        { lat: dest.coordinates?.lat ?? dest.lat, lng: dest.coordinates?.lng ?? dest.lng },
        { lat: s.coordinates?.lat ?? s.lat, lng: s.coordinates?.lng ?? s.lng }
      ) > maxDistance
    );
    if (!tooFar || selected.length < 2) selected.push(dest);
  }

  return selected.length > 0 ? selected : ultraRelevant.slice(0, Math.max(2, theme.maxRecommendedStops));
}

function optimizeWithinMunicipality(destinations: any[]): any[] {
  if (destinations.length <= 2) return destinations;
  const optimized = [destinations[0]];
  const remaining = [...destinations.slice(1)];

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      { lat: current.coordinates?.lat ?? current.lat, lng: current.coordinates?.lng ?? current.lng },
      { lat: remaining[0].coordinates?.lat ?? remaining[0].lat, lng: remaining[0].coordinates?.lng ?? remaining[0].lng }
    );
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        { lat: current.coordinates?.lat ?? current.lat, lng: current.coordinates?.lng ?? current.lng },
        { lat: remaining[i].coordinates?.lat ?? remaining[i].lat, lng: remaining[i].coordinates?.lng ?? remaining[i].lng }
      );
      if (distance < nearestDistance) {
        nearestIndex = i;
        nearestDistance = distance;
      }
    }
    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  return optimized;
}

async function scheduleUltraRealisticTiming(stops: any[], theme: DayTheme, profile: EnhancedUserProfile): Promise<any[]> {
  const scheduled: any[] = [];
  let currentTime = parseTime(theme.recommendedStartTime);
  if (theme.municipality !== 'Barranquilla') currentTime += theme.estimatedTravelTime;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const visitDuration = calculateUltraSpecificVisitDuration(stop, profile);
    let travelTime = 0;
    if (i < stops.length - 1) {
      travelTime = await calculateRealisticTravelTime(stop, stops[i + 1]);
    }

    scheduled.push({
      ...stop,
      startTime: formatTime(currentTime),
      endTime: formatTime(currentTime + visitDuration),
      durationMinutes: visitDuration,
      travelTimeToNext: travelTime,
      distanceToNext:
        i < stops.length - 1
          ? calculateDistance(
              { lat: stop.coordinates?.lat ?? stop.lat, lng: stop.coordinates?.lng ?? stop.lng },
              { lat: stops[i + 1].coordinates?.lat ?? stops[i + 1].lat, lng: stops[i + 1].coordinates?.lng ?? stops[i + 1].lng }
            )
          : 0,
    });

    currentTime += visitDuration + travelTime + 20; // buffer 20 min
  }

  return scheduled;
}

function calculateUltraSpecificVisitDuration(destination: any, profile: EnhancedUserProfile): number {
  let baseDuration = destination.typicalDuration || 90;
  const category = destination.category || destination.categories?.[0] || '';
  switch (category.toLowerCase()) {
    case 'museo':
    case 'cultura':
      if (profile.culturalDepth === 'immersive') baseDuration = Math.max(150, baseDuration * 1.5);
      else if (profile.culturalDepth === 'deep') baseDuration = Math.max(120, baseDuration * 1.2);
      break;
    case 'playa':
    case 'relax':
      baseDuration = profile.preferredPace === 'relaxed' ? Math.max(180, baseDuration * 1.4) : baseDuration;
      break;
    case 'gastronomia':
      baseDuration = profile.foodAdventure ? Math.max(120, baseDuration * 1.3) : baseDuration;
      break;
    case 'aventura':
      baseDuration = profile.physicalActivity === 'high' ? Math.max(150, baseDuration * 1.4) : baseDuration;
      break;
  }
  if ((destination.specificityScore || 0) > 80) baseDuration *= 1.25;
  return Math.round(baseDuration);
}

async function calculateRealisticTravelTime(from: any, to: any): Promise<number> {
  const distance = calculateDistance(
    { lat: from.coordinates?.lat ?? from.lat, lng: from.coordinates?.lng ?? from.lng },
    { lat: to.coordinates?.lat ?? to.lat, lng: to.coordinates?.lng ?? to.lng }
  );
  const urbanSpeed = 12; // km/h
  const estimatedMinutes = Math.max(15, (distance / urbanSpeed) * 60);
  return Math.round(estimatedMinutes);
}

/* ──────────────────────────────────────────────────────────────────────────
   Análisis/metricas
   ────────────────────────────────────────────────────────────────────────── */
function analyzeIndividualDay(stops: any[], theme: DayTheme, profile: EnhancedUserProfile) {
  const totalVisitTime = stops.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalTravelTime = stops.reduce((sum, s) => sum + (s.travelTimeToNext || 0), 0);
  const avgSpecificity = stops.reduce((sum, s) => sum + (s.specificityScore || 0), 0) / Math.max(stops.length, 1);
  return {
    day: theme.municipality,
    totalVisitTime,
    totalTravelTime,
    avgSpecificity,
    efficiency: Math.max(0, 100 - (totalTravelTime / Math.max(totalVisitTime, 1) * 50)),
  };
}

function calculateDayCoherence(stops: any[]): number {
  if (stops.length < 2) return 100;
  let coherenceScore = 100;
  const maxAcceptableDistance = 3;
  for (let i = 0; i < stops.length - 1; i++) {
    const distance = stops[i].distanceToNext || 0;
    if (distance > maxAcceptableDistance) {
      coherenceScore -= (distance - maxAcceptableDistance) * 10;
    }
  }
  return Math.max(0, coherenceScore);
}

function calculateItineraryQualityMetrics(itinerary: any[], profile: EnhancedUserProfile) {
  const totalSpecificity =
    itinerary.reduce((sum, s) => sum + (s.specificityScore || 0), 0) / Math.max(itinerary.length, 1);

  let geographicalCoherence = 100;
  const dayGroups = new Map<number, any[]>();
  itinerary.forEach((s) => {
    if (!dayGroups.has(s.day)) dayGroups.set(s.day, []);
    dayGroups.get(s.day)!.push(s);
  });
  for (const [, stops] of dayGroups.entries()) {
    const dayCoherence = calculateDayCoherence(stops);
    geographicalCoherence = Math.min(geographicalCoherence, dayCoherence);
  }

  const uniqueMunicipalities = new Set(itinerary.map((s) => s.municipality)).size;
  const municipalityDiversity = Math.min(100, (uniqueMunicipalities / Math.min(profile.days, 3)) * 100);

  return {
    specificityScore: Math.round(totalSpecificity),
    geographicalCoherence: Math.round(geographicalCoherence),
    municipalityDiversity: Math.round(municipalityDiversity),
    overallQuality: Math.round((totalSpecificity + geographicalCoherence + municipalityDiversity) / 3),
  };
}

function generateUltraPersonalizedInsights(itinerary: any[], profile: EnhancedUserProfile, metrics: any) {
  const insights: any[] = [];
  if (metrics.specificityScore > 80) {
    insights.push({
      type: "success",
      title: "Itinerario Ultra-Personalizado",
      description: `Hemos seleccionado destinos con ${metrics.specificityScore}% de afinidad a tus intereses.`,
    });
  }
  if (metrics.geographicalCoherence > 85) {
    insights.push({
      type: "success",
      title: "Excelente Coherencia Geográfica",
      description: "Distancias cortas entre destinos - experiencia relajada y eficiente.",
    });
  }
  const municipalities = new Set(itinerary.map((s) => s.municipality));
  if (municipalities.size > 1) {
    insights.push({
      type: "info",
      title: `Explorando ${municipalities.size} Municipios`,
      description: `Un municipio por día para máxima inmersión: ${Array.from(municipalities).join(', ')}`,
    });
  }
  if (profile.culturalDepth === 'immersive') {
    const culturalStops = itinerary.filter((s) =>
      (s.categories || []).some((c: string) => ['cultura', 'museo', 'historia'].includes(c))
    );
    if (culturalStops.length >= 2) {
      insights.push({
        type: "tip",
        title: "Experiencia Cultural Inmersiva",
        description: `${culturalStops.length} destinos culturales con tiempo extendido para exploración profunda.`,
      });
    }
  }
  if (profile.crowdTolerance === 'avoid') {
    const crowded = itinerary.filter((s) => s.crowdLevel === 'high');
    if (crowded.length === 0) {
      insights.push({
        type: "success",
        title: "Destinos Tranquilos Priorizados",
        description: "Evitamos lugares muy concurridos según tu preferencia.",
      });
    }
  }
  return insights;
}

/* ──────────────────────────────────────────────────────────────────────────
   Enriquecimiento con Google Places
   ────────────────────────────────────────────────────────────────────────── */
async function enrichWithSpecificPlaces(destinations: any[], profile: EnhancedUserProfile) {
  if (!GOOGLE_PLACES_KEY) return destinations;
  const interests = normalizeInterests(profile.interests || []);
  const enriched: any[] = [];

  for (const dest of destinations) {
    try {
      const specificQuery = `${dest.name} ${interests.join(' ')} ${dest.municipality} Atlántico Colombia`;
      const searchUrl =
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?` +
        `input=${encodeURIComponent(specificQuery)}` +
        `&inputtype=textquery` +
        `&fields=place_id,formatted_address,rating,opening_hours,photos,geometry,types,price_level` +
        `&language=es&key=${GOOGLE_PLACES_KEY}`;

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.candidates?.[0]) {
        const place = searchData.candidates[0];
        let photoUrl = dest.imageUrl;
        if (place.photos?.[0]) {
          photoUrl =
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800` +
            `&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_KEY}`;
        }
        enriched.push({
          ...dest,
          googlePlaceId: place.place_id,
          rating: place.rating || dest.rating || 4.0,
          coordinates: place.geometry?.location || dest.coordinates,
          imageUrl: photoUrl,
          openingHours: place.opening_hours,
          formattedAddress: place.formatted_address || dest.address,
          types: place.types || [],
          priceLevel: place.price_level,
          enhancedSpecificity: true,
        });
      } else {
        enriched.push(dest);
      }
    } catch (error) {
      console.error("Error enriching specific place:", dest.name, error);
      enriched.push(dest);
    }
    // Respetar límites
    await new Promise((r) => setTimeout(r, 150));
  }
  return enriched;
}

/* ──────────────────────────────────────────────────────────────────────────
   Guardado Firestore
   ────────────────────────────────────────────────────────────────────────── */
async function saveUltraSpecificItinerary(itinerary: any[], profile: EnhancedUserProfile, metadata: any) {
  try {
    const projectId = "visitatlantico-f5c09";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/generated_itineraries`;

    const documentData = {
      fields: {
        profile: {
          mapValue: {
            fields: {
              days: { integerValue: profile.days },
              email: { stringValue: profile.email },
              interests: {
                arrayValue: { values: profile.interests.map((i: string) => ({ stringValue: i })) },
              },
              tripType: { stringValue: profile.tripType },
              budget: { stringValue: profile.budget },
              locationRange: { stringValue: profile.locationRange },
              preferredPace: { stringValue: profile.preferredPace },
              culturalDepth: { stringValue: profile.culturalDepth },
              physicalActivity: { stringValue: profile.physicalActivity },
              crowdTolerance: { stringValue: profile.crowdTolerance },
            },
          },
        },
        itinerary: {
          arrayValue: {
            values: itinerary.map((stop) => ({
              mapValue: {
                fields: {
                  id: { stringValue: stop.id || `${stop.name}-${stop.day}` },
                  name: { stringValue: stop.name },
                  day: { integerValue: stop.day },
                  dayTitle: { stringValue: stop.dayTitle || '' },
                  startTime: { stringValue: stop.startTime },
                  endTime: { stringValue: stop.endTime || stop.startTime },
                  lat: { doubleValue: stop.lat || stop.coordinates?.lat || 0 },
                  lng: { doubleValue: stop.lng || stop.coordinates?.lng || 0 },
                  municipality: { stringValue: stop.municipality || 'Barranquilla' },
                  category: { stringValue: stop.category || 'otros' },
                  estimatedCost: { integerValue: stop.estimatedCost || 0 },
                  description: { stringValue: stop.description || '' },
                  durationMinutes: { integerValue: stop.durationMinutes || 90 },
                  specificityScore: { integerValue: stop.specificityScore || 0 },
                  distance: { doubleValue: stop.distance || 0 },
                  travelTime: { integerValue: stop.travelTime || 0 },
                  type: { stringValue: stop.type || 'destination' },
                },
              },
            })),
          },
        },
        metadata: {
          mapValue: {
            fields: {
              dailyThemes: { stringValue: JSON.stringify(metadata.dailyThemes || []) },
              qualityMetrics: { stringValue: JSON.stringify(metadata.qualityMetrics || {}) },
              personalizedInsights: { stringValue: JSON.stringify(metadata.personalizedInsights || []) },
              municipalitiesVisited: {
                arrayValue: {
                  values: (metadata.municipalitiesVisited || []).map((m: string) => ({ stringValue: m })),
                },
              },
              optimizationLevel: { stringValue: metadata.specificityLevel || 'ultra-high' },
              specificityScore: {
                integerValue: (metadata.qualityMetrics && metadata.qualityMetrics.specificityScore) || 0,
              },
              routeAnalysis: { stringValue: JSON.stringify(metadata.routeAnalysis || []) },
              travelInsights: { stringValue: JSON.stringify(metadata.travelInsights || []) },
            },
          },
        },
        createdAt: { timestampValue: new Date().toISOString() },
        status: { stringValue: "ultra-optimized" },
        version: { stringValue: "3.1" },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentData),
    });

    if (response.ok) {
      const result = await response.json();
      return result.name.split('/').pop();
    }
    return `ultra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    console.error("Error saving ultra-specific itinerary:", error);
    return `temp_ultra_${Date.now()}`;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Optimización de rutas por día (Mapbox)
   ────────────────────────────────────────────────────────────────────────── */
function groupItineraryByDay(itinerary: any[]) {
  const m = new Map<number, any[]>();
  for (const s of itinerary) {
    if (!m.has(s.day)) m.set(s.day, []);
    m.get(s.day)!.push(s);
  }
  return m;
}

async function optimizeRouteForDay(dayStops: any[], mapboxToken?: string): Promise<RouteOptimizationResult> {
  if (dayStops.length <= 2) {
    return {
      optimizedStops: dayStops,
      totalDistance: 0,
      totalTravelTime: 0,
      suggestedBreaks: [],
      routeAnalysis: analyzeRoute(dayStops),
    };
  }

  const distanceMatrix = await buildDistanceMatrix(dayStops, mapboxToken);
  const optimizedSequence = findOptimalSequence(dayStops, distanceMatrix);
  const optimizedStops = await recalculateTimings(optimizedSequence, distanceMatrix);
  const suggestedBreaks = suggestBreaks(optimizedStops, distanceMatrix);
  const totalDistance = calculateTotalDistance(optimizedStops, distanceMatrix);
  const totalTravelTime = calculateTotalTravelTime(optimizedStops, distanceMatrix);

  return {
    optimizedStops,
    totalDistance,
    totalTravelTime,
    suggestedBreaks,
    routeAnalysis: analyzeRoute(optimizedStops),
  };
}

async function buildDistanceMatrix(stops: any[], mapboxToken?: string) {
  const matrix: number[][] = [];
  for (let i = 0; i < stops.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < stops.length; j++) {
      if (i === j) matrix[i][j] = 0;
      else {
        const route = await getActualRoute(
          { lat: stops[i].lat, lng: stops[i].lng },
          { lat: stops[j].lat, lng: stops[j].lng },
          mapboxToken
        );
        matrix[i][j] = route.distance;
      }
    }
  }
  return matrix;
}

async function getActualRoute(origin: any, destination: any, mapboxToken?: string) {
  if (!mapboxToken) return estimateRoute(origin, destination);
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${mapboxToken}&geometries=geojson&overview=full`
    );
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance / 1000,
        duration: route.duration / 60,
        geometry: route.geometry,
      };
    }
  } catch (error) {
    console.warn('Mapbox Directions API error, using fallback:', error);
  }
  return estimateRoute(origin, destination);
}

function estimateRoute(origin: any, destination: any) {
  const distance = calculateHaversineDistance(origin, destination);
  const speed = 25; // km/h ciudad
  const duration = Math.max((distance / speed) * 60, 5);
  return { distance, duration, geometry: null };
}

function findOptimalSequence(stops: any[], distanceMatrix: number[][]) {
  const visited = new Set<number>();
  const route: any[] = [];
  let currentIndex = 0;
  route.push(stops[currentIndex]);
  visited.add(currentIndex);

  while (visited.size < stops.length) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    for (let i = 0; i < stops.length; i++) {
      if (!visited.has(i) && distanceMatrix[currentIndex][i] < nearestDistance) {
        nearestDistance = distanceMatrix[currentIndex][i];
        nearestIndex = i;
      }
    }
    if (nearestIndex !== -1) {
      route.push(stops[nearestIndex]);
      visited.add(nearestIndex);
      currentIndex = nearestIndex;
    }
  }
  return route;
}

async function recalculateTimings(stops: any[], distanceMatrix: number[][]) {
  const optimized = [...stops];
  let currentTime = parseTime(stops[0].startTime || "09:00");
  for (let i = 0; i < optimized.length; i++) {
    if (i > 0) {
      const travelTimeMinutes = Math.max(15, (distanceMatrix[i - 1][i] / 25) * 60);
      currentTime += travelTimeMinutes;
    }
    optimized[i].startTime = formatTime(currentTime);
    currentTime += optimized[i].durationMinutes || 90;
    optimized[i].endTime = formatTime(currentTime);
    currentTime += 10; // buffer
  }
  return optimized;
}

function suggestBreaks(stops: any[], distanceMatrix: number[][]): BreakSuggestion[] {
  const breaks: BreakSuggestion[] = [];
  let cumulativeTime = 0;
  let lastMealTime = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    cumulativeTime += stops[i].durationMinutes || 90;

    if (cumulativeTime - lastMealTime >= 240) {
      const mealBreak = findNearbyRestaurant(stops[i], stops[i + 1]);
      if (mealBreak) {
        breaks.push({
          ...(mealBreak as any),
          type: 'meal',
          insertAfterStopId: stops[i].id,
          estimatedDuration: 60,
        });
        lastMealTime = cumulativeTime;
      }
    }

    const distance = distanceMatrix[i][i + 1];
    if (distance > 10) {
      breaks.push({
        id: `rest_${i}`,
        type: 'rest',
        name: 'Parada de descanso recomendada',
        description: 'Punto intermedio para descansar durante el trayecto largo',
        insertAfterStopId: stops[i].id,
        estimatedDuration: 15,
        lat: (stops[i].lat + stops[i + 1].lat) / 2,
        lng: (stops[i].lng + stops[i + 1].lng) / 2,
        category: 'descanso',
      });
    }
  }
  return breaks;
}

function findNearbyRestaurant(currentStop: any, nextStop: any): Partial<BreakSuggestion> | null {
  const restaurants = [
    {
      id: 'rest_malecon',
      name: 'Restaurante Malecón',
      description: 'Gastronomía caribeña con vista al río',
      lat: 10.9878,
      lng: -74.7889,
      category: 'gastronomia',
    },
    {
      id: 'rest_centro',
      name: 'La Casa del Marisco',
      description: 'Especialidad en mariscos frescos',
      lat: 10.9838,
      lng: -74.7881,
      category: 'gastronomia',
    },
  ];

  const midpoint = { lat: (currentStop.lat + nextStop.lat) / 2, lng: (currentStop.lng + nextStop.lng) / 2 };
  let closest: any = null;
  let minD = Infinity;

  for (const r of restaurants) {
    const d = calculateHaversineDistance(midpoint, r);
    if (d < minD && d < 5) {
      minD = d;
      closest = r;
    }
  }
  return closest;
}

function analyzeRoute(stops: any[]): RouteAnalysis {
  const totalDistance = stops.reduce((sum, stop, idx) => {
    if (idx === 0) return sum;
    return sum + calculateHaversineDistance(
      { lat: stops[idx - 1].lat, lng: stops[idx - 1].lng },
      { lat: stop.lat, lng: stop.lng }
    );
  }, 0);

  const isWalking = totalDistance < 3;
  const isDriving = totalDistance > 15;
  return {
    efficiency: Math.min(100, Math.max(0, 100 - totalDistance * 2)),
    walkingIntensive: isWalking,
    drivingRequired: isDriving,
    publicTransportRecommended: !isWalking && !isDriving,
    peakTrafficWarnings: generateTrafficWarnings(stops),
    accessibilityNotes: generateAccessibilityNotes(stops),
  };
}

function generateTrafficWarnings(stops: any[]): string[] {
  const warnings: string[] = [];
  for (const s of stops) {
    const hour = parseTime(s.startTime || "09:00") / 60;
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      warnings.push(`Tráfico pesado esperado alrededor de las ${s.startTime} cerca de ${s.name}`);
    }
  }
  return warnings;
}

function generateAccessibilityNotes(stops: any[]): string[] {
  const notes: string[] = [];
  const data: Record<string, string> = {
    museo: 'La mayoría de museos cuentan con acceso para sillas de ruedas',
    playa: 'Acceso limitado para sillas de ruedas en algunas playas',
    cultura: 'Verificar accesibilidad específica del sitio histórico',
  };
  const categories = new Set(stops.map((s) => (s.category || '').toLowerCase()));
  for (const c of categories) if (data[c]) notes.push(data[c]);
  return notes;
}

function calculateTotalDistance(stops: any[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) total += distanceMatrix[i][i + 1] || 0;
  return total;
}

function calculateTotalTravelTime(stops: any[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) total += Math.max(15, (distanceMatrix[i][i + 1] / 25) * 60);
  return total;
}

async function calculateRealDistances(itinerary: any[], mapboxToken?: string) {
  const updated = [...itinerary];
  for (let i = 1; i < updated.length; i++) {
    const cur = updated[i];
    const prev = updated[i - 1];
    if (cur.day === prev.day) {
      try {
        const route = await getActualRoute({ lat: prev.lat, lng: prev.lng }, { lat: cur.lat, lng: cur.lng }, mapboxToken);
        updated[i].distance = Math.round(route.distance * 10) / 10;
        updated[i].travelTime = Math.round(route.duration);
      } catch (e) {
        console.warn(`Error calculating distance between ${i - 1} and ${i}:`, e);
        updated[i].distance = calculateHaversineDistance({ lat: prev.lat, lng: prev.lng }, { lat: cur.lat, lng: cur.lng });
        updated[i].travelTime = Math.max(5, (updated[i].distance / 25) * 60);
      }
    } else {
      updated[i].distance = 0;
      updated[i].travelTime = 0;
    }
  }
  return updated;
}

function generateTravelInsights(itinerary: any[], routeAnalysis: any[]) {
  const insights: any[] = [];
  const avgEff = routeAnalysis.reduce((sum, d) => sum + (d.efficiency || 0), 0) / Math.max(routeAnalysis.length, 1);

  if (avgEff > 80) {
    insights.push({ type: "success", title: "Ruta Muy Eficiente", description: "Distancias cortas entre destinos." });
  } else if (avgEff < 60) {
    insights.push({ type: "warning", title: "Ruta Dispersa", description: "Considera reagrupar destinos o salir más temprano." });
  }

  const totalDistance = itinerary.reduce((sum, s) => sum + (s.distance || 0), 0);
  if (totalDistance < 10) {
    insights.push({ type: "info", title: "Perfecto para Caminar", description: "La mayoría de destinos están cerca." });
  } else if (totalDistance > 50) {
    insights.push({ type: "warning", title: "Transporte Necesario", description: "Planifica vehículo o tour guiado." });
  }

  const busyDays = routeAnalysis.filter((d) => (d.totalTravelTime || 0) > 120);
  if (busyDays.length > 0) {
    insights.push({
      type: "tip",
      title: "Días Intensivos Detectados",
      description: `Días ${busyDays.map((d: any) => d.day).join(', ')} con bastante desplazamiento.`,
    });
  }

  const walkingDays = routeAnalysis.filter((d) => d.walkingIntensive);
  if (walkingDays.length > 0) {
    insights.push({ type: "tip", title: "Zapatos Cómodos", description: "Varios destinos requieren caminar." });
  }
  return insights;
}

/* ──────────────────────────────────────────────────────────────────────────
   Utilidades generales
   ────────────────────────────────────────────────────────────────────────── */
function calculateHaversineDistance(p1: any, p2: any): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
/** Wrapper para el nombre utilizado en el resto del código ultra-específico */
function calculateDistance(p1: any, p2: any): number {
  return calculateHaversineDistance(p1, p2);
}
function parseTime(t: string): number {
  const [h, m] = (t || "09:00").split(':').map(Number);
  return h * 60 + (m || 0);
}
function formatTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
