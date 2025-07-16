// ChatWindow.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Virtuoso } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Send, Shield, X, ChevronDown } from "lucide-react";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { PlaceCard } from "./PlaceCard";
import { SuggestionChip } from "./SuggestionChip";
import { TypingIndicator } from "./TypingIndicator";
import { useMediaQuery } from "react-responsive";

interface Props {
  open: boolean;
  messages: ChatMessage[];
  typing: boolean;
  suggestions: string[];
  onSend: (text: string) => void;
  onOpenChange: (v: boolean) => void;
}

/* ---------- Posibles tamaños de fuente ---------- */
type FontSize = "text-sm" | "text-base" | "text-lg";

export default function ChatWindow({
  open,
  messages,
  typing,
  suggestions,
  onSend,
  onOpenChange,
}: Props) {
  /* ---------- Estados ---------- */
  const [draft, setDraft] = useState("");
  const [isBottom, setIsBottom] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const virtuosoRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [predictedText, setPredictedText] = useState("");
  const [userLanguage, setUserLanguage] = useState("es");

  // iniciamos en text-base (16 px) para evitar auto-zoom en móviles
  const [fontSize, setFontSize] = useState<FontSize>("text-base");

  const toggleDarkMode = () => setIsDark(!isDark);

  /* ---------- Predicción de texto (mock) ---------- */
  const predictText = (text: string) => {
    const phrases = ["Hola, ¿cómo estás?", "Quiero reservar un hotel", "Gracias por la ayuda"];
    const prediction = phrases.find((p) => p.startsWith(text));
    setPredictedText(prediction || "");
  };

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
  const send = useCallback(() => {
    if (!draft.trim() || typing) return;
    onSend(draft.trim());
    setDraft("");
    setPredictedText("");
    setIsBottom(true);
  }, [draft, onSend, typing]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  const handleScroll = useCallback((e: any) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 48;
    setIsBottom(atBottom);
  }, []);

  /* ---------- Ajustar tamaño de fuente ---------- */
  const increaseFontSize = () =>
    setFontSize((prev) => (prev === "text-base" ? "text-lg" : "text-lg"));

  const decreaseFontSize = () =>
    setFontSize((prev) => {
      // en móvil nunca bajar de text-base (16 px)
      if (isMobile) return "text-base";
      if (prev === "text-lg") return "text-base";
      return "text-sm";
    });

  /* ---------- Estilo compartido de botones del header ---------- */
  const btnStyle = `h-10 w-10 rounded-lg border flex items-center justify-center
    ${
      isDark
        ? "bg-gray-600 hover:bg-gray-500 border-gray-500"
        : "bg-gray-200 hover:bg-gray-300 border-gray-300"
    }`;

  /* ---------- Render ---------- */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* ---------- Overlay ---------- */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

        {/* ---------- Content ---------- */}
        <Dialog.Content
          className={`fixed inset-0 z-[60] flex flex-col ${
            isDark ? "bg-gray-800 text-white" : "bg-white"
          } ${isMobile ? "rounded-none" : "rounded-lg"}`}
        >
          {/* ---------- Header ---------- */}
          <header
            className={`border-b shadow-sm ${
              isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
              {/* ---------- Avatar + título ---------- */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Jimmy"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col">
                  <Dialog.Title asChild>
                    <h2
                      className="text-xl font-bold flex items-center gap-2 font-poppins"
                      style={{ color: "#4A4F55", fontFamily: "Poppins" }}
                    >
                      Jimmy <Shield size={16} className="text-red-600" />
                    </h2>
                  </Dialog.Title>
                  <p
                    className="text-sm font-medium font-merriweather-sans"
                    style={{ color: "#7A888C", fontFamily: "Merriweather Sans" }}
                  >
                    Asistente Virtual • Gobernación del Atlántico
                  </p>
                </div>
              </div>

              {/* ---------- Controles ---------- */}
              <div className="flex gap-2">
                <button onClick={increaseFontSize} className={btnStyle}>
                  A+
                </button>
                <button onClick={decreaseFontSize} className={btnStyle}>
                  A-
                </button>
                <button onClick={toggleDarkMode} className={btnStyle}>
                  {isDark ? "Light" : "Dark"}
                </button>
                <Dialog.Close className={`${btnStyle} group`}>
                  <X size={18} className="text-gray-600 group-hover:text-gray-800" />
                </Dialog.Close>
              </div>
            </div>
          </header>

          {/* ---------- Zona de mensajes ---------- */}
          <div className={`relative flex-1 overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
            <Virtuoso
              ref={virtuosoRef}
              totalCount={messages.length}
              className="px-3 sm:px-4 py-4 overflow-x-hidden"
              onScroll={handleScroll}
              itemContent={(index) => {
                const m = messages[index];
                const isUser = m.role === "user";
                const isLast = index === messages.length - 1;

                return (
                  <div key={index} className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
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
                        {/* ---------- Bubble ---------- */}
                        <div
                          className={`
                            break-words whitespace-pre-line w-fit
                            max-w-[90vw] sm:max-w-[80%] md:max-w-[60%]
                            rounded-2xl px-4 py-3 ${fontSize} shadow-sm border
                            ${
                              isUser
                                ? "bg-[#E40E20] text-white border-[#E40E20] rounded-br-md"
                                : `${
                                    isDark
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-[#4A4F55] border-[#C1C5C8]"
                                  } rounded-bl-md`
                            }
                            ${isLast && !isUser ? "animate-message-in" : ""}
                          `}
                          style={{ fontFamily: "Merriweather Sans" }}
                          dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br />") }}
                        />

                        {/* ---------- Carrusel de lugares ---------- */}
                        {"places" in m && (
                          <div
                            key={JSON.stringify((m as any).places)}
                            className={`
                              mt-2 flex gap-3 pb-2
                              ${isMobile ? "flex-col" : "overflow-x-auto snap-x snap-mandatory"}
                              [touch-action:pan-x] [overscroll-behavior-x:contain] scroll-smooth
                            `}
                            style={isMobile ? {} : { WebkitOverflowScrolling: "touch" }}
                          >
                            {(m as any).places.map((p: Place) => (
                              <PlaceCard
                                key={p.id}
                                place={p}
                                isMobile={isMobile}
                                isDark={isDark}
                                fontSize={fontSize}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* ---------- Indicador escribiendo ---------- */}
            {typing && (
              <div className="px-4 sm:px-6 pb-4 flex items-start gap-2">
                <Image
                  src="/jimmy-avatar.png"
                  alt="Jimmy"
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <TypingIndicator />
              </div>
            )}

            {/* ---------- Botón scroll al fondo ---------- */}
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

          {/* ---------- Sugerencias ---------- */}
          {suggestions.length > 0 && (
            <div
              className={`px-4 py-3 border-t ${
                isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <SuggestionChip key={s} label={s} onClick={() => onSend(s)} small={isMobile} />
                ))}
              </div>
            </div>
          )}

          {/* ---------- Input ---------- */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className={`p-3 border-t ${
              isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
            }`}
          >
            {predictedText && (
              <div className={`mb-2 ${fontSize} italic ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {predictedText}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-[#E40E20] focus-within:bg-white">
              <TextareaAutosize
                ref={textareaRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  predictText(e.target.value);
                }}
                onKeyDown={handleKey}
                maxRows={6}
                placeholder="Escribe tu consulta..."
                className={`flex-1 resize-none bg-transparent px-3 py-3 ${fontSize} ${
                  isDark ? "text-white" : "text-gray-800"
                } placeholder-gray-500 outline-none`}
                disabled={typing}
                style={{ fontFamily: "Merriweather Sans" }}
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                className="mb-2 mr-2 h-10 w-10 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ backgroundColor: "#E40E20" }}
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
