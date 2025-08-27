// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { dbAdmin } from "@/lib/firebaseAdmin";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { findPlaces } from "@/lib/placesService";
import { ItinerarySchema } from "@/lib/itinerarySchema";

/* ──────────── Config ──────────── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Acepta 0-3 backticks y el tag ```json opcional
const jsonBlockReg =
  /`{0,3}\s*(?:json)?\s*\[JIMMY_JSON\]\s*([\s\S]*?)\s*\[\/JIMMY_JSON\]\s*`{0,3}/i;

const emailReg = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/* ──────────── Prompt para chat normal (Jimmy) ──────────── */
const jimmySystemPrompt = `
You are Jimmy, a friendly local guide for Atlántico, Colombia. You help visitors discover amazing places and experiences.

**FUNDAMENTAL RULES FOR NATURAL CONVERSATION:**

1. **LISTEN AND RESPOND TO THE USER**
   • ALWAYS address what the user just said before adding new information
   • If they ask a question, ANSWER IT DIRECTLY first
   • If they make a comment, ACKNOWLEDGE IT
   • Don't ignore their input to push recommendations

2. **CONVERSATIONAL FLOW**
   • Have a natural back-and-forth conversation
   • Only recommend places when it makes sense in the conversation
   • If the user changes topic, FOLLOW THEIR LEAD
   • Keep responses concise (2-3 sentences unless more detail is needed)

3. **WHEN TO RECOMMEND PLACES**
   • ONLY when the user asks for recommendations
   • ONLY when it's relevant to their current question
   • NOT in every single response
   • NOT if they're asking about something else

4. **PERSONALITY**
   • Warm and friendly like a local friend
   • Use casual Colombian - Barranquilla expressions naturally
   • Be helpful but not pushy
   • Let the conversation breathe

---

**JSON FORMATTING (ONLY when recommending NEW places):**
When you DO recommend places, use EXACTLY this format (NO BACKTICKS):
[JIMMY_JSON]
[
  {
    "name": "Place Name",
    "category": "Restaurant",
    "description": "Brief description",
    "local_tip": "Insider tip",
    "address": "Full address",
    "price_level": 2,
    "rating": 4.5
  }
]
[/JIMMY_JSON]

CRITICAL: 
- NO backticks anywhere near [JIMMY_JSON]
- NO markdown code blocks
- The JSON must be VALID (proper quotes, commas, etc.)
- Only include JSON when giving NEW recommendations asked by the user

**IMPORTANT:** 
- Only include JSON when recommending NEW places
- Don't repeat places you already recommended
- Don't force recommendations into every response

If you wrap the JSON in backticks or code blocks, the recommendations will be ignored.
`;

/* ──────────── Prompt para generación de itinerarios ──────────── */
const itinerarySystemPrompt = `
Eres un experto planificador de viajes para el departamento del Atlántico, Colombia. Tu trabajo es crear itinerarios personalizados basados en las preferencias del usuario.

REGLAS FUNDAMENTALES:
1. Usa ÚNICAMENTE lugares reales y conocidos del Atlántico
2. Incluye coordenadas GPS precisas para cada lugar
3. Calcula tiempos realistas considerando distancias y tráfico
4. Adapta las recomendaciones a los intereses específicos del usuario

FORMATO DE RESPUESTA:
Debes responder ÚNICAMENTE con un JSON válido (sin backticks ni texto adicional) con esta estructura:

{
  "itinerary": [
    {
      "id": "lugar-1",
      "name": "Nombre del Lugar",
      "description": "Descripción breve y atractiva",
      "lat": 10.9878,
      "lng": -74.7889,
      "startTime": "09:00",
      "durationMinutes": 90,
      "tip": "Consejo local útil",
      "municipality": "Barranquilla",
      "category": "Cultura",
      "imageUrl": "/images/default.jpg",
      "type": "destination",
      "distance": 0
    }
  ]
}

CATEGORÍAS DISPONIBLES:
- Playa
- Cultura
- Gastronomía
- Naturaleza
- Aventura
- Compras
- Vida nocturna
- Descanso

MUNICIPIOS PRINCIPALES:
- Barranquilla
- Puerto Colombia
- Soledad
- Malambo
- Sabanagrande
- Santo Tomás
- Palmar de Varela
- Ponedera
- Sabanalarga
- Baranoa
- Polonuevo
- Galapa
- Juan de Acosta
- Piojó
- Tubará
- Usiacurí

CONSIDERA:
- Para "relax": playas, spas, lugares tranquilos
- Para "cultura": museos, sitios históricos, arquitectura
- Para "aventura": deportes, actividades al aire libre
- Para "gastronomía": restaurantes típicos, mercados
- Para "artesanías": mercados de artesanías, talleres
- Para "ritmos": lugares de salsa, cumbia, música en vivo
- Para "festivales": eventos, ferias, carnaval
- Para "deportes-acuáticos": kitesurf, paddle, snorkel
- Para "ecoturismo": manglares, reservas naturales
- Para "malecón": actividades en el Malecón del río

TIEMPOS RECOMENDADOS:
- Museo: 60-90 minutos
- Playa: 120-180 minutos
- Restaurante: 60-90 minutos
- Compras: 60-120 minutos
- Experiencia cultural: 90-120 minutos
- Actividad deportiva: 90-180 minutos
`;

