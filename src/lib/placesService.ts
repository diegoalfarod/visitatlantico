import { dbAdmin } from "@/lib/firebaseAdmin";
import type { Place } from "@/types/geminiChat";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PHOTO_API =
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=700&photo_reference=";

/* ---------- helpers ---------- */
const fetchPhotoUrl = async (ref: string): Promise<string | null> => {
  try {
    // Pedimos sólo HEAD para capturar la redirección (no descargamos la imagen)
    const resp = await fetch(`${PHOTO_API}${ref}&key=${GOOGLE_KEY}`, {
      method: "HEAD",
      redirect: "manual",
    });
    return resp.status === 302 ? resp.headers.get("location") : null;
  } catch {
    return null;
  }
};

const docToPlace = (d: any): Place => ({
  id: d.id,
  name: d.name,
  address: d.address ?? "",
  rating: d.rating ?? 0,
  price_level: d.price_level ?? 0,
  description: d.description ?? "",
  local_tip: d.local_tip ?? "",
  category: d.category ?? "Attraction",
  photo: d.imagePath ?? d.photo ?? d.image ?? undefined,
});

const apiToPlace = async (r: any): Promise<Place> => {
  let photo: string | undefined;

  if (r.photos?.[0]) {
    const ref = r.photos[0].photo_reference;
    // 1º intento: URL definitiva (lh3.googleusercontent.com/…)
    photo = (await fetchPhotoUrl(ref)) ?? undefined;
    // 2º intento (fallback): URL original con la KEY (el navegador seguirá la redirección)
    if (!photo) photo = `${PHOTO_API}${ref}&key=${GOOGLE_KEY}`;
  }

  return {
    id: r.place_id,
    name: r.name,
    address: r.formatted_address,
    rating: r.rating ?? 0,
    price_level: r.price_level ?? 0,
    description: r.types?.join(", ") ?? "",
    local_tip: "",
    category: mapType(r.types?.[0]),
    photo,
  };
};

const mapType = (t: string | undefined): Place["category"] => {
  if (!t) return "Attraction";
  if (t.includes("restaurant")) return "Restaurant";
  if (t.includes("lodging") || t.includes("hotel")) return "Hotel";
  if (t.includes("bar") || t.includes("night_club")) return "Nightlife";
  if (t.includes("beach")) return "Beach";
  return "Attraction";
};

/* ---------- búsqueda híbrida ---------- */
export async function findPlaces(
  query: string,
  limit = 6
): Promise<Place[]> {
  const results: Place[] = [];

  try {
    // 1) Firebase: destinations
    const destSnap = await dbAdmin
      .collection("destinations")
      .where("keywords", "array-contains", query.toLowerCase())
      .limit(limit)
      .get();
    destSnap.forEach((d) =>
      results.push(docToPlace({ ...d.data(), id: d.id }))
    );

    // 2) Firebase: festivales
    if (results.length < limit) {
      const festSnap = await dbAdmin
        .collection("festivales")
        .where("keywords", "array-contains", query.toLowerCase())
        .limit(limit - results.length)
        .get();
      festSnap.forEach((d) =>
        results.push(docToPlace({ ...d.data(), id: d.id }))
      );
    }

    if (results.length >= limit) return results.slice(0, limit);

    // 3) Google Places
    const url =
      "https://maps.googleapis.com/maps/api/place/textsearch/json?" +
      new URLSearchParams({
        query: `${query} Atlántico Colombia`,
        language: "es",
        region: "co",
        key: GOOGLE_KEY,
      });

    const resp = await fetch(url);
    const data = await resp.json();

    if (data.results?.length) {
      for (const r of data.results.slice(0, limit - results.length)) {
        results.push(await apiToPlace(r));
      }
    }
  } catch (err) {
    console.error("Error en findPlaces:", err);
  }

  return results;
}
