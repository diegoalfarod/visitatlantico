"use client";

import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import DOMPurify from "dompurify";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  X, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon, 
  Sun,
  Sparkles,
  MapPin,
  Navigation,
  Star,
  ExternalLink,
  Image as ImageIcon,
  Map as MapIcon,
  LayoutGrid,
  Home,
  Clock,
  Heart,
  DollarSign,
} from "lucide-react";
import type { ChatMessage } from "@/lib/claudeService";
import { SuggestionChip } from "@/components/gemini/SuggestionChip";
import { TypingIndicator } from "@/components/gemini/TypingIndicator";
import {
  CURATED_PLACES,
  WELCOME_IMAGES,
  getPlaceImages,
  getPlaceById,
  type CuratedPlace,
} from "@/data/atlantico-places";

// =============================================================================
// IMPORTAR IMÁGENES DE GOOGLE PLACES
// Estas son las imágenes REALES obtenidas de la API de Google Places
// =============================================================================
import { PLACE_IMAGES, getPlaceImage, getCategoryImage } from "@/data/place-images";

// =============================================================================
// FALLBACKS DE IMÁGENES - URLs de Unsplash como último recurso
// =============================================================================

const CATEGORY_FALLBACKS: Record<string, string> = {
  playa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  restaurante: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  museo: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
  naturaleza: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
  artesanias: "https://images.unsplash.com/photo-1528283648649-33347faa5d9e?w=800&q=80",
  parque: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
  monumento: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
  entretenimiento: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  cafe: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80",
  iglesia: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80",
  mercado: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
  mirador: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  default: "https://images.unsplash.com/photo-1583531172005-763a424a7c48?w=800&q=80",
};

/**
 * Obtiene la URL de imagen garantizada para un lugar
 * PRIORIDAD:
 * 1. Imágenes de Google Places (PLACE_IMAGES) - Las más actualizadas y específicas
 * 2. Imagen local si es URL externa válida
 * 3. Fallback por categoría (Unsplash genérico)
 * 4. Fallback por defecto
 */
function getGuaranteedImageUrl(placeId: string, localImage?: string, category?: string): string {
  // PRIORIDAD 1: Buscar en PLACE_IMAGES (Google Places API)
  // Estas son las imágenes reales y específicas de cada lugar
  if (PLACE_IMAGES[placeId]) {
    return PLACE_IMAGES[placeId].primary;
  }
  
  // PRIORIDAD 2: Si tiene imagen local y es una URL externa válida, usarla
  if (localImage && localImage.startsWith('http')) {
    return localImage;
  }
  
  // PRIORIDAD 3: Fallback por categoría (Unsplash genérico)
  if (category) {
    const cat = category.toLowerCase();
    if (CATEGORY_FALLBACKS[cat]) {
      return CATEGORY_FALLBACKS[cat];
    }
  }
  
  // PRIORIDAD 4: Fallback genérico
  return CATEGORY_FALLBACKS.default;
}

/**
 * Obtiene la galería de imágenes para un lugar
 * Prioridad: Google Places → Imágenes locales → Fallback
 */
function getGuaranteedGallery(placeId: string, localImages?: string[], category?: string): string[] {
  // PRIORIDAD 1: Galería de Google Places
  if (PLACE_IMAGES[placeId]) {
    return PLACE_IMAGES[placeId].gallery;
  }
  
  // PRIORIDAD 2: Imágenes locales válidas
  if (localImages && localImages.length > 0) {
    const validImages = localImages.filter(img => img.startsWith('http'));
    if (validImages.length > 0) {
      return validImages;
    }
  }
  
  // PRIORIDAD 3: Una imagen de fallback
  const fallback = getGuaranteedImageUrl(placeId, undefined, category);
  return [fallback];
}

// =============================================================================
// TYPES - Place handling
// =============================================================================

type Place = CuratedPlace;

interface APIPlace {
  id?: string;
  name: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  rating?: number;
  review_count?: number;
  reviewCount?: number;
  photo?: string;
  primaryImage?: string;
  local_tip?: string;
  localTip?: string;
  hours?: string;
  schedule?: { opens: string; closes: string };
  coordinates?: { lat: number; lng: number };
  [key: string]: unknown;
}

