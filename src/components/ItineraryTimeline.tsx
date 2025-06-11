// File: src/components/ItineraryTimeline.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Stop } from "./ItineraryStopCard";
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calendar,
  Utensils,
  Camera,
  Anchor,
  Music,
  Coffee,
  Landmark,
  Navigation,
  ExternalLink,
} from "lucide-react";

interface Props {
  stops: Stop[];
  globalOffset?: number;
  onMove?: (from: number, to: number) => void;
}

/* ───────── helpers ───────── */
const getCategoryIcon = (c?: string) => {
  if (!c) return <MapPin className="w-4 h-4" />;
  const cat = c.toLowerCase();
  if (cat.match(/gastronomía|restaurante|comida/)) return <Utensils className="w-4 h-4" />;
  if (cat.match(/fotografía|paisaje/)) return <Camera className="w-4 h-4" />;
  if (cat.match(/playa|mar/)) return <Anchor className="w-4 h-4" />;
  if (cat.match(/música|fiesta/)) return <Music className="w-4 h-4" />;
  if (cat.match(/café|descanso/)) return <Coffee className="w-4 h-4" />;
  if (cat.match(/museo|cultura|arte/)) return <Landmark className="w-4 h-4" />;
  return <MapPin className="w-4 h-4" />;
};

// convierte "HH:MM" a minutos
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
// convierte minutos a "HH:MM"
const toHHMM = (min: number) =>
  `${Math.floor(min / 60)
    .toString()
    .padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;

// formato 12 h bonito
const formatTime = (t: string) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
};

/* ───────── componente ───────── */
export default function ItineraryTimeline({ stops, globalOffset = 0, onMove }: Props) {
  /* ▸ 1. COMPLETAR HORARIOS FALTANTES */
  const filledStops = useMemo(() => {
    let current = 9 * 60; // 09:00 default
    return stops.map((s) => {
      let start = s.startTime && /^\d{1,2}:\d{2}$/.test(s.startTime) ? s.startTime : "";
      if (start) current = toMin(start); // usa la hora provista
      else start = toHHMM(current); // calcula
      current += s.durationMinutes || 60; // avanza
      return { ...s, startTime: start };
    });
  }, [stops]);

  /* ▸ 2. UI states */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* filtros */
  const categories = Array.from(new Set(filledStops.map((s) => s.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredStops = activeCategory
    ? filledStops.filter((s) => s.category === activeCategory)
    : filledStops;

  /* resumen */
  const totalMin = filteredStops.reduce((sum, s) => sum + s.durationMinutes, 0);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;

  const startTime =
    filteredStops.length > 0 ? formatTime(filteredStops[0].startTime) : "";
  const endTime =
    filteredStops.length > 0
      ? formatTime(
          toHHMM(toMin(filteredStops[filteredStops.length - 1].startTime) +
            (filteredStops[filteredStops.length - 1].durationMinutes || 0))
        )
      : "";

  /* ▸ 3. Tarjeta interna (sin cambios de lógica) */
  const StopCard = ({
    stop,
    expanded,
    toggleExpand,
    isLast,
    index,
  }: {
    stop: Stop;
    expanded: boolean;
    toggleExpand: () => void;
    isLast: boolean;
    index: number;
  }) => {
    const [photoIndex, setPhotoIndex] = useState(0);
    const photos = stop.photos || (stop.imageUrl ? [stop.imageUrl] : []);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;

    const [{ isDragging }, drag] = useDrag(() => ({
      type: "stop",
      item: { index },
      collect: (m) => ({ isDragging: m.isDragging() }),
    }), [index]);

    const [, drop] = useDrop(
      () => ({
        accept: "stop",
        hover: (item: { index: number }) => {
          if (item.index !== index && onMove) {
            onMove(item.index, index);
            item.index = index;
          }
        },
      }),
      [index, onMove]
    );

    const colors = {
      destination: {
        primary: "bg-blue-600",
        secondary: "bg-blue-500",
        light: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
      },
      experience: {
        primary: "bg-green-600",
        secondary: "bg-green-500",
        light: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
      },
    } as const;

    const c = colors[stop.type];

    return (
      <div ref={(node) => drag(drop(node))} className={`relative ${isDragging ? 'opacity-50' : ''}`}>
        {!isLast && (
          <div className={`absolute left-4 top-12 bottom-0 w-0.5 ${c.secondary}`} />
        )}

        <div className="relative z-10 mb-6">
          {/* hora + duración */}
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 ${c.primary} rounded-full flex items-center justify-center shadow-md`}>
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className={`${c.text} font-semibold ml-3`}>
              {formatTime(stop.startTime)}
            </div>
            <div className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
              {stop.durationMinutes} min
            </div>
          </div>

          {/* tarjeta cabecera */}
          <div className={`ml-10 rounded-xl shadow-md border ${c.border} bg-white`}>
            <div className="flex items-center cursor-pointer" onClick={toggleExpand}>
              {!expanded && stop.imageUrl && (
                <div
                  className="w-20 h-20 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${stop.imageUrl})` }}
                />
              )}
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-800 pr-2 line-clamp-2">
                    {stop.name}
                  </h3>
                  {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* meta */}
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  {stop.municipality && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {stop.municipality}
                    </span>
                  )}
                </div>

                {/* chips */}
                <div className="mt-1 flex flex-wrap gap-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.light} ${c.text}`}
                  >
                    {stop.type === "destination" ? "Destino" : "Experiencia"}
                  </span>
                  {stop.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {getCategoryIcon(stop.category)}
                      <span className="ml-1">{stop.category}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* contenido expandido */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* galería */}
                  {photos.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${photos[photoIndex]})` }}
                      />
                      {photos.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {photos.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoIndex(i);
                              }}
                              className={`w-2 h-2 rounded-full ${
                                i === photoIndex ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* desc & acciones */}
                  <div className="p-4 space-y-3 text-sm text-gray-700">
                    {stop.description && <p>{stop.description}</p>}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Navegar
                      </a>

                      <a
                        href={`/${
                          stop.type === "destination" ? "destinations" : "experiences"
                        }/${stop.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-white hover:opacity-90 transition ${c.primary}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Detalles
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  /* ▸ 4. Render principal */
  return (
    <div className="relative">
      {/* encabezado */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="text-white">
            <h3 className="text-xl font-bold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Aventura del día
            </h3>
            <p className="text-red-100 text-sm mt-1">
              {filteredStops.length} actividades • {h} h {min > 0 ? `${min} min` : ""}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm">
            {startTime} - {endTime}
          </div>
        </div>
      </div>

      {/* filtros */}
      {categories.length > 1 && (
        <div className="mb-4 overflow-x-auto flex gap-1.5 pb-1">
          {["Todas", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === "Todas" ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                (activeCategory ?? "Todas") === cat
                  ? "bg-red-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700"
              }`}
            >
              {cat !== "Todas" && getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* timeline */}
      <div className="relative pt-4 pb-8">
        {filteredStops.map((s, i) => (
          <StopCard
            key={s.id}
            stop={s}
            expanded={expandedId === s.id}
            toggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
            isLast={i === filteredStops.length - 1}
            index={globalOffset + i}
          />
        ))}

        {/* fin */}
        <div className="flex items-center justify-center mt-8">
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Fin del día
          </div>
        </div>
      </div>
    </div>
  );
}
