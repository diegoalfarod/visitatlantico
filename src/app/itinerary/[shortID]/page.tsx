"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  Home, 
  Share2, 
  Download,
  Calendar,
  MapPin,
  Clock,
  WifiOff,
  Check,
  Sparkles
} from 'lucide-react';
import { SavedItinerary } from '@/types/itinerary';
import { ItineraryStorage } from '@/utils/itinerary-storage';
import { OfflineManager } from '@/utils/offline-manager';
import ItineraryMap from '@/components/ItineraryMap';
import MultiDayItinerary from '@/components/MultiDayItinerary';

export default function SharedItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;

  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(OfflineManager.getStatus());
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsubscribe = OfflineManager.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadItinerary();
  }, [shortId]);

  const loadItinerary = async () => {
    if (!shortId) {
      setError('ID de itinerario no válido');
      setLoading(false);
      return;
    }

    try {
      // Primero intentar cargar de localStorage
      const localItinerary = ItineraryStorage.getByShortId(shortId);
      
      if (localItinerary) {
        setItinerary(localItinerary);
        ItineraryStorage.updateLastViewed(shortId);
        setLoading(false);
        
        // Si estamos online, intentar actualizar desde servidor
        if (isOnline) {
          fetchFromServer();
        }
        return;
      }

      // Si no está local y estamos online, buscar en servidor
      if (isOnline) {
        await fetchFromServer();
      } else {
        setError('Itinerario no disponible sin conexión');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error cargando itinerario:', err);
      setError('Error al cargar el itinerario');
      setLoading(false);
    }
  };

  const fetchFromServer = async () => {
    try {
      const response = await fetch(`/api/itinerary/${shortId}`);
      
      if (response.status === 404) {
        setError('Itinerario no encontrado');
        setLoading(false);
        return;
      }

      if (response.status === 410) {
        setError('Este itinerario ha expirado');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar el itinerario');
      }

      const data = await response.json();
      
      // Guardar en localStorage para acceso offline
      ItineraryStorage.saveLocal(data);
      setItinerary(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      if (!itinerary) {
        setError('No se pudo cargar el itinerario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `¡Mira este itinerario de ${itinerary?.days} día${itinerary?.days !== 1 ? 's' : ''} por el Atlántico!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary?.title,
          text,
          url
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      // Fallback: copiar link
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        console.error('Error copiando:', error);
      }
    }
  };

  const handleCreateOwn = () => {
    router.push('/planner');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando itinerario...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {error || 'Itinerario no encontrado'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Este itinerario ha expirado' 
              ? 'Los itinerarios gratuitos se guardan por 6 meses. ¡Crea uno nuevo!'
              : 'Verifica que el link sea correcto o crea tu propio itinerario.'
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCreateOwn}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Crear Mi Itinerario
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-600 hover:text-gray-800 transition"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalHours = Math.round(
    itinerary.stops.reduce((sum, stop) => sum + stop.durationMinutes, 0) / 60
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
      {/* Estado offline */}
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-center text-sm">
          <WifiOff className="w-4 h-4 inline-block mr-1" />
          Modo sin conexión - Mostrando versión guardada
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center pt-4 pb-2">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              title="Ir a la página principal"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              title="Compartir itinerario"
            >
              {copiedLink ? (
                <Check className="w-5 h-5" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="text-center py-6 sm:py-10">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-5xl font-extrabold px-2"
            >
              {itinerary.title}
            </motion.h1>
            {itinerary.location?.address && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-sm sm:text-lg"
              >
                📍 {itinerary.location.address}
              </motion.p>
            )}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm bg-white/20 rounded-full px-3 sm:px-4 py-2 backdrop-blur-sm mx-auto max-w-fit"
            >
              <span>Código: <strong>{shortId}</strong></span>
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
          <h2 className="text-xl sm:text-3xl font-bold">Resumen de la aventura</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
            <div className="space-y-1 sm:space-y-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
              <p className="text-lg sm:text-2xl font-bold">{itinerary.days}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                día{itinerary.days > 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
              <p className="text-lg sm:text-2xl font-bold">{itinerary.stops.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">paradas</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600" />
              <p className="text-lg sm:text-2xl font-bold">{totalHours}</p>
              <p className="text-xs sm:text-sm text-gray-500">horas</p>
            </div>
          </div>

          {/* CTA para crear propio */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 space-y-3">
            <p className="text-sm text-gray-700 text-center">
              ¿Te gusta este itinerario? ¡Crea el tuyo personalizado!
            </p>
            <button
              onClick={handleCreateOwn}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Crear Mi Propio Itinerario
            </button>
          </div>
        </motion.section>

        {/* Mapa */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-64 sm:h-96"
        >
          <ItineraryMap 
            stops={itinerary.stops} 
            userLocation={itinerary.location ? {
              lat: itinerary.location.lat,
              lng: itinerary.location.lng
            } : null} 
          />
        </motion.div>

        {/* Timeline de actividades */}
        <MultiDayItinerary
          itinerary={itinerary.stops}
          onItineraryUpdate={() => {}} // Solo lectura
          days={itinerary.days}
          userLocation={itinerary.location ? {
            lat: itinerary.location.lat,
            lng: itinerary.location.lng
          } : null}
          readOnly={true}
        />

        {/* Info del creador */}
        {itinerary.createdAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-gray-500"
          >
            <p>
              Creado el {new Date(itinerary.createdAt).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {itinerary.views && itinerary.views > 1 && (
              <p>Visto {itinerary.views} veces</p>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}