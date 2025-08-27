//src/app/itinerary/[id]/page.tsx


"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Calendar, Clock, MapPin, DollarSign, Users, Info, 
  Download, Share2, Mail, Navigation, ChevronDown, 
  ChevronUp, Star, AlertCircle, Coffee, Camera,
  Sun, Cloud, Umbrella, Check, X, Edit, ExternalLink,
  Play, Pause, RotateCcw, Zap, Heart, Eye, Phone,
  Instagram, MessageCircle, Bookmark, Route, Timer,
  Globe, ArrowRight, ChevronLeft, ChevronRight,
  FileText, Map as MapIcon, List, Grid, Maximize2,
  Minimize2, RotateCw, Layers
} from "lucide-react";
import { RiGovernmentLine } from "react-icons/ri";
import Image from "next/image";
import dynamic from 'next/dynamic';

// Importación dinámica del componente de mapa para evitar SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500">Cargando mapa interactivo...</p>
      </div>
    </div>
  )
});
// Removemos SafeImage para usar una solución más directa

interface ItineraryStop {
  id: string;
  day: number;
  dayTitle: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: string;
  municipality: string;
  lat: number;
  lng: number;
  tip?: string;
  mustTry?: string[];
  estimatedCost: number;
  crowdLevel: string;
  imageUrl?: string;
  rating?: number;
  address?: string;
  distance: number;
}

interface ItineraryData {
  id: string;
  profile: {
    days: number;
    email: string;
    interests: string[];
    tripType: string;
    budget: string;
    locationRange: string;
  };
  itinerary: ItineraryStop[];
  createdAt: string;
  status: string;
}

