"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { sendChatMessage, createUserMessage } from "@/lib/geminiService";
import type { ChatMessage } from "@/types/geminiChat";
import { Shield, MessageCircle, X } from "lucide-react";

// Carga diferida del ChatWindow para evitar SSR
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center">
      <div className="text-gray-600">Cargando asistente virtual...</div>
    </div>
  ),
});

/* Utils */
function generateId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateSuggestions(botText: string): string[] {
  const lower = botText.toLowerCase();

  if (lower.includes("hola") || lower.includes("saludo") || lower.includes("jimmy"))
    return ["📍 Lugares turísticos destacados", "🏛️ Servicios gubernamentales", "🎭 Eventos culturales"];

  if (lower.includes("comer") || lower.includes("restaurante") || lower.includes("comida") || lower.includes("gastronomía"))
    return ["🍽️ Gastronomía típica atlántica", "🍤 Restaurantes recomendados", "🥘 Platos tradicionales"];

  if (lower.includes("hotel") || lower.includes("alojamiento") || lower.includes("dormir") || lower.includes("hospedaje"))
    return ["🏨 Hoteles certificados", "🏛️ Alojamientos históricos", "💼 Hospedaje empresarial"];

  if (lower.includes("evento") || lower.includes("festival") || lower.includes("carnaval") || lower.includes("fiesta"))
    return ["🎭 Carnaval de Barranquilla", "🎪 Festivales culturales", "📅 Calendario de eventos"];

  if (lower.includes("playa") || lower.includes("mar") || lower.includes("costa"))
    return ["🏖️ Playas del Atlántico", "🌊 Actividades marítimas", "🚤 Deportes náuticos"];

  if (lower.includes("cultura") || lower.includes("museo") || lower.includes("historia") || lower.includes("patrimonio"))
    return ["🏛️ Museos y patrimonio", "📚 Historia del Atlántico", "🎨 Centros culturales"];

  if (lower.includes("transporte") || lower.includes("moverse") || lower.includes("taxi") || lower.includes("bus"))
    return ["🚌 Transporte público", "🚕 Servicios de taxi", "🚗 Rutas principales"];

  if (lower.includes("trámite") || lower.includes("documento") || lower.includes("gestión"))
    return ["📋 Trámites en línea", "🏛️ Oficinas gubernamentales", "📄 Documentos requeridos"];

  return ["🗺️ Guía turística completa", "📞 Información de contacto", "🏛️ Servicios disponibles"];
}

