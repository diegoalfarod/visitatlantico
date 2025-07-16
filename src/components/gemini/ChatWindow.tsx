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
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const virtuosoRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ─── Auto scroll y detección de scroll ─── */
  useEffect(() => {
    if (isScrolledToBottom) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length,
        behavior: "smooth",
      });
    }
  }, [messages, typing, isScrolledToBottom]);

  /* ─── Focus textarea cuando se abre ─── */
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [open]);

  /* ─── Enviar mensaje ─── */
  const send = () => {
    if (!draft.trim() || typing) return;
    onSend(draft.trim());
    setDraft("");
    setIsScrolledToBottom(true);
  };

  /* ─── Manejo de teclado ─── */
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  /* ─── Scroll handler ─── */
  const handleScroll = (e: any) => {
    const element = e.target;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setIsScrolledToBottom(isAtBottom);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300" />

        <Dialog.Content className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in-0 zoom-in-95 duration-300">
          
          {/* Header Institucional */}
          <header className="relative bg-white border-b-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              {/* Logo y Branding */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Jimmy - Asistente Virtual"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                
                <div className="flex flex-col">
                  <Dialog.Title asChild>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-poppins">
                      Jimmy
                      <Shield size={16} className="text-red-600" />
                    </h2>
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 font-medium font-merriweather-sans">
                    Asistente Virtual • Gobernación del Atlántico
                  </p>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                <Dialog.Close
                  aria-label="Cerrar chat"
                  className="group h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                >
                  <X size={18} className="text-gray-600 group-hover:text-gray-800" />
                </Dialog.Close>
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <div className="relative flex-1 overflow-hidden bg-gray-50">
            <Virtuoso
              ref={virtuosoRef}
              totalCount={messages.length}
              className="px-6 py-4 premium-scrollbar"
              onScroll={handleScroll}
              itemContent={(index) => {
                const m = messages[index];
                const isUser = m.role === "user";
                const isLast = index === messages.length - 1;

                return (
                  <div
                    className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`group flex items-end gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      {!isUser && (
                        <div className="relative flex-shrink-0 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                            <Image
                              src="/jimmy-avatar.png"
                              alt="Jimmy"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
                        {/* Message Bubble */}
                        <div
                          className={`relative group/bubble max-w-full break-words rounded-2xl px-5 py-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md font-merriweather-sans ${
                            isUser
                              ? "bg-red-600 text-white rounded-br-md border border-red-700"
                              : "bg-white border border-gray-200 rounded-bl-md text-gray-800"
                          } ${isLast && !isUser ? 'animate-message-in' : ''}`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: m.text.replace(/\n/g, "<br />"),
                            }}
                          />
                        </div>

                        {/* Places Cards */}
                        {"places" in m && (
                          <div className="mt-2 flex gap-3 overflow-x-auto snap-x premium-scrollbar-horizontal pb-2">
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

            {/* Typing Indicator */}
            {typing && (
              <div className="px-6 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Jimmy"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* Scroll to Bottom Button */}
            {!isScrolledToBottom && (
              <button
                onClick={() => {
                  setIsScrolledToBottom(true);
                  virtuosoRef.current?.scrollToIndex({
                    index: messages.length,
                    behavior: "smooth",
                  });
                }}
                className="absolute bottom-4 right-6 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center group"
              >
                <ChevronDown size={16} className="text-gray-600 group-hover:text-gray-800" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <SuggestionChip key={s} label={s} onClick={() => onSend(s)} />
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-4"
            >
              <div className="relative">
                <div className="relative flex items-end gap-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-red-500 focus-within:bg-white transition-all duration-200">
                  
                  {/* Textarea */}
                  <TextareaAutosize
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKey}
                    maxRows={6}
                    placeholder="Escribe tu consulta sobre el Atlántico..."
                    className="flex-1 resize-none bg-transparent px-4 py-3 text-gray-800 placeholder-gray-500 outline-none font-merriweather-sans"
                    disabled={typing}
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!draft.trim() || typing}
                    className="m-2 h-10 w-10 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
                  >
                    {typing ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Send size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </button>
                </div>

                {/* Character counter */}
                {draft.length > 500 && (
                  <div className="absolute -top-6 right-2 text-xs text-gray-500">
                    {draft.length}/1000
                  </div>
                )}
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}