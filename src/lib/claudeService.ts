// src/lib/claudeService.ts
// Servicio de chat con Claude API para el asistente turístico Jimmy

import { CURATED_PLACES, type CuratedPlace } from "@/data/atlantico-places";

// =============================================================================
// TIPOS
// =============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  places?: Place[];
  language?: "es" | "en";
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  photo?: string;
  rating?: number;
  review_count?: number;
  price_level?: number;
  hours?: string;
  phone?: string;
  website?: string;
  local_tip?: string;
  coordinates?: { lat: number; lng: number };
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function detectLanguage(text: string): "es" | "en" {
  const spanishWords = /\b(hola|qué|cómo|dónde|cuándo|quiero|puedo|gracias|buenos|buenas|días|tardes|noches|por favor|ayuda|información|visitar|conocer|ir|ver|hacer|mejor|lugares|playa|museo|restaurante|hotel)\b/i;
  const englishWords = /\b(hello|hi|hey|what|where|when|how|want|can|could|please|help|information|visit|see|go|do|best|places|beach|museum|restaurant|hotel|thank|thanks)\b/i;
  
  const spanishMatches = (text.match(spanishWords) || []).length;
  const englishMatches = (text.match(englishWords) || []).length;
  
  return englishMatches > spanishMatches ? "en" : "es";
}

/**
 * Convierte un CuratedPlace al formato Place usado por el chat
 */
function curatedToPlace(place: CuratedPlace): Place {
  return {
    id: place.id,
    name: place.name,
    description: place.shortDescription,
    category: place.category,
    address: place.address,
    photo: place.primaryImage,
    rating: place.rating,
    review_count: place.reviewCount,
    price_level: place.priceRange === 'gratis' ? 0 : place.priceRange === 'economico' ? 1 : place.priceRange === 'moderado' ? 2 : 3,
    hours: `${place.schedule.opens} - ${place.schedule.closes}`,
    local_tip: place.localTip,
    coordinates: place.coordinates,
  };
}

/**
 * Busca lugares por sus IDs en CURATED_PLACES
 */
function getPlacesFromIds(ids: string[]): Place[] {
  return ids
    .map(id => {
      const place = CURATED_PLACES.find(p => p.id === id);
      if (!place) {
        console.warn(`Place not found: ${id}`);
        return null;
      }
      return curatedToPlace(place);
    })
    .filter((p): p is Place => p !== null);
}

/**
 * Busca lugares por categoría
 */
function getPlacesByCategory(category: string): CuratedPlace[] {
  return CURATED_PLACES.filter(p => p.category === category);
}

/**
 * Busca lugares family-friendly
 */
function getFamilyPlaces(): CuratedPlace[] {
  return CURATED_PLACES.filter(p => p.familyFriendly);
}

/**
 * Busca lugares románticos
 */
function getRomanticPlaces(): CuratedPlace[] {
  return CURATED_PLACES.filter(p => p.romanticSpot);
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatMessage> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Chat API error:", error);
      
      // Si falla la API, usar respuesta simulada
      if (response.status === 500) {
        console.log("Falling back to simulated response");
        return simulateResponse(messages);
      }
      
      throw new Error(error.error || "Error al conectar con el asistente");
    }

    const data = await response.json();
    
    // Obtener lugares si hay IDs
    const places = data.placeIds?.length > 0 
      ? getPlacesFromIds(data.placeIds) 
      : undefined;
    
    // Detectar idioma
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    const language = lastUserMessage ? detectLanguage(lastUserMessage.text) : "es";

    return {
      id: generateId(),
      role: "assistant",
      text: data.text,
      timestamp: Date.now(),
      places,
      language,
    };
  } catch (error) {
    console.error("Error calling chat API:", error);
    // Fallback a respuesta simulada
    return simulateResponse(messages);
  }
}

export function createUserMessage(text: string): ChatMessage {
  return {
    id: generateId(),
    role: "user",
    text: text.trim(),
    timestamp: Date.now(),
    language: detectLanguage(text),
  };
}

// =============================================================================
// SIMULATED RESPONSE (Development/Fallback Mode)
// Usa ÚNICAMENTE datos de CURATED_PLACES con funciones de búsqueda
// =============================================================================

