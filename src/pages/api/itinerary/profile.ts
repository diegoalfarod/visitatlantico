import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface ProfileResponse {
  questions?: string[];
  raw?: string;
  error?: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const systemPrompt = `
Eres un asistente de turismo del Atlántico, Colombia.
Formula 4 preguntas amigables para conocer mejor los intereses del viajero.
Las preguntas deben enfocarse en:
- Tipo de actividades que prefieren (playa, aventura, cultura, gastronomía, etc).
- Tiempo disponible para el paseo (en horas o días).
- Presupuesto estimado.
- Medio de transporte preferido (a pie, carro, taxi, bicicleta).

Responde ÚNICAMENTE con un array JSON de strings, sin explicaciones ni texto adicional.
Ejemplo correcto:
["¿Qué tipo de actividades te gustaría hacer?", "¿Cuántos días tienes disponibles?", "¿Cuál es tu presupuesto aproximado?", "¿Cómo prefieres movilizarte durante el tour?"]
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      max_tokens: 150,
    });

    const raw = response.choices?.[0]?.message?.content?.trim() ?? "";
    let questions: string[];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every((q) => typeof q === "string")) {
        throw new Error("Parsed value is not a string array");
      }
      questions = parsed;
      return res.status(200).json({ questions });
    } catch {
      console.error("Failed to parse questions JSON; raw was:", raw);
      const trimmed = raw.replace(/^\[|\]$/g, "");
      const lines = trimmed
        .split(/"\s*,\s*"/)
        .map((l) => l.replace(/^"+|"+$/g, "").trim())
        .filter(Boolean);
      return res
        .status(200)
        .json({ questions: lines, raw, error: "Se usó fallback de líneas" });
    }
  } catch (errorUnknown) {
    console.error("API error (profile):", errorUnknown);
    const message =
      errorUnknown instanceof Error ? errorUnknown.message : "Error desconocido";
    return res.status(500).json({ error: message });
  }
}
