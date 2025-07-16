"use client";

import { Shield } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="relative max-w-fit">
      {/* Message Bubble */}
      <div className="relative rounded-xl rounded-bl-md bg-white shadow-sm px-4 py-3 border border-gray-200">
        
        {/* Content */}
        <div className="flex items-center gap-3">
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
          </div>

          {/* Text with Icon */}
          <div className="flex items-center gap-2 text-sm">
            <Shield size={14} className="text-red-600" />
            <span className="font-medium text-gray-600 font-merriweather-sans">
              Asistente escribiendo
            </span>
            
            {/* Animated cursor */}
            <span className="w-0.5 h-4 bg-red-600 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}