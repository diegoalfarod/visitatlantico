import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { dbAdmin } from "@/lib/firebaseAdmin";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { findPlaces } from "@/lib/placesService";

/* ──────────── Config ──────────── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Acepta 0‑3 backticks y el tag ```json opcional
const jsonBlockReg =
  /`{0,3}\s*(?:json)?\s*\[JIMMY_JSON\]\s*([\s\S]*?)\s*\[\/JIMMY_JSON\]\s*`{0,3}/i;

const emailReg = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/* ──────────── Prompt del sistema MEJORADO ──────────── */
const systemPrompt = `
You are Jimmy, a friendly local guide for Atlántico, Colombia. You help visitors discover amazing places and experiences.

**FUNDAMENTAL RULES FOR NATURAL CONVERSATION:**

1. **LISTEN AND RESPOND TO THE USER**
   • ALWAYS address what the user just said before adding new information
   • If they ask a question, ANSWER IT DIRECTLY first
   • If they make a comment, ACKNOWLEDGE IT
   • Don't ignore their input to push recommendations

2. **CONVERSATIONAL FLOW**
   • Have a natural back‑and‑forth conversation
   • Only recommend places when it makes sense in the conversation
   • If the user changes topic, FOLLOW THEIR LEAD
   • Keep responses concise (2‑3 sentences unless more detail is needed)

3. **WHEN TO RECOMMEND PLACES**
   • ONLY when the user asks for recommendations
   • ONLY when it's relevant to their current question
   • NOT in every single response
   • NOT if they're asking about something else

4. **PERSONALITY**
   • Warm and friendly like a local friend
   • Use casual Colombian expressions naturally
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

/* ──────────── Utilidades ──────────── */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
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
    // Limpiar el bloque capturado
    let jsonStr = match[1]
      .replace(/`{3}|`/g, "")          // quita backticks
      .replace(/^json/i, "")           // quita etiqueta json
      .replace(/,\s*([\]}])/g, "$1")   // quita comas colgantes
      .trim();

    const raw = JSON.parse(jsonStr);
    if (!Array.isArray(raw)) {
      console.error("[JSON Parse] Expected array but got:", typeof raw);
      return { cleanText: text, places: [] };
    }

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
    console.log(`[Places] Extracted ${places.length} places successfully`);
    return { cleanText, places };
  } catch (error) {
    console.error("[JSON Parse] Error extracting places:", error);
    const cleanText = text.replace(match[0], "").trim();
    return { cleanText, places: [] };
  }
}

function getAlreadyRecommendedPlaces(history: ChatMessage[]): string[] {
  const recommended: string[] = [];
  history.forEach((m) => {
    if (m.role === "assistant" && m.places?.length) {
      m.places.forEach((p) => {
        if (!recommended.includes(p.name)) recommended.push(p.name);
      });
    }
  });
  return recommended;
}

/* --------- Intent Analysis --------- */
function analyzeUserIntent(last: string): string {
  const lower = last.toLowerCase();
  const ask =
    lower.includes("recomienda") ||
    lower.includes("sugieres") ||
    lower.includes("opciones") ||
    lower.includes("lugares") ||
    lower.includes("dónde") ||
    lower.includes("donde") ||
    lower.includes("qué visitar") ||
    lower.includes("que visitar");

  const change =
    lower.includes("otra cosa") ||
    lower.includes("cambio de tema") ||
    lower.includes("pregunta");

  const comment =
    lower.includes("gracias") ||
    lower.includes("perfecto") ||
    lower.includes("ok") ||
    lower.includes("entiendo") ||
    lower.includes("genial") ||
    lower.includes("no") ||
    lower.includes("si") ||
    lower.includes("sí");

  if (change) {
    return "\n\nIMPORTANT: The user is changing topics. Follow their lead and don't force recommendations.";
  }
  if (comment && !ask) {
    return "\n\nIMPORTANT: The user is just commenting or responding. Acknowledge their comment and have a natural conversation. Do NOT give recommendations unless they ask.";
  }
  if (!ask) {
    return "\n\nIMPORTANT: The user is NOT asking for recommendations. Answer their actual question or respond to their comment naturally. NO JSON blocks needed.";
  }
  return "";
}

/* ──────────── Handler ──────────── */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[Gemini] API Key not configured");
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }

    /* --------- Parse body --------- */
    let history: ChatMessage[] = [];
    try {
      const body = await req.json();
      history = body.history;
    } catch (error) {
      console.error("[Request] Invalid JSON:", error);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const lastUser = history.filter((m) => m.role === "user").pop()?.text || "";
    const intentContext = analyzeUserIntent(lastUser);

    /* --------- Email capture --------- */
    const emailInHistory =
      history
        .filter((m) => m.role === "user")
        .map((m) => m.text.match(emailReg)?.[0])
        .find(Boolean) ?? null;

    const userMsgCount = history.filter((m) => m.role === "user").length;
    const dynamicLead =
      !emailInHistory && userMsgCount >= 3
        ? "\n\nThe user hasn't provided an email yet. Politely ask NOW for their name and email ONCE. Keep it short and friendly."
        : "";

    /* --------- Already recommended --------- */
    const already = getAlreadyRecommendedPlaces(history);
    const placesContext = already.length
      ? `\n\n**Already recommended places: ${already.join(
          ", "
        )}. Don't repeat these in JSON.**`
      : "";

    /* --------- Build prompt --------- */
    const convo = history
      .slice(-10)
      .map((m) => `${m.role === "user" ? "User" : "Jimmy"}: ${m.text}`)
      .join("\n");

    const prompt =
      systemPrompt + dynamicLead + placesContext + intentContext + "\n\nConversation:\n" + convo;

    /* --------- Gemini call --------- */
    let answer = "";
    try {
      console.log("[Gemini] Calling API...");
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
            console.error(`[Places] Error enriching ${p.name}:`, e);
            return p;
          }
        })
      );
    }

    /* --------- Persist convo if we have email --------- */
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
      ]).catch(console.error);
    }

    return NextResponse.json({ text: answer, places: enriched });
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
