// src/components/MapView.tsx
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl, { Map, Marker, Popup, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { 
  Maximize2, 
  Minimize2,
  Layers,
  MapPin,
  X,
  Navigation2,
  ChevronUp,
  Sparkles,
  Map as MapIcon
} from "lucide-react";

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
  mapboxToken: string;
}

interface CustomMarker extends Marker {
  _element: HTMLElement;
  _destination: Destination;
}

// Detect mobile device
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || ('ontouchstart' in window);
};

// Custom hook for dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return isDark;
};

export default function MapView({ destinations, categoryConfig, brandColors, mapboxToken }: MapViewProps) {
  // Initialize Mapbox token on client side only
  useEffect(() => {
    if (mapboxToken && typeof window !== 'undefined' && mapboxgl) {
      mapboxgl.accessToken = mapboxToken;
    }
  }, [mapboxToken]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<CustomMarker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState("streets");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showStyleSwitcher, setShowStyleSwitcher] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const isDarkMode = useDarkMode();
  const dragY = useMotionValue(0);
  const dragProgress = useTransform(dragY, [0, 300], [1, 0]);

  const mapStyles = {
    streets: isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
    outdoors: "mapbox://styles/mapbox/outdoors-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize map with better mobile settings
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles.streets,
      center: [-74.82, 10.96],
      zoom: isMobileView ? 9 : 9.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
      touchPitch: false, // Disable pitch on mobile
      dragRotate: !isMobileView, // Disable rotation on mobile
      cooperativeGestures: isMobileView, // Better mobile scrolling
    });

    // Optimized controls for mobile
    if (!isMobileView) {
      map.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
      }), 'bottom-right');
    }
    
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false
    }), 'bottom-right');
    
    if (!isMobileView) {
      map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');
    }

    // Smooth loading
    map.on('load', () => {
      setMapLoaded(true);
      
      // Add subtle animations
      map.flyTo({
        center: [-74.82, 10.96],
        zoom: isMobileView ? 9.2 : 10,
        duration: 2000,
        essential: true,
      });

      // 3D buildings for desktop only
      if (!isMobileView) {
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
              'fill-extrusion-color': isDarkMode ? '#444' : '#aaa',
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
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [isMobileView, isDarkMode, mapboxToken]);

  // Update style when dark mode changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.setStyle(mapStyles[mapStyle as keyof typeof mapStyles]);
  }, [mapStyle, mapLoaded, isDarkMode]);

  // Create optimized markers
  const createMarkers = useCallback(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Clear existing
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Filter destinations
    const filteredDestinations = destinations.filter(dest => 
      dest.coordinates && 
      dest.coordinates.lat && 
      dest.coordinates.lng &&
      (!activeCategory || dest.categories.includes(activeCategory))
    );

    // Create markers
    filteredDestinations.forEach((dest) => {
      const firstCategory = dest.categories[0] || "Otros";
      const categoryColor = categoryConfig[firstCategory]?.color || brandColors.primary;
      
      // Modern marker design
      const el = document.createElement('div');
      el.className = 'destination-marker';
      
      const markerHtml = `
        <div class="marker-container" style="
          position: relative;
          width: ${isMobileView ? '40px' : '48px'};
          height: ${isMobileView ? '40px' : '48px'};
          cursor: pointer;
        ">
          <div class="marker-pulse" style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${categoryColor}20;
            animation: pulse-ring 3s infinite;
          "></div>
          <div class="marker-body" style="
            position: relative;
            width: ${isMobileView ? '36px' : '44px'};
            height: ${isMobileView ? '36px' : '44px'};
            margin: 2px;
            background: white;
            border: 2px solid ${categoryColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
          ">
            <img src="${dest.image || '/placeholder-destination.jpg'}" 
                 alt="${dest.name}"
                 style="
                   width: ${isMobileView ? '30px' : '36px'};
                   height: ${isMobileView ? '30px' : '36px'};
                   object-fit: cover;
                   border-radius: 50%;
                   pointer-events: none;
                 " 
                 loading="lazy"
            />
            <div style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: ${isMobileView ? '14px' : '18px'};
              height: ${isMobileView ? '14px' : '18px'};
              background: ${categoryColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            ">
              <svg width="${isMobileView ? '8' : '10'}" height="${isMobileView ? '8' : '10'}" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
          </div>
        </div>
      `;
      
      el.innerHTML = markerHtml;
      
      // Interactive effects
      const markerBody = el.querySelector('.marker-body') as HTMLElement;
      const markerPulse = el.querySelector('.marker-pulse') as HTMLElement;
      
      if (!isMobileView) {
        el.addEventListener('mouseenter', () => {
          markerBody.style.transform = 'scale(1.1)';
          markerBody.style.boxShadow = `0 4px 20px ${categoryColor}40`;
          markerPulse.style.animationPlayState = 'paused';
          markerPulse.style.opacity = '0';
        });
        
        el.addEventListener('mouseleave', () => {
          if (selectedDestination?.id !== dest.id) {
            markerBody.style.transform = 'scale(1)';
            markerBody.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
            markerPulse.style.animationPlayState = 'running';
            markerPulse.style.opacity = '1';
          }
        });
      }
      
      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat([dest.coordinates!.lng, dest.coordinates!.lat])
        .addTo(mapRef.current!) as CustomMarker;
      
      marker._element = el;
      marker._destination = dest;
      
      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMarkerClick(dest, marker);
      });
      
      markersRef.current.push(marker);
    });
  }, [destinations, selectedDestination, categoryConfig, brandColors, mapLoaded, isMobileView, activeCategory]);

  // Handle marker click differently for mobile/desktop
  const handleMarkerClick = (dest: Destination, marker: CustomMarker) => {
    setSelectedDestination(dest);
    
    // Smooth animation to destination
    mapRef.current!.flyTo({
      center: [dest.coordinates!.lng, dest.coordinates!.lat],
      zoom: isMobileView ? 12 : 14,
      duration: 1200,
      offset: isMobileView ? [0, -100] : [0, 0],
      essential: true,
    });
    
    if (isMobileView) {
      // Mobile: Show bottom sheet
      showMobileBottomSheet(dest);
    } else {
      // Desktop: Show popup
      showDesktopPopup(dest, marker);
    }
  };

  // Mobile bottom sheet
  const showMobileBottomSheet = (dest: Destination) => {
    // Bottom sheet is handled by the JSX below
  };

  // Desktop popup
  const showDesktopPopup = (dest: Destination, marker: CustomMarker) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }
    
    const popupContent = document.createElement('div');
    popupContent.className = 'modern-popup';
    popupContent.innerHTML = `
      <style>
        .modern-popup {
          width: 320px;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .popup-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .popup-content {
          padding: 20px;
        }
        .popup-title {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px 0;
        }
        .popup-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .popup-category {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          background: ${categoryConfig[dest.categories[0]]?.color || brandColors.primary}15;
          color: ${categoryConfig[dest.categories[0]]?.color || brandColors.primary};
          font-weight: 600;
        }
        .popup-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .popup-actions {
          display: flex;
          gap: 10px;
        }
        .popup-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          display: block;
        }
        .popup-btn-primary {
          background: ${brandColors.primary};
          color: white;
        }
        .popup-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${brandColors.primary}40;
        }
        .popup-btn-secondary {
          background: #f5f5f5;
          color: #333;
        }
        .popup-btn-secondary:hover {
          background: #eee;
        }
      </style>
      <img src="${dest.image}" alt="${dest.name}" class="popup-image" />
      <div class="popup-content">
        <h3 class="popup-title">${dest.name}</h3>
        <div class="popup-meta">
          ${dest.categories.slice(0, 2).map(cat => 
            `<span class="popup-category">${cat}</span>`
          ).join('')}
        </div>
        <p class="popup-description">
          ${dest.tagline || dest.description.slice(0, 100) + '...'}
        </p>
        <div class="popup-actions">
          <a href="/destinations/${dest.id}" class="popup-btn popup-btn-primary">
            Ver detalles
          </a>
          <button onclick="window.open('https://maps.google.com/?q=${dest.coordinates?.lat},${dest.coordinates?.lng}', '_blank')" 
                  class="popup-btn popup-btn-secondary">
            Cómo llegar
          </button>
        </div>
      </div>
    `;
    
    const popup = new mapboxgl.Popup({
      offset: [0, -20],
      closeButton: true,
      closeOnClick: true,
      maxWidth: 'none',
      className: 'modern-popup-container'
    })
      .setDOMContent(popupContent)
      .setLngLat([dest.coordinates!.lng, dest.coordinates!.lat])
      .addTo(mapRef.current!);
    
    popupRef.current = popup;
    
    popup.on('close', () => {
      setSelectedDestination(null);
    });
  };

  // Update markers
  useEffect(() => {
    createMarkers();
  }, [createMarkers, destinations, mapLoaded, activeCategory]);

  // Fit to all destinations
  const fitToDestinations = useCallback(() => {
    if (!mapRef.current || destinations.length === 0) return;
    
    const bounds = new LngLatBounds();
    destinations
      .filter(d => d.coordinates)
      .forEach(d => {
        bounds.extend([d.coordinates!.lng, d.coordinates!.lat]);
      });
    
    mapRef.current.fitBounds(bounds, {
      padding: isMobileView 
        ? { top: 50, bottom: 150, left: 30, right: 30 }
        : { top: 80, bottom: 80, left: 80, right: 80 },
      duration: 1500,
    });
  }, [destinations, isMobileView]);

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

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => 
    Array.from(new Set(destinations.flatMap(d => d.categories))).slice(0, 8),
    [destinations]
  );

  // Handle bottom sheet drag
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 150) {
      setSelectedDestination(null);
    }
  };

  return (
    <div className="relative">
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        .mapboxgl-popup {
          max-width: none !important;
        }
        .mapboxgl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .mapboxgl-popup-close-button {
          display: ${isMobileView ? 'none' : 'flex'};
          width: 28px;
          height: 28px;
          font-size: 18px;
          color: #666;
          background: white;
          border-radius: 50%;
          right: 8px;
          top: 8px;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .mapboxgl-popup-close-button:hover {
          background: #f5f5f5;
          transform: scale(1.1);
        }
        .mapboxgl-ctrl-group {
          background: ${isDarkMode ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)'} !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
          border-radius: 12px !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
        }
        .mapboxgl-ctrl-group button {
          border-radius: 0 !important;
          color: ${isDarkMode ? '#fff' : '#333'} !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
        }
        .mapboxgl-ctrl-geolocate {
          width: 40px !important;
          height: 40px !important;
        }
        .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active {
          color: ${brandColors.primary} !important;
        }
        .mapboxgl-ctrl-icon {
          background-size: 20px !important;
        }
      `}</style>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '2px',
        }}
      >
        <div
          ref={mapContainer}
          className="w-full rounded-2xl overflow-hidden relative bg-gray-100"
          style={{ height: isFullscreen ? '100vh' : (isMobileView ? '70vh' : '650px') }}
        />
        
        {/* Modern Controls Overlay */}
        {!isMobileView && (
          <div className="absolute top-4 left-4 flex flex-col gap-3">
            {/* Style Switcher Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStyleSwitcher(!showStyleSwitcher)}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Layers className="w-5 h-5" />
            </motion.button>

            {/* Style Options */}
            <AnimatePresence>
              {showStyleSwitcher && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -10 }}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg p-2"
                >
                  {Object.entries({ streets: 'Calles', outdoors: 'Terreno', satellite: 'Satélite' }).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMapStyle(key);
                        setShowStyleSwitcher(false);
                      }}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        mapStyle === key 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fit to bounds */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fitToDestinations}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Navigation2 className="w-5 h-5" />
            </motion.button>
            
            {/* Fullscreen */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg p-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
          </div>
        )}

        {/* Mobile Category Filter */}
        {isMobileView && (
          <div className="absolute top-4 left-4 right-4 z-20">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  !activeCategory 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white/90 backdrop-blur text-gray-700 shadow'
                }`}
              >
                Todos
              </button>
              {uniqueCategories.map((cat) => {
                const color = categoryConfig[cat]?.color || brandColors.primary;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'text-white shadow-lg' 
                        : 'bg-white/90 backdrop-blur text-gray-700 shadow'
                    }`}
                    style={{
                      backgroundColor: activeCategory === cat ? color : undefined,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Destination Counter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`absolute ${isMobileView ? 'bottom-20' : 'bottom-4'} left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
              <div className="relative bg-primary/10 p-2 rounded-lg">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {destinations.filter(d => 
                  d.coordinates && (!activeCategory || d.categories.includes(activeCategory))
                ).length} destinos
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activeCategory ? `en ${activeCategory}` : 'en el Atlántico'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Quick Actions */}
        {isMobileView && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-20 right-4 flex flex-col gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fitToDestinations}
              className="bg-white/95 backdrop-blur-md rounded-full shadow-lg p-3 text-gray-700"
            >
              <Navigation2 className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
              />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Cargando mapa...
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {isMobileView && selectedDestination && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragDirectionLock
            dragElastic={0.2}
            dragConstraints={{ top: 0 }}
            onDragEnd={handleDragEnd}
            style={{ y: dragY }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-50"
          >
            {/* Drag Handle */}
            <div className="p-3 pb-0">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
            </div>

            {/* Content */}
            <div className="p-6 pb-safe max-h-[60vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedDestination.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedDestination.categories.slice(0, 3).map((cat) => {
                      const color = categoryConfig[cat]?.color || brandColors.primary;
                      return (
                        <span
                          key={cat}
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          {cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Image */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                <img 
                  src={selectedDestination.image} 
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                {selectedDestination.tagline || selectedDestination.description.slice(0, 150) + '...'}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`/destinations/${selectedDestination.id}`}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-medium text-center transition-all active:scale-95"
                >
                  Ver detalles
                </a>
                <button
                  onClick={() => {
                    window.open(
                      `https://maps.google.com/?q=${selectedDestination.coordinates?.lat},${selectedDestination.coordinates?.lng}`,
                      '_blank'
                    );
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium transition-all active:scale-95"
                >
                  Cómo llegar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Effect */}
      {!isMobileView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-4 right-4 pointer-events-none"
        >
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
        </motion.div>
      )}
    </div>
  );
}