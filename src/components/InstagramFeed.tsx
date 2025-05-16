// src/components/InstagramFeed.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

/* -------- Colores de marca -------- */
const brandColors = {
  primary: "#E40E20",
  secondary: "#D34A78",
  dark: "#4A4F55",
  medium: "#7A888C",
};

export default function InstagramFeed() {
  /* ------- Carga de script Elfsight ------- */
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

  return (
    <section id="instagram" className="relative py-24 bg-white">
      {/* Ola superior */}
      <div className="absolute top-0 left-0 w-full h-32 overflow-hidden -z-10">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="insta-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0.08" />
              <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path
            d="M0,160L48,138.7C96,117,192,75,288,69.3C384,64,480,96,576,101.3C672,107,768,85,864,80C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,0L0,0Z"
            fill="url(#insta-grad)"
          />
        </svg>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{ color: brandColors.dark }}
        >
          Síguenos en Instagram
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-3 mb-5 text-lg font-medium"
          style={{ color: brandColors.primary }}
        >
          <span className="block w-10 h-0.5 bg-gradient-to-r from-[#E40E20] to-[#D34A78] rounded-full" />
          Momentos del Atlántico
          <span className="block w-10 h-0.5 bg-gradient-to-r from-[#D34A78] to-[#E40E20] rounded-full" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg max-w-2xl mx-auto mb-12"
          style={{ color: brandColors.medium }}
        >
          Descubre experiencias y paisajes del Atlántico a través de nuestro feed,
          curado para inspirar tu próxima aventura.
        </motion.p>

        {/* Widget Elfsight sin sombras ni padding extra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-full"
        >
          <div
            className="elfsight-app-4ceb8aab-9936-4357-b003-27c38c147990 w-full"
            data-elfsight-app-lazy
          />
          <p className="mt-4 text-sm text-center" style={{ color: brandColors.medium }}>
            Cargando feed…
          </p>
        </motion.div>
      </div>

      {/* Ola inferior */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden -z-10">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-16"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,80L0,80Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
