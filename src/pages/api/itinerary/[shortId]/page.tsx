// src/app/itinerary/[shortId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Clock,
  Home,
  RefreshCw,
  Edit3,
  Share2,
  Download,
  Check,
  WifiOff
} from 'lucide-react';
import { useItineraryStorage, useOnlineStatus } from '@/utils/itinerary-storage';
import ItineraryMap from '@/components/ItineraryMap';
import MultiDayItinerary from '@/components/MultiDayItinerary';
import type { Stop } from '@/components/ItineraryStopCard';

export default function SavedItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;
  const { loadItinerary, loading, error } = useItineraryStorage();
  const isOnline = useOnlineStatus();
  
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [days, setDays] = useState<number>(1);
  const [locationData, setLocationData] = useState<any>(null);
  const [lastViewedAt, setLastViewedAt] = useState<string>('');
  const [viewCount, setViewCount] = useState<number>(0);
  const [notFound, setNotFound] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const saved = await loadItinerary(shortId);
        
        if (!saved) {
          setNotFound(true);
          return;
        }
        
        setItinerary(saved.itinerary);
        setDays(saved.days);
        setLocationData(saved.locationData);
        setLastViewedAt(saved.lastViewedAt || '');
        setViewCount(saved.viewCount || 0);
      } catch (err) {
        console.error('Error cargando itinerario:', err);
        setNotFound(true);
      }
    };
    
    if (shortId) {
      fetchItinerary();
    }
  }, [shortId]);

  // Calcular estadísticas
  const totalH = itinerary 
    ? Math.round(itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60)
    : 0;

  // Función para copiar link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para compartir nativo
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mi itinerario en Atlántico',
          text: `Mira mi plan de viaje de ${days} día${days > 1 ? 's' : ''} por el Atlántico`,
          url: window.location.href
        });
      } catch (err) {
        // Usuario canceló el compartir
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error compartiendo:', err);
        }
      }
    } else {
      // Fallback a copiar link
      handleCopyLink();
    }
  };

  // Vista de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cargando tu aventura</h2>
          <p className="text-gray-600">Por favor espera un momento...</p>
        </div>
      </div>
    );
  }

  // Vista de error o no encontrado
  if (error || notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Itinerario no encontrado</h2>
          <p className="text-gray-600 mb-6">
            {notFound 
              ? "No pudimos encontrar este itinerario. Puede que el link sea incorrecto o haya expirado."
              : "Ocurrió un error al cargar el itinerario. Por favor intenta nuevamente."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Reintentar
            </button>
            <button
              onClick={() => router.push('/planner')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Crear nuevo itinerario
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Vista del itinerario
  if (itinerary) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Barra de navegación */}
            <div className="flex justify-between items-center pt-4 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = 'https://visitatlantico.com'}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="Ir a la página principal"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
              
              {/* Estado de conexión */}
              {!isOnline && (
                <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <WifiOff className="w-4 h-4" />
                  <span>Modo offline</span>
                </div>
              )}
            </div>
            
            {/* Contenido del header */}
            <div className="text-center py-6 sm:py-10">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-5xl font-extrabold px-2"
              >
                Tu Aventura en el Atlántico
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
              
              {/* Metadatos */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm"
              >
                <span className="bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  {viewCount} vista{viewCount !== 1 ? 's' : ''}
                </span>
                {lastViewedAt && (
                  <span className="bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                    Última vez: {new Date(lastViewedAt).toLocaleDateString('es-CO')}
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-4 sm:-mt-8 space-y-6 sm:space-y-10">
          {/* Resumen */}
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
            
            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition font-medium"
              >
                <Share2 className="mr-2 w-4 h-4" />
                {copySuccess ? 'Link copiado!' : 'Compartir'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/planner')}
                className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition font-medium"
              >
                <Edit3 className="mr-2 w-4 h-4" />
                Crear mi propio itinerario
              </motion.button>
            </div>

            {/* Info de compartir */}
            <AnimatePresence>
              {copySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">
                    Link copiado al portapapeles. ¡Compártelo con tus amigos!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Mapa */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-64 sm:h-96"
          >
            <ItineraryMap 
              stops={itinerary} 
              userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null} 
            />
          </motion.div>

          {/* Timeline de actividades usando tu MultiDayItinerary */}
          <MultiDayItinerary
            itinerary={itinerary}
            onItineraryUpdate={setItinerary}
            days={days}
            userLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : null}
          />
          
          {/* Footer con CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8 space-y-6"
          >
            {/* Características del servicio */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold mb-4">¿Te gustó este itinerario?</h3>
              <p className="text-gray-600 mb-6">
                Crea tu propia aventura personalizada con nuestra IA
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium">Planifica de 1 a 7 días</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Lugares únicos del Atlántico</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Horarios optimizados</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/planner')}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Crea tu propia aventura personalizada
              </motion.button>
            </div>

            {/* Aviso de modo offline */}
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-amber-800">
                  <WifiOff className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Estás viendo este itinerario sin conexión
                  </p>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Los cambios se sincronizarán cuando vuelvas a tener internet
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  return null;
}