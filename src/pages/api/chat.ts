// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";

import { dbAdmin } from "@/lib/firebaseAdmin";          // 👈 helper centralizado

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
interface ChatRequest { messages: Message[] }
interface ChatResponse { reply?: Message; error?: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const body = req.body as ChatRequest;
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: "Sin mensajes para procesar" });
  }

  /** 1️⃣  Destinos registrados **/
  let knownDestinations: { name: string; url: string }[] = [];
  try {
    const snap = await dbAdmin.collection("destinations").get();
    knownDestinations = snap.docs.map((doc) => ({
      name: doc.get("name") as string,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/destinations/${doc.id}`,
    }));
  } catch {
    /* lista vacía si falla */
  }

  /** 2️⃣  Experiencias **/
  let knownExperiences: { title: string; category: string }[] = [];
  try {
    const snap = await dbAdmin.collection("experiences").get();
    knownExperiences = snap.docs.map((doc) => ({
      title: doc.get("title") as string,
      category: doc.get("category") as string,
    }));
  } catch {}

  /** 3️⃣  Texto para el prompt **/
  const destListText = knownDestinations
    .map((d) => `• ${d.name}: ${d.url}`)
    .join("\n");
  const experienceListText = knownExperiences
    .map((e) => `• ${e.title} (${e.category})`)
    .join("\n");

  const systemPrompt = `
Eres Jimmy, un amable asistente costeño de turismo en el Atlántico, Colombia.

📍 Destinos oficiales:
${destListText}

🌴 Experiencias locales:
${experienceListText}

— Menciona siempre nombre y enlace del destino.
— Describe experiencias de forma divertida y útil.
— Si te piden algo fuera del Atlántico, responde que tu foco es la región.
— Tono alegre, amable y costeño.
`.trim();

  /** 4️⃣  Mensajes para OpenAI **/
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...body.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  /** 5️⃣  Llamada a OpenAI **/
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      temperature: 0.8,
    });

    const msg = resp.choices?.[0]?.message;
    if (!msg?.content) throw new Error("Respuesta inválida de OpenAI");

    return res.status(200).json({
      reply: { role: "assistant", content: msg.content.trim() },
    });
  } catch (err) {
    console.error("Error API /chat:", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return res.status(500).json({ error: message });
  }
}
