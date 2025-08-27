"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Clock, ChevronRight, ChevronLeft,
  Check, Sparkles, X, Save, Share2, Download, Home,
  Shuffle, Settings, Navigation, Plus, Coffee, WifiOff,
  CalendarDays, Trash2, GripVertical, Edit3, ArrowRight,
  ArrowLeft, Menu, Maximize2, MoreVertical, List, Grid,
  ExternalLink, Info, ChevronUp, ChevronDown, PlusCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import ItineraryMap from "@/components/ItineraryMap";
import MultiDayItinerary from "@/components/MultiDayItinerary";
import LocationSelector from "@/components/LocationSelector";
import SaveItineraryModal from "@/components/SaveItineraryModal";
import { toMin, toHHMM } from "@/utils/itinerary-helpers";

// Tipos
interface Stop {
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
  distance: number;
  type: "destination" | "experience";
}

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

interface PlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hook para detectar móvil
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

// Componente de vista simplificada del itinerario
const SimpleItineraryView = ({ 
  itinerary, 
  answers, 
  onReset, 
  onOpenFull,
  onSave 
}: {
  itinerary: Stop[];
  answers: any;
  onReset: () => void;
  onOpenFull: () => void;
  onSave: () => void;
}) => {
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());

  const totalH = Math.round(
    itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
  );
  const totalMin = itinerary.reduce((s, t) => s + t.durationMinutes, 0) % 60;

  const toggleExpand = (stopId: string) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) {
      newExpanded.delete(stopId);
    } else {
      newExpanded.add(stopId);
    }
    setExpandedStops(newExpanded);
  };

  const formatTime = (t: string) => {
    if (!t) return "Hora no disponible";
    if (/^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hh = h % 12 || 12;
      return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
    }
    return t;
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Resumen */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-4">
        <h3 className="text-lg font-bold mb-3">¡Tu aventura está lista!</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <Calendar className="w-6 h-6 mx-auto mb-1 opacity-90" />
            <p className="text-xl font-bold">{answers.days}</p>
            <p className="text-xs opacity-80">día{answers.days > 1 ? 's' : ''}</p>
          </div>
          <div>
            <MapPin className="w-6 h-6 mx-auto mb-1 opacity-90" />
            <p className="text-xl font-bold">{itinerary.length}</p>
            <p className="text-xs opacity-80">lugares</p>
          </div>
          <div>
            <Clock className="w-6 h-6 mx-auto mb-1 opacity-90" />
            <p className="text-xl font-bold">{totalH}h</p>
            <p className="text-xs opacity-80">{totalMin > 0 && `${totalMin}m`}</p>
          </div>
        </div>
      </div>

      {/* Lista de paradas */}
      <div className="space-y-3">
        {itinerary.map((stop, index) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div 
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(stop.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">{stop.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{stop.municipality}</p>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(stop.startTime)}
                    </span>
                    <span>{stop.durationMinutes} min</span>
                    {stop.distance && <span>· {Math.round(stop.distance)} km</span>}
                  </div>
                </div>

                {expandedStops.has(stop.id) ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedStops.has(stop.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-3 bg-gray-50">
                    {stop.description && (
                      <p className="text-xs text-gray-600 mb-2">{stop.description}</p>
                    )}
                    
                    {stop.tip && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2">
                        <p className="text-xs text-amber-800 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {stop.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Acciones */}
      <div className="space-y-3 pt-4 border-t">
        <button
          onClick={onSave}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Guardar Itinerario
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenFull}
            className="bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            Ver completo
          </button>
          <button
            onClick={onReset}
            className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            Nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

// Vista completa del itinerario dentro del modal
const FullItineraryView = ({ 
  itinerary, 
  onUpdate,
  answers, 
  locationData,
  onBack,
  onSave 
}: {
  itinerary: Stop[];
  onUpdate: (stops: Stop[]) => void;
  answers: any;
  locationData: LocationResult | null;
  onBack: () => void;
  onSave: () => void;
}) => {
  const [showMap, setShowMap] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-full flex flex-col">
      {/* Header con navegación */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Vista simple</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`p-2 rounded-lg transition-colors ${
              showMap ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            Guardar
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Mapa (si está activado) */}
          {showMap && (
            <div className="h-64 rounded-xl overflow-hidden shadow-lg">
              <ItineraryMap 
                stops={itinerary} 
                userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null} 
              />
            </div>
          )}

          {/* Itinerario completo */}
          <MultiDayItinerary
            itinerary={itinerary}
            onItineraryUpdate={onUpdate}
            days={answers.days || 1}
            userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null}
          />
        </div>
      </div>
    </div>
  );
};

// Vista de loading
const LoadingView = ({ answers }: { answers: any }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "🤖 Analizando tus preferencias...",
    "📍 Buscando los mejores lugares...",
    "🗺️ Optimizando rutas...",
    "⭐ Añadiendo recomendaciones...",
    "✨ Finalizando tu aventura..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMotivosText = () => {
    if (!answers.motivos || answers.motivos.length === 0) {
      return "Experiencia variada";
    }
    
    const motivoLabels: { [key: string]: string } = {
      "relax": "Relax total",
      "cultura": "Inmersión cultural",
      "aventura": "Aventura activa",
      "gastronomia": "Sabores locales",
      "artesanias": "Artesanías locales",
      "ritmos": "Ritmos y baile",
      "festivales": "Festivales y eventos",
      "deportes-acuaticos": "Deportes acuáticos",
      "ecoturismo": "Ecoturismo & manglares",
      "malecon": "Ruta del Malecón"
    };
    
    const motivosNames = answers.motivos.map((id: string) => 
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
    <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
      <div className="relative w-24 h-24 mx-auto mb-6">
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
          <div className="w-12 h-12 bg-red-600 rounded-full opacity-30" />
        </motion.div>
      </div>

      <motion.p
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-medium text-gray-700 mb-4"
      >
        {messages[currentMessage]}
      </motion.p>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 max-w-sm mx-auto">
        <p>Creando itinerario de <strong>{answers.days || 1} día{answers.days > 1 ? 's' : ''}</strong></p>
        <p className="mt-1">Enfocado en: <strong>{getMotivosText()}</strong></p>
        {answers.otros !== undefined && (
          <p className="mt-1 text-xs">
            {answers.otros ? "Incluye otros municipios" : "Solo Barranquilla y alrededores"}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente principal del modal
const PlannerModal = memo(({ isOpen, onClose }: PlannerModalProps) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  
  // Estados del wizard
  const [answers, setAnswers] = useState<{
    days?: number;
    motivos?: string[];
    otros?: boolean;
    email?: string;
  }>({});
  const [qIndex, setQIndex] = useState(0);
  
  // Estados del planner
  const [view, setView] = useState<"wizard" | "loading" | "simple" | "full">("wizard");
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [locationData, setLocationData] = useState<LocationResult | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setView("wizard");
      setQIndex(0);
      setAnswers({});
      setItinerary(null);
      setLocationData(null);
    }
  }, [isOpen]);

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
            <motion.button
              key={opt.days}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnswers({ ...answers, days: opt.days })}
              className={`p-4 sm:p-6 rounded-2xl border-2 transition-all ${
                answers.days === opt.days
                  ? "border-red-600 bg-red-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">{opt.icon}</div>
              <div className="font-semibold text-sm sm:text-base">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Qué tipo de experiencias buscas?",
      helper: "Elige hasta 3 opciones",
      valid: answers.motivos && answers.motivos.length > 0 && answers.motivos.length <= 3,
      element: (
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-sm text-gray-600">
              {answers.motivos?.length || 0} de 3 seleccionadas
            </span>
            {answers.motivos && answers.motivos.length > 0 && (
              <button
                onClick={() => setAnswers({ ...answers, motivos: [] })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpiar
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-2">
            {[
              { id: "relax", emoji: "🏖️", title: "Relax total", desc: "Playas y descanso" },
              { id: "cultura", emoji: "🎭", title: "Cultura", desc: "Museos e historia" },
              { id: "aventura", emoji: "🚣", title: "Aventura", desc: "Deportes y naturaleza" },
              { id: "gastronomia", emoji: "🍤", title: "Gastronomía", desc: "Comida típica" },
              { id: "artesanias", emoji: "🎨", title: "Artesanías", desc: "Mercados locales" },
              { id: "ritmos", emoji: "💃", title: "Baile", desc: "Salsa y cumbia" },
              { id: "festivales", emoji: "🎪", title: "Festivales", desc: "Carnaval y ferias" },
              { id: "deportes-acuaticos", emoji: "🏄", title: "Acuáticos", desc: "Kitesurf y más" },
              { id: "ecoturismo", emoji: "🌿", title: "Ecoturismo", desc: "Manglares" },
              { id: "malecon", emoji: "🚴", title: "Malecón", desc: "Bicis y caminatas" },
            ].map((exp) => {
              const isSelected = answers.motivos?.includes(exp.id) || false;
              const canSelect = !isSelected && (answers.motivos?.length || 0) < 3;
              
              return (
                <motion.button
                  key={exp.id}
                  whileTap={isSelected || canSelect ? { scale: 0.98 } : {}}
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
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                      : canSelect
                      ? "bg-white border border-gray-200 hover:shadow-md hover:border-red-300"
                      : "bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{exp.emoji}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{exp.title}</div>
                    <div className={`text-xs ${
                      isSelected ? "text-red-100" : "text-gray-500"
                    }`}>
                      {exp.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      label: "¿Explorar otros municipios?",
      valid: answers.otros !== undefined,
      element: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: true, label: "Sí, aventurémonos", icon: "🚗", desc: "Más lugares del Atlántico" },
            { value: false, label: "Solo Barranquilla", icon: "🏘️", desc: "Y alrededores" }
          ].map((opt) => (
            <motion.button
              key={String(opt.value)}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAnswers({ ...answers, otros: opt.value })}
              className={`p-5 rounded-2xl border-2 transition-all ${
                answers.otros === opt.value
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-3">{opt.icon}</div>
              <div className="font-semibold mb-1 text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Tu email para el itinerario?",
      helper: "Te lo enviamos personalizado",
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || ""),
      element: (
        <div className="max-w-md mx-auto">
          <input
            type="email"
            value={answers.email ?? ""}
            onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-2xl focus:border-red-500 focus:outline-none transition-all"
            autoComplete="email"
            inputMode="email"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            No spam, solo tu itinerario 🎉
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[qIndex];

  const handleNext = useCallback(() => {
    if (qIndex < steps.length - 1) {
      setQIndex(prev => prev + 1);
    }
  }, [qIndex]);

  const handlePrev = useCallback(() => {
    if (qIndex > 0) {
      setQIndex(prev => prev - 1);
    }
  }, [qIndex]);

  const generateItinerary = useCallback(async () => {
    if (!steps.every((s) => s.valid)) return;
    
    setView("loading");
    
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
          location: locationData
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error || !data.itinerary?.length) {
        throw new Error(data.error || "No se recibieron destinos");
      }

      const processedItinerary: Stop[] = data.itinerary.map((stop: any, index: number) => ({
        id: stop.id,
        name: stop.name || `Destino ${index + 1}`,
        description: stop.description,
        lat: stop.lat,
        lng: stop.lng,
        durationMinutes: stop.durationMinutes || 60,
        tip: stop.tip,
        municipality: stop.municipality || "Ubicación",
        startTime: stop.startTime,
        category: stop.category || "attraction",
        imageUrl: stop.imageUrl || "/default-place.jpg",
        photos: stop.photos,
        distance: 0,
        type: stop.type
      }));
      
      setItinerary(processedItinerary);
      setView("simple");
    } catch (error) {
      console.error("Error generando itinerario:", error);
      alert("Error al generar el itinerario. Por favor intenta de nuevo.");
      setView("wizard");
    }
  }, [answers, locationData, steps]);

  const handleOpenFull = () => {
    setView("full");
  };

  const handleReset = () => {
    setView("wizard");
    setQIndex(0);
    setAnswers({});
    setItinerary(null);
    setLocationData(null);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-[101] bg-white shadow-2xl overflow-hidden ${
              view === "full" 
                ? "top-0 rounded-none" 
                : "rounded-t-3xl max-h-[90vh]"
            }`}
          >
            {/* Header */}
            {view !== "full" && (
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {view === "wizard" ? "Planifica tu aventura" : 
                     view === "loading" ? "Preparando tu itinerario" : 
                     "Tu aventura personalizada"}
                  </h2>
                  {view === "wizard" && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Paso {qIndex + 1} de {steps.length}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
            
            {/* Progress bar - solo en wizard */}
            {view === "wizard" && (
              <div className="px-4 sm:px-6 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  {steps.map((_, idx) => (
                    <div key={idx} className="flex-1 flex items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-xs sm:text-sm font-medium ${
                          idx <= qIndex
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {idx < qIndex ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 transition-all ${
                            idx < qIndex ? "bg-red-600" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className={`${view === "full" ? "h-full" : "px-4 sm:px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]"}`}>
              {view === "full" ? (
                <FullItineraryView
                  itinerary={itinerary!}
                  onUpdate={setItinerary}
                  answers={answers}
                  locationData={locationData}
                  onBack={() => setView("simple")}
                  onSave={() => setShowSaveModal(true)}
                />
              ) : (
                <div className="max-w-2xl mx-auto">
                  {view === "wizard" && (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">
                          {currentStep.label}
                        </h3>
                        {currentStep.helper && (
                          <p className="text-gray-500 text-sm">
                            {currentStep.helper}
                          </p>
                        )}
                      </div>
                      
                      <div>{currentStep.element}</div>
                      
                      {/* Location selector en el primer paso */}
                      {qIndex === 0 && (
                        <ModalLocationSelector
                          onLocationSelect={setLocationData}
                          initialLocation={locationData}
                        />
                      )}
                    </motion.div>
                  )}
                  
                  {view === "loading" && <LoadingView answers={answers} />}
                  
                  {view === "simple" && itinerary && (
                    <SimpleItineraryView 
                      itinerary={itinerary}
                      answers={answers}
                      onReset={handleReset}
                      onOpenFull={handleOpenFull}
                      onSave={() => setShowSaveModal(true)}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Footer with navigation - solo en wizard */}
            {view === "wizard" && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center max-w-2xl mx-auto">
                  <button
                    onClick={handlePrev}
                    disabled={qIndex === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>

                  {qIndex < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={!currentStep.valid}
                      className="bg-red-600 text-white px-6 py-2.5 rounded-full shadow hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base font-medium"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={generateItinerary}
                      disabled={!currentStep.valid}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generar itinerario
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Modal de guardar */}
          {showSaveModal && itinerary && (
            <SaveItineraryModal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              days={answers.days || 1}
              answers={answers}
              itinerary={itinerary}
              locationData={locationData}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
});

PlannerModal.displayName = 'PlannerModal';

export default PlannerModal;