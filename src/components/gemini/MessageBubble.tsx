"use client";

import Image from "next/image";
import { Copy, Check, Shield, User } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "@/types/geminiChat";

export function MessageBubble({
  message,
  isLast = false,
  showAvatar = true,
}: {
  message: ChatMessage;
  isLast?: boolean;
  showAvatar?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  /* --- Copiar --- */
  const copy = async () => {
    await navigator.clipboard.writeText(
      message.text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex items-end gap-2 w-full ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      {!isUser && showAvatar && (
        <Image
          src="/jimmy-avatar.png"
          alt="Jimmy"
          width={28}
          height={28}
          className="rounded-full flex-shrink-0"
        />
      )}
      {isUser && showAvatar && (
        <div className="rounded-full bg-gray-300 h-7 w-7 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-gray-600" />
        </div>
      )}

      <div className={`flex flex-col gap-1 flex-1 ${isUser && "items-end"}`}>
        <div
          className={`
            relative w-fit max-w-[90vw] sm:max-w-[80%] md:max-w-[60%]
            break-words whitespace-pre-line rounded-xl px-4 py-3 text-sm shadow-sm border
            ${isUser
              ? "bg-red-600 text-white border-red-700 rounded-br-md"
              : "bg-white text-gray-800 border-gray-200 rounded-bl-md"}
            ${isLast && !isUser ? "animate-message-in" : ""}
          `}
        >
          <button
            onClick={copy}
            className={`
              absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center text-xs transition-opacity duration-200
              opacity-0 hover:opacity-100
              ${isUser
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"}
            `}
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, "<br />") }} />
        </div>

        <div
          className={`flex items-center gap-2 text-xs text-gray-500 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          <span>{time}</span>
          {!isUser && (
            <span className="flex items-center gap-1">
              <Shield size={10} className="text-red-600" />
              <span className="font-medium">Oficial</span>
            </span>
          )}
          {copied && <span className="text-green-500 font-medium">Copiado</span>}
        </div>
      </div>
    </div>
  );
}
