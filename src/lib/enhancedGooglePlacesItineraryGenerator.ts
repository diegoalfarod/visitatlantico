// src/lib/enhancedGooglePlacesItineraryGenerator.ts
// IMPLEMENTACIÓN COMPLETA Y FUNCIONAL

import GooglePlacesItineraryService from './googlePlacesItineraryService';
import GeminiItineraryEnhancer from './geminiItineraryEnhancer';

// ==================== INTERFACES ====================

interface EnhancedUserProfile {
  days: number;
  email: string;
  interests: string[];
  tripType: 'solo' | 'pareja' | 'familia' | 'amigos' | 'negocios';
  budget: 'economico' | 'moderado' | 'premium';
  locationRange: 'barranquilla' | 'todo_atlantico';
  startLocation?: { lat: number; lng: number } | string;
  preferredPace: 'relaxed' | 'moderate' | 'intensive';
  maxTravelDistance: number;
  culturalDepth: 'surface' | 'deep' | 'immersive';
  foodAdventure: boolean;
  physicalActivity: 'low' | 'moderate' | 'high';
  crowdTolerance: 'avoid' | 'moderate' | 'doesnt_matter';
}

interface ItineraryStop {
  id: string;
  day: number;
  dayTitle: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: string;
  categories: string[];
  municipality: string;
  lat: number;
  lng: number;
  tip?: string;
  mustTry?: string[];
  estimatedCost: number;
  crowdLevel: string;
  imageUrl?: string;
  rating?: number;
  address?: string;
  distance: number;
  travelTime?: number;
  travelMode?: 'walking' | 'driving' | 'transit';
  travelCost?: number;
  smartScore?: number;
  type: 'destination' | 'restaurant' | 'break' | 'coffee';
  interestMatch?: string;
  matchConfidence?: number;
  energyLevel?: 'high' | 'medium' | 'low';
  timeOfDay?: 'early_morning' | 'morning' | 'lunch' | 'afternoon' | 'sunset' | 'dinner' | 'night';
}

interface DayTheme {
  day: number;
  title: string;
  municipality: string;
  focusCategories: string[];
  recommendedStartTime: string;
  transportTime: number;
  maxStops: number;
  minStops: number;
  paceDescription: string;
  culturalContext: string;
  allowedRadius: number;
}

interface GenerationResult {
  itinerary: ItineraryStop[];
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    qualityScore: number;
    coherenceScore: number;
    personalizationScore: number;
    budgetFitScore: number;
  };
  themes: DayTheme[];
  metadata: {
    generatedAt: string;
    totalDays: number;
    totalStops: number;
    totalDistance: number;
    totalCost: number;
    averageRating: number;
    dataSource: string;
    totalTravelTime: number;
    averageStopsPerDay: number;
  };
}

interface UserContext {
  timePreferences: {
    wakeUpTime: string;
    sleepTime: string;
    lunchTime: string;
    dinnerTime: string;
    peakEnergyTime: string;
    restNeeded: string;
  };
  physicalCapacity: {
    maxWalkingDistance: number;
    maxActivitiesPerDay: number;
    restFrequency: string;
  };
  foodPreferences: {
    cuisineTypes: string[];
    mealDuration: number;
    snackFrequency: string;
    adventurousness: string;
  };
}

// ==================== CLASE PRINCIPAL ====================

export class EnhancedGooglePlacesItineraryGenerator {
  private placesService: GooglePlacesItineraryService;
  private usedDestinationIds: Set<string> = new Set();
  private userContext: UserContext;
  
  // ==================== CONFIGURACIÓN ====================
  
  // Búsquedas dinámicas por interés y contexto
  private readonly DYNAMIC_SEARCH_PATTERNS = {
    'carnaval_cultura': {
      familia: [
        'museo interactivo niños Barranquilla',
        'taller cultural familiar Atlántico',
        'show folclórico para toda la familia'
      ],
      pareja: [
        'experiencia cultural romántica Barranquilla',
        'tour privado Casa del Carnaval',
        'clase de baile pareja cumbia'
      ],
      amigos: [
        'tour carnaval con rumba Barranquilla',
        'La Troja salsa y cultura',
        'festival callejero Atlántico'
      ],
      solo: [
        'museo del carnaval visita guiada',
        'taller artesanal individual',
        'exposición cultural Barranquilla'
      ],
      negocios: [
        'centro de eventos culturales Barranquilla',
        'museo ejecutivo Atlántico',
        'experiencia cultural corporativa'
      ]
    },
    'playas_rio': {
      familia: [
        'playa familiar con salvavidas Puerto Colombia',
        'club de playa para niños Pradomar',
        'malecón con parque infantil'
      ],
      pareja: [
        'playa romántica atardecer Puerto Colombia',
        'cena frente al mar Atlántico',
        'paseo romántico Bocas de Ceniza'
      ],
      amigos: [
        'playa deportes acuáticos Puerto Velero',
        'beach party Pradomar',
        'surf y volleyball playa'
      ],
      solo: [
        'playa tranquila para relajarse',
        'yoga frente al mar',
        'caminata meditativa malecón'
      ],
      negocios: [
        'club de playa ejecutivo',
        'restaurante playa para negocios',
        'marina para eventos corporativos'
      ]
    },
    'gastronomia_local': {
      familia: [
        'restaurante familiar típico Barranquilla',
        'buffet costeño para niños',
        'heladería artesanal local'
      ],
      pareja: [
        'cena romántica cocina de autor',
        'restaurante íntimo mariscos',
        'rooftop con vista Barranquilla'
      ],
      amigos: [
        'tour gastronómico callejero',
        'cervecería artesanal local',
        'parrillada para compartir'
      ],
      solo: [
        'clase de cocina costeña',
        'mercado local tour gastronómico',
        'café cultural Barranquilla'
      ],
      negocios: [
        'restaurante ejecutivo Barranquilla',
        'hotel restaurante para reuniones',
        'club privado con restaurante'
      ]
    }
  };
  
  // Restaurantes curados por zona, presupuesto y momento del día
  private readonly CURATED_RESTAURANTS = {
    'Barranquilla': {
      economico: {
        desayuno: ['Panadería La Victoria', 'Café de la Plaza', 'Desayunos Sorpresa'],
        almuerzo: ['El Boliche', 'Comedor Popular', 'Donde Chucho'],
        cena: ['Pizzería El Maíz', 'Asadero El Pollo', 'Mi Tierrita']
      },
      moderado: {
        desayuno: ['Juan Valdez Café', 'Crepes & Waffles', 'Masa Café'],
        almuerzo: ['La Cueva', 'Cocina 33', 'Mailia', 'El Celler'],
        cena: ['Nena Lela', 'Varadero', 'La Pescadería', 'Mila']
      },
      premium: {
        desayuno: ['Hotel El Prado Restaurant', 'Café San Alberto'],
        almuerzo: ['NarcoBollo', 'Carmen', 'Osaka Nikkei'],
        cena: ['Pepe Anca', 'La Patrona', 'Salvatore\'s']
      }
    },
    'Puerto Colombia': {
      economico: {
        almuerzo: ['Donde Chucho Puerto', 'Kiosco Playa'],
        cena: ['Pizzería Local', 'Asadero del Puerto']
      },
      moderado: {
        almuerzo: ['Restaurante 366', 'Pradomar Restaurant'],
        cena: ['La Marina', 'El Muelle']
      },
      premium: {
        almuerzo: ['Beach Club Restaurant'],
        cena: ['Fine Dining Puerto']
      }
    }
  };
  
