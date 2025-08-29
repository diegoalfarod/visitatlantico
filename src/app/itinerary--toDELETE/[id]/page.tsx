"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Clock, Calendar, Users, DollarSign, 
  ChevronLeft, ChevronRight, Navigation, Share2,
  Heart, Star, Info, ExternalLink, Phone, Globe,
  Loader2, AlertCircle, CheckCircle, Coffee,
  Utensils, Camera, Music, Building, Waves,
  Sun, Moon, Sunrise, Sunset
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

// Iconos por categoría
const CATEGORY_ICONS: Record<string, any> = {
  cultura: Building,
  playa: Waves,
  gastronomia: Utensils,
  entretenimiento: Music,
  compras: Coffee,
  naturaleza: Sun,
  nocturno: Moon,
  museo: Camera,
};

// Iconos por momento del día
const TIME_ICONS: Record<string, any> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
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
      
      // Primero intentar cargar desde localStorage
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

      // Si no está en cache, buscar en Firebase
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu itinerario...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar el itinerario
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'No se encontró el itinerario solicitado'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const currentDay = itinerary.days[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            
            <button
              onClick={shareItinerary}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <Share2 size={18} />
              <span>{copied ? 'Copiado!' : 'Compartir'}</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Tu Aventura en el Atlántico
            </h1>
            <p className="text-gray-300">
              {itinerary.profile.days} días • {itinerary.profile.tripType} • Presupuesto {itinerary.profile.budget}
            </p>
          </div>
        </div>
      </header>

      {/* Navegación de días */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {itinerary.days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedDay === index
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Día {day.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del día */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Título del día */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentDay.title}
                </h2>
                <p className="text-gray-600">
                  {currentDay.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {currentDay.activities.length} actividades
                </p>
              </div>
            </div>

            {/* Resumen de comidas si existe */}
            {currentDay.meals && (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {currentDay.meals.breakfast && (
                  <div className="text-center">
                    <Coffee size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Desayuno</p>
                    <p className="text-sm font-medium">{currentDay.meals.breakfast}</p>
                  </div>
                )}
                {currentDay.meals.lunch && (
                  <div className="text-center">
                    <Utensils size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Almuerzo</p>
                    <p className="text-sm font-medium">{currentDay.meals.lunch}</p>
                  </div>
                )}
                {currentDay.meals.dinner && (
                  <div className="text-center">
                    <Utensils size={20} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-500">Cena</p>
                    <p className="text-sm font-medium">{currentDay.meals.dinner}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline de actividades */}
          <div className="space-y-4">
            {currentDay.activities.map((activity, index) => {
              const TimeIcon = getTimeIcon(activity.time);
              const CategoryIcon = CATEGORY_ICONS[activity.category] || MapPin;
              
              return (
                <div key={activity.id} className="relative">
                  {/* Línea conectora */}
                  {index < currentDay.activities.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-full bg-gray-300" />
                  )}
                  
                  {/* Tarjeta de actividad */}
                  <div className="flex gap-4">
                    {/* Icono de tiempo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <TimeIcon size={24} className="text-white" />
                      </div>
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-red-600">
                              {activity.time}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {activity.duration}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {getTimeOfDay(activity.time)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {activity.name}
                          </h3>
                        </div>
                        <CategoryIcon size={20} className="text-gray-400" />
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <MapPin size={16} />
                        <span>{activity.location.address}</span>
                      </div>
                      
                      {/* Rating si existe */}
                      {activity.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.floor(activity.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {activity.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      
                      {/* Tips */}
                      {activity.tips && activity.tips.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            💡 Tips locales:
                          </p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {activity.tips.map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Precio */}
                      {activity.pricing && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign size={16} />
                          <span>{activity.pricing}</span>
                        </div>
                      )}
                      
                      {/* Botones de acción */}
                      <div className="flex gap-2 mt-4">
                        {activity.location.coordinates && (
                          <button
                            onClick={() => {
                              const { lat, lng } = activity.location.coordinates!;
                              window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm"
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
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm"
                          >
                            <ExternalLink size={16} />
                            Ver en Google
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegación entre días */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
              disabled={selectedDay === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                selectedDay === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-lg'
              }`}
            >
              <ChevronLeft size={20} />
              Día anterior
            </button>
            
            <button
              onClick={() => setSelectedDay(Math.min(itinerary.days.length - 1, selectedDay + 1))}
              disabled={selectedDay === itinerary.days.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                selectedDay === itinerary.days.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
              }`}
            >
              Día siguiente
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer con información adicional */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Itinerario generado con IA para tu viaje al Atlántico
          </p>
          <p className="text-gray-400 text-sm">
            ID: {itinerary.id}
          </p>
        </div>
      </footer>
    </div>
  );
}