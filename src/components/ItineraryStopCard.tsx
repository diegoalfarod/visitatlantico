"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Info,
  Camera,
  Utensils,
  Star,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  startTime: string;
  durationMinutes: number;
  description: string;
  category: string;
  distance: number;
  municipality: string;
  tip?: string;
  imageUrl?: string;
  type: "destination" | "experience";
  rating?: number;
  cost?: string;
  amenities?: string[];
  photos?: string[];
}

interface Props {
  stop: Stop;
}

export default function ItineraryStopCard({ stop }: Props) {
  const [showTip, setShowTip] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;

  const getCategoryIcon = (category?: string) => {
    if (!category) return <Star className="w-4 h-4" />;

    switch (category.toLowerCase()) {
      case "gastronomía":
      case "restaurante":
      case "comida":
        return <Utensils className="w-4 h-4" />;
      case "fotografía":
      case "paisaje":
        return <Camera className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const photos = stop.photos || [stop.imageUrl || "/placeholder.jpg"];

  return (
    <div className="p-6">
      {/* Gallery */}
      <div className="relative mb-6 overflow-hidden rounded-2xl aspect-video w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhotoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {stop.imageUrl ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${photos[activePhotoIndex]})` }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setActivePhotoIndex(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  index === activePhotoIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        <span
          className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold text-white rounded-full 
            ${stop.type === "destination" ? "bg-blue-600" : "bg-green-500"} shadow-md backdrop-blur-sm bg-opacity-90`}
        >
          {stop.type === "destination" ? "Destino" : "Experiencia"}
        </span>

        <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-md flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {stop.startTime}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold">{stop.name}</h3>

          {stop.rating && (
            <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-medium">
              <Star className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-500" />
              {stop.rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          {stop.municipality && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="truncate">{stop.municipality}</span>
            </span>
          )}

          {stop.distance && (
            <>
              <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></div>
              <span className="flex-shrink-0">{Math.round(stop.distance)} km</span>
            </>
          )}

          {stop.cost && (
            <>
              <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></div>
              <span>{stop.cost}</span>
            </>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed">{stop.description}</p>

        <div className="flex flex-wrap gap-2">
          {stop.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {getCategoryIcon(stop.category)}
              {stop.category}
            </span>
          )}

          {stop.amenities?.map((amenity, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {amenity}
            </span>
          ))}
        </div>

        {stop.tip && (
          <motion.div layout className="mt-4 rounded-xl overflow-hidden border border-amber-200">
            <button
              onClick={() => setShowTip(!showTip)}
              className="w-full flex items-center justify-between p-3 text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              <span className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-600" />
                Consejo del local
              </span>
              <ChevronRight
                className={`w-5 h-5 text-amber-500 transition-transform ${showTip ? "rotate-90" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white"
                >
                  <p className="p-4 text-sm text-gray-700 border-t border-amber-100">
                    {stop.tip}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
          >
            <MapPin className="w-5 h-5 text-red-600" />
            Cómo llegar
          </a>

          <a
            href={`/${stop.type === "destination" ? "destinations" : "experiences"}/${stop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition shadow-sm"
          >
            <ExternalLink className="w-5 h-5" />
            Más información
          </a>
        </div>
      </div>
    </div>
  );
}
