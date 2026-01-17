"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Navigation, 
  Clock, 
  Phone, 
  Globe, 
  Heart,
  Share2,
  Sparkles
} from "lucide-react";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import type { Place } from "@/lib/claudeService";

// =============================================================================
// PALETA VISITATLÁNTICO
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

interface PlaceCardProps {
  place: Place;
  isMobile?: boolean;
  isDark?: boolean;
  fontSize: "text-sm" | "text-base" | "text-lg";
}

const PLACEHOLDER = "/placeholder-place.jpg";
const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

const hapticFeedback = () => {
  try { navigator.vibrate?.(10); } catch {}
};

export const PlaceCard = memo(function PlaceCard({ 
  place, 
  isMobile, 
  isDark, 
  fontSize 
}: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const imageUrl = !imageError && place.photo ? place.photo : PLACEHOLDER;
  const external = imageUrl.startsWith("http");

  const hasRating = typeof place.rating === "number" && place.rating > 0;
  const hasPrice = place.price_level && place.price_level > 0;
  const priceStr = "$".repeat(Math.min(place.price_level ?? 0, 4));

  const getRatingStyle = () => {
    if (!place.rating) return "";
    if (place.rating >= 4.5) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (place.rating >= 4.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (place.rating >= 3.5) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-orange-700 bg-orange-50 border-orange-200";
  };

  const openMap = useCallback(() => {
    hapticFeedback();
    if (place.coordinates) {
      window.open(
        `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          `${place.name} ${place.address || "Atlántico Colombia"}`
        )}`,
        "_blank"
      );
    }
  }, [place]);

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback();
    
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: place.name,
          text: place.description || `Visita ${place.name} en Atlántico`,
          url: window.location.href
        });
      } catch {}
    }
  }, [place, isMobile]);

  useEffect(() => {
    if (!isExpanded || !isMobile) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setIsExpanded(false);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isExpanded, isMobile]);

  return (
    <motion.div 
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
      className={`group snap-center shrink-0 ${isMobile ? 'w-full' : 'w-[300px] md:w-[320px]'}`}
      onClick={() => {
        if (isMobile) {
          hapticFeedback();
          setIsExpanded(!isExpanded);
        }
      }}
    >
      <motion.div 
        whileHover={isMobile ? {} : { scale: 1.02, y: -4 }}
        whileTap={isMobile ? { scale: 0.98 } : {}}
        transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
        className={`
          relative rounded-2xl overflow-hidden
          ${isDark ? 'bg-gray-800' : 'bg-white'} 
          shadow-lg hover:shadow-xl
          border ${isDark ? 'border-gray-700/50' : 'border-slate-200/50'}
          transition-shadow duration-300
        `}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <AnimatePresence>
            {imageLoading && (
              <motion.div 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" 
              />
            )}
          </AnimatePresence>
          
          <Image
            src={imageUrl}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            unoptimized={external}
            className={`
              object-cover transition-all duration-700 
              ${imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
              ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}
            `}
            onError={() => setImageError(true)}
            onLoadingComplete={() => setImageLoading(false)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              {hasRating && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border ${getRatingStyle()}`}
                >
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    <span>{place.rating!.toFixed(1)}</span>
                    {place.review_count && (
                      <span className="text-[10px] opacity-70">({place.review_count})</span>
                    )}
                  </div>
                </motion.div>
              )}
              
              {hasPrice && (
                <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-700 border border-white/50 shadow-sm">
                  {priceStr}
                </div>
              )}
            </div>

            {/* Favorite */}
            <motion.button
              onClick={toggleFavorite}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`h-10 w-10 rounded-full backdrop-blur-md shadow-sm flex items-center justify-center transition-all ${
                isFavorite 
                  ? 'text-white' 
                  : 'bg-white/90 text-slate-600 hover:bg-white'
              }`}
              style={isFavorite ? { backgroundColor: COLORS.rojoCayena } : {}}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>

          {/* Recommended badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` }}
          >
            <Sparkles size={12} className="text-white" />
            <span className="text-white text-xs font-bold" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              Recomendado
            </span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 
            className="text-lg font-bold line-clamp-2 mb-1" 
            style={{ color: isDark ? '#ffffff' : '#1e293b', fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {place.name}
          </h3>

          {place.category && (
            <p 
              className={`${fontSize} font-medium mb-2`}
              style={{ 
                color: isDark ? '#94a3b8' : '#64748b',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {place.category}
            </p>
          )}

          {place.description && (
            <p 
              className={`${fontSize} ${isExpanded ? '' : 'line-clamp-2'} transition-all duration-300`}
              style={{ 
                color: isDark ? '#cbd5e1' : '#475569',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {place.description}
            </p>
          )}

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {place.hours && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock size={16} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium" style={{ color: isDark ? '#fff' : '#1e293b' }}>Horario</p>
                      <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{place.hours}</p>
                    </div>
                  </div>
                )}

                {place.phone && (
                  <a 
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: isDark ? '#fff' : '#1e293b' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={16} className="text-slate-400" />
                    <span>{place.phone}</span>
                  </a>
                )}

                {place.website && (
                  <a 
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: isDark ? '#fff' : '#1e293b' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe size={16} className="text-slate-400" />
                    <span>Sitio web</span>
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Local tip */}
          {place.local_tip && (
            <div 
              className="mt-3 p-3 rounded-xl transition-all duration-300"
              style={{ 
                backgroundColor: isDark ? `${COLORS.amarilloArepa}15` : `${COLORS.amarilloArepa}10`,
                borderColor: isDark ? `${COLORS.amarilloArepa}30` : `${COLORS.amarilloArepa}20`,
                borderWidth: 1
              }}
            >
              <p className="text-xs font-medium flex items-start gap-2">
                <span className="text-base flex-shrink-0">💡</span>
                <span style={{ 
                  color: isDark ? COLORS.amarilloArepa : '#92400e',
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  {place.local_tip}
                </span>
              </p>
            </div>
          )}

          {/* Address */}
          {place.address && (
            <p 
              className="mt-3 text-xs flex items-start gap-2"
              style={{ 
                color: isDark ? '#94a3b8' : '#64748b',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <MapPin size={14} style={{ color: COLORS.naranjaSalinas }} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{place.address}</span>
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <motion.button
              onClick={openMap}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-shadow duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                boxShadow: `0 4px 12px -2px ${COLORS.naranjaSalinas}30`,
                fontFamily: "'Josefin Sans', sans-serif"
              }}
            >
              <Navigation size={16} />
              Cómo llegar
            </motion.button>
            
            {isMobile && navigator.share && (
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Share2 size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});