// TypingIndicator.tsx
"use client";

import { Shield } from "lucide-react";

interface TypingIndicatorProps {
    isDark?: boolean;
}

export function TypingIndicator({ isDark = false }: TypingIndicatorProps) {
    return (
        <div className="relative max-w-fit">
            {/* Message Bubble con glassmorphism sutil */}
            <div className={`
                relative rounded-2xl rounded-bl-md shadow-sm px-4 py-3 
                backdrop-blur-sm transition-all duration-300
                ${isDark 
                    ? 'bg-gray-800/90 border border-gray-700/50' 
                    : 'bg-white/90 border border-gray-200/50'
                }
            `}>
                {/* Content */}
                <div className="flex items-center gap-3">
                    {/* Animated Dots con timing mejorado */}
                    <div className="flex items-center gap-1.5">
                        <div 
                            className="w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-sm" 
                            style={{ 
                                animationDelay: '0ms',
                                animationDuration: '1.4s'
                            }} 
                        />
                        <div 
                            className="w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-sm" 
                            style={{ 
                                animationDelay: '200ms',
                                animationDuration: '1.4s'
                            }} 
                        />
                        <div 
                            className="w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-sm" 
                            style={{ 
                                animationDelay: '400ms',
                                animationDuration: '1.4s'
                            }} 
                        />
                    </div>

                    {/* Text with Icon */}
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-red-600" />
                        <span className={`
                            text-sm font-medium font-merriweather-sans
                            ${isDark ? 'text-gray-300' : 'text-gray-600'}
                        `}>
                            Jimmy está escribiendo
                        </span>
                        
                        {/* Animated cursor con pulse mejorado */}
                        <span className="relative">
                            <span className="absolute -inset-1 w-1 h-5 bg-red-500/20 rounded-full animate-ping" />
                            <span className="relative block w-0.5 h-4 bg-red-500 rounded-full animate-pulse" />
                        </span>
                    </div>
                </div>

                {/* Subtle animated background effect */}
                <div className={`
                    absolute inset-0 rounded-2xl rounded-bl-md -z-10
                    ${isDark ? 'bg-gray-700/20' : 'bg-gray-100/50'}
                    animate-pulse
                `} />
            </div>
        </div>
    );
}