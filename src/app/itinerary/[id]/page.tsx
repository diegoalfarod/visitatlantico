"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Clock, Calendar, Users, DollarSign, 
  ChevronLeft, ChevronRight, Navigation, Share2,
  Heart, Star, Info, ExternalLink, Phone, Globe,
  Loader2, AlertCircle, CheckCircle, Coffee,
  Utensils, Camera, Music, Building, Waves,
  Sun, Moon, Sunrise, Sunset, ArrowRight,
  Map, Sparkles, TrendingUp, Award
} from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  tips?: string[];
  pricing?: string;
  googlePlaceId?: string;
  rating?: number;
  photos?: string[];
}

interface DayItinerary {
  day: number;
  date: string;
  title: string;
  description: string;
  activities: Activity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

interface ItineraryData {
  id: string;
  profile: {
    days: number;
    tripType: string;
    budget: string;
    interests: string[];
    travelPace: string;
    email: string;
  };
  days: DayItinerary[];
  metadata: {
    generatedAt: string;
    totalActivities: number;
    estimatedBudget?: string;
    weatherConsiderations?: string;
  };
}

// Configuración de diseño
const CATEGORY_ICONS: Record<string, any> = {
  cultura: Building,
  playa: Waves,
  gastronomia: Utensils,
  entretenimiento: Music,
  compras: Coffee,
  naturaleza: Sun,
  nocturno: Moon,
  museo: Camera,
  restaurant: Utensils,
  food: Utensils,
};

const CATEGORY_COLORS: Record<string, string> = {
  cultura: "from-purple-500 to-purple-600",
  playa: "from-blue-500 to-cyan-600",
  gastronomia: "from-orange-500 to-red-600",
  entretenimiento: "from-pink-500 to-rose-600",
  naturaleza: "from-green-500 to-emerald-600",
  restaurant: "from-orange-500 to-red-600",
  food: "from-orange-500 to-red-600",
};

function getTimeIcon(time: string) {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return Sunrise;
  if (hour < 17) return Sun;
  if (hour < 20) return Sunset;
  return Moon;
}

function getTimeOfDay(time: string) {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return "Mañana";
  if (hour < 17) return "Tarde";
  if (hour < 20) return "Atardecer";
  return "Noche";
}

function getTimeColor(time: string) {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return "bg-gradient-to-r from-yellow-400 to-orange-400";
  if (hour < 17) return "bg-gradient-to-r from-blue-400 to-blue-500";
  if (hour < 20) return "bg-gradient-to-r from-orange-500 to-pink-500";
  return "bg-gradient-to-r from-indigo-600 to-purple-600";
}

export default function ItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [params.id]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      
      const cached = localStorage.getItem('lastItinerary');
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (cachedData.id === params.id) {
          setItinerary({
            id: cachedData.id,
            profile: cachedData.profile,
            days: cachedData.itinerary.days,
            metadata: cachedData.itinerary.metadata || {
              generatedAt: new Date(cachedData.createdAt).toISOString(),
              totalActivities: cachedData.itinerary.days.reduce((acc: number, day: any) => 
                acc + (day.activities?.length || 0), 0
              )
            }
          });
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`/api/itinerary/${params.id}`);
      if (!response.ok) {
        throw new Error('No se pudo cargar el itinerario');
      }
      