/**
 * Enriquece un lugar del API con datos completos de CURATED_PLACES
 * AHORA con imágenes de Google Places como prioridad
 */
function enrichPlace(apiPlace: APIPlace): CuratedPlace {
  // Intentar encontrar el lugar en CURATED_PLACES por ID o nombre
  let curatedPlace = apiPlace.id 
    ? getPlaceById(apiPlace.id)
    : CURATED_PLACES.find(p => 
        p.name.toLowerCase() === apiPlace.name.toLowerCase() ||
        p.slug === apiPlace.name.toLowerCase().replace(/\s+/g, '-')
      );
  
  // Si encontramos el lugar curado
  if (curatedPlace) {
    // Obtener imagen garantizada (prioriza Google Places)
    const guaranteedImage = getGuaranteedImageUrl(
      curatedPlace.id, 
      curatedPlace.primaryImage, 
      curatedPlace.category
    );
    
    // Obtener galería garantizada (prioriza Google Places)
    const guaranteedGallery = getGuaranteedGallery(
      curatedPlace.id,
      curatedPlace.images,
      curatedPlace.category
    );
    
    return {
      ...curatedPlace,
      primaryImage: guaranteedImage,
      images: guaranteedGallery,
    };
  }
  
  // Si no encontramos el lugar, crear objeto con fallbacks garantizados
  const fallbackId = apiPlace.id || `place-${apiPlace.name.toLowerCase().replace(/\s+/g, '-')}`;
  const category = (apiPlace.category || 'entretenimiento') as CuratedPlace['category'];
  const guaranteedImage = getGuaranteedImageUrl(fallbackId, apiPlace.photo || apiPlace.primaryImage, category);
  const guaranteedGallery = getGuaranteedGallery(fallbackId, undefined, category);
  
  return {
    id: fallbackId,
    name: apiPlace.name,
    slug: fallbackId,
    shortDescription: apiPlace.shortDescription || apiPlace.description || '',
    longDescription: apiPlace.description || apiPlace.shortDescription || '',
    localTip: apiPlace.localTip || apiPlace.local_tip || '',
    municipality: 'Barranquilla',
    address: apiPlace.address || '',
    coordinates: apiPlace.coordinates || { lat: 10.9639, lng: -74.7964 },
    category: category,
    subcategories: [],
    interests: [],
    typicalDuration: 90,
    priceRange: 'moderado',
    estimatedCost: 50000,
    schedule: apiPlace.schedule || {
      opens: apiPlace.hours?.split(' - ')[0] || '09:00',
      closes: apiPlace.hours?.split(' - ')[1] || '18:00',
    },
    suitableFor: ['solo', 'pareja', 'familia', 'amigos'],
    physicalLevel: 'low',
    familyFriendly: true,
    romanticSpot: false,
    instagrammable: true,
    images: guaranteedGallery,
    primaryImage: guaranteedImage,
    rating: apiPlace.rating || 4.0,
    reviewCount: apiPlace.reviewCount || apiPlace.review_count || 0,
    verified: false,
    featured: false,
    aiContext: '',
    mustTry: [],
    avoidIf: [],
  };
}

/**
 * Enriquece una lista de lugares del API
 */
function enrichPlaces(apiPlaces: APIPlace[]): CuratedPlace[] {
  return apiPlaces.map(enrichPlace);
}

// =============================================================================
// DESIGN TOKENS - VisitAtlántico Brand
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

const hapticFeedback = () => {
  try { navigator.vibrate?.(10); } catch {}
};

// =============================================================================
// PROPS
// =============================================================================

interface ChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  typing: boolean;
  suggestions: string[];
  onSend: (text: string) => void;
  keyboardHeight?: number;
  viewportHeight?: number;
}

type FontSize = "text-sm" | "text-base" | "text-lg";
type PanelMode = "welcome" | "place" | "places" | "map";

// =============================================================================
// FALLBACK WELCOME IMAGES - En caso de que WELCOME_IMAGES no esté definido
// =============================================================================

