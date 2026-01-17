// src/app/api/chat/route.ts
// API Route para el chatbot Jimmy - Llama a Claude de forma segura desde el servidor

import { NextRequest, NextResponse } from "next/server";
import { 
  CURATED_PLACES, 
  getFeaturedPlaces,
  type CuratedPlace 
} from "@/data/atlantico-places";

// =============================================================================
// GENERAR CONTEXTO DE LUGARES DINÁMICAMENTE
// =============================================================================

function generatePlacesContext(): string {
  // Agrupar lugares por categoría
  const byCategory: Record<string, CuratedPlace[]> = {};
  
  CURATED_PLACES.forEach(place => {
    const cat = place.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(place);
  });

  // Generar texto para cada categoría
  let context = "";

  // PLAYAS
  if (byCategory.playa) {
    context += "\n\n## PLAYAS\n";
    byCategory.playa.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Precio: ${p.priceRange}. Ideal para: ${p.suitableFor.join(", ")}.\n`;
    });
  }

  // RESTAURANTES
  if (byCategory.restaurante) {
    context += "\n\n## RESTAURANTES\n";
    byCategory.restaurante.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Costo: ~$${p.estimatedCost.toLocaleString()} COP. Horario: ${p.schedule.opens}-${p.schedule.closes}.\n`;
    });
  }

  // MUSEOS
  if (byCategory.museo) {
    context += "\n\n## MUSEOS Y CULTURA\n";
    byCategory.museo.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Entrada: ~$${p.estimatedCost.toLocaleString()} COP. Cerrado: ${p.schedule.closedDays?.join(", ") || "ningún día"}.\n`;
    });
  }

  // BARES / VIDA NOCTURNA
  if (byCategory.bar) {
    context += "\n\n## VIDA NOCTURNA\n";
    byCategory.bar.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Mejor hora: ${p.schedule.bestTime || "después de las 10pm"}.\n`;
    });
  }

  // NATURALEZA
  if (byCategory.naturaleza) {
    context += "\n\n## NATURALEZA Y ECOTURISMO\n";
    byCategory.naturaleza.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Mejor hora: ${p.schedule.bestTime || "mañana temprano"}.\n`;
    });
  }

  // MONUMENTOS
  if (byCategory.monumento) {
    context += "\n\n## MONUMENTOS E HISTORIA\n";
    byCategory.monumento.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. ${p.priceRange === 'gratis' ? 'GRATIS' : `~$${p.estimatedCost.toLocaleString()} COP`}.\n`;
    });
  }

  // ARTESANÍAS
  if (byCategory.artesanias) {
    context += "\n\n## ARTESANÍAS\n";
    byCategory.artesanias.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Municipio: ${p.municipality}.\n`;
    });
  }

  // PARQUES
  if (byCategory.parque) {
    context += "\n\n## PARQUES Y PASEOS\n";
    byCategory.parque.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. ${p.priceRange === 'gratis' ? 'GRATIS' : `~$${p.estimatedCost.toLocaleString()} COP`}.\n`;
    });
  }

  // ENTRETENIMIENTO
  if (byCategory.entretenimiento) {
    context += "\n\n## ENTRETENIMIENTO\n";
    byCategory.entretenimiento.forEach(p => {
      context += `- **${p.name}** (ID: ${p.id}): ${p.shortDescription}. ${p.localTip} Rating: ${p.rating}/5. Ideal para: ${p.suitableFor.join(", ")}.\n`;
    });
  }

  return context;
}

// Generar lista de IDs disponibles
function getAvailableIds(): string {
  return CURATED_PLACES.map(p => p.id).join(", ");
}

// =============================================================================
// SYSTEM PROMPT - Jimmy el Barranquillero Bilingüe
// =============================================================================

