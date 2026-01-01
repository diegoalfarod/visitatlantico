"use client";

import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import TextareaAutosize from "react-textarea-autosize";
import DOMPurify from "dompurify";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Shield, 
  X, 
  ChevronDown, 
  MinusCircle, 
  PlusCircle, 
  Moon, 
  Sun,
  Sparkles 
} from "lucide-react";
import type { ChatMessage, Place } from "@/types/geminiChat";
import { PlaceCard } from "./PlaceCard";
import { SuggestionChip } from "./SuggestionChip";
import { TypingIndicator } from "./TypingIndicator";
import { useMediaQuery } from "react-responsive";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// Dorado accent: #eab308
// =============================================================================

/* --------- Constants --------- */
const ANIMATION_DURATION = 300;
const SCROLL_DELAY = 100;
const FOCUS_DELAY = 300;

const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

/* --------- Types --------- */
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

/* --------- Type Guards --------- */
interface ChatMessageWithPlaces extends ChatMessage {
  places?: Place[];
}

function hasPlaces(msg: ChatMessage): msg is ChatMessageWithPlaces {
  return 'places' in msg && Array.isArray((msg as ChatMessageWithPlaces).places);
}

/* --------- Memoized Message Item --------- */
interface MessageItemProps {
  message: ChatMessage;
  index: number;
  isLast: boolean;
  messagesLength: number;
  fontSize: FontSize;
  isDark: boolean;
  isMobile: boolean;
}

