"use client";

import { useCallback, memo } from "react";
import { motion } from "framer-motion";

// =============================================================================
// DESIGN TOKENS - VisitAtlántico Brand
// =============================================================================
const COLORS = {
  naranjaSalinas: "#EA5B13",
  rojoCayena: "#D31A2B",
};

const EASE = [0.22, 1, 0.36, 1];

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
    try { navigator.vibrate?.(8); } catch {}
    onClick();
  }, [onClick, disabled]);

  // Extract emoji if present at start
  const hasEmoji = /^[\p{Emoji}]/u.test(label);
  const emoji = hasEmoji ? label.match(/^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\u200d]+/u)?.[0] : null;
  const text = emoji ? label.slice(emoji.length).trim() : label;

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={handleClick}
      disabled={disabled}
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={`
        group inline-flex items-center justify-center gap-2 rounded-full font-medium 
        transition-all duration-200 
        ${small ? "px-3.5 py-2 text-sm" : "px-4 py-2.5 text-sm"}
        ${isDark 
          ? `bg-slate-700/80 border border-slate-600/60 text-slate-200
             hover:bg-slate-600/90 hover:border-orange-500/40 hover:text-white`
          : `bg-white border border-slate-200/80 text-slate-600 shadow-sm
             hover:border-orange-300 hover:text-orange-600 hover:shadow-md hover:bg-orange-50/50`
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{ 
        fontFamily: "'Montserrat', sans-serif", 
        WebkitTapHighlightColor: "transparent" 
      }}
    >
      {emoji && (
        <span className="text-base transition-transform group-hover:scale-110">
          {emoji}
        </span>
      )}
      <span className="whitespace-nowrap">{text}</span>
    </motion.button>
  );
});