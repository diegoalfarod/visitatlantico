"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  sendChatMessage, 
  createUserMessage, 
  generateSuggestions,
  type ChatMessage 
} from "@/lib/claudeService";
import { Sparkles, MessageCircle } from "lucide-react";

// =============================================================================
// PALETA VISITATLÁNTICO
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

// Carga diferida del ChatWindow
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4"
      >
        <div 
          className="w-14 h-14 rounded-2xl p-0.5 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` }}
        >
          <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
            <div 
              className="w-8 h-8 animate-spin rounded-full border-3 border-slate-200"
              style={{ borderTopColor: COLORS.naranjaSalinas }}
            />
          </div>
        </div>
        <p className="text-slate-600 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Cargando asistente...
        </p>
      </motion.div>
    </div>
  ),
});

function generateId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function TourismChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Scroll lock
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

  // Montaje
  useEffect(() => {
    setMounted(true);
    return () => unlockBodyScroll();
  }, [unlockBodyScroll]);

  // Viewport/keyboard
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

  // Lock scroll
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [open, mounted, lockBodyScroll, unlockBodyScroll]);

  // Mensaje de bienvenida bilingüe - conversacional
  useEffect(() => {
    if (open && messages.length === 0 && mounted) {
      // Detectar idioma del navegador
      const browserLang = typeof navigator !== "undefined" ? navigator.language : "es";
      const isEnglish = browserLang.startsWith("en");

      const welcomeEs: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text:
          "¡Ey, qué más! 👋<br/><br/>" +
          "Soy <strong>Jimmy</strong>, barranquillero y guía turístico. " +
          "Conozco cada rincón del Atlántico y estoy aquí para ayudarte a descubrir lo mejor de mi tierra.<br/><br/>" +
          "¿Qué te trae por acá? ¿Estás planeando un viaje o ya andas por la ciudad?",
        timestamp: Date.now(),
        language: "es",
      };

      const welcomeEn: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text:
          "Hey, what's up! 👋<br/><br/>" +
          "I'm <strong>Jimmy</strong>, a local from Barranquilla and your personal guide. " +
          "I know every corner of Atlántico and I'm here to help you discover the best of my homeland.<br/><br/>" +
          "What brings you here? Planning a trip or already in the city?",
        timestamp: Date.now(),
        language: "en",
      };

      const welcome = isEnglish ? welcomeEn : welcomeEs;
      setMessages([welcome]);
      
      // Sugerencias iniciales conversacionales
      const initialSuggestions = isEnglish 
        ? ["🗓️ Planning a trip", "📍 I'm here now", "🤔 Just curious"]
        : ["🗓️ Planeando viaje", "📍 Ya estoy acá", "🤔 Solo curioseando"];
      setSuggestions(initialSuggestions);
    }
  }, [open, messages.length, mounted]);

  // Enviar mensaje
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
        setSuggestions(generateSuggestions(assistantMsg));
        if (!open) setHasNewMessage(true);
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
        
        // Detectar idioma del último mensaje para el error
        const lastUserMsg = [...messages, userMsg].filter(m => m.role === "user").pop();
        const isEnglish = lastUserMsg?.language === "en";
        
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          text: isEnglish 
            ? "Oops, I'm having some technical difficulties. Please try again in a moment! 🙏"
            : "¡Uy! Estoy teniendo algunas dificultades técnicas. Por favor intenta de nuevo en un momento. 🙏",
          timestamp: Date.now(),
          language: isEnglish ? "en" : "es",
        };
        setMessages((prev) => [...prev, errorMsg]);
        setSuggestions(isEnglish 
          ? ["🔄 Try again", "📍 What to do today", "🗺️ Create itinerary"]
          : ["🔄 Intentar de nuevo", "📍 Qué hacer hoy", "🗺️ Crear itinerario"]
        );
      } finally {
        setTyping(false);
      }
    },
    [messages, open, mounted]
  );

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) setHasNewMessage(false);
  }, []);

  // API para abrir desde fuera
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

  // Floating Button
  const FloatingButton = () => {
    if (!mounted || open) return null;

    return (
      <div
        className="fixed bottom-6 right-6 z-[50]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        data-chatbot="jimmy"
      >
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Abrir chat con Jimmy - Asistente Turístico"
          className="group relative flex items-center justify-center w-16 h-16 rounded-full text-white shadow-2xl transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
            boxShadow: `0 10px 40px -10px ${COLORS.naranjaSalinas}88`
          }}
        >
          {/* Glow on hover */}
          <div className={`absolute inset-0 bg-white rounded-full transition-opacity duration-200 ${isHovered ? 'opacity-10' : 'opacity-0'}`} />

          {/* Avatar */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
              <Image
                src="/jimmy-avatar.png"
                alt="Jimmy"
                width={52}
                height={52}
                className="rounded-full object-cover"
                priority
              />
            </div>

            {/* Status indicator */}
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.verdeBijao }}
            >
              <Sparkles size={8} className="text-white" />
            </div>

            {/* New message badge */}
            {hasNewMessage && (
              <div 
                className="absolute -top-1 -right-1 min-w-[22px] h-[22px] border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
                style={{ backgroundColor: COLORS.amarilloArepa }}
              >
                <span className="text-xs font-bold text-amber-900 px-1">1</span>
              </div>
            )}
          </div>

          {/* Message icon */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <MessageCircle size={26} className="text-white drop-shadow-lg" />
          </div>
        </button>

        {/* Tooltip - desktop only */}
        <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 hidden sm:block ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-xl border border-slate-200/50 whitespace-nowrap">
            <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              Chatea con Jimmy
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Sparkles size={10} style={{ color: COLORS.naranjaSalinas }} />
              Tu guía del Atlántico
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-r border-b border-slate-200/50 transform rotate-[-45deg]" />
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