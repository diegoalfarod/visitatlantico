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
  Trash2,
  Search,
  Sparkles,
  ArrowRight,
  CalendarDays,
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
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
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

// Importar Firebase
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// Importar componente y utilidades
import AddDestinationModal from "./AddDestinationModal";
import { getCategoryIcon, toMin, toHHMM, formatTime } from "@/utils/itinerary-helpers";

// Tipos extendidos para manejar múltiples días
interface DayData {
  id: string;
  date: string;
  title: string;
  stops: Stop[];
}

interface Props {
  days: DayData[];
  onDaysUpdate?: (days: DayData[]) => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Función mejorada para recalcular tiempos sin reordenar
const recalculateTimings = (stops: Stop[], startIndex: number = 0, baseTime?: string): Stop[] => {
  if (stops.length === 0) return stops;
  
  let current = baseTime ? toMin(baseTime) : toMin(stops[0].startTime || "09:00");
  
  return stops.map((stop, idx) => {
    if (idx === 0 && !baseTime) {
      // Mantener el primer horario si no se especifica uno base
      current = toMin(stop.startTime || "09:00");
      const newStop = { ...stop, startTime: stop.startTime || "09:00" };
      current += stop.durationMinutes;
      return newStop;
    }
    
    if (idx > 0) {
      // Agregar tiempo de viaje entre paradas
      current += 30;
    }
    
    const startTime = toHHMM(current);
    current += stop.durationMinutes;
    
    // Solo actualizar el startTime, mantener todo lo demás
    return { ...stop, startTime };
  });
};

// Función para detectar espacios para descansos
const detectBreakOpportunities = (stops: Stop[]): { afterIndex: number; duration: number; suggestedTime: string }[] => {
  const opportunities: { afterIndex: number; duration: number; suggestedTime: string }[] = [];
  
  if (stops.length < 3) return opportunities;
  
  let lastBreakIndex = -1;
  let accumulatedActivityTime = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];
    
    accumulatedActivityTime += currentStop.durationMinutes;
    
    const isCurrentBreak = currentStop.category?.toLowerCase().includes('descanso') || 
                          currentStop.category?.toLowerCase().includes('comida') ||
                          currentStop.category?.toLowerCase().includes('almuerzo') ||
                          currentStop.name.toLowerCase().includes('café') ||
                          currentStop.name.toLowerCase().includes('restaurante');
    
    if (isCurrentBreak) {
      lastBreakIndex = i;
      accumulatedActivityTime = 0;
      continue;
    }
    
    const currentEnd = toMin(currentStop.startTime) + currentStop.durationMinutes;
    const nextStart = toMin(nextStop.startTime);
    const gap = nextStart - currentEnd - 30;
    
    const conditions = {
      hasEnoughGap: gap >= 45,
      hasBeenLongEnough: accumulatedActivityTime >= 180,
      notTooSoon: i - lastBreakIndex >= 2,
      notNearEnd: i < stops.length - 2,
      isGoodTiming: isGoodTimeForBreak(currentEnd),
      notTooManyBreaks: countExistingBreaks(stops) < 2
    };
    
    if (Object.values(conditions).every(condition => condition)) {
      opportunities.push({
        afterIndex: i,
        duration: Math.min(gap, 60),
        suggestedTime: toHHMM(currentEnd + 30)
      });
      
      lastBreakIndex = i;
      accumulatedActivityTime = 0;
    }
  }
  
  return opportunities
    .sort((a, b) => {
      const aTime = toMin(a.suggestedTime);
      const bTime = toMin(b.suggestedTime);
      const noon = 12 * 60;
      const aDiff = Math.abs(aTime - noon);
      const bDiff = Math.abs(bTime - noon);
      return aDiff - bDiff;
    })
    .slice(0, 2);
};

