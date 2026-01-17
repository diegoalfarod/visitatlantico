"use client";

import { useRef, useEffect, ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number | "some" | "all";
}

/**
 * ScrollReveal - Componente premium para animaciones de entrada
 *
 * Usa Framer Motion para crear transiciones suaves cuando el elemento entra en viewport
 * Respeta prefers-reduced-motion automáticamente
 *
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <div>Your content</div>
 * </ScrollReveal>
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount,
    margin: "-50px 0px -50px 0px", // Activa la animación un poco antes
  });

  const shouldReduceMotion = useReducedMotion();

  // Variantes de animación según la dirección
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
      scale: direction === "none" ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
  };

  // Si el usuario prefiere menos movimiento, solo hacer fade
  const reducedMotionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduceMotion ? reducedMotionVariants : variants}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1], // Premium easing curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealStagger - Para animar grupos de elementos en secuencia
 *
 * @example
 * <ScrollRevealStagger staggerDelay={0.1}>
 *   {items.map((item, i) => (
 *     <div key={i}>{item}</div>
 *   ))}
 * </ScrollRevealStagger>
 */
export function ScrollRevealStagger({
  children,
  direction = "up",
  staggerDelay = 0.1,
  className = "",
}: {
  children: ReactNode[];
  direction?: "up" | "down" | "left" | "right";
  staggerDelay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
  });

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  const reducedMotionItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div
            key={index}
            variants={shouldReduceMotion ? reducedMotionItemVariants : itemVariants}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div
          variants={shouldReduceMotion ? reducedMotionItemVariants : itemVariants}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