const DEFAULT_WELCOME_IMAGES = [
  {
    url: PLACE_IMAGES["gran-malecon"]?.primary || "https://images.unsplash.com/photo-1583531172005-763a424a7c48?w=1200&q=80",
    title: "Gran Malecón del Río",
    category: "Paseo & Naturaleza",
    description: "El corazón de Barranquilla junto al majestuoso Río Magdalena"
  },
  {
    url: PLACE_IMAGES["museo-del-caribe"]?.primary || "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200&q=80",
    title: "Museo del Caribe",
    category: "Cultura & Historia",
    description: "Descubre la riqueza cultural de la región Caribe colombiana"
  },
  {
    url: PLACE_IMAGES["casa-del-carnaval"]?.primary || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    title: "Casa del Carnaval",
    category: "Tradición & Fiesta",
    description: "Vive la magia del Carnaval de Barranquilla todo el año"
  },
  {
    url: PLACE_IMAGES["castillo-salgar"]?.primary || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    title: "Castillo de Salgar",
    category: "Playas & Historia",
    description: "Una fortaleza histórica frente al mar Caribe"
  },
];

// Helper para garantizar que una imagen de welcome tenga URL válida
function ensureWelcomeImage(img: { url?: string; title: string; category: string; description: string }): { url: string; title: string; category: string; description: string } {
  const fallbackUrl = "https://images.unsplash.com/photo-1583531172005-763a424a7c48?w=1200&q=80";
  return {
    ...img,
    url: img.url && typeof img.url === 'string' ? img.url : fallbackUrl
  };
}

// Usar WELCOME_IMAGES del data si existe, sino usar fallback
const SAFE_WELCOME_IMAGES = (typeof WELCOME_IMAGES !== 'undefined' && WELCOME_IMAGES?.length > 0) 
  ? WELCOME_IMAGES.map(ensureWelcomeImage)
  : DEFAULT_WELCOME_IMAGES;



// =============================================================================
// WELCOME PANEL - Destino destacado con carrusel
// =============================================================================

