"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { sendChatMessage, createUserMessage } from "@/lib/geminiService";
import type { ChatMessage } from "@/types/geminiChat";
import { MessageCircle, Shield, X, HelpCircle } from "lucide-react";

// Import ChatWindow dinamicamente para evitar problemas de SSR
const ChatWindow = dynamic(() => import("./ChatWindow"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center">
    <div className="text-gray-600">Cargando asistente virtual...</div>
  </div>
});

/*  🔮 Generador de UUID seguro para SSR */
function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
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
  const [fabVisible, setFabVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardObserverRef = useRef<ResizeObserver | null>(null);

  // Solo montar después de la hidratación
  useEffect(() => {
    setMounted(true);
    return () => {
      if (keyboardObserverRef.current) {
        keyboardObserverRef.current.disconnect();
      }
    };
  }, []);

  // Manejar visibilidad del teclado
  useEffect(() => {
    if (!mounted || !open) return;
    
    const handleResize = () => {
      if (!window.visualViewport) return;
      
      // Calcular diferencia entre innerHeight y visualViewport height
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      setIsKeyboardVisible(keyboardHeight > 100);
    };

    // Usar VisualViewport API si está disponible
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize();
    } else {
      // Fallback para navegadores sin VisualViewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
      }
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [mounted, open]);

  /* ─── Saludo institucional ─── */
  useEffect(() => {
    if (open && messages.length === 0 && mounted) {
      const welcomeMessages = [
        "¡Bienvenido al asistente virtual de la Gobernación del Atlántico! 🏛️",
        "Soy Jimmy, tu guía oficial para información turística, cultural y de servicios del departamento.",
        "¿En qué puedo ayudarte hoy? Puedo brindarte información sobre lugares turísticos, trámites, eventos y más."
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

  /* ─── Detectar scroll para mostrar/ocultar FAB ─── */
  useEffect(() => {
    if (!mounted) return;
    
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setFabVisible(false);
      } else {
        setFabVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

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

  /* ─── Abrir chat y limpiar notificación ─── */
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setHasNewMessage(false);
      // Enfocar el input después de la animación
      setTimeout(() => {
        const input = document.querySelector('textarea') as HTMLTextAreaElement;
        input?.focus({ preventScroll: true });
      }, 300);
    }
  };

  /* ─── FAB Institucional ─── */
  const InstitutionalFab = () => {
    if (!mounted) return null;

    return (
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        {/* Tooltip */}
        {fabVisible && !open && (
          <div className="group relative">
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                Asistente Virtual - Gobernación del Atlántico
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
              </div>
            </div>
            
            {/* Main FAB Button */}
            <button
              onClick={() => setOpen(true)}
              className="group relative h-16 w-16 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-500 overflow-hidden"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-red-50 group-hover:to-red-100 transition-all duration-300" />
              
              {/* Content */}
              <div className="relative flex h-full w-full items-center justify-center">
                {hasNewMessage ? (
                  <div className="relative">
                    <MessageCircle size={24} className="text-red-600 animate-pulse" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center group-hover:border-red-500 transition-all duration-300">
                      <Image
                        src="/jimmy-avatar.png"
                        alt="Jimmy"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    </div>
                    <Shield 
                      size={12} 
                      className="absolute -top-1 -right-1 text-red-600 bg-white rounded-full p-0.5" 
                    />
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length > 1 && fabVisible && !open && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSend("¿Qué servicios ofrece la Gobernación?")}
              className="group h-12 w-12 rounded-full bg-white shadow-md border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300 flex items-center justify-center"
            >
              <HelpCircle size={16} className="text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {!open && mounted && <InstitutionalFab />}

      {mounted && (
        <ChatWindow
          open={open}
          onOpenChange={handleOpenChange}
          messages={messages}
          typing={typing}
          suggestions={suggestions}
          onSend={handleSend}
          isKeyboardVisible={isKeyboardVisible}
        />
      )}
    </>
  );
}