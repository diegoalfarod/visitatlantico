// File: src/lib/placesService.ts
// Enriquecimiento de lugares con múltiples proveedores (Google Places ▸ Fallbacks)
// - findPlaces(query, limit) devuelve lugares normalizados con foto, rating, horarios, etc.
// - Compatible con tu uso actual en route.ts
//
// Requiere (al menos uno):
//  - GOOGLE_PLACES_API_KEY (recomendado)
//  - MAPBOX_TOKEN (fallback básico)
//  - FOURSQUARE_API_KEY (opcional)

export interface NormalizedPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  photo?: string; // URL directa
  rating?: number; // 0-5
  price_level?: number; // 0-4 (Google)
  website?: string;
  phone?: string;
  opening_hours?: Record<string, [string, string][]>; // { mon: [["09:00","18:00"]] }
  source: "google" | "mapbox" | "foursquare";
}

const GP_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY; // soporta ambos nombres
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const FOURSQUARE_KEY = process.env.FOURSQUARE_API_KEY;

// ───────────────────── Utilidades ─────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// LRU/TTL simple en memoria (runtime server) — suficiente para aliviar cuotas
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12h
const cache = new Map<string, { t: number; v: NormalizedPlace[] }>();

function setCache(key: string, v: NormalizedPlace[]) {
  cache.set(key, { t: Date.now(), v });
}
function getCache(key: string): NormalizedPlace[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.v;
}

function toHHMM(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Convierte "Monday"/0..6 a claves mon..sun
const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function normalizeOpeningHoursGoogle(periods: any[]): Record<string, [string, string][]> | undefined {
  if (!Array.isArray(periods)) return undefined;
  const result: Record<string, [string, string][]> = {};
  for (const p of periods) {
    const open = p.open?.time; // "0900"
    const close = p.close?.time; // "1800"
    const day = p.open?.day; // 0..6 (0 = Domingo)
    if (day == null || !open || !close) continue;
    const key = DOW_KEYS[day];
    const toFmt = (s: string) => `${s.slice(0, 2)}:${s.slice(2, 4)}`;
    (result[key] ||= []).push([toFmt(open), toFmt(close)]);
  }
  return result;
}

// ───────────────────── Google Places ─────────────────────
async function googleTextSearch(query: string, limit = 5): Promise<any[]> {
  if (!GP_KEY) return [];
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("language", "es");
  url.searchParams.set("region", "co");
  url.searchParams.set("key", GP_KEY);
  const res = await fetch(url.toString());
  const j = await res.json();
  if (j.status === "OVER_QUERY_LIMIT") await sleep(400);
  return (j.results || []).slice(0, limit);
}

async function googlePlaceDetails(place_id: string): Promise<any | null> {
  if (!GP_KEY) return null;
  const fields = [
    "name,formatted_address,geometry,opening_hours,website,formatted_phone_number,international_phone_number,price_level,rating,photos,place_id",
  ].join("%"); // cualquier separador; Google ignora espacios extra

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", place_id);
  url.searchParams.set("fields", "name,formatted_address,geometry,opening_hours,website,formatted_phone_number,international_phone_number,price_level,rating,photos,place_id");
  url.searchParams.set("language", "es");
  url.searchParams.set("key", GP_KEY);
  const res = await fetch(url.toString());
  const j = await res.json();
  if (j.status !== "OK") return null;
  return j.result;
}

function googlePhotoUrl(photoRef: string, maxwidth = 1200) {
  if (!GP_KEY || !photoRef) return undefined;
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("maxwidth", String(maxwidth));
  url.searchParams.set("photoreference", photoRef);
  url.searchParams.set("key", GP_KEY);
  return url.toString();
}

async function googleFind(query: string, limit = 5): Promise<NormalizedPlace[]> {
  const hits = await googleTextSearch(query, limit);
  const out: NormalizedPlace[] = [];
  for (const h of hits) {
    const details = await googlePlaceDetails(h.place_id);
    if (!details) continue;
    const photoRef = details.photos?.[0]?.photo_reference;
    out.push({
      id: details.place_id,
      name: details.name,
      lat: details.geometry?.location?.lat ?? h.geometry?.location?.lat,
      lng: details.geometry?.location?.lng ?? h.geometry?.location?.lng,
      address: details.formatted_address,
      photo: photoRef ? googlePhotoUrl(photoRef, 1200) : undefined,
      rating: details.rating,
      price_level: details.price_level,
      website: details.website,
      phone: details.international_phone_number || details.formatted_phone_number,
      opening_hours: normalizeOpeningHoursGoogle(details.opening_hours?.periods || []),
      source: "google",
    });
  }
  return out;
}

// ───────────────────── Mapbox (fallback liviano) ─────────────────────
async function mapboxGeocode(query: string, limit = 5): Promise<NormalizedPlace[]> {
  if (!MAPBOX_TOKEN) return [];
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("language", "es");
  url.searchParams.set("country", "CO");
  url.searchParams.set("limit", String(limit));
  // BBox Atlántico aprox
  url.searchParams.set("bbox", "-75.3,10.3,-74.2,11.3");
  const res = await fetch(url.toString());
  const j = await res.json();
  const feats = j.features || [];
  return feats.map((f: any) => ({
    id: f.id,
    name: f.text || f.place_name,
    lat: f.center?.[1],
    lng: f.center?.[0],
    address: f.place_name,
    source: "mapbox" as const,
  }));
}

// ───────────────────── Foursquare (opcional) ─────────────────────
async function foursquareSearch(query: string, limit = 5): Promise<NormalizedPlace[]> {
  if (!FOURSQUARE_KEY) return [];
  const url = new URL("https://api.foursquare.com/v3/places/search");
  url.searchParams.set("query", query);
  url.searchParams.set("near", "Barranquilla, CO");
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { headers: { Authorization: FOURSQUARE_KEY } });
  const j = await res.json();
  const items = j.results || [];
  return items.map((it: any) => ({
    id: it.fsq_id,
    name: it.name,
    lat: it.geocodes?.main?.latitude,
    lng: it.geocodes?.main?.longitude,
    address: it.location?.formatted_address,
    rating: it.rating, // no siempre presente
    source: "foursquare" as const,
  }));
}

// ───────────────────── API principal ─────────────────────
export async function findPlaces(query: string, limit = 5): Promise<NormalizedPlace[]> {
  const key = `q:${query.toLowerCase()}|l:${limit}`;
  const cached = getCache(key);
  if (cached) return cached;

  let results: NormalizedPlace[] = [];

  // Preferencia: Google ▸ Foursquare ▸ Mapbox
  if (GP_KEY) {
    try { results = await googleFind(query, limit); } catch {}
  }
  if (!results.length && FOURSQUARE_KEY) {
    try { results = await foursquareSearch(query, limit); } catch {}
  }
  if (!results.length && MAPBOX_TOKEN) {
    try { results = await mapboxGeocode(query, limit); } catch {}
  }

  setCache(key, results);
  return results;
}

export async function findOnePlace(query: string): Promise<NormalizedPlace | null> {
  const list = await findPlaces(query, 1);
  return list[0] || null;
}
