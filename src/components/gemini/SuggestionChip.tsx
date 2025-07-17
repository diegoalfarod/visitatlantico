// SuggestionChip.tsx
"use client";

import { useCallback } from "react";

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
  small?: boolean;
  isDark?: boolean;
}

export function SuggestionChip({ label, onClick, small = false, isDark = false }: SuggestionChipProps) {
  const handleClick = useCallback(() => {
    // Haptic feedback en móvil
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        rounded-full border transition-all duration-200
        hover:scale-105 active:scale-95
        ${small ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"}
        ${
          isDark
            ? "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
            : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600"
        }
        shadow-sm hover:shadow-md
      `}
      style={{ fontFamily: "Merriweather Sans" }}
    >
      {label}
    </button>
  );
}