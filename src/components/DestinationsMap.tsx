// src/components/DestinationsMap.tsx
"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import mapboxgl, { Map, Marker, LngLatBounds } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, MapPin, Compass, ZoomIn, ZoomOut, Mountain, Satellite } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  image: string;
  categories: string[];
  coordinates?: { lat: number; lng: number };
}

interface Props {
  destinations: Destination[];
  categoryConfig: Record<string, { color: string }>;
  brandColors: { primary: string };
  mapboxToken: string;
  selectedDestination: Destination | null;
  hoveredDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  onHoverDestination: (dest: Destination | null) => void;
}

interface CustomMarker extends Marker {
  _destination: Destination;
}

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

// Memoized to prevent unnecessary re-renders
const mapStylesConfig = {
  streets: "mapbox://styles/mapbox/light-v11",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const DestinationsMap = memo(function DestinationsMap({
  destinations,
  categoryConfig,
  brandColors,
  mapboxToken,
  selectedDestination,
  hoveredDestination,
  onSelectDestination,
  onHoverDestination
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<CustomMarker[]>([]);
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new window.Map());
  
  const [mapStyle, setMapStyle] = useState<'streets' | 'outdoors' | 'satellite'>('streets');
  const [showStyleSwitcher, setShowStyleSwitcher] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mobile] = useState(isMobile);

  const ATLANTICO_CENTER: [number, number] = [-74.82, 10.96];

  const mapStyles = mapStylesConfig;

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles.streets,
      center: ATLANTICO_CENTER,
      zoom: mobile ? 8.5 : 9.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      touchPitch: false,
      dragRotate: false,
      fadeDuration: 0, // Faster tile loading
      trackResize: true,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
      
      // Fit to destinations
      if (destinations.length > 0) {
        const bounds = new LngLatBounds();
        destinations.forEach(d => {
          if (d.coordinates) bounds.extend([d.coordinates.lng, d.coordinates.lat]);
        });
        map.fitBounds(bounds, { padding: mobile ? 40 : 60, duration: 1000 });
      }
    });

    map.on('click', () => onSelectDestination(null));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  // Update style
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.setStyle(mapStyles[mapStyle]);
  }, [mapStyle, mapLoaded]);

  // Create markers - optimized
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    markerElementsRef.current.clear();

    // Create new markers
    destinations.forEach((dest) => {
      if (!dest.coordinates) return;

      const color = categoryConfig[dest.categories[0]]?.color || brandColors.primary;
      
      const el = document.createElement('div');
      el.className = 'dest-marker';
      el.innerHTML = `
        <div class="marker-inner" data-id="${dest.id}">
          <div class="marker-pulse" style="background:${color}30"></div>
          <div class="marker-ring" style="border-color:${color}">
            <img src="${dest.image}" alt="" loading="lazy" onerror="this.src='/placeholder-destination.jpg'" />
          </div>
          <div class="marker-badge" style="background:${color}">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          </div>
        </div>
      `;
      
      // Store reference
      markerElementsRef.current.set(dest.id, el);
      
      // Hover handlers (desktop only)
      if (!mobile) {
        el.addEventListener('mouseenter', () => onHoverDestination(dest));
        el.addEventListener('mouseleave', () => onHoverDestination(null));
      }
      
      // Click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectDestination(dest);
        mapRef.current?.flyTo({
          center: [dest.coordinates!.lng, dest.coordinates!.lat],
          zoom: 13,
          duration: 600,
        });
      });
      
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([dest.coordinates.lng, dest.coordinates.lat])
        .addTo(mapRef.current!) as CustomMarker;
      
      marker._destination = dest;
      markersRef.current.push(marker);
    });
  }, [destinations, categoryConfig, brandColors, mapLoaded, mobile, onSelectDestination, onHoverDestination]);

  // Update marker styles on selection/hover changes
  useEffect(() => {
    markerElementsRef.current.forEach((el, id) => {
      const inner = el.querySelector('.marker-inner') as HTMLElement;
      const isSelected = selectedDestination?.id === id;
      const isHovered = hoveredDestination?.id === id;
      
      if (inner) {
        inner.style.transform = isSelected || isHovered ? 'scale(1.2)' : 'scale(1)';
        inner.style.zIndex = isSelected || isHovered ? '100' : '1';
      }
    });
  }, [selectedDestination, hoveredDestination]);

  // Fly to selected
  useEffect(() => {
    if (!mapRef.current || !selectedDestination?.coordinates) return;
    mapRef.current.flyTo({
      center: [selectedDestination.coordinates.lng, selectedDestination.coordinates.lat],
      zoom: 13,
      duration: 600,
    });
  }, [selectedDestination]);

  const fitAll = useCallback(() => {
    if (!mapRef.current || !destinations.length) return;
    const bounds = new LngLatBounds();
    destinations.forEach(d => {
      if (d.coordinates) bounds.extend([d.coordinates.lng, d.coordinates.lat]);
    });
    mapRef.current.fitBounds(bounds, { padding: mobile ? 40 : 60, duration: 800 });
    onSelectDestination(null);
  }, [destinations, mobile, onSelectDestination]);

  const zoomIn = useCallback(() => mapRef.current?.zoomIn({ duration: 200 }), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut({ duration: 200 }), []);

  return (
    <div className="relative w-full h-full">
      <style jsx global>{`
        .dest-marker { cursor: pointer; }
        .marker-inner {
          position: relative;
          width: 48px;
          height: 48px;
          transition: transform 0.2s ease;
        }
        .marker-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .marker-ring {
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          border: 3px solid;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .marker-ring img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .marker-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(255, 255, 255, 0.9) !important;
          font-size: 10px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
        }
      `}</style>

      <div ref={mapContainer} className="w-full h-full" style={{ background: '#f1f5f9' }} />
      
      {/* Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        <div className="relative">
          <button
            onClick={() => setShowStyleSwitcher(!showStyleSwitcher)}
            className="w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showStyleSwitcher && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-10 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 min-w-[110px]"
              >
                {[
                  { key: 'streets', label: 'Calles', icon: MapPin },
                  { key: 'outdoors', label: 'Terreno', icon: Mountain },
                  { key: 'satellite', label: 'Satélite', icon: Satellite },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setMapStyle(key as any); setShowStyleSwitcher(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      mapStyle === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <button onClick={zoomIn} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-b border-slate-100">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={zoomOut} className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button onClick={fitAll} className="w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors">
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{destinations.length} destinos</p>
            <p className="text-[10px] text-slate-500">en el mapa</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-600 mt-3">Cargando mapa...</p>
          </div>
        </div>
      )}

      {showStyleSwitcher && <div className="absolute inset-0 z-10" onClick={() => setShowStyleSwitcher(false)} />}
    </div>
  );
});

export default DestinationsMap;