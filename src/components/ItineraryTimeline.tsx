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
  Edit3,
  AlertCircle,
  Check,
  X,
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

const recalculateTimings = (stops: Stop[], startIndex: number = 0, baseTime?: string): Stop[] => {
  if (stops.length === 0) return stops;
  
  // Si estamos editando el primer stop, usar el baseTime directamente
  let current = baseTime ? toMin(baseTime) : toMin(stops[startIndex].startTime);
  
  return stops.map((stop, idx) => {
    if (idx < startIndex) return stop;
    
    if (idx === startIndex) {
      // Para el stop actual, usar el tiempo base
      return { ...stop, startTime: toHHMM(current) };
    }
    
    // Para stops siguientes, agregar tiempo de viaje
    current += stops[idx - 1].durationMinutes + 30; // duración anterior + viaje
    const startTime = toHHMM(current);
    
    return { ...stop, startTime };
  });
};

// Función para detectar conflictos de horario
const detectTimeConflicts = (stops: Stop[]): { stopId: string; message: string }[] => {
  const conflicts: { stopId: string; message: string }[] = [];
  
  for (let i = 0; i < stops.length; i++) {
    const currentStop = stops[i];
    const currentStart = toMin(currentStop.startTime);
    const currentEnd = currentStart + currentStop.durationMinutes;
    
    // Verificar horario muy temprano o muy tarde
    if (currentStart < 6 * 60) {
      conflicts.push({
        stopId: currentStop.id,
        message: "Comienza muy temprano (antes de 6:00 AM)"
      });
    }
    
    if (currentEnd > 23 * 60) {
      conflicts.push({
        stopId: currentStop.id,
        message: "Termina muy tarde (después de 11:00 PM)"
      });
    }
    
    // Verificar conflictos con actividad anterior
    if (i > 0) {
      const prevStop = stops[i - 1];
      const prevEnd = toMin(prevStop.startTime) + prevStop.durationMinutes;
      const travelTime = 30; // minutos de viaje
      
      if (currentStart < prevEnd + travelTime) {
        const neededTime = prevEnd + travelTime;
        conflicts.push({
          stopId: currentStop.id,
          message: `Conflicto: necesitas llegar a las ${toHHMM(neededTime)} (incluye 30 min de viaje)`
        });
      }
    }
  }
  
  return conflicts;
};

// Componente de edición de horario inline mejorado
const TimeEditor = ({ 
  time, 
  onSave, 
  onCancel,
  minTime,
  maxTime,
  stopName,
  isFirstStop
}: { 
  time: string; 
  onSave: (newTime: string) => void; 
  onCancel: () => void;
  minTime?: string;
  maxTime?: string;
  stopName: string;
  isFirstStop: boolean;
}) => {
  const [value, setValue] = useState(time);
  const [error, setError] = useState("");

  const validate = (newTime: string) => {
    const mins = toMin(newTime);
    
    // Validaciones básicas
    if (mins < 6 * 60) {
      setError("Muy temprano (mínimo 6:00 AM)");
      return false;
    }
    if (mins > 23 * 60) {
      setError("Muy tarde (máximo 11:00 PM)");
      return false;
    }
    
    // Para el primer stop, no hay restricción de tiempo anterior
    if (!isFirstStop && minTime && toMin(newTime) < toMin(minTime)) {
      setError(`Conflicto: mínimo ${formatTime(minTime)}`);
      return false;
    }
    
    if (maxTime && toMin(newTime) > toMin(maxTime)) {
      setError(`Conflicto: máximo ${formatTime(maxTime)}`);
      return false;
    }
    
    setError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setValue(newTime);
    if (newTime) validate(newTime);
  };

  const handleSave = () => {
    if (validate(value)) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 relative">
      <input
        type="time"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="px-2 py-1 text-sm font-medium focus:outline-none"
        autoFocus
      />
      <button
        onClick={handleSave}
        disabled={!!error}
        className="p-1 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Guardar cambio"
      >
        <Check className="w-4 h-4 text-green-600" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 hover:bg-red-50 rounded"
        title="Cancelar"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-1 bg-red-100 text-red-700 text-xs px-3 py-2 rounded-lg shadow-md whitespace-nowrap z-50 border border-red-200"
        >
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="absolute -top-1 left-4 w-2 h-2 bg-red-100 border-l border-t border-red-200 transform rotate-45"></div>
        </motion.div>
      )}
    </div>
  );
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

