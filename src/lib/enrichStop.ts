// File: src/lib/enrichStop.ts
// Helper para enriquecer paradas del itinerario con datos reales

import type { Stop } from "@/types/itinerary";
import { findOnePlace } from "@/lib/placesService";

// Merge seguro: sólo escribe si el valor destino es falsy o ausente
function coalesce<T>(a: T | undefined, b: T | undefined): T | undefined {
  return a != null && a !== ("" as any) ? a : b;
}

// Convierte opening_hours normalizado a tip legible
function openingHoursToTip(opening?: Record<string, [string, string][]>): string | undefined {
  if (!opening) return undefined;
  const days: { k: string; l: string }[] = [
    { k: "mon", l: "Lun" },
    { k: "tue", l: "Mar" },
    { k: "wed", l: "Mié" },
    { k: "thu", l: "Jue" },
    { k: "fri", l: "Vie" },
    { k: "sat", l: "Sáb" },
    { k: "sun", l: "Dom" },
  ];
  const parts: string[] = [];
  for (const d of days) {
    const segs = opening[d.k];
    if (!segs || !segs.length) continue;
    const windows = segs.map(([o, c]) => `${o}–${c}`).join(", ");
    parts.push(`${d.l}: ${windows}`);
  }
  if (!parts.length) return undefined;
  return `Horarios: ${parts.join(" · ")}`;
}

export async function enrichStop(stop: Stop): Promise<Stop> {
  // Construir query lo más específica posible
  const qParts = [stop.name, stop.municipality || "Atlántico"];
  if (stop.category) qParts.push(stop.category);
  const query = qParts.filter(Boolean).join(" ");

  try {
    const place = await findOnePlace(query);
    if (!place) return stop;

    const tipFromHours = openingHoursToTip(place.opening_hours);

    return {
      ...stop,
      lat: isNaN(Number(stop.lat)) ? Number(place.lat) : stop.lat,
      lng: isNaN(Number(stop.lng)) ? Number(place.lng) : stop.lng,
      imageUrl: coalesce(stop.imageUrl, place.photo),
      rating: coalesce(stop.rating, place.rating),
      priceLevel: coalesce((stop as any).priceLevel, place.price_level),
      address: coalesce(stop.address as any, place.address),
      website: coalesce(stop.website as any, place.website),
      phone: coalesce((stop as any).phone, place.phone),
      tip: coalesce(stop.tip, tipFromHours),
      // tags: mantén, o agrega fuente
      tags: Array.from(new Set([...(stop.tags || []), place.source])),
    } as Stop;
  } catch (e) {
    return stop; // fail-open
  }
}

export async function enrichItinerary(stops: Stop[]): Promise<Stop[]> {
  const out: Stop[] = [];
  for (const s of stops) {
    out.push(await enrichStop(s));
  }
  return out;
}
