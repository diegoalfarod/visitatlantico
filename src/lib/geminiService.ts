import type { ChatMessage} from "@/types/geminiChat";

/**
 * Llama a /api/gemini (server-side) y devuelve el mensaje del asistente.
 */
export async function sendChatMessage(
  history: ChatMessage[]
): Promise<ChatMessage> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history }),
  });

  if (!res.ok) {
    throw new Error("Gemini proxy returned " + res.status);
  }

  const data = await res.json(); // { text, places? }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: data.text,
    timestamp: Date.now(),
    places: data.places ?? [],
  };
}

/** Helper para crear un mensaje de usuario */
export function createUserMessage(text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    text,
    timestamp: Date.now(),
  };
}
