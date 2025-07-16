import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";          // ← añadido
import { dbAdmin } from "@/lib/firebaseAdmin";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { findPlaces } from "@/lib/placesService";

/* ──────────── Config ──────────── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const jsonBlockReg = /\[JIMMY_JSON\]([\s\S]*?)\[\/JIMMY_JSON\]/;
const emailReg = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/* ──────────── Prompt del sistema ──────────── */
const systemPrompt = `
You are Jimmy, a world-class, hyper-personalized travel concierge for the Atlántico region of Colombia. Your personality is warm, enthusiastic, curious, and incredibly knowledgeable, like a trusted local friend. You speak colloquially and mix in local slang (e.g., “¡Qué bacano!”, “a la orden”, “fresco”).

Your primary goal is to understand the user's needs and craft the perfect travel experience.

**Your Conversational Style (The Jimmy Way):**

1. **Be Naturally Curious (Don't Interrogate!)**
   • Ask one, maybe two, clarifying questions at a time, always concise and relevant.  
   • If a user asks about food, your first follow-up is about food, not hotel budget.  
   • Avoid form-filling; weave questions naturally as the chat progresses.

2. **Maintain Context & Memory**  
   • Refer back to things the user mentioned.  
   • Example: “Oye, como me dijiste que te gusta la naturaleza…”

3. **Dynamic & Varied Language**  
   • No repetitive phrases. Keep responses fresh, spontaneous, full of local flavor.

4. **The Signature “Local Tip”**  
   • Every specific place recommendation **must** include an insider tip the user won’t easily find online.

---

**Critical JSON Formatting Rule**  
When recommending places, embed a raw JSON array between:  
\`[JIMMY_JSON]\` … \`[/JIMMY_JSON]\`  
No markdown fences. If you aren’t recommending places, omit the block entirely.

**JSON Schema**  
Each object must have:  
• \`name\` (string)  
• \`category\` (“Restaurant” | “Hotel” | “Attraction” | “Beach” | “Nightlife”)  
• \`description\` (string)  
• \`local_tip\` (string)  
• \`address\` (string, Atlántico-plausible)  
• \`price_level\` (number, 1–3)  
• \`rating\` (number, 3.5–5.0, one decimal)

---

**Lead capture (very soft)**  
• Once genuine rapport is built, politely ask for the user’s *name* and *email* so you continue helping them.  
• Example:  
  “Oye, estoy muy feliz de ayudarte hoy, ¿me recuerdas tu nombre y un correo donde pueda mandártelo?”  
• If the user refuses, don’t insist.  
• When the user gives an email, confirm with “¡Perfecto! Ya lo apunto.” and continue helping.
`;

/* ──────────── Utilidades ──────────── */
const sanitizeEmail = (email: string) => email.replace(/\./g, ",");

async function persistConversation(email: string, history: ChatMessage[]) {
  await dbAdmin
    .collection("users")
    .doc(sanitizeEmail(email))
    .collection("conversations")
    .doc()
    .set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // ← fix
      messages: history,
    });
}

function extractPlaces(text: string): { cleanText: string; places: Place[] } {
  const match = text.match(jsonBlockReg);
  if (!match) return { cleanText: text, places: [] };

  try {
    const raw = JSON.parse(match[1].trim());
    const places: Place[] = raw.map((p: any, i: number) => ({
      id: `${p.name}-${i}`,
      name: p.name,
      category: p.category,
      description: p.description,
      local_tip: p.local_tip,
      address: p.address,
      price_level: p.price_level,
      rating: p.rating,
    }));
    const clean = text.replace(jsonBlockReg, "").trim();
    return { cleanText: clean, places };
  } catch {
    return { cleanText: text, places: [] };
  }
}

/* ──────────── Handler ──────────── */
export async function POST(req: NextRequest) {
  try {
    const { history } = (await req.json()) as { history: ChatMessage[] };

    /* Detect email in prior messages */
    const emailInHistory =
      history
        .filter((m) => m.role === "user")
        .map((m) => m.text.match(emailReg)?.[0])
        .find(Boolean) ?? null;

    /* Force email request after 3 user messages if none yet */
    const userMsgCount = history.filter((m) => m.role === "user").length;
    const dynamicLead =
      !emailInHistory && userMsgCount >= 3
        ? "\n\nThe user hasn’t provided an email yet. Politely ask NOW for their name and email so you can send them the complete guide with discounts. Keep it short and friendly."
        : "";

    /* Build conversation block */
    const convo = history
      .map((m) => `${m.role === "user" ? "User" : "Jimmy"}: ${m.text}`)
      .join("\n");

    const prompt = systemPrompt + dynamicLead + "\n" + convo;

    /* Gemini call */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const res = await model.generateContent(prompt);
    let answer = res.response.text().trim();

    /* Extract JSON block */
    const { cleanText, places } = extractPlaces(answer);
    answer = cleanText;

    /* Enrich places with photos */
    const enriched =
      places.length > 0
        ? await Promise.all(
            places.map(async (p) => {
              if (!p.photo) {
                const extra = await findPlaces(`${p.name} ${p.address}`, 1);
                return { ...p, photo: extra[0]?.photo };
              }
              return p;
            })
          )
        : [];

    /* Capture email if now provided */
    const emailNow =
      emailInHistory ||
      (answer.match(emailReg)?.[0] ?? null);

    if (emailNow) {
      await persistConversation(emailNow, [
        ...history,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: answer,
          timestamp: Date.now(),
        },
      ]);
    }

    return NextResponse.json({ text: answer, places: enriched });
  } catch (err) {
    console.error("[Gemini] ERROR →", err);
    return NextResponse.json({ error: "Gemini failed" }, { status: 500 });
  }
}
