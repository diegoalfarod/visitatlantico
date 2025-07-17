"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { sendChatMessage, createUserMessage } from "@/lib/geminiService";
import type { ChatMessage } from "@/types/geminiChat";
import { MessageCircle, Shield, ChevronUp } from "lucide-react";

// Import ChatWindow dinamicamente para evitar problemas de SSR
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center">
      <div className="text-gray-600">Cargando asistente virtual...</div>
    </div>
  ),
});

/*  🔮 Generador de UUID seguro para SSR */
function generateId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback para SSR
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/*  🔮 Generador de sugerencias institucionales */
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
  const originalBodyStyleRef = useRef<string>("");

  // Solo montar después de la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manejar cambios de viewport y teclado
  useEffect(() => {
    if (!mounted) return;

    const updateViewport = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      const keyboardVisible = window.innerHeight - vv.height > 50;
      setKeyboardHeight(keyboardVisible ? window.innerHeight - vv.height : 0);
      setViewportHeight(vv.height);
    };

    const handleResize = () => {
      updateViewport();
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      updateViewport();
    }

    // Fallback para navegadores sin VisualViewport
    window.addEventListener("resize", handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  // Bloquear scroll del body cuando el chat está abierto
  useEffect(() => {
    if (!mounted) return;

    if (open) {
      // Guardar el estilo original y la posición de scroll
      originalBodyStyleRef.current = document.body.style.cssText;
      const scrollY = window.scrollY;
      
      // Bloquear scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      // Agregar clase para CSS
      document.body.classList.add('chat-open');
    } else {
      // Restaurar scroll
      const scrollY = document.body.style.top;
      document.body.style.cssText = originalBodyStyleRef.current;
      
      // Remover clase
      document.body.classList.remove('chat-open');
      
      // Restaurar posición de scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      if (open) {
        document.body.style.cssText = originalBodyStyleRef.current;
        document.body.classList.remove('chat-open');
      }
    };
  }, [open, mounted]);

  /* ─── Saludo institucional ─── */
  useEffect(() => {
    if (open && messages.length === 0 && mounted) {
      const welcomeMessages = [
        "¡Bienvenido al asistente virtual de la Gobernación del Atlántico! 🏛️",
        "Soy Jimmy, tu guía oficial para información turística, cultural y de servicios del departamento.",
        "¿En qué puedo ayudarte hoy? Puedo brindarte información sobre lugares turísticos, trámites, eventos y más.",
      ];

      const welcome = {
        id: generateId(),
        role: "assistant",
        text: welcomeMessages.join("<br/><br/>"),
        timestamp: Date.now(),
      } as ChatMessage;

      setMessages([welcome]);
      setSuggestions(generateSuggestions(welcome.text));
    }
  }, [open, messages.length, mounted]);

  /* ─── Enviar mensaje ─── */
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

        if (!open) {
          setHasNewMessage(true);
        }
      } catch (err) {
        console.error("Error al enviar mensaje:", err);

        const errorMsg = {
          id: generateId(),
          role: "assistant",
          text: "Disculpe, estoy experimentando dificultades técnicas. Por favor, intente nuevamente o contacte con soporte técnico.",
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

  /* ─── Abrir chat ─── */
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setHasNewMessage(false);
    }
  };

  /* ─── Barra inferior institucional ─── */
  const BottomBar = () => {
    if (!mounted || open) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 z-[50] safe-area-padding">
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-white border-t border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Contenido izquierdo */}
              <div className="flex items-center gap-3">
                {/* Avatar con indicador */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Jimmy"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  {hasNewMessage && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                  )}
                </div>

                {/* Texto */}
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-1">
                    ¿Necesitas ayuda?
                    <Shield size={14} className="text-red-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Jimmy está aquí para asistirte
                  </p>
                </div>
              </div>

              {/* Icono derecho */}
              <div className="flex items-center gap-2">
                {hasNewMessage && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Nuevo
                  </span>
                )}
                <ChevronUp
                  size={24}
                  className="text-gray-400 group-hover:text-red-600 transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </button>

        {/* Efecto de hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  };

  return (
    <>
      <BottomBar />

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

      {/* Estilos para safe area */}
      <style jsx global>{`
        .safe-area-padding {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}