/* ───────── Componente Sortable mejorado con edición de horarios ───────── */
function SortableStop({ 
  stop, 
  index,
  expanded, 
  toggleExpand, 
  isLast,
  editingTime,
  onTimeEdit,
  onTimeSave,
  stops,
  onStopsUpdate,
  autoAdjust,
  hasConflict,
  conflictMessage
}: {
  stop: Stop;
  index: number;
  expanded: boolean;
  toggleExpand: () => void;
  isLast: boolean;
  editingTime: boolean;
  onTimeEdit: () => void;
  onTimeSave: (newTime: string) => void;
  stops: Stop[];
  onStopsUpdate: (stops: Stop[]) => void;
  autoAdjust: boolean;
  hasConflict?: boolean;
  conflictMessage?: string;
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

  // Calcular min y max time para validación
  const prevStop = index > 0 ? stops[index - 1] : null;
  const nextStop = index < stops.length - 1 ? stops[index + 1] : null;
  
  // Para el primer stop, no hay restricción mínima por actividad anterior
  const minTime = prevStop && index > 0
    ? toHHMM(toMin(prevStop.startTime) + prevStop.durationMinutes + 30) // +30 min de viaje
    : undefined;
    
  const maxTime = nextStop && !autoAdjust
    ? toHHMM(toMin(nextStop.startTime) - 30) // -30 min de viaje
    : undefined;

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
        {/* hora + duración con edición */}
        <div className="flex items-center mb-2">
          <motion.div 
            className={`w-8 h-8 ${c.primary} rounded-full flex items-center justify-center shadow-md`}
            whileHover={{ scale: 1.1 }}
          >
            <Clock className="w-4 h-4 text-white" />
          </motion.div>
          
          {editingTime ? (
            <div className="ml-3 relative">
              <TimeEditor
                time={stop.startTime}
                onSave={onTimeSave}
                onCancel={onTimeEdit}
                minTime={minTime}
                maxTime={maxTime}
                stopName={stop.name}
                isFirstStop={index === 0}
              />
            </div>
          ) : (
            <motion.button
              onClick={onTimeEdit}
              whileHover={{ scale: 1.05 }}
              className={`${c.text} font-semibold ml-3 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all group`}
            >
              {formatTime(stop.startTime)}
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.button>
          )}
          
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

        {/* tarjeta mejorada con indicador de conflicto */}
        <motion.div 
          className={`ml-10 rounded-2xl shadow-lg border ${hasConflict ? 'border-yellow-400' : c.border} bg-white ${isDragging ? 'shadow-2xl' : ''} overflow-hidden relative`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Indicador de conflicto */}
          {hasConflict && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 px-3 py-1.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs text-yellow-800 font-medium">{conflictMessage}</span>
            </div>
          )}
          
          <div className="cursor-pointer" onClick={toggleExpand} style={{ marginTop: hasConflict ? '2rem' : '0' }}>
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

/* ───────── componente principal mejorado con edición de horarios ───────── */
export default function ItineraryTimeline({ stops, onStopsReorder, userLocation }: Props) {
  const [localStops, setLocalStops] = useState(stops);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "cards">("timeline");
  const [autoAdjust, setAutoAdjust] = useState(true); // ajuste automático de horarios subsecuentes
  const [conflicts, setConflicts] = useState<{ stopId: string; message: string }[]>([]);

  React.useEffect(() => {
    setLocalStops(stops);
  }, [stops]);

  // Detectar conflictos cuando cambian los stops
  React.useEffect(() => {
    const newConflicts = detectTimeConflicts(localStops);
    setConflicts(newConflicts);
  }, [localStops]);

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

  // Manejar edición de tiempo
  const handleTimeEdit = (stopId: string) => {
    setEditingTimeId(editingTimeId === stopId ? null : stopId);
  };

  const handleTimeSave = (stopId: string, newTime: string) => {
    const index = localStops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    let updatedStops = [...localStops];
    
    // Si el ajuste automático está activado, recalcular horarios subsecuentes
    if (autoAdjust) {
      updatedStops = recalculateTimings(updatedStops, index, newTime);
    } else {
      // Solo actualizar el horario del stop actual
      updatedStops[index] = { ...updatedStops[index], startTime: newTime };
    }

    setLocalStops(updatedStops);
    onStopsReorder?.(updatedStops);
    setEditingTimeId(null);
  };

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
      {/* encabezado mejorado con toggle de ajuste automático y alertas */}
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
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-red-100 text-xs flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Arrastra para reordenar • Click en horarios para editar
          </p>
          
          {/* Toggle de ajuste automático */}
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdjust}
              onChange={(e) => setAutoAdjust(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${
              autoAdjust ? "bg-white/40" : "bg-white/20"
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                autoAdjust ? "translate-x-5" : "translate-x-0.5"
              } mt-0.5`} />
            </div>
            <span>Ajuste automático</span>
            <span title="Cuando está activado, cambiar un horario ajustará automáticamente los siguientes">
              <Info className="w-3 h-3 opacity-60" />
            </span>
          </label>
        </div>
        
        {/* Mostrar alertas de conflictos */}
        {conflicts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="text-yellow-100 font-medium">Conflictos detectados:</p>
                {conflicts.map((conflict, idx) => (
                  <p key={idx} className="text-yellow-100/90">
                    • {localStops.find(s => s.id === conflict.stopId)?.name}: {conflict.message}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
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
              {filteredStops.map((s, i) => {
                const conflict = conflicts.find(c => c.stopId === s.id);
                return (
                  <SortableStop
                    key={s.id}
                    stop={s}
                    index={i}
                    expanded={expandedId === s.id}
                    toggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    isLast={i === filteredStops.length - 1}
                    editingTime={editingTimeId === s.id}
                    onTimeEdit={() => handleTimeEdit(s.id)}
                    onTimeSave={(newTime) => handleTimeSave(s.id, newTime)}
                    stops={filteredStops}
                    onStopsUpdate={setLocalStops}
                    autoAdjust={autoAdjust}
                    hasConflict={!!conflict}
                    conflictMessage={conflict?.message}
                  />
                );
              })}
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