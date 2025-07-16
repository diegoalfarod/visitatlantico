// ============================================
// MEJORAS INMEDIATAS PARA src/pages/api/chat.ts
// ============================================

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { dbAdmin } from "@/lib/firebaseAdmin";
import Redis from "ioredis";
import { franc } from "franc-min";
import { randomUUID } from "crypto";

async function loadAvailableData() {
  // TODO: trae datos reales (lugares, eventos, etc.) desde Firestore,
  // Redis, APIs externas, etc. Por ahora devuelve un objeto vacío
  return {};
}
// ====== NUEVOS TIPOS MEJORADOS ======
interface EnhancedConversationContext {
  // Perfil del viajero
  travelerProfile: {
    name?: string;
    origin?: string;
    language: "es" | "en" | "mixed";
    previousVisits: string[];
    travelStyle?: "aventurero" | "relajado" | "cultural" | "familiar" | "negocios";
    dietaryRestrictions?: string[];
    accessibility?: string[];
  };
  
  // Información del viaje
  currentTrip: {
    budget: "economico" | "medio" | "alto";
    interests: string[];
    travelDates?: { checkIn: string; checkOut: string };
    groupSize: number;
    groupComposition?: "familia" | "amigos" | "pareja" | "solo" | "negocios";
    transportation?: "carro" | "publico" | "tour" | "uber";
    accommodation?: string;
  };
  
  // Estado actual
  currentState: {
    location?: { lat: number; lng: number; name: string };
    weather?: {
      temp: number;
      condition: string;
      forecast: string;
    };
    timeOfDay: "madrugada" | "mañana" | "mediodia" | "tarde" | "noche";
    lastActivityTime?: Date;
    mood?: "explorando" | "descansando" | "planificando" | "urgente";
  };
  
  // Historial conversacional
  conversationHistory: {
    topics: string[];
    recommendations: Array<{
      id: string;
      type: string;
      name: string;
      timestamp: number;
      feedback?: "liked" | "disliked" | "visited";
    }>;
    questionsAsked: string[];
    lastMessageTime: number;
    messageCount: number;
    sentiment: "positivo" | "neutral" | "frustrado" | "emocionado";
  };
}

// ====== SISTEMA DE DETECCIÓN DE INTENCIONES MÚLTIPLES ======
class IntentDetector {
  private patterns = {
    accommodation: {
      es: /hotel|hospedaje|dormir|alojamiento|airbnb|hostal|quedarse|habitación/i,
      en: /hotel|accommodation|stay|lodging|airbnb|hostel|room|sleep/i
    },
    food: {
      es: /comer|restaurante|comida|almorzar|cenar|desayunar|típico|hambre|antojo|bebida/i,
      en: /eat|restaurant|food|lunch|dinner|breakfast|typical|hungry|craving|drink/i
    },
    activities: {
      es: /hacer|visitar|actividad|tour|excursión|planes|diversión|entretenimiento/i,
      en: /do|visit|activity|tour|excursion|plans|fun|entertainment/i
    },
    transport: {
      es: /llegar|transporte|taxi|uber|bus|carro|ruta|mover|traslado/i,
      en: /get|transport|taxi|uber|bus|car|route|move|transfer/i
    },
    weather: {
      es: /clima|lluvia|sol|tiempo|pronóstico|calor|frío/i,
      en: /weather|rain|sun|forecast|hot|cold|climate/i
    },
    emergency: {
      es: /emergencia|hospital|policía|ayuda|urgente|médico|farmacia/i,
      en: /emergency|hospital|police|help|urgent|doctor|pharmacy/i
    },
    budget: {
      es: /precio|costo|cuánto|barato|económico|gratis|caro|presupuesto/i,
      en: /price|cost|how much|cheap|economical|free|expensive|budget/i
    },
    culture: {
      es: /cultura|historia|museo|patrimonio|tradición|carnaval|festival/i,
      en: /culture|history|museum|heritage|tradition|carnival|festival/i
    },
    beach: {
      es: /playa|mar|sol|arena|bronceado|nadar|costa/i,
      en: /beach|sea|sun|sand|tan|swim|coast/i
    },
    nightlife: {
      es: /noche|fiesta|bar|discoteca|rumba|salir|bailar/i,
      en: /night|party|bar|club|nightlife|go out|dance/i
    }
  };