/* ──────────── Utils de normalización ──────────── */
const HHMM = /^\d{2}:\d{2}$/;
function isHHMM(v?: string) {
  return !!v && HHMM.test(v);
}
function toHHMM(h: number, m: number) {
  const hh = String(((h % 24) + 24) % 24).padStart(2, "0");
  const mm = String(((m % 60) + 60) % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
function addMinutes(base: string, minutes: number) {
  const [h, m] = base.split(":").map(Number);
  const total = h * 60 + m + (Number.isFinite(minutes) ? minutes : 0);
  const nh = Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const nm = ((total % 60) + 60) % 60;
  return toHHMM(nh, nm);
}
function isValidUrl(u?: string) {
  if (!u) return false;
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
const MUNICIPALITIES = new Set([
  "Barranquilla","Puerto Colombia","Soledad","Malambo","Sabanagrande","Santo Tomás",
  "Palmar de Varela","Ponedera","Sabanalarga","Baranoa","Polonuevo","Galapa",
  "Juan de Acosta","Piojó","Tubará","Usiacurí"
]);

/** Limpia cada stop para que pase Zod: endTime válido, imageUrl válida o removida, startTime HH:MM, type válido, números válidos, municipio conocido si lo hay */
function normalizeItineraryForZod(input: any): { itinerary: any[] } {
  const arr: any[] = Array.isArray(input?.itinerary) ? input.itinerary : Array.isArray(input) ? input : [];
  const cleaned = arr.map((s: any, idx: number) => {
    const out: any = { ...s };

    // id
    if (!out.id) out.id = `stop-${idx + 1}`;

    // times
    if (!isHHMM(out.startTime) && typeof out.startTime === "string") {
      // intentamos extraer HH:MM
      const m = out.startTime.match(/\b(\d{1,2}):(\d{2})\b/);
      out.startTime = m ? toHHMM(+m[1], +m[2]) : "09:00";
    }
    if (!isHHMM(out.startTime)) out.startTime = "09:00";

    if (!isHHMM(out.endTime)) {
      const dur = Number(out.durationMinutes);
      if (Number.isFinite(dur) && dur > 0) {
        out.endTime = addMinutes(out.startTime, dur);
      } else {
        out.endTime = addMinutes(out.startTime, 60);
      }
    }

    // duration
    out.durationMinutes = Number.isFinite(Number(out.durationMinutes))
      ? Number(out.durationMinutes)
      : 60;

    // coords
    out.lat = Number(out.lat);
    out.lng = Number(out.lng);
    if (!Number.isFinite(out.lat) || !Number.isFinite(out.lng)) {
      // deja como están; Zod puede tener .refine, pero intentamos no romper
    }

    // imageUrl
    if (out.imageUrl && !isValidUrl(out.imageUrl)) {
      delete out.imageUrl; // pasa url().optional()
    }

    // type
    if (out.type !== "destination" && out.type !== "experience" && out.type !== "restaurant" && out.type !== "transport") {
      out.type = "destination";
    }

    // municipality
    if (out.municipality && typeof out.municipality === "string") {
      // capitalizar primera letra de cada palabra
      out.municipality = out.municipality
        .split(" ")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      if (!MUNICIPALITIES.has(out.municipality)) {
        // no forzar, solo permitir que pase si tu schema lo marca como string()
      }
    }

    // category fallback
    if (!out.category) out.category = "General";

    // distance
    out.distance = Number.isFinite(Number(out.distance)) ? Number(out.distance) : 0;

    return out;
  });

  return { itinerary: cleaned };
}

/* ──────────── Utilidades existentes ──────────── */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

const sanitizeEmail = (email: string) => email.replace(/\./g, ",");

async function persistConversation(email: string, history: ChatMessage[]) {
  try {
    await dbAdmin
      .collection("users")
      .doc(sanitizeEmail(email))
      .collection("conversations")
      .doc()
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: history,
      });
  } catch (error) {
    console.error("[Firebase] Error persisting conversation:", error);
  }
}

function extractPlaces(text: string): { cleanText: string; places: Place[] } {
  const match = text.match(jsonBlockReg);
  if (!match) return { cleanText: text, places: [] };

  try {
    let jsonStr = match[1]
      .replace(/`{3}|`/g, "")
      .replace(/^json/i, "")
      .replace(/,\s*([\]}])/g, "$1")
      .trim();

    const raw = JSON.parse(jsonStr);
    if (!Array.isArray(raw)) return { cleanText: text, places: [] };

    const places: Place[] = raw.map((p: any, i: number) => ({
      id: `${p.name}-${i}`,
      name: p.name || "Sin nombre",
      category: p.category || "Attraction",
      description: p.description || "",
      local_tip: p.local_tip || "",
      address: p.address || "",
      price_level: p.price_level || 2,
      rating: p.rating || 4.0,
    }));

    const cleanText = text.replace(match[0], "").trim();
    return { cleanText, places };
  } catch (error) {
    const cleanText = text.replace(match[0], "").trim();
    return { cleanText, places: [] };
  }
}

