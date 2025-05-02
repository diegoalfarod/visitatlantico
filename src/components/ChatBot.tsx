"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import axios from "axios";
import "@/styles/chatbot.css";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [firstGreeting, setFirstGreeting] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await axios.post("/api/chat", {
        messages: [...messages, userMsg],
      });
      // Simulamos escritura de Jimmy
      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);
      if (data.reply) {
        setMessages((m) => [...m, data.reply]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "¡Uy! Algo falló." },
        ]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Error de conexión." },
      ]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (open && firstGreeting) {
      setTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "¡Hola, costeño viajero! Soy Jimmy 🌴, tu guía del Atlántico. ¿En qué te ayudo hoy?",
          },
        ]);
        setTyping(false);
        setFirstGreeting(false);
      }, 800);
    }
  }, [open, firstGreeting]);

  return (
    <>
      {/* FAB */}
      <button
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Abrir chat con Jimmy"
      >
        <Image
          src="/jimmy-avatar.png"
          alt="Avatar Jimmy"
          width={28}
          height={28}
          className="rounded-full"
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Ventana de chat */}
      <div
        className={`
          fixed bottom-0 right-0 m-4
          w-full max-w-sm
          bg-white dark:bg-gray-800
          rounded-t-xl shadow-xl z-50
          transform transition-transform duration-200 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}
          flex flex-col
          max-h-[80vh] md:max-h-[60vh] 
        `}
      >
        {/* Header (sticky) */}
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
            aria-label="Cerrar chat"
          >
            ✕
          </button>
        </header>

        {/* Body (scrollable) */}
        <div className="flex-1 px-4 py-2 overflow-y-auto chat-body space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`
                max-w-[80%] p-3 rounded-lg
                ${m.role === "assistant"
                  ? "bg-neumo-light dark:bg-neumo-dark self-start italic"
                  : "bg-primary/10 dark:bg-primary/30 self-end font-medium"}
              `}
            >
              {m.content}
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-1">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Footer (sticky) */}
        <footer className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-neumo-light dark:bg-neumo-dark px-3 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu pregunta..."
          />
          <button
            className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
            onClick={send}
          >
            Enviar
          </button>
        </footer>
      </div>
    </>
  );
}