export default function GeminiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasShownIntro, setHasShownIntro] = useState(false);

  const hasModalOpen = false;

  /** -------- Scroll lock robusto -------- */
  const scrollYRef = useRef(0);
  const prevScrollBehaviorRef = useRef<string>("");

  const lockBodyScroll = () => {
    scrollYRef.current = window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`;
    }

    const html = document.documentElement;
    prevScrollBehaviorRef.current = html.style.scrollBehavior || "";
    html.style.scrollBehavior = "auto";

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.classList.add("chat-open");
  };

  const unlockBodyScroll = () => {
    const html = document.documentElement;
    const y = scrollYRef.current || 0;

    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";
    document.body.classList.remove("chat-open");

    requestAnimationFrame(() => {
      window.scrollTo(0, y);
      setTimeout(() => window.scrollTo(0, y), 0);
      html.style.scrollBehavior = prevScrollBehaviorRef.current;
    });
  };

  /** -------- Montaje -------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /** -------- Progressive disclosure: expandir brevemente después de 3 segundos -------- */
  useEffect(() => {
    if (!mounted || hasShownIntro || open || hasModalOpen) return;

    const timer = setTimeout(() => {
      setIsExpanded(true);
      setHasShownIntro(true);

      // Colapsar después de 4 segundos
      setTimeout(() => {
        setIsExpanded(false);
      }, 4000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [mounted, hasShownIntro, open, hasModalOpen]);

  /** -------- Cerrar si hay otro modal -------- */
  useEffect(() => {
    if (hasModalOpen && open) setOpen(false);
  }, [hasModalOpen, open]);

  /** -------- Medidas de viewport/teclado -------- */
  useEffect(() => {
    if (!mounted) return;

    const updateViewport = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const keyboardVisible = window.innerHeight - vv.height > 50;
      setKeyboardHeight(keyboardVisible ? window.innerHeight - vv.height : 0);
      setViewportHeight(vv.height);
    };

    const handleResize = () => updateViewport();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      updateViewport();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  /** -------- Lock de scroll -------- */
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => {
      if (open) unlockBodyScroll();
    };
  }, [open, mounted]);

  /** -------- Mensaje de bienvenida -------- */
  useEffect(() => {
    if (open && messages.length === 0 && mounted) {
      const welcome = {
        id: generateId(),
        role: "assistant",
        text:
          "¡Bienvenido al asistente virtual de la Gobernación del Atlántico! 🏛️" +
          "<br/><br/>Soy Jimmy, tu guía oficial para información turística, cultural y de servicios del departamento." +
          "<br/><br/>¿En qué puedo ayudarte hoy?",
        timestamp: Date.now(),
      } as ChatMessage;

      setMessages([welcome]);
      setSuggestions(generateSuggestions(welcome.text));
    }
  }, [open, messages.length, mounted]);

  /** -------- Enviar mensaje -------- */
  const handleSend = useCallback(
    async (text: string) => {
      if (!mounted) return;

      const userMsg = createUserMessage(text);
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      setSuggestions([]);
      setHasNewMessage(false);

      try {
        const assistantMsg = await sendChatMessage([...messages, userMsg]);
        setMessages((prev) => [...prev, assistantMsg]);
        setSuggestions(generateSuggestions(assistantMsg.text));
        if (!open) setHasNewMessage(true);
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
        const errorMsg = {
          id: generateId(),
          role: "assistant",
          text:
            "Disculpe, estoy experimentando dificultades técnicas. " +
            "Por favor, intente nuevamente o contacte con soporte técnico.",
          timestamp: Date.now(),
        } as ChatMessage;
        setMessages((prev) => [...prev, errorMsg]);
        setSuggestions(["🔄 Intentar nuevamente", "📞 Contactar soporte", "🏛️ Servicios disponibles"]);
      } finally {
        setTyping(false);
      }
    },
    [messages, open, mounted]
  );

  /** -------- Cambiar estado open -------- */
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && hasModalOpen) return;
    setOpen(newOpen);
    if (newOpen) {
      setHasNewMessage(false);
      setIsExpanded(false);
    }
  };

  /** -------- Abrir chat desde fuera -------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const openNow = () => {
      setOpen(true);
      setHasNewMessage(false);
    };

    window.addEventListener("jimmy:open", openNow);
    window.addEventListener("jimmy-open", openNow);
    (window as any).openJimmy = openNow;

    return () => {
      window.removeEventListener("jimmy:open", openNow);
      window.removeEventListener("jimmy-open", openNow);
      if ((window as any).openJimmy === openNow) delete (window as any).openJimmy;
    };
  }, []);

  /** -------- FAB Premium -------- */
  const FloatingButton = () => {
    if (!mounted || open) return null;

    return (
      <div
        className={`fixed bottom-6 right-6 z-[50] transition-all duration-300 ${
          hasModalOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        data-chatbot="jimmy"
      >
        {/* Botón principal */}
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => !hasShownIntro && setIsExpanded(true)}
          onMouseLeave={() => !hasShownIntro && setIsExpanded(false)}
          disabled={hasModalOpen}
          className={`group relative flex items-center gap-3 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl hover:shadow-red-500/50 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
            isExpanded ? "rounded-full px-6 py-4 pr-20" : "rounded-full p-0 w-16 h-16"
          } ${!hasShownIntro && !hasModalOpen ? "animate-bounce-once" : ""}`}
        >
          {/* Avatar container - siempre visible */}
          <div className="relative flex-shrink-0">
            <div
              className={`relative rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden transition-all duration-500 ${
                isExpanded ? "w-12 h-12" : "w-16 h-16"
              }`}
            >
              <Image
                src="/jimmy-avatar.png"
                alt="Jimmy"
                width={isExpanded ? 40 : 56}
                height={isExpanded ? 40 : 56}
                className="rounded-full object-cover"
              />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-lg animate-pulse" />

            {/* New message badge */}
            {hasNewMessage && !hasModalOpen && (
              <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <span className="text-xs font-bold text-red-900 px-1">1</span>
              </div>
            )}
          </div>

          {/* Texto expandido */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <div className="whitespace-nowrap">
              <p className="text-sm font-bold leading-tight">¿Necesitas ayuda?</p>
              <p className="text-xs opacity-90 leading-tight mt-0.5">Chatea con Jimmy</p>
            </div>
          </div>

          {/* Shield icon cuando expandido */}
          {isExpanded && (
            <div className="absolute right-4 opacity-80">
              <Shield size={20} className="text-white" />
            </div>
          )}

          {/* Message icon cuando colapsado - centrado */}
          {!isExpanded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageCircle size={28} className="text-white drop-shadow-lg" />
            </div>
          )}

          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </button>

        {/* Pulse ring animation - solo cuando no está expandido */}
        {!isExpanded && !hasShownIntro && !hasModalOpen && (
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping-slow pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <>
      <FloatingButton />

      {mounted && (
        <div
          className={`transition-all duration-300 ${
            hasModalOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          }`}
          data-chatbot="jimmy"
        >
          <ChatWindow
            open={open && !hasModalOpen}
            onOpenChange={handleOpenChange}
            messages={messages}
            typing={typing}
            suggestions={suggestions}
            onSend={handleSend}
            keyboardHeight={keyboardHeight}
            viewportHeight={viewportHeight}
          />
        </div>
      )}

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .animate-bounce-once {
          animation: bounce-once 2s ease-in-out 1;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .safe-area-padding {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}