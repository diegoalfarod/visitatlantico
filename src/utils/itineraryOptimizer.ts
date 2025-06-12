// utils/itineraryOptimizer.ts

import type { Stop } from "@/components/ItineraryStopCard";

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 */
function calculateDistance(
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
function recalculateTimings(stops: Stop[]): Stop[] {
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
 * Intenta minimizar la distancia total del recorrido
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
 * Calcula la distancia total de un itinerario
 */
export function calculateTotalDistance(
  stops: Stop[],
  userLocation?: { lat: number; lng: number } | null
): number {
  if (stops.length === 0) return 0;

  let totalDistance = 0;
  let currentPoint = userLocation || { lat: stops[0].lat, lng: stops[0].lng };

  for (const stop of stops) {
    totalDistance += calculateDistance(
      currentPoint.lat,
      currentPoint.lng,
      stop.lat,
      stop.lng
    );
    currentPoint = { lat: stop.lat, lng: stop.lng };
  }

  return totalDistance;
}

/**
 * Calcula el tiempo total estimado de viaje entre paradas
 */
export function calculateTotalTravelTime(
  stops: Stop[],
  userLocation?: { lat: number; lng: number } | null
): number {
  const totalDistance = calculateTotalDistance(stops, userLocation);
  // Asumiendo velocidad promedio de 30 km/h en tráfico urbano
  return Math.round((totalDistance / 30) * 60); // en minutos
}