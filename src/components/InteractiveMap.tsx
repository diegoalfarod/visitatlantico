// components/InteractiveMap.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// IMPORTANTE: Configura tu token de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'tu-mapbox-token-aqui';

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  startTime: string;
  municipality: string;
  category: string;
  estimatedCost: number;
  rating?: number;
  imageUrl?: string;
  crowdLevel: string;
}

interface InteractiveMapProps {
  stops: Stop[];
  selectedStop: string | null;
  onStopSelect: (stopId: string | null) => void;
  mapStyle: 'streets' | 'satellite' | 'outdoors';
  showRoutes: boolean;
  className?: string;
}

const mapStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12'
};

const categoryColors: Record<string, string> = {
  cultura: '#8B5CF6',
  playa: '#06B6D4',
  gastronomia: '#F59E0B',
  naturaleza: '#10B981',
  aventura: '#EF4444',
  historia: '#6B7280',
  museo: '#7C3AED',
  malecon: '#3B82F6',
  default: '#DC2626'
};

export default function InteractiveMap({ 
  stops, 
  selectedStop, 
  onStopSelect, 
  mapStyle, 
  showRoutes,
  className = ''
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Verificar si el token está configurado
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'tu-mapbox-token-aqui') {
      console.error('Token de Mapbox no configurado. Añade NEXT_PUBLIC_MAPBOX_TOKEN a tu .env.local');
      return;
    }

    // Calcular bounds basado en las paradas
    const bounds = new mapboxgl.LngLatBounds();
    stops.forEach(stop => bounds.extend([stop.lng, stop.lat]));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: stops.length > 0 ? [stops[0].lng, stops[0].lat] : [-74.7889, 10.9878], // Fallback a Barranquilla
      zoom: 12,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Ajustar vista para mostrar todas las paradas
      if (stops.length > 0) {
        map.current?.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(mapStyles[mapStyle]);
      map.current.once('styledata', () => {
        addMarkersAndRoutes();
      });
    }
  }, [mapStyle, mapLoaded]);

  // Add markers and routes
  const addMarkersAndRoutes = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Remove existing route layer
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add markers
    stops.forEach((stop, index) => {
      const isSelected = selectedStop === stop.id;
      const color = categoryColors[stop.category] || categoryColors.default;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = `marker ${isSelected ? 'selected' : ''}`;
      markerElement.innerHTML = `
        <div style="
          width: ${isSelected ? '40px' : '32px'};
          height: ${isSelected ? '40px' : '32px'};
          background-color: ${isSelected ? '#FFD700' : color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: ${isSelected ? '16px' : '14px'};
          color: ${isSelected ? '#000' : '#fff'};
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          position: relative;
          z-index: ${isSelected ? '10' : '1'};
        ">
          ${index + 1}
        </div>
      `;

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        if (!isSelected) {
          markerElement.style.transform = 'scale(1.1)';
        }
      });

      markerElement.addEventListener('mouseleave', () => {
        if (!isSelected) {
          markerElement.style.transform = 'scale(1)';
        }
      });

      // Add click handler
      markerElement.addEventListener('click', () => {
        onStopSelect(selectedStop === stop.id ? null : stop.id);
      });

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([stop.lng, stop.lat])
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="max-width: 280px; padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 24px; 
              height: 24px; 
              background-color: ${color}; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 12px;
            ">
              ${index + 1}
            </div>
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${stop.name}</h3>
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 4px; font-size: 14px; color: #6b7280; margin-bottom: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              ${stop.startTime} • ${stop.municipality}
            </div>
            ${stop.rating ? `
              <div style="display: flex; align-items: center; gap: 4px; font-size: 14px; color: #f59e0b;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${stop.rating}/5
              </div>
            ` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            ${stop.estimatedCost > 0 ? `
              <span style="background-color: #ecfdf5; color: #059669; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                $${stop.estimatedCost.toLocaleString()}
              </span>
            ` : '<span></span>'}
            
            <div style="display: flex; gap: 4px;">
              <button onclick="navigator.geolocation.getCurrentPosition(pos => {
                const url = 'https://www.google.com/maps/dir/' + pos.coords.latitude + ',' + pos.coords.longitude + '/' + ${stop.lat} + ',' + ${stop.lng};
                window.open(url, '_blank');
              })" style="
                background-color: #3b82f6; 
                color: white; 
                border: none; 
                padding: 6px 12px; 
                border-radius: 6px; 
                font-size: 12px; 
                cursor: pointer;
                font-weight: 500;
              ">
                Direcciones
              </button>
            </div>
          </div>
        </div>
      `);

      marker.setPopup(popup);
      
      // Show popup for selected stop
      if (isSelected) {
        popup.addTo(map.current!);
      }

      markers.current.push(marker);
    });

    // Add route if enabled
    if (showRoutes && stops.length > 1) {
      const routeCoordinates = stops.map(stop => [stop.lng, stop.lat]);
      
      map.current.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': routeCoordinates
          }
        }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#3B82F6',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add route animation
      map.current.addLayer({
        'id': 'route-animation',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#60A5FA',
          'line-width': 6,
          'line-opacity': 0.4,
          'line-dasharray': [2, 4]
        }
      });
    }
  };

  // Update markers when stops or selection changes
  useEffect(() => {
    if (mapLoaded) {
      addMarkersAndRoutes();
    }
  }, [stops, selectedStop, showRoutes, mapLoaded]);

  // Fly to selected stop
  useEffect(() => {
    if (map.current && selectedStop && mapLoaded) {
      const stop = stops.find(s => s.id === selectedStop);
      if (stop) {
        map.current.flyTo({
          center: [stop.lng, stop.lat],
          zoom: 16,
          duration: 1500
        });
      }
    }
  }, [selectedStop, stops, mapLoaded]);

  if (!mapboxgl.accessToken || mapboxgl.accessToken === 'tu-mapbox-token-aqui') {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración requerida</h3>
          <p className="text-gray-600 text-sm mb-4">
            Para usar el mapa interactivo, configura tu token de Mapbox en las variables de entorno.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-left text-xs text-gray-700 font-mono">
            NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_aqui
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
    </div>
  );
}