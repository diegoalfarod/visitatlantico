"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { sendChatMessage, createUserMessage } from "@/lib/geminiService";
import type { ChatMessage } from "@/types/geminiChat";
import { Shield, ChevronUp } from "lucide-react";

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

  const hasModalOpen = false; // si luego detectas otros modales, cámbialo

  /** -------- Scroll lock robusto (sin saltos) -------- */
  const scrollYRef = useRef(0);
  const prevScrollBehaviorRef = useRef<string>("");

  const lockBodyScroll = () => {
    // guarda Y y evita reflow por scroll bar (padding-right)
    scrollYRef.current = window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`;
    }

    // desactiva smooth scroll durante la restauración
    const html = document.documentElement;
    prevScrollBehaviorRef.current = html.style.scrollBehavior || "";
    html.style.scrollBehavior = "auto";

    // fija el body en su sitio
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

    // limpia estilos primero
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";
    document.body.classList.remove("chat-open");

    // restaura posición exactamente donde estaba (sin smooth)
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
      // fallback por si el frame todavía no aplicó layout (Safari/iOS)
      setTimeout(() => window.scrollTo(0, y), 0);
      // restaura el comportamiento de scroll original del html
      html.style.scrollBehavior = prevScrollBehaviorRef.current;
    });
  };

  /** -------- Montaje -------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /** -------- Cerrar si hay otro modal (placeholder) -------- */
  useEffect(() => {
    if (hasModalOpen && open) setOpen(false);
  }, [hasModalOpen, open]);

  /** -------- Medidas de viewport/teclado para ChatWindow -------- */
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

  /** -------- Aplica/Quita lock de scroll al abrir/cerrar -------- */
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    // cleanup si desmonta abierto
    return () => {
      if (open) unlockBodyScroll();
    };
  }, [open, mounted]);

  /** -------- Mensaje de bienvenida una sola vez al abrir -------- */
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

  /** -------- Cambiar estado open/cerrar desde ChatWindow -------- */
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && hasModalOpen) return;
    setOpen(newOpen);
    if (newOpen) setHasNewMessage(false);
  };

  /** -------- Abrir chat desde fuera (SustainabilityBanner) -------- */
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

  /** -------- Barra inferior para abrir el chat -------- */
  const BottomBar = () => {
    if (!mounted || open) return null;

    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-[50] safe-area-padding transition-all duration-300 ${
          hasModalOpen ? "opacity-0 pointer-events-none translate-y-full" : "opacity-100"
        }`}
        data-chatbot="jimmy"
      >
        <button
          onClick={() => setOpen(true)}
          disabled={hasModalOpen}
          className="w-full bg-white border-t border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Izquierda */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
                    <Image src="/jimmy-avatar.png" alt="Jimmy" width={32} height={32} className="rounded-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  {hasNewMessage && !hasModalOpen && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                  )}
                </div>

                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-1">
                    ¿Necesitas ayuda?
                    <Shield size={14} className="text-red-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasModalOpen ? "Jimmy estará disponible pronto" : "Jimmy está aquí para asistirte"}
                  </p>
                </div>
              </div>

              {/* Derecha */}
              <div className="flex items-center gap-2">
                {hasNewMessage && !hasModalOpen && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Nuevo
                  </span>
                )}
                <ChevronUp size={24} className={`transition-colors duration-300 ${hasModalOpen ? "text-gray-300" : "text-gray-400"}`} />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <BottomBar />

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

      {/* Safe area iOS */}
      <style jsx global>{`
        .safe-area-padding {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
