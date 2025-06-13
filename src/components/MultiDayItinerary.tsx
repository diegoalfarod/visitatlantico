// File: src/components/MultiDayItinerary.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItineraryTimeline from "./ItineraryTimeline";
import { Stop } from "./ItineraryStopCard";
import { Calendar, MapPin, Clock, Sparkles, CalendarDays } from "lucide-react";
import { toMin, toHHMM } from "@/utils/itinerary-helpers";

interface Props {
  itinerary: Stop[];
  onItineraryUpdate: (newItinerary: Stop[]) => void;
  days: number;
  userLocation?: { lat: number; lng: number } | null;
}

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

export default function MultiDayItinerary({ itinerary, onItineraryUpdate, days, userLocation }: Props) {
  // Dividir itinerario por días y crear estructura de datos para el nuevo ItineraryTimeline
  const createDaysData = () => {
    const stopsPerDay = Math.ceil(itinerary.length / days);
    const daysData = [];
    
    for (let d = 0; d < days; d++) {
      const startIdx = d * stopsPerDay;
      const endIdx = Math.min((d + 1) * stopsPerDay, itinerary.length);
      const dayStops = itinerary.slice(startIdx, endIdx);
      
      // Crear fecha para cada día (puedes ajustar esto según tu lógica)
      const date = new Date();
      date.setDate(date.getDate() + d);
      
      daysData.push({
        id: `day-${d}`,
        date: date.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        title: `Día ${d + 1}`,
        stops: dayStops
      });
    }
    
    return daysData;
  };

  const daysData = createDaysData();

  // Manejar actualizaciones del itinerario
  const handleDaysUpdate = (updatedDays: any[]) => {
    // Reconstruir el itinerario plano desde los días actualizados
    const newItinerary: Stop[] = [];
    updatedDays.forEach(day => {
      newItinerary.push(...day.stops);
    });
    onItineraryUpdate(newItinerary);
  };

  // Resumen general del viaje
  const totalStops = itinerary.length;
  const totalMinutes = itinerary.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Resumen general del viaje */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="w-6 h-6 text-white" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Resumen del Viaje</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl sm:text-4xl font-bold mb-1 text-white">{days}</p>
            <p className="text-sm text-red-100">Días de aventura</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl sm:text-4xl font-bold mb-1 text-white">{totalStops}</p>
            <p className="text-sm text-red-100">Lugares por descubrir</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl sm:text-4xl font-bold mb-1 text-white">
              {totalHours}h {totalRemainingMinutes > 0 ? `${totalRemainingMinutes}m` : ''}
            </p>
            <p className="text-sm text-red-100">Duración total</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-red-100">
          <Sparkles className="w-4 h-4 text-white" />
          <p>Arrastra las actividades entre días para personalizar tu aventura</p>
        </div>
      </motion.div>

      {/* Renderizar el nuevo ItineraryTimeline con soporte multi-día */}
      <ItineraryTimeline
        days={daysData}
        onDaysUpdate={handleDaysUpdate}
        userLocation={userLocation}
      />

      {/* Estadísticas por día */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 rounded-2xl p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por día</h3>
        <div className="space-y-3">
          {daysData.map((day, index) => {
            const dayMinutes = day.stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
            const dayHours = Math.floor(dayMinutes / 60);
            const dayRemainingMinutes = dayMinutes % 60;
            
            return (
              <div key={day.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                    ${index === 0 ? 'bg-red-600' : index === 1 ? 'bg-blue-600' : 'bg-green-600'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{day.title}</p>
                    <p className="text-sm text-gray-500">{day.stops.length} actividades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {dayHours}h {dayRemainingMinutes > 0 ? `${dayRemainingMinutes}m` : ''}
                  </p>
                  <p className="text-sm text-gray-500">duración</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tips finales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-amber-800 mb-3">💡 Tips para tu viaje</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• Puedes reorganizar las actividades arrastrándolas entre días</li>
          <li>• Haz clic en los horarios para editarlos según tus preferencias</li>
          <li>• Las duraciones también son editables para ajustar tu itinerario</li>
          <li>• El sistema agregará sugerencias de descanso cuando sea necesario</li>
        </ul>
      </motion.div>
    </div>
  );
}