  detectIntents(message: string, language: "es" | "en" | "mixed"): Array<{type: string, confidence: number}> {
    const intents: Array<{type: string, confidence: number}> = [];
    const lowerMessage = message.toLowerCase();
    
    Object.entries(this.patterns).forEach(([intent, patterns]) => {
      let matches = 0;
      let totalPatterns = 0;
      
      // Verificar ambos idiomas si es mixed
      if (language === "mixed" || language === "es") {
        if (patterns.es.test(lowerMessage)) matches++;
        totalPatterns++;
      }
      
      if (language === "mixed" || language === "en") {
        if (patterns.en.test(lowerMessage)) matches++;
        totalPatterns++;
      }
      
      if (matches > 0) {
        const confidence = matches / totalPatterns;
        intents.push({ type: intent, confidence });
      }
    });
    
    return intents.sort((a, b) => b.confidence - a.confidence);
  }
}

// ====== GENERADOR DE RESPUESTAS NATURALES ======
class NaturalResponseGenerator {
  private greetings = {
    madrugada: {
      es: [
        "¡Wow, qué madrugador! 🌙 ¿No puedes dormir o ya empezó la aventura?",
        "¡A estas horas! 😮 El Atlántico nunca duerme, ¿en qué te ayudo?",
        "¡Trasnochando o madrugando! 🦉 ¿Qué planes tienes en mente?"
      ],
      en: [
        "Wow, early bird! 🌙 Can't sleep or already starting the adventure?",
        "At this hour! 😮 The Atlantic never sleeps, how can I help?",
        "Night owl or early riser! 🦉 What plans do you have in mind?"
      ]
    },
    mañana: {
      es: [
        "¡Buenos días! ☀️ El Atlántico amanece hermoso hoy",
        "¡Qué bella mañana! 🌅 ¿Listo para explorar?",
        "¡Buenos días! El café costeño ya está listo ☕"
      ],
      en: [
        "Good morning! ☀️ The Atlantic looks beautiful today",
        "What a lovely morning! 🌅 Ready to explore?",
        "Good morning! The coastal coffee is ready ☕"
      ]
    },
    mediodia: {
      es: [
        "¡Hola! 🌞 Justo a tiempo para el almuerzo costeño",
        "¡Qué calorcito! 🔥 Perfecto para una cerveza fría",
        "¡Buenas! El sol está en su punto máximo 😎"
      ],
      en: [
        "Hello! 🌞 Just in time for coastal lunch",
        "It's getting hot! 🔥 Perfect for a cold beer",
        "Hi there! The sun is at its peak 😎"
      ]
    },
    tarde: {
      es: [
        "¡Buenas tardes! 🌅 La hora perfecta para pasear",
        "¡Hola! La brisa de la tarde ya empezó 🌴",
        "¡Qué tal! Los atardeceres aquí son espectaculares 🌇"
      ],
      en: [
        "Good afternoon! 🌅 Perfect time for a walk",
        "Hello! The afternoon breeze has started 🌴",
        "Hi! The sunsets here are spectacular 🌇"
      ]
    },
    noche: {
      es: [
        "¡Buenas noches! 🌃 ¿Listos para la rumba atlanticense?",
        "¡La noche es joven! 💃 ¿Qué aventura buscas?",
        "¡Hola! La vida nocturna aquí es única 🎉"
      ],
      en: [
        "Good evening! 🌃 Ready for Atlantic nightlife?",
        "The night is young! 💃 What adventure are you looking for?",
        "Hello! The nightlife here is unique 🎉"
      ]
    }
  };

  private transitions = {
    es: [
      "Por cierto,", "Ah, también", "Casi lo olvido,", "Además,", 
      "Un dato curioso:", "Entre nos,", "¿Sabías que", "Mira,"
    ],
    en: [
      "By the way,", "Oh, also", "Almost forgot,", "Additionally,",
      "Fun fact:", "Between us,", "Did you know", "Look,"
    ]
  };

