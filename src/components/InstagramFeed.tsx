"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Heart } from "lucide-react";

/* ------------ Colores de marca ------------ */
const brandColors = {
  primary: "#E40E20",   // Rojo institucional
  secondary: "#D34A78", // Rosa secundario (usado de forma muy sutil)
  dark: "#4A4F55",
  medium: "#7A888C",
  light: "#C1C5C8",
};

export default function InstagramFeed() {
  /* ---------- Carga de script Elfsight ---------- */
  useEffect(() => {
    const id = "elfsight-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.src = "https://static.elfsight.com/platform/platform.js";
      s.async = true;
      s.id = id;
      document.body.appendChild(s);
    }
  }, []);

  /* ---------- Animaciones globales ---------- */
  const styles = `
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <section
        id="instagram"
        className="relative py-28 overflow-hidden bg-white"
      >
        {/* Sutil degradado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white -z-10" />

        {/* Ola superior */}
        <div className="absolute top-0 left-0 w-full h-40 -z-10 overflow-hidden">
          <svg
            viewBox="0 0 1440 200"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="insta-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0.1" />
                <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,160L48,138.7C96,117,192,75,288,69.3C384,64,480,96,576,101.3C672,107,768,85,864,80C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              fill="url(#insta-grad)"
            />
          </svg>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-4"
            style={{ color: brandColors.dark }}
          >
            Síguenos en Instagram
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6 text-lg font-medium"
            style={{ color: brandColors.primary }}
          >
            <span className="block w-12 h-1 bg-gradient-to-r from-[#E40E20] to-[#D34A78] rounded-full" />
            Momentos del Atlántico
            <span className="block w-12 h-1 bg-gradient-to-r from-[#D34A78] to-[#E40E20] rounded-full" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg max-w-2xl mx-auto mb-12"
            style={{ color: brandColors.medium }}
          >
            Descubre las mejores experiencias y paisajes del Atlántico a través de nuestro feed de Instagram, cuidadosamente curado para inspirar tu próxima aventura.
          </motion.p>

          {/* Widget Elfsight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative bg-white rounded-3xl p-4 sm:p-8 shadow-lg"
            style={{
              backgroundImage: `linear-gradient(90deg, ${brandColors.primary}15, ${brandColors.secondary}10)`,
              backgroundSize: "200% 200%",
              animation: "gradientFlow 12s ease infinite",
            }}
          >
            <div
              className="elfsight-app-4ceb8aab-9936-4357-b003-27c38c147990 w-full"
              data-elfsight-app-lazy
            />

            <div className="flex justify-center mt-6">
              <div
                className="relative group"
                style={{ fontFamily: "inherit" }}
              >
                <span
                  className="text-sm"
                  style={{ color: brandColors.medium }}
                >
                  Cargando feed…
                </span>
                <div
                  className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full origin-left transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    transform: "scaleX(0)",
                    background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ola inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden -z-10">
          <svg
            viewBox="0 0 1440 80"
            className="w-full h-20"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,80L0,80Z"
              fill="white"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
