// src/components/MapView.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl, { Map, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize2, 
  Minimize2, 
  Navigation, 
  Layers, 
  MapPin,
  Info,
  Filter,
  ZoomIn,
  ZoomOut,
  Compass,
  X
} from "lucide-react";

// Initialize Mapbox token
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

interface Destination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  image: string;
  categories: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MapViewProps {
  destinations: Destination[];
  categoryConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }>;
  brandColors: any;
}

interface CustomMarker extends Marker {
  _element: HTMLElement;
  _destination: Destination;
}

export default function MapView({ destinations, categoryConfig, brandColors }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<CustomMarker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState("streets");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapStyles = {
    streets: "mapbox://styles/mapbox/streets-v12",
    outdoors: "mapbox://styles/mapbox/outdoors-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles.streets,
      center: [-74.82, 10.96], // Centro del Atlántico
      zoom: 9.5,
      pitch: 0, // Vista plana para mejor precisión
      bearing: 0,
      antialias: true,
      attributionControl: false,
    });

    // Add controls
    map.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), 'top-right');
    
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');
    
    map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-right');

    map.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-left');

    // Map ready
    map.on('load', () => {
      setMapLoaded(true);
      
      // Add 3D buildings layer for better context
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update style
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.setStyle(mapStyles[mapStyle as keyof typeof mapStyles]);
  }, [mapStyle, mapLoaded]);

  // Create markers
  const createMarkers = useCallback(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Clear popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Add markers for destinations with valid coordinates
    destinations
      .filter(dest => dest.coordinates && dest.coordinates.lat && dest.coordinates.lng)
      .forEach((dest) => {
        const firstCategory = dest.categories[0] || "Otros";
        const categoryColor = categoryConfig[firstCategory]?.color || brandColors.primary;
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'destination-marker';
        
        // Marker wrapper with pulse animation
        const markerWrapper = document.createElement('div');
        markerWrapper.style.cssText = `
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Pulse ring
        const pulseRing = document.createElement('div');
        pulseRing.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${categoryColor}30;
          animation: pulse-ring 2s infinite;
        `;
        
        // Main marker
        const markerBody = document.createElement('div');
        markerBody.style.cssText = `
          position: relative;
          width: 44px;
          height: 44px;
          background: white;
          border: 3px solid ${categoryColor};
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        `;
        
        // Marker image
        const img = document.createElement('img');
        img.src = dest.image || '/placeholder-destination.jpg';
        img.alt = dest.name;
        img.style.cssText = `
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 50%;
          pointer-events: none;
        `;
        
        // Category icon overlay
        const iconOverlay = document.createElement('div');
        iconOverlay.style.cssText = `
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          background: ${categoryColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        `;
        iconOverlay.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;
        
        // Assemble marker
        markerBody.appendChild(img);
        markerBody.appendChild(iconOverlay);
        markerWrapper.appendChild(pulseRing);
        markerWrapper.appendChild(markerBody);
        el.appendChild(markerWrapper);
        
        // Hover effects
        markerBody.addEventListener('mouseenter', () => {
          markerBody.style.transform = 'scale(1.1)';
          markerBody.style.boxShadow = `0 4px 16px ${categoryColor}60`;
          pulseRing.style.animation = 'none';
          pulseRing.style.opacity = '0';
        });
        
        markerBody.addEventListener('mouseleave', () => {
          if (selectedDestination?.id !== dest.id) {
            markerBody.style.transform = 'scale(1)';
            markerBody.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            pulseRing.style.animation = 'pulse-ring 2s infinite';
            pulseRing.style.opacity = '1';
          }
        });
        
        // Create marker with proper anchor
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center', // Importante: anclar al centro
          offset: [0, 0] // Sin offset para evitar "flotación"
        })
          .setLngLat([dest.coordinates!.lng, dest.coordinates!.lat])
          .addTo(mapRef.current!) as CustomMarker;
        
        marker._element = el;
        marker._destination = dest;
        
        // Click handler
        el.addEventListener('click', () => {
          setSelectedDestination(dest);
          
          // Animate to destination
          mapRef.current!.flyTo({
            center: [dest.coordinates!.lng, dest.coordinates!.lat],
            zoom: 14,
            duration: 1500,
            essential: true,
            padding: { top: 100, bottom: 200, left: 50, right: 50 }
          });
          
          // Show popup
          showPopup(dest, marker);
        });
        
        markersRef.current.push(marker);
      });
  }, [destinations, selectedDestination, categoryConfig, brandColors, mapLoaded]);

  // Show popup
  const showPopup = (dest: Destination, marker: CustomMarker) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }
    
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
      <div class="destination-popup">
        <style>
          @keyframes pulse-ring {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }
            100% {
              transform: scale(1.2);
              opacity: 0;
            }
          }
          .destination-popup {
            width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .popup-image-container {
            position: relative;
            width: 100%;
            height: 180px;
            overflow: hidden;
            border-radius: 12px 12px 0 0;
          }
          .popup-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .popup-categories {
            position: absolute;
            top: 12px;
            left: 12px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
          .popup-category {
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            color: white;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 500;
          }
          .popup-content {
            padding: 20px;
            background: white;
            border-radius: 0 0 12px 12px;
          }
          .popup-title {
            font-size: 20px;
            font-weight: 700;
            color: #111;
            margin: 0 0 8px 0;
          }
          .popup-address {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
          }
          .popup-description {
            font-size: 14px;
            color: #444;
            line-height: 1.6;
            margin-bottom: 16px;
          }
          .popup-actions {
            display: flex;
            gap: 8px;
          }
          .popup-btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
          }
          .popup-btn-primary {
            background: ${brandColors.primary};
            color: white;
          }
          .popup-btn-primary:hover {
            background: ${brandColors.primary}DD;
            transform: translateY(-1px);
          }
          .popup-btn-secondary {
            background: #f5f5f5;
            color: #333;
          }
          .popup-btn-secondary:hover {
            background: #e8e8e8;
          }
        </style>
        <div class="popup-image-container">
          <img src="${dest.image}" alt="${dest.name}" class="popup-image" />
          <div class="popup-categories">
            ${dest.categories.slice(0, 3).map(cat => `
              <span class="popup-category">${cat}</span>
            `).join('')}
          </div>
        </div>
        <div class="popup-content">
          <h3 class="popup-title">${dest.name}</h3>
          <div class="popup-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${dest.address || 'Atlántico, Colombia'}
          </div>
          <p class="popup-description">
            ${dest.tagline || dest.description.slice(0, 120) + '...'}
          </p>
          <div class="popup-actions">
            <a href="/destinations/${dest.id}" class="popup-btn popup-btn-primary">
              Ver detalles
            </a>
            <button onclick="window.open('https://maps.google.com/?q=${dest.coordinates?.lat},${dest.coordinates?.lng}', '_blank')" class="popup-btn popup-btn-secondary">
              Cómo llegar
            </button>
          </div>
        </div>
      </div>
    `;
    
    const popup = new mapboxgl.Popup({
      offset: [0, -25],
      closeButton: true,
      closeOnClick: false,
      maxWidth: 'none',
      className: 'destination-popup-container'
    })
      .setDOMContent(popupContent)
      .setLngLat([dest.coordinates!.lng, dest.coordinates!.lat])
      .addTo(mapRef.current!);
    
    popupRef.current = popup;
  };

  // Update markers when destinations or map loads
  useEffect(() => {
    createMarkers();
  }, [createMarkers, destinations, mapLoaded]);

  // Fit bounds to show all destinations
  const fitToDestinations = useCallback(() => {
    if (!mapRef.current || destinations.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    destinations
      .filter(d => d.coordinates)
      .forEach(d => {
        bounds.extend([d.coordinates!.lng, d.coordinates!.lat]);
      });
    
    mapRef.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      duration: 1500,
    });
  }, [destinations]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mapContainer.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Get unique categories
  const uniqueCategories = Array.from(
    new Set(destinations.flatMap(d => d.categories))
  ).slice(0, 6);

  return (
    <div className="relative">
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        .mapboxgl-popup {
          max-width: none !important;
        }
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
        }
        .mapboxgl-popup-close-button {
          width: 32px;
          height: 32px;
          font-size: 20px;
          color: #666;
          background: white;
          border-radius: 50%;
          margin: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .mapboxgl-popup-close-button:hover {
          background: #f5f5f5;
          color: #333;
        }
        .mapboxgl-ctrl-group {
          background: rgba(255,255,255,0.95) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-green-50 p-1"
      >
        <div
          ref={mapContainer}
          className="w-full rounded-2xl overflow-hidden relative"
          style={{ height: isFullscreen ? '100vh' : '650px' }}
        />
        
        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-3">
          {/* Style Switcher */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-600 px-2">Vista del mapa</p>
            </div>
            <div className="p-1">
              {Object.entries({ streets: 'Calles', outdoors: 'Terreno', satellite: 'Satélite' }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMapStyle(key)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    mapStyle === key 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2"
          >
            <button
              onClick={fitToDestinations}
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl"
              title="Ver todos los destinos"
            >
              <Compass className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl"
              title="Mostrar/ocultar leyenda"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </motion.div>
        </div>

        {/* Destination Counter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {destinations.filter(d => d.coordinates).length} destinos
              </p>
              <p className="text-xs text-gray-600">en el Atlántico</p>
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4 max-w-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Categorías</h3>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {uniqueCategories.map((cat) => {
                  const color = categoryConfig[cat]?.color || brandColors.primary;
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600 truncate">{cat}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mobile Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center md:hidden"
      >
        <p className="text-sm text-gray-600">
          <Info className="w-4 h-4 inline mr-1" />
          Toca un destino para ver más información
        </p>
      </motion.div>
    </div>
  );
}