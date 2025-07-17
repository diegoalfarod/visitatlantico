import type { ChatMessage } from "@/types/geminiChat";

/**
 * Generador de UUID compatible con todos los navegadores
 */
function generateId(): string {
  // Primero intentar con crypto.randomUUID si está disponible
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Si no está disponible, usar crypto.getRandomValues
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    
    // Convertir a formato UUID v4
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant bits
    
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  
  // Fallback para SSR o navegadores muy antiguos
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
    id: generateId(),
    role: "assistant",
    text: data.text,
    timestamp: Date.now(),
    places: data.places ?? [],
  };
}

/** Helper para crear un mensaje de usuario */
export function createUserMessage(text: string): ChatMessage {
  return {
    id: generateId(),
    role: "user",
    text,
    timestamp: Date.now(),
  };
}