  getGreeting(timeOfDay: string, language: "es" | "en"): string {
    const options = this.greetings[timeOfDay]?.[language] || this.greetings.mañana[language];
    return options[Math.floor(Math.random() * options.length)];
  }

  getTransition(language: "es" | "en"): string {
    const options = this.transitions[language];
    return options[Math.floor(Math.random() * options.length)];
  }

  generateContextualResponse(
    intents: Array<{type: string, confidence: number}>,
    context: EnhancedConversationContext
  ): string {
    const lang = context.travelerProfile.language === "en" ? "en" : "es";
    const responses = [];
    
    // Saludo contextual si es la primera interacción del día
    if (this.isFirstInteractionToday(context)) {
      responses.push(this.getGreeting(context.currentState.timeOfDay, lang));
    }
    
    // Respuesta principal basada en intents
    if (intents.length > 1) {
      // Múltiples intenciones detectadas
      responses.push(
        lang === "es" 
          ? "¡Veo que tienes varias cosas en mente! Te ayudo con todo:"
          : "I see you have several things in mind! Let me help with everything:"
      );
    }
    
    // Agregar información del clima si es relevante
    if (context.currentState.weather && this.shouldMentionWeather(intents, context)) {
      const weatherComment = this.getWeatherComment(context.currentState.weather, lang);
      responses.push(`${this.getTransition(lang)} ${weatherComment}`);
    }
    
    return responses.join(" ");
  }

  private isFirstInteractionToday(context: EnhancedConversationContext): boolean {
    const lastMessage = context.conversationHistory.lastMessageTime;
    const now = Date.now();
    const lastDate = new Date(lastMessage);
    const nowDate = new Date(now);
    
    return lastDate.toDateString() !== nowDate.toDateString();
  }

  private shouldMentionWeather(intents: Array<{type: string}>, context: EnhancedConversationContext): boolean {
    // Mencionar clima si: hay intención de actividades, playa, o si el clima es extremo
    const relevantIntents = ['activities', 'beach', 'transport'];
    const hasRelevantIntent = intents.some(i => relevantIntents.includes(i.type));
    const extremeWeather = context.currentState.weather?.condition === 'lluvia fuerte' || 
                          context.currentState.weather?.temp > 35;
    
    return hasRelevantIntent || extremeWeather;
  }

  private getWeatherComment(weather: any, language: "es" | "en"): string {
    if (weather.condition === 'lluvia') {
      return language === "es" 
        ? "está lloviendo, así que te sugiero actividades bajo techo"
        : "it's raining, so I'll suggest indoor activities";
    }
    
    if (weather.temp > 32) {
      return language === "es"
        ? `hace bastante calor (${weather.temp}°C), perfecto para la playa o lugares con aire acondicionado`
        : `it's quite hot (${weather.temp}°C), perfect for the beach or air-conditioned places`;
    }
    
    return language === "es"
      ? "el clima está perfecto para explorar"
      : "the weather is perfect for exploring";
  }
}

// ====== SISTEMA DE RECOMENDACIONES CONTEXTUALES ======
class SmartRecommendationEngine {
  async getPersonalizedRecommendations(
    intents: Array<{type: string, confidence: number}>,
    context: EnhancedConversationContext,
    availableData: any
  ) {
    const recommendations = [];
    
    // Priorizar por hora del día
    const timeBasedRecs = await this.getTimeBasedRecommendations(context);
    recommendations.push(...timeBasedRecs);
    
    // Filtrar por presupuesto
    const budgetFiltered = this.filterByBudget(recommendations, context.currentTrip.budget);
    
    // Considerar historial para evitar repeticiones
    const nonRepeated = this.filterRecentRecommendations(
      budgetFiltered, 
      context.conversationHistory.recommendations
    );
    
    // Agregar información de distancia si hay ubicación
    if (context.currentState.location) {
      return this.addDistanceInfo(nonRepeated, context.currentState.location);
    }
    
    return nonRepeated;
  }

