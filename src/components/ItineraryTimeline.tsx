"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItineraryStopCard, { Stop } from "./ItineraryStopCard";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  stops: Stop[];
}

export default function ItineraryTimeline({ stops }: Props) {
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  // Group stops by category for filtering
  const categories = Array.from(new Set(stops.map(stop => stop.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredStops = activeCategory 
    ? stops.filter(stop => stop.category === activeCategory)
    : stops;

  // Calculate total duration for this timeline
  const totalDuration = filteredStops.reduce((acc, stop) => acc + stop.durationMinutes, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMinutes = totalDuration % 60;

  return (
    <div className="relative">
      {/* Timeline summary */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Aventura del día</h3>
            <p className="text-red-100">
              {filteredStops.length} paradas • {totalHours}h {totalMinutes}min
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {filteredStops[0]?.startTime} - {filteredStops[filteredStops.length-1]?.startTime}
            </span>
            <div className="h-6 w-px bg-red-400/50"></div>
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Actividades: {filteredStops.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === null 
                ? "bg-red-600 text-white shadow-lg" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Todas
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === category 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Main timeline */}
      <div className="relative pt-8 pb-12">
        {/* Vertical timeline line with gradient */}
        <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-red-500 via-red-600 to-red-800 rounded-full" />

        {/* Timeline stops */}
        <div className="space-y-32">
          {filteredStops.map((stop, i) => {
            const isExpanded = expandedStop === stop.id;
            const isRight = i % 2 === 1;
            
            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: isRight ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex w-full ${
                  isRight ? "justify-end" : "justify-start"
                }`}
              >
                {/* Timeline time indicator with connector line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-8 z-10 flex flex-col items-center">
                  <div className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    {stop.startTime}
                  </div>
                  <div className="h-8 w-px bg-red-300 mt-1"></div>
                </div>

                {/* Card container - different width based on expanded state */}
                <motion.div 
                  layout
                  className={`relative max-w-lg ${isRight ? 'ml-12' : 'mr-12'} mt-16`}
                  style={{ width: isExpanded ? '100%' : '80%' }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                    {/* Badge del tipo */}
                    <div className="absolute top-0 right-0">
                      <div className={`${stop.type === 'destination' ? 'bg-blue-600' : 'bg-green-500'} text-white text-xs font-semibold px-3 py-1 rounded-bl-lg`}>
                        {stop.type === 'destination' ? 'Destino' : 'Experiencia'}
                      </div>
                    </div>
                    {/* Interactive card header */}
                    <motion.div 
                      layout="position"
                      onClick={() => setExpandedStop(isExpanded ? null : stop.id)}
                      className="flex items-start cursor-pointer bg-gradient-to-r from-gray-50 to-white border-b relative"
                    >
                      {/* Contenido principal con título */}
                      <div className="flex items-start gap-3 p-5 flex-1 min-w-0">
                        <div className={`w-3 h-12 rounded-full flex-shrink-0 ${stop.type === 'destination' ? 'bg-blue-600' : 'bg-green-500'}`} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold leading-tight line-clamp-4">{stop.name}</h3>
                          <p className="text-sm text-gray-500 mt-2 truncate">{stop.municipality || "Ubicación desconocida"}</p>
                        </div>
                      </div>
                      
                      {/* Panel lateral con duración y controles */}
                      <div className="flex flex-col justify-between items-end p-4 bg-gray-50 border-l border-gray-100 h-full">
                        <span className="text-sm bg-white px-2.5 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-red-600" /> {stop.durationMinutes} min
                        </span>
                        <div className="mt-2">
                          {isExpanded ? 
                            <ChevronUp className="text-gray-400 w-5 h-5" /> : 
                            <ChevronDown className="text-gray-400 w-5 h-5" />
                          }
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Expandable content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key={`expanded-${stop.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ItineraryStopCard stop={stop} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* End of timeline marker */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative flex justify-center mt-8"
      >
        <p className="text-sm font-medium text-gray-600">Fin del día</p>
      </motion.div>
    </div>
  );
}