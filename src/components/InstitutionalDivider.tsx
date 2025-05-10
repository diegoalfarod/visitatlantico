// src/components/InstitutionalDivider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function InstitutionalDivider() {
  const brandColors = {
    primary: "#E40E20",
    lightBlue: "#009ADE",
    darkBlue: "#0047BA",
  };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-20 overflow-hidden -mb-8">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50" />

      {/* Onda principal + sombra difusa */}
      <svg
        viewBox="0 0 1440 150"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,32 C480,160 960,0 1440,96 L1440,320 L0,320 Z"
          fill={brandColors.darkBlue}
          fillOpacity="0.05"
          filter="drop-shadow(0 -6px 10px rgba(0,0,0,0.08))"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>

      {/* Onda secundaria para profundidad */}
      <svg
        viewBox="0 0 1440 150"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,32 C480,160 960,0 1440,96 L1440,320 L0,320 Z"
          fill={brandColors.lightBlue}
          fillOpacity="0.08"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        />
      </svg>

      {/* Highlight radial en la cresta */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[72px] h-20">
        <motion.div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        />
      </div>

      {/* Shimmer en movimiento */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[60px] h-12 opacity-10"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Círculos flotantes (parallax) */}
      {[...Array(6)].map((_, i) => {
        const size = 6 + (i % 3) * 4;
        const positions = [
          { left: "15%", top: "30%" },
          { left: "25%", top: "60%" },
          { left: "40%", top: "25%" },
          { left: "60%", top: "65%" },
          { left: "75%", top: "35%" },
          { left: "85%", top: "55%" },
        ];

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor:
                i % 2 === 0 ? brandColors.lightBlue : brandColors.primary,
              opacity: 0.25,
              ...positions[i],
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              y: scrollY * 0.03 * (i % 2 === 0 ? 1 : -1),
            }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          />
        );
      })}

      {/* Líneas finas institucionales */}
      <div className="absolute bottom-2 left-0 w-full flex justify-center space-x-1">
        <motion.div
          className="h-0.5"
          style={{ backgroundColor: brandColors.primary, width: 64, opacity: 0.2 }}
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="h-0.5"
          style={{ backgroundColor: brandColors.darkBlue, width: 16, opacity: 0.2 }}
          initial={{ width: 0 }}
          animate={{ width: 16 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.div
          className="h-0.5"
          style={{ backgroundColor: brandColors.lightBlue, width: 40, opacity: 0.2 }}
          initial={{ width: 0 }}
          animate={{ width: 40 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
