"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import type { Stop } from "@/components/ItineraryStopCard";
import { motion, AnimatePresence } from "framer-motion";
import AddDestinationModal from "@/components/AddDestinationModal";
import { toMin, toHHMM } from "@/utils/itinerary-helpers";
import LocationSelector from "@/components/LocationSelector";
import MultiDayItinerary from "@/components/MultiDayItinerary";
import dynamic from "next/dynamic";

import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  Share2,
  FileText,
  Download,
  Shuffle,
  Settings,
  Navigation,
  Utensils,
  Umbrella,
  Route,
  Baby,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Sparkles,
  Check,
  Coffee,
  AlertCircle,
  X,
  Menu,
  ArrowLeft,
  Plus,
  Home,
  Heart,
  Camera,
} from "lucide-react";
import { generateUniqueLink } from "@/utils/linkGenerator";
import Image from "next/image";

/* ─────────── NUEVOS COMPONENTES DE UI ─────────── */

// 1. BOTTOM SHEET COMPONENT
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: string[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  snapPoints = ['90%'] 
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) setDragY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: dragY }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50"
            style={{ height: snapPoints[0], maxHeight: '90vh' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle bar */}
            <div className="sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <TouchRippleButton onClick={onClose} className="p-2">
                    <X className="w-5 h-5" />
                  </TouchRippleButton>
                </div>
              )}
            </div>
            
            <div className="px-4 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// 2. TOUCH RIPPLE EFFECT
interface TouchRippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  rippleColor?: string;
}

const TouchRippleButton: React.FC<TouchRippleButtonProps> = ({ 
  children, 
  onClick, 
  className = "", 
  rippleColor = "rgba(0,0,0,0.1)",
  ...props 
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: rippleColor,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};

// 3. OPTIMIZED CARD COMPONENT
interface OptimizedCardProps {
  stop: Stop;
  index: number;
  onNavigate?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const OptimizedCard: React.FC<OptimizedCardProps> = ({ 
  stop, 
  index, 
  onNavigate, 
  onToggleFavorite, 
  onShare,
  isFavorite = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryEmojis: { [key: string]: string } = {
    "relax": "🏖️",
    "cultura": "🎭",
    "aventura": "🚣",
    "gastronomia": "🍤",
    "artesanias": "🎨",
    "ritmos": "💃",
    "festivales": "🎪",
    "deportes-acuaticos": "🏄",
    "avistamiento": "🦜",
    "ecoturismo": "🌿",
    "malecon": "🚴",
    "playas-urbanas": "🏖️",
    "historia-portuaria": "🏗️",
    "arte-urbano": "🖼️",
    "sabores-marinos": "🦐",
    "vida-nocturna": "🍹",
    "bienestar": "🧘",
    "Descanso": "☕",
    "attraction": "📍"
  };

  const emoji = categoryEmojis[stop.category || "attraction"] || "📍";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <TouchRippleButton 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-base line-clamp-1">{stop.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>{stop.category || "Lugar"}</span>
                <span>•</span>
                <span>{stop.durationMinutes} min</span>
                {stop.distance && (
                  <>
                    <span>•</span>
                    <span>{stop.distance.toFixed(1)} km</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-red-600 flex-shrink-0">
            {stop.startTime}
          </span>
        </div>

        {/* Preview */}
        <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {stop.description}
        </p>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              {stop.tip && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">💡 Tip:</span> {stop.tip}
                  </p>
                </div>
              )}
              {stop.municipality && (
                <p className="text-xs text-gray-500 mb-3">
                  📍 {stop.municipality}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </TouchRippleButton>

      {/* Quick actions */}
      <div className="flex gap-1 p-2 pt-0">
        <TouchRippleButton
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          rippleColor="rgba(239, 68, 68, 0.2)"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Ir</span>
        </TouchRippleButton>
        
        <TouchRippleButton
          onClick={onToggleFavorite}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          rippleColor="rgba(239, 68, 68, 0.2)"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-xs font-medium">Guardar</span>
        </TouchRippleButton>
        
        <TouchRippleButton
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          rippleColor="rgba(239, 68, 68, 0.2)"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Compartir</span>
        </TouchRippleButton>
      </div>
    </motion.div>
  );
};

// 4. FAB MENU COMPONENT
interface FABMenuProps {
  onAddDestination: () => void;
  onAddBreak: () => void;
  onTakePhoto?: () => void;
  onRegenerate: () => void;
}

const FABMenu: React.FC<FABMenuProps> = ({ 
  onAddDestination, 
  onAddBreak, 
  onTakePhoto,
  onRegenerate 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Plus, label: "Agregar parada", onClick: onAddDestination, color: "bg-blue-500" },
    { icon: Coffee, label: "Descanso", onClick: onAddBreak, color: "bg-green-500" },
    { icon: Camera, label: "Foto", onClick: onTakePhoto, color: "bg-purple-500" },
    { icon: Sparkles, label: "Regenerar", onClick: onRegenerate, color: "bg-amber-500" },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu items */}
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: -(index + 1) * 60 
                }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className="absolute bottom-0 right-0 z-40"
              >
                <TouchRippleButton
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={`${item.color} text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center`}
                  rippleColor="rgba(255,255,255,0.3)"
                >
                  <item.icon className="w-5 h-5" />
                </TouchRippleButton>
                <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <TouchRippleButton
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-red-600 rounded-full shadow-lg flex items-center justify-center relative z-50"
          rippleColor="rgba(255,255,255,0.3)"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.div>
        </TouchRippleButton>
      </motion.div>
    </div>
  );
};

// 5. EMPTY STATE COMPONENT
interface EmptyStateProps {
  type: 'no-itinerary' | 'no-results' | 'error';
  onAction?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, actionLabel }) => {
  const configs = {
    'no-itinerary': {
      emoji: '🗺️',
      title: 'No hay paradas aún',
      description: 'Comienza agregando tu primer destino',
      defaultAction: 'Agregar destino'
    },
    'no-results': {
      emoji: '🔍',
      title: 'No se encontraron resultados',
      description: 'Intenta con otros criterios de búsqueda',
      defaultAction: 'Buscar de nuevo'
    },
    'error': {
      emoji: '😕',
      title: 'Algo salió mal',
      description: 'No pudimos cargar el contenido',
      defaultAction: 'Intentar de nuevo'
    }
  };

  const config = configs[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-6"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
        className="text-6xl mb-4"
      >
        {config.emoji}
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-gray-500 mb-6 max-w-xs mx-auto">{config.description}</p>
      {onAction && (
        <TouchRippleButton
          onClick={onAction}
          className="bg-red-600 text-white px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          rippleColor="rgba(255,255,255,0.3)"
        >
          <Sparkles className="w-4 h-4" />
          <span>{actionLabel || config.defaultAction}</span>
        </TouchRippleButton>
      )}
    </motion.div>
  );
};

/* ─────────── tipos & helpers (ORIGINAL) ─────────── */

type ApiStop = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  startTime: string;
  durationMinutes: number;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  photos?: string[]; 
  type: "destination" | "experience";
};

