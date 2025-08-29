// src/lib/geminiItineraryEnhancer.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

interface PlaceData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  categories?: string[];
  priceLevel?: number;
  address?: string;
  photoUrl?: string;
  municipality?: string;
  familyFriendly?: boolean;
}

interface EnhancedItinerary {
  dias: DayItinerary[];
  metadata: {
    personalizationScore: number;
    coherenceScore: number;
    realismScore: number;
  };
}

interface DayItinerary {
  dia: number;
  titulo: string;
  temaDelDia: string;
  municipio: string;
  paradas: StopDetail[];
}

interface StopDetail {
  placeId: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  descripcionPersonalizada: string;
  tipLocal: string;
  porQueAqui: string;
  queHacer: string[];
  costoEstimado: number;
  tiempoTraslado?: number;
  categoria: string;
}

export class GeminiItineraryEnhancer {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isAvailable: boolean = false;

  // Lista de lugares prohibidos
  private readonly FORBIDDEN_PLACES = [
    'country club', 'club campestre', 'club social',
    'supermercado', 'éxito', 'olímpica',
    'strip', 'motel', 'adult'
  ];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Gemini API key no configurada - usando sistema de respaldo');
      this.isAvailable = false;
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      this.isAvailable = true;
      console.log('✅ Gemini AI configurado correctamente con gemini-1.5-flash');
    } catch (error) {
      console.error('❌ Error configurando Gemini AI:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Genera un itinerario inteligente usando Gemini AI con validación estricta
   */
  async generateIntelligentItinerary(
    profile: any,
    placesData: PlaceData[]
  ): Promise<EnhancedItinerary> {
    // Filtrar lugares prohibidos antes de enviar a Gemini
    const validPlaces = placesData.filter(place => 
      !this.isForbiddenPlace(place)
    );

    if (!this.isAvailable || !this.model || validPlaces.length === 0) {
      console.log('Usando generación local sin IA...');
      return this.generateLocalItinerary(profile, validPlaces);
    }

    const prompt = this.buildStrictPrompt(profile, validPlaces);
    
    try {
      console.log('Generando con Gemini AI...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer JSON de la respuesta
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      try {
        const itinerary = JSON.parse(jsonText);
        // Validar que no incluya lugares prohibidos
        return this.validateAndCleanItinerary(itinerary, validPlaces, profile);
      } catch (parseError) {
        console.error('Error parseando respuesta de Gemini:', parseError);
        return this.generateLocalItinerary(profile, validPlaces);
      }
    } catch (error: any) {
      console.error('Error con Gemini AI:', error);
      return this.generateLocalItinerary(profile, validPlaces);
    }
  }

  /**
   * Verificar si un lugar está prohibido
   */
  private isForbiddenPlace(place: PlaceData): boolean {
    const nameLower = place.name.toLowerCase();
    return this.FORBIDDEN_PLACES.some(forbidden => 
      nameLower.includes(forbidden)
    );
  }

  /**
   * Construir prompt estricto para Gemini
   */
  private buildStrictPrompt(profile: any, places: PlaceData[]): string {
    const interestDescriptions = this.getInterestDescriptions(profile.interests);
    const tripTypeContext = this.getTripTypeContext(profile.tripType);
    
    return `
Eres un experto planificador de viajes del Atlántico, Colombia con 20 años de experiencia.
IMPORTANTE: Debes crear un itinerario REALISTA usando SOLO los lugares de la lista proporcionada.

PERFIL DEL VIAJERO:
- Duración: ${profile.days} días
- Tipo: ${profile.tripType} - ${tripTypeContext}
- Intereses: ${profile.interests.join(', ')}
- Presupuesto: ${profile.budget}
- Ritmo: ${profile.preferredPace}

${interestDescriptions}

LUGARES DISPONIBLES (USA SOLO ESTOS - NO INVENTES NINGUNO):
${JSON.stringify(places.map(p => ({
  id: p.id,
  nombre: p.name,
  municipio: p.municipality || 'Barranquilla',
  rating: p.rating,
  categorias: p.categories,
  familyFriendly: p.familyFriendly
})), null, 2)}

REGLAS ESTRICTAS NO NEGOCIABLES:

1. USA SOLO lugares de la lista anterior. El placeId DEBE coincidir exactamente.
2. NO inventes lugares. Si no hay suficientes, repite algunos o acorta el día.
3. NUNCA incluyas:
   - Country Club o clubes privados
   - Supermercados (Éxito, Olímpica, etc)
   - Moteles o entretenimiento adulto
   - Lugares residenciales u oficinas
   - Clínicas privadas

4. Para ${profile.tripType}:
${this.getTripSpecificRules(profile.tripType, profile.interests)}

5. HORARIOS REALISTAS:
   - Playas: 8:00-13:00 (evitar sol fuerte)
   - Museos: 9:00-17:00 (cerrados lunes)
   - Restaurantes almuerzo: 12:00-14:30
   - Bares/música: después de 20:00

6. PARA FAMILIA:
   - Solo lugares con familyFriendly: true
   - Evitar bares y lugares nocturnos
   - Incluir descansos y tiempo de comida
   - Actividades hasta las 19:00 máximo

7. ESTRUCTURA POR DÍA:
   - Mínimo 3, máximo 5 paradas
   - Incluir SIEMPRE almuerzo entre 12:00-14:00
   - Distancias realistas entre lugares
   - Tiempo de traslado mínimo 20 minutos entre municipios

FORMATO JSON EXACTO:
{
  "dias": [
    {
      "dia": 1,
      "titulo": "Título específico del día",
      "temaDelDia": "Tema basado en intereses reales",
      "municipio": "Municipio principal (debe ser real)",
      "paradas": [
        {
          "placeId": "id EXACTO de la lista",
          "nombre": "Nombre EXACTO del lugar",
          "horaInicio": "HH:MM",
          "horaFin": "HH:MM",
          "duracionMinutos": número,
          "descripcionPersonalizada": "Descripción específica para este perfil",
          "tipLocal": "Consejo útil y específico",
          "porQueAqui": "Razón específica según intereses",
          "queHacer": ["actividad1", "actividad2"],
          "costoEstimado": número en COP,
          "tiempoTraslado": minutos desde parada anterior,
          "categoria": "categoria del lugar"
        }
      ]
    }
  ],
  "metadata": {
    "personalizationScore": 0-100,
    "coherenceScore": 0-100,
    "realismScore": 0-100
  }
}

VERIFICA: Cada placeId DEBE existir en la lista proporcionada.
`;
  }

  /**
   * Reglas específicas por tipo de viaje
   */
  private getTripSpecificRules(tripType: string, interests: string[]): string {
    const rules: Record<string, string> = {
      'familia': `
        - Lugares seguros y aptos para niños
        - Actividades que terminen antes de las 19:00
        - Incluir tiempo de descanso y comidas
        - Evitar lugares con mucha caminata
        - Preferir playas tranquilas a deportes extremos`,
      'pareja': `
        - Incluir lugares románticos al atardecer
        - Restaurantes con ambiente íntimo
        - Actividades que permitan conversación
        - Evitar lugares muy ruidosos o concurridos`,
      'amigos': `
        - Actividades grupales y dinámicas
        - Incluir vida nocturna si hay interés en ritmos
        - Lugares con buena energía y ambiente
        - Deportes y aventuras si corresponde`,
      'solo': `
        - Actividades que se disfruten individualmente
        - Lugares seguros para una persona
        - Oportunidades para conocer gente si lo desea
        - Flexibilidad en horarios`,
      'negocios': `
        - Eficiencia en rutas y tiempos
        - Lugares profesionales para comidas
        - Actividades culturales breves
        - Evitar lugares muy informales`
    };
    
    return rules[tripType] || rules['familia'];
  }

  /**
   * Obtener descripciones de intereses
   */
  private getInterestDescriptions(interests: string[]): string {
    const descriptions: Record<string, string> = {
      'deportes-acuaticos': 'Prefiere playas aptas para actividades acuáticas, pero seguras para el perfil del viajero',
      'relax': 'Busca lugares tranquilos, con sombra, buenos servicios',
      'cultura': 'Interesado en museos, historia, arquitectura colonial',
      'gastronomia': 'Quiere probar comida típica en lugares auténticos',
      'playa': 'Disfruta del mar, arena y sol con comodidad',
      'artesanias': 'Busca productos locales auténticos, mercados tradicionales',
      'ritmos': 'Quiere música en vivo, ambiente festivo (solo si no es familia)',
      'festivales': 'Busca eventos culturales y celebraciones locales'
    };

    return 'INTERESES DETALLADOS:\n' + 
      interests.map(i => `- ${i.toUpperCase()}: ${descriptions[i] || 'Interés general'}`).join('\n');
  }

  /**
   * Obtener contexto del tipo de viaje
   */
  private getTripTypeContext(tripType: string): string {
    const contexts: Record<string, string> = {
      'solo': 'Viajero independiente, busca experiencias personales',
      'pareja': 'Buscan momentos románticos y experiencias compartidas',
      'familia': 'Con niños, necesitan seguridad y comodidad',
      'amigos': 'Grupo buscando diversión y aventuras',
      'negocios': 'Tiempo limitado, buscan eficiencia'
    };
    return contexts[tripType] || 'Viaje estándar';
  }

  /**
   * Validar y limpiar itinerario de lugares prohibidos
   */
  private validateAndCleanItinerary(
    itinerary: any,
    placesData: PlaceData[],
    profile: any
  ): EnhancedItinerary {
    const placesMap = new Map(placesData.map(p => [p.id, p]));
    const cleanedDays = [];
    
    for (const dia of itinerary.dias) {
      const cleanedStops = [];
      
      for (const stop of dia.paradas) {
        const placeData = placesMap.get(stop.placeId);
        
        // Verificar que el lugar existe y no está prohibido
        if (placeData && !this.isForbiddenPlace(placeData)) {
          // Corregir el municipio con el real
          stop.municipio = placeData.municipality || 'Barranquilla';
          
          // Para familias, verificar que sea family-friendly
          if (profile.tripType === 'familia' && placeData.familyFriendly === false) {
            console.warn(`⚠️ Lugar no apto para familias filtrado: ${placeData.name}`);
            continue;
          }
          
          cleanedStops.push({
            ...stop,
            lat: placeData.lat,
            lng: placeData.lng,
            rating: placeData.rating,
            photoUrl: placeData.photoUrl
          });
        } else {
          console.warn(`❌ Lugar inválido o prohibido removido: ${stop.nombre}`);
        }
      }
      
      if (cleanedStops.length > 0) {
        cleanedDays.push({
          ...dia,
          paradas: cleanedStops
        });
      }
    }
    
    return {
      dias: cleanedDays,
      metadata: itinerary.metadata || {
        personalizationScore: 70,
        coherenceScore: 80,
        realismScore: 85
      }
    };
  }

  /**
   * Generación local de respaldo mejorada
   */
  private generateLocalItinerary(profile: any, places: PlaceData[]): EnhancedItinerary {
    console.log('Generando itinerario local optimizado...');
    
    if (!places || places.length === 0) {
      console.error('No hay lugares disponibles para generar itinerario');
      return {
        dias: [],
        metadata: {
          personalizationScore: 0,
          coherenceScore: 0,
          realismScore: 0
        }
      };
    }
    
    // Filtrar lugares apropiados para el tipo de viaje
    let appropriatePlaces = places;
    if (profile.tripType === 'familia') {
      appropriatePlaces = places.filter(p => 
        p.familyFriendly !== false &&
        !p.categories?.includes('bar') &&
        !p.categories?.includes('night_club')
      );
    }
    
    const dias = [];
    const placesPerDay = Math.min(4, Math.ceil(appropriatePlaces.length / profile.days));
    
    for (let day = 1; day <= profile.days; day++) {
      const startIdx = (day - 1) * placesPerDay;
      const dayPlaces = appropriatePlaces.slice(startIdx, startIdx + placesPerDay);
      
      if (dayPlaces.length === 0) continue;
      
      const paradas = this.organizeDayStops(dayPlaces, profile);
      
      dias.push({
        dia: day,
        titulo: this.generateDayTitle(day, profile),
        temaDelDia: this.generateDayTheme(dayPlaces, profile),
        municipio: dayPlaces[0]?.municipality || 'Barranquilla',
        paradas
      });
    }
    
    return {
      dias,
      metadata: {
        personalizationScore: 65,
        coherenceScore: 80,
        realismScore: 90
      }
    };
  }

  /**
   * Organizar paradas del día con horarios realistas
   */
  private organizeDayStops(places: PlaceData[], profile: any): StopDetail[] {
    const stops: StopDetail[] = [];
    let currentTime = profile.tripType === 'familia' ? 9 : 8.5; // Familias empiezan más tarde
    
    for (let i = 0; i < places.length && i < 4; i++) {
      const place = places[i];
      const duration = this.getDurationForPlace(place, profile);
      
      // Verificar si es hora de almuerzo
      if (currentTime >= 12 && currentTime <= 14 && !stops.some(s => s.categoria === 'restaurant')) {
        // Insertar parada de almuerzo
        stops.push({
          placeId: `lunch_${i}`,
          nombre: 'Almuerzo en restaurante local',
          horaInicio: '12:30',
          horaFin: '14:00',
          duracionMinutos: 90,
          descripcionPersonalizada: 'Pausa para disfrutar la gastronomía local',
          tipLocal: 'Prueba el menú del día para una experiencia auténtica',
          porQueAqui: 'Momento perfecto para recargar energías',
          queHacer: ['Probar platos típicos', 'Descansar'],
          costoEstimado: this.getLunchCost(profile.budget),
          tiempoTraslado: 15,
          categoria: 'restaurant'
        });
        currentTime = 14;
      }
      
      stops.push({
        placeId: place.id,
        nombre: place.name,
        horaInicio: this.formatTime(currentTime),
        horaFin: this.formatTime(currentTime + duration / 60),
        duracionMinutos: duration,
        descripcionPersonalizada: this.generateDescription(place, profile),
        tipLocal: this.generateLocalTip(place, profile),
        porQueAqui: this.generateWhyHere(place, profile),
        queHacer: this.generateActivities(place),
        costoEstimado: this.estimateCost(place, profile.budget),
        tiempoTraslado: i > 0 ? 20 : 0,
        categoria: place.categories?.[0] || 'general'
      });
      
      currentTime += (duration / 60) + 0.5; // Agregar tiempo de traslado
      
      // Para familias, terminar el día más temprano
      if (profile.tripType === 'familia' && currentTime >= 18) {
        break;
      }
    }
    
    return stops;
  }

  // Métodos auxiliares

  private formatTime(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private getDurationForPlace(place: PlaceData, profile: any): number {
    const baseDuration = place.categories?.includes('beach') ? 180 :
                         place.categories?.includes('museum') ? 120 :
                         place.categories?.includes('restaurant') ? 90 :
                         90;
    
    if (profile.preferredPace === 'relaxed') {
      return baseDuration * 1.3;
    } else if (profile.preferredPace === 'intensive') {
      return baseDuration * 0.8;
    }
    
    return baseDuration;
  }

  private generateDescription(place: PlaceData, profile: any): string {
    if (profile.tripType === 'familia') {
      return `Experiencia familiar en ${place.name}. Lugar seguro y cómodo para todas las edades.`;
    } else if (profile.tripType === 'pareja') {
      return `Momento especial para compartir en ${place.name}. Ambiente perfecto para parejas.`;
    }
    return `Descubre ${place.name}, uno de los mejores lugares del Atlántico.`;
  }

  private generateLocalTip(place: PlaceData, profile: any): string {
    const tips: Record<string, string[]> = {
      'beach': [
        'Llega temprano para conseguir buena sombra',
        'Lleva protector solar factor 50+',
        'Los vendedores locales tienen precios negociables'
      ],
      'museum': [
        'Los martes hay descuentos para locales',
        'Pregunta por las visitas guiadas gratuitas',
        'La tienda del museo tiene souvenirs únicos'
      ],
      'restaurant': [
        'Prueba el menú del día para mejor precio',
        'Pregunta por las especialidades de la casa',
        'Reserva si vas en fin de semana'
      ]
    };
    
    const category = place.categories?.[0] || 'general';
    const categoryTips = tips[category] || ['Disfruta la experiencia'];
    
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
  }

  private generateWhyHere(place: PlaceData, profile: any): string {
    const interests = profile.interests.join(', ');
    return `Seleccionado especialmente por tu interés en ${interests}. ${
      place.rating && place.rating >= 4.5 ? 'Altamente recomendado por visitantes.' : 
      'Experiencia auténtica local.'
    }`;
  }

  private generateActivities(place: PlaceData): string[] {
    const activities: Record<string, string[]> = {
      'beach': ['Nadar', 'Tomar el sol', 'Caminar por la orilla'],
      'museum': ['Recorrido guiado', 'Ver exposiciones', 'Tomar fotos'],
      'restaurant': ['Probar especialidades', 'Disfrutar el ambiente'],
      'park': ['Caminar', 'Descansar a la sombra', 'Observar aves']
    };
    
    const category = place.categories?.[0] || 'general';
    return activities[category] || ['Explorar', 'Tomar fotos', 'Disfrutar'];
  }

  private estimateCost(place: PlaceData, budget: string): number {
    const baseCost = place.priceLevel ? place.priceLevel * 20000 : 0;
    const multipliers: Record<string, number> = {
      'economico': 0.7,
      'moderado': 1.0,
      'premium': 1.5
    };
    return Math.round(baseCost * (multipliers[budget] || 1.0));
  }

  // src/lib/geminiItineraryEnhancer.ts (continuación)

 private getLunchCost(budget: string): number {
    const costs = {
      'economico': 15000,
      'moderado': 35000,
      'premium': 80000
    };
    return costs[budget as keyof typeof costs] || 35000;
  }
 
  private generateDayTitle(day: number, profile: any): string {
    const titles = [
      'Descubriendo',
      'Explorando',
      'Disfrutando',
      'Viviendo',
      'Experimentando'
    ];
    
    const title = titles[(day - 1) % titles.length];
    const focus = profile.interests?.[0] || 'el Atlántico';
    
    return `${title} ${focus}`;
  }
 
  private generateDayTheme(places: PlaceData[], profile: any): string {
    if (places.some(p => p.categories?.includes('beach'))) {
      return profile.tripType === 'familia' ? 'Día familiar de playa' : 'Día de playa y relax';
    }
    if (places.some(p => p.categories?.includes('museum'))) {
      return 'Inmersión cultural';
    }
    if (places.some(p => p.categories?.includes('restaurant'))) {
      return 'Experiencia gastronómica';
    }
    return 'Aventura y exploración';
  }
 
  /**
   * Enriquecer con conocimiento local (sin usar Gemini si no está disponible)
   */
  async enrichWithLocalKnowledge(
    itinerary: EnhancedItinerary,
    profile: any
  ): Promise<EnhancedItinerary> {
    if (!this.isAvailable || !this.model) {
      // Sin Gemini, aplicar enriquecimiento local básico
      return this.applyLocalEnrichment(itinerary, profile);
    }
 
    const prompt = `
 Como experto local del Atlántico, enriquece estos lugares con información ESPECÍFICA:
 
 ${JSON.stringify(itinerary.dias.map(d => d.paradas.map(p => p.nombre)), null, 2)}
 
 Para cada lugar proporciona:
 1. El mejor día/hora para visitarlo
 2. Qué ordenar/comprar específicamente
 3. Dónde tomarse la mejor foto
 4. Cómo ahorrar dinero
 5. Dato curioso o histórico
 
 IMPORTANTE: Solo información REAL y VERIFICADA. No inventes datos.
 
 Formato JSON:
 {
  "enriquecimiento": {
    "[nombre_lugar]": {
      "mejorMomento": "texto",
      "queOrdenar": ["item1", "item2"],
      "spotFoto": "descripción exacta",
      "trucoAhorro": "texto",
      "datoCurioso": "texto"
    }
  }
 }
 `;
 
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer JSON
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      const enrichmentData = JSON.parse(jsonText);
      return this.applyEnrichment(itinerary, enrichmentData);
    } catch (error) {
      console.error('Error enriqueciendo con conocimiento local:', error);
      return this.applyLocalEnrichment(itinerary, profile);
    }
  }
 
  /**
   * Aplicar enriquecimiento local sin IA
   */
  private applyLocalEnrichment(
    itinerary: EnhancedItinerary,
    profile: any
  ): EnhancedItinerary {
    const localKnowledge: Record<string, any> = {
      'Museo del Caribe': {
        mejorMomento: 'Martes a viernes 10:00 AM (menos gente)',
        queOrdenar: ['Audio guía', 'Combo entrada + bebida'],
        spotFoto: 'Terraza del tercer piso con vista a la ciudad',
        trucoAhorro: 'Entrada gratis el último domingo del mes',
        datoCurioso: 'Tiene la colección más grande de Gabriel García Márquez'
      },
      'Gran Malecón del Río': {
        mejorMomento: 'Atardecer 5:30-6:30 PM',
        queOrdenar: ['Raspao de kola', 'Arepa e huevo'],
        spotFoto: 'Letras gigantes de BARRANQUILLA al inicio',
        trucoAhorro: 'Estacionamiento gratis después de las 6 PM',
        datoCurioso: 'Es el malecón fluvial más largo de Colombia'
      },
      'Playa Pradomar': {
        mejorMomento: 'Mañana 8:00-11:00 AM (sol suave)',
        queOrdenar: ['Ceviche de camarón', 'Agua de coco'],
        spotFoto: 'Muelle al final de la playa durante sunset',
        trucoAhorro: 'Carpas más baratas si negocias directo con dueños',
        datoCurioso: 'Aquí se filmaron escenas de novelas colombianas'
      },
      'Mercado de Bazurto': {
        mejorMomento: 'Sábado 8:00-10:00 AM (más fresco)',
        queOrdenar: ['Jugo de corozo', 'Butifarra'],
        spotFoto: 'Pasillo de frutas tropicales coloridas',
        trucoAhorro: 'Compra al por mayor y divide con amigos',
        datoCurioso: 'Es el mercado más antiguo de Barranquilla'
      }
    };
 
    const enriched = { ...itinerary };
    
    for (const dia of enriched.dias) {
      for (const parada of dia.paradas) {
        const knowledge = localKnowledge[parada.nombre];
        if (knowledge) {
          parada.tipLocal = `${parada.tipLocal}. ${knowledge.mejorMomento}. ${knowledge.trucoAhorro}`;
          if (knowledge.queOrdenar && knowledge.queOrdenar.length > 0) {
            parada.queHacer = [
              ...parada.queHacer,
              ...knowledge.queOrdenar.map((item: string) => `Probar: ${item}`)
            ];
          }
        }
      }
    }
    
    return enriched;
  }
 
  /**
   * Aplicar datos de enriquecimiento al itinerario
   */
  private applyEnrichment(
    itinerary: EnhancedItinerary,
    enrichmentData: any
  ): EnhancedItinerary {
    const enriched = { ...itinerary };
    
    for (const dia of enriched.dias) {
      for (const parada of dia.paradas) {
        const enrichment = enrichmentData.enriquecimiento?.[parada.nombre];
        if (enrichment) {
          // Mejorar el tip local con información específica
          parada.tipLocal = `${parada.tipLocal}. ${enrichment.mejorMomento || ''}. ${enrichment.trucoAhorro || ''}`.trim();
          
          // Agregar qué ordenar/comprar
          if (enrichment.queOrdenar && enrichment.queOrdenar.length > 0) {
            parada.queHacer = [
              ...parada.queHacer,
              ...enrichment.queOrdenar.map((item: string) => `Recomendado: ${item}`)
            ];
          }
          
          // Agregar spot de foto si existe
          if (enrichment.spotFoto) {
            parada.queHacer.push(`📸 Mejor foto: ${enrichment.spotFoto}`);
          }
          
          // Agregar dato curioso si existe
          if (enrichment.datoCurioso) {
            parada.descripcionPersonalizada += ` Dato curioso: ${enrichment.datoCurioso}`;
          }
        }
      }
    }
    
    return enriched;
  }
 }
 
 export default GeminiItineraryEnhancer;