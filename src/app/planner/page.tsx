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
import SaveItineraryModal from "@/components/SaveItineraryModal";

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
  Save,
  WifiOff,
} from "lucide-react";
import Image from "next/image";

/* ─────────── tipos & helpers ─────────── */

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
  
  /* wizard answers - ACTUALIZADO para manejar motivos como array */
  const [answers, setAnswers] = useState<{
    days?: number;
    motivos?: string[]; // CAMBIADO de motivo a motivos (array)
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

  /* estado para el modal de guardar */
  const [showSaveModal, setShowSaveModal] = useState(false);

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
      helper: "Elige hasta 3 opciones que más te atraigan",
      valid: answers.motivos && answers.motivos.length > 0 && answers.motivos.length <= 3,
      element: (
        <div className="space-y-2 sm:space-y-2.5">
          {/* Indicador de selección */}
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
          
          {/* Grid de opciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {[
              // Opciones originales
              { id: "relax", emoji: "🏖️", title: "Relax total", desc: "Playas, spa y descanso" },
              { id: "cultura", emoji: "🎭", title: "Inmersión cultural", desc: "Museos, historia y tradiciones" },
              { id: "aventura", emoji: "🚣", title: "Aventura activa", desc: "Deportes y naturaleza" },
              { id: "gastronomia", emoji: "🍤", title: "Sabores locales", desc: "Comida típica y mercados" },
              
              // Nuevas opciones
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
                <motion.button
                  key={exp.id}
                  whileHover={!isMobile && (isSelected || canSelect) ? { scale: 1.02 } : {}}
                  whileTap={isSelected || canSelect ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (isSelected) {
                      // Deseleccionar
                      setAnswers({
                        ...answers,
                        motivos: answers.motivos?.filter(m => m !== exp.id) || []
                      });
                    } else if (canSelect) {
                      // Seleccionar (solo si hay menos de 3)
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
                </motion.button>
              );
            })}
          </div>
          
          {/* Mensaje de ayuda */}
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
            <motion.button
              key={String(opt.value)}
              whileHover={!isMobile ? { scale: 1.03 } : {}}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAnswers({ ...answers, otros: opt.value })}
              className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                answers.otros === opt.value
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-3">{opt.icon}</div>
              <div className="font-semibold mb-1 text-sm sm:text-base">{opt.label}</div>
              <div className="text-xs sm:text-sm text-gray-500">{opt.desc}</div>
            </motion.button>
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
            autoComplete="email"
            inputMode="email"
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
      // Scroll to top cuando se cambia de paso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prev = () => {
    if (qIndex > 0) {
      setQIndex((i) => i - 1);
      // Scroll to top cuando se cambia de paso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* API & itinerario */
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [view, setView] = useState<"questions" | "loading" | "itinerary">("questions");

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

  const generateItinerary = async () => {
    if (!steps.every((s) => s.valid)) return;
    setView("loading");
    
    // Guardar preferencias del usuario - ACTUALIZADO para múltiples motivos
    updatePreferences({
      travelStyles: answers.motivos, // Cambiado a plural
      lastItineraries: [...(preferences.lastItineraries || []), {
        date: new Date().toISOString(),
        days: answers.days,
        styles: answers.motivos // Cambiado a plural
      }].slice(-5) // Mantener solo los últimos 5
    });
    
    const profile = {
      Días: String(answers.days),
      Motivos: answers.motivos?.join(", "), // ACTUALIZADO: unir los motivos con comas
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

  /* ═════ vista loading mejorada ════ */
  if (view === "loading") {
    return <LoadingItinerary profile={answers} isMobile={isMobile} />;
  }

  /* ═════ vista itinerario mejorada para móvil ════ */
  if (view === "itinerary" && itinerary) {
    const totalH = Math.round(
      itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
    );
    const days = answers.days ?? 1;

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
        {/* HERO móvil-first - OPTIMIZADO */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Botones de navegación - ahora en su propia fila */}
            <div className="flex justify-between items-center pt-4 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = 'https://visitatlantico.com'}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="Ir a la página principal"
                >
                  <Home className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Regresar al inicio? Se perderá el itinerario actual.")) {
                      setView("questions");
                      setQIndex(0);
                      setItinerary(null);
                    }
                  }}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="Crear nuevo itinerario"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Contenido del header con padding apropiado */}
            <div className="text-center py-6 sm:py-10">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-5xl font-extrabold px-2"
              >
                Tu Aventura Generada
              </motion.h1>
              {locationData?.address && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-sm sm:text-lg"
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
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-4 sm:-mt-8 space-y-6 sm:space-y-10">
          {/* resumen mejorado móvil */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl space-y-4 sm:space-y-6"
          >
            <h2 className="text-xl sm:text-3xl font-bold">Resumen de tu aventura</h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div className="space-y-1 sm:space-y-2">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-lg sm:text-2xl font-bold">{days}</p>
                <p className="text-xs sm:text-sm text-gray-500">día{days > 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-lg sm:text-2xl font-bold">{itinerary.length}</p>
                <p className="text-xs sm:text-sm text-gray-500">paradas</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
                <p className="text-lg sm:text-2xl font-bold">{totalH}</p>
                <p className="text-xs sm:text-sm text-gray-500">horas</p>
              </div>
            </div>
            
            {/* Nuevo botón único de guardar */}
            <motion.button
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSaveModal(true)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3.5 rounded-full inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold gap-3"
            >
              <Save className="w-5 h-5 sm:w-6 sm:h-6" />
              Guardar Itinerario
            </motion.button>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                <span>Acceso sin crear cuenta</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <WifiOff className="w-4 h-4 text-blue-600" />
                <span>Disponible sin conexión</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>Comparte con un link único</span>
              </div>
            </div>
          </motion.section>

          {/* mapa - altura reducida en móvil */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-64 sm:h-96 map-container"
          >
            <ItineraryMap stops={itinerary} userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null} />
          </motion.div>

          {/* USAR EL NUEVO COMPONENTE MULTI-DAY */}
          <MultiDayItinerary
  itinerary={itinerary as any}
  onItineraryUpdate={(newItinerary: any) => setItinerary(newItinerary)}
  days={days}
  userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null}
/>
        </div>

        {/* Panel de ajustes rápidos flotante */}
        <QuickCustomize 
          itinerary={itinerary} 
          onUpdate={setItinerary} 
          isMobile={isMobile} 
          location={locationData ? { lat: locationData.lat, lng: locationData.lng } : null}
        />

        {/* Modal de guardar itinerario */}
        <SaveItineraryModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          days={days}
          answers={answers}
          itinerary={itinerary}
          locationData={locationData}
        />
      </main>
    );
  }

  /* ═════ wizard mejorado móvil ════ */
  const step = steps[qIndex];
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-safe">
      {/* hero móvil - OPTIMIZADO */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Botón de Home en su propia fila */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => window.location.href = 'https://visitatlantico.com'}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              title="Ir a la página principal"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          
          {/* Contenido del header */}
          <div className="text-center py-6 sm:py-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-6xl font-extrabold px-2"
            >
              Descubre el Atlántico
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 sm:mt-4 text-base sm:text-xl text-red-100"
            >
              Creamos tu itinerario perfecto con IA ✨
            </motion.p>
          </div>
        </div>
      </div>

      {/* progress móvil mejorado */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 sm:-mt-6">
        <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg">
          <div className="flex items-center justify-between">
            {steps.map((_, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-xs sm:text-sm font-medium ${
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
            className="bg-white p-5 sm:p-12 rounded-2xl sm:rounded-3xl shadow-2xl space-y-5 sm:space-y-10"
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
            <div className="flex justify-between items-center pt-2">
              <motion.button
                whileHover={!isMobile ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={prev}
                disabled={qIndex === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">Atrás</span>
              </motion.button>

              {qIndex < steps.length - 1 ? (
                <motion.button
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  disabled={!step.valid}
                  className="bg-red-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateItinerary}
                  disabled={!step.valid}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Generar mi aventura</span>
                  <span className="sm:hidden">Generar</span>
                </motion.button>
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
      className="space-y-5 sm:space-y-8"
    >
      <div className="text-center">
        <motion.h2
          key={step.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-3xl font-bold mb-2"
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

// Sugerencias inteligentes - ACTUALIZADO para múltiples estilos
const SmartSuggestions = ({ preferences }: any) => {
  if (!preferences.lastItineraries?.length) return null;

  // Obtener los estilos más frecuentes de viajes anteriores
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
      className="mb-3 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl"
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

// Vista de loading mejorada móvil - ACTUALIZADA para mostrar múltiples estilos
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
  }, []);

  // Mapeo de IDs de motivos a nombres legibles
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

  // Obtener los nombres legibles de los motivos seleccionados
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
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
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
            className="text-sm sm:text-lg font-medium text-gray-700"
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

// Panel de ajustes rápidos móvil
const QuickCustomize = ({ itinerary, onUpdate, isMobile, location }: { 
  itinerary: Stop[]; 
  onUpdate: (stops: Stop[]) => void; 
  isMobile: boolean;
  location: { lat: number; lng: number } | null;
}) => {  
  const [showPanel, setShowPanel] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [breakForm, setBreakForm] = useState({
    name: "",
    description: "",
    duration: 30
  });
  const router = useRouter();

  const handleAddBreak = () => {
    if (!breakForm.name.trim()) {
      alert("Por favor ingresa un nombre para el descanso");
      return;
    }

    // Crear nueva parada de descanso
    const breakStop: Stop = {
      id: `break-${Date.now()}`,
      name: breakForm.name,
      description: breakForm.description || "Tiempo para descansar",
      lat: itinerary[Math.floor(itinerary.length / 2)]?.lat || 10.9,
      lng: itinerary[Math.floor(itinerary.length / 2)]?.lng || -74.9,
      startTime: "12:00",
      durationMinutes: breakForm.duration,
      category: "Descanso",
      municipality: "Tu ubicación",
      distance: 0,
      type: "experience",
      imageUrl: "/images/rest-placeholder.jpg",
      tip: "Aprovecha para hidratarte y recargar energías"
    };

    // Insertar el descanso en el medio del itinerario
    const midPoint = Math.floor(itinerary.length / 2);
    const updatedItinerary = [
      ...itinerary.slice(0, midPoint),
      breakStop,
      ...itinerary.slice(midPoint)
    ];

    // Recalcular tiempos
    const recalculateTimings = (stops: Stop[]): Stop[] => {
      let current = 9 * 60; // 09:00 en minutos
      return stops.map((stop, idx) => {
        if (idx > 0) {
          current += 30; // 30 min de viaje entre paradas
        }
        const startTime = `${Math.floor(current / 60).toString().padStart(2, "0")}:${(current % 60).toString().padStart(2, "0")}`;
        current += stop.durationMinutes || 60;
        return { ...stop, startTime };
      });
    };
    
    const recalculated = recalculateTimings(updatedItinerary);
    
    onUpdate(recalculated);
    setShowBreakModal(false);
    setBreakForm({ name: "", description: "", duration: 30 });
    setShowPanel(false);
  };

  const handleRegenerate = () => {
    if (confirm("¿Estás seguro de que quieres generar un nuevo itinerario? Se perderán los cambios actuales.")) {
      router.refresh();
      window.location.reload();
    }
  };

  const quickActions = [
    {
      id: "add-destination",
      icon: <Plus className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: isMobile ? "Destino" : "Agregar Destino",
      action: () => {
        setShowAddModal(true);
        setShowPanel(false);
      }
    },
    {
      id: "add-break",
      icon: <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: isMobile ? "Descanso" : "Agregar Descanso",
      action: () => {
        setShowBreakModal(true);
        setShowPanel(false);
      }
    },
    {
      id: "regenerate",
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: isMobile ? "Regenerar" : "Re-Generar Ruta",
      action: handleRegenerate
    }
  ];

  return (
    <>
      <motion.button
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-lg z-40"
        whileHover={!isMobile ? { scale: 1.1 } : {}}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
      >
        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${isMobile ? 'bottom-36 right-4 left-4' : 'bottom-44 right-6'} bg-white rounded-2xl shadow-2xl p-4 z-40 ${isMobile ? '' : 'w-64'}`}
          >
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Ajustes rápidos</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={!isMobile ? { x: 5 } : {}}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 text-left transition-all text-sm sm:text-base"
                >
                  <div className="text-red-600">{action.icon}</div>
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para agregar descanso - adaptado móvil */}
      <AnimatePresence>
        {showBreakModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowBreakModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-4">Agregar Descanso o Actividad</h3>
              
              <div className="space-y-4">
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
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBreakModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBreak}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para agregar destinos */}
      <AnimatePresence>
        {showAddModal && (
          <AddDestinationModal
            onClose={() => setShowAddModal(false)}
            onAdd={(newStop: Stop) => {
              // Calcular el tiempo de inicio basado en la última parada
              const lastStop = itinerary[itinerary.length - 1];
              const startMin = lastStop 
                ? toMin(lastStop.startTime) + lastStop.durationMinutes + 30
                : 9 * 60; // 9:00 AM si no hay paradas

              const stopWithTime = {
                ...newStop,
                startTime: toHHMM(startMin),
                durationMinutes: newStop.durationMinutes || 60
              };
              const updatedStops = [...itinerary, stopWithTime];
              onUpdate(updatedStops);
              setShowAddModal(false);
            }}
            currentStops={itinerary}
            userLocation={location}
          />
        )}
      </AnimatePresence>
    </>
  );
};