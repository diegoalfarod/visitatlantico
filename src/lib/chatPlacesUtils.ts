// =============================================================================
// src/lib/chatPlacesUtils.ts
// 
// Utilidades para conectar el claudeService con los datos de atlantico-places
// Esto permite que Jimmy acceda a los mismos lugares que el PlannerPage
// =============================================================================

import { 
    CURATED_PLACES, 
    getPlaceById,
    getPlacesByInterest,
    getPlacesByCategory,
    getPlacesByTripType,
    getPlacesByPriceRange,
    getFeaturedPlaces,
    searchPlaces,
    type CuratedPlace,
    type PlaceCategory,
    type TripType,
    type PriceRange,
  } from "@/data/atlantico-places";
  
  // =============================================================================
  // TIPOS PARA EL CHAT
  // =============================================================================
  
  export interface ChatPlace {
    id: string;
    name: string;
    category: string;
    description: string;
    address: string;
    rating: number;
    reviewCount: number;
    photo: string;
    localTip: string;
    hours?: string;
    coordinates?: { lat: number; lng: number };
    // Campos adicionales de CuratedPlace que el chat puede usar
    municipality?: string;
    priceRange?: string;
    estimatedCost?: number;
    suitableFor?: string[];
  }
  
  export interface PlaceRecommendationContext {
    interests?: string[];
    tripType?: TripType;
    budget?: PriceRange;
    municipality?: string;
    category?: PlaceCategory;
    keywords?: string[];
    limit?: number;
  }
  
  // =============================================================================
  // CONVERSIÓN DE TIPOS
  // =============================================================================
  
  /**
   * Convierte un CuratedPlace al formato que usa el ChatWindow
   */
  export function curatedPlaceToChat(place: CuratedPlace): ChatPlace {
    return {
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.shortDescription,
      address: place.address,
      rating: place.rating,
      reviewCount: place.reviewCount,
      photo: place.primaryImage,
      localTip: place.localTip,
      hours: place.schedule 
        ? `${place.schedule.opens} - ${place.schedule.closes}` 
        : undefined,
      coordinates: place.coordinates,
      municipality: place.municipality,
      priceRange: place.priceRange,
      estimatedCost: place.estimatedCost,
      suitableFor: place.suitableFor,
    };
  }
  
  /**
   * Convierte múltiples CuratedPlaces
   */
  export function curatedPlacesToChat(places: CuratedPlace[]): ChatPlace[] {
    return places.map(curatedPlaceToChat);
  }
  
  // =============================================================================
  // BÚSQUEDA Y RECOMENDACIONES
  // =============================================================================
  
  /**
   * Obtiene lugares recomendados basado en el contexto de la conversación
   */
  export function getRecommendedPlaces(context: PlaceRecommendationContext): CuratedPlace[] {
    let places = [...CURATED_PLACES];
    
    // Filtrar por intereses
    if (context.interests && context.interests.length > 0) {
      places = places.filter(p => 
        p.interests.some(i => context.interests!.includes(i))
      );
    }
    
    // Filtrar por tipo de viaje
    if (context.tripType) {
      places = places.filter(p => p.suitableFor.includes(context.tripType!));
    }
    
    // Filtrar por presupuesto
    if (context.budget) {
      const priceOrder: PriceRange[] = ['gratis', 'economico', 'moderado', 'premium'];
      const maxPriceIndex = priceOrder.indexOf(context.budget);
      places = places.filter(p => priceOrder.indexOf(p.priceRange) <= maxPriceIndex);
    }
    
    // Filtrar por municipio
    if (context.municipality) {
      places = places.filter(p => 
        p.municipality.toLowerCase() === context.municipality!.toLowerCase()
      );
    }
    
    // Filtrar por categoría
    if (context.category) {
      places = places.filter(p => p.category === context.category);
    }
    
    // Búsqueda por keywords
    if (context.keywords && context.keywords.length > 0) {
      const keywords = context.keywords.map(k => k.toLowerCase());
      places = places.filter(place => {
        const searchText = [
          place.name,
          place.shortDescription,
          place.longDescription,
          place.municipality,
          place.category,
          ...place.subcategories,
          place.aiContext || ''
        ].join(' ').toLowerCase();
        
        return keywords.some(kw => searchText.includes(kw));
      });
    }
    
    // Ordenar por relevancia (featured primero, luego por rating)
    places.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    // Limitar resultados
    return places.slice(0, context.limit || 5);
  }
  
  /**
   * Busca lugares por nombre (fuzzy matching)
   */
  export function findPlaceByName(name: string): CuratedPlace | undefined {
    const normalizedName = name.toLowerCase().trim();
    
    // Coincidencia exacta
    let found = CURATED_PLACES.find(p => 
      p.name.toLowerCase() === normalizedName ||
      p.slug === normalizedName
    );
    
    if (found) return found;
    
    // Coincidencia parcial
    found = CURATED_PLACES.find(p => 
      p.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(p.name.toLowerCase())
    );
    
    return found;
  }
  
  /**
   * Extrae nombres de lugares mencionados en un texto
   */
  export function extractPlaceNames(text: string): string[] {
    const placeNames: string[] = [];
    const lowerText = text.toLowerCase();
    
    CURATED_PLACES.forEach(place => {
      if (lowerText.includes(place.name.toLowerCase())) {
        placeNames.push(place.name);
      }
    });
    
    return placeNames;
  }
  
  /**
   * Encuentra lugares mencionados en un mensaje del chat
   */
  export function findMentionedPlaces(text: string): CuratedPlace[] {
    const mentioned: CuratedPlace[] = [];
    const lowerText = text.toLowerCase();
    
    CURATED_PLACES.forEach(place => {
      // Buscar por nombre
      if (lowerText.includes(place.name.toLowerCase())) {
        mentioned.push(place);
        return;
      }
      
      // Buscar por slug
      if (lowerText.includes(place.slug.replace(/-/g, ' '))) {
        mentioned.push(place);
      }
    });
    
    return mentioned;
  }
  
  // =============================================================================
  // INTENCIONES DEL USUARIO
  // =============================================================================
  
  export type UserIntent = 
    | 'explore_beaches'
    | 'explore_culture'
    | 'explore_food'
    | 'explore_nightlife'
    | 'explore_nature'
    | 'explore_crafts'
    | 'plan_trip'
    | 'find_nearby'
    | 'get_directions'
    | 'ask_hours'
    | 'general_question';
  
  /**
   * Detecta la intención del usuario basado en su mensaje
   */
  export function detectUserIntent(message: string): UserIntent {
    const lowerMessage = message.toLowerCase();
    
    // Patrones de intención
    const patterns: Record<UserIntent, RegExp[]> = {
      explore_beaches: [/playa/i, /mar/i, /costa/i, /pradomar/i, /puerto colombia/i, /nadar/i, /broncear/i],
      explore_culture: [/museo/i, /carnaval/i, /cultura/i, /historia/i, /patrimonio/i],
      explore_food: [/comer/i, /comida/i, /restaurante/i, /gastronomía/i, /típic/i, /almorzar/i, /cenar/i, /desayunar/i],
      explore_nightlife: [/rumba/i, /bar/i, /nocturna/i, /bailar/i, /salsa/i, /fiesta/i, /noche/i],
      explore_nature: [/naturaleza/i, /ecoturismo/i, /aves/i, /ciénaga/i, /bocas de ceniza/i, /río/i],
      explore_crafts: [/artesanía/i, /máscaras/i, /galapa/i, /usiacurí/i, /tejido/i, /palma/i],
      plan_trip: [/itinerario/i, /plan/i, /días/i, /viaje/i, /visitar/i, /qué hacer/i, /recomienda/i],
      find_nearby: [/cerca/i, /cercano/i, /alrededor/i, /por aquí/i],
      get_directions: [/cómo llegar/i, /direccion/i, /ubicación/i, /dónde queda/i, /mapa/i],
      ask_hours: [/horario/i, /hora/i, /abierto/i, /cerrado/i, /cuándo/i],
      general_question: [/.*/] // Fallback
    };
    
    for (const [intent, regexes] of Object.entries(patterns)) {
      if (intent === 'general_question') continue;
      if (regexes.some(regex => regex.test(lowerMessage))) {
        return intent as UserIntent;
      }
    }
    
    return 'general_question';
  }
  
  /**
   * Obtiene lugares relevantes basado en la intención detectada
   */
  export function getPlacesForIntent(intent: UserIntent, limit: number = 5): CuratedPlace[] {
    switch (intent) {
      case 'explore_beaches':
        return getPlacesByCategory('playa').slice(0, limit);
      
      case 'explore_culture':
        return getPlacesByInterest('carnaval_cultura')
          .concat(getPlacesByInterest('historia_patrimonio'))
          .slice(0, limit);
      
      case 'explore_food':
        return getPlacesByCategory('restaurante')
          .concat(getPlacesByCategory('cafe'))
          .slice(0, limit);
      
      case 'explore_nightlife':
        return getPlacesByCategory('bar')
          .concat(getPlacesByInterest('vida_nocturna'))
          .slice(0, limit);
      
      case 'explore_nature':
        return getPlacesByCategory('naturaleza')
          .concat(getPlacesByInterest('naturaleza_aventura'))
          .slice(0, limit);
      
      case 'explore_crafts':
        return getPlacesByCategory('artesanias')
          .concat(getPlacesByInterest('artesanias_tradiciones'))
          .slice(0, limit);
      
      case 'plan_trip':
        return getFeaturedPlaces().slice(0, limit);
      
      default:
        return getFeaturedPlaces().slice(0, 3);
    }
  }
  
  // =============================================================================
  // GENERACIÓN DE CONTEXTO PARA CLAUDE
  // =============================================================================
  
  /**
   * Genera contexto de lugares para incluir en el prompt de Claude
   */
  export function generatePlacesContext(places: CuratedPlace[]): string {
    return places.map(p => `
  **${p.name}** (${p.municipality})
  - Categoría: ${p.category}
  - ${p.shortDescription}
  - Rating: ${p.rating}/5 (${p.reviewCount} reseñas)
  - Precio: ${p.priceRange} (~$${p.estimatedCost.toLocaleString()} COP)
  - Ideal para: ${p.suitableFor.join(', ')}
  - Tip local: ${p.localTip}
  - Contexto: ${p.aiContext}
  `).join('\n');
  }
  
  /**
   * Genera el JSON de lugares para incluir en la respuesta del chat
   */
  export function generatePlacesJSON(places: CuratedPlace[]): object[] {
    return places.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.shortDescription,
      address: p.address,
      rating: p.rating,
      reviewCount: p.reviewCount,
      photo: p.primaryImage,
      localTip: p.localTip,
      hours: p.schedule ? `${p.schedule.opens} - ${p.schedule.closes}` : null,
      coordinates: p.coordinates,
    }));
  }
  
  // =============================================================================
  // EXPORTAR DATOS PARA USO DIRECTO
  // =============================================================================
  
  export { 
    CURATED_PLACES,
    getPlaceById,
    getPlacesByInterest,
    getPlacesByCategory,
    getPlacesByTripType,
    getFeaturedPlaces,
    searchPlaces,
  };