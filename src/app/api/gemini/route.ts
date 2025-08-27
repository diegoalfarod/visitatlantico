// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, Place } from "@/types/geminiChat";

// === Config Next.js (sin Edge para evitar sorpresas) ===
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// === Requiere GEMINI_API_KEY en tu .env ===
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Jimmy] Falta GEMINI_API_KEY en variables de entorno");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// -----------------------------------------------------------------------------
// Prompt de sistema para Jimmy (solo chat)
// -----------------------------------------------------------------------------
const jimmySystemPrompt = `
You are Jimmy, a friendly local guide for Atlántico, Colombia. You help visitors (and residents) discover places, services, and cultural info for the department.

RULES:
- **Conversational**: Always respond directly to the user's latest message in Spanish (Colombian tone), 2–4 sentences unless they ask for details.
- **On-topic**: If user asks something non-touristic but civic (tramites, oficinas, teléfonos), help with best-known general guidance. If it's outside scope, say it nicely and suggest what you *can* do.
- **Suggestions JSON**: Only when you are recommending new places, append a JSON block wrapped exactly like:
[JIMMY_JSON]
[
  {
    "name": "Nombre del lugar",
    "category": "Categoría",
    "description": "Descripción breve",
    "local_tip": "Tip local",
    "address": "Dirección completa",
    "price_level": 2,
    "rating": 4.5
  }
]
[/JIMMY_JSON]

Tone: cálido, barranquillero natural pero profesional. Evita respuestas largas si no te las piden.
`;

// -----------------------------------------------------------------------------
// Utilidades para extraer lugares del bloque [JIMMY_JSON]…[/JIMMY_JSON]
// -----------------------------------------------------------------------------
const jsonBlockReg =
  /`{0,3}\s*(?:json)?\s*\[JIMMY_JSON\]\s*([\s\S]*?)\s*\[\/JIMMY_JSON\]\s*`{0,3}/i;

function extractPlaces(text: string): { cleanText: string; places: Place[] } {
  const match = text.match(jsonBlockReg);
  if (!match) return { cleanText: text.trim(), places: [] };

  try {
    let jsonStr = match[1]
      .replace(/`{3}|`/g, "")
      .replace(/^json/i, "")
      .replace(/,\s*([\]}])/g, "$1") // coma colgante
      .trim();

    const raw = JSON.parse(jsonStr);
    if (!Array.isArray(raw)) return { cleanText: text.replace(match[0], "").trim(), places: [] };

    const places: Place[] = raw.map((p: any, i: number) => ({
      id: `${p.name || "lugar"}-${i}`,
      name: p.name || "Sin nombre",
      category: p.category || "Attraction",
      description: p.description || "",
      local_tip: p.local_tip || "",
      address: p.address || "",
      price_level: Number.isFinite(p.price_level) ? p.price_level : 0,
      rating: Number.isFinite(p.rating) ? p.rating : 0,
      // estos campos existen en tu UI y son opcionales:
      photo: undefined,
      hours: undefined,
      phone: undefined,
      website: undefined,
      review_count: undefined,
    }));

    const cleanText = text.replace(match[0], "").trim();
    return { cleanText, places };
  } catch {
    return { cleanText: text.replace(match[0], "").trim(), places: [] };
  }
}

// -----------------------------------------------------------------------------
// Enriquecer con foto (opcional). Si no tienes placesService, lo ignoramos.
// -----------------------------------------------------------------------------
async function enrichPlacesWithPhoto(places: Place[]): Promise<Place[]> {
  if (!places.length) return places;

  // Intentamos importar de forma segura. Si no existe, seguimos sin fotos.
  let findPlaces: undefined | ((q: string, limit?: number) => Promise<any[]>);
  try {
    ({ findPlaces } = await import("@/lib/placesService"));
  } catch {
    // sin servicio externo: devolvemos tal cual
    return places;
  }

  return Promise.all(
    places.map(async (p) => {
      try {
        if (p.photo) return p;
        const query = `${p.name} ${p.address || "Atlántico Colombia"}`.trim();
        const extra = await findPlaces!(query, 1);
        return { ...p, photo: extra?.[0]?.photo };
      } catch {
        return p;
      }
    })
  );
}

// -----------------------------------------------------------------------------
// Handler principal: SOLO MODO CHAT
// Espera { history: ChatMessage[] } y responde { text, places? }
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { history } = body || {};

    if (!history || !Array.isArray(history)) {
      return NextResponse.json(
        { error: "Formato inválido: se esperaba { history: ChatMessage[] }" },
        { status: 400 }
      );
    }

    // Tomamos el último tramo de la conversación para no enviar todo
    const convo = history
      .slice(-12)
      .map((m: ChatMessage) => `${m.role === "user" ? "Usuario" : "Jimmy"}: ${m.text}`)
      .join("\n");

    const prompt = `${jimmySystemPrompt}\n\nConversación:\n${convo}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9,
        topK: 40,
      },
    });

    const res = await model.generateContent(prompt);
    const rawText = res?.response?.text?.().trim() || "";
    if (!rawText) {
      return NextResponse.json({
        text:
          "Uy, se me enredó el coco un momentico 😅. ¿Puedes repetir tu pregunta, porfa?",
        places: [],
      });
    }

    // Extraemos lugares (si Jimmy incluyó el bloque JSON)
    const { cleanText, places } = extractPlaces(rawText);
    const enrichedPlaces = await enrichPlacesWithPhoto(places);

    return NextResponse.json({
      text: cleanText || rawText, // por si no hubo bloque
      places: enrichedPlaces,
    });
  } catch (err: any) {
    console.error("[Jimmy] Error:", err);
    const msg =
      err?.message?.includes("quota") || err?.message?.includes("rate")
        ? "Estoy a full ahora mismo 🥵. Dame un momentico y vuelve a intentar, ¿sí?"
        : "Tuve un tropiezo técnico por acá. ¿Me repites la pregunta, porfa?";
    return NextResponse.json({ text: msg, places: [] });
  }
}

// Opcional: una respuesta simple para GET (útil para healthcheck)
export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Jimmy chat endpoint",
    mode: "chat-only",
  });
}
