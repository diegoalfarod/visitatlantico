"use client";

import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import { Send, Shield, X, ChevronDown, MinusCircle, PlusCircle, Moon, Sun } from "lucide-react";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { PlaceCard } from "./PlaceCard";
import { SuggestionChip } from "./SuggestionChip";
import { TypingIndicator } from "./TypingIndicator";
import { useMediaQuery } from "react-responsive";

/* --------- Tipos --------- */
interface Props {
  open: boolean;
  messages: ChatMessage[];
  typing: boolean;
  suggestions: string[];
  onSend: (text: string) => void;
  onOpenChange: (v: boolean) => void;
  keyboardHeight: number;
  viewportHeight: number;
}

type FontSize = "text-sm" | "text-base" | "text-lg";

/* -------------------------------------------------------------------------- */

export default function ChatWindow({
  open,
  messages,
  typing,
  suggestions,
  onSend,
  onOpenChange,
  keyboardHeight,
  viewportHeight,
}: Props) {
  /* --------- Estado --------- */
  const [draft, setDraft] = useState("");
  const [isBottom, setIsBottom] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("text-base");
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  /* --------- Refs --------- */
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* --------- Efecto: Animación de apertura/cierre --------- */
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Focus después de la animación
      setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true });
      }, 300);
    }
  }, [open]);

  /* --------- Efecto: Auto-scroll cuando llegan mensajes --------- */
  useEffect(() => {
    if (isBottom && virtuosoRef.current && messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior: "smooth",
        align: "end",
      });
    }
  }, [messages, typing, isBottom]);

  /* --------- Efecto: Ajustar scroll cuando aparece el teclado --------- */
  useEffect(() => {
    if (keyboardHeight > 0 && virtuosoRef.current && messages.length > 0) {
      // Pequeño delay para asegurar que el DOM se actualice
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior: "smooth",
          align: "end",
        });
      }, 100);
    }
  }, [keyboardHeight, messages.length]);

  /* --------- Enviar mensaje --------- */
  const send = useCallback(() => {
    if (!draft.trim() || typing) return;
    onSend(draft.trim());
    setDraft("");
    setIsBottom(true);

    // Scroll al nuevo mensaje
    setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length,
        behavior: "smooth",
        align: "end",
      });
    }, 50);
  }, [draft, onSend, typing, messages.length]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  /* --------- Detectar si el usuario está al final del scroll --------- */
  const handleScroll = useCallback((isAtBottom: boolean) => {
    setIsBottom(isAtBottom);
  }, []);

  /* --------- Controles de tamaño de fuente --------- */
  const increaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === "text-sm") return "text-base";
      if (prev === "text-base") return "text-lg";
      return "text-lg";
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === "text-lg") return "text-base";
      if (prev === "text-base") return isMobile ? "text-base" : "text-sm";
      return prev;
    });
  };

  /* --------- Cerrar chat --------- */
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onOpenChange(false);
    }, 300);
  };

  /* --------- Altura calculada para el contenedor --------- */
  const containerHeight = viewportHeight > 0 ? viewportHeight : window.innerHeight;
  const hasKeyboard = keyboardHeight > 50;

  if (!open) return null;

  /* ==========================================================================
     Render
     ========================================================================== */
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className={`chat-container fixed bottom-0 left-0 right-0 z-[60] bg-white flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        } ${isDark ? "dark bg-gray-900" : ""}`}
        style={{
          height: containerHeight,
          maxHeight: "100vh",
          WebkitTransform: isAnimating ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Header */}
        <header
          className={`border-b shadow-sm flex-shrink-0 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
            {/* Avatar + título */}
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
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: isDark ? "#ffffff" : "#4A4F55", fontFamily: "Poppins" }}
                >
                  Jimmy <Shield size={16} className="text-red-600" />
                </h2>
                <p
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#94a3b8" : "#7A888C", fontFamily: "Merriweather Sans" }}
                >
                  Asistente Virtual • Gobernación del Atlántico
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-1.5">
              {!isMobile && (
                <>
                  <button
                    onClick={increaseFontSize}
                    className="h-9 w-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      borderColor: isDark ? "#4b5563" : "#e5e7eb",
                    }}
                  >
                    <PlusCircle size={18} className={isDark ? "text-gray-300" : "text-gray-600"} />
                  </button>
                  <button
                    onClick={decreaseFontSize}
                    className="h-9 w-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      borderColor: isDark ? "#4b5563" : "#e5e7eb",
                    }}
                  >
                    <MinusCircle size={18} className={isDark ? "text-gray-300" : "text-gray-600"} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsDark(!isDark)}
                className="h-9 w-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isDark ? "#374151" : "#f3f4f6",
                  borderColor: isDark ? "#4b5563" : "#e5e7eb",
                }}
              >
                {isDark ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-gray-600" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="h-9 w-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-50 hover:border-red-300"
                style={{
                  backgroundColor: isDark ? "#374151" : "#f3f4f6",
                  borderColor: isDark ? "#4b5563" : "#e5e7eb",
                }}
              >
                <X size={18} className={isDark ? "text-gray-300" : "text-gray-600"} />
              </button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className={`flex-1 overflow-hidden relative ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
          style={{
            paddingBottom: hasKeyboard ? "0" : "env(safe-area-inset-bottom, 0)",
          }}
        >
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            totalCount={messages.length}
            alignToBottom
            followOutput="smooth"
            overscan={200}
            atBottomStateChange={handleScroll}
            style={{
              height: "100%",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
            itemContent={(index, message) => {
              const isUser = message.role === "user";
              const isLast = index === messages.length - 1;

              return (
                <div
                  key={message.id}
                  className={`px-4 sm:px-6 ${index === 0 ? "pt-4" : ""} ${
                    index === messages.length - 1 ? "pb-20 sm:pb-24" : ""
                  } mb-4`}
                >
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isUser && (
                        <Image
                          src="/jimmy-avatar.png"
                          alt="Jimmy"
                          width={32}
                          height={32}
                          className="rounded-full flex-shrink-0 mb-1"
                        />
                      )}

                      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
                        {/* Message Bubble */}
                        <div
                          className={`
                            break-words whitespace-pre-line
                            rounded-2xl px-4 py-3 ${fontSize} shadow-sm
                            ${
                              isUser
                                ? "bg-[#E40E20] text-white rounded-br-md"
                                : `${
                                    isDark
                                      ? "bg-gray-800 text-white border border-gray-700"
                                      : "bg-white text-[#4A4F55] border border-gray-200"
                                  } rounded-bl-md`
                            }
                            ${isLast && !isUser ? "animate-message-in" : ""}
                          `}
                          style={{ fontFamily: "Merriweather Sans" }}
                          dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, "<br />") }}
                        />

                        {/* Place Cards */}
                        {"places" in message && (message as any).places && (
                          <div
                            className={`
                              mt-2 flex gap-3 pb-2
                              ${isMobile ? "flex-col" : "overflow-x-auto snap-x snap-mandatory"}
                              scrollbar-hide
                            `}
                          >
                            {(message as any).places.map((place: Place) => (
                              <PlaceCard
                                key={place.id}
                                place={place}
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
                </div>
              );
            }}
            components={{
              Footer: () =>
                typing ? (
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
                ) : null,
            }}
          />

          {/* Scroll to bottom button */}
          {!isBottom && messages.length > 3 && (
            <div className={`absolute ${isMobile ? 'bottom-[90px]' : 'bottom-24'} right-4 flex flex-col items-end gap-2`}>
              {/* Indicador de mensajes nuevos - solo desktop */}
              {!isMobile && (
                <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border border-gray-200 dark:border-gray-700 text-sm animate-fade-in">
                  <span className="text-gray-600 dark:text-gray-300">Nuevos mensajes</span>
                </div>
              )}
              
              {/* Botón de scroll */}
              <button
                onClick={() => {
                  setIsBottom(true);
                  virtuosoRef.current?.scrollToIndex({
                    index: messages.length - 1,
                    behavior: "smooth",
                    align: "end",
                  });
                }}
                className={`group relative ${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full shadow-lg 
                  flex items-center justify-center transition-all duration-200
                  hover:scale-110 active:scale-95 backdrop-blur-sm
                  ${isDark 
                    ? "bg-gray-800/90 hover:bg-gray-700 border border-gray-600" 
                    : "bg-white/90 hover:bg-white border border-gray-200"
                  }
                `}
              >
                {/* Efecto de pulso - solo cuando hay mensajes nuevos */}
                {!isMobile && (
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping" />
                )}
                
                {/* Icono */}
                <ChevronDown 
                  size={isMobile ? 18 : 20} 
                  className={`relative z-10 transition-transform duration-200 group-hover:translate-y-0.5
                    ${isDark ? "text-gray-300" : "text-gray-700"}`
                  } 
                />
                
                {/* Badge de contador en móvil */}
                {isMobile && messages.length > 5 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">↓</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !hasKeyboard && (
          <div
            className={`px-4 py-3 border-t flex-shrink-0 relative z-10 ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <SuggestionChip
                  key={suggestion}
                  label={suggestion}
                  onClick={() => onSend(suggestion)}
                  small={isMobile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className={`border-t flex-shrink-0 relative z-10 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-lg`}
          style={{
            paddingBottom: hasKeyboard ? "8px" : "env(safe-area-inset-bottom, 8px)",
          }}
        >
          <div className="p-3 sm:p-4">
            <div
              className={`flex items-end gap-2 rounded-2xl border transition-all ${
                isDark
                  ? "bg-gray-700 border-gray-600 focus-within:border-gray-500"
                  : "bg-gray-50 border-gray-200 focus-within:border-[#E40E20] focus-within:bg-white"
              }`}
            >
              <TextareaAutosize
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => {
                  // Asegurar que los mensajes estén visibles
                  if (virtuosoRef.current && messages.length > 0) {
                    setTimeout(() => {
                      virtuosoRef.current?.scrollToIndex({
                        index: messages.length - 1,
                        behavior: "smooth",
                        align: "end",
                      });
                    }, 100);
                  }
                }}
                minRows={1}
                maxRows={4}
                placeholder="Escribe tu consulta..."
                className={`flex-1 resize-none bg-transparent px-4 py-3 ${fontSize} ${
                  isDark ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                } outline-none min-h-[44px]`}
                disabled={typing}
                style={{ 
                  fontFamily: "Merriweather Sans"
                }}
              />

              <button
                type="submit"
                disabled={!draft.trim() || typing}
                className={`mb-2 mr-2 h-11 w-11 rounded-xl flex items-center justify-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${
                    !draft.trim() || typing
                      ? "bg-gray-300 cursor-not-allowed opacity-50"
                      : "bg-[#E40E20] hover:bg-[#d40d1d] shadow-md hover:shadow-lg"
                  }
                `}
              >
                {typing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Estilos adicionales */}
      <style jsx global>{`
        /* Animación de entrada de mensajes */
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-message-in {
          animation: message-in 0.3s ease-out;
        }

        /* Ocultar scrollbar en el carrusel de lugares */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Prevenir el zoom en iOS cuando el input tiene focus */
        @media (max-width: 768px) {
          input[type="text"],
          input[type="email"],
          input[type="number"],
          input[type="tel"],
          textarea {
            font-size: 16px !important;
          }
        }

        /* Dark mode styles */
        .dark {
          color-scheme: dark;
        }
      `}</style>
    </>
  );
}