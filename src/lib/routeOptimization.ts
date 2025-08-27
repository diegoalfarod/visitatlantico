// lib/routeOptimization.ts
interface Location {
    lat: number;
    lng: number;
  }
  
  interface ItineraryStop {
    id: string;
    name: string;
    lat: number;
    lng: number;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    category: string;
    municipality: string;
    estimatedCost: number;
    crowdLevel: string;
  }
  
  interface RouteOptimizationResult {
    optimizedStops: ItineraryStop[];
    totalDistance: number;
    totalTravelTime: number;
    suggestedBreaks: BreakSuggestion[];
    routeAnalysis: RouteAnalysis;
  }
  
  interface BreakSuggestion {
    id: string;
    type: 'meal' | 'rest' | 'bathroom' | 'photo';
    name: string;
    description: string;
    insertAfterStopId: string;
    estimatedDuration: number;
    lat: number;
    lng: number;
    category: string;
  }
  
  interface RouteAnalysis {
    efficiency: number; // 0-100 score
    walkingIntensive: boolean;
    drivingRequired: boolean;
    publicTransportRecommended: boolean;
    peakTrafficWarnings: string[];
    accessibilityNotes: string[];
  }
  
  class RouteOptimizer {
    private mapboxToken: string;
  
    constructor(mapboxToken?: string) {
      this.mapboxToken = mapboxToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    }
  
    // Calcular distancias y tiempos reales usando Mapbox Directions API
    async getActualRoute(origin: Location, destination: Location, mode: 'driving' | 'walking' = 'driving') {
      if (!this.mapboxToken) {
        // Fallback con estimaciones
        return this.estimateRoute(origin, destination, mode);
      }
  
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${mode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${this.mapboxToken}&geometries=geojson&overview=full`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distance: route.distance / 1000, // Convert to km
            duration: route.duration / 60, // Convert to minutes
            geometry: route.geometry
          };
        }
      } catch (error) {
        console.warn('Mapbox Directions API error, using fallback:', error);
      }
  
      return this.estimateRoute(origin, destination, mode);
    }
  
    // Estimación cuando no hay API disponible
    private estimateRoute(origin: Location, destination: Location, mode: 'driving' | 'walking') {
      const distance = this.calculateHaversineDistance(origin, destination);
      const speed = mode === 'driving' ? 25 : 4; // km/h promedio en ciudad
      const duration = (distance / speed) * 60; // minutos
      
      return {
        distance,
        duration: Math.max(duration, mode === 'driving' ? 5 : 10), // mínimo realista
        geometry: null
      };
    }
  
    // Algoritmo de optimización de ruta (TSP simplificado)
    async optimizeRoute(stops: ItineraryStop[]): Promise<RouteOptimizationResult> {
      if (stops.length <= 2) {
        return {
          optimizedStops: stops,
          totalDistance: 0,
          totalTravelTime: 0,
          suggestedBreaks: [],
          routeAnalysis: this.analyzeRoute(stops)
        };
      }
  
      // 1. Crear matriz de distancias
      const distanceMatrix = await this.buildDistanceMatrix(stops);
      
      // 2. Optimizar secuencia usando heurística nearest neighbor mejorada
      const optimizedSequence = await this.findOptimalSequence(stops, distanceMatrix);
      
      // 3. Recalcular tiempos basados en la nueva secuencia
      const optimizedStops = await this.recalculateTimings(optimizedSequence, distanceMatrix);
      
      // 4. Sugerir pausas estratégicas
      const suggestedBreaks = this.suggestBreaks(optimizedStops, distanceMatrix);
      
      // 5. Calcular métricas totales
      const totalDistance = this.calculateTotalDistance(optimizedStops, distanceMatrix);
      const totalTravelTime = this.calculateTotalTravelTime(optimizedStops, distanceMatrix);
      
      return {
        optimizedStops,
        totalDistance,
        totalTravelTime,
        suggestedBreaks,
        routeAnalysis: this.analyzeRoute(optimizedStops)
      };
    }
  
    private async buildDistanceMatrix(stops: ItineraryStop[]) {
      const matrix: number[][] = [];
      
      for (let i = 0; i < stops.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < stops.length; j++) {
          if (i === j) {
            matrix[i][j] = 0;
          } else {
            const route = await this.getActualRoute(
              { lat: stops[i].lat, lng: stops[i].lng },
              { lat: stops[j].lat, lng: stops[j].lng }
            );
            matrix[i][j] = route.distance;
          }
        }
      }
      
      return matrix;
    }
  
    private async findOptimalSequence(stops: ItineraryStop[], distanceMatrix: number[][]) {
      const n = stops.length;
      
      // Para itinerarios pequeños, usar fuerza bruta
      if (n <= 6) {
        return this.bruteForceOptimization(stops, distanceMatrix);
      }
      
      // Para itinerarios más grandes, usar heurística nearest neighbor mejorada
      return this.nearestNeighborOptimization(stops, distanceMatrix);
    }
  
    private bruteForceOptimization(stops: ItineraryStop[], distanceMatrix: number[][]) {
      const permutations = this.generatePermutations(stops.slice(1)); // Mantener primer stop fijo
      let bestRoute = stops;
      let bestDistance = Infinity;
      
      for (const perm of permutations) {
        const route = [stops[0], ...perm];
        const distance = this.calculateRouteDistance(route, distanceMatrix, stops);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestRoute = route;
        }
      }
      
      return bestRoute;
    }
  
    private nearestNeighborOptimization(stops: ItineraryStop[], distanceMatrix: number[][]) {
      const visited = new Set<number>();
      const route: ItineraryStop[] = [];
      
      // Empezar desde el primer stop
      let currentIndex = 0;
      route.push(stops[currentIndex]);
      visited.add(currentIndex);
      
      while (visited.size < stops.length) {
        let nearestIndex = -1;
        let nearestDistance = Infinity;
        
        for (let i = 0; i < stops.length; i++) {
          if (!visited.has(i) && distanceMatrix[currentIndex][i] < nearestDistance) {
            nearestDistance = distanceMatrix[currentIndex][i];
            nearestIndex = i;
          }
        }
        
        if (nearestIndex !== -1) {
          route.push(stops[nearestIndex]);
          visited.add(nearestIndex);
          currentIndex = nearestIndex;
        }
      }
      
      return route;
    }
  
    private async recalculateTimings(stops: ItineraryStop[], distanceMatrix: number[][]) {
      const optimizedStops = [...stops];
      let currentTime = this.parseTime(stops[0].startTime);
      
      for (let i = 0; i < optimizedStops.length; i++) {
        const stop = optimizedStops[i];
        
        if (i > 0) {
          // Agregar tiempo de viaje desde la parada anterior
          const travelTimeMinutes = await this.getTravelTime(
            optimizedStops[i-1],
            stop
          );
          currentTime += travelTimeMinutes;
        }
        
        // Actualizar horario de llegada
        optimizedStops[i].startTime = this.formatTime(currentTime);
        currentTime += stop.durationMinutes;
        optimizedStops[i].endTime = this.formatTime(currentTime);
        
        // Agregar buffer de 10 minutos entre paradas
        currentTime += 10;
      }
      
      return optimizedStops;
    }
  
    private suggestBreaks(stops: ItineraryStop[], distanceMatrix: number[][]): BreakSuggestion[] {
      const breaks: BreakSuggestion[] = [];
      let cumulativeTime = 0;
      let lastMealTime = 0;
      
      for (let i = 0; i < stops.length - 1; i++) {
        cumulativeTime += stops[i].durationMinutes;
        
        // Sugerir comida cada 4-5 horas
        if (cumulativeTime - lastMealTime >= 240) {
          const mealBreak = this.findNearbyRestaurant(stops[i], stops[i + 1]);
          if (mealBreak) {
            breaks.push({
              ...mealBreak,
              type: 'meal',
              insertAfterStopId: stops[i].id,
              estimatedDuration: 60
            });
            lastMealTime = cumulativeTime;
          }
        }
        
        // Sugerir descanso si la distancia es muy larga
        const distance = distanceMatrix[i][i + 1];
        if (distance > 10) { // Más de 10km
          breaks.push({
            id: `rest_${i}`,
            type: 'rest',
            name: 'Parada de descanso recomendada',
            description: 'Punto intermedio para descansar durante el trayecto largo',
            insertAfterStopId: stops[i].id,
            estimatedDuration: 15,
            lat: (stops[i].lat + stops[i + 1].lat) / 2,
            lng: (stops[i].lng + stops[i + 1].lng) / 2,
            category: 'descanso'
          });
        }
      }
      
      return breaks;
    }
  
    private findNearbyRestaurant(currentStop: ItineraryStop, nextStop: ItineraryStop): Partial<BreakSuggestion> | null {
      // Lista de restaurantes conocidos en el Atlántico (esto debería venir de la base de datos)
      const restaurants = [
        {
          id: 'rest_malecon',
          name: 'Restaurante Malecón',
          description: 'Gastronomía caribeña con vista al río',
          lat: 10.9878,
          lng: -74.7889,
          category: 'gastronomia'
        },
        {
          id: 'rest_centro',
          name: 'La Casa del Marisco',
          description: 'Especialidad en mariscos frescos',
          lat: 10.9838,
          lng: -74.7881,
          category: 'gastronomia'
        }
      ];
      
      // Encontrar el restaurante más cercano a la ruta
      const midpoint = {
        lat: (currentStop.lat + nextStop.lat) / 2,
        lng: (currentStop.lng + nextStop.lng) / 2
      };
      
      let closestRestaurant = null;
      let minDistance = Infinity;
      
      for (const restaurant of restaurants) {
        const distance = this.calculateHaversineDistance(midpoint, restaurant);
        if (distance < minDistance && distance < 5) { // Dentro de 5km de la ruta
          minDistance = distance;
          closestRestaurant = restaurant;
        }
      }
      
      return closestRestaurant;
    }
  
    private analyzeRoute(stops: ItineraryStop[]): RouteAnalysis {
      const totalDistance = stops.reduce((sum, stop, index) => {
        if (index === 0) return sum;
        return sum + this.calculateHaversineDistance(
          { lat: stops[index - 1].lat, lng: stops[index - 1].lng },
          { lat: stop.lat, lng: stop.lng }
        );
      }, 0);
      
      const isWalkingIntensive = totalDistance < 3;
      const isDrivingRequired = totalDistance > 15;
      
      return {
        efficiency: Math.min(100, Math.max(0, 100 - (totalDistance * 2))),
        walkingIntensive: isWalkingIntensive,
        drivingRequired: isDrivingRequired,
        publicTransportRecommended: !isWalkingIntensive && !isDrivingRequired,
        peakTrafficWarnings: this.generateTrafficWarnings(stops),
        accessibilityNotes: this.generateAccessibilityNotes(stops)
      };
    }
  
    private generateTrafficWarnings(stops: ItineraryStop[]): string[] {
      const warnings = [];
      
      for (const stop of stops) {
        const hour = this.parseTime(stop.startTime) / 60;
        
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          warnings.push(`Tráfico pesado esperado alrededor de las ${stop.startTime} cerca de ${stop.name}`);
        }
      }
      
      return warnings;
    }
  
    private generateAccessibilityNotes(stops: ItineraryStop[]): string[] {
      const notes = [];
      
      // Esto debería basarse en datos reales de accesibilidad
      const accessibilityData: Record<string, string> = {
        'museo': 'La mayoría de museos cuentan con acceso para sillas de ruedas',
        'playa': 'Acceso limitado para sillas de ruedas en algunas playas',
        'cultura': 'Verificar accesibilidad específica del sitio histórico'
      };
      
      const categories = new Set(stops.map(s => s.category));
      for (const category of categories) {
        if (accessibilityData[category]) {
          notes.push(accessibilityData[category]);
        }
      }
      
      return notes;
    }
  
    // Utilidades
    private calculateHaversineDistance(point1: Location, point2: Location): number {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (point2.lat - point1.lat) * Math.PI / 180;
      const dLon = (point2.lng - point1.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    private parseTime(timeString: string): number {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    }
  
    private formatTime(minutes: number): string {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
  
    private async getTravelTime(from: ItineraryStop, to: ItineraryStop): Promise<number> {
      const route = await this.getActualRoute(
        { lat: from.lat, lng: from.lng },
        { lat: to.lat, lng: to.lng }
      );
      return route.duration;
    }
  
    private generatePermutations<T>(array: T[]): T[][] {
      if (array.length <= 1) return [array];
      
      const result: T[][] = [];
      for (let i = 0; i < array.length; i++) {
        const rest = [...array.slice(0, i), ...array.slice(i + 1)];
        const perms = this.generatePermutations(rest);
        for (const perm of perms) {
          result.push([array[i], ...perm]);
        }
      }
      return result;
    }
  
    private calculateRouteDistance(route: ItineraryStop[], distanceMatrix: number[][], originalStops: ItineraryStop[]): number {
      let totalDistance = 0;
      for (let i = 0; i < route.length - 1; i++) {
        const fromIndex = originalStops.indexOf(route[i]);
        const toIndex = originalStops.indexOf(route[i + 1]);
        totalDistance += distanceMatrix[fromIndex][toIndex];
      }
      return totalDistance;
    }
  
    private calculateTotalDistance(stops: ItineraryStop[], distanceMatrix: number[][]): number {
      let total = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        total += distanceMatrix[i][i + 1];
      }
      return total;
    }
  
    private calculateTotalTravelTime(stops: ItineraryStop[], distanceMatrix: number[][]): number {
      let total = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        // Estimar tiempo basado en distancia (asumiendo 25 km/h promedio en ciudad)
        total += (distanceMatrix[i][i + 1] / 25) * 60; // minutos
      }
      return total;
    }
  }
  
  export default RouteOptimizer;