  // Límites y configuración
  private readonly TRAVEL_LIMITS = {
    maxHopMinutes: 30,
    maxDailyTravelMinutes: 90,
    walkingRadiusKm: 1,
    comfortBufferMinutes: 15
  };
  
  constructor() {
    this.placesService = new GooglePlacesItineraryService();
    this.userContext = {
      timePreferences: {
        wakeUpTime: '08:00',
        sleepTime: '23:00',
        lunchTime: '12:30',
        dinnerTime: '19:30',
        peakEnergyTime: 'morning',
        restNeeded: 'moderate'
      },
      physicalCapacity: {
        maxWalkingDistance: 5,
        maxActivitiesPerDay: 4,
        restFrequency: 'every_2_hours'
      },
      foodPreferences: {
        cuisineTypes: ['local', 'típica'],
        mealDuration: 60,
        snackFrequency: 'occasional',
        adventurousness: 'moderate'
      }
    };
  }
  
  // ==================== MÉTODO PRINCIPAL ====================
  
  async generateOptimizedItinerary(profile: EnhancedUserProfile): Promise<GenerationResult> {
    console.log('🚀 Iniciando generación de itinerario personalizado avanzado');
    console.log('Perfil:', {
      days: profile.days,
      interests: profile.interests,
      budget: profile.budget,
      pace: profile.preferredPace,
      tripType: profile.tripType
    });

    this.usedDestinationIds.clear();
    
    // Actualizar contexto de usuario
    this.updateUserContext(profile);

    try {
      // PASO 1: Búsqueda inteligente y personalizada
      console.log('PASO 1: Búsqueda inteligente de lugares...');
      const allPlaces = await this.searchPersonalizedPlaces(profile);
      console.log(`Encontrados ${allPlaces.length} lugares personalizados`);

      // Validar lugares suficientes
      if (allPlaces.length < profile.days * 3) {
        console.warn('Pocos lugares encontrados, agregando alternativas...');
        const alternatives = await this.getSmartAlternatives(profile, allPlaces);
        allPlaces.push(...alternatives);
      }

      // PASO 2: Generación inteligente con IA (si está disponible)
      let intelligentItinerary;
      try {
        const geminiEnhancer = new GeminiItineraryEnhancer();
        console.log('PASO 2: Optimizando con IA...');
        intelligentItinerary = await geminiEnhancer.generateIntelligentItinerary(
          profile,
          allPlaces
        );
      } catch (aiError) {
        console.log('IA no disponible, usando generación algorítmica avanzada');
        intelligentItinerary = await this.generateAlgorithmicItinerary(profile, allPlaces);
      }

      // PASO 3: Convertir y estructurar
      const structuredItinerary = this.structureItinerary(
        intelligentItinerary,
        profile,
        allPlaces
      );

      // PASO 4: Optimizar rutas y tiempos
      console.log('PASO 3: Optimizando rutas y tiempos...');
      const optimizedItinerary = await this.optimizeCompleteItinerary(
        structuredItinerary,
        profile
      );

      // PASO 5: Validación y ajustes finales
      const validation = this.validateItinerary(optimizedItinerary, profile);
      
      // Si la personalización es baja, mejorar
      if (validation.personalizationScore < 70) {
        console.log('Mejorando personalización...');
        const improved = await this.enhancePersonalization(
          optimizedItinerary,
          profile,
          allPlaces
        );
        return this.generateResult(improved, profile);
      }

      return this.generateResult(optimizedItinerary, profile);

    } catch (error) {
      console.error('Error en generación:', error);
      // Fallback robusto
      return this.generateSafetyFallback(profile);
    }
  }
  
  // ==================== BÚSQUEDA PERSONALIZADA ====================
  
  private async searchPersonalizedPlaces(profile: EnhancedUserProfile): Promise<any[]> {
    const allPlaces: any[] = [];
    const searchedIds = new Set<string>();
    let searchCount = 0;
    const MAX_SEARCHES = 25;
    
    console.log(`🔍 Generando búsquedas personalizadas para ${profile.tripType}`);
    
    // 1. Búsquedas principales por interés con variación
    for (const interest of profile.interests) {
      if (searchCount >= MAX_SEARCHES) break;
      
      const searches = this.generateDynamicSearches(interest, profile);
      console.log(`📍 Búsquedas para ${interest}:`, searches.slice(0, 3));
      
      for (const searchQuery of searches.slice(0, 4)) {
        if (searchCount >= MAX_SEARCHES) break;
        searchCount++;
        
        try {
          const results = await this.placesService.executeTextSearch(
            searchQuery,
            this.getSearchCenter(profile, interest),
            this.getSearchRadius(profile)
          );
          
          for (const place of results) {
            if (!searchedIds.has(place.id) && this.isRelevantPlace(place, profile, interest)) {
              searchedIds.add(place.id);
              allPlaces.push({
                ...place,
                primaryInterest: interest,
                matchConfidence: this.calculateMatchScore(place, profile, interest),
                searchQuery: searchQuery
              });
            }
          }
        } catch (error) {
          console.warn(`Error en búsqueda: ${searchQuery}`, error);
        }
      }
    }
    
    // 2. Búsqueda de restaurantes con rotación
    console.log('🍴 Buscando restaurantes personalizados...');
    const restaurants = await this.searchRotatingRestaurants(profile, searchedIds);
    allPlaces.push(...restaurants);
    
    // 3. Lugares de descanso y conexión
    const restSpots = await this.searchRestAndTransitionSpots(profile, searchedIds);
    allPlaces.push(...restSpots);
    
    // 4. Experiencias únicas y hidden gems
    if (profile.preferredPace !== 'relaxed') {
      const uniqueSpots = await this.searchUniqueExperiences(profile, searchedIds);
      allPlaces.push(...uniqueSpots);
    }
    
    console.log(`✅ Total lugares encontrados: ${allPlaces.length}`);
    return this.rankPlacesByRelevance(allPlaces, profile);
  }
  
