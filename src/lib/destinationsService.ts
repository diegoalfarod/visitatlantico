// src/lib/destinationsService.ts
// Compat + Personalización (compila sin Firebase Admin)

// ---------- Tipos ----------
export type Category =
  | "playa" | "cultura" | "gastronomía" | "naturaleza" | "historia"
  | "nightlife" | "aventura" | "shopping" | "otros";

export interface FirebaseDestination {
  id: string;
  name: string;
  description: string;
  categories: string[];
  municipality?: string;
  address?: string;
  rating?: number;
  cost?: string | number;
  website?: string;
  phone?: string;
  openingTime?: string;
  imageUrl?: string;
  imagePath?: string;
  imagePaths?: string[];
  coordinates?: { lat: number; lng: number };
  meta?: { popularity?: number; freshScore?: number };
}

export interface UserLocation { lat: number; lng: number; }

export interface UserPreferences {
  categoryWeights?: Partial<Record<Category, number>>;
  mustHaveCategories?: Category[];
  avoidCategories?: Category[];
  maxDistanceKm?: number;
  dayStart?: string;   // "09:00"
  dayEnd?: string;     // "18:30"
  defaultDurationMin?: number;
  maxStopsPerDay?: number;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  startTime: string;
  durationMinutes: number;
  description: string;
  category: string;
  categories?: string[];
  distance: number;
  municipality: string;
  tip?: string;
  imageUrl?: string;
  imagePaths?: string[];
  type: "destination" | "experience";
  rating?: number;
  cost?: string | number;
  amenities?: string[];
  address?: string;
  website?: string;
  phone?: string;
  openingTime?: string;
  enrichedFromFirebase?: boolean;
  tagline?: string;
}

export interface BuildParams {
  allDestinations: FirebaseDestination[];
  userLocation: UserLocation;
  days: number;
  prefs?: UserPreferences;
}

// ---------- Utils ----------
const deg2rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const toMin = (hhmm: string) => {
  const [h, m] = (hhmm || "09:00").split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = Math.max(0, mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const kmBetween = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lng - a.lng);
  const la1 = deg2rad(a.lat);
  const la2 = deg2rad(b.lat);
  const c = 2 * Math.asin(
    Math.sqrt(
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2
    )
  );
  return R * c;
};

const normalizeCategory = (c: string): Category => {
  const s = (c || "").trim().toLowerCase();
  if (["playa", "beach"].includes(s)) return "playa";
  if (["cultura", "cultural", "museo", "arte"].includes(s)) return "cultura";
  if (["gastronomia", "gastronomía", "comida", "restaurante", "food"].includes(s)) return "gastronomía";
  if (["naturaleza", "nature", "parque"].includes(s)) return "naturaleza";
  if (["historia", "histórico"].includes(s)) return "historia";
  if (["nightlife", "rumba", "bar"].includes(s)) return "nightlife";
  if (["aventura", "deporte", "watersport"].includes(s)) return "aventura";
  if (["shopping", "compras"].includes(s)) return "shopping";
  return "otros";
};

const pickPrimaryCategory = (cats: string[]): string => {
  if (!cats || cats.length === 0) return "otros";
  const normalized = cats.map(normalizeCategory);
  const order: Category[] = [
    "playa","gastronomía","cultura","naturaleza","historia","aventura","nightlife","shopping","otros",
  ];
  const idx = normalized
    .map(c => order.indexOf(c as Category))
    .reduce((best, cur) => (cur >= 0 && (best < 0 || cur < best) ? cur : best), -1);
  return idx >= 0 ? order[idx] : "otros";
};

// ---------- Compat: Firebase ----------
/**
 * Stub seguro para compilar sin Firebase Admin. Si luego configuras Firebase Admin,
 * reemplaza el contenido de esta función por la lectura real (o haz import dinámico).
 */
export async function getDestinationsFromFirebase(
  municipality?: string,
  category?: string[] | undefined,
  limit = 200
): Promise<FirebaseDestination[]> {
  // ⚠️ Stub: devuelve [] para no romper build si no hay Firebase Admin
  console.warn(
    "[destinationsService] getDestinationsFromFirebase() usando stub (sin Firebase Admin).",
    { municipality, category, limit }
  );
  return [];
}

/** Filtra por radio desde un punto y ordena por cercanía */
export function getNearbyDestinations(
  center: { lat: number; lng: number },
  all: FirebaseDestination[],
  radiusKm = 50
): FirebaseDestination[] {
  const withDist = all
    .filter(d => d.coordinates)
    .map(d => ({ d, dist: kmBetween(center, d.coordinates as { lat:number; lng:number }) }))
    .filter(x => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist);

  return withDist.map(x => x.d);
}

// ---------- Scoring + Personalización ----------
function scoreDestination(
  d: FirebaseDestination,
  prefs: Required<UserPreferences>,
  base: UserLocation
): number {
  if (!d.coordinates) return 0;
  const primary = normalizeCategory(pickPrimaryCategory(d.categories || [])) as Category;
  if (prefs.avoidCategories.includes(primary)) return 0;

  const wCategory = 0.5, wDistance = 0.2, wRating = 0.2, wMeta = 0.1;

  const catWeight = prefs.categoryWeights[primary] ?? 0.3;
  const mustBoost = prefs.mustHaveCategories.length > 0 && prefs.mustHaveCategories.includes(primary) ? 0.25 : 0;
  const categoryScore = clamp01(catWeight + mustBoost);

  const distKm = kmBetween(base, d.coordinates!);
  if (prefs.maxDistanceKm && distKm > prefs.maxDistanceKm) return 0;
  const distNorm = prefs.maxDistanceKm ? 1 - clamp01(distKm / prefs.maxDistanceKm) : 1 / (1 + distKm * 0.15);

  const ratingNorm = d.rating ? clamp01(Number(d.rating) / 5) : 0.6;
  const pop = d.meta?.popularity ?? 0.5;
  const fresh = d.meta?.freshScore ?? 0.5;
  const metaScore = clamp01(0.7 * pop + 0.3 * fresh);

  return clamp01(wCategory*categoryScore + wDistance*distNorm + wRating*ratingNorm + wMeta*metaScore);
}

