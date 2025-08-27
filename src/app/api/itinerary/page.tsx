"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import LZString from "lz-string";

export default function ItinerarySharePage() {
  const params = useSearchParams();
  const decoded = useMemo(() => {
    try {
      const d = params.get("d");
      if (!d) return null;
      const raw = LZString.decompressFromEncodedURIComponent(d);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [params]);

  if (!decoded) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">Enlace inválido</h1>
        <p className="text-gray-600">No fue posible cargar el itinerario.</p>
      </main>
    );
  }

  const { itinerary = [], days } = decoded;
  const daysLabel = days === 0 ? "Modo exploración" : `${days || 1} día${(days || 1) > 1 ? "s" : ""}`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Tu itinerario</h1>
      <p className="text-gray-600 mb-6">
        Duración: {daysLabel} • Lugares: {itinerary.length}
      </p>

      <div className="space-y-4">
        {itinerary.map((s: any, i: number) => (
          <div key={s.id || i} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-red-600 text-white text-sm font-semibold">
                {i + 1}
              </span>
              <h2 className="font-semibold">{s.name}</h2>
            </div>
            {s.imageUrl && (
              // Usa <img> para evitar restricciones si no configuraste next/image
              <img
                src={s.imageUrl}
                alt={s.name}
                className="w-full rounded-lg border border-gray-200 mb-2"
                loading="lazy"
              />
            )}
            {s.description && <p className="text-sm text-gray-700">{s.description}</p>}
            <p className="text-xs text-gray-500 mt-2">
              {s.municipality || "Ubicación"} · Sugerido: {s.durationMinutes || 60} min
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