const WelcomePanel = memo(function WelcomePanel({ isDark }: { isDark: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const welcomeImages = SAFE_WELCOME_IMAGES;

  // Rotación automática cada 5 segundos
  useEffect(() => {
    if (welcomeImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % welcomeImages.length);
      setImageLoading(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [welcomeImages.length]);

  // Safety check
  if (welcomeImages.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Cargando destinos...
        </p>
      </div>
    );
  }

  const current = welcomeImages[currentIndex] || welcomeImages[0];

  const goTo = (index: number) => {
    hapticFeedback();
    setCurrentIndex(index);
    setImageLoading(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Hero Image */}
      <div className="relative h-[45%] min-h-[200px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
            className="absolute inset-0"
          >
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            <Image
              src={current.url}
              alt={current.title}
              fill
              className={`object-cover transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadingComplete={() => setImageLoading(false)}
              unoptimized={current.url.startsWith('http')}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            key={`text-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-orange-300 text-sm font-medium mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {current.category}
            </p>
            <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              {current.title}
            </h2>
            <p className="text-white/80 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {current.description}
            </p>
          </motion.div>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {welcomeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'w-6 bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => goTo((currentIndex - 1 + welcomeImages.length) % welcomeImages.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => goTo((currentIndex + 1) % welcomeImages.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
});

// =============================================================================
// PLACE PANEL - Detalle del lugar con galería
// =============================================================================

const PlacePanel = memo(function PlacePanel({ 
  place, 
  isDark 
}: { 
  place: CuratedPlace; 
  isDark: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Usar imágenes garantizadas de Google Places
  const images = useMemo(() => {
    return getGuaranteedGallery(place.id, place.images, place.category);
  }, [place.id, place.images, place.category]);

  const currentImage = images[currentImageIndex] || images[0];

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

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Image Gallery */}
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            <Image
              src={currentImage}
              alt={place.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadingComplete={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              unoptimized={currentImage.startsWith('http')}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Gallery navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                hapticFeedback();
                setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
                setImageLoading(true);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => {
                hapticFeedback();
                setCurrentImageIndex(prev => (prev + 1) % images.length);
                setImageLoading(true);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Thumbnails */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    hapticFeedback();
                    setCurrentImageIndex(i);
                    setImageLoading(true);
                  }}
                  className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${place.name} ${i + 1}`}
                    width={48}
                    height={32}
                    className="object-cover w-full h-full"
                    unoptimized={img.startsWith('http')}
                  />
                </button>
              ))}
              {images.length > 5 && (
                <div className="w-12 h-8 rounded-lg bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                  +{images.length - 5}
                </div>
              )}
            </div>
          </>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {place.rating && (
              <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-sm font-bold text-emerald-700 flex items-center gap-1.5 shadow-sm">
                <Star size={14} fill="currentColor" />
                {place.rating.toFixed(1)}
                {place.reviewCount > 0 && (
                  <span className="text-xs text-slate-500 font-normal">({place.reviewCount})</span>
                )}
              </div>
            )}
            {place.priceRange && (
              <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-sm font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                <DollarSign size={12} />
                {place.priceRange === 'gratis' ? 'Gratis' : 
                 place.priceRange === 'economico' ? '$' :
                 place.priceRange === 'moderado' ? '$$' : '$$$'}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              hapticFeedback();
              setIsFavorite(!isFavorite);
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm ${
              isFavorite 
                ? 'text-white' 
                : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
            style={isFavorite ? { backgroundColor: COLORS.rojoCayena } : {}}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 p-5 ${isDark ? "bg-slate-900" : "bg-white"}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 
              className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {place.name}
            </h2>
            <p 
              className="text-sm mt-0.5"
              style={{ color: COLORS.naranjaSalinas, fontFamily: "'Montserrat', sans-serif" }}
            >
              {place.category.charAt(0).toUpperCase() + place.category.slice(1)} • {place.municipality}
            </p>
          </div>
        </div>

        <p 
          className={`text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {place.longDescription || place.shortDescription}
        </p>

        {/* Local Tip */}
        {place.localTip && (
          <div 
            className="p-4 rounded-xl mb-4"
            style={{ 
              backgroundColor: isDark ? `${COLORS.amarilloArepa}15` : `${COLORS.amarilloArepa}10`,
              borderColor: isDark ? `${COLORS.amarilloArepa}30` : `${COLORS.amarilloArepa}20`,
              borderWidth: 1
            }}
          >
            <p className="text-sm flex items-start gap-2">
              <span className="text-lg flex-shrink-0">💡</span>
              <span style={{ 
                color: isDark ? COLORS.amarilloArepa : '#92400e',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                <strong>Tip local:</strong> {place.localTip}
              </span>
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {place.schedule && (
            <div className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} style={{ color: COLORS.naranjaSalinas }} />
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Horario</span>
              </div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                {place.schedule.opens} - {place.schedule.closes}
              </p>
            </div>
          )}
          {place.typicalDuration && (
            <div className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: COLORS.naranjaSalinas }} />
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Duración</span>
              </div>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                ~{place.typicalDuration} min
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        {place.address && (
          <div className={`flex items-start gap-2 text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <MapPin size={16} style={{ color: COLORS.naranjaSalinas }} className="mt-0.5 flex-shrink-0" />
            <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{place.address}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={openMap}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
              boxShadow: `0 4px 12px -2px ${COLORS.naranjaSalinas}40`,
              fontFamily: "'Josefin Sans', sans-serif"
            }}
          >
            <Navigation size={16} />
            Cómo llegar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-5 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
              isDark 
                ? "bg-slate-700 text-white hover:bg-slate-600" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <ExternalLink size={16} />
            Web
          </motion.button>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// PLACES PANEL - Lista de todos los lugares recomendados
// =============================================================================

const PlacesPanel = memo(function PlacesPanel({ 
  places, 
  isDark,
  onPlaceClick
}: { 
  places: CuratedPlace[]; 
  isDark: boolean;
  onPlaceClick: (place: CuratedPlace) => void;
}) {
  if (places.length === 0) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${COLORS.naranjaSalinas}20` }}
        >
          <MapPin size={28} style={{ color: COLORS.naranjaSalinas }} />
        </div>
        <h3 
          className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          Sin lugares aún
        </h3>
        <p 
          className={`text-sm text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Pregúntale a Jimmy por recomendaciones y aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto p-4 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="grid gap-3">
        {places.map((place, i) => {
          // Usar imagen garantizada de Google Places
          const imageUrl = getGuaranteedImageUrl(place.id, place.primaryImage, place.category);
          
          return (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onPlaceClick(place)}
              className={`
                flex gap-3 p-3 rounded-xl cursor-pointer
                ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-50"}
                border ${isDark ? "border-slate-700" : "border-slate-200"}
                transition-all duration-200 hover:shadow-md
              `}
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={place.name}
                  fill
                  className="object-cover"
                  unoptimized={imageUrl.startsWith('http')}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className={`font-bold text-sm line-clamp-1 ${isDark ? "text-white" : "text-slate-800"}`}
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  {place.name}
                </h4>
                <p 
                  className="text-xs mt-0.5 line-clamp-1"
                  style={{ color: COLORS.naranjaSalinas, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {place.category} • {place.municipality}
                </p>
                <p 
                  className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {place.shortDescription}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {place.rating && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Star size={10} fill="currentColor" />
                      {place.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

// =============================================================================
// MAP PANEL - Vista de mapa con marcadores
// =============================================================================

const MapPanel = memo(function MapPanel({ 
  places, 
  isDark 
}: { 
  places: CuratedPlace[]; 
  isDark: boolean;
}) {
  const mapUrl = useMemo(() => {
    if (places.length === 0) {
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d125000!2d-74.8!3d10.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1`;
    }
    
    const firstPlace = places[0];
    if (firstPlace.coordinates) {
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${firstPlace.coordinates.lng}!3d${firstPlace.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1`;
    }
    
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d125000!2d-74.8!3d10.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1`;
  }, [places]);

  return (
    <div className="h-full relative">
      <iframe
        src={mapUrl}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de lugares"
      />
      
      {/* Overlay with place markers info */}
      {places.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div 
            className={`
              p-3 rounded-xl backdrop-blur-md
              ${isDark ? "bg-slate-900/90" : "bg-white/90"}
              border ${isDark ? "border-slate-700" : "border-slate-200"}
              shadow-lg
            `}
          >
            <p 
              className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-800"}`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              📍 {places.length} {places.length === 1 ? 'lugar' : 'lugares'} recomendados
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

// =============================================================================
// INLINE PLACE CARD - Tarjeta compacta para mostrar en el chat
// =============================================================================

const InlinePlaceCard = memo(function InlinePlaceCard({
  place,
  isDark,
  onClick,
}: {
  place: CuratedPlace;
  isDark: boolean;
  onClick: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Usar imagen garantizada de Google Places
  const imageUrl = useMemo(() => {
    return getGuaranteedImageUrl(place.id, place.primaryImage, place.category);
  }, [place.id, place.primaryImage, place.category]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-3 p-2.5 rounded-xl text-left w-full
        ${isDark ? "bg-slate-700/50 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"}
        border ${isDark ? "border-slate-600/50" : "border-slate-200"}
        transition-all duration-200
      `}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={place.name}
          fill
          className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoadingComplete={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          unoptimized={imageUrl.startsWith('http')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 
          className={`font-bold text-sm line-clamp-1 ${isDark ? "text-white" : "text-slate-800"}`}
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          {place.name}
        </h4>
        <p 
          className="text-xs line-clamp-1"
          style={{ color: COLORS.naranjaSalinas }}
        >
          {place.category}
        </p>
        {place.rating && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-emerald-600">
            <Star size={10} fill="currentColor" />
            {place.rating.toFixed(1)}
          </div>
        )}
      </div>
      <ChevronRight size={16} className={isDark ? "text-slate-400" : "text-slate-400"} />
    </motion.button>
  );
});

// =============================================================================
// MAIN COMPONENT - ChatWindow
// =============================================================================

export default function ChatWindow({
  open,
  onOpenChange,
  messages,
  typing,
  suggestions,
  onSend,
  keyboardHeight = 0,
  viewportHeight = 0,
}: ChatWindowProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("text-base");
  const [isBottom, setIsBottom] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("welcome");
  const [selectedPlace, setSelectedPlace] = useState<CuratedPlace | null>(null);
  const [allRecommendedPlaces, setAllRecommendedPlaces] = useState<CuratedPlace[]>([]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Extract places from messages
  useEffect(() => {
    const places: CuratedPlace[] = [];
    const seenIds = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.role === "assistant" && (msg as any).places) {
        ((msg as any).places as CuratedPlace[]).forEach(place => {
          if (!seenIds.has(place.id)) {
            seenIds.add(place.id);
            // Enriquecer con imágenes de Google Places
            places.push(enrichPlace(place as unknown as APIPlace));
          }
        });
      }
    });
    
    setAllRecommendedPlaces(places);
    
    // Si hay lugares nuevos, mostrar el último en el panel
    if (places.length > 0 && !isMobile) {
      setSelectedPlace(places[places.length - 1]);
      setPanelMode("place");
    }
  }, [messages, isMobile]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isBottom) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        align: "end",
        behavior: "smooth",
      });
    }
  }, [messages, typing, isBottom]);

  // Focus input on open
  useEffect(() => {
    if (open && !isMobile) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open, isMobile]);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      align: "end",
      behavior: "smooth",
    });
  }, [messages.length]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || typing) return;
    hapticFeedback();
    onSend(text);
    setDraft("");
    textareaRef.current?.focus();
  }, [draft, typing, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const handlePlaceClick = useCallback((place: CuratedPlace) => {
    hapticFeedback();
    // Enriquecer con imágenes de Google Places antes de mostrar
    const enrichedPlace = enrichPlace(place as unknown as APIPlace);
    setSelectedPlace(enrichedPlace);
    if (!isMobile) {
      setPanelMode("place");
    }
  }, [isMobile]);

  const close = useCallback(() => {
    hapticFeedback();
    onOpenChange(false);
  }, [onOpenChange]);

  // Calculate container height for mobile
  const containerStyle = useMemo(() => {
    if (!isMobile || !keyboardHeight) return {};
    return {
      height: viewportHeight ? `${viewportHeight}px` : "100%",
      maxHeight: viewportHeight ? `${viewportHeight}px` : "100%",
    };
  }, [isMobile, keyboardHeight, viewportHeight]);

  if (!open) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-stretch"
      style={containerStyle}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
        className={`
          relative z-10 flex
          ${isMobile 
            ? "w-full h-full" 
            : "mx-auto my-4 w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
          }
        `}
        style={{ 
          background: isDark ? "#0f172a" : "#ffffff",
        }}
      >
        {/* LEFT: Chat Panel */}
        <div className={`flex flex-col ${isMobile ? "w-full" : "w-[400px] min-w-[400px]"} border-r ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
              borderColor: 'transparent'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/jimmy-avatar.png"
                    alt="Jimmy"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </div>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full"
                  style={{ backgroundColor: COLORS.verdeBijao }}
                />
              </div>
              <div>
                <h2 className="text-white text-base font-bold" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
                  Jimmy
                </h2>
                <p className="text-white/80 text-xs flex items-center gap-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <Sparkles size={10} />
                  Tu guía del Atlántico
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => {
                  hapticFeedback();
                  setIsDark(!isDark);
                }}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              {/* Close button */}
              <button
                onClick={close}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
            <Virtuoso
              ref={virtuosoRef}
              data={messages}
              followOutput="smooth"
              atBottomStateChange={setIsBottom}
              className="h-full"
              itemContent={(index, message) => {
                const isUser = message.role === "user";
                const isLast = index === messages.length - 1;
                const showAvatar = index === 0 || messages[index - 1].role !== message.role;

                // Extraer lugares del mensaje si existen
                const messagePlaces = (message as any).places as CuratedPlace[] | undefined;

                return (
                  <div className="px-4 py-2">
                    {/* Message bubble */}
                    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                      {!isUser && showAvatar && !isMobile && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-0.5 flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <Image
                              src="/jimmy-avatar.png"
                              alt="Jimmy"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] ${isUser ? "ml-auto" : !isMobile && showAvatar ? "" : !isMobile ? "ml-10" : ""}`}>
                        <div
                          className={`
                            px-4 py-3 rounded-2xl ${fontSize}
                            ${isUser
                              ? "bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-md"
                              : isDark
                                ? "bg-slate-800 text-white border border-slate-700 rounded-bl-md"
                                : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                            }
                          `}
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(message.text.replace(/\n/g, "<br />"))
                          }}
                        />

                        {/* Inline place cards */}
                        {!isUser && messagePlaces && messagePlaces.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {messagePlaces.map(place => (
                              <InlinePlaceCard
                                key={place.id}
                                place={enrichPlace(place as unknown as APIPlace)}
                                isDark={isDark}
                                onClick={() => handlePlaceClick(place)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
              components={{
                Footer: () => typing ? (
                  <div className="px-4 py-2">
                    <TypingIndicator isDark={isDark} />
                  </div>
                ) : <div className="h-3" />,
              }}
            />

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {!isBottom && messages.length > 2 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                    boxShadow: `0 4px 12px -2px ${COLORS.naranjaSalinas}50`
                  }}
                >
                  <ChevronDown size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && !typing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`px-4 py-3 border-t ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-white border-slate-100"}`}
              >
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <SuggestionChip
                      key={s}
                      label={s}
                      onClick={() => onSend(s)}
                      small
                      isDark={isDark}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div 
            ref={inputContainerRef}
            className={`p-3 border-t ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
          >
            <div 
              className={`flex items-end gap-2 rounded-2xl transition-all duration-200 ${
                isDark 
                  ? "bg-slate-700 border-2 border-slate-600 focus-within:border-orange-500/50" 
                  : "bg-slate-50 border-2 border-slate-200 focus-within:border-orange-400/50 focus-within:bg-white"
              }`}
            >
              <TextareaAutosize
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                minRows={1}
                maxRows={4}
                placeholder="Escríbele a Jimmy..."
                disabled={typing}
                className={`flex-1 resize-none bg-transparent px-4 py-3 text-[15px] outline-none ${
                  isDark ? "text-white placeholder-slate-400" : "text-slate-800 placeholder-slate-400"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={send}
                disabled={!draft.trim() || typing}
                className={`m-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  !draft.trim() || typing 
                    ? "bg-slate-200 text-slate-400 shadow-none" 
                    : "text-white"
                }`}
                style={draft.trim() && !typing ? { 
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  boxShadow: `0 4px 12px -2px ${COLORS.naranjaSalinas}50`
                } : {}}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT: Contextual Panel (Desktop only) */}
        {!isMobile && (
          <div className="flex-1 flex flex-col">
            {/* Panel Tabs */}
            <div 
              className={`flex items-center gap-1 px-4 py-2.5 border-b ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
              }`}
            >
              {[
                { mode: "welcome" as PanelMode, icon: Home, label: "Inicio" },
                { mode: "place" as PanelMode, icon: ImageIcon, label: "Galería", disabled: !selectedPlace },
                { mode: "places" as PanelMode, icon: LayoutGrid, label: `Lugares${allRecommendedPlaces.length > 0 ? ` (${allRecommendedPlaces.length})` : ""}` },
                { mode: "map" as PanelMode, icon: MapIcon, label: "Mapa" },
              ].map(({ mode, icon: Icon, label, disabled }) => (
                <button
                  key={mode}
                  onClick={() => !disabled && setPanelMode(mode)}
                  disabled={disabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${panelMode === mode
                      ? "text-white shadow-lg"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }
                    ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                  style={panelMode === mode ? { 
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                    fontFamily: "'Josefin Sans', sans-serif"
                  } : { fontFamily: "'Montserrat', sans-serif" }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={panelMode + (selectedPlace?.id || "")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {panelMode === "welcome" && <WelcomePanel isDark={isDark} />}
                  {panelMode === "place" && selectedPlace && (
                    <PlacePanel place={selectedPlace} isDark={isDark} />
                  )}
                  {panelMode === "places" && (
                    <PlacesPanel 
                      places={allRecommendedPlaces} 
                      isDark={isDark} 
                      onPlaceClick={handlePlaceClick} 
                    />
                  )}
                  {panelMode === "map" && (
                    <MapPanel places={allRecommendedPlaces} isDark={isDark} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Mobile: Bottom Sheet for Place Detail */}
        <AnimatePresence>
          {isMobile && selectedPlace && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPlace(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
              />
              
              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] rounded-t-3xl overflow-hidden shadow-2xl"
                style={{ background: isDark ? "#0f172a" : "#fff" }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <button 
                    onClick={() => setSelectedPlace(null)}
                    className="w-10 h-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors"
                  />
                </div>
                <div className="overflow-auto max-h-[calc(85vh-24px)]">
                  <PlacePanel place={selectedPlace} isDark={isDark} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}