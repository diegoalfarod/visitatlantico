// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { dbAdmin } from "@/lib/firebaseAdmin";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { findPlaces } from "@/lib/placesService";
import { ItinerarySchema } from "@/lib/itinerarySchema";

// Fuerza Node runtime (Firebase Admin no funciona en edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
1. Listen to the user and answer directly.
2. Keep a natural back-and-forth flow.
3. Recommend places only when asked or relevant.
4. Warm, Colombian (Barranquilla) vibe.

**JSON when recommending NEW places (no backticks):**
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
`;

/* ──────────── Prompt para generación de itinerarios ──────────── */
const itinerarySystemPrompt = `
Eres un experto planificador de viajes para Atlántico, Colombia. Responde SOLO con JSON válido:

{
  "itinerary": [
    {
      "id": "lugar-1",
      "name": "Nombre del Lugar",
      "description": "Descripción breve",
      "lat": 10.9878,
      "lng": -74.7889,
      "startTime": "09:00",
      "endTime": "10:30",
      "durationMinutes": 90,
      "tip": "Consejo local",
      "municipality": "Barranquilla",
      "category": "Cultura",
      "imageUrl": "https://.../foto.jpg",
      "type": "destination",
      "distance": 0
    }
  ]
}

REGLAS:
- Solo lugares reales del Atlántico.
- Coordenadas precisas.
- Tiempos realistas (30 min traslado entre actividades).
- Ajusta a intereses del usuario.
- Duraciones guía:
  Museo(60-90), Playa(120-180), Restaurante(60-90), Compras(60-120), Experiencia cultural(90-120), Deportiva(90-180).
`;

/* ──────────── Utils ──────────── */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2);
  return `${ts}-${rnd}`;
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

/* ──────────── Helpers de saneamiento flexible ──────────── */
const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;

function toHHMMOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (HHMM.test(s)) return s;
  // Intenta normalizar "9:00 am", "09.00", "0900", etc.
  const lower = s.toLowerCase().replace(/\./g, ":").replace(/\s+/g, "");
  if (/\d{1,2}:\d{2}(am|pm)/.test(lower)) {
    const m = lower.match(/(\d{1,2}):(\d{2})(am|pm)/);
    if (m) {
      let h = parseInt(m[1], 10);
      const mm = m[2];
      const ampm = m[3];
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      const hh = h.toString().padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }
  if (/^\d{3,4}$/.test(lower)) {
    // 900 -> 09:00 ; 1330 -> 13:30
    const digits = lower.padStart(4, "0");
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    if (HHMM.test(`${hh}:${mm}`)) return `${hh}:${mm}`;
  }
  return null;
}

function toNumberOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeImageUrl(v: any): string | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const s = v.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return s; // aceptamos relativas; el schema puede permitirlas
  // URLs sin protocolo (ej: //img) → fuerza https
  if (s.startsWith("//")) return "https:" + s;
  // cadenas tipo "N/A" o "default" → ignora
  if (/^(n\/a|na|none|null|default)$/i.test(s)) return undefined;
  return s; // deja pasar, luego el zod puede permitir string genérica
}

type AnyStop = {
  id?: string;
  name?: string;
  description?: string;
  lat?: any;
  lng?: any;
  startTime?: any;
  endTime?: any;
  durationMinutes?: any;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  type?: string;
  distance?: any;
  rating?: any;
  tags?: string[];
  [k: string]: any;
};

function lossySanitizeItinerary(input: any): { itinerary: AnyStop[] } {
  const arr: AnyStop[] = Array.isArray(input?.itinerary)
    ? input.itinerary
    : Array.isArray(input)
    ? input
    : [];

  const out = arr
    .map<AnyStop>((s, idx) => {
      const lat = toNumberOrNull(s.lat);
      const lng = toNumberOrNull(s.lng);
      const start = toHHMMOrNull(s.startTime) ?? "09:00"; // default si no viene bien
      const end = toHHMMOrNull(s.endTime) ?? undefined;
      const dur = toNumberOrNull(s.durationMinutes) ?? 60;
      const dist = toNumberOrNull(s.distance) ?? 0;

      const imageUrl = normalizeImageUrl(s.imageUrl);

      const type =
        s.type === "experience" || s.type === "destination" || s.type === "restaurant" || s.type === "transport"
          ? s.type
          : "destination";

      const municipality = typeof s.municipality === "string" && s.municipality.trim()
        ? s.municipality
        : "Barranquilla";

      const category = typeof s.category === "string" && s.category.trim()
        ? s.category
        : "General";

      return {
        id: s.id || `stop-${idx + 1}`,
        name: s.name || `Destino ${idx + 1}`,
        description: s.description || "",
        lat: lat ?? 0,
        lng: lng ?? 0,
        startTime: start,
        endTime: end,
        durationMinutes: dur,
        tip: s.tip || "",
        municipality,
        category,
        imageUrl,
        type,
        distance: dist,
        rating: toNumberOrNull(s.rating) ?? undefined,
        tags: Array.isArray(s.tags) ? s.tags.filter((t) => !!t) : [],
      };
    })
    // descarta los que no tengan coords razonables
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number");

  return { itinerary: out };
}

/* ──────────── Generación de Itinerario ──────────── */
async function generateItineraryWithGemini(profile: any, location: any) {
  const { Días, Motivos, "Otros municipios": otrosMunicipios, Email } = profile;

  const userPrompt = `
