// File: src/components/ItineraryTimeline.tsx
"use client";

import React, { useState, useMemo } from "react";
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
  Info,
  Star,
  GripVertical,
  Grid,
  List,
  MoreVertical,
  Maximize2,
} from "lucide-react";
import Image from "next/image";

// Importaciones de @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  stops: Stop[];
  onStopsReorder?: (newStops: Stop[]) => void;
  userLocation?: { lat: number; lng: number } | null;
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

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (min: number) =>
  `${Math.floor(min / 60)
    .toString()
    .padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;

const formatTime = (t: string) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
};

const recalculateTimings = (stops: Stop[]): Stop[] => {
  let current = 9 * 60;
  return stops.map((stop, idx) => {
    if (idx > 0) {
      current += 30;
    }
    const startTime = toHHMM(current);
    current += stop.durationMinutes || 60;
    return { ...stop, startTime };
  });
};

/* ───────── Componente Card View ───────── */
const CardsView = ({ stops, onReorder, userLocation }: { 
  stops: Stop[]; 
  onReorder?: (newStops: Stop[]) => void;
  userLocation?: { lat: number; lng: number } | null;
}) => {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  return (
    <>
      <div className="grid gap-4">
        {stops.map((stop, index) => (
          <motion.div
            key={stop.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            whileHover={{ y: -4 }}
          >
            <div className="flex">
              {/* Imagen grande */}
              <div className="w-1/3 relative min-h-[200px]">
                {stop.imageUrl ? (
                  <Image
                    src={stop.imageUrl}
                    alt={stop.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {formatTime(stop.startTime)}
                </div>
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  stop.type === "destination" 
                    ? "bg-blue-600 text-white" 
                    : "bg-green-600 text-white"
                }`}>
                  {stop.type === "destination" ? "Destino" : "Experiencia"}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{stop.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {stop.municipality}
                    </p>
                  </div>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                    {stop.durationMinutes} min
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {stop.description}
                </p>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  {stop.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                      {getCategoryIcon(stop.category)}
                      {stop.category}
                    </span>
                  )}
                  {userLocation && stop.distance && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                      {Math.round(stop.distance)} km
                    </span>
                  )}
                </div>

                {/* Acciones rápidas */}
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    onClick={() => {
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;
                      window.open(mapsUrl, "_blank");
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedStop(stop)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de detalles */}
      <AnimatePresence>
        {selectedStop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStop(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido del modal */}
              <div className="relative">
                {selectedStop.imageUrl && (
                  <div className="relative h-64">
                    <Image
                      src={selectedStop.imageUrl}
                      alt={selectedStop.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => setSelectedStop(null)}
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{selectedStop.name}</h2>
                  <p className="text-gray-600 mb-6">{selectedStop.description}</p>
                  
                  {selectedStop.tip && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <p className="font-semibold text-amber-800 mb-1">💡 Consejo local</p>
                      <p className="text-sm text-amber-700">{selectedStop.tip}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const url = `/${selectedStop.type === "destination" ? "destinations" : "experiences"}/${selectedStop.id}`;
                        window.open(url, "_blank");
                      }}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Ver detalles completos
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ───────── Componente Sortable mejorado ───────── */
function SortableStop({ stop, expanded, toggleExpand, isLast }: {
  stop: Stop;
  expanded: boolean;
  toggleExpand: () => void;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = stop.photos || (stop.imageUrl ? [stop.imageUrl] : []);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;

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
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${isDragging ? 'z-50' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isLast && (
        <div className={`absolute left-4 top-12 bottom-0 w-0.5 ${c.secondary}`} />
      )}

      <div className="relative z-10 mb-6">
        {/* hora + duración */}
        <div className="flex items-center mb-2">
          <motion.div 
            className={`w-8 h-8 ${c.primary} rounded-full flex items-center justify-center shadow-md`}
            whileHover={{ scale: 1.1 }}
          >
            <Clock className="w-4 h-4 text-white" />
          </motion.div>
          <div className={`${c.text} font-semibold ml-3`}>
            {formatTime(stop.startTime)}
          </div>
          <div className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
            {stop.durationMinutes} min
          </div>
          
          {/* Drag Handle mejorado */}
          <motion.div 
            {...attributes} 
            {...listeners}
            className="ml-auto mr-2 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all"
            whileHover={{ scale: 1.1 }}
            title="Arrastra para reordenar"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        {/* tarjeta mejorada */}
        <motion.div 
          className={`ml-10 rounded-2xl shadow-lg border ${c.border} bg-white ${isDragging ? 'shadow-2xl' : ''} overflow-hidden`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="cursor-pointer" onClick={toggleExpand}>
            {!expanded && (
              <div className="flex">
                {stop.imageUrl && (
                  <div
                    className="w-24 h-24 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${stop.imageUrl})` }}
                  />
                )}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-800 pr-2 line-clamp-1">
                      {stop.name}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="mt-1 flex items-center text-xs text-gray-500 gap-3">
                    {stop.municipality && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {stop.municipality}
                      </span>
                    )}
                    {stop.distance && (
                      <span>{Math.round(stop.distance)} km</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
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
            )}

            {expanded && (
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">
                    {stop.name}
                  </h3>
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-3 mb-3">
                  {stop.municipality && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {stop.municipality}
                    </span>
                  )}
                  {stop.distance && (
                    <span>{Math.round(stop.distance)} km</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* contenido expandido mejorado */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* galería mejorada */}
                {photos.length > 0 && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-all duration-500"
                      style={{ backgroundImage: `url(${photos[photoIndex]})` }}
                    />
                    {photos.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoIndex(i);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === photoIndex 
                                ? "bg-white w-6" 
                                : "bg-white/50 hover:bg-white/70"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* desc & acciones mejoradas */}
                <div className="p-5 space-y-4">
                  {stop.description && (
                    <p className="text-gray-700 leading-relaxed">{stop.description}</p>
                  )}

                  {stop.tip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <p className="font-semibold text-amber-800 mb-1 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Consejo local
                      </p>
                      <p className="text-sm text-amber-700">{stop.tip}</p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                    >
                      <Navigation className="w-4 h-4" />
                      Navegar
                    </motion.a>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`/${
                        stop.type === "destination" ? "destinations" : "experiences"
                      }/${stop.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white hover:opacity-90 transition font-medium ${c.primary}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Detalles
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ───────── componente principal mejorado ───────── */
export default function ItineraryTimeline({ stops, onStopsReorder, userLocation }: Props) {
  const [localStops, setLocalStops] = useState(stops);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "cards">("timeline");

  React.useEffect(() => {
    setLocalStops(stops);
  }, [stops]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localStops.findIndex((stop) => stop.id === active.id);
      const newIndex = localStops.findIndex((stop) => stop.id === over?.id);
      
      const reorderedStops = arrayMove(localStops, oldIndex, newIndex);
      const recalculatedStops = recalculateTimings(reorderedStops);
      
      setLocalStops(recalculatedStops);
      onStopsReorder?.(recalculatedStops);
    }
  }

  /* filtros */
  const categories = Array.from(new Set(localStops.map((s) => s.category).filter(Boolean)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredStops = activeCategory
    ? localStops.filter((s) => s.category === activeCategory)
    : localStops;

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

  return (
    <div className="relative">
      {/* encabezado mejorado */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-5 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-xl font-bold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Aventura del día
            </h3>
            <p className="text-red-100 text-sm mt-1">
              {filteredStops.length} actividades • {h} h {min > 0 ? `${min} min` : ""}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium">
            {startTime} - {endTime}
          </div>
        </div>
        
        <div className="mt-3 text-red-100 text-xs flex items-center gap-1">
          <GripVertical className="w-3 h-3" />
          Arrastra las actividades para reordenar tu itinerario
        </div>
      </div>

      {/* Toggle de vista */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("timeline")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              view === "timeline" 
                ? "bg-red-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <List className="w-4 h-4" /> Línea de tiempo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("cards")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              view === "cards" 
                ? "bg-red-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Grid className="w-4 h-4" /> Tarjetas
          </motion.button>
        </div>

        {/* Filtros de categoría */}
        {categories.length > 1 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !activeCategory
                  ? "bg-red-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  activeCategory === cat
                    ? "bg-red-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {getCategoryIcon(cat)}
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vista condicional */}
      {view === "timeline" ? (
        <div className="relative pt-4 pb-8">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredStops.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
            >
              {filteredStops.map((s, i) => (
                <SortableStop
                  key={s.id}
                  stop={s}
                  expanded={expandedId === s.id}
                  toggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  isLast={i === filteredStops.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* fin del día */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center mt-8"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full text-sm font-medium shadow-sm">
              ✨ Fin del día
            </div>
          </motion.div>
        </div>
      ) : (
        <CardsView stops={filteredStops} onReorder={onStopsReorder} userLocation={userLocation} />
      )}
    </div>
  );
}