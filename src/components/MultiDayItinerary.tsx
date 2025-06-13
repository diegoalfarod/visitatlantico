// File: src/components/MultiDayItinerary.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragOverEvent,
  rectIntersection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import ItineraryTimeline from "./ItineraryTimeline";
import { Stop } from "./ItineraryStopCard";
import { Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { toMin, toHHMM } from "@/utils/itinerary-helpers";

interface Props {
  itinerary: Stop[];
  onItineraryUpdate: (newItinerary: Stop[]) => void;
  days: number;
  userLocation?: { lat: number; lng: number } | null;
}

// Custom drop animation para un efecto más suave
const dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

// Componente para cada día (droppable)
const DayDropZone = ({ 
  dayId, 
  day, 
  children, 
  isOver,
  activeId
}: { 
  dayId: string; 
  day: number; 
  children: React.ReactNode;
  isOver: boolean;
  activeId: UniqueIdentifier | null;
}) => {
  const { setNodeRef, isOver: dropIsOver } = useDroppable({
    id: dayId,
  });

  const showDropIndicator = isOver || dropIsOver;

  return (
    <motion.section
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (day - 1) * 0.1 }}
      className={`bg-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 sm:space-y-6 relative transition-all ${
        showDropIndicator && activeId ? 'ring-4 ring-red-400 ring-opacity-50 shadow-xl' : ''
      }`}
    >
      {/* Indicador de drop */}
      <AnimatePresence>
        {showDropIndicator && activeId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-red-50 bg-opacity-50 rounded-3xl pointer-events-none z-10 flex items-center justify-center"
          >
            <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Soltar aquí para mover al Día {day}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </motion.section>
  );
};

