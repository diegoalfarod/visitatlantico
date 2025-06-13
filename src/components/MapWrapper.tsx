// src/components/MapWrapper.tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import del MapView real
const MapViewComponent = dynamic(
  () => import('./MapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-2xl bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

interface MapWrapperProps {
  destinations: any[];
  categoryConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }>;
  brandColors: any;
}

export default function MapWrapper({ destinations, categoryConfig, brandColors }: MapWrapperProps) {
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    // Get token only on client side
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    setMapboxToken(token);
  }, []);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapViewComponent 
      destinations={destinations}
      categoryConfig={categoryConfig}
      brandColors={brandColors}
      mapboxToken={mapboxToken}
    />
  );
}