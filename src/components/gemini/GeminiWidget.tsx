"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { sendChatMessage, createUserMessage } from "@/lib/geminiService";
import type { ChatMessage } from "@/types/geminiChat";
import { Shield, MessageCircle, Sparkles } from "lucide-react";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// Dorado accent: #eab308
// =============================================================================

// Carga diferida del ChatWindow para evitar SSR
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E40E20] to-[#D31A2B] p-0.5 shadow-lg shadow-red-500/25">
          <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-3 border-[#C1C5C8] border-t-[#E40E20]" />
          </div>
        </div>
        <p className="text-[#4A4F55] font-medium" style={{ fontFamily: "'Merriweather Sans', sans-serif" }}>
          Cargando asistente...
        </p>
      </motion.div>
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
  const [isHovered, setIsHovered] = useState(false);

  /** -------- Scroll lock robusto -------- */
  const scrollYRef = useRef(0);
  const prevScrollBehaviorRef = useRef<string>("");

  const lockBodyScroll = useCallback(() => {
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
  }, []);

  const unlockBodyScroll = useCallback(() => {
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
  }, []);

  /** -------- Montaje -------- */
  useEffect(() => {
    setMounted(true);
    return () => {
      // Cleanup on unmount
      unlockBodyScroll();
    };
  }, [unlockBodyScroll]);

  /** -------- Medidas de viewport/teclado -------- */
  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();

    const updateViewport = () => {
      if (controller.signal.aborted) return;
      
      const vv = window.visualViewport;
      if (!vv) return;
      const keyboardVisible = window.innerHeight - vv.height > 50;
      setKeyboardHeight(keyboardVisible ? window.innerHeight - vv.height : 0);
      setViewportHeight(vv.height);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewport, { signal: controller.signal });
      window.visualViewport.addEventListener("scroll", updateViewport, { signal: controller.signal });
      updateViewport();
    }
    window.addEventListener("resize", updateViewport, { signal: controller.signal });

    return () => controller.abort();
  }, [mounted]);

  /** -------- Lock de scroll -------- */
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [open, mounted, lockBodyScroll, unlockBodyScroll]);

  /** -------- Mensaje de bienvenida -------- */
  useEffect(() => {
    if (open && messages.length === 0 && mounted) {
      const welcome = {
        id: generateId(),
        role: "assistant",
        text:
          "¡Bienvenido al portal turístico del <strong>Atlántico</strong>! 🌴" +
          "<br/><br/>Soy <strong>Jimmy</strong>, tu asistente virtual oficial de la Gobernación." +
          "<br/><br/>Estoy aquí para ayudarte a descubrir los mejores destinos, eventos culturales, gastronomía y servicios de nuestro departamento." +
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
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setHasNewMessage(false);
    }
  }, []);

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

  /** -------- FAB Simple y Estático -------- */
  const FloatingButton = () => {
    if (!mounted || open) return null;

    return (
      <div
        className="fixed bottom-6 right-6 z-[50]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        data-chatbot="jimmy"
      >
        {/* Botón principal - siempre visible */}
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Abrir chat con Jimmy - Asistente Virtual"
          className="
            group relative flex items-center justify-center
            w-16 h-16 rounded-full
            bg-gradient-to-br from-[#E40E20] to-[#D31A2B] 
            text-white shadow-2xl shadow-red-500/30
            transition-transform duration-200 ease-out
            hover:scale-105 active:scale-95
          "
        >
          {/* Glow effect on hover */}
          <div 
            className={`
              absolute inset-0 bg-white rounded-full 
              transition-opacity duration-200
              ${isHovered ? 'opacity-10' : 'opacity-0'}
            `}
          />

          {/* Avatar container */}
          <div className="relative z-10">
            <div className="
              w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm 
              border-2 border-white/30 flex items-center justify-center 
              overflow-hidden
            ">
              <Image
                src="/jimmy-avatar.png"
                alt="Jimmy"
                width={52}
                height={52}
                className="rounded-full object-cover"
                priority
              />
            </div>

            {/* Status indicator - siempre visible */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
              <Sparkles size={8} className="text-white" />
            </div>

            {/* New message badge */}
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-amber-400 border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-xs font-bold text-amber-900 px-1">1</span>
              </div>
            )}
          </div>

          {/* Message icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <MessageCircle size={26} className="text-white drop-shadow-lg" />
          </div>
        </button>

        {/* Tooltip en hover - solo desktop */}
        <div 
          className={`
            absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none
            transition-all duration-200
            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
          `}
        >
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-xl border border-[#C1C5C8]/20 whitespace-nowrap">
            <p 
              className="text-sm font-semibold text-[#4A4F55]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Chatea con Jimmy
            </p>
            <p 
              className="text-xs text-[#7A858C] flex items-center gap-1"
              style={{ fontFamily: "'Merriweather Sans', sans-serif" }}
            >
              <Shield size={10} className="text-[#E40E20]" />
              Asistente AI
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-r border-b border-[#C1C5C8]/20 transform rotate-[-45deg]" />
        </div>
      </div>
    );
  };

  return (
    <>
      <FloatingButton />

      {mounted && (
        <ChatWindow
          open={open}
          onOpenChange={handleOpenChange}
          messages={messages}
          typing={typing}
          suggestions={suggestions}
          onSend={handleSend}
          keyboardHeight={keyboardHeight}
          viewportHeight={viewportHeight}
        />
      )}
    </>
  );
}