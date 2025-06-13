"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Share2,
  Home,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { ItineraryMetadata } from '@/types/itinerary';
import { ItineraryStorage } from '@/utils/itinerary-storage';

export default function MyItinerariesPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<ItineraryMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = () => {
    const metadata = ItineraryStorage.getMetadataList();
    setItineraries(metadata);
    setLoading(false);
  };

  const handleDelete = (shortId: string) => {
    if (confirm('¿Estás seguro de eliminar este itinerario?')) {
      ItineraryStorage.delete(shortId);
      loadItineraries();
    }
  };

  const filteredItineraries = itineraries.filter(it => 
    it.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-3xl font-bold">Mis Itinerarios</h1>
          <p className="mt-2 text-red-100">
            Todos tus viajes guardados en un solo lugar
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Buscador */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar itinerarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Lista de itinerarios */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando itinerarios...</p>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No se encontraron itinerarios' : 'No tienes itinerarios guardados'}
            </p>
            <button
              onClick={() => router.push('/planner')}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
            >
              Crear mi primer itinerario
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredItineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary.shortId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/itinerary/${itinerary.shortId}`)}
                >
                  <div className="p-6 flex items-center gap-4">
                    {itinerary.thumbnail && (
                      <img 
                        src={itinerary.thumbnail} 
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {itinerary.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {itinerary.days} día{itinerary.days > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {itinerary.totalStops} paradas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(itinerary.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.share?.({
                            title: itinerary.title,
                            url: `/itinerary/${itinerary.shortId}`
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(itinerary.shortId);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}