type ApiResponse = { itinerary: ApiStop[]; error?: string };

// Custom hook para preferencias de usuario
const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('visitatlantico_preferences');
    return saved ? JSON.parse(saved) : {
      favoriteCategories: [],
      avoidCategories: [],
      travelStyle: null,
      lastItineraries: []
    };
  });

  const updatePreferences = (updates: any) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('visitatlantico_preferences', JSON.stringify(newPrefs));
    }
  };

  return { preferences, updatePreferences };
};

// Helper para detectar móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

/* ═════════════════ COMPONENTE PRINCIPAL ═════════════════ */

export default function PremiumPlannerPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  
  /* wizard answers */
  const [answers, setAnswers] = useState<{
    days?: number;
    motivos?: string[];
    otros?: boolean;
    email?: string;
  }>({});
  const [qIndex, setQIndex] = useState(0);

  /* ubicación */
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  /* preferencias de usuario */
  const { preferences, updatePreferences } = useUserPreferences();

  /* estados para bottom sheets */
  const [showBreakSheet, setShowBreakSheet] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [breakForm, setBreakForm] = useState({
    name: "",
    description: "",
    duration: 30
  });

  /* favoritos */
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (stopId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(stopId)) {
        newFavorites.delete(stopId);
      } else {
        newFavorites.add(stopId);
      }
      return newFavorites;
    });
  };

  /* pasos wizard mejorados para móvil */
  const steps = [
    {
      label: "¿Cuánto tiempo tienes?",
      valid: answers.days !== undefined,
      element: (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { days: 1, label: "Un día", icon: "☀️", desc: "Tour express" },
            { days: 2, label: "Fin de semana", icon: "🌅", desc: "2 días" },
            { days: 3, label: "Puente festivo", icon: "🏖️", desc: "3 días" },
            { days: 5, label: "Una semana", icon: "🗓️", desc: "5-7 días" },
          ].map((opt) => (
            <TouchRippleButton
              key={opt.days}
              onClick={() => setAnswers({ ...answers, days: opt.days })}
              className={`p-4 sm:p-6 rounded-2xl border-2 transition-all ${
                answers.days === opt.days
                  ? "border-red-600 bg-red-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
              rippleColor="rgba(220, 38, 38, 0.1)"
            >
              <div className="text-2xl sm:text-3xl mb-2">{opt.icon}</div>
              <div className="font-semibold text-sm sm:text-base">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
            </TouchRippleButton>
          ))}
        </div>
      ),
    },
    {
      label: "¿Qué tipo de experiencias buscas?",
      helper: "Elige hasta 3 opciones que más te atraigan",
      valid: answers.motivos && answers.motivos.length > 0 && answers.motivos.length <= 3,
      element: (
        <div className="space-y-2 sm:space-y-2.5">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-sm text-gray-600">
              {answers.motivos?.length || 0} de 3 seleccionadas
            </span>
            {answers.motivos && answers.motivos.length > 0 && (
              <TouchRippleButton
                onClick={() => setAnswers({ ...answers, motivos: [] })}
                className="text-sm text-red-600 hover:text-red-700 px-2 py-1"
              >
                Limpiar selección
              </TouchRippleButton>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: "relax", emoji: "🏖️", title: "Relax total", desc: "Playas, spa y descanso" },
              { id: "cultura", emoji: "🎭", title: "Inmersión cultural", desc: "Museos, historia y tradiciones" },
              { id: "aventura", emoji: "🚣", title: "Aventura activa", desc: "Deportes y naturaleza" },
              { id: "gastronomia", emoji: "🍤", title: "Sabores locales", desc: "Comida típica y mercados" },
              { id: "artesanias", emoji: "🎨", title: "Artesanías locales", desc: "Talleres y mercados del Carnaval" },
              { id: "ritmos", emoji: "💃", title: "Ritmos y baile", desc: "Salsa, cumbia y rumba barranquillera" },
              { id: "festivales", emoji: "🎪", title: "Festivales y eventos", desc: "Carnaval y ferias gastronómicas" },
              { id: "deportes-acuaticos", emoji: "🏄", title: "Deportes acuáticos", desc: "Kitesurf, paddle board y snorkel" },
              { id: "avistamiento", emoji: "🦜", title: "Avistamiento de aves", desc: "Recorridos por Ciénaga de Mallorquín" },
              { id: "ecoturismo", emoji: "🌿", title: "Ecoturismo & manglares", desc: "Paseos por bosque tropical" },
              { id: "malecon", emoji: "🚴", title: "Ruta del Malecón", desc: "Bicis y trote junto al río Magdalena" },
              { id: "playas-urbanas", emoji: "🏖️", title: "Playas urbanas & relax", desc: "Puerto Mocho y playas sostenibles" },
              { id: "historia-portuaria", emoji: "🏗️", title: "Historia portuaria", desc: "Muelle 1888 y boulevard gastronómico" },
              { id: "arte-urbano", emoji: "🖼️", title: "Arte urbano & museos", desc: "Street art y Museo del Caribe" },
              { id: "sabores-marinos", emoji: "🦐", title: "Ruta de sabores marinos", desc: "Mariscos frescos y mercados gourmet" },
              { id: "vida-nocturna", emoji: "🍹", title: "Vida nocturna chic", desc: "Coctelerías y rooftops de moda" },
              { id: "bienestar", emoji: "🧘", title: "Bienestar & spa", desc: "Yoga y retiros junto al mar" },
              { id: "mixto", emoji: "✨", title: "De todo un poco", desc: "Experiencia variada" },
            ].map((exp) => {
              const isSelected = answers.motivos?.includes(exp.id) || false;
              const canSelect = !isSelected && (answers.motivos?.length || 0) < 3;
              
              return (
                <TouchRippleButton
                  key={exp.id}
                  onClick={() => {
                    if (isSelected) {
                      setAnswers({
                        ...answers,
                        motivos: answers.motivos?.filter(m => m !== exp.id) || []
                      });
                    } else if (canSelect) {
                      setAnswers({
                        ...answers,
                        motivos: [...(answers.motivos || []), exp.id]
                      });
                    }
                  }}
                  disabled={!isSelected && !canSelect}
                  className={`w-full p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg ring-2 ring-red-600 ring-offset-2"
                      : canSelect
                      ? "bg-white border border-gray-200 hover:shadow-md hover:border-red-300"
                      : "bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                  rippleColor={isSelected ? "rgba(255,255,255,0.2)" : "rgba(220, 38, 38, 0.1)"}
                >
                  <span className="text-2xl sm:text-3xl flex-shrink-0">{exp.emoji}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">{exp.title}</div>
                    <div className={`text-xs sm:text-sm ${
                      isSelected ? "text-red-100" : "text-gray-500"
                    } line-clamp-1`}>
                      {exp.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 flex items-center">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs ml-1">{answers.motivos?.indexOf(exp.id)! + 1}</span>
                    </div>
                  )}
                </TouchRippleButton>
              );
            })}
          </div>
          
          {answers.motivos && answers.motivos.length === 3 && (
            <p className="text-sm text-amber-600 text-center mt-2">
              Has alcanzado el máximo de 3 opciones. Deselecciona alguna para cambiar tu selección.
            </p>
          )}
        </div>
      ),
    },
    {
      label: "¿Quieres explorar otros municipios?",
      valid: answers.otros !== undefined,
      element: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: true, label: "Sí, aventurémonos", icon: "🚗", desc: "Conoce más lugares del Atlántico" },
            { value: false, label: "No, cerca está bien", icon: "🏘️", desc: "Solo Barranquilla y alrededores" }
          ].map((opt) => (
            <TouchRippleButton
              key={String(opt.value)}
              onClick={() => setAnswers({ ...answers, otros: opt.value })}
              className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                answers.otros === opt.value
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              rippleColor="rgba(220, 38, 38, 0.1)"
            >
              <div className="text-3xl sm:text-4xl mb-3">{opt.icon}</div>
              <div className="font-semibold mb-1 text-sm sm:text-base">{opt.label}</div>
              <div className="text-xs sm:text-sm text-gray-500">{opt.desc}</div>
            </TouchRippleButton>
          ))}
        </div>
      ),
    },
    {
      label: "¿Cómo te contactamos?",
      helper: "Te enviaremos tu itinerario personalizado",
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || ""),
      element: (
        <div className="max-w-md mx-auto">
          <input
            type="email"
            value={answers.email ?? ""}
            onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
            placeholder="tu@email.com"
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 focus:outline-none transition-all"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
            No spam, solo tu itinerario 🎉
          </p>
        </div>
      ),
    },
  ];

  const next = () => {
    if (qIndex < steps.length - 1) {
      setQIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prev = () => {
    if (qIndex > 0) {
      setQIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* API & itinerario */
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [view, setView] = useState<"questions" | "loading" | "itinerary">("questions");
  const pdfRef = useRef<HTMLDivElement>(null);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const handleStopsReorder = (newStops: Stop[]) => {
    setItinerary(newStops);
  };

  const generateItinerary = async () => {
    if (!steps.every((s) => s.valid)) return;
    setView("loading");
    
    updatePreferences({
      travelStyles: answers.motivos,
      lastItineraries: [...(preferences.lastItineraries || []), {
        date: new Date().toISOString(),
        days: answers.days,
        styles: answers.motivos
      }].slice(-5)
    });
    
    const profile = {
      Días: String(answers.days),
      Motivos: answers.motivos?.join(", "),
      "Otros municipios": answers.otros ? "Sí" : "No",
      Email: answers.email,
    };
    
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profile, 
          location: locationData ? { 
            lat: locationData.lat, 
            lng: locationData.lng 
          } : null
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const { itinerary: apiStops, error } = (await res.json()) as ApiResponse;
      
      if (error || !apiStops?.length) {
        throw new Error(error || "No se recibieron destinos");
      }

      const validStops = apiStops.filter(stop => 
        stop.id && stop.lat && stop.lng && stop.description && stop.type
      );

      if (!validStops.length) {
        throw new Error("No se encontraron destinos válidos");
      }

      const sortedStops = [...validStops].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      const processedItinerary: Stop[] = sortedStops.map((apiStop, index) => ({
        id: apiStop.id,
        name: apiStop.name || `Destino ${index + 1}`,
        description: apiStop.description,
        lat: apiStop.lat,
        lng: apiStop.lng,
        durationMinutes: apiStop.durationMinutes || 60,
        tip: apiStop.tip || `Consejo: ${apiStop.name || 'este lugar'}`,
        municipality: apiStop.municipality || "Ubicación desconocida",
        startTime: apiStop.startTime,
        category: apiStop.category || "attraction",
        imageUrl: apiStop.imageUrl || "/default-place.jpg",
        photos: apiStop.photos, 
        distance: locationData ? calculateDistance(
          locationData.lat, 
          locationData.lng, 
          apiStop.lat, 
          apiStop.lng
        ) : 0,
        type: apiStop.type
      }));
      
      setItinerary(processedItinerary);
      setView("itinerary");
    } catch (error) {
      console.error("Error generando itinerario:", error);
      alert(
        error instanceof Error ? error.message :
        "Error al generar el itinerario. Por favor intenta con otros parámetros."
      );
      setView("questions");
    }
  };

  const handleShare = async () => {
    if (!itinerary?.length) return alert("Itinerario vacío");
    try {
      const url = await generateUniqueLink(itinerary, answers.days ?? 1);
      
      if (navigator.share && isMobile) {
        await navigator.share({
          title: 'Mi itinerario en Atlántico',
          text: 'Mira mi plan de viaje personalizado',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado al portapapeles ✅");
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el link");
    }
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) {
      alert("No se encontró el contenido del itinerario.");
      return;
    }
  
    try {
      const clone = pdfRef.current.cloneNode(true) as HTMLElement;
      
      clone.querySelectorAll('button, input, select, .map-container').forEach(el => el.remove());
      
      const mapPlaceholder = `<div class="map-static" style="height:400px;background:#eee;display:flex;align-items:center;justify-content:center;border-radius:1rem;margin:1rem 0">
        <div style="text-align:center">
          <h3 style="color:#333">Mapa del Itinerario</h3>
          <p style="color:#666">${locationData?.address || 'Ubicación principal'}</p>
        </div>
      </div>`;
      
      const mapContainer = clone.querySelector('.map-container');
      if (mapContainer) {
        mapContainer.outerHTML = mapPlaceholder;
      }
  
      const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Itinerario de Viaje - ${locationData?.address || 'Atlántico'}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                     Ubuntu, Cantarell, sans-serif;
        background-color: #f8fafc;
        color: #1e293b;
        padding: 20px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        background: #dc2626;
        color: white;
        padding: 4rem 1rem;
        text-align: center;
        margin-bottom: 20px;
      }
      .card {
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        break-inside: avoid;
      }
      .timeline-item {
        border-left: 2px solid #dc2626;
        padding-left: 1.5rem;
        margin: 1.5rem 0;
      }
      @media print {
        body { 
          background: white;
          padding: 0;
        }
        .header { 
          padding: 2rem 1rem;
        }
        .card {
          box-shadow: none;
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0;">Tu Aventura Generada</h1>
        ${locationData?.address ? `<p style="margin-top: 0.5rem; font-size: 1rem;">📍 ${locationData.address}</p>` : ''}
      </div>
      
      ${clone.innerHTML}
    </div>
  </body>
  </html>`;
  
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      });
  
      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerario-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  /* FUNCIONES PARA FAB MENU */
  const handleAddBreak = () => {
    if (!breakForm.name.trim()) {
      alert("Por favor ingresa un nombre para el descanso");
      return;
    }

    const breakStop: Stop = {
      id: `break-${Date.now()}`,
      name: breakForm.name,
      description: breakForm.description || "Tiempo para descansar",
      lat: itinerary![Math.floor(itinerary!.length / 2)]?.lat || 10.9,
      lng: itinerary![Math.floor(itinerary!.length / 2)]?.lng || -74.9,
      startTime: "12:00",
      durationMinutes: breakForm.duration,
      category: "Descanso",
      municipality: "Tu ubicación",
      distance: 0,
      type: "experience",
      imageUrl: "/images/rest-placeholder.jpg",
      tip: "Aprovecha para hidratarte y recargar energías"
    };

    const midPoint = Math.floor(itinerary!.length / 2);
    const updatedItinerary = [
      ...itinerary!.slice(0, midPoint),
      breakStop,
      ...itinerary!.slice(midPoint)
    ];

    const recalculateTimings = (stops: Stop[]): Stop[] => {
      let current = 9 * 60;
      return stops.map((stop, idx) => {
        if (idx > 0) {
          current += 30;
        }
        const startTime = `${Math.floor(current / 60).toString().padStart(2, "0")}:${(current % 60).toString().padStart(2, "0")}`;
        current += stop.durationMinutes || 60;
        return { ...stop, startTime };
      });
    };
    
    const recalculated = recalculateTimings(updatedItinerary);
    
    setItinerary(recalculated);
    setShowBreakSheet(false);
    setBreakForm({ name: "", description: "", duration: 30 });
  };

  const handleRegenerate = () => {
    if (confirm("¿Estás seguro de que quieres generar un nuevo itinerario? Se perderán los cambios actuales.")) {
      router.refresh();
      window.location.reload();
    }
  };

  const handleTakePhoto = () => {
    alert("Función de cámara en desarrollo 📸");
  };

  /* ═════ vista loading mejorada ════ */
  if (view === "loading") {
    return <LoadingItinerary profile={answers} isMobile={isMobile} />;
  }

  /* ═════ vista itinerario con nuevos componentes ════ */
  if (view === "itinerary" && itinerary) {
    const totalH = Math.round(
      itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
    );
    const days = answers.days ?? 1;

    return (
      <main ref={pdfRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
        {/* HERO móvil-first */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
            {/* Botones de navegación */}
            <div className="absolute top-4 left-4 flex gap-2">
              <TouchRippleButton
                onClick={() => window.location.href = 'https://visitatlantico.com'}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                rippleColor="rgba(255,255,255,0.3)"
                title="Ir a la página principal"
              >
                <Home className="w-5 h-5" />
              </TouchRippleButton>
              <TouchRippleButton
                onClick={() => {
                  if (confirm("¿Regresar al inicio? Se perderá el itinerario actual.")) {
                    setView("questions");
                    setQIndex(0);
                    setItinerary(null);
                  }
                }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                rippleColor="rgba(255,255,255,0.3)"
                title="Crear nuevo itinerario"
              >
                <ArrowLeft className="w-5 h-5" />
              </TouchRippleButton>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-extrabold"
            >
              Tu Aventura Generada
            </motion.h1>
            {locationData?.address && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-base sm:text-lg"
              >
                📍 {locationData.address}
              </motion.p>
            )}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm bg-white/20 rounded-full px-3 sm:px-4 py-2 backdrop-blur-sm mx-auto max-w-fit"
            >
              <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Arrastra las actividades para personalizar tu itinerario</span>
              <span className="sm:hidden">Personaliza arrastrando</span>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 sm:-mt-12 space-y-6 sm:space-y-10">
          {/* resumen mejorado móvil */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Resumen de tu aventura</h2>
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="space-y-1 sm:space-y-2">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-xl sm:text-2xl font-bold">{days}</p>
                <p className="text-xs sm:text-sm text-gray-500">día{days > 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-xl sm:text-2xl font-bold">{itinerary.length}</p>
                <p className="text-xs sm:text-sm text-gray-500">paradas</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-xl sm:text-2xl font-bold">{totalH}</p>
                <p className="text-xs sm:text-sm text-gray-500">horas</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <TouchRippleButton
                onClick={downloadPDF}
                className="flex-1 bg-green-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition text-sm sm:text-base"
                rippleColor="rgba(255,255,255,0.3)"
              >
                <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Guardar PDF
              </TouchRippleButton>
              <TouchRippleButton
                onClick={handleShare} 
                className="flex-1 bg-purple-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition text-sm sm:text-base"
                rippleColor="rgba(255,255,255,0.3)"
              >
                <Share2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Compartir
              </TouchRippleButton>
            </div>
          </motion.section>

          {/* mapa - altura reducida en móvil */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden h-64 sm:h-96 map-container"
          >
            <ItineraryMap stops={itinerary} userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null} />
          </motion.div>

          {/* Itinerario con cards optimizadas */}
          {itinerary.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Tu itinerario</h2>
              {itinerary.map((stop, index) => (
                <OptimizedCard
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isFavorite={favorites.has(stop.id)}
                  onNavigate={() => {
                    window.open(`https://maps.google.com/?q=${stop.lat},${stop.lng}`, '_blank');
                  }}
                  onToggleFavorite={() => toggleFavorite(stop.id)}
                  onShare={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: stop.name,
                        text: stop.description,
                        url: window.location.href
                      });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="no-itinerary"
              onAction={() => setShowAddSheet(true)}
              actionLabel="Agregar primer destino"
            />
          )}
        </div>

        {/* FAB Menu */}
        <FABMenu
          onAddDestination={() => setShowAddSheet(true)}
          onAddBreak={() => setShowBreakSheet(true)}
          onTakePhoto={handleTakePhoto}
          onRegenerate={handleRegenerate}
        />

        {/* Bottom Sheet para agregar descanso */}
        <BottomSheet
          isOpen={showBreakSheet}
          onClose={() => setShowBreakSheet(false)}
          title="Agregar Descanso o Actividad"
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del descanso *
              </label>
              <input
                type="text"
                value={breakForm.name}
                onChange={(e) => setBreakForm({ ...breakForm, name: e.target.value })}
                placeholder="Ej: Almuerzo, Café, Siesta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={breakForm.description}
                onChange={(e) => setBreakForm({ ...breakForm, description: e.target.value })}
                placeholder="Ej: Parada para almorzar en un restaurante local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos)
              </label>
              <select
                value={breakForm.duration}
                onChange={(e) => setBreakForm({ ...breakForm, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora 30 min</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <TouchRippleButton
                onClick={() => setShowBreakSheet(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancelar
              </TouchRippleButton>
              <TouchRippleButton
                onClick={handleAddBreak}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                rippleColor="rgba(255,255,255,0.3)"
              >
                Agregar
              </TouchRippleButton>
            </div>
          </div>
        </BottomSheet>

        {/* Bottom Sheet para agregar destinos */}
        <BottomSheet
          isOpen={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          title="Agregar Nuevo Destino"
        >
          {itinerary && (
            <AddDestinationModal
              onClose={() => setShowAddSheet(false)}
              onAdd={(newStop: Stop) => {
                const lastStop = itinerary[itinerary.length - 1];
                const startMin = lastStop 
                  ? toMin(lastStop.startTime) + lastStop.durationMinutes + 30
                  : 9 * 60;

                const stopWithTime = {
                  ...newStop,
                  startTime: toHHMM(startMin),
                  durationMinutes: newStop.durationMinutes || 60
                };
                const updatedStops = [...itinerary, stopWithTime];
                setItinerary(updatedStops);
                setShowAddSheet(false);
              }}
              currentStops={itinerary}
              userLocation={locationData}
            />
          )}
        </BottomSheet>
      </main>
    );
  }

  /* ═════ wizard mejorado móvil con touch ripple ════ */
  const step = steps[qIndex];
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
      {/* hero móvil */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          {/* Botón de Home */}
          <TouchRippleButton
            onClick={() => window.location.href = 'https://visitatlantico.com'}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            rippleColor="rgba(255,255,255,0.3)"
            title="Ir a la página principal"
          >
            <Home className="w-5 h-5" />
          </TouchRippleButton>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold"
          >
            Descubre el Atlántico
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 sm:mt-4 text-lg sm:text-xl text-red-100"
          >
            Creamos tu itinerario perfecto con IA ✨
          </motion.p>
        </div>
      </div>

      {/* progress móvil mejorado */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 sm:-mt-8">
        <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg">
          <div className="flex items-center justify-between">
            {steps.map((_, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-xs sm:text-sm ${
                    idx <= qIndex
                      ? "bg-red-600 text-white scale-105 sm:scale-110"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {idx < qIndex ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                </motion.div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-all ${
                      idx < qIndex ? "bg-red-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* card mejorado móvil */}
      <div className="max-w-4xl mx-auto px-4 mt-6 sm:mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-6 sm:p-12 rounded-3xl shadow-2xl space-y-6 sm:space-y-10"
          >
            {/* Smart suggestions basadas en preferencias anteriores */}
            {preferences.lastItineraries?.length > 0 && qIndex === 1 && (
              <SmartSuggestions preferences={preferences} />
            )}

            <WizardStep step={step} qIndex={qIndex} answers={answers} />

            {/* Selector de ubicación - solo mostrar en el primer paso */}
            {qIndex === 0 && (
              <LocationSelector
                onLocationSelect={(location) => {
                  setLocationData(location);
                }}
                initialLocation={locationData}
              />
            )}

            {/* navegación móvil mejorada */}
            <div className="flex justify-between items-center">
              <TouchRippleButton
                onClick={prev}
                disabled={qIndex === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 py-2 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Anterior</span>
              </TouchRippleButton>

              {qIndex < steps.length - 1 ? (
                <TouchRippleButton
                  onClick={next}
                  disabled={!step.valid}
                  className="bg-red-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  rippleColor="rgba(255,255,255,0.3)"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </TouchRippleButton>
              ) : (
                <TouchRippleButton
                  onClick={generateItinerary}
                  disabled={!step.valid}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  rippleColor="rgba(255,255,255,0.3)"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Generar mi aventura</span>
                  <span className="sm:hidden">Generar</span>
                </TouchRippleButton>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ═════════════════ COMPONENTES AUXILIARES ═════════════════ */

// Componente de paso del wizard
const WizardStep = ({ step, qIndex, answers }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="text-center">
        <motion.h2
          key={step.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold mb-2"
        >
          {step.label}
        </motion.h2>
        {step.helper && (
          <p className="text-gray-500 text-sm sm:text-base">{step.helper}</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {step.element}
      </motion.div>
    </motion.div>
  );
};

// Sugerencias inteligentes
const SmartSuggestions = ({ preferences }: any) => {
  if (!preferences.lastItineraries?.length) return null;

  const allStyles = preferences.lastItineraries
    .flatMap((it: any) => it.styles || [])
    .filter(Boolean);
  
  const styleFrequency = allStyles.reduce((acc: any, style: string) => {
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  
  const topStyles = Object.entries(styleFrequency)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3)
    .map(([style]) => style);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl"
    >
      <p className="text-xs sm:text-sm font-medium mb-2 text-blue-800">
        💡 Basado en tus viajes anteriores
      </p>
      <div className="flex gap-2 flex-wrap">
        {topStyles.map((style: string) => (
          <span
            key={style}
            className="px-2 sm:px-3 py-1 bg-white rounded-full text-xs sm:text-sm shadow-sm"
          >
            {style}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Vista de loading mejorada móvil
const LoadingItinerary = ({ profile, isMobile }: any) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "🤖 Analizando tus preferencias...",
    "📍 Buscando los mejores lugares según tu perfil...",
    "🗺️ Optimizando rutas y horarios...",
    "⭐ Añadiendo recomendaciones especiales...",
    "✨ Finalizando tu aventura perfecta..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const motivoLabels: { [key: string]: string } = {
    "relax": "Relax total",
    "cultura": "Inmersión cultural",
    "aventura": "Aventura activa",
    "gastronomia": "Sabores locales",
    "artesanias": "Artesanías locales",
    "ritmos": "Ritmos y baile",
    "festivales": "Festivales y eventos",
    "deportes-acuaticos": "Deportes acuáticos",
    "avistamiento": "Avistamiento de aves",
    "ecoturismo": "Ecoturismo & manglares",
    "malecon": "Ruta del Malecón",
    "playas-urbanas": "Playas urbanas & relax",
    "historia-portuaria": "Historia portuaria",
    "arte-urbano": "Arte urbano & museos",
    "sabores-marinos": "Ruta de sabores marinos",
    "vida-nocturna": "Vida nocturna chic",
    "bienestar": "Bienestar & spa",
    "mixto": "De todo un poco"
  };

  const getMotivosText = () => {
    if (!profile.motivos || profile.motivos.length === 0) {
      return "Experiencia variada";
    }
    
    const motivosNames = profile.motivos.map((id: string) => 
      motivoLabels[id] || id
    );
    
    if (motivosNames.length === 1) {
      return motivosNames[0];
    } else if (motivosNames.length === 2) {
      return `${motivosNames[0]} y ${motivosNames[1]}`;
    } else {
      return `${motivosNames.slice(0, -1).join(", ")} y ${motivosNames[motivosNames.length - 1]}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <MapPin className="w-full h-full text-red-600 opacity-20" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full opacity-30" />
            </motion.div>
          </div>

          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base sm:text-lg font-medium text-gray-700"
          >
            {messages[currentMessage]}
          </motion.p>

          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-600">
            <p>Creando itinerario de <strong>{profile.days || 1} día{profile.days > 1 ? 's' : ''}</strong></p>
            <p className="mt-1">Enfocado en: <strong>{getMotivosText()}</strong></p>
            {profile.otros !== undefined && (
              <p className="mt-1 text-xs">
                {profile.otros ? "Incluye otros municipios" : "Solo Barranquilla y alrededores"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};