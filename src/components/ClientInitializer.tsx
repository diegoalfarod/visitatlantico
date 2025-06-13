"use client";

import { useEffect } from 'react';
import { OfflineManager } from '@/utils/offline-manager';
import { ItineraryStorage } from '@/utils/itinerary-storage';

export default function ClientInitializer() {
  useEffect(() => {
    // Inicializar offline manager
    OfflineManager.init();
    OfflineManager.registerServiceWorker();
    
    // Limpiar itinerarios viejos
    ItineraryStorage.cleanupOld();
  }, []);

  return null; // Este componente no renderiza nada
}