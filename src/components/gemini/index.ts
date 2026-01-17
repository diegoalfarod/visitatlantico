// =============================================================================
// src/components/gemini/index.ts
// 
// Exportaciones del módulo de chat Jimmy
// =============================================================================

export { default as TourismChatWidget } from "./TourismChatWidget";
export { default as ChatWindow } from "./ChatWindow";
export { SuggestionChip } from "./SuggestionChip";
export { TypingIndicator } from "./TypingIndicator";
export { PlaceCard } from "./PlaceCard";

// Re-export types
export type { ChatMessage } from "@/lib/claudeService";
export type { CuratedPlace } from "@/data/atlantico-places";