  private generateDynamicSearches(interest: string, profile: EnhancedUserProfile): string[] {
    const searches: string[] = [];
    const patterns = this.DYNAMIC_SEARCH_PATTERNS[interest]?.[profile.tripType] || [];
    
    // Agregar patrones específicos del perfil
    searches.push(...patterns);
    
    // Agregar búsquedas por presupuesto
    const budgetModifiers = {
      economico: ['gratis', 'económico', 'barato', 'popular'],
      moderado: ['recomendado', 'típico', 'tradicional'],
      premium: ['exclusivo', 'premium', 'VIP', 'lujo']
    };
    
    const budgetMod = budgetModifiers[profile.budget][0];
    searches.push(`${interest.replace('_', ' ')} ${budgetMod} Barranquilla`);
    
    // Agregar búsquedas por temporada
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) {
      searches.push(`${interest} temporada carnaval 2025`);
    } else if (month >= 6 && month <= 8) {
      searches.push(`${interest} vacaciones verano`);
    }
    
    // Agregar búsquedas por combinación de intereses
    if (profile.interests.length > 1) {
      const otherInterest = profile.interests.find(i => i !== interest);
      if (otherInterest) {
        searches.push(`${interest} y ${otherInterest} Atlántico`);
      }
    }
    
    // Aleatorizar para variedad
    return this.shuffleArray(searches);
  }
  
  private async searchRotatingRestaurants(
    profile: EnhancedUserProfile,
    excludeIds: Set<string>
  ): Promise<any[]> {
    const restaurants: any[] = [];
    const municipalities = this.getMunicipalitiesForDays(profile.days);
    
    for (let day = 1; day <= profile.days; day++) {
      const municipality = municipalities[day - 1] || 'Barranquilla';
      const dayRestaurants = this.CURATED_RESTAURANTS[municipality] || this.CURATED_RESTAURANTS['Barranquilla'];
      
      // Buscar para cada comida del día
      for (const mealType of ['almuerzo', 'cena']) {
        if (mealType === 'cena' && profile.tripType === 'familia' && day > 1) continue;
        
        const options = dayRestaurants[profile.budget][mealType === 'almuerzo' ? 'almuerzo' : 'cena'] || [];
        
        // Rotar opciones por día para variedad
        const rotatedOptions = this.rotateArrayByDay(options, day);
        
        for (const restaurantName of rotatedOptions.slice(0, 2)) {
          try {
            const results = await this.placesService.searchSpecificPlace(
              restaurantName,
              municipality,
              ['restaurant', 'food']
            );
            
            const bestMatch = results.find(r => !excludeIds.has(r.id));
            if (bestMatch) {
              excludeIds.add(bestMatch.id);
              restaurants.push({
                ...bestMatch,
                mealType,
                dayNumber: day,
                matchConfidence: 0.9,
                recommendedTime: mealType === 'almuerzo' ? '12:30' : '19:30'
              });
              break;
            }
          } catch (error) {
            console.warn(`Error buscando restaurante: ${restaurantName}`);
          }
        }
      }
    }
    
    return restaurants;
  }
  
  // ==================== GENERACIÓN ALGORÍTMICA ====================
  
  private async generateAlgorithmicItinerary(
    profile: EnhancedUserProfile,
    places: any[]
  ): Promise<any> {
    const dias = [];
    const usedPlaceIds = new Set<string>();
    const municipalities = this.getMunicipalitiesForDays(profile.days);
    
    for (let day = 1; day <= profile.days; day++) {
      const municipality = municipalities[day - 1];
      const dayPlaces = this.selectDayPlaces(
        places,
        profile,
        day,
        municipality,
        usedPlaceIds
      );
      
      const dayItinerary = await this.buildDayItinerary(
        day,
        dayPlaces,
        profile,
        municipality
      );
      
      dias.push(dayItinerary);
      
      // Marcar lugares como usados
      dayItinerary.paradas.forEach((p: any) => usedPlaceIds.add(p.placeId));
    }
    
    return { dias };
  }
  
  private async buildDayItinerary(
    dayNumber: number,
    places: any[],
    profile: EnhancedUserProfile,
    municipality: string
  ): Promise<any> {
    const paradas = [];
    let currentTime = this.getStartTime(profile);
    let currentLocation = this.getStartLocation(profile);
    let touristEnergy = 100;
    
    // MAÑANA
    const morningPlaces = places.filter(p => 
      !p.mealType && (p.timePreference === 'morning' || p.timePreference === 'any')
    ).slice(0, 2);
    
    for (const place of morningPlaces) {
      if (touristEnergy < 30) break;
      
      const duration = this.calculateDuration(place, profile, touristEnergy);
      const travelTime = await this.estimateTravelTime(currentLocation, place);
      
      paradas.push({
        placeId: place.id,
        nombre: place.name,
        horaInicio: this.minutesToTime(currentTime + travelTime),
        horaFin: this.minutesToTime(currentTime + travelTime + duration),
        duracionMinutos: duration,
        descripcionPersonalizada: this.generateDescription(place, profile, 'morning'),
        tipLocal: this.generateTip(place, profile),
        categoria: place.categories?.[0] || 'destination',
        costoEstimado: place.estimatedCost || 0,
        tiempoTraslado: travelTime,
        energiaRequerida: this.calculateEnergyRequired(place, duration)
      });
      
      currentTime += travelTime + duration;
      currentLocation = { lat: place.lat, lng: place.lng };
      touristEnergy -= this.calculateEnergyRequired(place, duration);
    }
    
    // ALMUERZO
    const lunchTime = Math.max(currentTime, this.timeToMinutes('12:00'));
    const lunchPlace = places.find(p => p.mealType === 'almuerzo');
    
    if (lunchPlace) {
      const travelTime = await this.estimateTravelTime(currentLocation, lunchPlace);
      
      paradas.push({
        placeId: lunchPlace.id,
        nombre: lunchPlace.name,
        horaInicio: this.minutesToTime(lunchTime + travelTime),
        horaFin: this.minutesToTime(lunchTime + travelTime + 90),
        duracionMinutos: 90,
        descripcionPersonalizada: 'Disfruta de un delicioso almuerzo con lo mejor de la gastronomía local',
        tipLocal: 'Prueba el plato del día para una experiencia auténtica',
        categoria: 'restaurant',
        costoEstimado: this.estimateMealCost(profile.budget),
        tiempoTraslado: travelTime
      });
      
      currentTime = lunchTime + travelTime + 90;
      currentLocation = { lat: lunchPlace.lat, lng: lunchPlace.lng };
      touristEnergy = Math.min(100, touristEnergy + 30); // Recupera energía
    }
    
    // TARDE
    const afternoonPlaces = places.filter(p => 
      !p.mealType && 
      !morningPlaces.includes(p) &&
      (p.timePreference === 'afternoon' || p.timePreference === 'any')
    ).slice(0, 2);
    
    for (const place of afternoonPlaces) {
      if (currentTime > this.timeToMinutes('17:30')) break;
      if (touristEnergy < 20) break;
      
      const duration = this.calculateDuration(place, profile, touristEnergy);
      const travelTime = await this.estimateTravelTime(currentLocation, place);
      
      paradas.push({
        placeId: place.id,
        nombre: place.name,
        horaInicio: this.minutesToTime(currentTime + travelTime),
        horaFin: this.minutesToTime(currentTime + travelTime + duration),
        duracionMinutos: duration,
        descripcionPersonalizada: this.generateDescription(place, profile, 'afternoon'),
        tipLocal: this.generateTip(place, profile),
        categoria: place.categories?.[0] || 'destination',
        costoEstimado: place.estimatedCost || 0,
        tiempoTraslado: travelTime,
        energiaRequerida: this.calculateEnergyRequired(place, duration)
      });
      
      currentTime += travelTime + duration;
      currentLocation = { lat: place.lat, lng: place.lng };
      touristEnergy -= this.calculateEnergyRequired(place, duration);
    }
    
    // CENA (opcional)
    if (profile.tripType !== 'familia' || dayNumber === 1) {
      const dinnerTime = Math.max(currentTime + 30, this.timeToMinutes('19:00'));
      const dinnerPlace = places.find(p => p.mealType === 'cena');
      
      if (dinnerPlace) {
        const travelTime = await this.estimateTravelTime(currentLocation, dinnerPlace);
        
        paradas.push({
          placeId: dinnerPlace.id,
          nombre: dinnerPlace.name,
          horaInicio: this.minutesToTime(dinnerTime + travelTime),
          horaFin: this.minutesToTime(dinnerTime + travelTime + 90),
          duracionMinutos: 90,
          descripcionPersonalizada: 'Cena en un ambiente acogedor',
          tipLocal: 'Reserva con anticipación los fines de semana',
          categoria: 'restaurant',
          costoEstimado: this.estimateMealCost(profile.budget),
          tiempoTraslado: travelTime
        });
      }
    }
    
    return {
      dia: dayNumber,
      titulo: this.generateDayTitle(dayNumber, municipality, profile),
      temaDelDia: profile.interests[0],
      municipio: municipality,
      paradas
    };
  }
  
  // ==================== OPTIMIZACIÓN ====================
  
  private async optimizeCompleteItinerary(
    itinerary: ItineraryStop[],
    profile: EnhancedUserProfile
  ): Promise<ItineraryStop[]> {
    const optimized: ItineraryStop[] = [];
    
    for (let day = 1; day <= profile.days; day++) {
      const dayStops = itinerary.filter(s => s.day === day);
      if (dayStops.length === 0) continue;
      
      // Optimizar orden de visitas
      const orderedStops = await this.optimizeDayRoute(dayStops, profile);
      
      // Recalcular tiempos con traslados reales
      let currentTime = this.getStartTime(profile);
      let previousLocation = this.getStartLocation(profile);
      
      for (let i = 0; i < orderedStops.length; i++) {
        const stop = orderedStops[i];
        
        // Calcular traslado
        const travelInfo = await this.calculateDetailedTravel(
          previousLocation,
          { lat: stop.lat, lng: stop.lng },
          profile
        );
        
        // Actualizar tiempos
        currentTime += travelInfo.duration;
        stop.startTime = this.minutesToTime(currentTime);
        stop.endTime = this.minutesToTime(currentTime + stop.durationMinutes);
        stop.travelTime = travelInfo.duration;
        stop.travelMode = travelInfo.mode;
        stop.travelCost = travelInfo.cost;
        stop.distance = travelInfo.distance;
        
        // Agregar información de contexto
        stop.timeOfDay = this.getTimeOfDay(stop.startTime);
        stop.energyLevel = this.getEnergyLevel(i, orderedStops.length);
        stop.crowdLevel = this.estimateCrowdLevel(stop.startTime, stop.category);
        
        currentTime += stop.durationMinutes;
        previousLocation = { lat: stop.lat, lng: stop.lng };
        
        optimized.push(stop);
      }
    }
    
    return optimized;
  }
  
  private async optimizeDayRoute(
    stops: ItineraryStop[],
    profile: EnhancedUserProfile
  ): Promise<ItineraryStop[]> {
    // Separar por tipo
    const meals = stops.filter(s => s.type === 'restaurant');
    const activities = stops.filter(s => s.type !== 'restaurant');
    
    // Ordenar actividades por cercanía
    const orderedActivities = await this.orderByProximity(activities);
    
    // Insertar comidas en momentos apropiados
    const finalOrder: ItineraryStop[] = [];
    const lunch = meals.find(m => m.startTime?.includes('12') || m.startTime?.includes('13'));
    const dinner = meals.find(m => m.startTime?.includes('19') || m.startTime?.includes('20'));
    
    // Actividades de la mañana
    const morningActivities = orderedActivities.filter((_, i) => i < 2);
    finalOrder.push(...morningActivities);
    
    // Almuerzo
    if (lunch) finalOrder.push(lunch);
    
    // Actividades de la tarde
    const afternoonActivities = orderedActivities.filter((_, i) => i >= 2);
    finalOrder.push(...afternoonActivities);
    
    // Cena
    if (dinner) finalOrder.push(dinner);
    
    return finalOrder;
  }
  
  private async calculateDetailedTravel(
    from: any,
    to: any,
    profile: EnhancedUserProfile
  ): Promise<{ duration: number; distance: number; mode: 'walking' | 'driving' | 'transit'; cost: number }> {
    const distance = this.calculateDistance(from, to);
    
    // Determinar modo de transporte
    let mode: 'walking' | 'driving' | 'transit';
    let duration: number;
    let cost = 0;
    
    if (distance < 0.8) {
      mode = 'walking';
      duration = Math.ceil(distance * 15); // 15 min/km caminando
    } else if (distance < 2 && profile.physicalActivity !== 'low') {
      mode = 'walking';
      duration = Math.ceil(distance * 15);
    } else if (profile.budget === 'economico' && distance < 10) {
      mode = 'transit';
      duration = Math.ceil(distance * 5 + 10); // Tiempo de espera + viaje
      cost = 2700; // Tarifa de bus
    } else {
      mode = 'driving';
      duration = Math.ceil(distance * 3 + 5); // 3 min/km + estacionamiento
      cost = distance * 3000; // Aproximado taxi
    }
    
    return { duration, distance, mode, cost };
  }
  
  // ==================== ESTRUCTURA Y CONVERSIÓN ====================
  
  private structureItinerary(
    geminiItinerary: any,
    profile: EnhancedUserProfile,
    allPlaces: any[]
  ): ItineraryStop[] {
    const stops: ItineraryStop[] = [];
    const placesMap = new Map(allPlaces.map(p => [p.id, p]));
    
    // Si viene de Gemini
    if (geminiItinerary.dias) {
      for (const dia of geminiItinerary.dias) {
        for (const parada of dia.paradas) {
          const placeData = placesMap.get(parada.placeId) || 
                           allPlaces.find(p => p.name.toLowerCase().includes(parada.nombre.toLowerCase()));
          
          if (!placeData) continue;
          if (!this.isValidPlace(placeData, profile)) continue;
          
          stops.push(this.createItineraryStop(
            placeData,
            dia.dia,
            parada,
            profile
          ));
        }
      }
    } else {
      // Formato directo
      return geminiItinerary;
    }
    
    return stops;
  }
  
  private createItineraryStop(
    placeData: any,
    dayNumber: number,
    stopInfo: any,
    profile: EnhancedUserProfile
  ): ItineraryStop {
    return {
      id: placeData.id,
      day: dayNumber,
      dayTitle: this.generateDayTitle(dayNumber, placeData.municipality, profile),
      name: placeData.name,
      description: stopInfo.descripcionPersonalizada || placeData.description,
      startTime: stopInfo.horaInicio,
      endTime: stopInfo.horaFin,
      durationMinutes: stopInfo.duracionMinutos,
      category: placeData.categories?.[0] || 'destination',
      categories: placeData.categories || [],
      municipality: placeData.municipality || 'Barranquilla',
      lat: placeData.lat,
      lng: placeData.lng,
      tip: stopInfo.tipLocal || this.generateTip(placeData, profile),
      mustTry: stopInfo.queHacer || this.generateMustTry(placeData),
      estimatedCost: stopInfo.costoEstimado || placeData.estimatedCost || 0,
      crowdLevel: this.estimateCrowdLevel(stopInfo.horaInicio, placeData.categories?.[0]),
      imageUrl: placeData.photoUrl,
      rating: placeData.rating,
      address: placeData.address,
      distance: 0,
      travelTime: stopInfo.tiempoTraslado,
      smartScore: Math.round((placeData.matchConfidence || 0.5) * 100),
      type: this.determineStopType(placeData),
      matchConfidence: placeData.matchConfidence
    };
  }
  
  // ==================== MÉTODOS AUXILIARES ====================
  
  private updateUserContext(profile: EnhancedUserProfile): void {
    // Actualizar preferencias de tiempo
    if (profile.tripType === 'familia') {
      this.userContext.timePreferences.wakeUpTime = '09:00';
      this.userContext.timePreferences.sleepTime = '21:00';
      this.userContext.timePreferences.lunchTime = '12:00';
      this.userContext.timePreferences.dinnerTime = '18:30';
    } else if (profile.tripType === 'amigos') {
      this.userContext.timePreferences.wakeUpTime = '09:30';
      this.userContext.timePreferences.sleepTime = '02:00';
      this.userContext.timePreferences.dinnerTime = '20:30';
    }
    
    // Actualizar capacidad física
    if (profile.physicalActivity === 'low') {
      this.userContext.physicalCapacity.maxWalkingDistance = 2;
      this.userContext.physicalCapacity.maxActivitiesPerDay = 3;
    } else if (profile.physicalActivity === 'high') {
      this.userContext.physicalCapacity.maxWalkingDistance = 10;
      this.userContext.physicalCapacity.maxActivitiesPerDay = 6;
    }
    
    // Actualizar preferencias gastronómicas
    if (profile.interests.includes('gastronomia_local')) {
      this.userContext.foodPreferences.cuisineTypes = ['costeña', 'mariscos', 'típica'];
      this.userContext.foodPreferences.adventurousness = 'high';
    }
  }
  
  private getSearchCenter(profile: EnhancedUserProfile, interest: string): { lat: number; lng: number } {
    const centers = {
      'playas_rio': { lat: 11.0000, lng: -74.9547 }, // Puerto Colombia
      'vida_nocturna': { lat: 10.9878, lng: -74.7889 }, // Barranquilla centro
      'default': { lat: 10.9878, lng: -74.7889 }
    };
    
    return centers[interest] || centers.default;
  }
  
  private getSearchRadius(profile: EnhancedUserProfile): number {
    if (profile.locationRange === 'barranquilla') return 10000;
    if (profile.preferredPace === 'relaxed') return 8000;
    if (profile.preferredPace === 'intensive') return 20000;
    return 15000;
  }
  
  private isRelevantPlace(place: any, profile: EnhancedUserProfile, interest: string): boolean {
    // Filtros básicos
    const name = place.name.toLowerCase();
    const forbidden = ['country club', 'strip', 'motel', 'privado'];
    if (forbidden.some(word => name.includes(word))) return false;
    
    // Filtros por tipo de viaje
    if (profile.tripType === 'familia') {
      if (place.categories?.some((cat: string) => ['bar', 'night_club'].includes(cat))) return false;
    }
    
    return true;
  }
  
  private calculateMatchScore(place: any, profile: EnhancedUserProfile, interest: string): number {
    let score = 0.5;
    
    // Puntuación base por rating
    if (place.rating) score += (place.rating / 5) * 0.2;
    
    // Puntuación por precio apropiado
    const priceMatch = this.calculatePriceMatch(place.priceLevel, profile.budget);
    score += priceMatch * 0.2;
    
    // Puntuación por coincidencia con interés
    if (place.categories?.some((cat: string) => this.categoryMatchesInterest(cat, interest))) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }
  
  private categoryMatchesInterest(category: string, interest: string): boolean {
    const interestCategories: Record<string, string[]> = {
      'carnaval_cultura': ['museum', 'cultural_center', 'theater'],
      'playas_rio': ['beach', 'waterfront', 'natural_feature'],
      'gastronomia_local': ['restaurant', 'food', 'cafe'],
      'vida_nocturna': ['bar', 'night_club'],
      'arquitectura_historia': ['church', 'historic_site'],
      'naturaleza_aventura': ['park', 'nature_reserve']
    };
    
    return interestCategories[interest]?.includes(category) || false;
  }
  
  private calculatePriceMatch(priceLevel: number | undefined, budget: string): number {
    const targetLevel = { economico: 1, moderado: 2, premium: 4 }[budget] || 2;
    const actualLevel = priceLevel || 2;
    const diff = Math.abs(actualLevel - targetLevel);
    return Math.max(0, 1 - (diff * 0.3));
  }
  
  private getStartTime(profile: EnhancedUserProfile): number {
    const times = {
      familia: 9 * 60,
      negocios: 8 * 60,
      default: 8.5 * 60
    };
    return times[profile.tripType] || times.default;
  }
  
  private getStartLocation(profile: EnhancedUserProfile): { lat: number; lng: number } {
    if (profile.startLocation && typeof profile.startLocation === 'object') {
      return profile.startLocation;
    }
    return { lat: 10.9878, lng: -74.7889 }; // Barranquilla centro
  }
  
  private calculateDuration(place: any, profile: EnhancedUserProfile, energy: number): number {
    let baseDuration = 90; // 1.5 horas base
    
    // Ajustar por tipo de lugar
    if (place.categories?.includes('museum')) baseDuration = 120;
    if (place.categories?.includes('beach')) baseDuration = 180;
    if (place.categories?.includes('park')) baseDuration = 60;
    
    // Ajustar por energía
    if (energy < 30) baseDuration *= 0.7;
    
    // Ajustar por ritmo
    if (profile.preferredPace === 'relaxed') baseDuration *= 1.2;
    if (profile.preferredPace === 'intensive') baseDuration *= 0.8;
    
    return Math.round(baseDuration);
  }
  
  private async estimateTravelTime(from: any, to: any): Promise<number> {
    const distance = this.calculateDistance(from, to);
    if (distance < 1) return 10;
    if (distance < 3) return 20;
    if (distance < 5) return 30;
    return 45;
  }
  
  private calculateEnergyRequired(place: any, duration: number): number {
    let energy = duration / 10; // Base: 10% por hora
    
    if (place.categories?.includes('beach')) energy *= 1.5;
    if (place.categories?.includes('museum')) energy *= 0.7;
    if (place.categories?.includes('park')) energy *= 1.2;
    
    return Math.round(energy);
  }
  
  private estimateMealCost(budget: string): number {
    const costs = {
      economico: 15000,
      moderado: 35000,
      premium: 80000
    };
    return costs[budget] || 35000;
  }
  
  private generateDayTitle(day: number, municipality: string, profile: EnhancedUserProfile): string {
    const themes = {
      'Barranquilla': ['Descubre la Puerta de Oro', 'Cultura Caribeña', 'Sabores de Barranquilla'],
      'Puerto Colombia': ['Sol y Playa', 'Brisa Marina', 'Atardeceres Mágicos'],
      'default': [`Día ${day} de Aventura`]
    };
    
    const municipalityThemes = themes[municipality] || themes.default;
    return municipalityThemes[day % municipalityThemes.length];
  }
  
  private generateDescription(place: any, profile: EnhancedUserProfile, timeOfDay: string): string {
    const templates = {
      morning: `Comienza tu día explorando ${place.name}, perfecto para las mañanas.`,
      afternoon: `Continúa tu aventura en ${place.name}, ideal para la tarde.`,
      evening: `Disfruta el atardecer en ${place.name}.`
    };
    
    return templates[timeOfDay] || `Visita ${place.name}, una experiencia única en el Atlántico.`;
  }
  
  private generateTip(place: any, profile: EnhancedUserProfile): string {
    if (place.categories?.includes('beach')) {
      return 'Lleva protector solar y llega temprano para mejor ubicación';
    }
    if (place.categories?.includes('museum')) {
      return 'Verifica horarios, algunos cierran los lunes';
    }
    if (place.categories?.includes('restaurant')) {
      return 'Prueba las especialidades locales';
    }
    return 'Disfruta y toma muchas fotos';
  }
  
  private generateMustTry(place: any): string[] {
    if (place.categories?.includes('beach')) {
      return ['Nadar en el mar', 'Coctel de camarón', 'Foto al atardecer'];
    }
    if (place.categories?.includes('restaurant')) {
      return ['Plato del día', 'Jugo natural', 'Postre típico'];
    }
    return ['Explorar', 'Tomar fotos', 'Conversar con locales'];
  }
  
  private determineStopType(place: any): 'destination' | 'restaurant' | 'break' | 'coffee' {
    if (place.mealType || place.categories?.includes('restaurant')) return 'restaurant';
    if (place.categories?.includes('cafe')) return 'coffee';
    if (place.categories?.includes('park')) return 'break';
    return 'destination';
  }
  
  private getTimeOfDay(time: string): 'early_morning' | 'morning' | 'lunch' | 'afternoon' | 'sunset' | 'dinner' | 'night' {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 8) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 14) return 'lunch';
    if (hour < 18) return 'afternoon';
    if (hour < 19) return 'sunset';
    if (hour < 21) return 'dinner';
    return 'night';
  }
  
  private getEnergyLevel(index: number, total: number): 'high' | 'medium' | 'low' {
    const ratio = index / total;
    if (ratio < 0.3) return 'high';
    if (ratio < 0.7) return 'medium';
    return 'low';
  }
  
  private estimateCrowdLevel(time: string, category: string): string {
    const hour = parseInt(time.split(':')[0]);
    
    if (category === 'beach' && hour >= 10 && hour <= 15) return 'high';
    if (category === 'restaurant' && (hour === 12 || hour === 13 || hour === 19 || hour === 20)) return 'high';
    if (hour < 10) return 'low';
    if (hour > 21) return 'low';
    
    return 'medium';
  }
  
  // ==================== VALIDACIÓN Y RESULTADOS ====================
  
  private validateItinerary(itinerary: ItineraryStop[], profile: EnhancedUserProfile): any {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (itinerary.length === 0) {
      errors.push('El itinerario está vacío');
    }
    
    if (itinerary.length < profile.days * 2) {
      warnings.push('Pocas actividades para los días solicitados');
    }
    
    // Calcular scores
    const qualityScore = this.calculateQualityScore(itinerary);
    const coherenceScore = this.calculateCoherenceScore(itinerary);
    const personalizationScore = this.calculatePersonalizationScore(itinerary, profile);
    const budgetFitScore = this.calculateBudgetFitScore(itinerary, profile);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      coherenceScore,
      personalizationScore,
      budgetFitScore
    };
  }
  
  private calculateQualityScore(itinerary: ItineraryStop[]): number {
    if (itinerary.length === 0) return 0;
    
    const avgRating = itinerary
      .filter(s => s.rating)
      .reduce((sum, s, _, arr) => sum + (s.rating || 0) / arr.length, 0);
    
    const hasImages = itinerary.filter(s => s.imageUrl).length / itinerary.length;
    const hasTips = itinerary.filter(s => s.tip).length / itinerary.length;
    
    return Math.round((avgRating / 5) * 30 + hasImages * 20 + hasTips * 20 + 30);
  }
  
  private calculateCoherenceScore(itinerary: ItineraryStop[]): number {
    let score = 100;
    
    for (let day = 1; day <= Math.max(...itinerary.map(s => s.day)); day++) {
      const dayStops = itinerary.filter(s => s.day === day);
      const totalTravel = dayStops.reduce((sum, s) => sum + (s.travelTime || 0), 0);
      
      if (totalTravel > this.TRAVEL_LIMITS.maxDailyTravelMinutes) {
        score -= 15;
      }
    }
    
    return Math.max(0, Math.round(score));
  }
  
  private calculatePersonalizationScore(itinerary: ItineraryStop[], profile: EnhancedUserProfile): number {
    if (itinerary.length === 0) return 0;
    
    let matchedStops = 0;
    
    for (const stop of itinerary) {
      for (const interest of profile.interests) {
        if (this.validateDestinationMatch(stop, interest)) {
          matchedStops++;
          break;
        }
      }
    }
    
    return Math.round((matchedStops / itinerary.length) * 100);
  }
  
  private validateDestinationMatch(destination: any, interest: string): boolean {
    const name = destination.name?.toLowerCase() || '';
    const categories = destination.categories || [];
    
    const interestKeywords: Record<string, string[]> = {
      'carnaval_cultura': ['carnaval', 'museo', 'cultural', 'teatro', 'folclor'],
      'playas_rio': ['playa', 'beach', 'río', 'malecón', 'mar'],
      'gastronomia_local': ['restaurant', 'comida', 'cocina', 'típica'],
      'vida_nocturna': ['bar', 'música', 'rumba', 'salsa'],
      'arquitectura_historia': ['iglesia', 'histórico', 'patrimonio'],
      'naturaleza_aventura': ['parque', 'naturaleza', 'zoo']
    };
    
    const keywords = interestKeywords[interest] || [];
    return keywords.some(keyword => 
      name.includes(keyword) || categories.some(cat => cat.includes(keyword))
    );
  }
  
  private calculateBudgetFitScore(itinerary: ItineraryStop[], profile: EnhancedUserProfile): number {
    const totalCost = itinerary.reduce((sum, s) => sum + s.estimatedCost, 0);
    const budgetLimits = {
      'economico': 50000 * profile.days,
      'moderado': 150000 * profile.days,
      'premium': 500000 * profile.days
    };
    
    const limit = budgetLimits[profile.budget];
    const ratio = totalCost / limit;
    
    if (ratio <= 0.8) return 100;
    if (ratio <= 1.0) return 80;
    if (ratio <= 1.2) return 60;
    return 40;
  }
  
  private generateResult(itinerary: ItineraryStop[], profile: EnhancedUserProfile): GenerationResult {
    const validation = this.validateItinerary(itinerary, profile);
    const metadata = this.calculateMetadata(itinerary);
    const themes = this.generateThemes(itinerary, profile);
    
    return {
      itinerary,
      validation,
      themes,
      metadata
    };
  }
  
  private calculateMetadata(itinerary: ItineraryStop[]): any {
    const days = Math.max(...itinerary.map(s => s.day), 0);
    const totalCost = itinerary.reduce((sum, s) => sum + s.estimatedCost + (s.travelCost || 0), 0);
    const totalTravelTime = itinerary.reduce((sum, s) => sum + (s.travelTime || 0), 0);
    const totalDistance = itinerary.reduce((sum, s) => sum + (s.distance || 0), 0);
    const ratings = itinerary.filter(s => s.rating).map(s => s.rating || 0);
    
    return {
      generatedAt: new Date().toISOString(),
      totalDays: days,
      totalStops: itinerary.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalCost: Math.round(totalCost),
      totalTravelTime: Math.round(totalTravelTime),
      averageRating: ratings.length > 0 ? 
        Math.round(ratings.reduce((a, b) => a + b) / ratings.length * 10) / 10 : 0,
      averageStopsPerDay: days > 0 ? Math.round(itinerary.length / days * 10) / 10 : 0,
      dataSource: 'google_places_api_personalized'
    };
  }
  
  private generateThemes(itinerary: ItineraryStop[], profile: EnhancedUserProfile): DayTheme[] {
    const themes: DayTheme[] = [];
    const days = Math.max(...itinerary.map(s => s.day), 0);
    
    for (let day = 1; day <= days; day++) {
      const dayStops = itinerary.filter(s => s.day === day);
      if (dayStops.length === 0) continue;
      
      themes.push({
        day,
        title: dayStops[0].dayTitle || `Día ${day}`,
        municipality: dayStops[0].municipality,
        focusCategories: [...new Set(dayStops.flatMap(s => s.categories))],
        recommendedStartTime: dayStops[0].startTime,
        transportTime: dayStops.reduce((sum, s) => sum + (s.travelTime || 0), 0),
        maxStops: dayStops.length,
        minStops: Math.max(2, Math.floor(dayStops.length * 0.7)),
        paceDescription: this.getPaceDescription(profile.preferredPace),
        culturalContext: 'Descubriendo el Atlántico',
        allowedRadius: profile.maxTravelDistance * 1000
      });
    }
    
    return themes;
  }
  
  private getPaceDescription(pace: string): string {
    const descriptions = {
      relaxed: 'Ritmo relajado con tiempo para disfrutar',
      moderate: 'Ritmo balanceado entre actividades y descanso',
      intensive: 'Ritmo activo aprovechando al máximo el tiempo'
    };
    return descriptions[pace] || descriptions.moderate;
  }
  
  // ==================== MÉTODOS AUXILIARES ADICIONALES ====================
  
  private getMunicipalitiesForDays(days: number): string[] {
    const flows: Record<number, string[]> = {
      1: ['Barranquilla'],
      2: ['Barranquilla', 'Puerto Colombia'],
      3: ['Barranquilla', 'Puerto Colombia', 'Barranquilla'],
      4: ['Barranquilla', 'Puerto Colombia', 'Barranquilla', 'Puerto Colombia'],
      5: ['Barranquilla', 'Puerto Colombia', 'Tubará', 'Barranquilla', 'Puerto Colombia']
    };
    
    return flows[Math.min(days, 5)] || flows[3];
  }
  
  private calculateDistance(from: any, to: any): number {
    const R = 6371;
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLon = this.deg2rad(to.lng - from.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(from.lat)) * Math.cos(this.deg2rad(to.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  private timeToMinutes(time: string | number): number {
    if (typeof time === 'number') return time;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }
  
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  private rotateArrayByDay<T>(array: T[], day: number): T[] {
    const rotated = [...array];
    const rotations = day % array.length;
    for (let i = 0; i < rotations; i++) {
      rotated.push(rotated.shift()!);
    }
    return rotated;
  }
  
  // ==================== MÉTODOS ADICIONALES DE BÚSQUEDA ====================
  
  private async searchRestAndTransitionSpots(
    profile: EnhancedUserProfile,
    excludeIds: Set<string>
  ): Promise<any[]> {
    const spots: any[] = [];
    const searches = [
      'café con wifi Barranquilla',
      'heladería artesanal',
      'mirador turístico',
      'plaza con sombra'
    ];
    
    for (const search of searches.slice(0, 2)) {
      const results = await this.placesService.executeTextSearch(
        search,
        { lat: 10.9878, lng: -74.7889 },
        5000
      );
      
      const valid = results.filter(r => !excludeIds.has(r.id)).slice(0, 1);
      valid.forEach(v => {
        excludeIds.add(v.id);
        spots.push({ ...v, type: 'break', matchConfidence: 0.6 });
      });
    }
    
    return spots;
  }
  
  private async searchUniqueExperiences(
    profile: EnhancedUserProfile,
    excludeIds: Set<string>
  ): Promise<any[]> {
    const experiences: any[] = [];
    const searches = [
      `experiencia única ${profile.interests[0]} Barranquilla`,
      `hidden gem ${profile.tripType} Atlántico`,
      `nuevo 2025 ${profile.interests[0]}`
    ];
    
    for (const search of searches) {
      const results = await this.placesService.executeTextSearch(
        search,
        { lat: 10.9878, lng: -74.7889 },
        15000
      );
      
      for (const result of results) {
        if (!excludeIds.has(result.id) && result.rating >= 4.0) {
          excludeIds.add(result.id);
          experiences.push({
            ...result,
            isUnique: true,
            matchConfidence: 0.7
          });
        }
      }
    }
    
    return experiences;
  }
  
  private selectDayPlaces(
    allPlaces: any[],
    profile: EnhancedUserProfile,
    dayNumber: number,
    municipality: string,
    usedIds: Set<string>
  ): any[] {
    const dayPlaces = allPlaces.filter(p => 
      !usedIds.has(p.id) &&
      (p.municipality === municipality || !p.municipality)
    );
    
    // Seleccionar mix de intereses
    const selected: any[] = [];
    
    // Priorizar por interés principal
    const primaryInterest = profile.interests[(dayNumber - 1) % profile.interests.length];
    const primaryPlaces = dayPlaces.filter(p => p.primaryInterest === primaryInterest);
    selected.push(...primaryPlaces.slice(0, 3));
    
    // Agregar restaurantes
    const restaurants = dayPlaces.filter(p => p.mealType);
    selected.push(...restaurants);
    
    // Agregar lugares de descanso
    const restSpots = dayPlaces.filter(p => p.type === 'break');
    selected.push(...restSpots.slice(0, 1));
    
    return selected;
  }
  
  private rankPlacesByRelevance(places: any[], profile: EnhancedUserProfile): any[] {
    return places.sort((a, b) => {
      // Priorizar por confianza de match
      const confidenceDiff = (b.matchConfidence || 0) - (a.matchConfidence || 0);
      if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;
      
      // Luego por rating
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
      
      // Finalmente por popularidad
      return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
    });
  }
  
  private async orderByProximity(places: any[]): Promise<any[]> {
    if (places.length <= 1) return places;
    
    const ordered: any[] = [places[0]];
    const remaining = places.slice(1);
    
    while (remaining.length > 0) {
      const last = ordered[ordered.length - 1];
      let nearestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < remaining.length; i++) {
        const distance = this.calculateDistance(
          { lat: last.lat, lng: last.lng },
          { lat: remaining[i].lat, lng: remaining[i].lng }
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      ordered.push(remaining.splice(nearestIndex, 1)[0]);
    }
    
    return ordered;
  }
  
  private isValidPlace(place: any, profile: EnhancedUserProfile): boolean {
    const name = place.name?.toLowerCase() || '';
    const forbidden = ['country club', 'strip', 'motel', 'privado'];
    
    if (forbidden.some(word => name.includes(word))) return false;
    
    if (profile.tripType === 'familia') {
      if (place.categories?.some((cat: string) => ['bar', 'night_club'].includes(cat))) {
        return false;
      }
    }
    
    return true;
  }
  
  private async enhancePersonalization(
    itinerary: ItineraryStop[],
    profile: EnhancedUserProfile,
    allPlaces: any[]
  ): Promise<ItineraryStop[]> {
    const enhanced = [...itinerary];
    
    // Identificar stops con baja personalización
    const weakStops = enhanced.filter(s => (s.matchConfidence || 0) < 0.6);
    
    for (const weak of weakStops) {
      // Buscar mejor alternativa
      const alternatives = allPlaces.filter(p => 
        profile.interests.some(i => p.primaryInterest === i) &&
        !enhanced.some(s => s.id === p.id) &&
        this.calculateDistance(
          { lat: p.lat, lng: p.lng },
          { lat: weak.lat, lng: weak.lng }
        ) < 5
      );
      
      if (alternatives.length > 0) {
        const best = alternatives.sort((a, b) => 
          (b.matchConfidence || 0) - (a.matchConfidence || 0)
        )[0];
        
        const index = enhanced.findIndex(s => s.id === weak.id);
        if (index !== -1) {
          enhanced[index] = {
            ...enhanced[index],
            ...this.createItineraryStop(best, enhanced[index].day, {
              horaInicio: enhanced[index].startTime,
              horaFin: enhanced[index].endTime,
              duracionMinutos: enhanced[index].durationMinutes
            }, profile)
          };
        }
      }
    }
    
    return enhanced;
  }
  
  private async getSmartAlternatives(
    profile: EnhancedUserProfile,
    existingPlaces: any[]
  ): Promise<any[]> {
    const alternatives: any[] = [];
    const existingIds = new Set(existingPlaces.map(p => p.id));
    
    const fallbackSearches = [
      'Museo del Caribe',
      'Gran Malecón del Río',
      'Parque Venezuela',
      'Plaza de la Paz',
      'Catedral Metropolitana'
    ];
    
    for (const search of fallbackSearches) {
      if (alternatives.length >= 10) break;
      
      const results = await this.placesService.searchSpecificPlace(
        search,
        'Barranquilla',
        ['tourist_attraction', 'museum', 'park']
      );
      
      for (const result of results) {
        if (!existingIds.has(result.id)) {
          existingIds.add(result.id);
          alternatives.push({
            ...result,
            primaryInterest: 'general',
            matchConfidence: 0.5
          });
        }
      }
    }
    
    return alternatives;
  }
  
  private generateSafetyFallback(profile: EnhancedUserProfile): GenerationResult {
    return {
      itinerary: [],
      validation: {
        isValid: false,
        errors: ['Error al generar el itinerario'],
        warnings: [],
        qualityScore: 0,
        coherenceScore: 0,
        personalizationScore: 0,
        budgetFitScore: 0
      },
      themes: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        totalDays: 0,
        totalStops: 0,
        totalDistance: 0,
        totalCost: 0,
        averageRating: 0,
        dataSource: 'error',
        totalTravelTime: 0,
        averageStopsPerDay: 0
      }
    };
  }
}

export default EnhancedGooglePlacesItineraryGenerator;