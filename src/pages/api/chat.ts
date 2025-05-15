// src/pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import { dbAdmin } from "@/lib/firebaseAdmin";

interface Message {
  role: "user" | "assistant" | "system";
  content?: string;
}

interface ChatRequest {
  messages: Message[];
  language?: "es" | "en";
}

interface DestinationCard {
  id: string;
  name: string;
  url: string;
  image?: string;
  tagline?: string;
}

interface ChatResponse {
  reply?: { role: "assistant"; content: string };
  cards?: DestinationCard[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { messages, language } = req.body as ChatRequest;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Sin mensajes para procesar" });
  }

  // 1️⃣ Carga destinos desde Firestore
  let knownDestinations: DestinationCard[] = [];
  try {
    const snap = await dbAdmin.collection("destinations").get();
    knownDestinations = snap.docs.map((doc) => {
      const name = doc.get("name") as string;
      const rawImagePath = doc.get("imagePath") as string | undefined;
      const tagline = doc.get("tagline") as string | undefined;
      // Asegurarnos de remover barras iniciales
      const cleanPath = rawImagePath?.replace(/^\/+/, "");
      return {
        id: doc.id,
        name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/destinations/${doc.id}`,
        image: cleanPath
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/${cleanPath}`
          : undefined,
        tagline,
      };
    });
  } catch (e) {
    console.error("Error cargando destinos:", e);
  }

  // 2️⃣ Generamos texto para el prompt
  const destListText = knownDestinations
    .map((d) => `• ${d.name}: ${d.url}`)
    .join("\n");

  // 3️⃣ Construimos el prompt del sistema
  const basePrompt = `
Eres Jimmy, un asistente alegre de turismo en Atlántico, Colombia.
Here are the official destinations:
${destListText}

Cuando el usuario pida recomendaciones, devuelve **una lista JSON** llamando a la función \`destination_cards\` con todos los destinos sugeridos. Cuando des recomendaciones, **elige un máximo de 3 destinos**.
`.trim();

  // 4️⃣ Directiva de idioma
  const lang = language === "en" ? "en" : "es";
  const languageDirective =
    lang === "en"
      ? "Respond ONLY in English."
      : "Responde SOLO en español.";

  // 5️⃣ Definición de la función para devolver tarjetas
  const functions = [
    {
      name: "destination_cards",
      description: "Returns an array of structured cards for multiple destinations",
      parameters: {
        type: "object",
        properties: {
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                url: { type: "string" },
                image: { type: "string" },
                tagline: { type: "string" },
              },
              required: ["id", "name", "url"],
            },
          },
        },
        required: ["cards"],
      },
    },
  ];

  // 6️⃣ Mensajes para OpenAI
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: basePrompt },
    { role: "system", content: languageDirective },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content || "",
    })),
  ];

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      functions,
      function_call: "auto",
      temperature: 0.8,
    });

    const choice = resp.choices[0].message;

    // 7️⃣ Si OpenAI invocó a destination_cards
    if (
      choice.function_call?.name === "destination_cards" &&
      choice.function_call.arguments
    ) {
      const parsed = JSON.parse(choice.function_call.arguments);
      // Filtrar sólo los destinos válidos y limitar a 3
      const cards: DestinationCard[] = (parsed.cards as DestinationCard[])
        .filter((c) => knownDestinations.some((d) => d.id === c.id))
        .slice(0, 3);

      return res.status(200).json({
        reply: {
          role: "assistant",
          content:
            lang === "en"
              ? "Here are some recommendations for you:"
              : "Aquí tienes algunas recomendaciones:",
        },
        cards,
      });
    }

    // 8️⃣ Si no hubo invocación de función, devolvemos el texto plano
    if (choice.content) {
      return res
        .status(200)
        .json({ reply: { role: "assistant", content: choice.content.trim() } });
    }

    throw new Error("Respuesta inesperada de OpenAI");
  } catch (err) {
    console.error("Error en /api/chat:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Error desconocido",
    });
  }
}
