// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import { getApps, initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccountKey from "../../../scripts/serviceAccountKey.json";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

interface ChatResponse {
  reply?: Message;
  error?: string;
}

// Inicializa Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountKey as ServiceAccount),
  });
}
const db = getFirestore();

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

  // 1️⃣ Recupera destinos de Firestore
  let knownDestinations: { name: string; url: string }[] = [];
  try {
    const snap = await db.collection("destinations").get();
    knownDestinations = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        name: d.name as string,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/destinations/${doc.id}`,
      };
    });
  } catch {
    // seguimos con lista vacía
  }

  // 2️⃣ Recupera experiencias de Firestore
  let knownExperiences: { title: string; category: string }[] = [];
  try {
    const snap = await db.collection("experiences").get();
    knownExperiences = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        title: d.title as string,
        category: d.category as string,
      };
    });
  } catch {
    // seguimos sin experiencias
  }

  // 3️⃣ Texto para el prompt con destinos
  const destListText = knownDestinations
    .map((d) => `• ${d.name}: ${d.url}`)
    .join("\n");

  // 4️⃣ Texto para el prompt con experiencias
  const experienceListText = knownExperiences
    .map((e) => `• ${e.title} (${e.category})`)
    .join("\n");

  // 5️⃣ Prompt del asistente
  const systemPrompt = `
Eres Jimmy, un amable asistente costeño de turismo en el Atlántico, Colombia.

📍 Aquí tienes la lista de **destinos turísticos oficiales** en nuestra web:
${destListText}

🌴 Y estas son algunas **experiencias locales** recomendadas:
${experienceListText}

— Cuando recomiendes destinos, menciona su nombre y el enlace exacto.
— Cuando recomiendes experiencias, trata de describirlas de forma divertida y útil.
— Si sugieres lugares fuera de la lista, indícalos como recomendaciones externas.
— IMPORTANTE: tu función es exclusivamente dar ayuda y recomendaciones de turismo en la región del Atlántico.
— Si el usuario pregunta algo fuera de ese ámbito, responde:
  "Lo siento, soy Jimmy, tu guía turístico del Atlántico. Mi conocimiento está enfocado solo en turismo de esta región. ¿En qué puedo ayudarte sobre el Atlántico?"

Responde siempre con tono alegre, amable y costeño.
`.trim();

  // 6️⃣ Prepara mensajes para OpenAI
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // 7️⃣ Ejecuta la llamada a OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      temperature: 0.8,
    });

    const msg = response.choices?.[0]?.message;
    if (!msg?.content) {
      throw new Error("Respuesta inválida de OpenAI");
    }
    const reply: Message = {
      role: msg.role as "assistant",
      content: msg.content.trim(),
    };
    return res.status(200).json({ reply });
  } catch (err: unknown) {
    console.error("Error API /chat:", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return res.status(500).json({ error: message });
  }
}
