"use client";

import Image from "next/image";
import { Copy, Check, Shield, User } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "@/types/geminiChat";

export function MessageBubble({ 
  message, 
  isLast = false,
  showAvatar = true 
}: { 
  message: ChatMessage;
  isLast?: boolean;
  showAvatar?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  /* ─── Copy message functionality ─── */
  const copyMessage = async () => {
    try {
      const plainText = message.text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  /* ─── Format timestamp ─── */
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`group flex items-end gap-3 max-w-[85%] md:max-w-[75%] ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
      }`}
    >
      {/* Avatar */}
      {!isUser && showAvatar && (
        <div className="relative flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
            <Image
              src="/jimmy-avatar.png"
              alt="Jimmy"
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          {isLast && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
      )}

      {/* User Avatar */}
      {isUser && showAvatar && (
        <div className="relative flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400 flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Container */}
        <div
          className={`group/message relative max-w-full break-words rounded-xl px-4 py-3 text-sm shadow-sm border transition-all duration-200 hover:shadow-md font-merriweather-sans ${
            isUser
              ? "bg-red-600 text-white border-red-700 rounded-br-md"
              : "bg-white text-gray-800 border-gray-200 rounded-bl-md"
          } ${isLast && !isUser ? 'animate-message-in' : ''}`}
        >
          {/* Copy Button */}
          <button
            onClick={copyMessage}
            className={`absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 h-6 w-6 rounded-md flex items-center justify-center text-xs hover:scale-110 ${
              isUser 
                ? "bg-white/20 hover:bg-white/30 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {copied ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>

          {/* Message Content */}
          <div
            className="pr-8"
            dangerouslySetInnerHTML={{
              __html: message.text.replace(/\n/g, "<br />"),
            }}
          />
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center gap-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}>
          <span className="font-merriweather-sans">{formatTime(message.timestamp)}</span>
          
          {!isUser && (
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-red-600" />
              <span className="font-medium font-poppins">Oficial</span>
            </div>
          )}
          
          {copied && (
            <span className="text-green-500 font-medium font-poppins">
              Copiado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}