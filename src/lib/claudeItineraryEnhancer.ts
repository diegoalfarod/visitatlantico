// src/lib/claudeItineraryEnhancer.ts
// Generador de itinerarios usando Claude API + Base de datos curada
// Esta versión usa fetch directo para evitar dependencia del SDK

import { 
    CURATED_PLACES, 
    getPlacesForItinerary, 
    getPlaceById,
    type CuratedPlace,
    type TripType,
    type PriceRange 
  } from '@/data/atlantico-places';
  
  // =============================================================================
  // TIPOS
  // =============================================================================
  
  export interface ItineraryProfile {
    days: number;
    email: string;
    interests: string[];
    tripType: TripType;
    budget: PriceRange;
    travelPace: 'relajado' | 'moderado' | 'intenso';
    maxDistance: 'cerca' | 'medio' | 'lejos';
    startLocation?: {
      lat: number;
      lng: number;
      name?: string;
    } | string;
  }
  
  export interface GeneratedStop {
    placeId: string;
    name: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    personalizedDescription: string;
    localTip: string;
    whyHere: string;
    activities: string[];
    estimatedCost: number;
    travelTimeFromPrevious: number;
    category: string;
  }
  
  export interface GeneratedDay {
    day: number;
    title: string;
    theme: string;
    municipality: string;
    description: string;
    stops: GeneratedStop[];
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    totalCost: number;
    totalDuration: number;
  }
  
  export interface GeneratedItinerary {
    days: GeneratedDay[];
    metadata: {
      generatedAt: string;
      totalDays: number;
      totalStops: number;
      totalCost: number;
      personalizationScore: number;
      interests: string[];
      tripType: string;
    };
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
  }
  
  // =============================================================================
  // CONFIGURACIÓN
  // =============================================================================
  
  const ACTIVITIES_PER_DAY = {
    relajado: { min: 2, max: 3 },
    moderado: { min: 3, max: 4 },
    intenso: { min: 4, max: 5 }
  };
  
  const TRIP_TYPE_CONTEXT = {
    solo: "Viajero independiente que disfruta explorando a su propio ritmo, abierto a conocer gente local y vivir experiencias auténticas.",
    pareja: "Pareja buscando momentos románticos, atardeceres especiales, y experiencias íntimas que puedan compartir juntos.",
    familia: "Familia con niños que necesita lugares seguros, cómodos, con servicios, y actividades que todos puedan disfrutar.",
    amigos: "Grupo de amigos buscando diversión, aventura, buena comida, y posiblemente vida nocturna."
  };
  
  const INTEREST_DESCRIPTIONS: Record<string, string> = {
    carnaval_cultura: "Carnaval de Barranquilla, tradiciones folclóricas, música cumbia y mapalé, máscaras artesanales",
    playas_rio: "Playas del Caribe, Río Magdalena, malecones, atardeceres frente al agua",
    gastronomia_local: "Comida típica costeña, mariscos frescos, arepa de huevo, sancocho, jugos naturales",
    vida_nocturna: "Salsa, champeta, bares con música en vivo, rumba costeña auténtica",
    historia_patrimonio: "Arquitectura colonial, museos, iglesias históricas, Centro Histórico",
    artesanias_tradiciones: "Máscaras de Galapa, tejidos de Usiacurí, artesanías de palma de iraca",
    naturaleza_aventura: "Ecoturismo, avistamiento de aves, Ciénaga de Mallorquín, Bocas de Ceniza"
  };
  
  // =============================================================================
  // CLASE PRINCIPAL
  // =============================================================================
  
  export class ClaudeItineraryEnhancer {
    private apiKey: string | null = null;
    private isAvailable: boolean = false;
  
    constructor() {
      this.apiKey = process.env.ANTHROPIC_API_KEY || null;
      
      if (!this.apiKey) {
        console.warn('⚠️ ANTHROPIC_API_KEY no configurada - usando generación algorítmica');
        this.isAvailable = false;
      } else {
        this.isAvailable = true;
        console.log('✅ Claude API configurado correctamente');
      }
    }
  
    // ===========================================================================
    // MÉTODO PRINCIPAL
    // ===========================================================================
  
    async generateItinerary(profile: ItineraryProfile): Promise<GeneratedItinerary> {
      console.log('🚀 Iniciando generación de itinerario');
      console.log('Perfil:', {
        days: profile.days,
        tripType: profile.tripType,
        interests: profile.interests,
        budget: profile.budget,
        pace: profile.travelPace
      });
  
      // 1. Obtener lugares relevantes de la base de datos curada
      const relevantPlaces = this.getRelevantPlaces(profile);
      console.log(`📍 ${relevantPlaces.length} lugares relevantes encontrados`);
  
      if (relevantPlaces.length < profile.days * 2) {
        console.warn('⚠️ Pocos lugares encontrados, agregando lugares populares');
        const additionalPlaces = this.getAdditionalPlaces(profile, relevantPlaces);
        relevantPlaces.push(...additionalPlaces);
      }
  
      // 2. Generar itinerario con Claude o algoritmo local
      let itinerary: GeneratedItinerary;
  
      if (this.isAvailable && this.apiKey) {
        try {
          itinerary = await this.generateWithClaude(profile, relevantPlaces);
        } catch (error) {
          console.error('Error con Claude, usando generación local:', error);
          itinerary = this.generateLocalItinerary(profile, relevantPlaces);
        }
      } else {
        itinerary = this.generateLocalItinerary(profile, relevantPlaces);
      }
  
      // 3. Validar y enriquecer
      const validatedItinerary = this.validateAndEnrich(itinerary, profile);
  
      console.log('✅ Itinerario generado exitosamente');
      return validatedItinerary;
    }
  
    // ===========================================================================
    // OBTENER LUGARES RELEVANTES
    // ===========================================================================
  
    private getRelevantPlaces(profile: ItineraryProfile): CuratedPlace[] {
      const places = getPlacesForItinerary({
        interests: profile.interests,
        tripType: profile.tripType,
        priceRange: profile.budget,
        days: profile.days
      });
  
      return places;
    }
  
    private getAdditionalPlaces(
      profile: ItineraryProfile, 
      existingPlaces: CuratedPlace[]
    ): CuratedPlace[] {
      const existingIds = new Set(existingPlaces.map(p => p.id));
      
      return CURATED_PLACES
        .filter(p => !existingIds.has(p.id))
        .filter(p => p.featured || p.rating >= 4.5)
        .filter(p => {
          if (profile.tripType === 'familia') return p.familyFriendly;
          return true;
        })
        .slice(0, 10);
    }
  
    // ===========================================================================
    // GENERACIÓN CON CLAUDE (usando fetch directo)
    // ===========================================================================
  
    private async generateWithClaude(
      profile: ItineraryProfile,
      places: CuratedPlace[]
    ): Promise<GeneratedItinerary> {
      const prompt = this.buildClaudePrompt(profile, places);
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de Claude API:', response.status, errorText);
        throw new Error(`Claude API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Extraer texto de la respuesta
      const textContent = data.content?.find((block: any) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('Respuesta de Claude sin contenido de texto');
      }
  
      const text = textContent.text;
  
      // Parsear JSON de la respuesta
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
  
      try {
        const parsed = JSON.parse(jsonText);
        return this.transformClaudeResponse(parsed, profile, places);
      } catch (error) {
        console.error('Error parseando respuesta de Claude:', error);
        throw error;
      }
    }
  
    private buildClaudePrompt(profile: ItineraryProfile, places: CuratedPlace[]): string {
      const activitiesRange = ACTIVITIES_PER_DAY[profile.travelPace];
      const tripContext = TRIP_TYPE_CONTEXT[profile.tripType];
      const interestsText = profile.interests
        .map(i => INTEREST_DESCRIPTIONS[i] || i)
        .join('; ');
  
      const placesJson = places.map(p => ({
        id: p.id,
        name: p.name,
        municipality: p.municipality,
        category: p.category,
        shortDescription: p.shortDescription,
        typicalDuration: p.typicalDuration,
        estimatedCost: p.estimatedCost,
        priceRange: p.priceRange,
        schedule: p.schedule,
        suitableFor: p.suitableFor,
        familyFriendly: p.familyFriendly,
        romanticSpot: p.romanticSpot,
        localTip: p.localTip,
        mustTry: p.mustTry,
        aiContext: p.aiContext
      }));
  
      return `Eres un experto planificador de viajes del departamento del Atlántico, Colombia. Tu trabajo es crear itinerarios personalizados y memorables.
  
  ## PERFIL DEL VIAJERO
  
  - **Duración**: ${profile.days} días
  - **Tipo de viaje**: ${profile.tripType} - ${tripContext}
  - **Intereses principales**: ${interestsText}
  - **Presupuesto**: ${profile.budget}
  - **Ritmo**: ${profile.travelPace} (${activitiesRange.min}-${activitiesRange.max} actividades por día)
  
  ## LUGARES DISPONIBLES
  
  IMPORTANTE: Solo puedes usar lugares de esta lista. El "id" debe coincidir exactamente.
  
  ${JSON.stringify(placesJson, null, 2)}
  
  ## REGLAS DE GENERACIÓN
  
  1. **Usar SOLO lugares de la lista** - No inventes ningún lugar
  2. **Respetar el ritmo** - ${activitiesRange.min} a ${activitiesRange.max} paradas por día
  3. **Lógica geográfica** - Agrupa lugares del mismo municipio en el mismo día
  4. **Horarios realistas**:
     - Playas: mejor por la mañana (8-12)
     - Museos: 9:00-17:00
     - Restaurantes almuerzo: 12:00-14:00
     - Restaurantes cena: 19:00-21:00
     - Bares/vida nocturna: después de 21:00
  5. **Personalización según tipo de viaje**:
     ${profile.tripType === 'familia' ? '- SOLO lugares familyFriendly: true\n   - Terminar el día antes de las 19:00\n   - Incluir descansos' : ''}
     ${profile.tripType === 'pareja' ? '- Priorizar lugares con romanticSpot: true\n   - Incluir atardeceres y cenas especiales' : ''}
     ${profile.tripType === 'amigos' ? '- Incluir vida nocturna si está en intereses\n   - Actividades grupales y dinámicas' : ''}
  6. **Incluir comidas** - Siempre incluir almuerzo, cena según corresponda
  
  ## FORMATO DE RESPUESTA
  
  Responde SOLO con JSON válido en este formato exacto:
  
  \`\`\`json
  {
    "days": [
      {
        "day": 1,
        "title": "Título atractivo y específico del día",
        "theme": "Tema principal basado en actividades",
        "municipality": "Municipio principal del día",
        "description": "Descripción de 1-2 oraciones del día",
        "stops": [
          {
            "placeId": "id-exacto-de-la-lista",
            "startTime": "09:00",
            "endTime": "11:00",
            "personalizedDescription": "Descripción personalizada para ESTE viajero",
            "whyHere": "Por qué este lugar es perfecto para sus intereses",
            "activities": ["Actividad 1", "Actividad 2"],
            "travelTimeFromPrevious": 0
          }
        ],
        "meals": {
          "lunch": "Nombre del lugar o sugerencia",
          "dinner": "Nombre del lugar o sugerencia (si aplica)"
        }
      }
    ]
  }
  \`\`\`
  
  IMPORTANTE: 
  - Cada placeId DEBE existir en la lista de lugares
  - Las descripciones deben ser específicas para este viajero, no genéricas
  - El tono debe ser cálido y emocionante, como un amigo local dando recomendaciones`;
    }
  
    private transformClaudeResponse(
      response: any,
      profile: ItineraryProfile,
      places: CuratedPlace[]
    ): GeneratedItinerary {
      const placesMap = new Map(places.map(p => [p.id, p]));
      const days: GeneratedDay[] = [];
  
      for (const dayData of response.days || []) {
        const stops: GeneratedStop[] = [];
  
        for (const stopData of dayData.stops || []) {
          const place = placesMap.get(stopData.placeId);
          if (!place) {
            console.warn(`⚠️ Lugar no encontrado: ${stopData.placeId}`);
            continue;
          }
  
          if (profile.tripType === 'familia' && !place.familyFriendly) {
            console.warn(`⚠️ Lugar no apto para familias filtrado: ${place.name}`);
            continue;
          }
  
          stops.push({
            placeId: place.id,
            name: place.name,
            startTime: stopData.startTime,
            endTime: stopData.endTime,
            durationMinutes: place.typicalDuration,
            personalizedDescription: stopData.personalizedDescription || place.shortDescription,
            localTip: place.localTip,
            whyHere: stopData.whyHere || place.aiContext,
            activities: stopData.activities || place.mustTry,
            estimatedCost: place.estimatedCost,
            travelTimeFromPrevious: stopData.travelTimeFromPrevious || 15,
            category: place.category
          });
        }
  
        if (stops.length > 0) {
          days.push({
            day: dayData.day,
            title: dayData.title,
            theme: dayData.theme,
            municipality: dayData.municipality || stops[0]?.name?.split(',')[0] || 'Barranquilla',
            description: dayData.description,
            stops,
            meals: dayData.meals || {},
            totalCost: stops.reduce((sum, s) => sum + s.estimatedCost, 0),
            totalDuration: stops.reduce((sum, s) => sum + s.durationMinutes + s.travelTimeFromPrevious, 0)
          });
        }
      }
  
      return {
        days,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalDays: days.length,
          totalStops: days.reduce((sum, d) => sum + d.stops.length, 0),
          totalCost: days.reduce((sum, d) => sum + d.totalCost, 0),
          personalizationScore: 85,
          interests: profile.interests,
          tripType: profile.tripType
        },
        validation: {
          isValid: days.length > 0,
          errors: [],
          warnings: []
        }
      };
    }
  
    // ===========================================================================
    // GENERACIÓN LOCAL (FALLBACK)
    // ===========================================================================
  
    private generateLocalItinerary(
      profile: ItineraryProfile,
      places: CuratedPlace[]
    ): GeneratedItinerary {
      console.log('🔧 Generando itinerario con algoritmo local');
  
      const activitiesRange = ACTIVITIES_PER_DAY[profile.travelPace];
      const days: GeneratedDay[] = [];
      const usedPlaceIds = new Set<string>();
  
      const placesByMunicipality = this.groupByMunicipality(places);
      const municipalities = this.getMunicipalityOrder(profile.days, placesByMunicipality);
  
      for (let dayNum = 1; dayNum <= profile.days; dayNum++) {
        const municipality = municipalities[dayNum - 1] || 'Barranquilla';
        const dayPlaces = this.selectDayPlaces(
          places,
          profile,
          municipality,
          usedPlaceIds,
          activitiesRange.max
        );
  
        const stops = this.buildDayStops(dayPlaces, profile, dayNum);
        
        stops.forEach(s => usedPlaceIds.add(s.placeId));
  
        const dayTitle = this.generateDayTitle(dayNum, municipality, dayPlaces, profile);
        const dayTheme = this.generateDayTheme(dayPlaces, profile);
  
        days.push({
          day: dayNum,
          title: dayTitle,
          theme: dayTheme,
          municipality,
          description: this.generateDayDescription(dayPlaces, profile),
          stops,
          meals: this.generateMeals(dayPlaces, municipality, profile),
          totalCost: stops.reduce((sum, s) => sum + s.estimatedCost, 0),
          totalDuration: stops.reduce((sum, s) => sum + s.durationMinutes + s.travelTimeFromPrevious, 0)
        });
      }
  
      return {
        days,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalDays: days.length,
          totalStops: days.reduce((sum, d) => sum + d.stops.length, 0),
          totalCost: days.reduce((sum, d) => sum + d.totalCost, 0),
          personalizationScore: 70,
          interests: profile.interests,
          tripType: profile.tripType
        },
        validation: {
          isValid: days.length > 0,
          errors: [],
          warnings: []
        }
      };
    }
  
    private groupByMunicipality(places: CuratedPlace[]): Map<string, CuratedPlace[]> {
      const groups = new Map<string, CuratedPlace[]>();
      
      for (const place of places) {
        const muni = place.municipality;
        if (!groups.has(muni)) {
          groups.set(muni, []);
        }
        groups.get(muni)!.push(place);
      }
  
      return groups;
    }
  
    private getMunicipalityOrder(days: number, placesByMuni: Map<string, CuratedPlace[]>): string[] {
      const order: string[] = [];
      
      if (placesByMuni.has('Barranquilla')) {
        order.push('Barranquilla');
      }
  
      const otherMunis = Array.from(placesByMuni.keys())
        .filter(m => m !== 'Barranquilla')
        .sort((a, b) => (placesByMuni.get(b)?.length || 0) - (placesByMuni.get(a)?.length || 0));
  
      for (let i = 1; i < days; i++) {
        if (i % 2 === 1 && otherMunis.length > 0) {
          order.push(otherMunis[Math.floor((i - 1) / 2) % otherMunis.length]);
        } else {
          order.push('Barranquilla');
        }
      }
  
      return order.slice(0, days);
    }
  
    private selectDayPlaces(
      allPlaces: CuratedPlace[],
      profile: ItineraryProfile,
      municipality: string,
      usedIds: Set<string>,
      maxPlaces: number
    ): CuratedPlace[] {
      let available = allPlaces.filter(p => 
        p.municipality === municipality && 
        !usedIds.has(p.id)
      );
  
      if (available.length < 2) {
        const nearby = allPlaces.filter(p => 
          !usedIds.has(p.id) && p.municipality !== municipality
        );
        available = [...available, ...nearby.slice(0, maxPlaces - available.length)];
      }
  
      if (profile.tripType === 'familia') {
        available = available.filter(p => p.familyFriendly);
      }
  
      available.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        const aMatch = a.interests.filter(i => profile.interests.includes(i)).length;
        const bMatch = b.interests.filter(i => profile.interests.includes(i)).length;
        if (aMatch !== bMatch) return bMatch - aMatch;
        
        return b.rating - a.rating;
      });
  
      return available.slice(0, maxPlaces);
    }
  
    private buildDayStops(
      places: CuratedPlace[],
      profile: ItineraryProfile,
      dayNum: number
    ): GeneratedStop[] {
      const stops: GeneratedStop[] = [];
      let currentTime = profile.tripType === 'familia' ? 9 * 60 : 8.5 * 60;
  
      const orderedPlaces = this.orderByTimeOfDay(places);
  
      for (let i = 0; i < orderedPlaces.length; i++) {
        const place = orderedPlaces[i];
        const travelTime = i === 0 ? 0 : 20;
  
        if (currentTime >= 12 * 60 && currentTime <= 14 * 60) {
          if (place.category !== 'restaurante') {
            currentTime = 14 * 60;
          }
        }
  
        const startTime = currentTime + travelTime;
        const endTime = startTime + place.typicalDuration;
  
        if (profile.tripType === 'familia' && startTime >= 19 * 60) {
          break;
        }
  
        stops.push({
          placeId: place.id,
          name: place.name,
          startTime: this.minutesToTime(startTime),
          endTime: this.minutesToTime(endTime),
          durationMinutes: place.typicalDuration,
          personalizedDescription: this.personalizeDescription(place, profile),
          localTip: place.localTip,
          whyHere: this.generateWhyHere(place, profile),
          activities: place.mustTry.slice(0, 3),
          estimatedCost: place.estimatedCost,
          travelTimeFromPrevious: travelTime,
          category: place.category
        });
  
        currentTime = endTime;
      }
  
      return stops;
    }
  
    private orderByTimeOfDay(places: CuratedPlace[]): CuratedPlace[] {
      const timePreference: Record<string, number> = {
        'playa': 1,
        'naturaleza': 1,
        'museo': 2,
        'artesanias': 2,
        'iglesia': 2,
        'parque': 3,
        'mirador': 4,
        'restaurante': 3,
        'cafe': 2,
        'bar': 5,
        'entretenimiento': 3
      };
  
      return [...places].sort((a, b) => 
        (timePreference[a.category] || 3) - (timePreference[b.category] || 3)
      );
    }
  
    private personalizeDescription(place: CuratedPlace, profile: ItineraryProfile): string {
      const baseDesc = place.shortDescription;
      
      if (profile.tripType === 'familia') {
        return `${baseDesc} Perfecto para disfrutar en familia.`;
      }
      if (profile.tripType === 'pareja' && place.romanticSpot) {
        return `${baseDesc} Un lugar especial para compartir en pareja.`;
      }
      if (profile.tripType === 'amigos') {
        return `${baseDesc} Ideal para pasarla bien con amigos.`;
      }
      
      return baseDesc;
    }
  
    private generateWhyHere(place: CuratedPlace, profile: ItineraryProfile): string {
      const matchedInterests = place.interests.filter(i => profile.interests.includes(i));
      
      if (matchedInterests.length > 0) {
        const interestName = INTEREST_DESCRIPTIONS[matchedInterests[0]] || matchedInterests[0];
        return `Seleccionado por tu interés en ${interestName.split(',')[0].toLowerCase()}.`;
      }
      
      if (place.featured) {
        return 'Uno de los lugares más destacados del Atlántico.';
      }
      
      return place.aiContext.split('.')[0] + '.';
    }
  
    private generateDayTitle(
      dayNum: number, 
      municipality: string, 
      places: CuratedPlace[],
      profile: ItineraryProfile
    ): string {
      const themes: Record<string, string[]> = {
        'Barranquilla': ['Descubriendo la Puerta de Oro', 'Cultura Caribeña', 'El Corazón del Caribe'],
        'Puerto Colombia': ['Sol y Brisa Marina', 'Playas del Atlántico', 'Un Día Frente al Mar'],
        'Galapa': ['Arte y Tradición', 'Máscaras del Carnaval', 'Artesanía Viva'],
        'Usiacurí': ['Tejidos y Poesía', 'El Pueblo de los Artesanos'],
        'default': [`Día ${dayNum} de Aventura`]
      };
  
      const options = themes[municipality] || themes.default;
      return options[(dayNum - 1) % options.length];
    }
  
    private generateDayTheme(places: CuratedPlace[], profile: ItineraryProfile): string {
      const categories = places.map(p => p.category);
      
      if (categories.includes('playa')) return 'Playa y Relax';
      if (categories.includes('museo')) return 'Cultura e Historia';
      if (categories.includes('artesanias')) return 'Tradición y Artesanía';
      if (categories.includes('restaurante')) return 'Gastronomía Local';
      if (categories.includes('bar')) return 'Rumba y Diversión';
      if (categories.includes('naturaleza')) return 'Ecoturismo';
      
      return 'Explorando el Atlántico';
    }
  
    private generateDayDescription(places: CuratedPlace[], profile: ItineraryProfile): string {
      const municipalities = [...new Set(places.map(p => p.municipality))];
      const count = places.length;
      
      let desc = `${count} lugares increíbles`;
      
      if (municipalities.length === 1) {
        desc += ` en ${municipalities[0]}`;
      } else {
        desc += ` entre ${municipalities.join(' y ')}`;
      }
  
      return desc + '.';
    }
  
    private generateMeals(
      places: CuratedPlace[], 
      municipality: string,
      profile: ItineraryProfile
    ): { breakfast?: string; lunch?: string; dinner?: string } {
      const meals: { breakfast?: string; lunch?: string; dinner?: string } = {};
  
      const restaurants = places.filter(p => p.category === 'restaurante');
      
      if (restaurants.length > 0) {
        meals.lunch = restaurants[0].name;
        if (restaurants.length > 1) {
          meals.dinner = restaurants[1].name;
        }
      } else {
        const suggestions: Record<string, { lunch: string; dinner: string }> = {
          'Barranquilla': { 
            lunch: 'Caimán del Río o restaurante del Malecón', 
            dinner: 'La Cueva o NarcoBollo' 
          },
          'Puerto Colombia': { 
            lunch: 'Restaurante frente al mar en Pradomar', 
            dinner: 'Restaurantes del Muelle' 
          },
          'Galapa': { 
            lunch: 'Restaurante local con arroz de lisa', 
            dinner: 'Regresar a Barranquilla para cenar' 
          }
        };
  
        const suggestion = suggestions[municipality] || suggestions['Barranquilla'];
        meals.lunch = suggestion.lunch;
        
        if (profile.tripType !== 'familia' || places.some(p => p.category === 'bar')) {
          meals.dinner = suggestion.dinner;
        }
      }
  
      return meals;
    }
  
    // ===========================================================================
    // VALIDACIÓN Y ENRIQUECIMIENTO
    // ===========================================================================
  
    private validateAndEnrich(
      itinerary: GeneratedItinerary,
      profile: ItineraryProfile
    ): GeneratedItinerary {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      if (itinerary.days.length === 0) {
        errors.push('No se generaron días en el itinerario');
      }
  
      if (itinerary.days.length < profile.days) {
        warnings.push(`Solo se generaron ${itinerary.days.length} de ${profile.days} días solicitados`);
      }
  
      for (const day of itinerary.days) {
        if (day.stops.length === 0) {
          errors.push(`Día ${day.day} no tiene paradas`);
        }
  
        if (profile.tripType === 'familia') {
          for (const stop of day.stops) {
            const place = getPlaceById(stop.placeId);
            if (place && !place.familyFriendly) {
              warnings.push(`${stop.name} puede no ser ideal para familias`);
            }
          }
        }
      }
  
      let personalizationScore = 70;
      const totalStops = itinerary.days.reduce((sum, d) => sum + d.stops.length, 0);
      let matchedStops = 0;
  
      for (const day of itinerary.days) {
        for (const stop of day.stops) {
          const place = getPlaceById(stop.placeId);
          if (place && place.interests.some(i => profile.interests.includes(i))) {
            matchedStops++;
          }
        }
      }
  
      if (totalStops > 0) {
        personalizationScore = Math.round((matchedStops / totalStops) * 100);
      }
  
      return {
        ...itinerary,
        metadata: {
          ...itinerary.metadata,
          personalizationScore
        },
        validation: {
          isValid: errors.length === 0,
          errors,
          warnings
        }
      };
    }
  
    // ===========================================================================
    // UTILIDADES
    // ===========================================================================
  
    private minutesToTime(minutes: number): string {
      const hours = Math.floor(minutes / 60) % 24;
      const mins = Math.round(minutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
  }
  
  // =============================================================================
  // EXPORT DEFAULT
  // =============================================================================
  
  export default ClaudeItineraryEnhancer;