// Componente flotante mejorado para drag
const DraggableStopOverlay = ({ stop }: { stop: Stop }) => {
  const colors = {
    destination: {
      primary: "bg-blue-600",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    experience: {
      primary: "bg-green-600",
      light: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
  } as const;

  const c = colors[stop.type];

  return (
    <div className="relative cursor-grabbing">
      <motion.div 
        className={`rounded-2xl shadow-2xl border-2 ${c.border} bg-white overflow-hidden transform rotate-3 scale-105 max-w-sm`}
        animate={{ 
          rotate: [3, -3, 3], 
          scale: [1.05, 1.08, 1.05] 
        }}
        transition={{ 
          duration: 0.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="flex">
          {stop.imageUrl && (
            <div
              className="w-24 h-24 bg-cover bg-center flex-shrink-0 opacity-90"
              style={{ backgroundImage: `url(${stop.imageUrl})` }}
            />
          )}
          <div className="flex-1 p-4 min-w-0">
            <h3 className="font-bold text-gray-800 pr-2 line-clamp-1">
              {stop.name}
            </h3>
            <div className="mt-1 flex items-center text-xs text-gray-500 gap-3">
              {stop.municipality && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {stop.municipality}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {stop.durationMinutes} min
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.light} ${c.text}`}
              >
                {stop.type === "destination" ? "Destino" : "Experiencia"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Efecto de sombra adicional */}
      <div className="absolute inset-0 bg-black/20 rounded-2xl blur-xl -z-10 transform translate-y-4" />
    </div>
  );
};

// Resumen del día
const DaySummaryCard = ({ day, stops }: { day: number; stops: Stop[] }) => {
  const totalMinutes = stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const categories = Array.from(new Set(stops.map(s => s.category || "General")));
  
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-xl sm:text-2xl font-bold">Día {day}</h3>
        <div className="flex gap-1 sm:gap-2">
          {stops.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full opacity-70"
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-bold">{stops.length}</p>
          <p className="text-xs sm:text-sm opacity-90">Lugares</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold">{totalHours}h {minutes > 0 ? `${minutes}m` : ''}</p>
          <p className="text-xs sm:text-sm opacity-90">Duración</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold">{categories.length}</p>
          <p className="text-xs sm:text-sm opacity-90">Categorías</p>
        </div>
      </div>
    </div>
  );
};

// Función para recalcular horarios
const recalculateTimings = (stops: Stop[], startTime: string = "09:00"): Stop[] => {
  if (stops.length === 0) return stops;
  
  let current = toMin(startTime);
  
  return stops.map((stop, idx) => {
    if (idx > 0) {
      // Agregar 30 minutos de viaje entre paradas
      current += 30;
    }
    
    const newStartTime = toHHMM(current);
    current += stop.durationMinutes;
    
    return { ...stop, startTime: newStartTime };
  });
};

export default function MultiDayItinerary({ itinerary, onItineraryUpdate, days, userLocation }: Props) {
  // Estado para tracking de drag
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  // Dividir itinerario por días
  const stopsPerDay = Math.ceil(itinerary.length / days);
  const dayItineraries: Record<string, Stop[]> = {};
  
  for (let d = 0; d < days; d++) {
    const dayId = `day-${d}`;
    const startIdx = d * stopsPerDay;
    const endIdx = Math.min((d + 1) * stopsPerDay, itinerary.length);
    dayItineraries[dayId] = itinerary.slice(startIdx, endIdx);
  }

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

  // Encontrar en qué día está un stop
  const findStopDay = (stopId: string): string | null => {
    for (const [dayId, stops] of Object.entries(dayItineraries)) {
      if (stops.find(s => s.id === stopId)) {
        return dayId;
      }
    }
    return null;
  };

  // Encontrar el stop activo
  const activeStop = activeId 
    ? itinerary.find(s => s.id === activeId) 
    : null;

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
    const dayId = findStopDay(active.id as string);
    setActiveDayId(dayId);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (!over) {
      setOverId(null);
      return;
    }

    // Detectar si está sobre un día diferente
    const overIdStr = over.id as string;
    if (overIdStr.startsWith('day-')) {
      setOverId(overIdStr);
    } else {
      // Si está sobre un stop, encontrar su día
      const overDay = findStopDay(overIdStr);
      setOverId(overDay);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveDayId(null);
    setOverId(null);

    if (!over) return;

    const activeStopId = active.id as string;
    const overId = over.id as string;
    
    // Encontrar los días de origen y destino
    const sourceDayId = findStopDay(activeStopId);
    if (!sourceDayId) return;

    let targetDayId: string | null = null;
    let targetStopId: string | null = null;

    if (overId.startsWith('day-')) {
      // Soltó directamente sobre un día
      targetDayId = overId;
    } else {
      // Soltó sobre otro stop
      targetDayId = findStopDay(overId);
      targetStopId = overId;
    }

    if (!targetDayId) return;

    // Si es el mismo día, solo reordenar
    if (sourceDayId === targetDayId && targetStopId) {
      const dayStops = [...dayItineraries[sourceDayId]];
      const oldIndex = dayStops.findIndex(s => s.id === activeStopId);
      const newIndex = dayStops.findIndex(s => s.id === targetStopId);
      
      if (oldIndex !== newIndex) {
        const reorderedStops = arrayMove(dayStops, oldIndex, newIndex);
        const recalculatedStops = recalculateTimings(reorderedStops);
        
        // Reconstruir el itinerario completo
        const newItinerary: Stop[] = [];
        for (let d = 0; d < days; d++) {
          const dayId = `day-${d}`;
          if (dayId === sourceDayId) {
            newItinerary.push(...recalculatedStops);
          } else {
            newItinerary.push(...dayItineraries[dayId]);
          }
        }
        
        onItineraryUpdate(newItinerary);
      }
    } else if (sourceDayId !== targetDayId) {
      // Mover entre días diferentes
      const sourceStops = [...dayItineraries[sourceDayId]];
      const targetStops = [...dayItineraries[targetDayId]];
      
      // Encontrar y remover el stop del día origen
      const stopIndex = sourceStops.findIndex(s => s.id === activeStopId);
      if (stopIndex === -1) return;
      
      const [movedStop] = sourceStops.splice(stopIndex, 1);
      
      // Insertar en el día destino
      if (targetStopId) {
        // Insertar en una posición específica
        const targetIndex = targetStops.findIndex(s => s.id === targetStopId);
        targetStops.splice(targetIndex + 1, 0, movedStop);
      } else {
        // Agregar al final del día
        targetStops.push(movedStop);
      }
      
      // Recalcular tiempos para ambos días
      const recalculatedSource = recalculateTimings(sourceStops);
      const recalculatedTarget = recalculateTimings(targetStops);
      
      // Reconstruir el itinerario completo
      const newItinerary: Stop[] = [];
      for (let d = 0; d < days; d++) {
        const dayId = `day-${d}`;
        if (dayId === sourceDayId) {
          newItinerary.push(...recalculatedSource);
        } else if (dayId === targetDayId) {
          newItinerary.push(...recalculatedTarget);
        } else {
          newItinerary.push(...dayItineraries[dayId]);
        }
      }
      
      onItineraryUpdate(newItinerary);
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 sm:space-y-10">
        {Array.from({ length: days }).map((_, d) => {
          const dayId = `day-${d}`;
          const dayStops = dayItineraries[dayId] || [];
          
          return (
            <DayDropZone
              key={dayId}
              dayId={dayId}
              day={d + 1}
              isOver={overId === dayId}
              activeId={activeId}
            >
              <DaySummaryCard day={d + 1} stops={dayStops} />
              <ItineraryTimeline 
                stops={dayStops} 
                userLocation={userLocation}
                dayId={dayId}
                onStopsReorder={(newStops) => {
                  // Este callback ahora solo se usa para cambios internos del día
                  // que son manejados por el DragEnd global
                }}
              />
            </DayDropZone>
          );
        })}
      </div>
      
      {/* DragOverlay para mostrar el elemento flotante */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId && activeStop ? (
          <DraggableStopOverlay stop={activeStop} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}