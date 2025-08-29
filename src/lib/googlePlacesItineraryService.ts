// src/lib/googlePlacesItineraryService.ts

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  business_status?: string;
}

interface EnhancedDestination {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  categories: string[];
  municipality: string;
  rating: number;
  userRatingsTotal: number;
  estimatedCost: number;
  typicalDuration: number;
  photoUrl?: string;
  address?: string;
  openingHours?: any;
  priceLevel?: number;
  distanceFromCenter?: number;
  crowdLevel: 'low' | 'medium' | 'high';
  bestTimeToVisit?: string[];
  isOpenNow?: boolean;
  timeSlotScore?: number;
  contextScore?: number;
  familyFriendly?: boolean;
}

interface TimeSlotRule {
  slots: Array<{
    start: string;
    end: string;
    minDuration: number;
    avoidDays?: string[];
  }>;
  priority: number;
}

export class GooglePlacesItineraryService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private distanceMatrixUrl = 'https://maps.googleapis.com/maps/api/distancematrix';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 1800000; // 30 minutos
  private isDemoMode = false;

  // Lista EXPANDIDA de tipos NO turísticos
  private readonly BLACKLISTED_TYPES = [
    // Clubes privados y entretenimiento adulto
    'private_club', 'social_club', 'country_club', 'members_club',
    'strip_club', 'adult_entertainment', 'nightclub_adult',
    // Comercio al por mayor y membresías
    'wholesale', 'warehouse_store', 'membership_store',
    // Residencial y oficinas
    'residential', 'apartment', 'condominium', 'housing',
    'office', 'corporate_office', 'coworking_space',
    // Supermercados y tiendas de cadena
    'supermarket', 'grocery_or_supermarket', 'convenience_store', 
    // Servicios médicos privados
    'hospital', 'clinic', 'doctor', 'dentist', 'medical_center',
    // Servicios financieros y legales
    'bank', 'atm', 'insurance_agency', 'lawyer', 'accounting',
    // Servicios automotrices
    'gas_station', 'car_repair', 'car_dealer', 'car_rental', 'car_wash',
    // Otros servicios no turísticos
    'pharmacy', 'drugstore', 'real_estate_agency', 'storage', 
    'moving_company', 'parking', 'post_office', 'courthouse',
    'veterinary_care', 'pet_store', 'hardware_store', 
    'home_goods_store', 'furniture_store', 'electronics_store',
    'plumber', 'electrician', 'roofing_contractor', 
    'general_contractor', 'school', 'university'
  ];

  // Lista de palabras prohibidas en nombres
  private readonly FORBIDDEN_NAME_WORDS = [
    'country club', 'club campestre', 'club social', 'club privado',
    'supermercado', 'supermarket', 'éxito', 'olímpica', 'ara', 'd1',
    'justo y bueno', 'carulla', 'makro', 'pricesmart', 'alkosto',
    'home center', 'homecenter', 'strip', 'adult', 'xxx', 'motel',
    'residencial', 'conjunto', 'edificio', 'torre', 'apartamento',
    'oficina', 'consultorio', 'clínica privada', 'eps', 'ips',
    'ferretería', 'papelería', 'miscelánea', 'cigarrería', 'droguería'
  ];

  // Tipos VÁLIDOS para turismo
  private readonly VALID_TOURIST_TYPES = [
    'tourist_attraction', 'museum', 'art_gallery', 'park', 'beach',
    'restaurant', 'cafe', 'bar', 'church', 'amusement_park',
    'aquarium', 'zoo', 'shopping_mall', 'spa', 'stadium',
    'movie_theater', 'casino', 'bowling_alley', 'point_of_interest',
    'natural_feature', 'campground', 'lodging', 'establishment',
    'night_club', 'cultural_center', 'historic_site', 'monument'
  ];

  // Restaurantes curados por presupuesto
  private readonly CURATED_RESTAURANTS: Record<string, string[]> = {
    'economico': [
      'Restaurante El Boliche',
      'Comedor Popular del Mercado',
      'Donde Chucho Puerto Colombia',
      'El Corral',
      'Crepes & Waffles',
      'Juan Valdez Café'
    ],
    'moderado': [
      'La Cueva Barranquilla',
      'Restaurante 366 Puerto Colombia',
      'El Celler Restaurant',
      'Nena Lela',
      'Cocina 33',
      'Mailia'
    ],
    'premium': [
      'Restaurante La Patrona',
      'NarcoBollo',
      'Varadero Pescados y Mariscos',
      'Restaurante Pepe Anca',
      'Carmen Restaurante',
      'Osaka Nikkei'
    ]
  };

  // Configuración de municipios
  private readonly MUNICIPALITY_CONFIG = {
    'Barranquilla': {
      center: { lat: 10.9878, lng: -74.7889 },
      radius: 15000,
      aliases: ['Barranquilla', 'Quilla'],
      strengths: ['cultura', 'historia', 'gastronomia', 'malecon', 'ritmos', 'vida-nocturna']
    },
    'Puerto Colombia': {
      center: { lat: 11.0000, lng: -74.9547 },
      radius: 10000,
      aliases: ['Puerto Colombia'],
      strengths: ['playa', 'relax', 'historia', 'gastronomia', 'deportes-acuaticos']
    },
    'Tubará': {
      center: { lat: 10.8833, lng: -75.0500 },
      radius: 12000,
      aliases: ['Tubará'],
      strengths: ['playa', 'deportes-acuaticos', 'aventura', 'naturaleza']
    },
    'Usiacurí': {
      center: { lat: 10.7492, lng: -74.9778 },
      radius: 8000,
      aliases: ['Usiacurí'],
      strengths: ['artesanias', 'cultura', 'relax', 'naturaleza']
    },
    'Soledad': {
      center: { lat: 10.9172, lng: -74.7647 },
      radius: 10000,
      aliases: ['Soledad'],
      strengths: ['gastronomia', 'comercio']
    },
    'Malambo': {
      center: { lat: 10.8594, lng: -74.7742 },
      radius: 8000,
      aliases: ['Malambo'],
      strengths: ['cultura', 'tradiciones']
    }
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ADVERTENCIA: Google Places API key no configurada - usando modo demo');
      this.isDemoMode = true;
    }
  }

  /**
   * Validar si un lugar es apropiado para turistas
   */
  private isValidTouristDestination(place: PlaceSearchResult): boolean {
    const name = place.name.toLowerCase();
    
    // Verificar palabras prohibidas en el nombre
    for (const forbidden of this.FORBIDDEN_NAME_WORDS) {
      if (name.includes(forbidden)) {
        console.log(`❌ Rechazado por nombre prohibido: ${place.name} (contiene: ${forbidden})`);
        return false;
      }
    }
    
    // Verificar tipos prohibidos
    if (place.types) {
      const hasBlacklistedType = place.types.some(type => 
        this.BLACKLISTED_TYPES.includes(type)
      );
      
      if (hasBlacklistedType) {
        // Verificar si también tiene un tipo válido (algunos lugares tienen múltiples tipos)
        const hasValidType = place.types.some(type => 
          this.VALID_TOURIST_TYPES.includes(type)
        );
        
        if (!hasValidType) {
          console.log(`❌ Rechazado por tipo prohibido: ${place.name} (tipos: ${place.types.join(', ')})`);
          return false;
        }
      }
    }
    
    // Palabras clave turísticas que garantizan inclusión
    const touristicKeywords = [
      'playa', 'beach', 'malecón', 'muelle', 'puerto',
      'museo', 'galería', 'teatro', 'cultural',
      'parque', 'jardín', 'plaza', 'mirador',
      'restaurante', 'café', 'bar',
      'artesanía', 'mercado', 'feria',
      'iglesia', 'catedral', 'templo',
      'monumento', 'histórico', 'patrimonio',
      'turismo', 'turístico', 'atracción'
    ];
    
    // Si tiene palabras turísticas en el nombre, probablemente es válido
    const hasTouristicName = touristicKeywords.some(keyword => 
      name.includes(keyword)
    );
    
    if (hasTouristicName) {
      return true;
    }
    
    // Debe tener al menos un tipo turístico válido
    if (place.types) {
      return place.types.some(type => 
        this.VALID_TOURIST_TYPES.includes(type)
      );
    }
    
    return false;
  }

  /**
   * Buscar un lugar específico por nombre
   */
  async searchSpecificPlace(
    placeName: string,
    municipality: string,
    requiredTypes?: string[]
  ): Promise<EnhancedDestination[]> {
    console.log(`[GooglePlaces] Buscando específicamente: "${placeName}"`);
    
    const munConfig = this.MUNICIPALITY_CONFIG[municipality as keyof typeof this.MUNICIPALITY_CONFIG];
    if (!munConfig) {
      const defaultConfig = this.MUNICIPALITY_CONFIG['Barranquilla'];
      if (defaultConfig) {
        return this.searchSpecificPlace(placeName, 'Barranquilla', requiredTypes);
      }
      return [];
    }
    
    try {
      const url = new URL(`${this.baseUrl}/findplacefromtext/json`);
      url.searchParams.append('input', placeName);
      url.searchParams.append('inputtype', 'textquery');
      url.searchParams.append('fields', 'place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,types,photos,opening_hours');
      url.searchParams.append('locationbias', `circle:${munConfig.radius}@${munConfig.center.lat},${munConfig.center.lng}`);
      url.searchParams.append('language', 'es');
      url.searchParams.append('key', this.apiKey);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
        const validCandidates = data.candidates.filter((place: any) => 
          this.isValidTouristDestination(place)
        );
        
        return validCandidates.map((place: any) => this.placeToDestination({
          ...place,
          place_id: place.place_id,
          geometry: place.geometry
        }));
      }
    } catch (error) {
      console.error(`Error buscando lugar específico ${placeName}:`, error);
    }
    
    return [];
  }

  /**
   * Buscar por categoría específica
   */
  async searchByCategory(
    category: string,
    municipality: string,
    budget: string
  ): Promise<EnhancedDestination[]> {
    const munConfig = this.MUNICIPALITY_CONFIG[municipality as keyof typeof this.MUNICIPALITY_CONFIG];
    if (!munConfig) {
      const defaultConfig = this.MUNICIPALITY_CONFIG['Barranquilla'];
      if (defaultConfig) {
        return this.searchByCategory(category, 'Barranquilla', budget);
      }
      return [];
    }
    
    const categoryToType: Record<string, string> = {
      'beach': 'natural_feature',
      'natural_feature': 'natural_feature',
      'point_of_interest': 'point_of_interest',
      'park': 'park',
      'spa': 'spa',
      'bar': 'bar',
      'night_club': 'night_club',
      'restaurant': 'restaurant',
      'museum': 'museum',
      'cultural_center': 'point_of_interest',
      'church': 'church',
      'theater': 'point_of_interest',
      'shopping': 'shopping_mall',
      'art_gallery': 'art_gallery',
      'tourist_attraction': 'tourist_attraction',
      'event_venue': 'point_of_interest',
      'water_sports': 'point_of_interest',
      'sports_complex': 'gym',
      'market': 'supermarket',
      'food_tour': 'food',
      'cafe': 'cafe',
      'craft_shop': 'store',
      'resort': 'lodging',
      'music_venue': 'bar',
      'food': 'restaurant'
    };
    
    const googleType = categoryToType[category] || category;
    
    try {
      const url = new URL(`${this.baseUrl}/nearbysearch/json`);
      url.searchParams.append('location', `${munConfig.center.lat},${munConfig.center.lng}`);
      url.searchParams.append('radius', munConfig.radius.toString());
      url.searchParams.append('type', googleType);
      url.searchParams.append('language', 'es');
      
      // Aplicar filtro de presupuesto
      if (budget === 'economico') {
        url.searchParams.append('maxprice', '2');
      } else if (budget === 'moderado') {
        url.searchParams.append('maxprice', '3');
      }
      
      url.searchParams.append('key', this.apiKey);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        // Filtrar lugares no turísticos
        const validResults = data.results.filter((place: PlaceSearchResult) => 
          this.isValidTouristDestination(place)
        );
        
        // Ordenar por rating y reviews
        const sorted = validResults
          .sort((a: any, b: any) => {
            const scoreA = (a.rating || 0) * Math.log10((a.user_ratings_total || 1) + 1);
            const scoreB = (b.rating || 0) * Math.log10((b.user_ratings_total || 1) + 1);
            return scoreB - scoreA;
          });
        
        return sorted.slice(0, 10).map((place: PlaceSearchResult) => 
          this.placeToDestination(place)
        );
      }
    } catch (error) {
      console.error(`Error buscando categoría ${category}:`, error);
    }
    
    return [];
  }

  /**
   * Buscar opciones de almuerzo mejoradas
   */
  async searchLunchOptions(
    municipality: string,
    budget: string,
    centerPoint: { lat: number; lng: number },
    uniqueId?: string
  ): Promise<EnhancedDestination[]> {
    console.log(`[GooglePlaces] Buscando restaurantes para almuerzo en ${municipality}, presupuesto: ${budget}`);
    
    const restaurants: EnhancedDestination[] = [];
    
    // Primero intentar con restaurantes curados
    const curatedList = this.CURATED_RESTAURANTS[budget as keyof typeof this.CURATED_RESTAURANTS] || [];
    
    for (const restaurantName of curatedList) {
      const results = await this.searchSpecificPlace(
        restaurantName,
        municipality,
        ['restaurant', 'food']
      );
      
      if (results.length > 0) {
        restaurants.push(results[0]);
        if (restaurants.length >= 3) break; // Máximo 3 opciones
      }
    }
    
    // Si no encontramos suficientes curados, buscar genéricos
    if (restaurants.length < 2) {
      const budgetTerms = {
        'economico': 'restaurante económico almuerzo ejecutivo',
        'moderado': 'restaurante colombiano',
        'premium': 'restaurante gourmet fine dining'
      };
      
      const query = `${budgetTerms[budget as keyof typeof budgetTerms]} ${municipality}`;
      const genericResults = await this.executeTextSearch(query, centerPoint, 3000, uniqueId);
      
      // Filtrar estrictamente
      const validRestaurants = genericResults.filter(r => {
        const name = r.name.toLowerCase();
        return (
          !this.FORBIDDEN_NAME_WORDS.some(word => name.includes(word)) &&
          r.categories.some(cat => ['restaurant', 'food', 'cafe'].includes(cat))
        );
      });
      
      restaurants.push(...validRestaurants.slice(0, 3 - restaurants.length));
    }
    
    console.log(`[GooglePlaces] Encontrados ${restaurants.length} restaurantes válidos`);
    return restaurants;
  }

  /**
   * Búsqueda principal mejorada con validación estricta
   */
  async searchDestinations(
    interests: string[],
    municipality: string,
    budget: string,
    dayNumber: number,
    maxResults: number = 5,
    uniqueId?: string,
    timeContext?: { hour: number; dayOfWeek: number }
  ): Promise<EnhancedDestination[]> {
    console.log(`[GooglePlaces] Buscando destinos para día ${dayNumber} en ${municipality}`);
    console.log(`[GooglePlaces] Intereses: ${interests.join(', ')}, Presupuesto: ${budget}`);

    if (this.isDemoMode) {
      return this.getDemoDestinations(municipality, interests);
    }

    const munConfig = this.MUNICIPALITY_CONFIG[municipality as keyof typeof this.MUNICIPALITY_CONFIG];
    if (!munConfig) {
      console.error(`Municipio no reconocido: ${municipality}`);
      return this.getFallbackDestinations(municipality);
    }

    // 1. Búsqueda específica por intereses
    let destinations = await this.searchByInterestsWithTimeLogic(
      interests, 
      munConfig, 
      budget, 
      maxResults * 2,
      uniqueId,
      timeContext
    );
    
    console.log(`Primera búsqueda: ${destinations.length} resultados`);
    
    // 2. Filtrar estrictamente lugares no turísticos
    destinations = destinations.filter(dest => {
      const name = dest.name.toLowerCase();
      
      // Rechazar cualquier lugar con palabras prohibidas
      const hasForbiddenWord = this.FORBIDDEN_NAME_WORDS.some(word => 
        name.includes(word)
      );
      
      if (hasForbiddenWord) {
        console.log(`❌ Filtrado en búsqueda principal: ${dest.name}`);
        return false;
      }
      
      return true;
    });
    
    // 3. Si necesitamos más resultados, buscar alternativas seguras
    if (destinations.length < maxResults) {
      const safeAlternatives = await this.searchSafeAlternatives(
        munConfig,
        budget,
        maxResults - destinations.length
      );
      destinations = this.mergeAndDeduplicate(destinations, safeAlternatives);
    }
    
    // 4. Enriquecer con scoring temporal
    destinations = this.enrichWithTimeScoring(destinations, interests, timeContext);
    
    // 5. Ordenar por relevancia
    const ranked = this.rankDestinationsFinal(destinations, interests, budget);
    
    console.log(`Resultados finales: ${ranked.length} destinos válidos`);
    return ranked.slice(0, maxResults);
  }

  /**
   * Buscar alternativas seguras cuando no hay suficientes resultados
   */
  private async searchSafeAlternatives(
    munConfig: any,
    budget: string,
    needed: number
  ): Promise<EnhancedDestination[]> {
    const safeSearches = [
      'museo',
      'playa pública',
      'parque público',
      'plaza principal',
      'iglesia histórica',
      'mercado artesanal',
      'mirador turístico'
    ];
    
    const alternatives: EnhancedDestination[] = [];
    
    for (const search of safeSearches) {
      if (alternatives.length >= needed) break;
      
      const results = await this.executeTextSearch(
        `${search} ${munConfig.aliases[0]}`,
        munConfig.center,
        munConfig.radius
      );
      
      const validResults = results.filter(r => 
        this.isValidTouristDestination(r as any)
      );
      
      alternatives.push(...validResults);
    }
    
    return alternatives.slice(0, needed);
  }

  /**
   * Ejecutar búsqueda de texto con validación
   */
  async executeTextSearch(
    query: string,
    location: { lat: number; lng: number },
    radius: number,
    uniqueId?: string
  ): Promise<EnhancedDestination[]> {
    const cacheKey = uniqueId 
      ? `text_${query}_${uniqueId}`
      : `text_${query}_${location.lat}_${location.lng}`;
    
    if (!uniqueId) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    try {
      const url = new URL(`${this.baseUrl}/textsearch/json`);
      url.searchParams.append('query', query);
      url.searchParams.append('location', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('language', 'es');
      url.searchParams.append('region', 'co');
      url.searchParams.append('key', this.apiKey);

      console.log(`[GooglePlaces] Text Search: "${query}"`);
      
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Error en Google Places API: ${data.status}`, data.error_message);
        return [];
      }

      // Filtrar estrictamente resultados no turísticos
      const validResults = (data.results || []).filter((place: PlaceSearchResult) => 
        this.isValidTouristDestination(place)
      );
      
      const destinations = validResults.map((place: PlaceSearchResult) => 
        this.placeToDestination(place)
      );

      if (destinations.length > 0 && !uniqueId) {
        this.setCache(cacheKey, destinations);
      }
      
      return destinations;

    } catch (error) {
      console.error('Error ejecutando búsqueda de texto:', error);
      return [];
    }
  }

  /**
   * Detectar municipio por coordenadas
   */
  detectMunicipalityByCoords(lat: number, lng: number): string {
    let closestMunicipality = 'Barranquilla';
    let minDistance = Infinity;

    for (const [mun, config] of Object.entries(this.MUNICIPALITY_CONFIG)) {
      const distance = this.calculateDistance(
        lat,
        lng,
        config.center.lat,
        config.center.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestMunicipality = mun;
      }
    }

    return closestMunicipality;
  }

  /**
   * Calcular matriz de distancias
   */
  async calculateDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'driving' | 'walking' = 'driving'
  ): Promise<Array<{ distance: number; duration: number }>> {
    if (this.isDemoMode) {
      return this.calculateSimpleDistances(origins, destinations);
    }

    const url = new URL(`${this.distanceMatrixUrl}/json`);
    
    const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
    const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    
    url.searchParams.append('origins', originsStr);
    url.searchParams.append('destinations', destinationsStr);
    url.searchParams.append('mode', mode);
    url.searchParams.append('units', 'metric');
    url.searchParams.append('language', 'es');
    url.searchParams.append('key', this.apiKey);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows) {
        const results: Array<{ distance: number; duration: number }> = [];
        
        for (const row of data.rows) {
          for (const element of row.elements) {
            if (element.status === 'OK') {
              results.push({
                distance: element.distance.value / 1000,
                duration: element.duration.value / 60
              });
            } else {
              results.push({ distance: 999, duration: 999 });
            }
          }
        }
        
        return results;
      }
    } catch (error) {
      console.error('Error calculating distance matrix:', error);
    }
    
    return this.calculateSimpleDistances(origins, destinations);
  }

  /**
   * Búsqueda por intereses con lógica temporal mejorada
   */
  private async searchByInterestsWithTimeLogic(
    interests: string[],
    munConfig: any,
    budget: string,
    maxResults: number,
    uniqueId?: string,
    timeContext?: { hour: number; dayOfWeek: number }
  ): Promise<EnhancedDestination[]> {
    const allResults: EnhancedDestination[] = [];
    const usedIds = new Set<string>();

    // Mapeo mejorado de búsquedas por interés
    const interestSearchMap: Record<string, string[]> = {
      'deportes-acuaticos': [
        'Pradomar playa',
        'Playa Salgar',
        'Puerto Velero',
        'playa pública'
      ],
      'relax': [
        'Gran Malecón del Río',
        'Parque Venezuela',
        'spa hotel',
        'jardín botánico'
      ],
      'cultura': [
        'Museo del Caribe',
        'Casa del Carnaval',
        'Teatro Amira de la Rosa',
        'centro cultural'
      ],
      'playa': [
        'playa pública',
        'Pradomar',
        'Puerto Colombia playa',
        'Salgar'
      ],
      'gastronomia': [
        'Mercado de Bazurto',
        'restaurante típico',
        'comida local'
      ],
      'artesanias': [
        'Usiacurí artesanías',
        'mercado artesanal',
        'centro artesanal'
      ],
      'ritmos': [
        'La Troja',
        'Frogg Leggs',
        'bar con música en vivo'
      ]
    };

    for (const interest of interests) {
      const searchQueries = interestSearchMap[interest] || [interest];
      
      for (const query of searchQueries.slice(0, 2)) {
        const fullQuery = `${query} ${munConfig.aliases[0]} Colombia`;
        const results = await this.executeTextSearch(
          fullQuery,
          munConfig.center,
          munConfig.radius,
          uniqueId
        );
        
        for (const place of results) {
          if (!usedIds.has(place.id) && this.isValidTouristDestination(place as any)) {
            usedIds.add(place.id);
            allResults.push(place);
          }
        }
        
        if (allResults.length >= maxResults) break;
      }
    }

    return allResults;
  }

  // Métodos auxiliares sin cambios...
  
  private placeToDestination(place: PlaceSearchResult): EnhancedDestination {
    const types = place.types || [];
    const primaryType = types[0] || 'point_of_interest';
    
    // Detectar si es family-friendly
    const familyFriendly = this.isFamilyFriendly(place);
    
    return {
      id: place.place_id,
      name: place.name,
      description: this.generateDescription(place),
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      categories: types,
      municipality: this.detectMunicipalityByCoords(
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      rating: place.rating || 4.0,
      userRatingsTotal: place.user_ratings_total || 0,
      estimatedCost: this.calculateEstimatedCost(place.price_level, primaryType),
      typicalDuration: this.getTypicalDuration(primaryType),
      photoUrl: place.photos?.[0] 
        ? this.buildPhotoUrl(place.photos[0].photo_reference)
        : undefined,
      address: place.formatted_address,
      openingHours: place.opening_hours,
      priceLevel: place.price_level,
      crowdLevel: this.calculateCrowdLevel(place.rating, place.user_ratings_total),
      isOpenNow: place.opening_hours?.open_now,
      familyFriendly
    };
  }

  private isFamilyFriendly(place: PlaceSearchResult): boolean {
    const name = place.name.toLowerCase();
    const familyKeywords = ['familia', 'niños', 'infantil', 'parque', 'playa', 'museo'];
    const notFamilyKeywords = ['bar', 'club', 'casino', 'motel'];
    
    if (notFamilyKeywords.some(word => name.includes(word))) {
      return false;
    }
    
    if (familyKeywords.some(word => name.includes(word))) {
      return true;
    }
    
    // Playas y parques generalmente son family-friendly
    if (place.types?.includes('beach') || place.types?.includes('park')) {
      return true;
    }
    
    return false;
  }

  private generateDescription(place: PlaceSearchResult): string {
    const type = place.types?.[0] || 'lugar';
    const typeTranslations: Record<string, string> = {
      'restaurant': 'restaurante',
      'museum': 'museo',
      'park': 'parque',
      'beach': 'playa',
      'shopping_mall': 'centro comercial',
      'bar': 'bar',
      'cafe': 'café',
      'tourist_attraction': 'atracción turística',
      'church': 'iglesia',
      'point_of_interest': 'punto de interés'
    };

    const typeInSpanish = typeTranslations[type] || type;
    const rating = place.rating ? `con calificación ${place.rating}/5` : '';
    const popularity = place.user_ratings_total && place.user_ratings_total > 100 
      ? 'muy popular' 
      : 'recomendado';

    return `${typeInSpanish.charAt(0).toUpperCase() + typeInSpanish.slice(1)} ${popularity} ${rating}. ${
      place.formatted_address ? `Ubicado en ${place.formatted_address.split(',')[0]}` : ''
    }`.trim();
  }

  private calculateEstimatedCost(priceLevel: number | undefined, type: string): number {
    const baseCosts: Record<string, number[]> = {
      'restaurant': [15000, 25000, 45000, 80000, 150000],
      'cafe': [5000, 10000, 15000, 25000, 40000],
      'bar': [10000, 20000, 35000, 60000, 100000],
      'museum': [0, 5000, 15000, 25000, 40000],
      'park': [0, 0, 5000, 10000, 20000],
      'beach': [0, 0, 10000, 20000, 40000],
      'shopping_mall': [0, 0, 0, 0, 0],
      'tourist_attraction': [0, 10000, 20000, 35000, 60000],
      'night_club': [20000, 35000, 50000, 80000, 150000]
    };

    const level = priceLevel ?? 2;
    const costs = baseCosts[type] || [0, 10000, 20000, 40000, 80000];
    
    return costs[Math.min(level, costs.length - 1)];
  }

  private getTypicalDuration(type: string): number {
    const durations: Record<string, number> = {
      'museum': 120,
      'restaurant': 90,
      'cafe': 45,
      'park': 90,
      'beach': 240,
      'shopping_mall': 120,
      'church': 30,
      'night_club': 180,
      'bar': 120,
      'tourist_attraction': 90,
      'amusement_park': 240,
      'zoo': 180,
      'aquarium': 150,
      'point_of_interest': 60
    };
    return durations[type] || 60;
  }

  private calculateCrowdLevel(
    rating?: number,
    userRatingsTotal?: number
  ): 'low' | 'medium' | 'high' {
    const total = userRatingsTotal || 0;
    if (total < 50) return 'low';
    if (total < 500) return 'medium';
    return 'high';
  }

  private buildPhotoUrl(photoReference: string): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private calculateSimpleDistances(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>
  ): Array<{ distance: number; duration: number }> {
    const results: Array<{ distance: number; duration: number }> = [];
    
    for (const origin of origins) {
      for (const dest of destinations) {
        const distance = this.calculateDistance(
          origin.lat,
          origin.lng,
          dest.lat,
          dest.lng
        );
        const duration = (distance / 30) * 60;
        results.push({ distance, duration });
      }
    }
    
    return results;
  }

  private mergeAndDeduplicate(
    primary: EnhancedDestination[],
    secondary: EnhancedDestination[]
  ): EnhancedDestination[] {
    const seen = new Set(primary.map(d => d.id));
    const merged = [...primary];
    
    for (const dest of secondary) {
      if (!seen.has(dest.id)) {
        merged.push(dest);
        seen.add(dest.id);
      }
    }
    
    return merged;
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`[Cache] Hit para: ${key}`);
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  private enrichWithTimeScoring(
    destinations: EnhancedDestination[],
    interests: string[],
    timeContext?: { hour: number; dayOfWeek: number }
  ): EnhancedDestination[] {
    return destinations.map(dest => ({
      ...dest,
      timeSlotScore: timeContext ? this.calculateTimeAppropriateness(dest, interests[0], timeContext) : 0.5,
      contextScore: this.calculateContextScore(dest, interests)
    }));
  }

  private calculateTimeAppropriateness(
    place: EnhancedDestination,
    interest: string,
    timeContext: { hour: number; dayOfWeek: number }
  ): number {
    const hour = timeContext.hour;
    
    // Playas mejor en la mañana
    if (place.categories.includes('beach') && hour >= 7 && hour <= 12) {
      return 1.0;
    }
    
    // Museos mejor en horario de apertura
    if (place.categories.includes('museum') && hour >= 9 && hour <= 17) {
      return 1.0;
    }
    
    // Bares mejor en la noche
    if (place.categories.includes('bar') && hour >= 20) {
      return 1.0;
    }
    
    return 0.5;
  }

  private calculateContextScore(dest: EnhancedDestination, interests: string[]): number {
    let score = 0;
    const searchText = `${dest.name} ${dest.description} ${dest.categories.join(' ')}`.toLowerCase();
    
    for (const interest of interests) {
      if (searchText.includes(interest.toLowerCase().replace('-', ' '))) {
        score += 0.5;
      }
    }
    
    return Math.min(score, 1);
  }

  private rankDestinationsFinal(
    destinations: EnhancedDestination[],
    interests: string[],
    budget: string
  ): EnhancedDestination[] {
    return destinations.sort((a, b) => {
      const scoreA = this.calculateTotalScore(a, budget);
      const scoreB = this.calculateTotalScore(b, budget);
      return scoreB - scoreA;
    });
  }

  private calculateTotalScore(
    dest: EnhancedDestination,
    budget: string
  ): number {
    let score = 0;
    
    // Calidad (rating y reviews)
    const qualityScore = (dest.rating / 5) * 0.7 + 
                        Math.min(dest.userRatingsTotal / 1000, 1) * 0.3;
    score += qualityScore * 0.3;
    
    // Contexto
    score += (dest.contextScore || 0.5) * 0.25;
    
    // Tiempo
    score += (dest.timeSlotScore || 0.5) * 0.15;
    
    // Presupuesto
    const budgetScore = this.calculateBudgetScore(dest.priceLevel, budget);
    score += budgetScore * 0.15;
    
    // Distancia
    const distanceScore = Math.max(0, 1 - (dest.distanceFromCenter || 0) / 20);
    score += distanceScore * 0.1;
    
    // Multitud
    const crowdScore = dest.crowdLevel === 'low' ? 1 : 
                       dest.crowdLevel === 'medium' ? 0.7 : 0.4;
    score += crowdScore * 0.05;
    
    return score;
  }

  private calculateBudgetScore(priceLevel: number | undefined, budget: string): number {
    if (priceLevel === undefined) return 0.7;
    
    const budgetMap: Record<string, number> = {
      'economico': 1,
      'moderado': 2,
      'premium': 4
    };
    
    const targetLevel = budgetMap[budget] || 2;
    const diff = Math.abs((priceLevel || 2) - targetLevel);
    
    return Math.max(0, 1 - (diff * 0.3));
  }

  // Destinos demo/fallback
  private getDemoDestinations(municipality: string, interests: string[]): EnhancedDestination[] {
    console.log(`[Demo Mode] Generando destinos de prueba seguros`);
    return [
      {
        id: 'demo_1',
        name: 'Gran Malecón del Río',
        description: 'Paseo icónico de 5km con restaurantes y vistas al río Magdalena',
        lat: 10.9878,
        lng: -74.7889,
        categories: ['tourist_attraction', 'park'],
        municipality: 'Barranquilla',
        rating: 4.6,
        userRatingsTotal: 2500,
        estimatedCost: 0,
        typicalDuration: 120,
        crowdLevel: 'medium',
        familyFriendly: true
      },
      {
        id: 'demo_2',
        name: 'Museo del Caribe',
        description: 'Centro cultural que celebra la identidad caribeña colombiana',
        lat: 10.9838,
        lng: -74.7881,
        categories: ['museum', 'tourist_attraction'],
        municipality: 'Barranquilla',
        rating: 4.7,
        userRatingsTotal: 1800,
        estimatedCost: 20000,
        typicalDuration: 120,
        crowdLevel: 'low',
        familyFriendly: true
      },
      {
        id: 'demo_3',
        name: 'Playa Pradomar',
        description: 'Playa familiar con servicios completos',
        lat: 10.9950,
        lng: -74.9600,
        categories: ['beach', 'natural_feature'],
        municipality: 'Puerto Colombia',
        rating: 4.4,
        userRatingsTotal: 1200,
        estimatedCost: 10000,
        typicalDuration: 240,
        crowdLevel: 'medium',
        familyFriendly: true
      }
    ];
  }

  private getFallbackDestinations(municipality: string): EnhancedDestination[] {
    return this.getDemoDestinations(municipality, []);
  }
}

export default GooglePlacesItineraryService;