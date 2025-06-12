// File: src/components/ItineraryTimeline.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Check,
  X,
  Plus,
  PlusCircle,
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

// Función mejorada para recalcular tiempos con duraciones editables
const recalculateTimings = (stops: Stop[], startIndex: number = 0, baseTime?: string): Stop[] => {
  if (stops.length === 0) return stops;
  
  let current = baseTime ? toMin(baseTime) : toMin(stops[startIndex].startTime);
  
  return stops.map((stop, idx) => {
    if (idx < startIndex) return stop;
    
    if (idx === startIndex) {
      return { ...stop, startTime: toHHMM(current) };
    }
    
    // Para stops siguientes, agregar tiempo de viaje + duración del anterior
    const prevStop = stops[idx - 1];
    current = toMin(prevStop.startTime) + prevStop.durationMinutes + 30; // 30 min de viaje
    const startTime = toHHMM(current);
    
    return { ...stop, startTime };
  });
};

// Función para detectar espacios para descansos - VERSIÓN MEJORADA
const detectBreakOpportunities = (stops: Stop[]): { afterIndex: number; duration: number; suggestedTime: string }[] => {
  const opportunities: { afterIndex: number; duration: number; suggestedTime: string }[] = [];
  
  // No sugerir descansos si hay muy pocas paradas
  if (stops.length < 3) return opportunities;
  
  let lastBreakIndex = -1;
  let accumulatedActivityTime = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];
    
    // Acumular tiempo de actividad
    accumulatedActivityTime += currentStop.durationMinutes;
    
    // Verificar si la parada actual ya es un descanso
    const isCurrentBreak = currentStop.category?.toLowerCase().includes('descanso') || 
                          currentStop.category?.toLowerCase().includes('comida') ||
                          currentStop.category?.toLowerCase().includes('almuerzo') ||
                          currentStop.name.toLowerCase().includes('café') ||
                          currentStop.name.toLowerCase().includes('restaurante');
    
    if (isCurrentBreak) {
      lastBreakIndex = i;
      accumulatedActivityTime = 0; // Resetear contador
      continue;
    }
    
    const currentEnd = toMin(currentStop.startTime) + currentStop.durationMinutes;
    const nextStart = toMin(nextStop.startTime);
    const gap = nextStart - currentEnd - 30; // Restamos 30 min de viaje
    
    // Condiciones más estrictas para sugerir descanso:
    const conditions = {
      hasEnoughGap: gap >= 45, // Mínimo 45 minutos libres
      hasBeenLongEnough: accumulatedActivityTime >= 180, // Han pasado al menos 3 horas
      notTooSoon: i - lastBreakIndex >= 2, // Al menos 2 paradas desde el último descanso
      notNearEnd: i < stops.length - 2, // No sugerir en las últimas paradas
      isGoodTiming: isGoodTimeForBreak(currentEnd), // Verificar si es buen momento del día
      notTooManyBreaks: countExistingBreaks(stops) < 2 // Máximo 2 descansos sugeridos
    };
    
    // Solo sugerir si se cumplen TODAS las condiciones
    if (Object.values(conditions).every(condition => condition)) {
      opportunities.push({
        afterIndex: i,
        duration: Math.min(gap, 60), // Máximo 60 minutos de descanso
        suggestedTime: toHHMM(currentEnd + 30) // Después del viaje
      });
      
      lastBreakIndex = i; // Actualizar índice del último descanso sugerido
      accumulatedActivityTime = 0; // Resetear contador
    }
  }
  
  // Limitar a máximo 2 sugerencias, priorizando las mejores ubicaciones
  return opportunities
    .sort((a, b) => {
      // Priorizar descansos alrededor del mediodía
      const aTime = toMin(a.suggestedTime);
      const bTime = toMin(b.suggestedTime);
      const noon = 12 * 60;
      const aDiff = Math.abs(aTime - noon);
      const bDiff = Math.abs(bTime - noon);
      return aDiff - bDiff;
    })
    .slice(0, 2); // Máximo 2 sugerencias
};

// Función auxiliar para verificar si es buen momento para un descanso
const isGoodTimeForBreak = (timeInMinutes: number): boolean => {
  const hour = Math.floor(timeInMinutes / 60);
  // Buenos momentos: media mañana (10-11am), almuerzo (12-2pm), media tarde (3-4pm)
  return (hour >= 10 && hour <= 11) || (hour >= 12 && hour <= 14) || (hour >= 15 && hour <= 16);
};