const MessageItem = memo(function MessageItem({
  message,
  index,
  isLast,
  messagesLength,
  fontSize,
  isDark,
  isMobile,
}: MessageItemProps) {
  const isUser = message.role === "user";

  // Sanitize HTML content
  const sanitizedHtml = useMemo(() => 
    DOMPurify.sanitize(message.text.replace(/\n/g, "<br />")),
    [message.text]
  );

  return (
    <div
      className={`px-4 sm:px-6 ${index === 0 ? "pt-6" : ""} ${
        index === messagesLength - 1 ? "pb-24 sm:pb-28" : ""
      } mb-4`}
    >
      <motion.div 
        initial={isLast && !isUser ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex items-end gap-3 max-w-[88%] sm:max-w-[75%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar - Solo para mensajes del bot */}
          {!isUser && (
            <div className="relative flex-shrink-0 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E40E20] to-[#D31A2B] p-0.5 shadow-lg shadow-red-500/20">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src="/jimmy-avatar.png"
                    alt="Jimmy"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </div>
              </div>
              {/* Status dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          )}

          <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
            {/* Message Bubble */}
            <div
              className={`
                relative break-words whitespace-pre-line
                rounded-2xl px-4 py-3 ${fontSize}
                ${
                  isUser
                    ? "bg-gradient-to-br from-[#E40E20] to-[#D31A2B] text-white rounded-br-md shadow-lg shadow-red-500/20"
                    : `${
                        isDark
                          ? "bg-gray-800/90 text-white border border-gray-700/50 backdrop-blur-sm"
                          : "bg-white text-[#4A4F55] border border-[#C1C5C8]/30 shadow-sm"
                      } rounded-bl-md`
                }
              `}
              style={{ fontFamily: "'Merriweather Sans', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* Place Cards */}
            {hasPlaces(message) && message.places && (
              <div
                className={`
                  mt-3 flex gap-3 pb-2 w-full
                  ${isMobile ? "flex-col" : "overflow-x-auto snap-x snap-mandatory scrollbar-hide"}
                `}
              >
                {message.places.map((place: Place) => (
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

            {/* Timestamp - Solo para mensajes del bot */}
            {!isUser && (
              <div className="flex items-center gap-2 text-[11px] text-[#7A858C]">
                <Shield size={10} className="text-[#E40E20]" />
                <span style={{ fontFamily: "'Merriweather Sans', sans-serif" }}>
                  AI Chatbot • Gobernación del Atlántico
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
});

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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* --------- Efecto: Animación de apertura/cierre --------- */
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true });
      }, FOCUS_DELAY);
      return () => clearTimeout(timer);
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
      const timer = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: messages.length - 1,
          behavior: "smooth",
          align: "end",
        });
      }, SCROLL_DELAY);
      return () => clearTimeout(timer);
    }
  }, [keyboardHeight, messages.length]);

  /* --------- Enviar mensaje --------- */
  const send = useCallback(() => {
    if (!draft.trim() || typing) return;
    onSend(draft.trim());
    setDraft("");
    setIsBottom(true);

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
  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      if (prev === "text-sm") return "text-base";
      if (prev === "text-base") return "text-lg";
      return "text-lg";
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      if (prev === "text-lg") return "text-base";
      if (prev === "text-base") return isMobile ? "text-base" : "text-sm";
      return prev;
    });
  }, [isMobile]);

  /* --------- Cerrar chat --------- */
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onOpenChange(false);
    }, ANIMATION_DURATION);
  }, [onOpenChange]);

  /* --------- Scroll to bottom --------- */
  const scrollToBottom = useCallback(() => {
    setIsBottom(true);
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      behavior: "smooth",
      align: "end",
    });
  }, [messages.length]);

  /* --------- Altura calculada para el contenedor --------- */
  const containerHeight = viewportHeight > 0 ? viewportHeight : (typeof window !== 'undefined' ? window.innerHeight : 0);
  const hasKeyboard = keyboardHeight > 50;

  if (!open) return null;

  /* ==========================================================================
     Render
     ========================================================================== */
  return (
    <>
      {/* Overlay con blur cinematográfico */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
        className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Chat Container */}
      <motion.div
        ref={chatContainerRef}
        initial={{ y: "100%" }}
        animate={{ y: isAnimating ? 0 : "100%" }}
        transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
        className={`
          chat-container fixed bottom-0 left-0 right-0 z-[60] 
          flex flex-col overflow-hidden
          ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}
        `}
        style={{
          height: containerHeight,
          maxHeight: "100vh",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Chat con Jimmy - Asistente Virtual"
      >
        {/* Header Premium */}
        <header
          className={`
            relative flex-shrink-0 overflow-hidden
            ${isDark ? "bg-gray-800" : "bg-white"}
          `}
        >
          {/* Background decorativo */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#E40E20]/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#eab308]/10 to-transparent rounded-full blur-2xl" />
          </div>
          
          {/* Línea decorativa superior */}
          <div className="h-1 w-full bg-gradient-to-r from-[#E40E20] via-[#D31A2B] to-[#E40E20]" />
          
          <div className="relative flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
            {/* Avatar + título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Avatar con gradiente institucional */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E40E20] to-[#D31A2B] p-0.5 shadow-lg shadow-red-500/25">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Jimmy - Asistente Virtual"
                      width={44}
                      height={44}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full shadow-lg shadow-emerald-500/50 flex items-center justify-center">
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-xl font-bold tracking-tight"
                    style={{ 
                      color: isDark ? "#ffffff" : "#4A4F55", 
                      fontFamily: "'Poppins', sans-serif" 
                    }}
                  >
                    Jimmy
                  </h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#E40E20]/10 rounded-full">
                    <Shield size={12} className="text-[#E40E20]" />
                    <span className="text-[10px] font-semibold text-[#E40E20] uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ 
                    color: isDark ? "#94a3b8" : "#7A858C", 
                    fontFamily: "'Merriweather Sans', sans-serif" 
                  }}
                >
                  Asistente Virtual • Gobernación del Atlántico
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              {!isMobile && (
                <>
                  <button
                    onClick={increaseFontSize}
                    aria-label="Aumentar tamaño de fuente"
                    className={`
                      h-10 w-10 rounded-xl flex items-center justify-center 
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${isDark 
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                        : "bg-gray-100 hover:bg-gray-200 text-[#4A4F55]"
                      }
                    `}
                  >
                    <PlusCircle size={18} />
                  </button>
                  <button
                    onClick={decreaseFontSize}
                    aria-label="Disminuir tamaño de fuente"
                    className={`
                      h-10 w-10 rounded-xl flex items-center justify-center 
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${isDark 
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                        : "bg-gray-100 hover:bg-gray-200 text-[#4A4F55]"
                      }
                    `}
                  >
                    <MinusCircle size={18} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsDark(!isDark)}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className={`
                  h-10 w-10 rounded-xl flex items-center justify-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${isDark 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-gray-100 hover:bg-gray-200"
                  }
                `}
              >
                {isDark ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-[#4A4F55]" />
                )}
              </button>
              <button
                onClick={handleClose}
                aria-label="Cerrar chat"
                className={`
                  h-10 w-10 rounded-xl flex items-center justify-center 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${isDark 
                    ? "bg-gray-700 hover:bg-red-500/20 text-gray-300 hover:text-red-400" 
                    : "bg-gray-100 hover:bg-red-50 text-[#4A4F55] hover:text-[#E40E20]"
                  }
                `}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Divider sutil */}
          <div className={`h-px ${isDark ? "bg-gray-700/50" : "bg-[#C1C5C8]/20"}`} />
        </header>

        {/* Messages Area */}
        <div
          className={`flex-1 overflow-hidden relative ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}
          style={{
            paddingBottom: hasKeyboard ? "0" : "env(safe-area-inset-bottom, 0)",
          }}
        >
          {/* Subtle pattern background */}
          <div 
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E40E20' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            totalCount={messages.length}
            alignToBottom
            followOutput="smooth"
            overscan={200}
            atBottomStateChange={handleScroll}
            role="log"
            aria-live="polite"
            aria-label="Historial de mensajes"
            style={{
              height: "100%",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
            itemContent={(index, message) => (
              <MessageItem
                key={message.id}
                message={message}
                index={index}
                isLast={index === messages.length - 1}
                messagesLength={messages.length}
                fontSize={fontSize}
                isDark={isDark}
                isMobile={isMobile}
              />
            )}
            components={{
              Footer: () =>
                typing ? (
                  <div className="px-4 sm:px-6 pb-6 flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E40E20] to-[#D31A2B] p-0.5 shadow-lg shadow-red-500/20">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <Image
                            src="/jimmy-avatar.png"
                            alt="Jimmy"
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    <TypingIndicator isDark={isDark} />
                  </div>
                ) : null,
            }}
          />

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {!isBottom && messages.length > 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${isMobile ? 'bottom-24' : 'bottom-28'} right-4 flex flex-col items-end gap-2`}
              >
                {!isMobile && (
                  <div className={`
                    rounded-full px-3 py-1.5 shadow-lg text-xs font-medium
                    ${isDark 
                      ? "bg-gray-800 border border-gray-700 text-gray-300" 
                      : "bg-white border border-[#C1C5C8]/30 text-[#4A4F55]"
                    }
                  `}>
                    Nuevos mensajes
                  </div>
                )}
                
                <button
                  onClick={scrollToBottom}
                  aria-label="Ir al último mensaje"
                  className={`
                    group relative ${isMobile ? 'h-11 w-11' : 'h-12 w-12'} rounded-full shadow-xl 
                    flex items-center justify-center transition-all duration-200
                    hover:scale-110 active:scale-95
                    bg-gradient-to-br from-[#E40E20] to-[#D31A2B]
                    shadow-red-500/30
                  `}
                >
                  <ChevronDown 
                    size={isMobile ? 20 : 22} 
                    className="text-white transition-transform duration-200 group-hover:translate-y-0.5"
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !hasKeyboard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
              className={`
                px-4 py-3 flex-shrink-0 relative z-10
                ${isDark ? "bg-gray-800/80 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"}
                border-t ${isDark ? "border-gray-700/50" : "border-[#C1C5C8]/20"}
              `}
            >
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <motion.div
                    key={suggestion}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <SuggestionChip
                      label={suggestion}
                      onClick={() => onSend(suggestion)}
                      small={isMobile}
                      isDark={isDark}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className={`
            flex-shrink-0 relative z-10
            ${isDark ? "bg-gray-800" : "bg-white"}
            border-t ${isDark ? "border-gray-700/50" : "border-[#C1C5C8]/20"}
          `}
          style={{
            paddingBottom: hasKeyboard ? "8px" : "env(safe-area-inset-bottom, 8px)",
          }}
        >
          <div className="p-3 sm:p-4">
            <div
              className={`
                flex items-end gap-3 rounded-2xl border-2 transition-all duration-200
                ${isDark
                  ? "bg-gray-700/50 border-gray-600 focus-within:border-[#E40E20]/50 focus-within:bg-gray-700"
                  : "bg-[#FAFAFA] border-[#C1C5C8]/30 focus-within:border-[#E40E20] focus-within:bg-white focus-within:shadow-lg focus-within:shadow-red-500/5"
                }
              `}
            >
              <TextareaAutosize
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => {
                  if (virtuosoRef.current && messages.length > 0) {
                    setTimeout(() => {
                      virtuosoRef.current?.scrollToIndex({
                        index: messages.length - 1,
                        behavior: "smooth",
                        align: "end",
                      });
                    }, SCROLL_DELAY);
                  }
                }}
                minRows={1}
                maxRows={4}
                placeholder="Escribe tu consulta..."
                aria-label="Mensaje"
                className={`
                  flex-1 resize-none bg-transparent px-4 py-3.5 ${fontSize}
                  ${isDark ? "text-white placeholder-gray-400" : "text-[#4A4F55] placeholder-[#7A858C]"}
                  outline-none min-h-[48px]
                `}
                disabled={typing}
                style={{ 
                  fontFamily: "'Merriweather Sans', sans-serif"
                }}
              />

              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label="Enviar mensaje"
                className={`
                  mb-2.5 mr-2.5 h-11 w-11 rounded-xl flex items-center justify-center 
                  transition-all duration-200
                  ${
                    !draft.trim() || typing
                      ? `${isDark ? "bg-gray-600" : "bg-[#C1C5C8]"} cursor-not-allowed opacity-50`
                      : "bg-gradient-to-br from-[#E40E20] to-[#D31A2B] hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95"
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
            
            {/* Powered by indicator */}
            <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
              <Shield size={10} className="text-[#E40E20]" />
              <span 
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: isDark ? "#94a3b8" : "#7A858C" }}
              >
                
              </span>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Estilos adicionales */}
      <style jsx global>{`
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