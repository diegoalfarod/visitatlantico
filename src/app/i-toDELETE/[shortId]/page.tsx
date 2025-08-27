// src/app/i/[shortId]/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function ShortViewPage({ params }: { params: { shortId: string } }) {
  const { shortId } = params;
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/itinerary/${shortId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e:any) {
        setErr(e.message || "Error");
      }
    })();
  }, [shortId]);

  if (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">No disponible</h1>
        <p className="text-gray-600">Error: {err}</p>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600">Cargando…</p>
      </main>
    );
  }

  const { itinerary = [], days = 1 } = data;
  const daysLabel = days === 0 ? "Modo exploración" : `${days} día${days>1?"s":""}`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Tu itinerario</h1>
      <p className="text-gray-600 mb-6">Duración: {daysLabel} • Lugares: {itinerary.length}</p>

      <div className="space-y-4">
        {itinerary.map((s:any, i:number)=>(
          <div key={s.id || i} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-red-600 text-white text-sm font-semibold">{i+1}</span>
              <h2 className="font-semibold">{s.name}</h2>
            </div>
            {s.imageUrl && <img src={s.imageUrl} alt={s.name} className="w-full rounded-lg border border-gray-200 mb-2" loading="lazy" />}
            {s.description && <p className="text-sm text-gray-700">{s.description}</p>}
            <p className="text-xs text-gray-500 mt-2">{s.municipality || "Ubicación"} · Sugerido: {s.durationMinutes || 60} min</p>
          </div>
        ))}
      </div>
    </main>
  );
}
