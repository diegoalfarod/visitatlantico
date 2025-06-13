// File: src/components/ItineraryTimeline.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useSwipeable } from "react-swipeable";
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
  ArrowUp,
  ArrowDown,
  Move,
  Hand,
} from "lucide-react";
import Image from "next/image";

// Importaciones de @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
  readOnly?: boolean; // Agregar esta línea
}

// Hook para detectar si es móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      );
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Hook para haptic feedback
const useHapticFeedback = () => {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return { vibrate };
};

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

// Componente de tabs móviles con swipe
const MobileDayTabs = ({ 
  days, 
  activeDay, 
  onDayChange 
}: { 
  days: DayData[]; 
  activeDay: number; 
  onDayChange: (day: number) => void;
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsWidth, setTabsWidth] = useState<number[]>([]);
  const { vibrate } = useHapticFeedback();

  useEffect(() => {
    if (tabsRef.current) {
      const widths = Array.from(tabsRef.current.children).map(
        (child) => (child as HTMLElement).offsetWidth
      );
      setTabsWidth(widths);
    }
  }, [days]);

  const underlinePosition = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < activeDay; i++) {
      offset += tabsWidth[i] || 0;
    }
    return offset;
  }, [activeDay, tabsWidth]);

  const underlineWidth = tabsWidth[activeDay] || 0;

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="relative">
        <div 
          ref={tabsRef}
          className="flex items-center overflow-x-auto scrollbar-hide"
        >
          {days.map((day, index) => (
            <motion.button
              key={day.id}
              onClick={() => {
                onDayChange(index);
                vibrate(10);
              }}
              className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeDay === index 
                  ? 'text-red-600 font-semibold' 
                  : 'text-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">Día {index + 1}</span>
              {day.stops.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeDay === index 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {day.stops.length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-red-600"
          animate={{
            x: underlinePosition,
            width: underlineWidth,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
      </div>
      
      {/* Dots indicator for many days */}
      {days.length > 3 && (
        <div className="flex justify-center gap-1 py-2 bg-gray-50">
          {days.map((_, index) => (
            <motion.div
              key={index}
              className="w-1.5 h-1.5 rounded-full"
              animate={{
                backgroundColor: activeDay === index ? '#dc2626' : '#e5e7eb',
                scale: activeDay === index ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de editor de tiempo para móvil (modal fullscreen)
const MobileTimeEditor = ({ 
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
  const { vibrate } = useHapticFeedback();
  const [error, setError] = useState("");

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const adjustTime = (minutes: number) => {
    const currentMinutes = toMin(value);
    const newMinutes = currentMinutes + minutes;
    const newTime = toHHMM(newMinutes);
    setValue(newTime);
    vibrate(10);
    validate(newTime);
  };

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
    if (!error && validate(value)) {
      onSave(value);
      vibrate(20);
    }
  };

  const suggestedTimes = [
    { label: "Mañana", time: "09:00" },
    { label: "Mediodía", time: "12:00" },
    { label: "Tarde", time: "15:00" },
    { label: "Atardecer", time: "18:00" }
  ];

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="bg-white w-full rounded-t-3xl shadow-xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Hora de inicio</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{stopName}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Time display con ajustes */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustTime(-15)}
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl font-medium text-gray-700">−</span>
              </motion.button>

              <div className="text-center">
                <input
                  type="time"
                  value={value}
                  onChange={handleChange}
                  className="text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none text-center"
                  style={{ width: "150px" }}
                />
                <p className="text-xs text-gray-500 mt-1">15 min</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustTime(15)}
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl font-medium text-gray-700">+</span>
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Sugerencias rápidas */}
          {isFirstStop && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Horarios sugeridos</p>
              <div className="grid grid-cols-2 gap-3">
                {suggestedTimes.map((suggestion) => (
                  <motion.button
                    key={suggestion.time}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setValue(suggestion.time);
                      vibrate(10);
                      validate(suggestion.time);
                    }}
                    className={`p-4 rounded-xl font-medium transition-all ${
                      value === suggestion.time
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-sm">{suggestion.label}</div>
                    <div className="text-xs opacity-75 mt-1">{formatTime(suggestion.time)}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Restricciones */}
          {(minTime || maxTime) && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                {minTime && maxTime && (
                  <>Horario disponible: {formatTime(minTime)} - {formatTime(maxTime)}</>
                )}
                {minTime && !maxTime && (
                  <>Después de {formatTime(minTime)}</>
                )}
                {!minTime && maxTime && (
                  <>Antes de {formatTime(maxTime)}</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!!error}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-colors ${
              error
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Guardar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Renderizar con portal para evitar problemas de z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
};

// Componente de editor de duración para móvil (modal fullscreen)
const MobileDurationEditor = ({
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
  const [value, setValue] = useState(duration);
  const { vibrate } = useHapticFeedback();

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300];
  const presets = [
    { label: "30 min", value: 30 },
    { label: "1 hora", value: 60 },
    { label: "2 horas", value: 120 },
    { label: "Media jornada", value: 240 }
  ];

  const handleSave = () => {
    onSave(value);
    vibrate(20);
  };

  const handlePresetClick = (presetValue: number) => {
    setValue(presetValue);
    vibrate(10);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="bg-white w-full rounded-t-3xl shadow-xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Duración de la actividad</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{stopName}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Valor actual */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {formatDuration(value)}
            </div>
          </div>

          {/* Presets rápidos */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Duraciones comunes</p>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`p-4 rounded-xl font-medium transition-all ${
                    value === preset.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selector de duración */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">O elige una duración específica</p>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <motion.button
                  key={option}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setValue(option);
                    vibrate(10);
                  }}
                  className={`p-3 rounded-lg font-medium text-sm transition-all ${
                    value === option
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {formatDuration(option)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex-1 py-4 px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Guardar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Renderizar con portal para evitar problemas de z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
};

// Componente de editor de duración inline (desktop)
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
  const [error, setError] = useState<string>("");

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

// Componente de edición de horario inline (desktop)
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

// Componente de tutorial móvil
const MobileTutorial = ({ onDismiss }: { onDismiss: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hand className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold mb-3">Cómo navegar entre días</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">1</span>
              </div>
              <p className="text-left">
                Desliza horizontalmente para cambiar de día
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">2</span>
              </div>
              <p className="text-left">
                O toca los tabs en la parte superior
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">3</span>
              </div>
              <p className="text-left">
                Mantén presionada una tarjeta para reorganizar actividades
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="mt-6 w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente ActionSheet para móvil
const MobileActionSheet = ({
  stop,
  onClose,
  onRemove,
  onTimeEdit,
  onDurationEdit,
  mapsUrl,
  detailsUrl
}: {
  stop: Stop;
  onClose: () => void;
  onRemove: () => void;
  onTimeEdit: () => void;
  onDurationEdit: () => void;
  mapsUrl: string;
  detailsUrl: string;
}) => {
  const { vibrate } = useHapticFeedback();

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="bg-white w-full rounded-t-3xl shadow-xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 text-center">{stop.name}</h3>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onTimeEdit();
              vibrate(10);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Editar hora de inicio</p>
              <p className="text-sm text-gray-500">{formatTime(stop.startTime)}</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onDurationEdit();
              vibrate(10);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Editar duración</p>
              <p className="text-sm text-gray-500">{stop.durationMinutes} minutos</p>
            </div>
          </motion.button>

          <motion.a
            whileTap={{ scale: 0.98 }}
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => vibrate(10)}
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Cómo llegar</p>
              <p className="text-sm text-gray-500">Abrir en Google Maps</p>
            </div>
          </motion.a>

          <motion.a
            whileTap={{ scale: 0.98 }}
            href={detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => vibrate(10)}
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver detalles completos</p>
              <p className="text-sm text-gray-500">Más información del lugar</p>
            </div>
          </motion.a>

          <div className="h-px bg-gray-200 my-2" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onRemove();
              vibrate(20);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-red-600">Eliminar del itinerario</p>
              <p className="text-sm text-red-500">Esta acción no se puede deshacer</p>
            </div>
          </motion.button>
        </div>

        {/* Cancel button */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Renderizar con portal para evitar problemas de z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
};

// Componente Sortable mejorado con soporte para móviles
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
  isDragging: parentIsDragging,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isMobile
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
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isMobile?: boolean;
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
  const [showActionSheet, setShowActionSheet] = useState(false);
  const photos = stop.photos || (stop.imageUrl ? [stop.imageUrl] : []);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;
  const detailsUrl = `/${stop.type === "destination" ? "destinations" : "experiences"}/${stop.id}`;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const { vibrate } = useHapticFeedback();

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

  // Manejo de long press para móviles
  const handleTouchStart = () => {
    if (!isMobile) return;
    
    longPressTimer.current = setTimeout(() => {
      vibrate(50);
      setIsLongPressed(true);
    }, 500) as unknown as NodeJS.Timeout;
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
  }, []);

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${isDragging ? 'z-50' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isDragging ? 1.05 : 1
      }}
      transition={{ duration: 0.3 }}
    >
      {!isLast && (
        <div className={`absolute left-4 top-12 bottom-0 w-0.5 ${c.secondary}`} />
      )}

      <div className={`relative z-10 mb-6 ${isDragging ? 'drop-shadow-2xl' : ''}`}>
        {/* hora + duración con edición - Desktop only */}
        {!isMobile && (
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
            
            {/* Acciones Desktop */}
            <div className="ml-auto flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                title="Eliminar del itinerario"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
              
              <motion.div 
                {...attributes} 
                {...listeners}
                className="p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:bg-gray-100 hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Arrastra para reordenar o mover a otro día"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Mobile Timeline indicator */}
        {isMobile && (
          <div className="flex items-center mb-2">
            <motion.div 
              className={`w-8 h-8 ${c.primary} rounded-full flex items-center justify-center shadow-md`}
            >
              <Clock className="w-4 h-4 text-white" />
            </motion.div>
            <div className="ml-3 flex items-center gap-2">
              <span className={`${c.text} font-semibold text-sm`}>
                {formatTime(stop.startTime)}
              </span>
              <span className="text-gray-500 text-xs">
                · {stop.durationMinutes} min
              </span>
            </div>
          </div>
        )}

        {/* tarjeta mejorada */}
        <motion.div 
          className={`${isMobile ? 'ml-10' : 'ml-10'} rounded-2xl shadow-lg border ${c.border} bg-white overflow-hidden relative transition-all ${
            isDragging ? 'shadow-2xl ring-4 ring-gray-300 ring-opacity-50' : ''
          } ${
            isReorderMode || isLongPressed ? 'ring-2 ring-red-400' : ''
          }`}
          animate={{
            scale: isDragging ? 1.05 : 1,
            opacity: isDragging ? 0.9 : 1,
          }}
          whileHover={{ scale: isDragging ? 1.05 : (isMobile ? 1 : 1.02) }}
          transition={{ type: "spring", stiffness: 300 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="cursor-pointer" onClick={toggleExpand}>
            {/* Vista colapsada */}
            {!expanded && (
              <>
                {/* Desktop view */}
                {!isMobile && (
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

                {/* Mobile view - vertical layout */}
                {isMobile && (
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail pequeño */}
                      {stop.imageUrl && (
                        <div
                          className="w-[60px] h-[60px] rounded-lg bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${stop.imageUrl})` }}
                        />
                      )}
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                          {stop.name}
                        </h3>
                        
                        {stop.municipality && (
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {stop.municipality}
                            {stop.distance && (
                              <span className="ml-2">· {Math.round(stop.distance)} km</span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.light} ${c.text}`}
                          >
                            {stop.type === "destination" ? "Destino" : "Experiencia"}
                          </span>
                          {stop.category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                              {getCategoryIcon(stop.category)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions button for mobile */}
                      <div className="flex items-start gap-1">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionSheet(true);
                            vibrate(10);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </motion.button>
                        
                        <motion.div 
                          {...attributes} 
                          {...listeners}
                          className="p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all touch-manipulation hover:bg-gray-100"
                          onDragStart={() => vibrate(20)}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vista expandida - Header */}
            {expanded && (
              <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">
                    {stop.name}
                  </h3>
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-3">
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

          {/* Botones de reordenamiento móvil */}
          {(isReorderMode || isLongPressed) && isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-lg p-1 border border-gray-200"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onMoveUp?.();
                  vibrate(20);
                  setIsLongPressed(false);
                }}
                disabled={!canMoveUp}
                className={`p-3 rounded-full transition-colors ${
                  canMoveUp 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onMoveDown?.();
                  vibrate(20);
                  setIsLongPressed(false);
                }}
                disabled={!canMoveDown}
                className={`p-3 rounded-full transition-colors ${
                  canMoveDown 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ArrowDown className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLongPressed(false)}
                className="p-3 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* contenido expandido */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* galería - Mobile: fullwidth */}
                {photos.length > 0 && (
                  <div className={`relative aspect-video ${isMobile ? 'w-full' : 'w-full'} overflow-hidden`}>
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
                <div className={`${isMobile ? 'p-4' : 'p-5'} space-y-4`}>
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
                      href={detailsUrl}
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

      {/* Mobile Action Sheet */}
      {isMobile && (
        <AnimatePresence>
          {(showActionSheet || editingTime || editingDuration) && (
            <>
              {showActionSheet && (
                <MobileActionSheet
                  stop={stop}
                  onClose={() => setShowActionSheet(false)}
                  onRemove={onRemove}
                  onTimeEdit={onTimeEdit}
                  onDurationEdit={onDurationEdit}
                  mapsUrl={mapsUrl}
                  detailsUrl={detailsUrl}
                />
              )}
              {editingTime && (
                <MobileTimeEditor
                  time={stop.startTime}
                  onSave={onTimeSave}
                  onCancel={onTimeEdit}
                  minTime={minTime}
                  maxTime={maxTime}
                  stopName={stop.name}
                  isFirstStop={index === 0}
                />
              )}
              {editingDuration && (
                <MobileDurationEditor
                  duration={stop.durationMinutes}
                  onSave={onDurationSave}
                  onCancel={onDurationEdit}
                  stopName={stop.name}
                />
              )}
            </>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// Componente DragOverlay mejorado para móviles
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
    <div className="w-96 opacity-95">
      <motion.div 
        className={`rounded-2xl shadow-2xl border-2 ${c.border} bg-white overflow-hidden`}
        animate={{
          rotate: 3,
          scale: 1.05
        }}
        transition={{
          type: "spring",
          stiffness: 300
        }}
      >
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
      </motion.div>
    </div>
  );
}

// Componente de día individual con soporte móvil mejorado
function DayTimeline({ 
  day,
  onStopsUpdate,
  userLocation,
  isOver,
  canDrop,
  isMobile,
  isReorderMode
}: {
  day: DayData;
  onStopsUpdate: (stops: Stop[]) => void;
  userLocation?: { lat: number; lng: number } | null;
  isOver?: boolean;
  canDrop?: boolean;
  isMobile?: boolean;
  isReorderMode?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [breakOpportunities, setBreakOpportunities] = useState<{ afterIndex: number; duration: number; suggestedTime: string }[]>([]);
  const [dismissedBreaks, setDismissedBreaks] = useState<Set<number>>(new Set());
  const { vibrate } = useHapticFeedback();

  // Detectar oportunidades de descanso
  React.useEffect(() => {
    const opportunities = detectBreakOpportunities(day.stops);
    setBreakOpportunities(opportunities.filter(o => !dismissedBreaks.has(o.afterIndex)));
  }, [day.stops, dismissedBreaks]);

  // Manejar movimiento con botones (móvil)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStops = [...day.stops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    const recalculated = recalculateTimings(newStops);
    onStopsUpdate(recalculated);
    vibrate(20);
  };

  const handleMoveDown = (index: number) => {
    if (index === day.stops.length - 1) return;
    const newStops = [...day.stops];
    [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    const recalculated = recalculateTimings(newStops);
    onStopsUpdate(recalculated);
    vibrate(20);
  };

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
          {isMobile ? (
            <p className="text-red-100 text-xs flex items-center gap-1">
              <Hand className="w-3 h-3" />
              Mantén presionado para reordenar
            </p>
          ) : (
            <p className="text-red-100 text-xs flex items-center gap-1">
              <GripVertical className="w-3 h-3" />
              Arrastra entre días para reorganizar
            </p>
          )}
          
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
                    isReorderMode={isReorderMode}
                    onMoveUp={() => handleMoveUp(i)}
                    onMoveDown={() => handleMoveDown(i)}
                    canMoveUp={i > 0}
                    canMoveDown={i < day.stops.length - 1}
                    isMobile={isMobile}
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

// Componente principal con soporte para múltiples días y móviles
export default function ItineraryTimeline({ days: initialDays = [], onDaysUpdate, userLocation, readOnly = false }: Props) {  const [days, setDays] = useState<DayData[]>(initialDays);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showMobileTutorial, setShowMobileTutorial] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const isMobile = useIsMobile();
  const { vibrate } = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);

  // Mostrar tutorial móvil la primera vez
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      const hasSeenTutorial = localStorage.getItem('hasSeenMobileSwipeTutorial');
      if (!hasSeenTutorial && days.length > 1) {
        setShowMobileTutorial(true);
      }
    }
  }, [isMobile, days]);

  const dismissTutorial = () => {
    setShowMobileTutorial(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenMobileSwipeTutorial', 'true');
    }
  };

  // Configurar swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeDay < days.length - 1) {
        setActiveDay(activeDay + 1);
        vibrate(10);
      }
    },
    onSwipedRight: () => {
      if (activeDay > 0) {
        setActiveDay(activeDay - 1);
        vibrate(10);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  // Configurar sensores para drag & drop con soporte móvil mejorado
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 5 : 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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
    vibrate(50);
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
      vibrate(20);
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
    vibrate(50);

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Tutorial móvil */}
        <AnimatePresence>
          {showMobileTutorial && (
            <MobileTutorial onDismiss={dismissTutorial} />
          )}
        </AnimatePresence>

        {/* Layout móvil con tabs y swipe */}
        {isMobile && days.length > 1 ? (
          <div>
            {/* Tabs móviles sticky */}
            <MobileDayTabs
              days={days}
              activeDay={activeDay}
              onDayChange={setActiveDay}
            />

            {/* Contenedor swipeable */}
            <div 
              
              {...swipeHandlers}
              className="relative overflow-hidden"
            >
              <motion.div
                className="flex"
                animate={{
                  x: `-${activeDay * 100}%`
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {days.map((day, index) => (
                  <div
                    key={day.id}
                    className="w-full flex-shrink-0 px-4 py-6"
                  >
                    <DayTimeline
                      day={day}
                      onStopsUpdate={(stops) => handleDayStopsUpdate(day.id, stops)}
                      userLocation={userLocation}
                      isOver={false}
                      canDrop={false}
                      isMobile={true}
                      isReorderMode={isReorderMode}
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
                      Agregar actividad
                    </motion.button>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        ) : (
          // Layout desktop o móvil con 1 solo día
          <>
            {/* Indicador de múltiples días con modo reordenamiento móvil */}
            {days.length > 1 && (
              <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Itinerario de {days.length} días</span>
                  {!isMobile && (
                    <span className="text-xs text-gray-500 ml-2">
                      • Arrastra actividades entre días para reorganizar
                    </span>
                  )}
                </div>
                {isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsReorderMode(!isReorderMode);
                      vibrate(20);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isReorderMode 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isReorderMode ? (
                      <>
                        <X className="w-3 h-3 inline mr-1" />
                        Salir
                      </>
                    ) : (
                      <>
                        <Move className="w-3 h-3 inline mr-1" />
                        Reordenar
                      </>
                    )}
                  </motion.button>
                )}
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
                    isMobile={isMobile}
                    isReorderMode={isReorderMode}
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
          </>
        )}
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