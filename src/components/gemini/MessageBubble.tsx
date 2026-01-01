"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Copy, Check, Shield, User, AlertCircle } from "lucide-react";
import { useState, useCallback, useMemo, memo } from "react";
import DOMPurify from "dompurify";
import type { ChatMessage } from "@/types/geminiChat";
import { useMediaQuery } from 'react-responsive';

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
  showAvatar?: boolean;
  isDark?: boolean;
  fontSize: FontSize;
}

type FontSize = "text-sm" | "text-base" | "text-lg";

const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

export const MessageBubble = memo(function MessageBubble({
  message,
  isLast = false,
  showAvatar = true,
  isDark = false,
  fontSize
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const isUser = message.role === "user";
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Sanitize HTML content
  const sanitizedHtml = useMemo(() => 
    DOMPurify.sanitize(message.text.replace(/\n/g, "<br />")),
    [message.text]
  );

  // Check clipboard support
  const supportsClipboard = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return !!navigator.clipboard || typeof document.execCommand === 'function';
  }, []);

  const copy = useCallback(async () => {
    const textToCopy = message.text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setCopyError(false);
            setTimeout(() => setCopied(false), 2000);
          } else {
            throw new Error("Copy command failed");
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          setCopyError(true);
          setTimeout(() => setCopyError(false), 3000);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [message.text]);

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={isLast ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
      className={`flex items-end gap-3 w-full ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
      onMouseEnter={() => !isUser && setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      {/* Avatar - Bot */}
      {!isUser && showAvatar && !isMobile && (
        <div className="relative flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E40E20] to-[#D31A2B] p-0.5 shadow-md shadow-red-500/20">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image
                src="/jimmy-avatar.png"
                alt="Jimmy"
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Avatar - User */}
      {isUser && showAvatar && !isMobile && (
        <div className="rounded-full bg-[#C1C5C8]/30 h-8 w-8 flex items-center justify-center flex-shrink-0 mb-1">
          <User size={14} className="text-[#4A4F55]" />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 flex-1 max-w-[85%] sm:max-w-[75%] ${isUser && "items-end"}`}>
        {/* Message Bubble */}
        <div
          className={`
            relative w-fit
            break-words whitespace-pre-line rounded-2xl px-4 py-3 ${fontSize}
            ${isUser
              ? "bg-gradient-to-br from-[#E40E20] to-[#D31A2B] text-white rounded-br-md shadow-lg shadow-red-500/15"
              : `${isDark 
                  ? 'bg-gray-800/90 text-white border border-gray-700/50 backdrop-blur-sm' 
                  : 'bg-white text-[#4A4F55] border border-[#C1C5C8]/30 shadow-sm'
                } rounded-bl-md`
            }
          `}
          style={{ fontFamily: "'Merriweather Sans', sans-serif" }}
        >
          {/* Copy button - solo para mensajes del bot */}
          {supportsClipboard && !isUser && (
            <motion.button
              onClick={copy}
              initial={{ opacity: 0 }}
              animate={{ opacity: showCopyButton || isMobile ? 1 : 0 }}
              title={copyError ? "No se pudo copiar" : "Copiar mensaje"}
              className={`
                absolute top-2 right-2 h-7 w-7 rounded-lg 
                flex items-center justify-center text-xs 
                transition-all duration-200
                ${isDark 
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                  : "bg-[#FAFAFA] hover:bg-gray-100 text-[#7A858C]"
                }
              `}
            >
              {copied ? (
                <Check size={14} className="text-emerald-500" />
              ) : copyError ? (
                <AlertCircle size={14} className="text-[#E40E20]" />
              ) : (
                <Copy size={14} />
              )}
            </motion.button>
          )}
          
          <div 
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            className={supportsClipboard && !isUser ? "pr-8" : ""} 
          />
        </div>

        {/* Metadata */}
        <div
          className={`flex items-center gap-2 text-[11px] ${isUser ? "flex-row-reverse" : ""}`}
          style={{ color: isDark ? '#94a3b8' : '#7A858C' }}
        >
          <span>{time}</span>
          {!isUser && (
            <span className="flex items-center gap-1">
              <Shield size={10} className="text-[#E40E20]" />
              <span className="font-medium">Oficial</span>
            </span>
          )}
          {copied && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-500 font-medium"
            >
              Copiado
            </motion.span>
          )}
          {copyError && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#E40E20] font-medium"
            >
              Error al copiar
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
});