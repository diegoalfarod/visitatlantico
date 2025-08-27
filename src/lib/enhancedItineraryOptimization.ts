// lib/enhancedItineraryOptimization.ts

interface EnhancedUserProfile {
    days: number;
    email: string;
    interests: string[];
    tripType: string;
    budget: string;
    locationRange: string;
    startLocation?: any;
    // Nuevos campos para mayor especificidad
    preferredPace: 'relaxed' | 'moderate' | 'intensive';
    maxTravelDistance: number; // km por día
    culturalDepth: 'surface' | 'deep' | 'immersive';
    foodAdventure: boolean;
    physicalActivity: 'low' | 'moderate' | 'high';
    crowdTolerance: 'avoid' | 'moderate' | 'doesnt_matter';
  }
  
  interface MunicipalityCluster {
    name: string;
    centerCoords: { lat: number; lng: number };
    destinations: any[];
    estimatedTimeToExplore: number; // horas mínimas realistas
    accessFromBarranquilla: number; // minutos
    bestTransportMode: 'walking' | 'taxi' | 'bus' | 'car_required';
    specialties: string[]; // qué ofrece único este municipio
  }
  
  interface DayTheme {
    theme: string;
    municipality: string;
    focusCategories: string[];
    estimatedTravelTime: number;
    recommendedStartTime: string;
    maxRecommendedStops: number;
  }
  
  class EnhancedItineraryOptimizer {
    private municipalities: Map<string, MunicipalityCluster>;
    private interestWeights: Map<string, number>;
    private mapboxToken: string;
  
    constructor(mapboxToken?: string) {
      this.mapboxToken = mapboxToken || '';
      this.municipalities = new Map();
      this.interestWeights = new Map();
      this.initializeMunicipalities();
    }
  
    private initializeMunicipalities() {
      // Definir clusters municipales con datos realistas del Atlántico
      const municipalityData: MunicipalityCluster[] = [
        {
          name: "Barranquilla",
          centerCoords: { lat: 10.9878, lng: -74.7889 },
          destinations: [],
          estimatedTimeToExplore: 8, // Un día completo mínimo
          accessFromBarranquilla: 0,
          bestTransportMode: 'walking',
          specialties: ['cultura urbana', 'gastronomía', 'malecón', 'museos', 'vida nocturna']
        },
        {
          name: "Puerto Colombia",
          centerCoords: { lat: 10.9878, lng: -74.9547 },
          destinations: [],
          estimatedTimeToExplore: 6, // Medio día a día completo
          accessFromBarranquilla: 45,
          bestTransportMode: 'taxi',
          specialties: ['playas', 'historia férrea', 'gastronomía costera', 'muelle']
        },
        {
          name: "Soledad",
          centerCoords: { lat: 10.9185, lng: -74.7737 },
          destinations: [],
          estimatedTimeToExplore: 4,
          accessFromBarranquilla: 25,
          bestTransportMode: 'bus',
          specialties: ['comercio', 'gastronomía local', 'cultura popular']
        },
        {
          name: "Malambo",
          centerCoords: { lat: 10.8596, lng: -74.7739 },
          destinations: [],
          estimatedTimeToExplore: 3,
          accessFromBarranquilla: 30,
          bestTransportMode: 'bus',
          specialties: ['folclore', 'danza', 'artesanías']
        },
        {
          name: "Galapa",
          centerCoords: { lat: 10.8968, lng: -74.8821 },
          destinations: [],
          estimatedTimeToExplore: 4,
          accessFromBarranquilla: 35,
          bestTransportMode: 'car_required',
          specialties: ['naturaleza', 'ecoturismo', 'tranquilidad rural']
        },
        {
          name: "Tubará",
          centerCoords: { lat: 10.8833, lng: -75.0500 },
          destinations: [],
          estimatedTimeToExplore: 6,
          accessFromBarranquilla: 60,
          bestTransportMode: 'car_required',
          specialties: ['playas vírgenes', 'naturaleza', 'deportes acuáticos']
        }
      ];
  
      municipalityData.forEach(m => this.municipalities.set(m.name, m));
    }
  
    // Sistema de scoring ultra-específico para intereses
    private calculateInterestMatchScore(destination: any, userProfile: EnhancedUserProfile): number {
      let score = 0;
      const maxScore = 100;
  
      // Mapeo ultra-específico de intereses a palabras clave con pesos
      const specificInterestMap: Record<string, { keywords: string[], weight: number, exclusions?: string[] }> = {
        "relax": { 
          keywords: ['playa', 'spa', 'tranquilo', 'relajante', 'descanso', 'sereno'], 
          weight: 1.0,
          exclusions: ['ruido', 'multitud', 'actividad intensa']
        },
        "cultura": { 
          keywords: ['museo', 'patrimonio', 'historia', 'arte', 'colonial', 'arquitectura', 'cultural'], 
          weight: 1.2,
          exclusions: ['comercial', 'moderno sin valor histórico']
        },
        "aventura": { 
          keywords: ['deportes', 'extremo', 'aventura', 'actividad física', 'reto'], 
          weight: 1.1,
          exclusions: ['sedentario', 'pasivo']
        },
        "gastronomia": { 
          keywords: ['restaurante', 'comida', 'gastronomía', 'cocina', 'sabores', 'mariscos', 'típico'], 
          weight: 1.3,
          exclusions: ['comida rápida', 'cadena internacional']
        },
        "artesanias": { 
          keywords: ['artesanía', 'mercado', 'hecho a mano', 'local', 'tradicional', 'souvenirs auténticos'], 
          weight: 1.0
        },
        "ritmos": { 
          keywords: ['música', 'baile', 'folclore', 'cumbia', 'vallenato', 'mapalé', 'cultural'], 
          weight: 1.2
        },
        "festivales": { 
          keywords: ['festival', 'carnaval', 'evento', 'celebración', 'fiesta popular'], 
          weight: 0.8 // Menor peso porque son temporales
        },
        "deportes-acuaticos": { 
          keywords: ['kitesurf', 'windsurf', 'jet ski', 'buceo', 'snorkel', 'deportes acuáticos'], 
          weight: 1.0,
          exclusions: ['solo playa sin actividades']
        },
        "ecoturismo": { 
          keywords: ['naturaleza', 'eco', 'manglar', 'aves', 'conservación', 'verde', 'sostenible'], 
          weight: 1.1,
          exclusions: ['urbanizado', 'artificial']
        },
        "malecon": { 
          keywords: ['malecón', 'paseo', 'ribereño', 'caminata', 'bicicleta', 'río'], 
          weight: 0.9
        }
      };
  
      // Calcular score basado en matches específicos
      for (const interest of userProfile.interests) {
        const interestConfig = specificInterestMap[interest];
        if (!interestConfig) continue;
  
        let interestScore = 0;
        const searchText = `${destination.name} ${destination.description} ${destination.categories?.join(' ')}`.toLowerCase();
  
        // Puntos positivos por keywords
        for (const keyword of interestConfig.keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            interestScore += 20 * interestConfig.weight;
          }
        }
  
        // Puntos negativos por exclusiones
        if (interestConfig.exclusions) {
          for (const exclusion of interestConfig.exclusions) {
            if (searchText.includes(exclusion.toLowerCase())) {
              interestScore -= 15;
            }
          }
        }
  
        score += Math.max(0, interestScore);
      }
  
      // Bonificación por rating del lugar
      if (destination.rating) {
        score += (destination.rating - 3) * 5; // +5 por cada estrella sobre 3
      }
  
      // Penalización por nivel de multitud vs preferencia
      if (userProfile.crowdTolerance === 'avoid' && destination.crowdLevel === 'high') {
        score -= 20;
      }
  
      // Bonificación por profundidad cultural
      if (userProfile.culturalDepth === 'immersive' && 
          (destination.categories?.includes('museo') || destination.categories?.includes('historia'))) {
        score += 15;
      }
  
      return Math.min(maxScore, Math.max(0, score));
    }
  
    // Agrupar destinos por municipio
    private groupDestinationsByMunicipality(destinations: any[]): Map<string, any[]> {
      const groups = new Map<string, any[]>();
      
      for (const dest of destinations) {
        const municipality = dest.municipality || 'Barranquilla';
        if (!groups.has(municipality)) {
          groups.set(municipality, []);
        }
        groups.get(municipality)!.push({
          ...dest,
          interestScore: 0 // Se calculará después
        });
      }
  
      return groups;
    }
  
    // Crear plan de días temáticos por municipio
    private createDailyThemes(userProfile: EnhancedUserProfile, municipalityGroups: Map<string, any[]>): DayTheme[] {
      const themes: DayTheme[] = [];
      const availableMunicipalities = Array.from(municipalityGroups.keys())
        .filter(m => municipalityGroups.get(m)!.length > 0);
  
      // Estrategia: Un municipio por día para coherencia geográfica
      for (let day = 1; day <= userProfile.days; day++) {
        let selectedMunicipality: string;
        
        if (day === 1 || userProfile.locationRange === "barranquilla") {
          // Primer día siempre Barranquilla para orientación
          selectedMunicipality = "Barranquilla";
        } else {
          // Días siguientes: otros municipios por distancia y tiempo disponible
          const remainingMunicipalities = availableMunicipalities.filter(m => 
            m !== "Barranquilla" && !themes.some(t => t.municipality === m)
          );
          
          if (remainingMunicipalities.length > 0) {
            // Seleccionar municipio por tiempo disponible y acceso
            selectedMunicipality = this.selectOptimalMunicipality(remainingMunicipalities, userProfile);
          } else {
            selectedMunicipality = "Barranquilla"; // Fallback
          }
        }
  
        const municipalityCluster = this.municipalities.get(selectedMunicipality);
        if (!municipalityCluster) continue;
  
        // Determinar tema del día basado en intereses y especialidades del municipio
        const dayTheme = this.determineDayTheme(userProfile, selectedMunicipality, municipalityCluster);
        
        themes.push({
          theme: dayTheme.theme,
          municipality: selectedMunicipality,
          focusCategories: dayTheme.categories,
          estimatedTravelTime: municipalityCluster.accessFromBarranquilla,
          recommendedStartTime: day === 1 ? "09:00" : "08:00", // Salir más temprano para otros municipios
          maxRecommendedStops: this.calculateMaxStopsForDay(userProfile, municipalityCluster)
        });
      }
  
      return themes;
    }
  
    private selectOptimalMunicipality(municipalities: string[], userProfile: EnhancedUserProfile): string {
      let bestMunicipality = municipalities[0];
      let bestScore = 0;
  
      for (const municipality of municipalities) {
        const cluster = this.municipalities.get(municipality);
        if (!cluster) continue;
  
        let score = 0;
  
        // Penalizar por tiempo de acceso si el usuario prefiere relajado
        if (userProfile.preferredPace === 'relaxed' && cluster.accessFromBarranquilla > 45) {
          score -= 20;
        }
  
        // Bonificar por especialidades que coincidan con intereses
        for (const specialty of cluster.specialties) {
          for (const interest of userProfile.interests) {
            if (specialty.includes(interest) || interest.includes(specialty)) {
              score += 15;
            }
          }
        }
  
        // Considerar límite de distancia de viaje del usuario
        if (cluster.accessFromBarranquilla <= userProfile.maxTravelDistance * 60) { // convertir a minutos
          score += 10;
        }
  
        if (score > bestScore) {
          bestScore = score;
          bestMunicipality = municipality;
        }
      }
  
      return bestMunicipality;
    }
  
    private determineDayTheme(userProfile: EnhancedUserProfile, municipality: string, cluster: MunicipalityCluster) {
      const userInterests = userProfile.interests;
      const specialties = cluster.specialties;
  
      // Encontrar intersección entre intereses del usuario y especialidades del municipio
      const matchingSpecialties = specialties.filter(specialty => 
        userInterests.some(interest => 
          specialty.toLowerCase().includes(interest) || interest.includes(specialty.toLowerCase())
        )
      );
  
      let theme: string;
      let categories: string[];
  
      if (matchingSpecialties.length > 0) {
        theme = `${municipality}: ${matchingSpecialties[0]}`;
        categories = matchingSpecialties;
      } else {
        // Tema por defecto basado en la especialidad principal del municipio
        theme = `Explorando ${municipality}: ${specialties[0]}`;
        categories = [specialties[0]];
      }
  
      return { theme, categories };
    }
  
    private calculateMaxStopsForDay(userProfile: EnhancedUserProfile, cluster: MunicipalityCluster): number {
      let maxStops = 3; // Base conservadora
  
      // Ajustar por ritmo preferido
      switch (userProfile.preferredPace) {
        case 'relaxed':
          maxStops = 3;
          break;
        case 'moderate':
          maxStops = 4;
          break;
        case 'intensive':
          maxStops = Math.min(5, maxStops + 1);
          break;
      }
  
      // Reducir si el municipio requiere mucho tiempo de acceso
      if (cluster.accessFromBarranquilla > 45) {
        maxStops = Math.max(2, maxStops - 1);
      }
  
      // Ajustar por profundidad cultural deseada
      if (userProfile.culturalDepth === 'immersive') {
        maxStops = Math.max(2, maxStops - 1); // Menos lugares, más tiempo en cada uno
      }
  
      return maxStops;
    }
  
    // Seleccionar destinos ultra-específicos para cada día
    private selectDestinationsForTheme(
      theme: DayTheme, 
      availableDestinations: any[], 
      userProfile: EnhancedUserProfile
    ): any[] {
      // Calcular score de interés para cada destino
      const scoredDestinations = availableDestinations.map(dest => ({
        ...dest,
        interestScore: this.calculateInterestMatchScore(dest, userProfile),
        distanceFromCenter: this.calculateDistance(
          theme.municipality === 'Barranquilla' 
            ? { lat: 10.9878, lng: -74.7889 }
            : this.municipalities.get(theme.municipality)!.centerCoords,
          { lat: dest.coordinates?.lat || dest.lat, lng: dest.coordinates?.lng || dest.lng }
        )
      }));
  
      // Filtrar por relevancia mínima
      const relevantDestinations = scoredDestinations.filter(dest => dest.interestScore > 30);
  
      // Ordenar por score de interés y luego por proximidad
      relevantDestinations.sort((a, b) => {
        const scoreDiff = b.interestScore - a.interestScore;
        if (Math.abs(scoreDiff) < 10) { // Si los scores son similares, priorizar proximidad
          return a.distanceFromCenter - b.distanceFromCenter;
        }
        return scoreDiff;
      });
  
      // Seleccionar los mejores respetando límites de distancia
      const selectedDestinations = [];
      const maxDistance = userProfile.preferredPace === 'relaxed' ? 3 : 
                         userProfile.preferredPace === 'moderate' ? 5 : 8; // km
  
      for (const dest of relevantDestinations) {
        if (selectedDestinations.length >= theme.maxRecommendedStops) break;
        
        // Verificar que no esté demasiado lejos de otros destinos seleccionados
        const tooFarFromOthers = selectedDestinations.some(selected => 
          this.calculateDistance(
            { lat: dest.lat || dest.coordinates?.lat, lng: dest.lng || dest.coordinates?.lng },
            { lat: selected.lat || selected.coordinates?.lat, lng: selected.lng || selected.coordinates?.lng }
          ) > maxDistance
        );
  
        if (!tooFarFromOthers) {
          selectedDestinations.push(dest);
        }
      }
  
      // Si no hay suficientes, relajar criterios
      if (selectedDestinations.length < 2) {
        return relevantDestinations.slice(0, Math.max(2, theme.maxRecommendedStops));
      }
  
      return selectedDestinations;
    }
  
    // Generar itinerario optimizado con nueva lógica
    async generateEnhancedItinerary(destinations: any[], userProfile: EnhancedUserProfile) {
      console.log(`Generando itinerario ultra-específico para usuario con intereses: ${userProfile.interests.join(', ')}`);
  
      // 1. Agrupar destinos por municipio
      const municipalityGroups = this.groupDestinationsByMunicipality(destinations);
      
      // 2. Crear plan temático por días
      const dailyThemes = this.createDailyThemes(userProfile, municipalityGroups);
      
      console.log(`Plan temático: ${dailyThemes.map(t => `Día ${dailyThemes.indexOf(t) + 1}: ${t.theme}`).join(', ')}`);
  
      // 3. Seleccionar destinos específicos para cada tema
      const finalItinerary = [];
      
      for (let dayIndex = 0; dayIndex < dailyThemes.length; dayIndex++) {
        const theme = dailyThemes[dayIndex];
        const day = dayIndex + 1;
        
        const municipalityDestinations = municipalityGroups.get(theme.municipality) || [];
        const selectedDestinations = this.selectDestinationsForTheme(theme, municipalityDestinations, userProfile);
        
        console.log(`Día ${day} (${theme.municipality}): ${selectedDestinations.length} destinos seleccionados`);
  
        // Optimizar orden dentro del municipio por proximidad
        const optimizedOrder = this.optimizeWithinMunicipality(selectedDestinations);
        
        // Calcular horarios realistas
        const scheduledStops = await this.scheduleStopsForDay(optimizedOrder, theme, userProfile);
        
        finalItinerary.push(...scheduledStops.map(stop => ({
          ...stop,
          day,
          dayTitle: theme.theme
        })));
      }
  
      return {
        itinerary: finalItinerary,
        themes: dailyThemes,
        optimization: {
          municipalitiesVisited: dailyThemes.map(t => t.municipality),
          totalSpecificityScore: this.calculateOverallSpecificity(finalItinerary, userProfile),
          coherenceScore: this.calculateGeographicalCoherence(finalItinerary)
        }
      };
    }
  
    private optimizeWithinMunicipality(destinations: any[]): any[] {
      if (destinations.length <= 2) return destinations;
  
      // Usar algoritmo nearest neighbor para optimizar orden
      const optimized = [destinations[0]];
      const remaining = destinations.slice(1);
  
      while (remaining.length > 0) {
        const current = optimized[optimized.length - 1];
        let nearest = remaining[0];
        let nearestDistance = this.calculateDistance(
          { lat: current.lat || current.coordinates?.lat, lng: current.lng || current.coordinates?.lng },
          { lat: nearest.lat || nearest.coordinates?.lat, lng: nearest.lng || nearest.coordinates?.lng }
        );
  
        for (let i = 1; i < remaining.length; i++) {
          const distance = this.calculateDistance(
            { lat: current.lat || current.coordinates?.lat, lng: current.lng || current.coordinates?.lng },
            { lat: remaining[i].lat || remaining[i].coordinates?.lat, lng: remaining[i].lng || remaining[i].coordinates?.lng }
          );
          
          if (distance < nearestDistance) {
            nearest = remaining[i];
            nearestDistance = distance;
          }
        }
  
        optimized.push(nearest);
        remaining.splice(remaining.indexOf(nearest), 1);
      }
  
      return optimized;
    }
  
    private async scheduleStopsForDay(stops: any[], theme: DayTheme, userProfile: EnhancedUserProfile): Promise<any[]> {
      const scheduledStops = [];
      let currentTime = this.parseTime(theme.recommendedStartTime);
  
      // Tiempo adicional para llegar al municipio si no es Barranquilla
      if (theme.municipality !== 'Barranquilla') {
        currentTime += theme.estimatedTravelTime;
      }
  
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        
        // Tiempo en el destino basado en tipo y preferencias del usuario
        let visitDuration = this.calculateVisitDuration(stop, userProfile);
        
        // Tiempo de viaje al siguiente destino
        let travelTime = 0;
        if (i < stops.length - 1) {
          const nextStop = stops[i + 1];
          travelTime = await this.calculateTravelTime(stop, nextStop);
        }
  
        scheduledStops.push({
          ...stop,
          startTime: this.formatTime(currentTime),
          endTime: this.formatTime(currentTime + visitDuration),
          durationMinutes: visitDuration,
          travelTimeToNext: travelTime,
          distanceToNext: i < stops.length - 1 ? this.calculateDistance(
            { lat: stop.lat || stop.coordinates?.lat, lng: stop.lng || stop.coordinates?.lng },
            { lat: stops[i + 1].lat || stops[i + 1].coordinates?.lat, lng: stops[i + 1].lng || stops[i + 1].coordinates?.lng }
          ) : 0
        });
  
        currentTime += visitDuration + travelTime + 15; // 15 min buffer
      }
  
      return scheduledStops;
    }
  
    private calculateVisitDuration(destination: any, userProfile: EnhancedUserProfile): number {
      let baseDuration = 60; // minutos
  
      // Ajustar por tipo de destino
      const category = destination.category || destination.categories?.[0] || '';
      switch (category.toLowerCase()) {
        case 'museo':
        case 'cultura':
          baseDuration = userProfile.culturalDepth === 'immersive' ? 120 : 
                        userProfile.culturalDepth === 'deep' ? 90 : 60;
          break;
        case 'playa':
        case 'relax':
          baseDuration = userProfile.preferredPace === 'relaxed' ? 180 : 120;
          break;
        case 'gastronomia':
          baseDuration = 90;
          break;
        case 'aventura':
          baseDuration = userProfile.physicalActivity === 'high' ? 120 : 90;
          break;
        default:
          baseDuration = 75;
      }
  
      // Ajustar por score de interés
      if (destination.interestScore > 70) {
        baseDuration *= 1.3; // 30% más tiempo en lugares muy interesantes
      }
  
      return Math.round(baseDuration);
    }
  
    private async calculateTravelTime(from: any, to: any): Promise<number> {
      const distance = this.calculateDistance(
        { lat: from.lat || from.coordinates?.lat, lng: from.lng || from.coordinates?.lng },
        { lat: to.lat || to.coordinates?.lat, lng: to.lng || to.coordinates?.lng }
      );
  
      // Velocidad promedio urbana más realista: 15 km/h considerando tráfico y paradas
      const urbanSpeed = 15;
      const estimatedMinutes = Math.max(10, (distance / urbanSpeed) * 60);
      
      return Math.round(estimatedMinutes);
    }
  
    private calculateOverallSpecificity(itinerary: any[], userProfile: EnhancedUserProfile): number {
      const totalScore = itinerary.reduce((sum, stop) => sum + (stop.interestScore || 0), 0);
      return totalScore / itinerary.length;
    }
  
    private calculateGeographicalCoherence(itinerary: any[]): number {
      let coherenceScore = 100;
      const daysData = new Map<number, any[]>();
      
      // Agrupar por días
      itinerary.forEach(stop => {
        if (!daysData.has(stop.day)) daysData.set(stop.day, []);
        daysData.get(stop.day)!.push(stop);
      });
  
      // Evaluar coherencia por día
      for (const [day, stops] of daysData.entries()) {
        if (stops.length < 2) continue;
        
        let dayCoherence = 100;
        const maxAcceptableDistance = 5; // km
        
        for (let i = 0; i < stops.length - 1; i++) {
          const distance = this.calculateDistance(
            { lat: stops[i].lat, lng: stops[i].lng },
            { lat: stops[i + 1].lat, lng: stops[i + 1].lng }
          );
          
          if (distance > maxAcceptableDistance) {
            dayCoherence -= (distance - maxAcceptableDistance) * 5;
          }
        }
        
        coherenceScore = Math.min(coherenceScore, Math.max(0, dayCoherence));
      }
  
      return coherenceScore;
    }
  
    private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
      const R = 6371;
      const dLat = (point2.lat - point1.lat) * Math.PI / 180;
      const dLng = (point2.lng - point1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    private parseTime(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }
  
    private formatTime(minutes: number): string {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(Math.round(mins)).padStart(2, '0')}`;
    }
  }
  
  export default EnhancedItineraryOptimizer;