  private async getTimeBasedRecommendations(context: EnhancedConversationContext) {
    const { timeOfDay } = context.currentState;
    const recommendations = [];
    
    switch(timeOfDay) {
      case 'mañana':
        recommendations.push({
          type: 'breakfast',
          priority: 1,
          reason: 'morning_time'
        });
        recommendations.push({
          type: 'morning_activity',
          priority: 2,
          reason: 'good_weather_time'
        });
        break;
        
      case 'mediodia':
        recommendations.push({
          type: 'lunch',
          priority: 1,
          reason: 'lunch_time'
        });
        recommendations.push({
          type: 'indoor_activity',
          priority: 2,
          reason: 'hot_weather'
        });
        break;
        
      case 'tarde':
        recommendations.push({
          type: 'beach',
          priority: 1,
          reason: 'sunset_time'
        });
        recommendations.push({
          type: 'outdoor_activity',
          priority: 2,
          reason: 'cooler_weather'
        });
        break;
        
      case 'noche':
        recommendations.push({
          type: 'dinner',
          priority: 1,
          reason: 'dinner_time'
        });
        recommendations.push({
          type: 'nightlife',
          priority: 2,
          reason: 'party_time'
        });
        break;
    }
    
    return recommendations;
  }

  private filterByBudget(items: any[], budget: string) {
    const budgetMap = {
      'economico': { min: 0, max: 2 },
      'medio': { min: 1, max: 3 },
      'alto': { min: 2, max: 4 }
    };
    
    const range = budgetMap[budget] || budgetMap.medio;
    
    return items.filter(item => {
      if (!item.price_level) return true;
      return item.price_level >= range.min && item.price_level <= range.max;
    });
  }

  private filterRecentRecommendations(items: any[], history: any[]) {
    const recentIds = new Set(
      history
        .filter(h => Date.now() - h.timestamp < 86400000) // últimas 24h
        .map(h => h.id)
    );
    
    return items.filter(item => !recentIds.has(item.id));
  }

  private async addDistanceInfo(items: any[], userLocation: any) {
    // Aquí calcularías distancias reales con Google Maps API
    return items.map(item => ({
      ...item,
      distance: this.calculateDistance(userLocation, item.location),
      walkingTime: this.estimateWalkingTime(userLocation, item.location),
      transportOptions: this.getTransportOptions(userLocation, item.location)
    }));
  }

  private calculateDistance(from: any, to: any): number {
    // Implementación simplificada - usar Google Maps Distance Matrix API en producción
    return Math.random() * 10; // km
  }

  private estimateWalkingTime(from: any, to: any): number {
    const distance = this.calculateDistance(from, to);
    return Math.round(distance * 12); // minutos (estimado)
  }

  private getTransportOptions(from: any, to: any): any[] {
    return [
      { type: 'walking', time: this.estimateWalkingTime(from, to), cost: 0 },
      { type: 'taxi', time: Math.round(this.calculateDistance(from, to) * 3), cost: this.calculateDistance(from, to) * 5000 },
      { type: 'uber', time: Math.round(this.calculateDistance(from, to) * 3), cost: this.calculateDistance(from, to) * 4000 }
    ];
  }
}

// ====== FUNCIÓN PRINCIPAL MEJORADA ======
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const { messages, conversationId: providedId, userId } = req.body;
    const conversationId = providedId || randomUUID();
    
    // Inicializar sistemas
    const intentDetector = new IntentDetector();
    const responseGenerator = new NaturalResponseGenerator();
    const recommendationEngine = new SmartRecommendationEngine();
    
    // Cargar contexto completo
    const context = await loadEnhancedContext(conversationId, userId, messages);
    
    // Detectar intenciones múltiples
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    const intents = intentDetector.detectIntents(
      lastUserMessage, 
      context.travelerProfile.language
    );
    
    // Generar respuesta base contextual
    const baseResponse = responseGenerator.generateContextualResponse(intents, context);
    
    // Obtener recomendaciones personalizadas
    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      intents,
      context,
      await loadAvailableData()
    );
    
    // Construir prompt dinámico
    const dynamicPrompt = buildEnhancedPrompt(context, intents, recommendations, baseResponse);
    
    // Llamada a OpenAI con el prompt mejorado
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: dynamicPrompt },
        ...messages.map(m => ({ 
          role: m.role as any, 
          content: m.content || "" 
        }))
      ],
      functions: getEnhancedFunctions(),
      temperature: 0.85, // Un poco más creativo
      presence_penalty: 0.6, // Más variedad
      frequency_penalty: 0.3,
      max_tokens: 1000
    });

    // Procesar respuesta y ejecutar acciones
    const result = await processEnhancedResponse(
      completion,
      context,
      intents,
      recommendations
    );
    
    // Actualizar contexto
    await saveEnhancedContext(conversationId, userId, context, result);
    
    // Analíticas
    await trackInteraction(userId, intents, result, context);
    
    return res.status(200).json({
      reply: result.reply,
      cards: result.cards,
      context: sanitizeContextForClient(context),
      suggestions: result.suggestions,
      conversationId
    });
    
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      reply: {
        role: "assistant",
        content: "¡Ups! Parece que tuve un pequeño problema técnico 😅 ¿Podrías intentar de nuevo?"
      }
    });
  }
}

