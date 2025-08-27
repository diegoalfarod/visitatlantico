// src/components/ItineraryStopCard.tsx
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
  CheckCircle,
  Globe,
  Phone,
  Calendar,
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
  categories?: string[];
  distance: number;
  municipality: string;
  tip?: string;
  imageUrl?: string;
  imagePath?: string;
  imagePaths?: string[];
  type: "destination" | "experience";
  rating?: number;
  cost?: string;
  amenities?: string[];
  address?: string;
  website?: string;
  phone?: string;
  openingTime?: string;
  enrichedFromFirebase?: boolean;
  tagline?: string;
}

interface Props {
  stop: Stop;
  index?: number;
}

export default function ItineraryStopCard({ stop, index = 0 }: Props) {
  const [showTip, setShowTip] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = stop.imagePaths || (stop.imageUrl ? [stop.imageUrl] : []);
  const hasImages = allImages.length > 0;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;

  const getCategoryIcon = (cat?: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "cultura": <Camera className="w-4 h-4" />,
      "gastronomía": <Utensils className="w-4 h-4" />,
      "restaurante": <Utensils className="w-4 h-4" />,
      "playa": <span>🏖️</span>,
      "naturaleza": <span>🌳</span>,
      "historia": <span>🏛️</span>,
    };
    
    const category = cat?.toLowerCase() || "";
    return iconMap[category] || <Star className="w-4 h-4" />;
  };

  const formatTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hh = h % 12 || 12;
    return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const getDefaultImage = () => {
    return "https://images.unsplash.com/photo-1590256958685-8e2b451c6b8b?w=800";
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Galería de imágenes */}
      <div className="relative h-64 bg-gray-100">
        {hasImages && !imageError ? (
          <>
            <img
              src={allImages[activeImageIndex]}
              alt={stop.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeImageIndex 
                        ? "bg-white w-8" 
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${getDefaultImage()})` }}
          />
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur text-gray-900 rounded-full text-xs font-bold shadow-lg">
            #{index + 1}
          </span>
          {stop.enrichedFromFirebase && (
            <span className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verificado
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(stop.startTime)}
          </span>
        </div>

        {/* Categorías en overlay */}
        {stop.categories && stop.categories.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex gap-2 flex-wrap">
              {stop.categories.map((cat, i) => (
                <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur text-white text-xs rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{stop.name}</h3>
          {stop.tagline && (
            <p className="text-sm text-gray-600 italic">"{stop.tagline}"</p>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed line-clamp-3">
          {stop.description}
        </p>

        {/* Info práctica */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {stop.municipality && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{stop.municipality}</span>
            </div>
          )}
          
          {stop.durationMinutes && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-red-500" />
              <span>{stop.durationMinutes} min</span>
            </div>
          )}
          
          {stop.openingTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{stop.openingTime}</span>
            </div>
          )}
          
          {stop.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-red-500" />
              <span>{stop.phone}</span>
            </div>
          )}
        </div>

        {/* Dirección */}
        {stop.address && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Dirección:</span> {stop.address}
            </p>
          </div>
        )}

        {/* Tip */}
        {stop.tip && (
          <motion.div layout className="rounded-xl overflow-hidden border border-amber-200">
            <button
              onClick={() => setShowTip(!showTip)}
              className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100"
            >
              <span className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                <Info className="w-4 h-4" />
                Consejo local
              </span>
              <ChevronRight
                className={`w-4 h-4 text-amber-600 transition-transform ${
                  showTip ? "rotate-90" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <p className="p-4 text-sm text-gray-700 bg-white">
                    {stop.tip}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <MapPin className="w-4 h-4 text-red-600" />
            Cómo llegar
          </a>

          {stop.website ? (
            
              href={stop.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
            >
              <Globe className="w-4 h-4" />
              Sitio web
            </a>
          ) : (
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">
              <ExternalLink className="w-4 h-4" />
              Más info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}