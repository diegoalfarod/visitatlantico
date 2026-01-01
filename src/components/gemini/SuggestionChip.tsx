"use client";

import { useCallback, memo } from "react";
import { motion } from "framer-motion";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
  small?: boolean;
  isDark?: boolean;
  disabled?: boolean;
}

export const SuggestionChip = memo(function SuggestionChip({
  label,
  onClick,
  small = false,
  isDark = false,
  disabled = false,
}: SuggestionChipProps) {
  const handleClick = useCallback(() => {
    if (disabled) return;

    // Haptic feedback en móviles compatibles
    try {
      navigator.vibrate?.(10);
    } catch {
      // Silently fail - haptics are non-essential
    }
    
    onClick();
  }, [onClick, disabled]);

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        inline-flex items-center justify-center rounded-full font-medium 
        transition-all duration-200 
        ${small ? "px-3.5 py-2 text-sm" : "px-4 py-2.5 text-sm"}
        ${isDark 
          ? `
            bg-gray-700/80 border border-gray-600/50 text-white
            hover:bg-gray-600 hover:border-[#E40E20]/50 hover:text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E40E20]/50
          ` 
          : `
            bg-white border border-[#C1C5C8]/40 text-[#4A4F55] shadow-sm
            hover:border-[#E40E20]/60 hover:text-[#E40E20] hover:shadow-md hover:shadow-red-500/5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E40E20]/30
          `
        }
        ${disabled 
          ? "opacity-50 cursor-not-allowed hover:shadow-none" 
          : "cursor-pointer"
        }
      `}
      style={{ 
        fontFamily: "'Merriweather Sans', sans-serif", 
        WebkitTapHighlightColor: "transparent" 
      }}
    >
      {label}
    </motion.button>
  );
});