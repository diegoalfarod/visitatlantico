"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  azulBarranquero: "#007BC4",
  naranjaSalinas: "#EA5B13",
  rojoCayena: "#D31A2B",
};

/**
 * TopLoadingBar - Barra de progreso global en la parte superior
 *
 * Se muestra automáticamente durante las navegaciones entre páginas
 * Estilo premium inspirado en YouTube/GitHub
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Iniciar loading
    setIsLoading(true);
    setProgress(0);

    // Simular progreso incremental
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Detenerse en 90% hasta que termine
        return prev + Math.random() * 10;
      });
    }, 200);

    // Completar después de que la página cargue
    const timeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background track */}
          <div
            className="absolute inset-0 bg-gray-200"
            style={{ opacity: 0.3 }}
          />

          {/* Progress bar con gradiente premium */}
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              background: `linear-gradient(90deg, ${COLORS.azulBarranquero}, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
              boxShadow: `0 0 10px ${COLORS.naranjaSalinas}50`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Glow effect en el extremo */}
          <motion.div
            className="absolute inset-y-0 w-20 blur-lg"
            style={{
              left: `${progress}%`,
              background: `linear-gradient(90deg, transparent, ${COLORS.naranjaSalinas}80)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 5 ? 1 : 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
