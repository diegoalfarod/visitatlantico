"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

// =============================================================================
// NAVIGATION LINK - Link con feedback visual de loading
// =============================================================================

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  showSpinner?: boolean;
  onClick?: () => void;
}

/**
 * NavigationLink - Link mejorado con feedback de loading
 *
 * Muestra un spinner cuando se hace clic, dando feedback inmediato al usuario
 *
 * @example
 * <NavigationLink href="/destinations" className="btn-primary">
 *   Ver destinos
 * </NavigationLink>
 */
export function NavigationLink({
  href,
  children,
  className = "",
  showSpinner = true,
  onClick,
}: NavigationLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (onClick) onClick();

    // Activar loading state
    setIsNavigating(true);

    // Navegar
    router.push(href);

    // Resetear después de un tiempo (por si falla la navegación)
    setTimeout(() => setIsNavigating(false), 3000);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative ${className} ${
        isNavigating ? "pointer-events-none" : ""
      }`}
    >
      {/* Contenido original */}
      <span className={isNavigating ? "opacity-50" : ""}>{children}</span>

      {/* Spinner overlay */}
      {showSpinner && isNavigating && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </Link>
  );
}

// =============================================================================
// NAVIGATION BUTTON - Botón con feedback de loading
// =============================================================================

interface NavigationButtonProps {
  onClick: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  showSpinner?: boolean;
}

/**
 * NavigationButton - Botón con loading state automático
 *
 * @example
 * <NavigationButton onClick={handleSubmit} className="btn-primary">
 *   Enviar
 * </NavigationButton>
 */
export function NavigationButton({
  onClick,
  children,
  className = "",
  disabled = false,
  showSpinner = true,
}: NavigationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`relative ${className} ${
        isLoading || disabled ? "pointer-events-none" : ""
      }`}
    >
      {/* Contenido original */}
      <span className={isLoading ? "opacity-50" : ""}>{children}</span>

      {/* Spinner overlay */}
      {showSpinner && isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </button>
  );
}
