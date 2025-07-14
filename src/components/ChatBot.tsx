// src/components/ChatBot.tsx
"use client";

import { useState, useRef, useEffect, KeyboardEvent, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import "@/styles/chatbot.css";

type UserMessage = { role: "user"; content: string };
type AssistantMessage = { role: "assistant"; content: string };

interface ConversationContext {
  budget?: "economico" | "medio" | "alto";
  interests?: string[];
  travelDates?: { checkIn: string; checkOut: string };
  groupSize?: number;
  location?: string;
  previousRecommendations?: string[];
}

interface DestinationCard {
  id: string;
  name: string;
  url: string;
  image?: string;
  tagline?: string;
  type: "destination";
}

interface PlaceCard {
  id: string;
  name: string;
  address: string;
  rating?: number;
  price_level?: number;
  photo?: string;
  place_id: string;
  type: "place";
  category: "hotel" | "restaurant" | "attraction";
}

type Card = DestinationCard | PlaceCard;

type CardsMessage = {
  role: "assistant";
  content: string;
  cards: Card[];
};

type ChatMessage = UserMessage | AssistantMessage | CardsMessage;

interface ChatAPIResponse {
  reply?: AssistantMessage;
  cards?: Card[];
  context?: ConversationContext;
}

const isBasicMessage = (
  message: ChatMessage
): message is UserMessage | AssistantMessage =>
  message.role === "user" || (message.role === "assistant" && !("cards" in message));

function detectLanguage(text: string): "es" | "en" {
  return /[áéíóúñ¿¡]/i.test(text) ? "es" : "en";
}

// Función para generar estrellas de rating con diseño premium
function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="star-full">★</span>
    );
  }
  
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star-half">☆</span>
    );
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="star-empty">☆</span>
    );
  }
  
  return (
    <div className="rating-container">
      <div className="stars-wrapper">{stars}</div>
      <span className="rating-text">({rating.toFixed(1)})</span>
    </div>
  );
}

