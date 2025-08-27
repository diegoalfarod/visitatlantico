//fullitineraryView.tsx

"use client";

import React, { useMemo } from "react";
import ItineraryMap from "@/components/ItineraryMap";
import MultiDayItinerary from "@/components/MultiDayItinerary";
import type { Stop } from "@/types/itinerary";
import {
  ArrowLeft,
  Save as SaveIcon,
  CalendarDays,
  Clock,
  MapPin,
  Route,
  Sparkles,
  Info,
} from "lucide-react";

/**
 * FullItineraryView
 * Vista de "detalle completo" para el planner.
 * Muestra mapa + timeline multi‑día, con resumen y acciones.
 */
export default function FullItineraryView({
  itinerary,
  onUpdate,
  answers,
  locationData,
  onBack,
  onSave,
  readOnly = false,
}: {
  itinerary: Stop[];
  onUpdate: (s: Stop[]) => void;
  answers: any;
  locationData: { lat: number; lng: number } | null;
  onBack: () => void;
  onSave: () => void;
  readOnly?: boolean;
}) {
  // Normalizar días (0 = exploración => 1 día para UI)
  const days = Math.max(1, Number(answers?.days ?? 1));

  // Métricas del viaje
  const metrics = useMemo(() => {
    const totalMinutes = (itinerary ?? []).reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemain = totalMinutes % 60;
    const totalStops = itinerary?.length || 0;
    const totalDistanceKm = (itinerary ?? []).reduce(
      (sum, s) => sum + (Number(s.distance) || 0),
      0
    );
    const municipalities = new Set((itinerary ?? []).map((s) => s.municipality || ""));
    const categories = new Set((itinerary ?? []).map((s) => s.category || "General"));

    return {
      totalStops,
      totalMinutes,
      totalHours,
      totalRemain,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      municipalities: municipalities.size,
      categories: categories.size,
    };
  }, [itinerary]);

  // Adaptar paradas para el mapa (tipos que el mapa entiende)
  const mapStops = useMemo(() => {
    return (itinerary ?? []).map((s, idx) => ({
      id: s.id || `stop-${idx + 1}`,
      name: s.name,
      lat: Number(s.lat),
      lng: Number(s.lng),
      startTime: s.startTime || "",
      durationMinutes: s.durationMinutes || 60,
      description: s.description || "",
      type: s.type === "experience" ? "experience" : "destination",
    }));
  }, [itinerary]);

  const userLoc = locationData
    ? { lat: Number(locationData.lat), lng: Number(locationData.lng) }
    : null;

  // Empty state (por si algo falló y llegó vacío)
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <Header onBack={onBack} onSave={onSave} disableSave title="Itinerario vacío" />
        <div className="flex-1 grid place-items-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aún no hay paradas</h3>
            <p className="text-sm text-gray-600">
              Genera un itinerario con IA o agrega actividades para ver el mapa y el timeline.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header sticky */}
      <Header onBack={onBack} onSave={onSave} title="Itinerario completo" />

      {/* Resumen principal */}
      <section className="px-3 sm:px-4 pt-3">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold">Resumen del viaje</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MetricCard icon={<CalendarDays className="w-5 h-5" />} label="Días" value={answers?.days === 0 ? "Explorar" : String(days)} />
            <MetricCard icon={<MapPin className="w-5 h-5" />} label="Lugares" value={String(metrics.totalStops)} />
            <MetricCard icon={<Clock className="w-5 h-5" />} label="Duración" value={`${metrics.totalHours}h${metrics.totalRemain ? ` ${metrics.totalRemain}m` : ""}`} />
            <MetricCard icon={<Route className="w-5 h-5" />} label="Distancia" value={`${metrics.totalDistanceKm} km`} />
            <MetricCard icon={<Info className="w-5 h-5" />} label="Cobertura" value={`${metrics.municipalities} muni.`} />
          </div>
          <p className="mt-3 text-xs text-red-100">
            Horarios y tiempos sujetos a disponibilidad. Puedes reorganizar libremente en el timeline.
          </p>
        </div>
      </section>

      {/* Contenido: mapa + timeline */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 min-h-0">
        {/* Mapa */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white min-h-[40vh] lg:min-h-0">
          <div className="h-[40vh] lg:h-full">
            <ItineraryMap stops={mapStops} userLocation={userLoc} />
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden flex flex-col min-h-0">
          <div className="px-3 sm:px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Tu itinerario por días</span>
            </div>
            {!readOnly && (
              <span className="text-xs text-gray-500">Arrastra actividades para personalizar</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <MultiDayItinerary
              itinerary={itinerary}
              onItineraryUpdate={onUpdate}
              days={days}
              userLocation={userLoc}
              readOnly={readOnly}
            />
          </div>
        </div>
      </section>

      {/* Pie con tips (opcional) */}
      {!readOnly && (
        <section className="px-3 sm:px-4 pb-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-amber-900 mb-1">💡 Sugerencia</h4>
            <p className="text-sm text-amber-800">
              Si un lugar tiene horario de apertura/cierre, el planner intentará respetarlo. Aún así, verifica disponibilidad o
              reserva si aplica.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------ Sub‑componentes ------------------------------ */

function Header({
  onBack,
  onSave,
  title,
  disableSave = false,
}: {
  onBack: () => void;
  onSave: () => void;
  title: string;
  disableSave?: boolean;
}) {
  return (
    <div className="sticky top-0 z-[1] bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Volver</span>
          </button>
          <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={disableSave}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl p-3 sm:p-4 text-white/95 border border-white/10">
      <div className="flex items-center gap-2 opacity-90 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-lg sm:text-xl font-bold leading-none">{value}</div>
    </div>
  );
}
