"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Clock, ChevronRight, ChevronLeft,
  Check, Sparkles, X, Save, Maximize2, ChevronUp, ChevronDown, 
  Info, ArrowLeft, Sun, Cloud, Users, Car, Star, TrendingUp,
  AlertCircle, Navigation, Compass, Activity, Coffee, Sunset,
  Map, Target, Zap, Shield, Award, Globe, Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import ItineraryMap from "@/components/ItineraryMap";
import MultiDayItinerary from "@/components/MultiDayItinerary";
import LocationSelector from "@/components/LocationSelector";
import SaveItineraryModal from "@/components/SaveItineraryModal";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Tipos mejorados con más campos para AI inteligente
interface Stop {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  photos?: string[];
  distance: number;
  type: "destination" | "experience" | "restaurant" | "transport";
  cost?: number;
  rating?: number;
  bestTimeToVisit?: string;
  accessibility?: string;
  weatherConsideration?: string;
  localInsight?: string;
  crowdLevel?: "low" | "medium" | "high";
  mustTry?: string[];
  tags?: string[];
}

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

interface UserPreferences {
  budget?: "economico" | "moderado" | "premium";
  pace?: "relajado" | "moderado" | "intenso";
  groupType?: "solo" | "pareja" | "familia" | "amigos" | "negocios";
  accessibility?: boolean;
  transport?: "caminando" | "transporte-publico" | "carro" | "mixto";
  mealPreferences?: string[];
  timePreference?: "madrugador" | "normal" | "nocturno";
}

interface PlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullItineraryView = dynamic(
    () => import("@/components/FullItineraryView"),
    { ssr: false }
  );
  
// Hook para detectar móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

// Componente de Indicadores de Calidad del Itinerario
const QualityIndicators = ({ itinerary, answers }: { itinerary: Stop[], answers: any }) => {
  const calculateScore = () => {
    let score = 0;
    // Variedad de experiencias
    const uniqueCategories = new Set(itinerary.map(s => s.category));
    score += Math.min(uniqueCategories.size * 20, 40);
    
    // Distancias optimizadas
    const avgDistance = itinerary.reduce((sum, s) => sum + s.distance, 0) / itinerary.length;
    if (avgDistance < 5) score += 30;
    else if (avgDistance < 10) score += 20;
    else score += 10;
    
    // Tiempo bien distribuido
    const totalTime = itinerary.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgTime = totalTime / itinerary.length;
    if (avgTime >= 45 && avgTime <= 120) score += 30;
    
    return Math.min(score, 100);
  };

  const score = calculateScore();
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Calidad del Itinerario</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
          itinerary.length >= 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <Target className="w-3.5 h-3.5" />
          <span>{itinerary.length} lugares</span>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
          score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <Activity className="w-3.5 h-3.5" />
          <span>Optimizado</span>
        </div>
        
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700">
          <Star className="w-3.5 h-3.5" />
          <span>IA Verified</span>
        </div>
      </div>
    </div>
  );
};