Crea un itinerario turístico para Atlántico, Colombia:

- Duración: ${Días} día(s)
- Intereses: ${Motivos}
- Explorar otros municipios: ${otrosMunicipios}
- Email del usuario: ${Email || "No proporcionado"}
${location ? `- Ubicación actual: ${location.lat}, ${location.lng}` : ""}

IMPORTANTE:
- Incluye ${parseInt(Días) * 4} a ${parseInt(Días) * 6} actividades en total
- Distribuye actividades por los días, primera a las 09:00
- Considera ~30 minutos de transporte entre actividades
- Si no quiere otros municipios, limita a Barranquilla y Puerto Colombia
- Prioriza intereses: ${Motivos}

Responde SOLO con el JSON del itinerario, sin texto adicional.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000, topP: 0.9, topK: 40 },
  });

  const result = await model.generateContent([{ text: itinerarySystemPrompt }, { text: userPrompt }]);
  const response = result.response.text().trim();

  // Quita code fences si los hubiera
  let clean = response.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();

  // Si viene un array suelto, envuélvelo
  if (clean.startsWith("[") && clean.endsWith("]")) {
    clean = `{"itinerary": ${clean}}`;
  }

  // Último intento: si hay bloque JSON grande
  if (!(clean.startsWith("{") && clean.endsWith("}"))) {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) clean = jsonMatch[0];
  }

  const parsed = JSON.parse(clean);
  return parsed;
}

/* ──────────── Handler Principal ──────────── */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API not configured", message: "Falta GEMINI_API_KEY en el servidor" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Generación de itinerario (Planner)
    if (body.action === "generateItinerary") {
      const { profile, location } = body;

      try {
        // 1) LLM
        const raw = await generateItineraryWithGemini(profile, location);

        // 2) Saneamos tolerante
        const sanitized = lossySanitizeItinerary(raw);

        // 3) Validamos; si falla, intentamos una vez más con el array puro
        let safe = ItinerarySchema.safeParse(sanitized);
        if (!safe.success) {
          const fallback = lossySanitizeItinerary(Array.isArray(raw) ? { itinerary: raw } : raw);
          safe = ItinerarySchema.safeParse(fallback);

          if (!safe.success) {
            return NextResponse.json(
              {
                error: "Schema validation failed",
                message: "El itinerario generado no cumple el esquema",
                issues: safe.error.issues,
                sample: (fallback.itinerary || []).slice(0, 2),
              },
              { status: 400 }
            );
          }
        }

        // 4) Enriquecimiento
        const { enrichItinerary } = await import("@/lib/enrichStop");
        const enriched = await enrichItinerary(safe.data.itinerary);

        return NextResponse.json({ itinerary: enriched });
      } catch (error: any) {
        console.error("[Gemini] Error in itinerary generation:", error);
        const msg =
          error?.message ||
          (typeof error === "string" ? error : "Error desconocido generando itinerario");
        return NextResponse.json(
          { error: "Error generando itinerario", message: msg },
          { status: 500 }
        );
      }
    }

    // Chat normal (Jimmy)
    const { history } = body;
    if (!history || !Array.isArray(history)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const userMsgs = history.filter((m: ChatMessage) => m.role === "user");
    const emailInHistory =
      userMsgs.map((m) => m.text.match(emailReg)?.[0]).find(Boolean) ?? null;
    const dynamicLead =
      !emailInHistory && userMsgs.length >= 3
        ? "\n\nThe user hasn't provided an email yet. Politely ask NOW for their name and email ONCE. Keep it short and friendly."
        : "";

    const convo = history
      .slice(-10)
      .map((m: ChatMessage) => `${m.role === "user" ? "User" : "Jimmy"}: ${m.text}`)
      .join("\n");

    const prompt = jimmySystemPrompt + dynamicLead + "\n\nConversation:\n" + convo;

    let answer = "";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        generationConfig: { temperature: 0.8, maxOutputTokens: 500, topP: 0.9, topK: 40 },
      });

      const res = await model.generateContent(prompt);
      if (!res.response) throw new Error("Empty response from Gemini");
      answer = res.response.text().trim();
      if (!answer) throw new Error("Empty text from Gemini");
    } catch (geminiError: any) {
      const msg =
        geminiError?.message?.includes("quota") || geminiError?.message?.includes("rate")
          ? "¡Uy parce! Estoy recibiendo muchas consultas ahora mismo. ¿Intentas de nuevo en unos segunditos?"
          : "¡Ay, qué pena! Tuve un problema técnico. ¿Podrías repetir tu pregunta?";
      return NextResponse.json({ text: msg, places: [] });
    }

    const { cleanText, places } = extractPlaces(answer);
    answer = cleanText;

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
          } catch {
            return p;
          }
        })
      );
    }

    const emailNow = emailInHistory ?? answer.match(emailReg)?.[0] ?? null;
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
      ]).catch(() => {});
    }

    return NextResponse.json({ text: answer, places: enriched });
  } catch (err: any) {
    console.error("[Gemini Route] Unhandled ERROR →", err);
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        message: err?.message || "Unknown error",
        text: "¡Ups! Algo salió mal. ¿Podrías intentar de nuevo?",
        places: [],
      },
      { status: 500 }
    );
  }
}