// Función para mostrar nivel de precios con diseño premium
function PriceLevel({ level }: { level?: number }) {
  if (!level) return null;
  
  const symbols = [];
  for (let i = 0; i < level; i++) {
    symbols.push(<span key={i} className="price-active">$</span>);
  }
  for (let i = level; i < 4; i++) {
    symbols.push(<span key={i} className="price-inactive">$</span>);
  }
  
  return <div className="price-level">{symbols}</div>;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [firstGreeting, setFirstGreeting] = useState(true);
  const [context, setContext] = useState<ConversationContext>({});
  const [isOnline, setIsOnline] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const defaultLang =
    typeof navigator !== "undefined" && navigator.language.startsWith("en") ? "en" : "es";

  // Detectar estado online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* Primer saludo premium */
  useEffect(() => {
    if (open && firstGreeting) {
      setTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              defaultLang === "en"
                ? "¡Welcome to the magical Atlántico! 🌴✨ I'm Jimmy, your premium travel concierge. I'll help you discover hidden gems, luxury accommodations, and unforgettable experiences. What adventure shall we craft for you today? 🏖️🌅"
                : "¡Bienvenido al mágico Atlántico! 🌴✨ Soy Jimmy, tu concierge de viajes premium. Te ayudaré a descubrir joyas ocultas, alojamientos de lujo y experiencias inolvidables. ¿Qué aventura crearemos para ti hoy? 🏖️🌅",
          },
        ]);
        setTyping(false);
        setFirstGreeting(false);
      }, 1500);
    }
  }, [open, firstGreeting, defaultLang]);

  /* Autoscroll suave */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEnd.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }, 100);
    }
  }, [messages, open, typing]);

  /* Enviar mensaje con loading states */
  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const lang = detectLanguage(text);
    const userMsg: UserMessage = { role: "user", content: text };

    // Añadir mensaje del usuario con animación
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await axios.post<ChatAPIResponse>("/api/chat", {
        messages: [...messages.filter(isBasicMessage), userMsg],
        language: lang,
        context: context,
      });

      // Simular tiempo de procesamiento para efecto premium
      await new Promise((r) => setTimeout(r, 1200));
      setTyping(false);

      // Actualizar contexto si viene en la respuesta
      if (data.context) {
        setContext(data.context);
      }

      if (data.cards) {
        const cardsMsg: CardsMessage = {
          role: "assistant",
          content: data.reply?.content || "",
          cards: data.cards,
        };
        setMessages((prev) => [...prev, cardsMsg]);
      } else if (data.reply) {
        setMessages((prev) => [...prev, data.reply!]);
      }
    } catch (error) {
      setTyping(false);
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: lang === "en" 
            ? "I'm experiencing connectivity issues. Please try again in a moment! 🌐" 
            : "Estoy experimentando problemas de conectividad. ¡Inténtalo de nuevo en un momento! 🌐",
        },
      ]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* Tarjeta de destino premium */
  function DestinationCard({ card }: { card: DestinationCard }) {
    return (
      <Link href={card.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="destination-card group">
          <div className="card-image-container">
            {card.image ? (
              <Image
                src={card.image}
                alt={card.name}
                width={400}
                height={240}
                className="card-image"
                onError={() => {}}
              />
            ) : (
              <div className="card-image-placeholder">
                <span>🏝️</span>
              </div>
            )}
            <div className="card-overlay">
              <span className="view-details">
                {defaultLang === "en" ? "Explore Destination" : "Explorar Destino"}
              </span>
            </div>
          </div>
          <div className="card-content">
            <h3 className="card-title">{card.name}</h3>
            {card.tagline && (
              <p className="card-subtitle">{card.tagline}</p>
            )}
            <div className="card-action">
              <span className="action-text">
                {defaultLang === "en" ? "Discover More" : "Descubrir Más"}
              </span>
              <span className="action-icon">→</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* Tarjeta de lugar premium */
  function PlaceCard({ card }: { card: PlaceCard }) {
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case "hotel": return "🏨";
        case "restaurant": return "🍽️";
        case "attraction": return "🎯";
        default: return "📍";
      }
    };

    const getCategoryLabel = (category: string) => {
      if (defaultLang === "en") {
        switch (category) {
          case "hotel": return "Accommodation";
          case "restaurant": return "Restaurant";
          case "attraction": return "Attraction";
          default: return "Place";
        }
      } else {
        switch (category) {
          case "hotel": return "Alojamiento";
          case "restaurant": return "Restaurante";
          case "attraction": return "Atracción";
          default: return "Lugar";
        }
      }
    };

    const openInMaps = () => {
      const query = encodeURIComponent(`${card.name} ${card.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${card.place_id}`, '_blank');
    };

    return (
      <div className="place-card group">
        <div className="card-header">
          {card.photo ? (
            <img
              src={card.photo}
              alt={card.name}
              className="place-image"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="place-image-placeholder">
              <span className="placeholder-icon">{getCategoryIcon(card.category)}</span>
            </div>
          )}
          <div className="category-badge">
            <span className="category-icon">{getCategoryIcon(card.category)}</span>
            <span className="category-text">{getCategoryLabel(card.category)}</span>
          </div>
        </div>
        
        <div className="place-content">
          <h3 className="place-title">{card.name}</h3>
          
          <div className="place-meta">
            <StarRating rating={card.rating} />
            <PriceLevel level={card.price_level} />
          </div>

          <p className="place-address">{card.address}</p>
          
          <button
            onClick={openInMaps}
            className="maps-button group/btn"
          >
            <span className="maps-icon">🗺️</span>
            <span className="maps-text">
              {defaultLang === "en" ? "View on Maps" : "Ver en Maps"}
            </span>
            <span className="maps-arrow">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* FAB Premium */}
      <div className="fab-container">
        <button
          className="chat-fab-premium"
          onClick={() => setOpen(true)}
          aria-label={defaultLang === "en" ? "Chat with Jimmy, your premium Atlántico guide" : "Habla con Jimmy, tu guía premium del Atlántico"}
        >
          <div className="fab-background"></div>
          <div className="fab-content">
            <Image
              src="/jimmy-avatar.png"
              alt="Avatar Jimmy"
              width={36}
              height={36}
              className="fab-avatar"
            />
            {!isOnline && <div className="offline-indicator"></div>}
          </div>
          <div className="fab-pulse"></div>
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop Premium */}
          <div 
            className="chat-backdrop" 
            onClick={() => setOpen(false)} 
          />

          {/* Ventana de chat premium */}
          <div className="chat-window">
            {/* Header Premium */}
            <header className="chat-header">
              <div className="header-background"></div>
              <div className="header-content">
                <div className="header-info">
                  <div className="avatar-container">
                    <Image
                      src="/jimmy-avatar.png"
                      alt="Avatar Jimmy"
                      width={40}
                      height={40}
                      className="header-avatar"
                    />
                    <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="header-text">
                    <h2 className="header-title">Jimmy 🌴</h2>
                    <p className="header-subtitle">
                      {defaultLang === "en" ? "Premium Travel Concierge" : "Concierge de Viajes Premium"}
                    </p>
                  </div>
                </div>
                <button
                  className="close-button"
                  onClick={() => setOpen(false)}
                  aria-label={defaultLang === "en" ? "Close chat" : "Cerrar chat"}
                >
                  <span className="close-icon">✕</span>
                </button>
              </div>
            </header>

            {/* Chat Body Premium */}
            <div className="chat-body-premium">
              <div className="messages-container">
                {messages.map((m, i) => {
                  if ("cards" in m) {
                    return (
                      <Fragment key={i}>
                        <div className="assistant-message-container">
                          <div className="message-avatar">
                            <Image
                              src="/jimmy-avatar.png"
                              alt="Jimmy"
                              width={32}
                              height={32}
                              className="avatar-small"
                            />
                          </div>
                          <div className="assistant-message">
                            <p className="message-text">{m.content}</p>
                          </div>
                        </div>
                        <div className="cards-grid">
                          {m.cards.slice(0, 3).map((card) => (
                            <div key={card.id} className="card-wrapper">
                              {card.type === "destination" ? (
                                <DestinationCard card={card as DestinationCard} />
                              ) : (
                                <PlaceCard card={card as PlaceCard} />
                              )}
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    );
                  }

                  return (
                    <div
                      key={i}
                      className={`message-wrapper ${m.role === "assistant" ? "assistant" : "user"}`}
                    >
                      {m.role === "assistant" && (
                        <div className="message-avatar">
                          <Image
                            src="/jimmy-avatar.png"
                            alt="Jimmy"
                            width={32}
                            height={32}
                            className="avatar-small"
                          />
                        </div>
                      )}
                      <div className={`message-bubble ${m.role}`}>
                        <p className="message-text">{m.content}</p>
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="typing-container">
                    <div className="message-avatar">
                      <Image
                        src="/jimmy-avatar.png"
                        alt="Jimmy typing"
                        width={32}
                        height={32}
                        className="avatar-small typing-avatar"
                      />
                    </div>
                    <div className="typing-bubble">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEnd} />
              </div>
            </div>

            {/* Footer Premium */}
            <footer className="chat-footer">
              <div className="footer-background"></div>
              
              {/* Context Indicators */}
              {(context.budget || context.interests?.length || context.location) && (
                <div className="context-indicators">
                  {context.budget && (
                    <div className="context-chip">
                      <span className="chip-icon">💰</span>
                      <span className="chip-text">{context.budget}</span>
                    </div>
                  )}
                  {context.location && (
                    <div className="context-chip">
                      <span className="chip-icon">📍</span>
                      <span className="chip-text">{context.location}</span>
                    </div>
                  )}
                  {context.interests?.slice(0, 2).map(interest => (
                    <div key={interest} className="context-chip">
                      <span className="chip-icon">✨</span>
                      <span className="chip-text">{interest}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="input-container">
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={
                      defaultLang === "en" 
                        ? "Ask me about hotels, restaurants, attractions..." 
                        : "Pregúntame sobre hoteles, restaurantes, atracciones..."
                    }
                    disabled={typing || !isOnline}
                  />
                  <button
                    className="send-button"
                    onClick={send}
                    disabled={!input.trim() || typing || !isOnline}
                  >
                    <span className="send-icon">→</span>
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}
    </>
  );
}