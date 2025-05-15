// src/components/ChatBot.tsx
"use client";

import { useState, useRef, useEffect, KeyboardEvent, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import "@/styles/chatbot.css";

type UserMessage = { role: "user"; content: string };
type AssistantMessage = { role: "assistant"; content: string };
type CardsMessage = {
  role: "assistant";
  content: string;
  cards: {
    id: string;
    name: string;
    url: string;
    image?: string;
    tagline?: string;
  }[];
};
type ChatMessage = UserMessage | AssistantMessage | CardsMessage;

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

  useEffect(() => {
    if (open && firstGreeting) {
      setTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              defaultLang === "en"
                ? "Hello, traveler! I’m Jimmy 🌴, your guide to the Atlántico region. How can I help?"
                : "¡Hola, viajero! Soy Jimmy 🌴, tu guía del Atlántico. ¿En qué te ayudo?",
          },
        ]);
        setTyping(false);
        setFirstGreeting(false);
      }, 800);
    }
  }, [open, firstGreeting, defaultLang]);

  useEffect(() => {
    if (open) messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const msgLang = detectLanguage(text);
    const userMsg: UserMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await axios.post("/api/chat", {
        messages: [
          ...messages.filter((m) => !(m.role === "assistant" && "cards" in m)),
          userMsg,
        ],
        language: msgLang,
      });

      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);

      if ((data as any).cards) {
        const cardsMsg: CardsMessage = {
          role: "assistant",
          content: data.reply!.content,
          cards: (data as any).cards,
        };
        setMessages((m) => [...m, cardsMsg]);
      } else if (data.reply) {
        setMessages((m) => [...m, data.reply as AssistantMessage]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            msgLang === "en"
              ? "Connection error."
              : "Error de conexión.",
        } as AssistantMessage,
      ]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  function DestinationCard({
    name,
    url,
    image,
    tagline,
  }: {
    name: string;
    url: string;
    image?: string;
    tagline?: string;
  }) {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 flex flex-col hover:bg-gray-50 cursor-pointer">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-full h-32 object-cover rounded-md mb-2"
              onError={(e) => {
                (e.currentTarget.style as any).display = "none";
              }}
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
      {/* Solo el FAB siempre */}
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

      {/*
        Montamos backdrop + ventana únicamente cuando open === true
      */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Chat window */}
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
                aria-label={defaultLang === "en" ? "Close chat" : "Cerrar chat"}
              >
                ✕
              </button>
            </header>

            <div className="flex-1 px-4 py-2 overflow-y-auto chat-body space-y-2">
              {messages.map((m, i) => {
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
