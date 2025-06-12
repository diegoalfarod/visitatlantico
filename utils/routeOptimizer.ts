// utils/routeOptimizer.ts

import type { Stop } from "@/components/ItineraryStopCard";

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recalcula los horarios de un itinerario manteniendo las duraciones
 */
export function recalculateTimings(stops: Stop[]): Stop[] {
  let currentTime = 9 * 60; // 09:00 en minutos

  return stops.map((stop, index) => {
    if (index > 0) {
      // Agregar tiempo de viaje entre paradas (30 minutos promedio)
      currentTime += 30;
    }

    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const startTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    currentTime += stop.durationMinutes;

    return {
      ...stop,
      startTime,
    };
  });
}

/**
 * Optimiza el orden de las paradas usando el algoritmo del vecino más cercano
 */
export function optimizeItineraryByDistance(
  stops: Stop[],
  userLocation?: { lat: number; lng: number } | null
): Stop[] {
  if (stops.length <= 1) return recalculateTimings(stops);

  const optimizedOrder: Stop[] = [];
  const remaining = [...stops];

  // Punto de inicio (ubicación del usuario o primera parada)
  let currentPoint = userLocation || {
    lat: remaining[0].lat,
    lng: remaining[0].lng,
  };

  // Algoritmo del vecino más cercano
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentPoint.lat,
      currentPoint.lng,
      remaining[0].lat,
      remaining[0].lng
    );

    // Encontrar la parada más cercana
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        currentPoint.lat,
        currentPoint.lng,
        remaining[i].lat,
        remaining[i].lng
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Mover la parada más cercana al itinerario optimizado
    const nearestStop = remaining.splice(nearestIndex, 1)[0];
    optimizedOrder.push(nearestStop);

    // Actualizar el punto actual
    currentPoint = {
      lat: nearestStop.lat,
      lng: nearestStop.lng,
    };
  }

  return recalculateTimings(optimizedOrder);
}

/**
 * Añade paradas de almuerzo en horarios apropiados
 */
export function addLunchBreaks(stops: Stop[]): Stop[] {
  const lunchTime = 12 * 60; // 12:00 en minutos
  const updatedStops: Stop[] = [];
  let currentTime = 9 * 60;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    
    // Si es cerca del mediodía y no hemos añadido almuerzo
    if (currentTime <= lunchTime && currentTime + stop.durationMinutes > lunchTime) {
      // Añadir parada de almuerzo
      const lunchStop: Stop = {
        id: `lunch-${Date.now()}`,
        name: "Pausa para almuerzo",
        description: "Tiempo para disfrutar de la gastronomía local",
        lat: stop.lat,
        lng: stop.lng,
        startTime: `${Math.floor(lunchTime / 60)}:${(lunchTime % 60).toString().padStart(2, "0")}`,
        durationMinutes: 60,
        category: "Gastronomía",
        municipality: stop.municipality,
        distance: 0,
        type: "experience",
        imageUrl: "/images/restaurant-placeholder.jpg",
        tip: "Prueba los platos típicos del Atlántico como el arroz de lisa o la butifarra"
      };
      
      updatedStops.push(lunchStop);
      currentTime = lunchTime + 60;
    }
    
    updatedStops.push({
      ...stop,
      startTime: `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, "0")}`
    });
    
    currentTime += stop.durationMinutes + 30; // +30 min de viaje
  }

  return updatedStops;
}

/**
 * Extiende el tiempo en actividades de playa
 */
export function extendBeachTime(stops: Stop[]): Stop[] {
  return stops.map(stop => {
    if (stop.category?.toLowerCase().includes('playa') || 
        stop.name.toLowerCase().includes('playa') ||
        stop.description.toLowerCase().includes('playa')) {
      return {
        ...stop,
        durationMinutes: Math.min(stop.durationMinutes + 60, 240) // Max 4 horas
      };
    }
    return stop;
  });
}

/**
 * Hace el itinerario más amigable para familias con niños
 */
export function makeKidFriendly(stops: Stop[]): Stop[] {
  // Reducir duraciones largas
  const familyStops = stops.map(stop => ({
    ...stop,
    durationMinutes: Math.min(stop.durationMinutes, 90) // Max 1.5 horas por parada
  }));

  // Añadir más descansos
  const withBreaks: Stop[] = [];
  let stopsCount = 0;

  familyStops.forEach((stop, index) => {
    withBreaks.push(stop);
    stopsCount++;

    // Añadir descanso cada 2 paradas
    if (stopsCount === 2 && index < familyStops.length - 1) {
      const breakStop: Stop = {
        id: `break-${Date.now()}-${index}`,
        name: "Descanso familiar",
        description: "Tiempo para descansar, ir al baño o tomar un snack",
        lat: stop.lat,
        lng: stop.lng,
        startTime: "", // Se recalculará
        durationMinutes: 30,
        category: "Descanso",
        municipality: stop.municipality,
        distance: 0,
        type: "experience",
        imageUrl: "/images/park-placeholder.jpg",
        tip: "Aprovecha para hidratarte y aplicar protector solar"
      };
      withBreaks.push(breakStop);
      stopsCount = 0;
    }
  });

  return recalculateTimings(withBreaks);
}

/**
 * Calcula estadísticas del día
 */
export function calculateDayStats(stops: Stop[]) {
  const totalMinutes = stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const categories = Array.from(new Set(stops.map(s => s.category).filter(Boolean)));
  
  // Calcular distancia total aproximada
  let totalDistance = 0;
  for (let i = 1; i < stops.length; i++) {
    totalDistance += calculateDistance(
      stops[i-1].lat,
      stops[i-1].lng,
      stops[i].lat,
      stops[i].lng
    );
  }

  return {
    totalHours: Math.floor(totalMinutes / 60),
    totalMinutes: totalMinutes % 60,
    distance: Math.round(totalDistance),
    categories,
    stops: stops.length
  };
}