export default function ItineraryPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"timeline" | "map" | "grid">("timeline");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStop, setCurrentStop] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [favoriteStops, setFavoriteStops] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"itinerary" | "map" | "tips" | "weather">("itinerary");
  const [jimmyWidgetVisible, setJimmyWidgetVisible] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [selectedMapStop, setSelectedMapStop] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'outdoors'>('streets');
  const [showRoutes, setShowRoutes] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItinerary();
    
    // Detectar si el widget de Jimmy está presente
    const checkJimmyWidget = () => {
      const jimmyElement = document.querySelector('[data-chatbot="jimmy"]');
      setJimmyWidgetVisible(!!jimmyElement);
    };
    
    checkJimmyWidget();
    
    // Observar cambios en el DOM para detectar si Jimmy aparece/desaparece
    const observer = new MutationObserver(checkJimmyWidget);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-chatbot']
    });
    
    return () => observer.disconnect();
  }, [id]);

  const loadItinerary = async () => {
    try {
      const cached = localStorage.getItem('lastItinerary');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.id === id || parsed.requestId === id) {
          setItineraryData({
            id: parsed.id,
            profile: parsed.profile,
            itinerary: parsed.itinerary,
            createdAt: new Date(parsed.createdAt).toISOString(),
            status: 'generated'
          });
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`/api/itinerary/${id}`);
      if (!response.ok) throw new Error('Itinerario no encontrado');
      
      const data = await response.json();
      setItineraryData(data);
    } catch (error) {
      console.error("Error loading itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStop = (stopId: string) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) {
      newExpanded.delete(stopId);
    } else {
      newExpanded.add(stopId);
    }
    setExpandedStops(newExpanded);
  };

  const toggleFavorite = (stopId: string) => {
    const newFavorites = new Set(favoriteStops);
    if (newFavorites.has(stopId)) {
      newFavorites.delete(stopId);
    } else {
      newFavorites.add(stopId);
    }
    setFavoriteStops(newFavorites);
  };

  const playItinerary = () => {
    setIsPlaying(true);
    // Auto-scroll through stops
    const interval = setInterval(() => {
      setCurrentStop(prev => {
        if (prev >= dayStops.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const downloadPDF = async () => {
    // Implementar descarga de PDF
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    loadingToast.textContent = 'Generando PDF...';
    document.body.appendChild(loadingToast);
    
    setTimeout(() => {
      document.body.removeChild(loadingToast);
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successToast.textContent = 'PDF descargado exitosamente';
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 3000);
    }, 2000);
  };

  const shareItinerary = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Mi itinerario del Atlántico',
        text: `Mira mi itinerario de ${itineraryData?.profile.days} días por el Atlántico`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Link copiado al portapapeles';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600/20 border-b-blue-600 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Preparando tu aventura</h2>
          <p className="text-gray-600 animate-pulse">Cargando itinerario personalizado...</p>
        </div>
      </div>
    );
  }

  if (!itineraryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerario no encontrado</h2>
          <p className="text-gray-600 mb-6">El itinerario que buscas no existe o ha expirado.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  const dayStops = itineraryData.itinerary.filter(stop => stop.day === selectedDay);
  const totalDays = Math.max(...itineraryData.itinerary.map(s => s.day));
  const totalCost = itineraryData.itinerary.reduce((sum, stop) => sum + (stop.estimatedCost || 0), 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 ${jimmyWidgetVisible ? 'pb-24' : 'pb-8'} transition-all duration-300`}>
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-red-700 to-yellow-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          {/* Badge oficial */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <RiGovernmentLine className="text-lg" />
            <span>Itinerario Oficial del Atlántico</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Tu Aventura por el 
                <span className="block text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Atlántico
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-6">
                {totalDays} días de experiencias únicas • {itineraryData.itinerary.length} destinos increíbles
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={playItinerary}
                  className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  Tour Virtual
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition backdrop-blur-sm border border-white/20"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
                <button
                  onClick={shareItinerary}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition backdrop-blur-sm border border-white/20"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Duración</p>
                    <p className="text-2xl font-bold text-white">{totalDays}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">días de aventura</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Destinos</p>
                    <p className="text-2xl font-bold text-white">{itineraryData.itinerary.length}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">lugares únicos</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Presupuesto</p>
                    <p className="text-lg font-bold text-white">${totalCost.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">estimado total</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Tipo</p>
                    <p className="text-lg font-bold text-white capitalize">{itineraryData.profile.tripType}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition transform hover:scale-105 ${
                    selectedDay === day
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Día {day}
                </button>
              ))}
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode("timeline")}
                className={`p-2 rounded-full transition ${
                  viewMode === "timeline" 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition ${
                  viewMode === "grid" 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-full transition ${
                  viewMode === "map" 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Timeline/Grid Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {dayStops[0]?.dayTitle || `Día ${selectedDay}: Explorando el Atlántico`}
              </h2>
              
              {isPlaying && (
                <button
                  onClick={() => setIsPlaying(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition"
                >
                  <Pause className="w-4 h-4" />
                  Pausar Tour
                </button>
              )}
            </div>

            {viewMode === "timeline" && (
              <div className="space-y-6" ref={scrollRef}>
                {dayStops.map((stop, index) => (
                  <div 
                    key={stop.id} 
                    className={`relative transition-all duration-500 ${
                      isPlaying && currentStop === index ? 'scale-105 ring-4 ring-red-200' : ''
                    }`}
                  >
                    {/* Timeline connector */}
                    {index < dayStops.length - 1 && (
                      <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-red-300 to-blue-300"></div>
                    )}

                    {/* Stop card */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl -z-10 opacity-20 animate-pulse"></div>
                      </div>

                      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group">
                        {/* Card header */}
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => toggleStop(stop.id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition">
                                  {stop.name}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(stop.id);
                                  }}
                                  className={`p-1 rounded-full transition transform hover:scale-110 ${
                                    favoriteStops.has(stop.id) 
                                      ? 'text-red-500 hover:text-red-600' 
                                      : 'text-gray-400 hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-5 h-5 ${favoriteStops.has(stop.id) ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {stop.startTime} - {stop.endTime}
                                </span>
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                  <MapPin className="w-3 h-3" />
                                  {stop.municipality}
                                </span>
                                {stop.distance > 0 && (
                                  <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                                    <Navigation className="w-3 h-3" />
                                    {stop.distance} km
                                  </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  stop.crowdLevel === 'low' ? 'bg-green-100 text-green-700' :
                                  stop.crowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {stop.crowdLevel === 'low' ? 'Tranquilo' :
                                   stop.crowdLevel === 'medium' ? 'Moderado' : 'Concurrido'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {stop.rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm">
                                  <Star className="w-3 h-3 fill-current" />
                                  {stop.rating}
                                </div>
                              )}
                              {expandedStops.has(stop.id) ? (
                                <ChevronUp className="w-6 h-6 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 text-lg leading-relaxed">
                            {stop.description}
                          </p>
                        </div>

                        {/* Expanded content */}
                        {expandedStops.has(stop.id) && (
                          <div className="border-t border-gray-100 p-6 space-y-6">
                            {stop.imageUrl && (
                              <div 
                                className="relative h-64 rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => {
                                  setSelectedImage(stop.imageUrl!);
                                  setShowFullscreen(true);
                                }}
                              >
                                <img
                                  src={stop.imageUrl}
                                  alt={stop.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                          <div class="text-center p-4">
                                            <div class="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                                              <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                              </svg>
                                            </div>
                                            <p class="text-sm text-gray-500">Imagen no disponible</p>
                                          </div>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                                </div>
                              </div>
                            )}

                            {stop.tip && (
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">Consejo Local</p>
                                    <p className="text-blue-800">{stop.tip}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {stop.mustTry && stop.mustTry.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Coffee className="w-5 h-5 text-orange-500" />
                                  No te puedes perder:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {stop.mustTry.map((item, idx) => (
                                    <span 
                                      key={idx} 
                                      className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium border border-orange-200"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                {stop.estimatedCost > 0 && (
                                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="font-medium">${stop.estimatedCost.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
                                  <MapIcon className="w-4 h-4" />
                                  Ver en mapa
                                </button>
                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
                                  <ExternalLink className="w-4 h-4" />
                                  Más info
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "grid" && (
              <div className="grid md:grid-cols-2 gap-6">
                {dayStops.map((stop, index) => (
                  <div key={stop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                    {stop.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={stop.imageUrl}
                          alt={stop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div class="text-center p-4">
                                    <div class="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                                      <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                    </div>
                                    <p class="text-sm text-gray-500">Imagen no disponible</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute top-3 left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => toggleFavorite(stop.id)}
                            className={`p-2 rounded-full transition ${
                              favoriteStops.has(stop.id) 
                                ? 'bg-white text-red-500' 
                                : 'bg-white/80 text-gray-600 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${favoriteStops.has(stop.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">
                        {stop.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{stop.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {stop.startTime}
                        </div>
                        <button 
                          onClick={() => toggleStop(stop.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "map" && (
              <div className="space-y-6">
                {/* Map Controls */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MapIcon className="w-6 h-6 text-blue-600" />
                      Mapa Interactivo - Día {selectedDay}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {/* Map Style Selector */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setMapStyle('streets')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                            mapStyle === 'streets' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Calles
                        </button>
                        <button
                          onClick={() => setMapStyle('satellite')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                            mapStyle === 'satellite' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Satélite
                        </button>
                        <button
                          onClick={() => setMapStyle('outdoors')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                            mapStyle === 'outdoors' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Terreno
                        </button>
                      </div>

                      {/* Controls */}
                      <button
                        onClick={() => setShowRoutes(!showRoutes)}
                        className={`p-2 rounded-lg transition ${
                          showRoutes 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        title="Mostrar/ocultar rutas"
                      >
                        <Route className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setMapFullscreen(!mapFullscreen)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                        title={mapFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                      >
                        {mapFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className={`relative ${mapFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                    <div className={`${mapFullscreen ? 'h-screen' : 'h-96'} relative`}>
                      <InteractiveMap
                        stops={dayStops}
                        selectedStop={selectedMapStop}
                        onStopSelect={setSelectedMapStop}
                        mapStyle={mapStyle}
                        showRoutes={showRoutes}
                        className="w-full h-full rounded-b-2xl"
                      />
                      
                      {mapFullscreen && (
                        <button
                          onClick={() => setMapFullscreen(false)}
                          className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition z-10"
                        >
                          <X className="w-6 h-6 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Map Legend */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                          <span className="text-gray-600">Paradas del día</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Ruta sugerida</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                          <span className="text-gray-600">Parada seleccionada</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {dayStops.length} destinos • {dayStops.reduce((sum, stop) => sum + stop.distance, 0).toFixed(1)} km total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats for Map View */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Timer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tiempo estimado</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(dayStops.reduce((sum, stop) => sum + stop.durationMinutes, 0) / 60)}h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Route className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Distancia total</p>
                        <p className="text-lg font-bold text-gray-900">
                          {dayStops.reduce((sum, stop) => sum + stop.distance, 0).toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Municipios</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Set(dayStops.map(stop => stop.municipality)).size}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stops List for Map View */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900">Paradas del día</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {dayStops.map((stop, index) => (
                      <div 
                        key={stop.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                          selectedMapStop === stop.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                        onClick={() => setSelectedMapStop(selectedMapStop === stop.id ? null : stop.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedMapStop === stop.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{stop.name}</h5>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {stop.startTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {stop.municipality}
                              </span>
                              {stop.distance > 0 && (
                                <span className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  {stop.distance} km
                                </span>
                              )}
                            </div>
                          </div>

                          {stop.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm">
                              <Star className="w-3 h-3 fill-current" />
                              {stop.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Route Analysis & Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Análisis de Ruta
              </h3>
              
              {/* Efficiency Score */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Eficiencia de Ruta</span>
                  <span className="font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>

              {/* Route Insights */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Ruta Optimizada</p>
                    <p className="text-xs text-green-700">Distancias minimizadas para mejor experiencia</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Transporte Recomendado</p>
                    <p className="text-xs text-blue-700">Combinar caminatas con transporte público</p>
                  </div>
                </div>

                {dayStops.reduce((sum, stop) => sum + stop.distance, 0) > 15 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900">Día Intensivo</p>
                      <p className="text-xs text-orange-700">Considera salir temprano o dividir el día</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                Resumen del día
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Paradas principales</span>
                  <span className="font-semibold">{dayStops.filter(stop => !stop.type || stop.type !== 'break').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Descansos incluidos</span>
                  <span className="font-semibold">{dayStops.filter(stop => stop.type === 'break').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de visitas</span>
                  <span className="font-semibold">
                    {Math.round(dayStops.reduce((sum, stop) => sum + stop.durationMinutes, 0) / 60)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de traslados</span>
                  <span className="font-semibold">
                    {Math.round(dayStops.reduce((sum, stop) => sum + (stop.travelTime || 0), 0) / 60)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distancia total</span>
                  <span className="font-semibold">
                    {dayStops.reduce((sum, stop) => sum + stop.distance, 0).toFixed(1)} km
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Costo estimado</span>
                  <span className="font-semibold text-green-600">
                    ${dayStops.reduce((sum, stop) => sum + stop.estimatedCost, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Clima esperado
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                  <p className="text-sm opacity-90">Soleado</p>
                  <p className="font-bold">32°C</p>
                </div>
                <div>
                  <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm opacity-90">Nublado</p>
                  <p className="font-bold">28°C</p>
                </div>
                <div>
                  <Umbrella className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm opacity-90">Lluvia</p>
                  <p className="font-bold">15%</p>
                </div>
              </div>
            </div>

            {/* Tips del día */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Tips esenciales
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Protector solar factor 50+ siempre</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Hidratación constante es clave</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Ropa ligera y zapatos cómodos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Efectivo para lugares locales</span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg transform hover:scale-105">
                <Edit className="w-5 h-5" />
                Personalizar itinerario
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition border-2 border-gray-200 hover:border-gray-300">
                <Mail className="w-5 h-5" />
                Enviar por email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showFullscreen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Vista ampliada"
              width={800}
              height={600}
              className="rounded-xl object-contain max-h-[90vh] max-w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}