"use client";

import { motion } from "framer-motion";

// =============================================================================
// DESIGN TOKENS - VisitAtlántico Brand
// =============================================================================
const COLORS = {
  naranjaSalinas: "#EA5B13",
  rojoCayena: "#D31A2B",
};

const EASE = [0.22, 1, 0.36, 1];

interface TypingIndicatorProps {
  isDark?: boolean;
}

export function TypingIndicator({ isDark = false }: TypingIndicatorProps) {
  const dotColors = [
    COLORS.naranjaSalinas,
    COLORS.rojoCayena,
    COLORS.naranjaSalinas,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`
        inline-flex items-center gap-3 px-4 py-3 rounded-[20px] rounded-bl-[6px]
        ${isDark 
          ? "bg-slate-800/90 border border-slate-700/50 backdrop-blur-sm" 
          : "bg-white border border-slate-100 shadow-sm"
        }
      `}
    >
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: isDark 
                ? `${dotColors[i]}cc` 
                : dotColors[i] 
            }}
            animate={{
              y: [-2, 2, -2],
              opacity: [0.5, 1, 0.5],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        Jimmy está escribiendo
      </motion.span>
    </motion.div>
  );
}