// messageBubble.tsx
"use client";

import Image from "next/image";
import { Copy, Check, Shield, User } from "lucide-react";
import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types/geminiChat";
import { useMediaQuery } from 'react-responsive';

interface MessageBubbleProps {
    message: ChatMessage;
    isLast?: boolean;
    showAvatar?: boolean;
    isDark?: boolean;
    fontSize: FontSize;
}

type FontSize = "text-sm" | "text-base" | "text-lg";

export function MessageBubble({
    message,
    isLast = false,
    showAvatar = true,
    isDark = false,
    fontSize
}: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const isUser = message.role === "user";
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const copy = useCallback(async () => {
        const textToCopy = message.text.replace(/<[^>]*>/g, "").replace(/ /g, " ");
        
        try {
            // Método moderno
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
                setCopied(true);
                setCopyError(false);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // Fallback para navegadores antiguos o contextos no seguros
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
        <div
            className={`flex items-end gap-2 w-full ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
        >
            {!isUser && showAvatar && !isMobile && (
                <Image
                    src="/jimmy-avatar.png"
                    alt="Jimmy"
                    width={28}
                    height={28}
                    className="rounded-full flex-shrink-0"
                />
            )}
            {isUser && showAvatar && !isMobile && (
                <div className="rounded-full bg-gray-300 h-7 w-7 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-gray-600" />
                </div>
            )}

            <div className={`flex flex-col gap-1 flex-1 ${isUser && "items-end"}`}>
                <div
                    className={`
            relative w-fit max-w-[90vw] sm:max-w-[80%] md:max-w-[60%]
            break-words whitespace-pre-line rounded-2xl px-4 py-3 ${fontSize} shadow-sm border
            ${isUser
                            ? "bg-[#E40E20] text-white border-[#E40E20] rounded-br-md"
                            : `${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-[#4A4F55] border-[#C1C5C8]'} rounded-bl-md`
                        }
            ${isLast && !isUser ? "animate-message-in" : ""}
          `}
                    style={{ fontFamily: 'Merriweather Sans' }}
                >
                    {/* Solo mostrar botón de copiar si el navegador lo soporta */}
                    {(navigator.clipboard || document.queryCommandSupported?.('copy')) && (
                        <button
                            onClick={copy}
                            title={copyError ? "No se pudo copiar" : "Copiar mensaje"}
                            className={`
                                absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center text-xs transition-opacity duration-200
                                opacity-0 hover:opacity-100
                                ${isUser
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                }
                            `}
                        >
                            {copied ? (
                                <Check size={12} className="text-green-500" />
                            ) : copyError ? (
                                <span className="text-red-500">!</span>
                            ) : (
                                <Copy size={12} />
                            )}
                        </button>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, "<br />") }} />
                </div>

                <div
                    className={`flex items-center gap-2 text-xs text-gray-500 ${isUser ? "flex-row-reverse" : ""
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
                    {copyError && <span className="text-red-500 font-medium">Error al copiar</span>}
                </div>
            </div>
        </div>
    );
}