function simulateResponse(messages: ChatMessage[]): ChatMessage {
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.text?.toLowerCase() || "";
  const isEnglish = detectLanguage(lastMessage?.text || "") === "en";
  const messageCount = messages.filter(m => m.role === "user").length;

  // Analizar el historial para saber qué ya sabemos del usuario
  const allUserMessages = messages.filter(m => m.role === "user").map(m => m.text.toLowerCase()).join(" ");

  const knowsFirstTime = /primera|first|nuevo|new/i.test(allUserMessages);
  const knowsWhoWith = /solo|pareja|familia|amigos|partner|family|friends|couple/i.test(allUserMessages);
  const knowsHowLong = /\d+\s*(día|dia|day|semana|week)/i.test(allUserMessages) || /hoy|today|weekend|fin de semana/i.test(allUserMessages);
  const knowsInterests = /playa|beach|cultura|culture|museo|museum|comida|food|comer|eat|rumba|party|noche|night|naturaleza|nature/i.test(allUserMessages);

  let responseText = "";
  let places: Place[] | undefined = undefined;

  // LÓGICA DE FLUJO CONVERSACIONAL

  // Paso 1: Si es saludo inicial
  if (messageCount === 1 && /hola|hi|hello|hey|buenos|buenas|qué tal|what's up/i.test(userText)) {
    responseText = isEnglish
      ? "Hey there! 👋<br/><br/>First time in Barranquilla, or have you been here before?"
      : "¡Ey, qué más! 👋<br/><br/>¿Primera vez por Barranquilla o ya conoces la Arenosa?";
  }
  // Paso 2: Si responde sobre primera vez pero no sabemos con quién viaja
  else if (!knowsWhoWith && (knowsFirstTime || /primera|first|sí|si|yes|yeah|nuevo|new|no he|haven't|nunca|never/i.test(userText))) {
    responseText = isEnglish
      ? "Nice! So tell me, are you traveling solo, with a partner, family, or friends?"
      : "¡Qué bueno! Y cuéntame, ¿vienes solo, en pareja, con familia o con amigos?";
  }
  // Paso 3: Si sabemos con quién pero no cuánto tiempo
  else if (knowsWhoWith && !knowsHowLong) {
    responseText = isEnglish
      ? "Cool. And how many days do you have here?"
      : "Bacano. ¿Y cuántos días tienes por acá?";
  }
  // Paso 4: Si sabemos tiempo pero no intereses
  else if (knowsHowLong && !knowsInterests) {
    responseText = isEnglish
      ? "Perfect. So what are you most into?<br/><br/>• 🏖️ Beach & nature<br/>• 🎭 Culture & history<br/>• 🍽️ Local food<br/>• 🎉 Nightlife & parties"
      : "Perfecto. Y dime, ¿qué te llama más?<br/><br/>• 🏖️ Playa y naturaleza<br/>• 🎭 Cultura e historia<br/>• 🍽️ Gastronomía local<br/>• 🎉 Rumba y vida nocturna";
  }
  // Paso 5: Si ya sabemos intereses → AHORA SÍ recomendar usando funciones de búsqueda
  else if (knowsInterests || messageCount >= 4) {

    // PLAYAS - Usa getPlacesByCategory
    if (/playa|beach|mar|costa|nadar|swim/i.test(userText)) {
      const beachPlaces = getPlacesByCategory('playa');
      const beach = beachPlaces.find(p => p.featured) || beachPlaces[0];
      const castle = CURATED_PLACES.find(p => p.id === 'castillo-salgar');

      responseText = isEnglish
        ? `Beach time! 🌊<br/><br/>For you I'd recommend <strong>${beach?.name}</strong> in ${beach?.municipality} - it's 20 minutes from Barranquilla, has a nice vibe, beachfront restaurants, and calm waters.<br/><br/>If you want something quieter, <strong>${castle?.name || 'Castillo de Salgar'}</strong> has an amazing sunset view.`
        : `¡Dale, playa! 🌊<br/><br/>Te recomiendo <strong>${beach?.name}</strong> en ${beach?.municipality} - está a 20 minutos de Barranquilla, tiene buen ambiente, restaurantes en la arena, y el agua es tranquila.<br/><br/>Si quieres algo más tranquilo, el <strong>${castle?.name || 'Castillo de Salgar'}</strong> tiene una vista espectacular al atardecer.`;

      places = [];
      if (beach) places.push(curatedToPlace(beach));
      if (castle) places.push(curatedToPlace(castle));
    }
    // CULTURA - Usa getPlacesByCategory
    else if (/cultura|culture|museo|museum|historia|history|carnaval|carnival/i.test(userText)) {
      const museos = getPlacesByCategory('museo');
      const museo = museos.find(p => p.id === 'museo-del-caribe') || museos[0];
      const casaCarnaval = museos.find(p => p.id === 'casa-del-carnaval');

      responseText = isEnglish
        ? `Culture! Love it 🎭<br/><br/>The <strong>${museo?.name}</strong> is a must - super interactive, you'll really get what being from the coast is all about. Give it about 2 hours.<br/><br/>And the <strong>${casaCarnaval?.name || 'Casa del Carnaval'}</strong> is amazing for understanding our biggest celebration.`
        : `¡Cultura! Me gusta 🎭<br/><br/>El <strong>${museo?.name}</strong> es imperdible - todo interactivo, vas a entender qué es ser costeño. Dedícale unas 2 horas.<br/><br/>Y la <strong>${casaCarnaval?.name || 'Casa del Carnaval'}</strong> es una chimba para entender nuestra fiesta más grande.`;

      places = [];
      if (museo) places.push(curatedToPlace(museo));
      if (casaCarnaval) places.push(curatedToPlace(casaCarnaval));
    }
    // COMIDA - Usa getPlacesByCategory
    else if (/comida|food|comer|eat|restaurante|restaurant|hambre|hungry|gastronom/i.test(userText)) {
      const restaurantes = getPlacesByCategory('restaurante');
      const narcobollo = restaurantes.find(p => p.id === 'narcobollo');
      const laCueva = restaurantes.find(p => p.id === 'la-cueva') || restaurantes[0];

      responseText = isEnglish
        ? `Oh, you're gonna love the local food! 🍽️<br/><br/>For the real deal, try <strong>${narcobollo?.name || 'NarcoBollo'}</strong> - yes, that's really the name, and the arepa de huevo is legendary.<br/><br/>For something fancier with history, <strong>${laCueva?.name}</strong> is where García Márquez used to hang out with his friends.`
        : `¡Uy, la comida costeña es lo máximo! 🍽️<br/><br/>Para lo auténtico, tienes que probar <strong>${narcobollo?.name || 'NarcoBollo'}</strong> - sí, se llama así jaja. La arepa de huevo es legendaria.<br/><br/>Y para algo más nice con historia, <strong>${laCueva?.name}</strong> es donde García Márquez se reunía con sus amigos.`;

      places = [];
      if (narcobollo) places.push(curatedToPlace(narcobollo));
      if (laCueva) places.push(curatedToPlace(laCueva));
    }
    // RUMBA - Usa getPlacesByCategory
    else if (/rumba|party|noche|night|bar|fiesta|salsa|bailar|dance/i.test(userText)) {
      const bares = getPlacesByCategory('bar');
      const latroja = bares.find(p => p.id === 'la-troja') || bares[0];
      const frogg = bares.find(p => p.id === 'frogg-leggs');

      responseText = isEnglish
        ? `Ah, you want to party! 🎺<br/><br/><strong>${latroja?.name}</strong> is THE place for salsa and champeta - go on Friday or Saturday after 10pm, 100% local vibe.<br/><br/>If you prefer rock and a chill terrace, <strong>${frogg?.name || 'Frogg Leggs'}</strong> is your spot.`
        : `¡Ajá, quieres rumba! 🎺<br/><br/><strong>${latroja?.name}</strong> es EL lugar para salsa y champeta - ve un viernes o sábado después de las 10pm, ambiente 100% barranquillero.<br/><br/>Si prefieres algo más rockero con terraza, <strong>${frogg?.name || 'Frogg Leggs'}</strong> está bacano.`;

      places = [];
      if (latroja) places.push(curatedToPlace(latroja));
      if (frogg) places.push(curatedToPlace(frogg));
    }
    // NATURALEZA - Usa getPlacesByCategory
    else if (/naturaleza|nature|eco|aves|bird|ciénaga|río|river/i.test(userText)) {
      const naturaleza = getPlacesByCategory('naturaleza');
      const cienaga = naturaleza.find(p => p.id === 'cienaga-mallorquin') || naturaleza[0];
      const bocas = naturaleza.find(p => p.id === 'bocas-de-ceniza');

      responseText = isEnglish
        ? `Nature lover! 🌿<br/><br/>The <strong>${cienaga?.name}</strong> is amazing for birdwatching - go early morning (6-8am) and you might see flamingos.<br/><br/>And <strong>${bocas?.name || 'Bocas de Ceniza'}</strong> is where the Magdalena River meets the Caribbean Sea - magical experience.`
        : `¡Te gusta la naturaleza! 🌿<br/><br/>La <strong>${cienaga?.name}</strong> es espectacular para avistamiento de aves - ve temprano (6-8am) y puedes ver flamencos.<br/><br/>Y <strong>${bocas?.name || 'Bocas de Ceniza'}</strong> es donde el río Magdalena se encuentra con el mar Caribe - una experiencia mágica.`;

      places = [];
      if (cienaga) places.push(curatedToPlace(cienaga));
      if (bocas) places.push(curatedToPlace(bocas));
    }
    // FAMILIA - Usa getFamilyPlaces
    else if (/familia|family|niños|kids|children|hijos/i.test(userText)) {
      const familyPlaces = getFamilyPlaces();
      const zoo = familyPlaces.find(p => p.id === 'zoologico-barranquilla');
      const malecon = familyPlaces.find(p => p.id === 'gran-malecon') || familyPlaces[0];

      responseText = isEnglish
        ? `With family! 👨‍👩‍👧<br/><br/>The <strong>${zoo?.name || 'Zoológico de Barranquilla'}</strong> is perfect - manatees, tropical birds, and shaded areas. Go early (9am) when animals are more active.<br/><br/>And the <strong>${malecon?.name}</strong> is FREE with playgrounds, bike paths, and great sunset views.`
        : `¡Con familia! 👨‍👩‍👧<br/><br/>El <strong>${zoo?.name || 'Zoológico de Barranquilla'}</strong> es perfecto - tiene manatíes, aviario tropical, y zonas con sombra. Ve temprano (9am) cuando los animales están más activos.<br/><br/>Y el <strong>${malecon?.name}</strong> es GRATIS con parque infantil, ciclovía, y atardeceres espectaculares.`;

      places = [];
      if (zoo) places.push(curatedToPlace(zoo));
      if (malecon) places.push(curatedToPlace(malecon));
    }
    // ARTESANÍAS - Usa getPlacesByCategory
    else if (/artesanía|craft|máscara|mask|galapa|usiacurí|tejido|weaving/i.test(userText)) {
      const artesanias = getPlacesByCategory('artesanias');
      const selva = artesanias.find(p => p.id === 'taller-selva-africana') || artesanias[0];
      const usiacuri = artesanias.find(p => p.id === 'centro-artesanal-usiacuri');

      responseText = isEnglish
        ? `Crafts! Great choice 🎨<br/><br/>In Galapa, <strong>${selva?.name}</strong> is where the famous carnival masks are made - you can watch artisans work and buy unique pieces.<br/><br/>In Usiacurí, <strong>${usiacuri?.name || 'Centro Artesanal'}</strong> has beautiful iraca palm weavings - bags, hats, all handmade.`
        : `¡Artesanías! Buena elección 🎨<br/><br/>En Galapa, el <strong>${selva?.name}</strong> es donde hacen las famosas máscaras del carnaval - puedes ver a los artesanos trabajando y comprar piezas únicas.<br/><br/>En Usiacurí, el <strong>${usiacuri?.name || 'Centro Artesanal'}</strong> tiene tejidos de palma de iraca preciosos - bolsos, sombreros, todo hecho a mano.`;

      places = [];
      if (selva) places.push(curatedToPlace(selva));
      if (usiacuri) places.push(curatedToPlace(usiacuri));
    }
    // ROMÁNTICO - Usa getRomanticPlaces
    else if (/romántico|romantic|pareja|couple|aniversario|anniversary|amor|love/i.test(userText)) {
      const romanticPlaces = getRomanticPlaces();
      const castle = romanticPlaces.find(p => p.id === 'castillo-salgar') || romanticPlaces[0];
      const laCueva = romanticPlaces.find(p => p.id === 'la-cueva');

      responseText = isEnglish
        ? `Romantic spots! 💕<br/><br/><strong>${castle?.name}</strong> at sunset is magical - Spanish fortress with ocean views. Bring someone special.<br/><br/>For dinner with history, <strong>${laCueva?.name || 'La Cueva'}</strong> has that intimate vibe where García Márquez used to write.`
        : `¡Lugares románticos! 💕<br/><br/>El <strong>${castle?.name}</strong> al atardecer es mágico - fortaleza española con vista al mar. Lleva a alguien especial.<br/><br/>Para cenar con historia, <strong>${laCueva?.name || 'La Cueva'}</strong> tiene ese ambiente íntimo donde García Márquez escribía.`;

      places = [];
      if (castle) places.push(curatedToPlace(castle));
      if (laCueva) places.push(curatedToPlace(laCueva));
    }
    // Si no detectamos interés específico
    else {
      responseText = isEnglish
        ? "Perfect. So what are you most into?<br/><br/>• 🏖️ Beach & nature<br/>• 🎭 Culture & history<br/>• 🍽️ Local food<br/>• 🎉 Nightlife & parties"
        : "Perfecto. Y dime, ¿qué te llama más?<br/><br/>• 🏖️ Playa y naturaleza<br/>• 🎭 Cultura e historia<br/>• 🍽️ Gastronomía local<br/>• 🎉 Rumba y vida nocturna";
    }
  }
  // Default: seguir preguntando
  else {
    responseText = isEnglish
      ? "Tell me more, what would you like to know? I'm here to help! 😊"
      : "Cuéntame más, ¿qué te gustaría saber? Estoy pa' ayudarte 😊";
  }

  return {
    id: generateId(),
    role: "assistant",
    text: responseText,
    timestamp: Date.now(),
    places: places && places.length > 0 ? places : undefined,
    language: isEnglish ? "en" : "es",
  };
}

// =============================================================================
// SUGGESTION GENERATOR
// =============================================================================

export function generateSuggestions(lastMessage: ChatMessage): string[] {
  const text = lastMessage.text.toLowerCase();
  const isEnglish = lastMessage.language === "en";

  const suggestions = {
    es: {
      initial: ["🗓️ Planeando viaje", "📍 Ya estoy acá", "🤔 Solo curioseando"],
      planning: ["👫 Vengo en pareja", "👨‍👩‍👧 Con familia", "👥 Con amigos", "🚶 Solo"],
      interests: ["🏖️ Playa y mar", "🎭 Cultura", "🍽️ Buena comida", "🎉 Rumba"],
      afterPlace: ["📍 ¿Cómo llego?", "💰 ¿Cuánto cuesta?", "🕐 ¿Qué horario?", "🤔 Otra opción"],
      afterPlaces: ["Cuéntame más del primero", "¿Cuál me recomiendas?", "📍 Ver en mapa"],
      food: ["🥘 Algo típico", "🍽️ Lugar nice", "💵 Económico", "🌅 Con vista"],
      beach: ["🌊 Con ambiente", "😌 Tranquila", "👨‍👩‍👧 Para familia", "📸 Para fotos"],
      general: ["¿Qué más hay?", "Cuéntame de ti", "¿Tu lugar favorito?"],
      default: ["🏖️ Playas", "🍽️ Dónde comer", "🎭 Qué hacer", "🎉 Vida nocturna"],
    },
    en: {
      initial: ["🗓️ Planning a trip", "📍 I'm here now", "🤔 Just curious"],
      planning: ["👫 With partner", "👨‍👩‍👧 With family", "👥 With friends", "🚶 Solo"],
      interests: ["🏖️ Beach", "🎭 Culture", "🍽️ Good food", "🎉 Nightlife"],
      afterPlace: ["📍 How to get there?", "💰 How much?", "🕐 Opening hours?", "🤔 Other options"],
      afterPlaces: ["Tell me about the first", "Which do you recommend?", "📍 Show on map"],
      food: ["🥘 Traditional", "🍽️ Nice place", "💵 Budget", "🌅 With a view"],
      beach: ["🌊 Lively", "😌 Quiet", "👨‍👩‍👧 Family", "📸 Instagrammable"],
      general: ["What else?", "Tell me about you", "Your favorite spot?"],
      default: ["🏖️ Beaches", "🍽️ Where to eat", "🎭 Things to do", "🎉 Nightlife"],
    }
  };

  const lang = isEnglish ? "en" : "es";
  const s = suggestions[lang];

  // Detectar contexto
  if (/planeando|planning|trip|viaje|cuando vienes|when.*coming/i.test(text)) {
    return s.planning;
  }
  if (/qué.*busca|qué.*llama|what.*looking|qué.*interesa|what.*into|playa.*cultura.*comida|beach.*culture.*food/i.test(text)) {
    return s.interests;
  }
  if (/te recomiendo|i.*recommend|deberías ir|you should/i.test(text)) {
    if ((text.match(/museo|malecón|playa|restaurante|bar|zoológico/gi) || []).length > 1) {
      return s.afterPlaces;
    }
    return s.afterPlace;
  }
  if (/comida|comer|restaurante|food|eat|restaurant/i.test(text)) {
    return s.food;
  }
  if (/playa|beach|mar|sea/i.test(text)) {
    return s.beach;
  }
  if (/cuéntame|tell me|qué más|what else/i.test(text)) {
    return s.general;
  }
  if (/bienvenido|welcome|primera vez|first time|hola|hello|hey/i.test(text)) {
    return s.initial;
  }
  
  return s.default;
}