      const data = await response.json();
      setItinerary(data);
      
    } catch (err: any) {
      console.error('Error cargando itinerario:', err);
      setError(err.message || 'Error al cargar el itinerario');
    } finally {
      setLoading(false);
    }
  };

  const shareItinerary = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi itinerario en el Atlántico',
        text: `Mira mi itinerario personalizado de ${itinerary?.profile.days} días en el Atlántico`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-red-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Preparando tu aventura...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No pudimos cargar tu itinerario
          </h2>
          <p className="text-gray-500 mb-8">
            {error || 'El itinerario que buscas no está disponible'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const currentDay = itinerary.days[selectedDay];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Inicio</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={shareItinerary}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 size={18} />
                <span className="font-medium">{copied ? 'Copiado' : 'Compartir'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section con información del viaje */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-medium">
                ITINERARIO PERSONALIZADO
              </div>
              <Sparkles size={16} className="text-yellow-400" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tu Aventura en el Atlántico
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Calendar size={20} className="text-white/60 mb-2" />
                <p className="text-sm text-white/60">Duración</p>
                <p className="text-xl font-bold">{itinerary.profile.days} días</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Users size={20} className="text-white/60 mb-2" />
                <p className="text-sm text-white/60">Tipo de viaje</p>
                <p className="text-xl font-bold capitalize">{itinerary.profile.tripType}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <DollarSign size={20} className="text-white/60 mb-2" />
                <p className="text-sm text-white/60">Presupuesto</p>
                <p className="text-xl font-bold capitalize">{itinerary.profile.budget}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <TrendingUp size={20} className="text-white/60 mb-2" />
                <p className="text-sm text-white/60">Actividades</p>
                <p className="text-xl font-bold">{itinerary.metadata.totalActivities}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de días - Mejorada */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {itinerary.days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all transform ${
                  selectedDay === index
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">Día</span>
                  <span className="text-lg font-bold">{day.day}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header del día */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {currentDay.day}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentDay.title}
                    </h2>
                    <p className="text-gray-500 text-sm">{currentDay.date}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {currentDay.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{currentDay.activities.length}</p>
                  <p className="text-xs text-gray-500">Actividades</p>
                </div>
              </div>
            </div>

            {/* Comidas del día - Diseño mejorado */}
            {currentDay.meals && Object.keys(currentDay.meals).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-3">COMIDAS RECOMENDADAS</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentDay.meals.breakfast && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Coffee size={18} className="text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Desayuno</p>
                        <p className="text-sm font-semibold text-gray-900">{currentDay.meals.breakfast}</p>
                      </div>
                    </div>
                  )}
                  {currentDay.meals.lunch && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Utensils size={18} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Almuerzo</p>
                        <p className="text-sm font-semibold text-gray-900">{currentDay.meals.lunch}</p>
                      </div>
                    </div>
                  )}
                  {currentDay.meals.dinner && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Utensils size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Cena</p>
                        <p className="text-sm font-semibold text-gray-900">{currentDay.meals.dinner}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timeline de actividades - Rediseñado */}
          <div className="space-y-4">
            {currentDay.activities.map((activity, index) => {
              const TimeIcon = getTimeIcon(activity.time);
              const CategoryIcon = CATEGORY_ICONS[activity.category] || MapPin;
              const categoryColor = CATEGORY_COLORS[activity.category] || "from-gray-500 to-gray-600";
              
              return (
                <div key={activity.id} className="group">
                  <div className="flex gap-4">
                    {/* Timeline visual */}
                    <div className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl ${getTimeColor(activity.time)} flex items-center justify-center shadow-lg`}>
                        <TimeIcon size={24} className="text-white" />
                      </div>
                      {index < currentDay.activities.length - 1 && (
                        <div className="w-0.5 h-24 bg-gradient-to-b from-gray-300 to-transparent mt-2" />
                      )}
                    </div>
                    
                    {/* Card de actividad */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-[1.01]">
                      {/* Header de la card */}
                      <div className={`h-2 bg-gradient-to-r ${categoryColor}`} />
                      
                      <div className="p-6">
                        {/* Tiempo y categoría */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-400" />
                              <span className="font-bold text-gray-900">{activity.time}</span>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                              {activity.duration}
                            </div>
                            <div className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-xs font-medium text-gray-700">
                              {getTimeOfDay(activity.time)}
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColor} flex items-center justify-center`}>
                            <CategoryIcon size={20} className="text-white" />
                          </div>
                        </div>
                        
                        {/* Contenido principal */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {activity.name}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {activity.description}
                        </p>
                        
                        {/* Ubicación */}
                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600 leading-tight">{activity.location.address}</span>
                        </div>
                        
                        {/* Rating */}
                        {activity.rating && (
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  className={i < Math.floor(activity.rating!) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-200 fill-current'}
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-900">{activity.rating.toFixed(1)}</span>
                            <Award size={16} className="text-gray-400" />
                          </div>
                        )}
                        
                        {/* Tips mejorados */}
                        {activity.tips && activity.tips.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Info size={16} className="text-blue-600" />
                              <p className="text-sm font-semibold text-blue-900">Tips del local</p>
                            </div>
                            <ul className="space-y-1">
                              {activity.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                  <span className="text-blue-400 mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Precio */}
                        {activity.pricing && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl mb-4">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="text-sm font-semibold text-green-800">{activity.pricing}</span>
                          </div>
                        )}
                        
                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          {activity.location.coordinates && (
                            <button
                              onClick={() => {
                                const { lat, lng } = activity.location.coordinates!;
                                window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                              <Navigation size={16} />
                              Cómo llegar
                            </button>
                          )}
                          
                          {activity.googlePlaceId && (
                            <button
                              onClick={() => {
                                window.open(`https://www.google.com/maps/place/?q=place_id:${activity.googlePlaceId}`, '_blank');
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              <ExternalLink size={16} />
                              Ver en Google
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegación inferior mejorada */}
          <div className="flex items-center justify-between mt-12 p-6 bg-white rounded-2xl shadow-sm">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedDay === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg transform hover:scale-105'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Día anterior</span>
            </button>
            
            <div className="flex items-center gap-2">
              {itinerary.days.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedDay ? 'w-8 bg-gray-900' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setSelectedDay(Math.min(itinerary.days.length - 1, selectedDay + 1))}
              disabled={selectedDay === itinerary.days.length - 1}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedDay === itinerary.days.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg transform hover:scale-105'
              }`}
            >
              <span>Día siguiente</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Itinerario Inteligente</p>
                <p className="text-sm text-gray-500">Generado con IA para el Atlántico</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              ID: {itinerary.id}
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}