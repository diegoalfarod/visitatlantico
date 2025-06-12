// src/components/AddDestinationModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Search, MapPin, X } from "lucide-react";
import Image from "next/image";
import type { Stop } from "./ItineraryStopCard";
import { getCategoryIcon } from "@/utils/itinerary-helpers";

// NUEVO: Modal para agregar destinos
const AddDestinationModal = ({ 
    onClose, 
    onAdd,
    currentStops,
    userLocation
  }: {
    onClose: () => void;
    onAdd: (stop: Stop) => void;
    currentStops: Stop[];
    userLocation?: { lat: number; lng: number } | null;
  }) => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [loading, setLoading] = useState(true);
    const [destinations, setDestinations] = useState<Stop[]>([]);
    const [filteredDestinations, setFilteredDestinations] = useState<Stop[]>([]);
    const [imageCache, setImageCache] = useState<{[key: string]: string}>({});
  
    // Cargar destinos desde Firebase
    useEffect(() => {
      const loadDestinations = async () => {
        try {
          const [destSnap, expSnap] = await Promise.all([
            getDocs(collection(db, "destinations")),
            getDocs(collection(db, "experiences"))
          ]);
  
          const allItems: Stop[] = [];
          const currentStopIds = new Set(currentStops.map(s => s.id));
  
          // Procesar destinos rápidamente con placeholders
          destSnap.docs.forEach(doc => {
            const data = doc.data();
            if (!data.coordinates?.lat || !data.coordinates?.lng) return;
            if (currentStopIds.has(doc.id)) return;
  
            allItems.push({
              id: doc.id,
              name: data.name || "Destino sin nombre",
              description: data.description || "",
              lat: data.coordinates.lat,
              lng: data.coordinates.lng,
              startTime: "",
              durationMinutes: 60,
              category: data.category || "General",
              municipality: data.municipality || data.address?.split(",")[0] || "Ubicación",
              distance: 0,
              type: "destination",
              imageUrl: "/placeholder-destination.jpg",
              tip: data.tip,
              imagePath: data.imagePath // Guardar para cargar después
            });
          });
  
          // Procesar experiencias rápidamente
          expSnap.docs.forEach(doc => {
            const data = doc.data();
            if (!data.coordinates?.lat || !data.coordinates?.lng) return;
            if (currentStopIds.has(doc.id)) return;
  
            allItems.push({
              id: doc.id,
              name: data.title || "Experiencia sin nombre",
              description: data.description || "",
              lat: data.coordinates.lat,
              lng: data.coordinates.lng,
              startTime: "",
              durationMinutes: 90,
              category: data.category || "General",
              municipality: data.municipality || data.address?.split(",")[0] || "Ubicación",
              distance: 0,
              type: "experience",
              imageUrl: "/placeholder-experience.jpg",
              tip: data.tip,
              imagePath: data.imagePath
            });
          });
  
          // Calcular distancias si hay ubicación
          if (userLocation) {
            allItems.forEach(item => {
              const R = 6371;
              const dLat = (item.lat - userLocation.lat) * Math.PI / 180;
              const dLng = (item.lng - userLocation.lng) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(item.lat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              item.distance = R * c;
            });
            allItems.sort((a, b) => a.distance - b.distance);
          }
  
          setDestinations(allItems);
          setFilteredDestinations(allItems);
          setLoading(false);
  
          // Cargar imágenes de forma asíncrona
          loadImagesAsync(allItems);
        } catch (error) {
          console.error("Error loading destinations:", error);
          setLoading(false);
        }
      };
  
      const loadImagesAsync = async (items: Stop[]) => {
        const cache: {[key: string]: string} = {};
        
        // Cargar solo las primeras 10 imágenes inicialmente
        const itemsToLoad = items.slice(0, 10);
        
        for (const item of itemsToLoad) {
          if (item.imagePath) {
            try {
              const url = await getDownloadURL(ref(storage, item.imagePath));
              cache[item.id] = url;
              setImageCache(prev => ({ ...prev, [item.id]: url }));
            } catch (e) {
              console.error("Error loading image for", item.id);
            }
          }
        }
  
        // Cargar el resto en segundo plano
        const remainingItems = items.slice(10);
        for (const item of remainingItems) {
          if (item.imagePath) {
            getDownloadURL(ref(storage, item.imagePath))
              .then(url => {
                setImageCache(prev => ({ ...prev, [item.id]: url }));
              })
              .catch(() => {});
          }
        }
      };
  
      loadDestinations();
    }, [currentStops, userLocation]);
  
    // Filtrar destinos
    useEffect(() => {
      let filtered = destinations;
  
      // Filtro por búsqueda
      if (search) {
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase()) ||
          d.municipality.toLowerCase().includes(search.toLowerCase())
        );
      }
  
      // Filtro por categoría
      if (category !== "Todos") {
        filtered = filtered.filter(d => d.category === category);
      }
  
      setFilteredDestinations(filtered);
    }, [search, category, destinations]);
  
    // Obtener categorías únicas
    const categories = ["Todos", ...Array.from(new Set(destinations.map(d => d.category)))];
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Agregar al itinerario</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
  
            {/* Búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar destinos o experiencias..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Lista de destinos */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No se encontraron destinos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDestinations.map((dest) => (
                  <motion.div
                    key={dest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      // Actualizar la imagen antes de agregar si está en caché
                      const destWithImage = imageCache[dest.id] 
                        ? { ...dest, imageUrl: imageCache[dest.id] }
                        : dest;
                      onAdd(destWithImage);
                      onClose();
                    }}
                  >
                    <div className="relative h-32 sm:h-40">
                      <Image
                        src={imageCache[dest.id] || dest.imageUrl || "/placeholder.jpg"}
                        alt={dest.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${
                        dest.type === "destination" ? "bg-blue-600" : "bg-green-600"
                      }`}>
                        {dest.type === "destination" ? "Destino" : "Experiencia"}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{dest.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dest.municipality}
                        {dest.distance > 0 && (
                          <span className="ml-auto text-xs">
                            {Math.round(dest.distance)} km
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{dest.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {getCategoryIcon(dest.category)}
                          {dest.category}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-red-600 font-semibold text-sm"
                        >
                          Agregar +
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

export default AddDestinationModal;