// ====== FUNCIONES AUXILIARES ======
async function loadEnhancedContext(
  conversationId: string, 
  userId?: string, 
  messages?: any[]
): Promise<EnhancedConversationContext> {
  // Cargar de Firebase
  const doc = await dbAdmin.collection("conversations").doc(conversationId).get();
  const savedContext = doc.exists ? doc.data() : {};
  
  // Determinar hora del día
  const hour = new Date().getHours();
  const timeOfDay = hour < 5 ? "madrugada" :
                   hour < 12 ? "mañana" :
                   hour < 14 ? "mediodia" :
                   hour < 19 ? "tarde" : "noche";
  
  // Detectar idioma principal
  const allText = messages?.map(m => m.content).join(" ") || "";
  const primaryLang = detectPrimaryLanguage(allText);
  
  return {
    travelerProfile: {
      language: primaryLang,
      previousVisits: savedContext.previousVisits || [],
      travelStyle: savedContext.travelStyle,
      ...savedContext.travelerProfile
    },
    currentTrip: {
      budget: savedContext.budget || "medio",
      interests: savedContext.interests || [],
      groupSize: savedContext.groupSize || 1,
      ...savedContext.currentTrip
    },
    currentState: {
      timeOfDay,
      weather: await getWeatherData(),
      location: savedContext.location,
      ...savedContext.currentState
    },
    conversationHistory: {
      topics: savedContext.topics || [],
      recommendations: savedContext.recommendations || [],
      questionsAsked: savedContext.questionsAsked || [],
      lastMessageTime: Date.now(),
      messageCount: (savedContext.messageCount || 0) + 1,
      sentiment: analyzeSentiment(messages)
    }
  };
}

function detectPrimaryLanguage(text: string): "es" | "en" | "mixed" {
  const spanishWords = (text.match(/[áéíóúñ¿¡]/g) || []).length;
  const englishWords = (text.match(/\b(the|is|are|have|has|will|can|could)\b/gi) || []).length;
  
  if (spanishWords > 0 && englishWords > 0) return "mixed";
  if (englishWords > spanishWords) return "en";
  return "es";
}

function analyzeSentiment(messages: any[]): "positivo" | "neutral" | "frustrado" | "emocionado" {
  const lastMessages = messages.slice(-3).map(m => m.content?.toLowerCase() || "");
  const allText = lastMessages.join(" ");
  
  if (/no entiendo|no sirve|mal|horrible|pésimo/i.test(allText)) return "frustrado";
  if (/genial|excelente|increíble|wow|emocionado|❤️|🎉|😍/i.test(allText)) return "emocionado";
  if (/gracias|bien|ok|bueno/i.test(allText)) return "positivo";
  
  return "neutral";
}

async function getWeatherData() {
  // Implementar llamada real a API del clima
  // Por ahora retornar datos simulados
  return {
    temp: 28 + Math.round(Math.random() * 6),
    condition: Math.random() > 0.7 ? "lluvia" : "soleado",
    forecast: "parcialmente nublado"
  };
}

