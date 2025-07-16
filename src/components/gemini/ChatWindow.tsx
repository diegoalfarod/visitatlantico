"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Virtuoso } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Shield, X, ChevronDown } from "lucide-react";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { PlaceCard } from "./PlaceCard";
import { SuggestionChip } from "./SuggestionChip";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  open: boolean;
  messages: ChatMessage[];
  typing: boolean;
  suggestions: string[];
  onSend: (text: string) => void;
  onOpenChange: (v: boolean) => void;
}

export default function ChatWindow({
  open,
  messages,
  typing,
  suggestions,
  onSend,
  onOpenChange,
}: Props) {
  const [draft, setDraft] = useState("");
  const [isBottom, setIsBottom] = useState(true);
  const virtuosoRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---------- Auto-scroll ---------- */
  useEffect(() => {
    if (isBottom) {
      virtuosoRef.current?.scrollToIndex({ index: messages.length, behavior: "smooth" });
    }
  }, [messages, typing, isBottom]);

  /* ---------- Focus al abrir ---------- */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 300);
  }, [open]);

  /* ---------- Enviar ---------- */
  const send = () => {
    if (!draft.trim() || typing) return;
    onSend(draft.trim());
    setDraft("");
    setIsBottom(true);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const handleScroll = (e: any) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 48;
    setIsBottom(atBottom);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-[60] flex flex-col bg-white">
          {/* ---------- Header (sin cambios) ---------- */}
          <header className="bg-white border-b-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    <Image src="/jimmy-avatar.png" alt="Jimmy" width={32} height={32} className="rounded-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col">
                  <Dialog.Title asChild>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-poppins">
                      Jimmy <Shield size={16} className="text-red-600" />
                    </h2>
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 font-medium font-merriweather-sans">Asistente Virtual • Gobernación del Atlántico</p>
                </div>
              </div>
              <Dialog.Close className="group h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X size={18} className="text-gray-600 group-hover:text-gray-800" />
              </Dialog.Close>
            </div>
          </header>

          {/* ---------- Zona de mensajes ---------- */}
          <div className="relative flex-1 overflow-hidden bg-gray-50">
            <Virtuoso
              ref={virtuosoRef}
              totalCount={messages.length}
              className="px-3 sm:px-4 py-4 overflow-x-hidden premium-scrollbar"
              onScroll={handleScroll}
              itemContent={(index) => {
                const m = messages[index];
                const isUser = m.role === "user";
                const isLast = index === messages.length - 1;

                return (
                  <div className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end gap-2 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {!isUser && (
                        <Image
                          src="/jimmy-avatar.png"
                          alt="Jimmy"
                          width={32}
                          height={32}
                          className="rounded-full flex-shrink-0"
                        />
                      )}

                      <div className={`flex flex-col gap-2 flex-1 ${isUser && "items-end"}`}>
                        {/* ------------ Bubble ------------ */}
                        <div
                          className={`
                            break-words whitespace-pre-line w-fit
                            max-w-[90vw] sm:max-w-[80%] md:max-w-[60%]
                            rounded-2xl px-5 py-4 text-sm shadow-sm border
                            ${isUser ? "bg-red-600 text-white border-red-700 rounded-br-md" : "bg-white text-gray-800 border-gray-200 rounded-bl-md"}
                            ${isLast && !isUser ? "animate-message-in" : ""}
                          `}
                          dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br />") }}
                        />

                        {/* ------------ Carrusel de lugares ------------ */}
                        {"places" in m && (
                          <div
                            className="
                              mt-2 flex gap-3 pb-2
                              overflow-x-auto snap-x snap-mandatory
                              premium-scrollbar-horizontal
                              [touch-action:pan-x] [overscroll-behavior-x:contain]
                            "
                          >
                            {(m as any).places.map((p: Place) => (
                              <PlaceCard key={p.id} place={p} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* ---------- Indicador escribiendo + botón scroll (sin cambios) ---------- */}
            {typing && (
              <div className="px-4 sm:px-6 pb-4 flex items-start gap-2">
                <Image src="/jimmy-avatar.png" alt="Jimmy" width={32} height={32} className="rounded-full flex-shrink-0" />
                <TypingIndicator />
              </div>
            )}
            {!isBottom && (
              <button
                onClick={() => {
                  setIsBottom(true);
                  virtuosoRef.current?.scrollToIndex({ index: messages.length, behavior: "smooth" });
                }}
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
              >
                <ChevronDown size={18} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* ---------- Sugerencias + Input (sin cambios) ---------- */}
          {suggestions.length > 0 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <SuggestionChip key={s} label={s} onClick={() => onSend(s)} />
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 bg-white border-t border-gray-200"
          >
            <div className="flex items-end gap-2 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-red-500 focus-within:bg-white">
              <TextareaAutosize
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                maxRows={6}
                placeholder="Escribe tu consulta..."
                className="flex-1 resize-none bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none"
                disabled={typing}
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                className="mb-2 mr-2 h-10 w-10 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {typing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
