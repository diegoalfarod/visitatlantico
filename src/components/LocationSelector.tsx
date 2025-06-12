// src/components/LocationSelector.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Plane,
  Building,
  Home,
  ChevronRight,
} from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  onLocationSelect: (location: LocationResult | null) => void;
  initialLocation?: LocationResult | null;
}

interface PopularLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon: React.ComponentType<{ className?: string }>;
}

const POPULAR_LOCATIONS: PopularLocation[] = [
  {
    id: "airport",
    name: "Aeropuerto Ernesto Cortissoz",
    address: "Soledad, Atlántico",
    lat: 10.8896,
    lng: -74.7808,
    icon: Plane,
  },
  {
    id: "terminal",
    name: "Terminal de Transportes",
    address: "Barranquilla, Atlántico",
    lat: 10.9639,
    lng: -74.7963,
    icon: Building,
  },
  {
    id: "centro",
    name: "Centro Histórico",
    address: "Barranquilla, Atlántico",
    lat: 10.9685,
    lng: -74.7813,
    icon: Home,
  },
];

const STORAGE_KEY = "visitatlantico_last_location";

export default function LocationSelector({ onLocationSelect, initialLocation }: Props) {
  // Estados principales
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(
    initialLocation || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<LocationResult[]>([]);

  // Referencias
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cargar ubicaciones recientes del localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentLocations(Array.isArray(parsed) ? parsed.slice(0, 3) : []);
      }
    } catch (err) {
      console.error("Error loading saved locations:", err);
    }
  }, []);

  // Guardar ubicación seleccionada
  const saveLocation = useCallback((location: LocationResult) => {
    try {
      const updated = [
        location,
        ...recentLocations.filter((l) => l.address !== location.address),
      ].slice(0, 3);
      setRecentLocations(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving location:", err);
    }
  }, [recentLocations]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !selectedLocation) return;

    // Crear mapa
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 14,
      interactive: false, // Mini mapa no interactivo
    });

    mapRef.current = map;

    // Agregar marcador
    const marker = new mapboxgl.Marker({
      color: "#E40E20",
    })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
    };
  }, [selectedLocation]);

  // Actualizar marcador cuando cambie la ubicación
  useEffect(() => {
    if (mapRef.current && markerRef.current && selectedLocation) {
      markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedLocation]);

  // Buscar ubicaciones con Mapbox Geocoding
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?` +
          new URLSearchParams({
            access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
            country: "CO",
            bbox: "-75.3,-74.2,10.3,11.3", // Bounding box del Atlántico
            language: "es",
            limit: "5",
          })
      );

      if (!response.ok) throw new Error("Error en la búsqueda");

      const data = await response.json();
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (err) {
      setError("Error al buscar ubicaciones");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce búsqueda
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length > 2) {
      searchTimeout.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, searchLocations]);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    setGeolocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      setGeolocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding para obtener la dirección
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
              new URLSearchParams({
                access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
                language: "es",
              })
          );

          if (!response.ok) throw new Error("Error obteniendo dirección");

          const data = await response.json();
          const address = data.features?.[0]?.place_name || "Ubicación actual";

          const location: LocationResult = {
            lat: latitude,
            lng: longitude,
            address,
          };

          handleLocationSelect(location);
        } catch (err) {
          setError("Error obteniendo tu dirección");
          console.error("Geocoding error:", err);
        } finally {
          setGeolocating(false);
        }
      },
      (err) => {
        let errorMsg = "Error obteniendo tu ubicación";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Permiso de ubicación denegado";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Ubicación no disponible";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Tiempo de espera agotado";
        }
        setError(errorMsg);
        setGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Manejar selección de ubicación
  const handleLocationSelect = useCallback((location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setError(null);
    saveLocation(location);
    onLocationSelect(location);
  }, [onLocationSelect, saveLocation]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    onLocationSelect(null);
  }, [onLocationSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 sm:p-6">
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
            ¿Desde dónde inicias tu aventura?
          </h3>
          <p className="text-red-100 text-sm">
            Selecciona tu punto de partida para optimizar tu ruta
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Campo de búsqueda */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar dirección o lugar..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {(searchQuery || selectedLocation) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
                >
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        handleLocationSelect({
                          lat: result.center[1],
                          lng: result.center[0],
                          address: result.place_name,
                        });
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-none transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.text}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.place_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Estado de búsqueda */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                <span className="text-sm text-gray-600">Buscando...</span>
              </div>
            )}
          </div>

          {/* Botón de ubicación actual */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getCurrentLocation}
            disabled={geolocating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {geolocating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Usar mi ubicación actual
              </>
            )}
          </motion.button>

          {/* Ubicaciones populares */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Ubicaciones populares
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {POPULAR_LOCATIONS.map((location) => {
                const Icon = location.icon;
                return (
                  <motion.button
                    key={location.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLocationSelect(location)}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {location.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {location.address}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Ubicaciones recientes */}
          {recentLocations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recientes
              </h4>
              <div className="space-y-2">
                {recentLocations.map((location, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="flex-1 text-sm text-gray-700 text-left truncate">
                      {location.address}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ubicación seleccionada */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-3"
              >
                {/* Info de ubicación */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Ubicación seleccionada
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {selectedLocation.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
                      title="Cambiar ubicación"
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </button>
                  </div>
                </div>

                {/* Mini mapa */}
                <div className="relative h-48 rounded-lg overflow-hidden shadow-inner">
                  <div ref={mapContainer} className="w-full h-full" />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                    Vista previa del mapa
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}