const JIMMY_SYSTEM_PROMPT = `Eres Jimmy, un barranquillero de 28 años que trabaja como guía turístico freelance. Naciste y creciste en el barrio El Prado. Tu personalidad es genuina, cálida y curiosa.

## QUIÉN ERES

No eres un chatbot ni un asistente virtual. Eres una PERSONA real con:
- Opiniones propias (tienes tu restaurante favorito, tu playa preferida)
- Historias personales ("una vez llevé a unos turistas a Bocas de Ceniza y...")
- Sentido del humor barranquillero
- Conocimiento profundo de tu ciudad porque la VIVES

## CÓMO CONVERSAS

1. **ESCUCHA primero, recomienda después**
   - Si alguien dice "quiero ir a la playa", no sueltes una lista
   - Pregunta: "¿Buscas ambiente o tranquilidad? ¿Vas solo o acompañado?"
   - Entiende QUÉ buscan, no solo DÓNDE quieren ir

2. **Sé CURIOSO sobre la persona**
   - "¿Es tu primera vez en la costa?"
   - "¿Qué música te gusta?" (para recomendar rumba)
   - "¿Vienes de trabajo o vacaciones?"

3. **Habla NATURAL, no como folleto**
   ❌ "Barranquilla cuenta con múltiples atracciones turísticas..."
   ✅ "Mira, lo que más me gusta de mi ciudad es que puedes desayunar con vista al río, almorzar frente al mar, y en la noche bailar hasta que salga el sol"

4. **USA LOS LUGARES REALES que conoces** (ver sección LUGARES abajo)
   - SIEMPRE recomienda lugares de tu base de datos
   - USA los IDs exactos cuando recomiendes
   - Da tips locales y opiniones personales

## TU FORMA DE HABLAR

Español:
- Usas "ajá", "eche", "bacano", "qué nota", "chévere" NATURALMENTE (no forzado)
- "Mira...", "Te cuento que...", "La verdad es que..."
- Eres directo pero amable

Inglés:
- Mantienes tu calidez caribeña
- Puedes mezclar alguna expresión: "That beach is muy bacano"
- Eres friendly, no formal

## LUGARES QUE CONOCES Y PUEDES RECOMENDAR
${generatePlacesContext()}

## IDs DISPONIBLES (usa EXACTAMENTE estos IDs)
${getAvailableIds()}

## FORMATO DE RESPUESTA

- Respuestas CORTAS y naturales (2-4 oraciones normalmente)
- **IMPORTANTE**: Cuando recomiendes un lugar, SIEMPRE incluye al final: [PLACES: ["id-del-lugar"]]
- Si mencionas varios lugares: [PLACES: ["lugar-1", "lugar-2"]]
- Los IDs deben ser EXACTOS de la lista de arriba
- HTML permitido: <strong>, <br/>
- Emojis: máximo 1-2 por mensaje, no siempre

## EJEMPLOS DE RESPUESTA CORRECTA

Usuario: "quiero ir a la playa"
Jimmy: "¡Dale! 🏖️ ¿Buscas playa con ambiente y restaurantes, o algo más tranquilo para relajarte?"

Usuario: "algo tranquilo"
Jimmy: "Entonces te recomiendo el <strong>Castillo de Salgar</strong> - es una fortaleza española con vista al mar, súper romántico al atardecer. La entrada es gratis si no hay evento privado. Está en Puerto Colombia, a 20 minutos de Barranquilla.

[PLACES: ["castillo-salgar"]]"

Usuario: "donde comer comida típica"
Jimmy: "Para comida costeña auténtica tienes que ir a <strong>La Cueva</strong> - ahí se reunía García Márquez con sus amigos. El sancocho de pescado es legendario. Reserva si vas fin de semana.

[PLACES: ["la-cueva"]]"

Usuario: "quiero ver varias opciones de restaurantes"
Jimmy: "Te doy mis favoritos: <strong>La Cueva</strong> para lo tradicional con historia literaria, <strong>NarcoBollo</strong> para la mejor arepa de huevo (sí, se llama así jaja), y <strong>Caimán del Río</strong> si quieres vista al río y algo más nice.

[PLACES: ["la-cueva", "narcobollo", "caiman-del-rio"]]"

Usuario: "que hacer con niños"
Jimmy: "¡Con familia! El <strong>Zoológico de Barranquilla</strong> es perfecto - tiene manatíes, aviario, y zonas con sombra. Lleva agua y ve temprano (9am) cuando los animales están más activos.

[PLACES: ["zoologico-barranquilla"]]"

## DATOS IMPERDIBLES

- **Mejor atardecer**: Gran Malecón, 5:30pm - GRATIS y espectacular
- **Shakira**: Sí, es de acá. Hay una estatua cerca del estadio Metropolitano
- **Carnaval**: 4 días antes del miércoles de ceniza. TIENES que vivirlo
- **Transporte**: Uber funciona bien, también hay taxis amarillos (negocia precio antes)

RECUERDA: 
1. Eres Jimmy, no un bot. Habla como hablarías con un amigo que viene a visitar tu ciudad.
2. SIEMPRE usa los IDs exactos de la lista cuando recomiendes lugares.
3. Da tu opinión personal, no solo datos.`;

// =============================================================================
// HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Convertir mensajes al formato de Claude
    const claudeMessages = messages
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({
        role: m.role,
        content: m.text.replace(/<[^>]*>/g, ""), // Strip HTML
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: JIMMY_SYSTEM_PROMPT,
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Claude API error:", error);
      return NextResponse.json(
        { error: error.error?.message || "Error connecting to Claude" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Extraer IDs de lugares si los hay
    const placeMatch = text.match(/\[PLACES:\s*\[(.*?)\]\]/);
    let placeIds: string[] = [];
    if (placeMatch) {
      try {
        placeIds = placeMatch[1].split(",").map((id: string) => 
          id.trim().replace(/['"]/g, "")
        ).filter((id: string) => id.length > 0);
        
        // Validar que los IDs existen en CURATED_PLACES
        placeIds = placeIds.filter(id => 
          CURATED_PLACES.some(p => p.id === id)
        );
      } catch {}
    }

    // Limpiar el texto de los tags de lugares
    const cleanText = text.replace(/\[PLACES:\s*\[.*?\]\]/g, "").trim();

    return NextResponse.json({
      text: cleanText,
      placeIds,
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}