// Función auxiliar para contar descansos existentes
const countExistingBreaks = (stops: Stop[]): number => {
  return stops.filter(stop => 
    stop.category?.toLowerCase().includes('descanso') ||
    stop.category?.toLowerCase().includes('comida') ||
    stop.name.toLowerCase().includes('café') ||
    stop.name.toLowerCase().includes('descanso')
  ).length;
};

// Componente de editor de duración inline
const DurationEditor = ({ 
  duration, 
  onSave, 
  onCancel,
  stopName
}: { 
  duration: number; 
  onSave: (newDuration: number) => void; 
  onCancel: () => void;
  stopName: string;
}) => {
  const [value, setValue] = useState(duration.toString());
  const [error, setError] = useState("");

  const validate = (newDuration: string) => {
    const mins = parseInt(newDuration);
    
    if (isNaN(mins) || mins < 15) {
      setError("Mínimo 15 minutos");
      return false;
    }
    if (mins > 300) {
      setError("Máximo 5 horas (300 min)");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setValue(newDuration);
    if (newDuration) validate(newDuration);
  };

  const handleSave = () => {
    if (validate(value)) {
      onSave(parseInt(value));
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
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="px-2 py-1 text-sm font-medium focus:outline-none w-20"
        placeholder="Min"
        autoFocus
      />
      <span className="text-xs text-gray-500">min</span>
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
    </div>
  );
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
    
    if (mins < 6 * 60) {
      setError("Muy temprano (mínimo 6:00 AM)");
      return false;
    }
    if (mins > 23 * 60) {
      setError("Muy tarde (máximo 11:00 PM)");
      return false;
    }
    
    if (!isFirstStop && minTime && toMin(newTime) < toMin(minTime)) {
      setError(`Mínimo ${formatTime(minTime)}`);
      return false;
    }
    
    if (maxTime && toMin(newTime) > toMin(maxTime)) {
      setError(`Máximo ${formatTime(maxTime)}`);
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
    </div>
  );
};

// Componente de sugerencia de descanso
// Componente de sugerencia de descanso - VERSIÓN MEJORADA
const BreakSuggestion = ({ 
  opportunity,
  onAdd,
  onDismiss
}: {
  opportunity: { afterIndex: number; duration: number; suggestedTime: string };
  onAdd: () => void;
  onDismiss: () => void;
}) => {
  const suggestedHour = Math.floor(toMin(opportunity.suggestedTime) / 60);
  const isLunchTime = suggestedHour >= 12 && suggestedHour <= 14;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-10 my-3 relative"
    >
      <div className={`p-3 rounded-lg border ${
        isLunchTime 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLunchTime ? (
              <Utensils className="w-4 h-4 text-orange-600" />
            ) : (
              <Coffee className="w-4 h-4 text-blue-600" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                isLunchTime ? 'text-orange-800' : 'text-blue-800'
              }`}>
                {isLunchTime ? 'Hora de almorzar' : 'Momento para un descanso'}
              </p>
              <p className={`text-xs mt-0.5 ${
                isLunchTime ? 'text-orange-700' : 'text-blue-700'
              }`}>
                {opportunity.duration} min disponibles • {formatTime(opportunity.suggestedTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                isLunchTime 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Agregar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className={`w-3.5 h-3.5 ${
                isLunchTime ? 'text-orange-600' : 'text-blue-600'
              }`} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ───────── Componente Card View (Mobile-first) ───────── */
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
            <div className="flex flex-col md:flex-row">
              {/* Imagen - Stack vertical en móvil */}
              <div className="w-full md:w-1/3 relative h-48 md:h-auto md:min-h-[200px]">
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
              <div className="flex-1 p-4 md:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-1">{stop.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {stop.municipality}
                    </p>
                  </div>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium ml-2">
                    {stop.durationMinutes} min
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm md:text-base">
                  {stop.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
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

                {/* Acciones rápidas - Stack vertical en móvil */}
                <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Modal de detalles - Adaptado para móvil */}
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
                  <div className="relative h-48 md:h-64">
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
                <div className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">{selectedStop.name}</h2>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">{selectedStop.description}</p>
                  
                  {selectedStop.tip && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <p className="font-semibold text-amber-800 mb-1">💡 Consejo local</p>
                      <p className="text-sm text-amber-700">{selectedStop.tip}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
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

/* ───────── Componente Sortable mejorado con edición de duraciones ───────── */
function SortableStop({ 
  stop, 
  index,
  expanded, 
  toggleExpand, 
  isLast,
  editingTime,
  editingDuration,
  onTimeEdit,
  onDurationEdit,
  onTimeSave,
  onDurationSave,
  stops,
  onStopsUpdate,
  autoAdjust
}: {
  stop: Stop;
  index: number;
  expanded: boolean;
  toggleExpand: () => void;
  isLast: boolean;
  editingTime: boolean;
  editingDuration: boolean;
  onTimeEdit: () => void;
  onDurationEdit: () => void;
  onTimeSave: (newTime: string) => void;
  onDurationSave: (newDuration: number) => void;
  stops: Stop[];
  onStopsUpdate: (stops: Stop[]) => void;
  autoAdjust: boolean;
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
  
  const minTime = prevStop && index > 0
    ? toHHMM(toMin(prevStop.startTime) + prevStop.durationMinutes + 30)
    : undefined;
    
  const maxTime = nextStop && !autoAdjust
    ? toHHMM(toMin(nextStop.startTime) - 30)
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
          
          {editingDuration ? (
            <div className="ml-2 relative">
              <DurationEditor
                duration={stop.durationMinutes}
                onSave={onDurationSave}
                onCancel={onDurationEdit}
                stopName={stop.name}
              />
            </div>
          ) : (
            <motion.button
              onClick={onDurationEdit}
              whileHover={{ scale: 1.05 }}
              className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-all group flex items-center gap-1"
            >
              {stop.durationMinutes} min
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.button>
          )}
          
          {/* Drag Handle mejorado */}
          <motion.div 
            {...attributes} 
            {...listeners}
            className="ml-auto mr-2 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all touch-manipulation"
            whileHover={{ scale: 1.1 }}
            title="Arrastra para reordenar"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        {/* tarjeta mejorada */}
        <motion.div 
          className={`ml-10 rounded-2xl shadow-lg border ${c.border} bg-white ${isDragging ? 'shadow-2xl' : ''} overflow-hidden relative`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="cursor-pointer" onClick={toggleExpand}>
            {!expanded && (
              <div className="flex flex-col sm:flex-row">
                {stop.imageUrl && (
                  <div
                    className="w-full sm:w-24 h-32 sm:h-24 bg-cover bg-center flex-shrink-0"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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

/* ───────── componente principal mejorado con edición de duraciones ───────── */
export default function ItineraryTimeline({ stops, onStopsReorder, userLocation }: Props) {
  const [localStops, setLocalStops] = useState(stops);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "cards">("timeline");
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [breakOpportunities, setBreakOpportunities] = useState<{ afterIndex: number; duration: number; suggestedTime: string }[]>([]);
  const [dismissedBreaks, setDismissedBreaks] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    setLocalStops(stops);
  }, [stops]);

  // Detectar oportunidades de descanso cuando cambian los stops
  React.useEffect(() => {
    const opportunities = detectBreakOpportunities(localStops);
    setBreakOpportunities(opportunities.filter(o => !dismissedBreaks.has(o.afterIndex)));
  }, [localStops, dismissedBreaks]);

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
    setEditingDurationId(null); // Cerrar editor de duración si está abierto
  };

  const handleTimeSave = (stopId: string, newTime: string) => {
    const index = localStops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    let updatedStops = [...localStops];
    
    if (autoAdjust) {
      updatedStops = recalculateTimings(updatedStops, index, newTime);
    } else {
      updatedStops[index] = { ...updatedStops[index], startTime: newTime };
    }

    setLocalStops(updatedStops);
    onStopsReorder?.(updatedStops);
    setEditingTimeId(null);
  };

  // Manejar edición de duración
  const handleDurationEdit = (stopId: string) => {
    setEditingDurationId(editingDurationId === stopId ? null : stopId);
    setEditingTimeId(null); // Cerrar editor de tiempo si está abierto
  };

  const handleDurationSave = (stopId: string, newDuration: number) => {
    const index = localStops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    let updatedStops = [...localStops];
    updatedStops[index] = { ...updatedStops[index], durationMinutes: newDuration };
    
    // Recalcular tiempos subsecuentes si el ajuste automático está activado
    if (autoAdjust && index < updatedStops.length - 1) {
      updatedStops = recalculateTimings(updatedStops, index + 1);
    }

    setLocalStops(updatedStops);
    onStopsReorder?.(updatedStops);
    setEditingDurationId(null);
  };

  // Agregar descanso
  const handleAddBreak = (afterIndex: number, duration: number, suggestedTime: string) => {
    const breakStop: Stop = {
      id: `break-${Date.now()}`,
      name: "Descanso y refrigerio",
      description: "Tiempo para descansar, tomar un café o un snack",
      lat: localStops[afterIndex].lat,
      lng: localStops[afterIndex].lng,
      startTime: suggestedTime,
      durationMinutes: duration,
      category: "Descanso",
      municipality: localStops[afterIndex].municipality,
      distance: 0,
      type: "experience",
      imageUrl: "/images/rest-placeholder.jpg",
      tip: "Aprovecha para hidratarte y recargar energías"
    };

    const updatedStops = [
      ...localStops.slice(0, afterIndex + 1),
      breakStop,
      ...localStops.slice(afterIndex + 1)
    ];

    const recalculated = recalculateTimings(updatedStops);
    setLocalStops(recalculated);
    onStopsReorder?.(recalculated);
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

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative">
      {/* encabezado mejorado con toggle de ajuste automático */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-4 md:p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-white">
            <h3 className="text-lg md:text-xl font-bold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Aventura del día
            </h3>
            <p className="text-red-100 text-sm mt-1">
              {filteredStops.length} actividades • {h} h {min > 0 ? `${min} min` : ""}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs md:text-sm font-medium">
            {startTime} - {endTime}
          </div>
        </div>
        
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-red-100 text-xs flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            {isMobile ? "Toca y arrastra" : "Arrastra para reordenar"} • Click en horarios/duraciones para editar
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
            <span className="hidden sm:inline">Ajuste automático</span>
            <span className="sm:hidden">Auto</span>
            <span title="Cuando está activado, cambiar un horario ajustará automáticamente los siguientes">
              <Info className="w-3 h-3 opacity-60" />
            </span>
          </label>
        </div>
      </div>

      {/* Toggle de vista */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("timeline")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              view === "timeline" 
                ? "bg-red-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <List className="w-4 h-4" /> 
            <span className="hidden sm:inline">Línea de tiempo</span>
            <span className="sm:hidden">Timeline</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("cards")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              view === "cards" 
                ? "bg-red-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Grid className="w-4 h-4" /> 
            <span className="hidden sm:inline">Tarjetas</span>
            <span className="sm:hidden">Cards</span>
          </motion.button>
        </div>

        {/* Filtros de categoría - Scroll horizontal en móvil */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
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
                // Encontrar oportunidad de descanso después de esta parada
                const breakOpp = breakOpportunities.find(o => o.afterIndex === i);
                
                return (
                  <React.Fragment key={s.id}>
                    <SortableStop
                      stop={s}
                      index={i}
                      expanded={expandedId === s.id}
                      toggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      isLast={i === filteredStops.length - 1}
                      editingTime={editingTimeId === s.id}
                      editingDuration={editingDurationId === s.id}
                      onTimeEdit={() => handleTimeEdit(s.id)}
                      onDurationEdit={() => handleDurationEdit(s.id)}
                      onTimeSave={(newTime) => handleTimeSave(s.id, newTime)}
                      onDurationSave={(newDuration) => handleDurationSave(s.id, newDuration)}
                      stops={filteredStops}
                      onStopsUpdate={setLocalStops}
                      autoAdjust={autoAdjust}
                    />
                    
                    {/* Sugerencia de descanso */}
                    {breakOpp && !dismissedBreaks.has(i) && (
                      <BreakSuggestion
                        opportunity={breakOpp}
                        onAdd={() => handleAddBreak(i, breakOpp.duration, breakOpp.suggestedTime)}
                        onDismiss={() => {
                          setDismissedBreaks(new Set([...dismissedBreaks, i]));
                        }}
                      />
                    )}
                  </React.Fragment>
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