function buildEnhancedPrompt(
  context: EnhancedConversationContext,
  intents: Array<{type: string, confidence: number}>,
  recommendations: any[],
  baseResponse: string
): string {
  const lang = context.travelerProfile.language;
  const sentiment = context.conversationHistory.sentiment;
  
  return `
Eres Jimmy 🌴, el guía turístico más querido del Atlántico, Colombia.

CONTEXTO ACTUAL:
- Hora: ${context.currentState.timeOfDay} (${new Date().toLocaleTimeString()})
- Clima: ${context.currentState.weather?.temp}°C, ${context.currentState.weather?.condition}
- Ubicación usuario: ${context.currentState.location?.name || "no especificada"}
- Idioma detectado: ${lang} ${lang === "mixed" ? "(responde mezclando naturalmente)" : ""}
- Sentimiento: ${sentiment}
- Mensaje #${context.conversationHistory.messageCount} de la conversación

PERFIL DEL VIAJERO:
- Estilo: ${context.travelerProfile.travelStyle || "no definido"}
- Presupuesto: ${context.currentTrip.budget}
- Intereses: ${context.currentTrip.interests.join(", ") || "por descubrir"}
- Grupo: ${context.currentTrip.groupSize} ${context.currentTrip.groupComposition ? `(${context.currentTrip.groupComposition})` : ""}

INTENCIONES DETECTADAS:
${intents.map(i => `- ${i.type} (confianza: ${(i.confidence * 100).toFixed(0)}%)`).join("\n")}

HISTORIAL RECIENTE:
- Temas: ${context.conversationHistory.topics.slice(-3).join(", ")}
- Últimas recomendaciones: ${context.conversationHistory.recommendations.slice(-2).map(r => r.name).join(", ")}

INSTRUCCIONES DE PERSONALIDAD:
${sentiment === "frustrado" ? 
  "IMPORTANTE: El usuario parece frustrado. Sé más directo, claro y empático. Ofrece soluciones concretas inmediatamente." :
  sentiment === "emocionado" ?
  "El usuario está emocionado. Mantén esa energía positiva y sugiere experiencias memorables." :
  "Mantén un tono amigable y profesional, siendo útil y específico."
}

${context.currentState.timeOfDay === "madrugada" ?
  "Es muy tarde/temprano. Menciona esto de forma casual y considera que quizás busca algo 24 horas o para mañana." : ""
}

RESPUESTA BASE SUGERIDA:
"${baseResponse}"

REGLAS CONVERSACIONALES:
1. NUNCA uses las mismas frases de saludo ("¡Perfecto!", "¡Genial!")
2. Si ${intents.length > 1 ? "hay múltiples preguntas, responde a TODAS organizadamente" : "hay una pregunta, responde de forma completa"}
3. Incluye tips locales REALES que no se encuentran en Google
4. ${lang === "mixed" ? "Mezcla español e inglés naturalmente como lo hace el usuario" : `Responde solo en ${lang === "es" ? "español" : "inglés"}`}
5. Si mencionas lugares, incluye:
   - Distancia aproximada desde su ubicación (si la conoces)
   - Mejor hora para visitar
   - Tip de un local
6. Varía tu vocabulario y expresiones
7. Si detectas una emergencia o urgencia, prioriza ayuda inmediata

DATOS DISPONIBLES:
${recommendations.length > 0 ? `Recomendaciones personalizadas listas: ${recommendations.length}` : "Busca en las bases de datos disponibles"}

Responde de forma natural, útil y memorable. Eres un amigo local, no un bot.`;
}

function getEnhancedFunctions() {
  return [
    {
      name: "multi_search",
      description: "Search multiple categories at once (restaurants, hotels, activities)",
      parameters: {
        type: "object",
        properties: {
          searches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                query: { type: "string" },
                category: { 
                  type: "string", 
                  enum: ["lodging", "restaurant", "tourist_attraction", "night_club", "shopping_mall"] 
                },
                filters: {
                  type: "object",
                  properties: {
                    price_level: { type: "number" },
                    rating_min: { type: "number" },
                    open_now: { type: "boolean" }
                  }
                }
              }
            }
          },
          location: { type: "string" },
          radius: { type: "number", description: "Search radius in meters" }
        },
        required: ["searches"]
      }
    },
    {
      name: "get_directions",
      description: "Get directions and transport options between places",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string" },
          destination: { type: "string" },
          mode: { 
            type: "string", 
            enum: ["driving", "walking", "transit", "taxi"] 
          }
        },
        required: ["origin", "destination"]
      }
    },
    {
      name: "create_itinerary",
      description: "Create a personalized daily itinerary",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string" },
          preferences: {
            type: "object",
            properties: {
              start_time: { type: "string" },
              end_time: { type: "string" },
              must_include: { type: "array", items: { type: "string" } },
              avoid: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["date"]
      }
    },
    {
      name: "check_availability",
      description: "Check real-time availability (restaurants, tours, etc)",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
          date: { type: "string" },
          time: { type: "string" },
          party_size: { type: "number" }
        },
        required: ["place_id"]
      }
    }
  ];
}

