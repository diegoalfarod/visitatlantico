// src/app/shared/[id]/page.tsx
"use client";

import { notFound } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import { MapPin, Clock, Calendar, Navigation, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Importar solo el mapa
import ItineraryMap from '@/components/ItineraryMap'

// Definir el tipo Stop localmente
interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  startTime: string;
  durationMinutes: number;
  description: string;
  category?: string;
  distance?: number;
  municipality?: string;
  tip?: string;
  imageUrl?: string;
  type: "destination" | "experience";
  rating?: number;
  cost?: string;
  amenities?: string[];
  photos?: string[];
  imagePath?: string;
}

// Componente simple de timeline para la vista compartida
const SimpleTimeline = ({ stops }: { stops: Stop[] }) => {
  const formatTime = (time: string) => {
    if (!time || !time.includes(':')) return time || '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      {stops.map((stop, index) => (
        <motion.div
          key={stop.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Línea conectora */}
          {index < stops.length - 1 && (
            <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-300" />
          )}

          {/* Contenido de la parada */}
          <div className="flex gap-4">
            {/* Indicador de tiempo */}
            <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>

            {/* Tarjeta de la parada */}
            <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="flex flex-col sm:flex-row">
                {/* Imagen */}
                {stop.imageUrl && (
                  <div className="w-full sm:w-48 h-32 sm:h-auto relative">
                    <Image
                      src={stop.imageUrl}
                      alt={stop.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{stop.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {stop.municipality || 'Ubicación'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {formatTime(stop.startTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stop.durationMinutes} min
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {stop.description}
                  </p>

                  {/* Tipo de lugar */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      stop.type === 'destination' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {stop.type === 'destination' ? 'Destino' : 'Experiencia'}
                    </span>

                    {/* Botón de navegación */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Navigation className="w-4 h-4" />
                      Cómo llegar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Fin del día */}
      <div className="flex items-center justify-center mt-8">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full text-sm font-medium">
          ✨ Fin del itinerario
        </div>
      </div>
    </div>
  );
};

export default function SharedItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [itinerary, setItinerary] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItinerary() {
      try {
        const { id } = await params;
        const snap = await getDoc(doc(db, 'sharedItineraries', id));
        
        if (!snap.exists()) {
          notFound();
          return;
        }

        const data = snap.get('itinerary') || [];
        
        if (Array.isArray(data) && data.length > 0) {
          setItinerary(data as Stop[]);
        }
      } catch (error) {
        console.error('Error loading itinerary:', error);
      } finally {
        setLoading(false);
      }
    }

    loadItinerary();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando itinerario...</p>
        </div>
      </div>
    );
  }

  if (!itinerary.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-red-50">
        <p className="text-xl text-gray-600">Itinerario no disponible.</p>
      </div>
    );
  }

  const totalHours = Math.round(
    itinerary.reduce((sum, stop) => sum + (stop.durationMinutes || 0), 0) / 60
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 pb-16">
      {/* Hero */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold mb-2">Itinerario Turístico</h1>
          <p className="text-xl text-white/80">
            Una aventura compartida desde Atlántico, Colombia
          </p>
        </div>
      </header>

      {/* Resumen + mapa */}
      <section className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Resumen del viaje</h2>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" /> 
                1 día
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> 
                {itinerary.length} paradas
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> 
                {totalHours} horas
              </span>
            </div>
            
            {/* Municipios visitados */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Municipios a visitar:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(itinerary.map(s => s.municipality).filter(Boolean))).map((municipality, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                    {municipality}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner">
            <ItineraryMap stops={itinerary} />
          </div>
        </div>

        {/* Línea de tiempo simplificada */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-2xl font-semibold mb-6">Itinerario detallado</h3>
          <SimpleTimeline stops={itinerary} />
        </div>

        {/* Botón para crear su propio itinerario */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Crear mi propio itinerario
          </a>
        </div>
      </section>
    </main>
  );
}