// Componente mejorado de vista simple con insights profesionales
const SimpleItineraryView = ({
  itinerary,
  answers,
  preferences,
  onReset,
  onOpenFull,
  onSave,
}: {
  itinerary: Stop[];
  answers: any;
  preferences: UserPreferences;
  onReset: () => void;
  onOpenFull: () => void;
  onSave: () => void;
}) => {
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"itinerary" | "insights" | "tips">("itinerary");

  const totalMinutes = itinerary.reduce((s, t) => s + t.durationMinutes, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalMin = totalMinutes % 60;
  const estimatedCost = itinerary.reduce((s, t) => s + (t.cost || 0), 0);

  const isExploring = answers?.days === 0;

  const toggleExpand = (stopId: string) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) newExpanded.delete(stopId);
    else newExpanded.add(stopId);
    setExpandedStops(newExpanded);
  };

  const formatTime = (t: string) => {
    if (!t) return "Flexible";
    if (/^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hh = h % 12 || 12;
      return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
    }
    return t;
  };

  const getCrowdIcon = (level?: string) => {
    switch(level) {
      case 'low': return <Users className="w-3 h-3 text-green-500" />;
      case 'medium': return <Users className="w-3 h-3 text-yellow-500" />;
      case 'high': return <Users className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Header con métricas profesionales */}
      <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Itinerario Inteligente</h3>
            <p className="text-red-100 text-sm mt-1">Optimizado con IA para tu perfil</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Premium</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1.5 opacity-90" />
            <p className="text-lg font-bold">{isExploring ? "Flex" : answers.days}</p>
            <p className="text-xs opacity-80">
              {isExploring ? "Explora" : `día${answers.days > 1 ? "s" : ""}`}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1.5 opacity-90" />
            <p className="text-lg font-bold">{itinerary.length}</p>
            <p className="text-xs opacity-80">paradas</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-90" />
            <p className="text-lg font-bold">{totalH}h</p>
            <p className="text-xs opacity-80">{totalMin > 0 && `${totalMin}m`}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1.5 opacity-90" />
            <p className="text-lg font-bold">${estimatedCost}</p>
            <p className="text-xs opacity-80">estimado</p>
          </div>
        </div>
      </div>

      {/* Indicadores de calidad */}
      <QualityIndicators itinerary={itinerary} answers={answers} />

      {/* Tabs para organizar contenido */}
      <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
        {[
          { id: "itinerary", label: "Itinerario", icon: <Map className="w-3.5 h-3.5" /> },
          { id: "insights", label: "Insights", icon: <Zap className="w-3.5 h-3.5" /> },
          { id: "tips", label: "Tips Pro", icon: <Info className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido según tab activo */}
      <AnimatePresence mode="wait">
        {activeTab === "itinerary" && (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {itinerary.map((stop, index) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(stop.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm shadow-sm ${
                      stop.type === "restaurant" 
                        ? "bg-orange-100 text-orange-600"
                        : stop.type === "transport"
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            {stop.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                            <span>{stop.municipality}</span>
                            {stop.category && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{stop.category}</span>
                              </>
                            )}
                          </p>
                        </div>
                        
                        {stop.rating && (
                          <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{stop.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(stop.startTime)}
                        </span>
                        
                        <span className="text-gray-400">•</span>
                        
                        <span className="text-gray-500">
                          {stop.durationMinutes} min
                        </span>
                        
                        {stop.distance > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Navigation className="w-3 h-3" />
                              {stop.distance.toFixed(1)} km
                            </span>
                          </>
                        )}
                        
                        {stop.crowdLevel && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              {getCrowdIcon(stop.crowdLevel)}
                              <span className="text-gray-500">
                                {stop.crowdLevel === 'low' ? 'Tranquilo' : 
                                 stop.crowdLevel === 'medium' ? 'Moderado' : 'Concurrido'}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                      
                      {stop.tags && stop.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stop.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {expandedStops.has(stop.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
                      <div className="p-4 bg-gradient-to-b from-gray-50 to-white space-y-3">
                        {stop.description && (
                          <p className="text-sm text-gray-600">
                            {stop.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {stop.bestTimeToVisit && (
                            <div className="flex items-start gap-2">
                              <Sun className="w-4 h-4 text-amber-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-gray-700">Mejor hora</p>
                                <p className="text-xs text-gray-600">{stop.bestTimeToVisit}</p>
                              </div>
                            </div>
                          )}
                          
                          {stop.cost !== undefined && (
                            <div className="flex items-start gap-2">
                              <Briefcase className="w-4 h-4 text-green-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-gray-700">Costo estimado</p>
                                <p className="text-xs text-gray-600">${stop.cost}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {stop.localInsight && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800 flex items-start gap-2">
                              <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Insight local:</strong> {stop.localInsight}
                              </span>
                            </p>
                          </div>
                        )}

                        {stop.tip && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800 flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Tip:</strong> {stop.tip}
                              </span>
                            </p>
                          </div>
                        )}
                        
                        {stop.mustTry && stop.mustTry.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Coffee className="w-4 h-4 text-orange-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-700">Imperdibles</p>
                              <p className="text-xs text-gray-600">{stop.mustTry.join(", ")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Análisis de tu ruta
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Distancia total: {itinerary.reduce((s, t) => s + t.distance, 0).toFixed(1)} km</p>
                <p>• Tiempo en transporte: ~{Math.round(itinerary.reduce((s, t) => s + t.distance, 0) * 3)} min</p>
                <p>• Municipios visitados: {new Set(itinerary.map(s => s.municipality)).size}</p>
                <p>• Mix de experiencias: {new Set(itinerary.map(s => s.category)).size} tipos</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Optimizaciones aplicadas
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Ruta optimizada para minimizar desplazamientos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Horarios ajustados según flujo de visitantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Balance entre actividades activas y de descanso</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Consideración del clima típico de la zona</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === "tips" && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Tips de expertos locales
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>💡 Lleva protector solar factor 50+ y repelente</li>
                <li>💡 Hidrátate constantemente, el clima es húmedo</li>
                <li>💡 Usa ropa ligera de colores claros</li>
                <li>💡 Descarga mapas offline antes de salir</li>
                <li>💡 Ten efectivo para sitios locales</li>
                <li>💡 Prueba las arepas de huevo y el raspao</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-600" />
                Clima esperado
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>🌡️ Temperatura: 28-32°C durante el día</p>
                <p>💧 Humedad: 70-85% (alta)</p>
                <p>🌧️ Lluvias: Posibles en la tarde (mayo-nov)</p>
                <p>🌅 Mejor hora para caminar: 6-9 AM o después de 4 PM</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acciones mejoradas */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={onSave}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Guardar Itinerario Inteligente
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenFull}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            Vista completa
          </button>
          <button
            onClick={onReset}
            className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Nuevo plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Vista de loading mejorada con feedback más informativo
const LoadingView = ({ answers, preferences }: { answers: any; preferences: UserPreferences }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    { icon: <Globe className="w-6 h-6" />, text: "Analizando destinos en el Atlántico...", progress: 20 },
    { icon: <Activity className="w-6 h-6" />, text: "Evaluando tu perfil de viajero...", progress: 40 },
    { icon: <Navigation className="w-6 h-6" />, text: "Calculando rutas óptimas...", progress: 60 },
    { icon: <Cloud className="w-6 h-6" />, text: "Verificando condiciones climáticas...", progress: 75 },
    { icon: <Star className="w-6 h-6" />, text: "Añadiendo experiencias exclusivas...", progress: 90 },
    { icon: <Sparkles className="w-6 h-6" />, text: "Finalizando tu aventura perfecta...", progress: 100 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev < phases.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const targetProgress = phases[currentPhase].progress;
    const timer = setTimeout(() => {
      setProgress(targetProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPhase]);

  const getMotivosText = () => {
    if (!answers.motivos || answers.motivos.length === 0) {
      return "Experiencia completa";
    }

    const motivoLabels: { [key: string]: string } = {
      relax: "Relax total",
      cultura: "Inmersión cultural",
      aventura: "Aventura activa",
      gastronomia: "Sabores locales",
      artesanias: "Artesanías únicas",
      ritmos: "Ritmos caribeños",
      festivales: "Festivales vibrantes",
      "deportes-acuaticos": "Deportes acuáticos",
      ecoturismo: "Ecoturismo",
      malecon: "Ruta del Malecón",
    };

    return answers.motivos.map((id: string) => motivoLabels[id] || id).join(" + ");
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 min-h-[450px]">
      {/* Animación del icono principal */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-red-100 to-red-200 opacity-20"
        />
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg flex items-center justify-center text-white"
        >
          {phases[currentPhase].icon}
        </motion.div>
        
        {/* Progreso circular */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-red-600"
            strokeDasharray={377}
            initial={{ strokeDashoffset: 377 }}
            animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Porcentaje */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Fase actual */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-lg font-medium text-gray-800">
          {phases[currentPhase].text}
        </p>
      </motion.div>

      {/* Detalles del procesamiento */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 max-w-md mx-auto border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 text-center">
          Creando tu experiencia personalizada
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
            <span className="text-gray-600">Duración:</span>
            <span className="font-medium text-gray-900">
              {answers.days === 0 ? "Modo exploración" : `${answers.days} día${answers.days > 1 ? 's' : ''}`}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
            <span className="text-gray-600">Enfoque:</span>
            <span className="font-medium text-gray-900">{getMotivosText()}</span>
          </div>
          
          <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
            <span className="text-gray-600">Cobertura:</span>
            <span className="font-medium text-gray-900">
              {answers.otros ? "Todo el Atlántico" : "Barranquilla y cercanías"}
            </span>
          </div>
          
          {preferences.budget && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-600">Presupuesto:</span>
              <span className="font-medium text-gray-900 capitalize">{preferences.budget}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Procesado con IA de última generación</span>
        </div>
      </div>
    </div>
  );
};

// Componente principal del modal mejorado
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
  
  // Nuevas preferencias profesionales
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: "moderado",
    pace: "moderado",
    groupType: "pareja",
    accessibility: false,
    transport: "mixto",
    timePreference: "normal"
  });

  const [qIndex, setQIndex] = useState(0);

  // Estados del planner
  const [view, setView] = useState<"wizard" | "loading" | "simple" | "full">("wizard");
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [locationData, setLocationData] = useState<LocationResult | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
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
      setPreferences({
        budget: "moderado",
        pace: "moderado",
        groupType: "pareja",
        accessibility: false,
        transport: "mixto",
        timePreference: "normal"
      });
    }
  }, [isOpen]);

  // Pasos mejorados con más información profesional
  const steps = [
    {
      label: "¿Cuánto tiempo tienes disponible?",
      helper: "Diseñaremos el itinerario perfecto para tu disponibilidad",
      valid: answers.days !== undefined,
      element: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { days: 0, label: "Explorar ideas", icon: "🔍", desc: "Sin compromiso de fechas", badge: "Flexible" },
              { days: 1, label: "Un día", icon: "☀️", desc: "Tour express optimizado", badge: "8-10 horas" },
              { days: 2, label: "Fin de semana", icon: "🌅", desc: "Experiencia completa", badge: "2 días" },
              { days: 3, label: "Puente festivo", icon: "🏖️", desc: "Inmersión cultural", badge: "3 días" },
              { days: 5, label: "Una semana", icon: "🗓️", desc: "Aventura total", badge: "5-7 días" },
            ].map((opt) => (
              <motion.button
                key={opt.days}
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswers({ ...answers, days: opt.days })}
                className={`relative p-5 rounded-2xl border-2 transition-all ${
                  answers.days === opt.days
                    ? "border-red-600 bg-gradient-to-br from-red-50 to-red-100 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {opt.badge && (
                  <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    answers.days === opt.days
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {opt.badge}
                  </span>
                )}
                <div className="text-3xl mb-3">{opt.icon}</div>
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "¿Qué experiencias te interesan más?",
      helper: "Selecciona hasta 3 para personalizar tu aventura con IA",
      valid: !!answers.motivos && answers.motivos.length > 0 && answers.motivos.length <= 3,
      element: (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {answers.motivos?.length || 0} de 3 seleccionadas
              </span>
              {answers.motivos && answers.motivos.length > 0 && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  IA optimizará tu selección
                </span>
              )}
            </div>
            {answers.motivos && answers.motivos.length > 0 && (
              <button
                onClick={() => setAnswers({ ...answers, motivos: [] })}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-2">
            {[
              { id: "relax", emoji: "🏖️", title: "Relax & Playa", desc: "Sol, arena y descanso", popular: true },
              { id: "cultura", emoji: "🎭", title: "Cultura e Historia", desc: "Museos y patrimonio", popular: true },
              { id: "aventura", emoji: "🚣", title: "Aventura", desc: "Deportes extremos" },
              { id: "gastronomia", emoji: "🍤", title: "Gastronomía", desc: "Sabores caribeños", popular: true },
              { id: "artesanias", emoji: "🎨", title: "Artesanías", desc: "Mercados tradicionales" },
              { id: "ritmos", emoji: "💃", title: "Música y Baile", desc: "Salsa, cumbia y más" },
              { id: "festivales", emoji: "🎪", title: "Festivales", desc: "Carnaval y eventos" },
              { id: "deportes-acuaticos", emoji: "🏄", title: "Deportes Acuáticos", desc: "Kitesurf y buceo" },
              { id: "ecoturismo", emoji: "🌿", title: "Ecoturismo", desc: "Naturaleza y manglares" },
              { id: "malecon", emoji: "🚴", title: "Ruta Malecón", desc: "Bicicletas y caminatas" },
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
                        motivos: answers.motivos?.filter((m) => m !== exp.id) || [],
                      });
                    } else if (canSelect) {
                      setAnswers({
                        ...answers,
                        motivos: [...(answers.motivos || []), exp.id],
                      });
                    }
                  }}
                  disabled={!isSelected && !canSelect}
                  className={`relative w-full p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-[1.02]"
                      : canSelect
                      ? "bg-white border-2 border-gray-200 hover:border-red-300 hover:shadow-md"
                      : "bg-gray-50 border-2 border-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {exp.popular && !isSelected && canSelect && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      Popular
                    </span>
                  )}
                  <span className="text-2xl flex-shrink-0">{exp.emoji}</span>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-sm">{exp.title}</div>
                    <div className={`text-xs ${isSelected ? "text-red-100" : "text-gray-500"}`}>
                      {exp.desc}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      label: "¿Con quién viajas?",
      helper: "Adaptaremos las recomendaciones a tu grupo",
      valid: !!preferences.groupType,
      element: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: "solo", icon: "🚶", label: "Solo", desc: "Aventura personal" },
            { id: "pareja", icon: "💑", label: "Pareja", desc: "Romance y experiencias" },
            { id: "familia", icon: "👨‍👩‍👧‍👦", label: "Familia", desc: "Con niños" },
            { id: "amigos", icon: "👥", label: "Amigos", desc: "Grupo social" },
            { id: "negocios", icon: "💼", label: "Negocios", desc: "Viaje corporativo" },
          ].map((opt) => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreferences({ ...preferences, groupType: opt.id as any })}
              className={`p-4 rounded-xl border-2 transition-all ${
                preferences.groupType === opt.id
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Cuál es tu presupuesto?",
      helper: "Optimizaremos las experiencias según tu rango",
      valid: !!preferences.budget,
      element: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { 
                id: "economico", 
                icon: "💰", 
                label: "Económico", 
                desc: "$50-100/día",
                features: ["Transporte público", "Comida local", "Hospedaje básico"]
              },
              { 
                id: "moderado", 
                icon: "💳", 
                label: "Moderado", 
                desc: "$100-250/día",
                features: ["Taxi/Uber", "Restaurantes variados", "Hotel 3-4⭐"],
                recommended: true
              },
              { 
                id: "premium", 
                icon: "💎", 
                label: "Premium", 
                desc: "$250+/día",
                features: ["Transporte privado", "Fine dining", "Hotel 5⭐"]
              },
            ].map((opt) => (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreferences({ ...preferences, budget: opt.id as any })}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  preferences.budget === opt.id
                    ? "border-red-600 bg-gradient-to-br from-red-50 to-red-100"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {opt.recommended && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Recomendado
                  </span>
                )}
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-bold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-600 mt-1 mb-3">{opt.desc}</div>
                <div className="space-y-1">
                  {opt.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "¿Desde dónde inicias tu aventura?",
      helper: "Optimizaremos las rutas desde tu punto de partida",
      valid: !!locationData,
      element: (
        <div className="max-w-xl mx-auto w-full h-[48vh] sm:h-[55vh] md:h-[60vh] overflow-y-auto overscroll-contain px-1">
          <LocationSelector
            onLocationSelect={setLocationData}
            initialLocation={locationData}
          />
          {!locationData && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5" />
                <span>Selecciona tu ubicación para calcular rutas óptimas y tiempos de traslado precisos</span>
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "¿Quieres explorar más allá de Barranquilla?",
      helper: "Descubre joyas ocultas del Atlántico",
      valid: answers.otros !== undefined,
      element: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                value: true,
                label: "Sí, todo el Atlántico",
                icon: "🗺️",
                desc: "Incluye Santa Verónica, Puerto Colombia, y más",
                highlights: ["Playas vírgenes", "Pueblos pintorescos", "Experiencias únicas"]
              },
              {
                value: false,
                label: "Solo Barranquilla",
                icon: "🏙️",
                desc: "Y municipios cercanos",
                highlights: ["Menos traslados", "Más tiempo en cada lugar", "Ideal para pocos días"]
              },
            ].map((opt) => (
              <motion.button
                key={String(opt.value)}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAnswers({ ...answers, otros: opt.value })}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  answers.otros === opt.value
                    ? "border-red-600 bg-gradient-to-br from-red-50 to-red-100"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="text-3xl mb-3">{opt.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{opt.label}</div>
                <div className="text-sm text-gray-600 mb-3">{opt.desc}</div>
                <div className="space-y-1">
                  {opt.highlights.map((highlight, idx) => (
                    <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "¿Tu email para recibir el itinerario?",
      helper: "Te enviaremos una versión PDF personalizada con mapa interactivo",
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || ""),
      element: (
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <input
              type="email"
              value={answers.email ?? ""}
              onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
              placeholder="tu@email.com"
              className="w-full px-4 py-4 pr-12 text-base border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-all"
              autoComplete="email"
              inputMode="email"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || "") ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-300" />
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-2">Incluye:</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>PDF descargable con mapa</span>
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Links de Google Maps</span>
              </li>
              <li className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Tips exclusivos de locales</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[qIndex];

  const handleNext = useCallback(() => {
    if (qIndex < steps.length - 1) setQIndex((prev) => prev + 1);
  }, [qIndex, steps.length]);

  const handlePrev = useCallback(() => {
    if (qIndex > 0) setQIndex((prev) => prev - 1);
  }, [qIndex]);

  const generateItinerary = useCallback(async () => {
    if (!steps.every((s) => s.valid)) return;

    setView("loading");

    const profile = {
      Días: answers.days === 0 ? "Exploración" : String(answers.days),
      Motivos: answers.motivos?.join(", "),
      "Otros municipios": answers.otros ? "Sí" : "No",
      Email: answers.email,
      // Nuevas preferencias profesionales
      Presupuesto: preferences.budget,
      TipoGrupo: preferences.groupType,
      Transporte: preferences.transport,
      Ritmo: preferences.pace,
      PreferenciaHoraria: preferences.timePreference
    };

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("Gemini API key no configurada");
      }

      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
      );

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          location: locationData,
          preferences,
          action: "generateItinerary",
        }),
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();

      if (data.error || !data.itinerary?.length) {
        throw new Error(data.error || "No se recibieron destinos");
      }

      // Procesamiento mejorado con más campos inteligentes
      const processedItinerary: Stop[] = data.itinerary.map(
        (stop: any, index: number) => {
          const imageFromApi = stop.imageUrl || stop.image || stop.coverImage;
          const imageFromFirebase = stop.imagePath;
          const imageFallback = "/default-place.jpg";

          const photos: string[] =
            stop.photos ||
            stop.images ||
            stop.gallery ||
            (imageFromApi || imageFromFirebase ? [imageFromApi || imageFromFirebase] : []);

          return {
            id: stop.id || `stop-${index + 1}`,
            name: stop.name || `Destino ${index + 1}`,
            description: stop.description || "",
            lat: stop.lat ?? stop.coordinates?.lat ?? 0,
            lng: stop.lng ?? stop.coordinates?.lng ?? 0,
            durationMinutes: stop.durationMinutes || 60,
            tip: stop.tip || "",
            municipality: stop.municipality || stop.city || "Atlántico",
            startTime: stop.startTime || "",
            endTime: stop.endTime || "",
            category: stop.category || "attraction",
            imageUrl: imageFromApi || imageFromFirebase || imageFallback,
            photos,
            distance: stop.distance || 0,
            type: stop.type || "destination",
            // Nuevos campos inteligentes
            cost: stop.cost || 0,
            rating: stop.rating || 4.5,
            bestTimeToVisit: stop.bestTimeToVisit || "Mañana",
            accessibility: stop.accessibility || "Accesible",
            weatherConsideration: stop.weatherConsideration || "",
            localInsight: stop.localInsight || "",
            crowdLevel: stop.crowdLevel || "medium",
            mustTry: stop.mustTry || [],
            tags: stop.tags || []
          };
        }
      );

      setItinerary(processedItinerary);
      setView("simple");
    } catch (error) {
      console.error("Error generando itinerario:", error);
      alert("Error al generar el itinerario. Por favor intenta de nuevo.");
      setView("wizard");
    }
  }, [answers, locationData, preferences, steps]);

  const handleOpenFull = () => setView("full");

  const handleReset = () => {
    setView("wizard");
    setQIndex(0);
    setAnswers({});
    setItinerary(null);
    setLocationData(null);
    setPreferences({
      budget: "moderado",
      pace: "moderado",
      groupType: "pareja",
      accessibility: false,
      transport: "mixto",
      timePreference: "normal"
    });
  };

  const handleSave = () => {
    if (itinerary && itinerary.length > 0) setShowSaveModal(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con blur mejorado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* Panel del modal con diseño profesional */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              fixed inset-x-0 bottom-0 z-[101] bg-white shadow-2xl overflow-hidden
              sm:inset-0 sm:m-auto sm:h-[95vh] sm:max-w-5xl sm:rounded-2xl
              h-[100dvh] rounded-none
            `}
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Header profesional mejorado */}
            {view !== "full" && (
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {view === "wizard" && <Compass className="w-5 h-5 text-red-600" />}
                    {view === "loading" && <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />}
                    {view === "simple" && <Award className="w-5 h-5 text-red-600" />}
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {view === "wizard"
                        ? "Planificador Inteligente de Viajes"
                        : view === "loading"
                        ? "Creando tu experiencia perfecta"
                        : "Tu aventura personalizada está lista"}
                    </h2>
                  </div>
                  {view === "wizard" && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <span>Paso {qIndex + 1} de {steps.length}</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Powered by AI</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            )}

            {/* Progress bar mejorado con indicadores visuales */}
            {view === "wizard" && (
              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex-1 flex items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: idx === qIndex ? 1.1 : 1,
                          boxShadow: idx === qIndex ? "0 0 0 4px rgba(239, 68, 68, 0.2)" : "none"
                        }}
                        className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all text-xs sm:text-sm font-medium ${
                          idx < qIndex
                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                            : idx === qIndex
                            ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-400"
                        }`}
                      >
                        {idx < qIndex ? (
                          <Check className="w-5 h-5" />
                        ) : idx === qIndex ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          idx + 1
                        )}
                        
                        {idx === qIndex && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-red-600"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      
                      {idx < steps.length - 1 && (
                        <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-200">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: idx < qIndex ? "100%" : "0%" }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-green-500 to-green-600"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Labels de progreso en desktop */}
                <div className="hidden sm:flex items-center justify-between max-w-3xl mx-auto mt-2">
                  {steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs text-center flex-1 px-2 ${
                        idx === qIndex ? "text-red-600 font-medium" : "text-gray-400"
                      }`}
                    >
                      {idx === 0 && "Tiempo"}
                      {idx === 1 && "Intereses"}
                      {idx === 2 && "Grupo"}
                      {idx === 3 && "Presupuesto"}
                      {idx === 4 && "Ubicación"}
                      {idx === 5 && "Alcance"}
                      {idx === 6 && "Contacto"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content con mejor espaciado */}
            <div
              className={`
                ${view === "full"
                  ? "h-full"
                  : "px-4 sm:px-6 pt-6 pb-2 sm:pb-6"}
                flex flex-col
                ${view === "wizard" 
                  ? "h-[calc(100dvh-200px)] sm:h-[calc(95vh-220px)]"
                  : "h-[calc(100dvh-140px)] sm:h-[calc(95vh-140px)]"
                }
              `}
            >
              {view === "full" ? (
                <FullItineraryView
                  itinerary={itinerary!}
                  onUpdate={setItinerary}
                  answers={answers}
                  locationData={locationData}
                  onBack={() => setView("simple")}
                  onSave={handleSave}
                />
              ) : (
                <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto overscroll-contain">
                  {view === "wizard" && (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <motion.h3 
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
                        >
                          {currentStep.label}
                        </motion.h3>
                        {"helper" in currentStep && (currentStep as any).helper && (
                          <motion.p 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto"
                          >
                            {(currentStep as any).helper}
                          </motion.p>
                        )}
                      </div>

                      <div className="min-h-[200px]">
                        {currentStep.element}
                      </div>
                    </motion.div>
                  )}

                  {view === "loading" && <LoadingView answers={answers} preferences={preferences} />}

                  {view === "simple" && itinerary && (
                    <SimpleItineraryView
                      itinerary={itinerary}
                      answers={answers}
                      preferences={preferences}
                      onReset={handleReset}
                      onOpenFull={() => setView("full")}
                      onSave={handleSave}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer profesional con navegación mejorada */}
            {view === "wizard" && (
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg">
                <div className="flex justify-between items-center max-w-3xl mx-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    disabled={qIndex === 0}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${qIndex === 0 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-md"
                      }
                    `}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </motion.button>

                  <div className="flex items-center gap-3">
                    {/* Indicador de validación */}
                    {!currentStep.valid && qIndex === steps.length - 1 && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        Completa todos los campos
                      </span>
                    )}
                    
                    {qIndex < steps.length - 1 ? (
                      <motion.button
                        whileHover={currentStep.valid ? { scale: 1.05 } : {}}
                        whileTap={currentStep.valid ? { scale: 0.95 } : {}}
                        onClick={handleNext}
                        disabled={!currentStep.valid}
                        className={`
                          px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 font-medium
                          ${currentStep.valid
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-xl"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }
                        `}
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={currentStep.valid ? { scale: 1.02 } : {}}
                        whileTap={currentStep.valid ? { scale: 0.98 } : {}}
                        onClick={generateItinerary}
                        disabled={!currentStep.valid}
                        className={`
                          px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-bold
                          ${currentStep.valid
                            ? "bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white shadow-xl hover:shadow-2xl"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }
                        `}
                      >
                        <Zap className="w-5 h-5" />
                        <span>Generar con IA</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {/* Helper text */}
                {qIndex === steps.length - 1 && currentStep.valid && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-3"
                  >
                    <p className="text-xs text-gray-500">
                      🚀 Tu itinerario será generado en segundos usando IA avanzada
                    </p>
                  </motion.div>
                )}
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

PlannerModal.displayName = "PlannerModal";

export default PlannerModal;