async function processEnhancedResponse(
  completion: any,
  context: EnhancedConversationContext,
  intents: any[],
  recommendations: any[]
) {
  const message = completion.choices[0].message;
  const result: any = {
    reply: {
      role: "assistant",
      content: message.content || ""
    },
    cards: [],
    suggestions: []
  };
  
  // Procesar function calls
  if (message.function_call) {
    const funcName = message.function_call.name;
    const args = JSON.parse(message.function_call.arguments);
    
    switch(funcName) {
      case "multi_search":
        // Ejecutar búsquedas múltiples en paralelo
        const searches = await Promise.all(
          args.searches.map(search => 
            searchPlacesEnhanced(search.query, search.category, args.location, search.filters)
          )
        );
        result.cards = searches.flat().slice(0, 6); // Máximo 6 tarjetas
        break;
        
      case "get_directions":
        // Obtener direcciones
        const directions = await getDirections(args.origin, args.destination, args.mode);
        result.directions = directions;
        break;
        
      case "create_itinerary":
        // Crear itinerario
        const itinerary = await createItinerary(args.date, args.preferences, context);
        result.itinerary = itinerary;
        break;
    }
  }
  
  // Generar sugerencias proactivas
  result.suggestions = generateProactiveSuggestions(context, intents);
  
  return result;
}

async function searchPlacesEnhanced(
  query: string, 
  type: string, 
  location?: string,
  filters?: any
): Promise<any[]> {
  // Implementación mejorada con filtros
  const baseUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
  const params = new URLSearchParams({
    query: `${query} ${location || "Atlántico Colombia"}`,
    type,
    region: "co",
    language: "es",
    key: process.env.GOOGLE_PLACES_API_KEY || ""
  });
  
  if (filters?.open_now) params.append("opennow", "true");
  if (filters?.rating_min) params.append("minrating", filters.rating_min.toString());
  
  const response = await fetch(`${baseUrl}?${params}`);
  const data = await response.json();
  
  let places = data.results || [];
  
  // Aplicar filtros adicionales
  if (filters?.price_level !== undefined) {
    places = places.filter(p => p.price_level === filters.price_level);
  }
  
  // Enriquecer con información adicional
  return places.slice(0, 3).map(place => ({
    id: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity,
    rating: place.rating,
    price_level: place.price_level,
    photo: place.photos?.[0] 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      : undefined,
    place_id: place.place_id,
    type: "place",
    category: type === "lodging" ? "hotel" : type === "restaurant" ? "restaurant" : "attraction",
    // Nuevos campos
    user_ratings_total: place.user_ratings_total,
    opening_hours: place.opening_hours,
    pluscode: place.plus_code?.global_code,
    isOpen: place.opening_hours?.open_now
  }));
}

async function getDirections(origin: string, destination: string, mode: string) {
  // Implementar con Google Directions API
  return {
    distance: "5.2 km",
    duration: mode === "walking" ? "45 min" : "15 min",
    steps: ["Paso 1", "Paso 2"],
    fare: mode === "taxi" ? "$15,000 COP" : undefined
  };
}

async function createItinerary(date: string, preferences: any, context: EnhancedConversationContext) {
  // Generar itinerario inteligente
  return {
    date,
    activities: [
      { time: "9:00 AM", activity: "Desayuno en Café del Mar", duration: "1h" },
      { time: "10:30 AM", activity: "Visita al Castillo de Salgar", duration: "2h" },
      // ... más actividades
    ],
    totalCost: "$150,000 COP",
    notes: "Llevar protector solar y sombrero"
  };
}

