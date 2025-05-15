// src/components/ChatBot.tsx
"use client";

import { useState, useRef, useEffect, KeyboardEvent, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import "@/styles/chatbot.css";

type UserMessage = { role: "user"; content: string };
type AssistantMessage = { role: "assistant"; content: string };
type Card = {
  id: string;
  name: string;
  url: string;
  image?: string;
  tagline?: string;
};
type CardsMessage = {
  role: "assistant";
  content: string;
  cards: Card[];
};
type ChatMessage = UserMessage | AssistantMessage | CardsMessage;

interface ChatAPIResponse {
  reply?: AssistantMessage;
  cards?: Card[];
}

function detectLanguage(text: string): "es" | "en" {
  return /[áéíóúñ¿¡]/i.test(text) ? "es" : "en";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [firstGreeting, setFirstGreeting] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const defaultLang =
    typeof navigator !== "undefined" && navigator.language.startsWith("en")
      ? "en"
      : "es";

  // Saludo inicial
  useEffect(() => {
    if (open && firstGreeting) {
      setTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              defaultLang === "en"
                ? "Hello, traveler! I'm Jimmy 🌴, your guide to the Atlántico region. How can I help?"
                : "¡Hola, viajero! Soy Jimmy 🌴, tu guía del Atlántico. ¿En qué te ayudo?",
          },
        ]);
        setTyping(false);
        setFirstGreeting(false);
      }, 800);
    }
  }, [open, firstGreeting, defaultLang]);

  // Mantener scroll al final
  useEffect(() => {
    if (open) messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const lang = detectLanguage(text);
    const userMsg: UserMessage = { role: "user", content: text };

    // Agregamos el mensaje del usuario
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Preparamos el historial para enviar al API (solo user+assistant, sin tarjetas)
      const history = messages
        .filter((m): m is UserMessage | AssistantMessage => 
          m.role === "user" || (m.role === "assistant" && !("cards" in m))
        )
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await axios.post<ChatAPIResponse>("/api/chat", {
        messages: [...history, userMsg],
        language: lang,
      });

      // Simular tipeo
      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);

      // Si vienen tarjetas
      if (data.cards) {
        const cardsMsg: CardsMessage = {
          role: "assistant",
          content: data.reply?.content || "",
          cards: data.cards,
        };
        setMessages((prev) => [...prev, cardsMsg]);
      }
      // Si solo viene texto
      else if (data.reply) {
        // Ensure data.reply is a valid ChatMessage before adding it to the array
        const newMessage: ChatMessage = {
          role: 'assistant',
          content: data.reply.content || data.reply.toString(),
          // Add any other required properties of ChatMessage
        };
        
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "en"
              ? "Connection error."
              : "Error de conexión.",
        },
      ]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  // Componente para mostrar cada tarjeta
  function DestinationCard({ id, name, url, image, tagline }: Card) {
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 flex flex-col hover:bg-gray-50 cursor-pointer">
          {image && (
            <Image
              src={image}
              alt={name}
              width={300}
              height={160}
              className="w-full object-cover rounded-md mb-2"
              onError={() => {}}
            />
          )}
          <h3 className="font-semibold">{name}</h3>
          {tagline && <p className="text-sm text-gray-500">{tagline}</p>}
          <span className="mt-2 text-primary hover:underline">
            {defaultLang === "en" ? "View details" : "Ver más"}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <>
      {/* FAB siempre visible */}
      <button
        className="chat-fab z-50"
        onClick={() => setOpen(true)}
        aria-label={
          defaultLang === "en" ? "Open chat with Jimmy" : "Abrir chat con Jimmy"
        }
      >
        <Image
          src="/jimmy-avatar.png"
          alt="Avatar Jimmy"
          width={28}
          height={28}
          className="rounded-full"
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Ventana de chat, 5rem sobre el FAB */}
          <div className="fixed bottom-20 right-4 w-full max-w-sm bg-white dark:bg-gray-800 rounded-t-xl shadow-xl z-50 flex flex-col max-h-[80vh] md:max-h-[60vh]">
            <header className="flex items-center justify-between p-4 bg-primary dark:bg-primary-dark rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Image
                  src="/jimmy-avatar.png"
                  alt="Avatar Jimmy"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <h2 className="text-lg font-semibold text-white">Jimmy</h2>
              </div>
              <button
                className="text-white text-xl"
                onClick={() => setOpen(false)}
                aria-label={
                  defaultLang === "en" ? "Close chat" : "Cerrar chat"
                }
              >
                ✕
              </button>
            </header>

            <div className="flex-1 px-4 py-2 overflow-y-auto chat-body space-y-2">
              {messages.map((m, i) => {
                // Mensaje con tarjetas
                if ("cards" in m) {
                  return (
                    <Fragment key={i}>
                      <div className="max-w-[80%] p-3 rounded-lg bg-neumo-light dark:bg-neumo-dark self-start italic">
                        {m.content}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {m.cards.slice(0, 3).map((c) => (
                          <div key={c.id} className="w-[45%]">
                            <DestinationCard {...c} />
                          </div>
                        ))}
                      </div>
                    </Fragment>
                  );
                }

                // Mensaje normal
                return (
                  <div
                    key={i}
                    className={`
                      max-w-[80%] p-3 rounded-lg
                      ${
                        m.role === "assistant"
                          ? "bg-neumo-light dark:bg-neumo-dark self-start italic"
                          : "bg-primary/10 dark:bg-primary/30 self-end font-medium"
                      }
                    `}
                  >
                    {m.content}
                  </div>
                );
              })}

              {typing && (
                <div className="flex items-center gap-1">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}

              <div ref={messagesEnd} />
            </div>

            <footer className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <input
                type="text"
                className="flex-1 bg-neumo-light dark:bg-neumo-dark px-3 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  defaultLang === "en"
                    ? "Type your question..."
                    : "Escribe tu pregunta..."
                }
              />
              <button
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                onClick={send}
              >
                {defaultLang === "en" ? "Send" : "Enviar"}
              </button>
            </footer>
          </div>
        </>
      )}
    </>
  );
}