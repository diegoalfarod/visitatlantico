"use client";

import { motion } from "framer-motion";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

interface TypingIndicatorProps {
  isDark?: boolean;
}

export function TypingIndicator({ isDark = false }: TypingIndicatorProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -4 },
  };

  const dotTransition = (delay: number) => ({
    duration: 0.4,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
    delay,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md
        ${isDark 
          ? "bg-gray-800/90 border border-gray-700/50 backdrop-blur-sm" 
          : "bg-white border border-[#C1C5C8]/30 shadow-sm"
        }
      `}
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={dotTransition(i * 0.15)}
            className={`
              w-2 h-2 rounded-full
              ${isDark ? "bg-[#E40E20]/70" : "bg-[#E40E20]"}
            `}
          />
        ))}
      </div>
      <span
        className={`text-sm ${isDark ? "text-gray-400" : "text-[#7A858C]"}`}
        style={{ fontFamily: "'Merriweather Sans', sans-serif" }}
      >
        escribiendo
      </span>
    </motion.div>
  );
}