function bestNextIndex(
  pool: { d: FirebaseDestination; score: number }[],
  currentPoint: UserLocation
): number {
  if (pool.length === 0) return -1;
  let best = -1, bestVal = -Infinity;

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const distKm = item.d.coordinates ? kmBetween(currentPoint, item.d.coordinates!) : 999;
    const proximity = 1 / (1 + distKm * 0.25); // 0–1
    const combo = item.score * 0.7 + proximity * 0.3;
    if (combo > bestVal) { bestVal = combo; best = i; }
  }
  return best;
}

function recalcDayTimings(
  stops: Stop[],
  days: number,
  dayStartMin: number,
  travelBetweenStopsMin: number
): Stop[] {
  if (stops.length === 0) return stops;
  const perDay = Math.ceil(stops.length / days);
  const result: Stop[] = [];
  for (let d = 0; d < days; d++) {
    const slice = stops.slice(d * perDay, (d + 1) * perDay);
    if (!slice.length) continue;
    let t = dayStartMin;
    for (let i = 0; i < slice.length; i++) {
      if (i > 0) t += travelBetweenStopsMin;
      const s = slice[i];
      result.push({ ...s, startTime: toHHMM(t) });
      t += s.durationMinutes;
    }
  }
  return result;
}

// ---------- Builder principal ----------
export function buildPersonalizedItinerary(params: BuildParams): Stop[] {
  const { allDestinations, userLocation, days, prefs = {} } = params;

  const p: Required<UserPreferences> = {
    categoryWeights: {
      playa: 1, gastronomía: 0.8, cultura: 0.7, naturaleza: 0.6,
      historia: 0.5, aventura: 0.6, nightlife: 0.4, shopping: 0.4, otros: 0.3,
      ...(prefs.categoryWeights || {}),
    },
    mustHaveCategories: prefs.mustHaveCategories || [],
    avoidCategories: prefs.avoidCategories || [],
    maxDistanceKm: prefs.maxDistanceKm ?? undefined,
    dayStart: prefs.dayStart || "09:00",
    dayEnd: prefs.dayEnd || "18:30",
    defaultDurationMin: prefs.defaultDurationMin || 60,
    maxStopsPerDay: prefs.maxStopsPerDay || 6,
  };

  const scored = allDestinations
    .filter(d => d.coordinates)
    .map(d => ({ d, score: scoreDestination(d, p, userLocation) }))
    .filter(x => x.score > 0.15)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];

  const dayStartMin = toMin(p.dayStart);
  const dayEndMin = toMin(p.dayEnd);
  const dailyBudget = Math.max(0, dayEndMin - dayStartMin);
  const travelBetweenStopsMin = 30;
  const avgSlot = p.defaultDurationMin + travelBetweenStopsMin;
  const estStopsPerDay = Math.min(p.maxStopsPerDay, Math.max(3, Math.floor(dailyBudget / avgSlot)));

  let pool = [...scored];
  const finalStops: Stop[] = [];

  for (let day = 0; day < days; day++) {
    let currentTime = dayStartMin;
    let currentPoint = userLocation;
    let usedToday = 0;

    while (
      usedToday < estStopsPerDay &&
      currentTime + p.defaultDurationMin <= dayEndMin &&
      pool.length > 0
    ) {
      const pickIdx = bestNextIndex(pool, currentPoint);
      if (pickIdx < 0) break;

      const { d } = pool[pickIdx];
      if (usedToday > 0) currentTime += travelBetweenStopsMin;
      if (currentTime + p.defaultDurationMin > dayEndMin) break;

      const dist = kmBetween(currentPoint, d.coordinates!);

      const newStop: Stop = {
        id: d.id,
        name: d.name,
        lat: d.coordinates!.lat,
        lng: d.coordinates!.lng,
        startTime: toHHMM(currentTime),
        durationMinutes: p.defaultDurationMin,
        description: d.description || "",
        category: pickPrimaryCategory(d.categories || []),
        categories: d.categories || [],
        distance: dist,
        municipality: d.municipality || "Atlántico",
        imageUrl: d.imageUrl || d.imagePath,
        imagePaths: d.imagePaths,
        type: "destination",
        rating: typeof d.rating === "number" ? d.rating : undefined,
        cost: d.cost,
        address: d.address,
        website: d.website,
        phone: d.phone,
        openingTime: d.openingTime,
        enrichedFromFirebase: true,
      };

      finalStops.push(newStop);
      currentTime += p.defaultDurationMin;
      currentPoint = { lat: newStop.lat, lng: newStop.lng };
      usedToday++;
      pool.splice(pickIdx, 1);
    }
  }

  return recalcDayTimings(finalStops, days, dayStartMin, travelBetweenStopsMin);
}