function generateProactiveSuggestions(
  context: EnhancedConversationContext, 
  intents: any[]
): string[] {
  const suggestions = [];
  const lang = context.travelerProfile.language === "en" ? "en" : "es";
  
  // Sugerencias basadas en hora del día
  if (context.currentState.timeOfDay === "mediodia" && 
      !intents.some(i => i.type === "food")) {
    suggestions.push(
      lang === "es" 
        ? "🍽️ ¿Ya almorzaste? Conozco lugares con menú ejecutivo excelente"
        : "🍽️ Had lunch yet? I know great executive menu spots"
    );
  }
  
  // Sugerencias basadas en clima
  if (context.currentState.weather?.condition === "lluvia") {
    suggestions.push(
      lang === "es"
        ? "☔ ¿Necesitas planes bajo techo por la lluvia?"
        : "☔ Need indoor plans because of the rain?"
    );
  }
  
  // Sugerencias basadas en intereses no explorados
  const unexploredInterests = context.currentTrip.interests.filter(
    interest => !context.conversationHistory.topics.includes(interest)
  );
  
  if (unexploredInterests.length > 0) {
    const interest = unexploredInterests[0];
    suggestions.push(
      lang === "es"
        ? `🎯 ¿Te gustaría explorar opciones de ${interest}?`
        : `🎯 Would you like to explore ${interest} options?`
    );
  }
  
  return suggestions.slice(0, 3); // Máximo 3 sugerencias
}

async function saveEnhancedContext(
  conversationId: string,
  userId: string | undefined,
  context: EnhancedConversationContext,
  result: any
) {
  // Actualizar contexto con nueva información
  const updatedContext = {
    ...context,
    conversationHistory: {
      ...context.conversationHistory,
      topics: [...new Set([...context.conversationHistory.topics, ...extractTopics(result)])],
      recommendations: [
        ...context.conversationHistory.recommendations,
        ...result.cards.map(card => ({
          id: card.id,
          type: card.type,
          name: card.name,
          timestamp: Date.now()
        }))
      ].slice(-20), // Mantener últimas 20
      lastMessageTime: Date.now()
    }
  };
  
  // Guardar en Firebase
  await dbAdmin.collection("conversations").doc(conversationId).set(
    updatedContext,
    { merge: true }
  );
  
  // Si hay userId, actualizar perfil del usuario
  if (userId) {
    await dbAdmin.collection("userProfiles").doc(userId).set({
      lastConversation: conversationId,
      lastInteraction: new Date(),
      preferences: {
        language: context.travelerProfile.language,
        travelStyle: context.travelerProfile.travelStyle,
        commonInterests: context.currentTrip.interests
      }
    }, { merge: true });
  }
}

function extractTopics(result: any): string[] {
  const topics = [];
  
  if (result.cards.some(c => c.category === "restaurant")) topics.push("restaurantes");
  if (result.cards.some(c => c.category === "hotel")) topics.push("alojamiento");
  if (result.cards.some(c => c.category === "attraction")) topics.push("atracciones");
  if (result.directions) topics.push("transporte");
  if (result.itinerary) topics.push("itinerario");
  
  return topics;
}

function sanitizeContextForClient(context: EnhancedConversationContext) {
  // Retornar solo información necesaria para el cliente
  return {
    language: context.travelerProfile.language,
    budget: context.currentTrip.budget,
    interests: context.currentTrip.interests,
    location: context.currentState.location?.name,
    groupSize: context.currentTrip.groupSize,
    messageCount: context.conversationHistory.messageCount
  };
}

async function trackInteraction(
  userId: string | undefined,
  intents: any[],
  result: any,
  context: EnhancedConversationContext
) {
  // Guardar analíticas
  const analytics = {
    timestamp: new Date(),
    userId,
    intents: intents.map(i => i.type),
    responseTipe: result.cards.length > 0 ? "with_cards" : "text_only",
    sentiment: context.conversationHistory.sentiment,
    language: context.travelerProfile.language,
    timeOfDay: context.currentState.timeOfDay,
    messageCount: context.conversationHistory.messageCount,
    hasLocation: !!context.currentState.location,
    budget: context.currentTrip.budget
  };
  
  await dbAdmin.collection("analytics").add(analytics);
}