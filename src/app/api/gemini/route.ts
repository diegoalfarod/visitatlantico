// src/app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, Place } from "@/types/geminiChat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// === ENV ===
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Jimmy] Falta GEMINI_API_KEY en variables de entorno");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// --- Prompt de sistema ---
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

// --- Utilidades JSON ---
const jsonBlockReg =
  /`{0,3}\s*(?:json)?\s*\[JIMMY_JSON\]\s*([\s\S]*?)\s*\[\/JIMMY_JSON\]\s*`{0,3}/i;

function extractPlaces(text: string): { cleanText: string; places: Place[] } {
  const match = text.match(jsonBlockReg);
  if (!match) return { cleanText: text.trim(), places: [] };

  try {
    let jsonStr = match[1]
      .replace(/`{3}|`/g, "")
      .replace(/^json/i, "")
      .replace(/,\s*([\]}])/g, "$1")
      .trim();

    const raw = JSON.parse(jsonStr);
    if (!Array.isArray(raw))
      return { cleanText: text.replace(match[0], "").trim(), places: [] };

    const places: Place[] = raw.map((p: any, i: number) => ({
      id: `${p.name || "lugar"}-${i}`,
      name: p.name || "Sin nombre",
      category: p.category || "Attraction",
      description: p.description || "",
      local_tip: p.local_tip || "",
      address: p.address || "",
      price_level: Number.isFinite(p.price_level) ? p.price_level : 0,
      rating: Number.isFinite(p.rating) ? p.rating : 0,
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

// --- Enriquecer con foto (opcional) ---
async function enrichPlacesWithPhoto(places: Place[]): Promise<Place[]> {
  if (!places.length) return places;
  try {
    const mod = await import("@/lib/placesService");
    const findPlaces: undefined | ((q: string, limit?: number) => Promise<any[]>) =
      (mod as any).findPlaces;
    if (!findPlaces) return places;

    return Promise.all(
      places.map(async (p) => {
        try {
          if (p.photo) return p;
          const query = `${p.name} ${p.address || "Atlántico Colombia"}`.trim();
          const extra = await findPlaces(query, 1);
          return { ...p, photo: extra?.[0]?.photo };
        } catch {
          return p;
        }
      })
    );
  } catch {
    return places;
  }
}

// --- Helpers de errores y retries ---
function parseErr(err: any) {
  const status =
    err?.status ?? err?.response?.status ?? err?.cause?.status ?? err?.code;
  const data =
    err?.response?.data ?? err?.cause?.response?.data ?? err?.error ?? null;
  const msg =
    err?.message ??
    data?.message ??
    data?.error?.message ??
    (typeof data === "string" ? data : "");
  return { status, msg, data };
}

async function withRetries<T>(fn: () => Promise<T>, tries = 3) {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const { status, msg } = parseErr(err);
      if (status === 429 || (typeof status === "number" && status >= 500)) {
        const delay = Math.min(8000, 1000 * Math.pow(2, i)) + Math.floor(Math.random() * 300);
        console.warn(`[Jimmy] Retry ${i + 1} after ${delay}ms - status ${status} - ${msg}`);
        await new Promise((r) => setTimeout(r, delay));
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// --- Mapea historia a roles Gemini ---
function toGeminiRole(r: string) {
  return r === "user" ? "user" : "model";
}

// --- Handler principal ---
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

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "Formato inválido: se esperaba { history: ChatMessage[] }" },
        { status: 400 }
      );
    }

    const contents = history.slice(-12).map((m: ChatMessage) => ({
      role: toGeminiRole((m as any).role || "user"),
      parts: [{ text: (m as any).text || "" }],
    }));

    // Modelo estable v1.5 con sufijo de versión (evita 404 en v1beta)
    let model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-002",
      systemInstruction: { role: "system", parts: [{ text: jimmySystemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9,
        topK: 40,
      },
    });

    let res: any;

    try {
      res = await withRetries(() => model.generateContent({ contents }));
    } catch (e: any) {
      const { status, msg } = parseErr(e);
      // Fallback a 2.0 si el proyecto/región no tiene 1.5-pro-002
      if (status === 404 || String(msg || "").includes("not found")) {
        console.warn("[Jimmy] Fallback a gemini-2.0-flash por 404 en 1.5-pro-002");
        const fallback = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: { role: "system", parts: [{ text: jimmySystemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
            topK: 40,
          },
        });
        res = await withRetries(() => fallback.generateContent({ contents }));
      } else {
        throw e;
      }
    }

    const rawText = res?.response?.text?.()?.trim() || "";
    if (!rawText) {
      return NextResponse.json({
        text:
          "Uy, se me enredó el coco un momentico 😅. ¿Puedes repetir tu pregunta, porfa?",
        places: [],
      });
    }

    const { cleanText, places } = extractPlaces(rawText);
    const enrichedPlaces = await enrichPlacesWithPhoto(places);

    return NextResponse.json({
      text: cleanText || rawText,
      places: enrichedPlaces,
    });
  } catch (err: any) {
    const { status, msg, data } = parseErr(err);
    console.error("[Jimmy] Error:", { status, msg, data });

    const isRate =
      String(msg || "").toLowerCase().includes("quota") ||
      String(msg || "").toLowerCase().includes("rate") ||
      status === 429;

    const friendly = isRate
      ? "Estoy a full ahora mismo 🥵. Inténtalo de nuevo en unos segundos."
      : "Tuve un tropiezo técnico por acá. ¿Me repites la pregunta, porfa?";

    const meta =
      process.env.NODE_ENV !== "production" ? { status, msg } : undefined;

    return NextResponse.json({ text: friendly, places: [], meta }, { status: 200 });
  }
}

// Healthcheck simple
export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Jimmy chat endpoint",
    mode: "chat-only",
  });
}