const isGoodTimeForBreak = (timeInMinutes: number): boolean => {
  const hour = Math.floor(timeInMinutes / 60);
  return (hour >= 10 && hour <= 11) || (hour >= 12 && hour <= 14) || (hour >= 15 && hour <= 16);
};

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

// Componente de edición de horario inline
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

// Componente Sortable mejorado con soporte para drag entre días
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
  onRemove,
  stops,
  onStopsUpdate,
  autoAdjust,
  dayId,
  isDragging: parentIsDragging
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
  onRemove: () => void;
  stops: Stop[];
  onStopsUpdate: (stops: Stop[]) => void;
  autoAdjust: boolean;
  dayId: string;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `${dayId}-${stop.id}`,
    data: {
      type: 'stop',
      stop,
      dayId,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || parentIsDragging ? 0.3 : 1,
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
          
          {/* Acciones */}
          <div className="ml-auto flex items-center gap-2">
            {/* Botón eliminar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Eliminar del itinerario"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            
            {/* Drag Handle con indicador visual de que se puede mover entre días */}
            <motion.div 
              {...attributes} 
              {...listeners}
              className={`p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all touch-manipulation ${
                isDragging 
                  ? 'bg-gray-200 shadow-inner' 
                  : 'hover:bg-gray-100 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Arrastra para reordenar o mover a otro día"
            >
              <GripVertical className={`w-4 h-4 ${isDragging ? 'text-gray-600' : 'text-gray-400'}`} />
            </motion.div>
          </div>
        </div>

        {/* tarjeta mejorada */}
        <motion.div 
          className={`ml-10 rounded-2xl shadow-lg border ${c.border} bg-white overflow-hidden relative transition-all ${
            isDragging ? 'shadow-2xl transform scale-98' : ''
          }`}
          animate={{
            scale: isDragging ? 0.98 : 1,
            opacity: isDragging ? 0.7 : 1,
          }}
          whileHover={{ scale: isDragging ? 0.98 : 1.02 }}
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

                {/* desc & acciones */}
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

// Componente DragOverlay para mostrar el elemento que se está arrastrando
function DragOverlayContent({ stop }: { stop: Stop }) {
  const colors = {
    destination: {
      primary: "bg-blue-600",
      border: "border-blue-200",
      text: "text-blue-700",
      light: "bg-blue-50",
    },
    experience: {
      primary: "bg-green-600",
      border: "border-green-200",
      text: "text-green-700",
      light: "bg-green-50",
    },
  } as const;

  const c = colors[stop.type];

  return (
    <div className="w-96 opacity-90">
      <div className={`rounded-2xl shadow-2xl border-2 ${c.border} bg-white overflow-hidden transform rotate-3`}>
        <div className="flex">
          {stop.imageUrl && (
            <div
              className="w-24 h-24 bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${stop.imageUrl})` }}
            />
          )}
          <div className="flex-1 p-4 min-w-0">
            <h3 className="font-bold text-gray-800 line-clamp-1">{stop.name}</h3>
            <div className="mt-1 flex items-center text-xs text-gray-500 gap-3">
              {stop.municipality && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {stop.municipality}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.light} ${c.text}`}>
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
      </div>
    </div>
  );
}

// Componente de día individual
function DayTimeline({ 
  day,
  onStopsUpdate,
  userLocation,
  isOver,
  canDrop
}: {
  day: DayData;
  onStopsUpdate: (stops: Stop[]) => void;
  userLocation?: { lat: number; lng: number } | null;
  isOver?: boolean;
  canDrop?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [breakOpportunities, setBreakOpportunities] = useState<{ afterIndex: number; duration: number; suggestedTime: string }[]>([]);
  const [dismissedBreaks, setDismissedBreaks] = useState<Set<number>>(new Set());

  // Detectar oportunidades de descanso
  React.useEffect(() => {
    const opportunities = detectBreakOpportunities(day.stops);
    setBreakOpportunities(opportunities.filter(o => !dismissedBreaks.has(o.afterIndex)));
  }, [day.stops, dismissedBreaks]);

  // Manejar edición de tiempo
  const handleTimeEdit = (stopId: string) => {
    setEditingTimeId(editingTimeId === stopId ? null : stopId);
    setEditingDurationId(null);
  };

  const handleTimeSave = (stopId: string, newTime: string) => {
    const index = day.stops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    let updatedStops = [...day.stops];
    
    if (autoAdjust) {
      updatedStops = recalculateTimings(updatedStops, index, newTime);
    } else {
      updatedStops[index] = { ...updatedStops[index], startTime: newTime };
    }

    onStopsUpdate(updatedStops);
    setEditingTimeId(null);
  };

  // Manejar edición de duración
  const handleDurationEdit = (stopId: string) => {
    setEditingDurationId(editingDurationId === stopId ? null : stopId);
    setEditingTimeId(null);
  };

  const handleDurationSave = (stopId: string, newDuration: number) => {
    const index = day.stops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    let updatedStops = [...day.stops];
    updatedStops[index] = { ...updatedStops[index], durationMinutes: newDuration };
    
    if (autoAdjust && index < updatedStops.length - 1) {
      updatedStops = recalculateTimings(updatedStops, index + 1);
    }

    onStopsUpdate(updatedStops);
    setEditingDurationId(null);
  };

  // Agregar descanso
  const handleAddBreak = (afterIndex: number, duration: number, suggestedTime: string) => {
    const breakStop: Stop = {
      id: `break-${Date.now()}`,
      name: "Descanso y refrigerio",
      description: "Tiempo para descansar, tomar un café o un snack",
      lat: day.stops[afterIndex].lat,
      lng: day.stops[afterIndex].lng,
      startTime: suggestedTime,
      durationMinutes: duration,
      category: "Descanso",
      municipality: day.stops[afterIndex].municipality,
      distance: 0,
      type: "experience",
      imageUrl: "/images/rest-placeholder.jpg",
      tip: "Aprovecha para hidratarte y recargar energías"
    };

    const updatedStops = [
      ...day.stops.slice(0, afterIndex + 1),
      breakStop,
      ...day.stops.slice(afterIndex + 1)
    ];

    const recalculated = recalculateTimings(updatedStops);
    onStopsUpdate(recalculated);
  };

  // Eliminar parada
  const handleRemoveStop = (stopId: string) => {
    if (confirm("¿Estás seguro de eliminar esta parada del itinerario?")) {
      const newStops = day.stops.filter(s => s.id !== stopId);
      const recalculated = recalculateTimings(newStops);
      onStopsUpdate(recalculated);
    }
  };

  // Calcular resumen
  const totalMin = day.stops.reduce((sum, s) => sum + s.durationMinutes, 0);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;

  const startTime = day.stops.length > 0 ? formatTime(day.stops[0].startTime) : "";
  const endTime = day.stops.length > 0
    ? formatTime(
        toHHMM(toMin(day.stops[day.stops.length - 1].startTime) +
          (day.stops[day.stops.length - 1].durationMinutes || 0))
      )
    : "";

  return (
    <motion.div 
      className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
        isOver ? 'ring-4 ring-red-400 ring-opacity-50 bg-red-50' : ''
      }`}
      animate={{
        scale: isOver ? 1.02 : 1,
      }}
    >
      {/* Encabezado del día */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg p-4 md:p-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-white">
            <h3 className="text-lg md:text-xl font-bold flex items-center">
              <CalendarDays className="w-5 h-5 mr-2" />
              {day.title}
            </h3>
            <p className="text-red-100 text-sm mt-1">
              {day.date} • {day.stops.length} actividades • {h} h {min > 0 ? `${min} min` : ""}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs md:text-sm font-medium">
            {startTime} - {endTime}
          </div>
        </div>
        
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-red-100 text-xs flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Arrastra entre días para reorganizar
          </p>
          
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
          </label>
        </div>
      </div>

      {/* Timeline del día */}
      {day.stops.length === 0 ? (
        <motion.div 
          className={`text-center py-12 px-8 border-2 border-dashed rounded-xl transition-all ${
            isOver ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        >
          <motion.div
            animate={{
              y: isOver ? -10 : 0,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CalendarDays className={`w-12 h-12 mx-auto mb-3 ${
              isOver ? 'text-red-400' : 'text-gray-400'
            }`} />
            <p className={`font-medium mb-1 ${
              isOver ? 'text-red-700' : 'text-gray-600'
            }`}>
              {isOver ? '¡Suelta aquí!' : 'No hay actividades para este día'}
            </p>
            <p className={`text-sm ${
              isOver ? 'text-red-600' : 'text-gray-500'
            }`}>
              {isOver ? 'La actividad se agregará a este día' : 'Arrastra actividades desde otros días'}
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <div className="relative pt-4 pb-8">
          <SortableContext 
            items={day.stops.map(s => `${day.id}-${s.id}`)} 
            strategy={verticalListSortingStrategy}
          >
            {day.stops.map((s, i) => {
              const breakOpp = breakOpportunities.find(o => o.afterIndex === i);
              
              return (
                <React.Fragment key={s.id}>
                  <SortableStop
                    stop={s}
                    index={i}
                    expanded={expandedId === s.id}
                    toggleExpand={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    isLast={i === day.stops.length - 1}
                    editingTime={editingTimeId === s.id}
                    editingDuration={editingDurationId === s.id}
                    onTimeEdit={() => handleTimeEdit(s.id)}
                    onDurationEdit={() => handleDurationEdit(s.id)}
                    onTimeSave={(newTime) => handleTimeSave(s.id, newTime)}
                    onDurationSave={(newDuration) => handleDurationSave(s.id, newDuration)}
                    onRemove={() => handleRemoveStop(s.id)}
                    stops={day.stops}
                    onStopsUpdate={onStopsUpdate}
                    autoAdjust={autoAdjust}
                    dayId={day.id}
                  />
                  
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

          {/* Indicador de drop cuando se está arrastrando sobre un día con contenido */}
          {isOver && canDrop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-red-100/20 rounded-xl flex items-center justify-center pointer-events-none"
            >
              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                Soltar para agregar a este día
              </div>
            </motion.div>
          )}

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
      )}
    </motion.div>
  );
}

// Componente principal con soporte para múltiples días
export default function ItineraryTimeline({ days: initialDays, onDaysUpdate, userLocation }: Props) {
  const [days, setDays] = useState<DayData[]>(initialDays);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Configurar sensores para drag & drop
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

  // Encontrar la parada activa
  const activeStop = useMemo(() => {
    if (!activeId) return null;
    
    for (const day of days) {
      const stop = day.stops.find(s => `${day.id}-${s.id}` === activeId);
      if (stop) return stop;
    }
    return null;
  }, [activeId, days]);

  // Manejar inicio del drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Manejar drag over
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id || null);
  };

  // Manejar fin del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Extraer información del drag
    const sourceDayId = activeData?.dayId;
    const sourceStop = activeData?.stop;
    const sourceIndex = activeData?.index;

    // Determinar el día destino
    let targetDayId: string;
    let targetIndex: number;

    if (overData?.type === 'stop') {
      // Soltado sobre otra parada
      targetDayId = overData.dayId;
      targetIndex = overData.index;
    } else {
      // Soltado sobre un día vacío o contenedor
      const dayIdMatch = over.id.toString().match(/^day-(.+)$/);
      if (dayIdMatch) {
        targetDayId = dayIdMatch[1];
        targetIndex = 0; // Agregar al principio si el día está vacío
      } else {
        setActiveId(null);
        setOverId(null);
        return;
      }
    }

    // Actualizar los días
    const newDays = [...days];
    const sourceDayIndex = newDays.findIndex(d => d.id === sourceDayId);
    const targetDayIndex = newDays.findIndex(d => d.id === targetDayId);

    if (sourceDayIndex === -1 || targetDayIndex === -1) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Remover de la fuente
    const [removedStop] = newDays[sourceDayIndex].stops.splice(sourceIndex, 1);

    // Si es el mismo día, ajustar el índice objetivo si es necesario
    if (sourceDayId === targetDayId && targetIndex > sourceIndex) {
      targetIndex--;
    }

    // Insertar en el destino
    newDays[targetDayIndex].stops.splice(targetIndex, 0, removedStop);

    // Recalcular tiempos para ambos días
    newDays[sourceDayIndex].stops = recalculateTimings(newDays[sourceDayIndex].stops);
    newDays[targetDayIndex].stops = recalculateTimings(newDays[targetDayIndex].stops);

    setDays(newDays);
    onDaysUpdate?.(newDays);

    setActiveId(null);
    setOverId(null);
  };

  // Actualizar stops de un día específico
  const handleDayStopsUpdate = (dayId: string, newStops: Stop[]) => {
    const newDays = days.map(day => 
      day.id === dayId ? { ...day, stops: newStops } : day
    );
    setDays(newDays);
    onDaysUpdate?.(newDays);
  };

  // Agregar nuevo destino
  const handleAddDestination = (newStop: Stop) => {
    if (!selectedDayId) return;

    const dayIndex = days.findIndex(d => d.id === selectedDayId);
    if (dayIndex === -1) return;

    const targetDay = days[dayIndex];
    const lastStop = targetDay.stops[targetDay.stops.length - 1];
    const startMin = lastStop 
      ? toMin(lastStop.startTime) + lastStop.durationMinutes + 30
      : 9 * 60;

    const stopWithTime = {
      ...newStop,
      startTime: toHHMM(startMin),
      durationMinutes: newStop.durationMinutes || 60
    };

    const newDays = [...days];
    newDays[dayIndex].stops = [...newDays[dayIndex].stops, stopWithTime];
    
    setDays(newDays);
    onDaysUpdate?.(newDays);
    setShowAddModal(false);
    setSelectedDayId(null);
  };

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Indicador de múltiples días */}
        {days.length > 1 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <CalendarDays className="w-4 h-4" />
            <span>Itinerario de {days.length} días</span>
            <span className="text-xs text-gray-500 ml-2">
              • Arrastra actividades entre días para reorganizar
            </span>
          </div>
        )}

        {/* Días del itinerario */}
        {days.map((day, index) => {
          const isDroppable = !!(overId === `day-${day.id}` || 
                            (overId && overId.toString().startsWith(`${day.id}-`)));
          
          return (
            <div key={day.id} className="relative">
              {/* Indicador de día */}
              {index > 0 && (
                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 h-px bg-gray-300" />
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
              )}

              <DayTimeline
                day={day}
                onStopsUpdate={(stops) => handleDayStopsUpdate(day.id, stops)}
                userLocation={userLocation}
                isOver={isDroppable}
                canDrop={!!activeId}
              />

              {/* Botón para agregar actividad */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDayId(day.id);
                  setShowAddModal(true);
                }}
                className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar actividad al {day.title.toLowerCase()}
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* DragOverlay para mostrar el elemento que se está arrastrando */}
      <DragOverlay>
        {activeStop ? <DragOverlayContent stop={activeStop} /> : null}
      </DragOverlay>

      {/* Modal para agregar destinos */}
      <AnimatePresence>
        {showAddModal && (
          <AddDestinationModal
            onClose={() => {
              setShowAddModal(false);
              setSelectedDayId(null);
            }}
            onAdd={handleAddDestination}
            currentStops={selectedDayId ? days.find(d => d.id === selectedDayId)?.stops || [] : []}
            userLocation={userLocation}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}