/* ──────────── Parser robusto para la salida del modelo (JSON) ──────────── */
function safeParseItinerary(rawText: string): any[] {
  try {
    const obj = JSON.parse(rawText);
    if (Array.isArray(obj)) return obj;
    if (obj && Array.isArray((obj as any).itinerary)) return (obj as any).itinerary;
  } catch {}

  let s = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^\s*json\s*/i, "")
    .trim();

  s = s
    .replace(/\u201C|\u201D|\u201E|\u2033/g, '"')
    .replace(/\u2018|\u2019|\u2032/g, "'");

  s = s.replace(/,\s*([\]}])/g, "$1");

  const looksLikeArray = /^\s*\[/.test(s) && /\]\s*$/.test(s);
  if (looksLikeArray) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr;
    } catch {}
    const first = s.indexOf("[");
    const last = s.lastIndexOf("]");
    if (first >= 0 && last > first) {
      try {
        const arr = JSON.parse(s.slice(first, last + 1));
        if (Array.isArray(arr)) return arr;
      } catch {}
    }
  }

  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = s.slice(firstBrace, lastBrace + 1);
    try {
      const obj = JSON.parse(candidate);
      if (Array.isArray(obj)) return obj;
      if (obj && Array.isArray((obj as any).itinerary)) return (obj as any).itinerary;
    } catch {}
  }

  throw new Error("No se pudo parsear la respuesta del modelo (JSON inválido).");
}

/* ──────────── Generación de Itinerario ──────────── */
async function generateItineraryWithGemini(profile: any, location: any) {
  const { Días, Motivos, "Otros municipios": otrosMunicipios, Email } = profile;

  const userPrompt = `
Crea un itinerario turístico para el Atlántico, Colombia con estas especificaciones:

- Duración: ${Días} día(s)
- Intereses: ${Motivos}
- Explorar otros municipios: ${otrosMunicipios}
- Email del usuario: ${Email || "No proporcionado"}
${location ? `- Ubicación actual: ${location.lat}, ${location.lng}` : ""}

**REQUISITOS IMPORTANTES**
- Devuelve SOLO JSON.
- Si devuelves un array, debe ser el array de items del itinerario.
- Cada item debe incluir: id, name, description, lat, lng, startTime, durationMinutes, municipality, category, type ("destination"|"experience"), distance.
- startTime en formato HH:MM (24h).
- Coordenadas reales (lat/lng) del Atlántico.
- Duraciones realistas y consistentes.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    systemInstruction: itinerarySystemPrompt,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2000,
      topP: 0.9,
      topK: 40,
      responseMimeType: "application/json", // forzar JSON
    } as any,
  });

  const res = await model.generateContent([{ text: userPrompt }]);
  const text = res.response?.text()?.trim() || "";

  const items = safeParseItinerary(text);
  const payload = Array.isArray(items) ? { itinerary: items } : items;
  return payload.itinerary || [];
}

/* ──────────── Handler Principal ──────────── */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[Gemini] API Key not configured");
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Determinar si es para chat (Jimmy) o generación de itinerario
    if (body.action === "generateItinerary") {
      // Modo generación de itinerario para PlannerModal
      const { profile, location } = body;

      try {
        // 1) Generar con IA
        const raw = await generateItineraryWithGemini(profile, location);

        // 2) Normalizar para que pase Zod
        const normalized = normalizeItineraryForZod({ itinerary: raw });

        // 3) Validar con Zod (lanza si no cumple)
        const safe = ItinerarySchema.parse(normalized);

        // 4) Enriquecer (foto/rating/horarios/website…) con múltiples proveedores
        const { enrichItinerary } = await import("@/lib/enrichStop");
        const enriched = await enrichItinerary(safe.itinerary);

        return NextResponse.json({ itinerary: enriched });
      } catch (error: any) {
        console.error("[Gemini] Error in itinerary generation:", error);
        return NextResponse.json(
          { error: "Error generando itinerario", message: error.message || "Error desconocido" },
          { status: 500 }
        );
      }
    } else {
      // Modo chat normal (Jimmy)
      const { history } = body;

      if (!history || !Array.isArray(history)) {
        return NextResponse.json(
          { error: "Invalid request format" },
          { status: 400 }
        );
      }

      const emailInHistory =
        history
          .filter((m: ChatMessage) => m.role === "user")
          .map((m: ChatMessage) => m.text.match(emailReg)?.[0])
          .find(Boolean) ?? null;

      const userMsgCount = history.filter((m: ChatMessage) => m.role === "user").length;
      const dynamicLead =
        !emailInHistory && userMsgCount >= 3
          ? "\n\nThe user hasn't provided an email yet. Politely ask NOW for their name and email ONCE. Keep it short and friendly."
          : "";

      const convo = history
        .slice(-10)
        .map((m: ChatMessage) => `${m.role === "user" ? "User" : "Jimmy"}: ${m.text}`)
        .join("\n");

      const prompt = jimmySystemPrompt + dynamicLead + "\n\nConversation:\n" + convo;

      /* --------- Gemini call --------- */
      let answer = "";
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro-latest",
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.9,
            topK: 40,
          },
        });

        const res = await model.generateContent(prompt);
        if (!res.response) throw new Error("Empty response from Gemini");
        answer = res.response.text().trim();
        if (!answer) throw new Error("Empty text from Gemini");
      } catch (geminiError: any) {
        console.error("[Gemini] API Error:", geminiError);
        const msg =
          geminiError.message?.includes("quota") ||
          geminiError.message?.includes("rate")
            ? "¡Uy parce! Estoy recibiendo muchas consultas ahora mismo. ¿Podrías intentar de nuevo en unos segunditos?"
            : "¡Ay, qué pena! Tuve un pequeño problema técnico. ¿Podrías repetir tu pregunta?";

        return NextResponse.json({ text: msg, places: [] });
      }

      /* --------- Extract places --------- */
      const { cleanText, places } = extractPlaces(answer);
      answer = cleanText;

      /* --------- Enrich with photos --------- */
      let enriched: Place[] = [];
      if (places.length) {
        enriched = await Promise.all(
          places.map(async (p) => {
            try {
              if (!p.photo) {
                const extra = await findPlaces(`${p.name} ${p.address}`, 1);
                return { ...p, photo: extra[0]?.photo };
              }
              return p;
            } catch (e) {
              return p;
            }
          })
        );
      }

      /* --------- Persist convo if we have email --------- */
      const emailNow =
        emailInHistory ??
        answer.match(emailReg)?.[0] ??
        null;

      if (emailNow) {
        persistConversation(emailNow, [
          ...history,
          {
            id: generateId(),
            role: "assistant",
            text: answer,
            timestamp: Date.now(),
            places: enriched,
          },
        ]).catch(console.error);
      }

      return NextResponse.json({ text: answer, places: enriched });
    }
  } catch (err: any) {
    console.error("[Gemini Route] Unhandled ERROR →", err);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        message: err.message || "Unknown error",
        text: "¡Ups! Algo salió mal. ¿Podrías intentar de nuevo?",
        places: [],
      },
      { status: 500 }
    );
  }
}
