"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Heart } from "lucide-react";

// Colores de marca - Gobernación del Atlántico
const brandColors = {
  primary: '#E40E20',  // Rojo institucional
  secondary: '#D34A78',  // Rosa secundario
  dark: '#4A4F55',  // Gris oscuro
  medium: '#7A888C',  // Gris medio
  light: '#C1C5C8',  // Gris claro
};

export default function InstagramFeed() {
  useEffect(() => {
    const id = "elfsight-script";
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.async = true;
      script.id = id;
      document.body.appendChild(script);
    }
  }, []);

  // Animaciones clave
  const styles = `
    @keyframes gradientFlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulseGlow {
      0%   { box-shadow: 0 0 0 0 rgba(228,14,32,0.4); }
      70%  { box-shadow: 0 0 0 10px rgba(228,14,32,0); }
      100% { box-shadow: 0 0 0 0 rgba(228,14,32,0); }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section id="instagram" className="relative py-28 overflow-hidden bg-[rgba(255,255,255,0.95)]">
        {/* Gradiente sutil de fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[rgba(211,74,120,0.15)] to-white -z-10" />

        {/* Decoraciones circulares de marca */}
        <div className="absolute w-full h-full -z-10">
          <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full"
               style={{ backgroundColor: brandColors.secondary + '25', filter: 'blur(4rem)' }} />
          <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full"
               style={{ backgroundColor: brandColors.secondary + '25', filter: 'blur(4rem)' }} />
        </div>

        {/* Ola SVG superior */}
        <div className="absolute top-0 left-0 w-full h-48 -z-10 overflow-hidden">
          <svg viewBox="0 0 1440 200" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="insta-grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0.2" />
                <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d="M0,160L48,138.7C96,117,192,75,288,69.3C384,64,480,96,576,101.3C672,107,768,85,864,80C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                  fill="url(#insta-grad1)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold mb-4"
            style={{ color: brandColors.dark }}
          >
            Síguenos en Instagram
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-6"
            style={{ color: brandColors.primary }}
          >
            <span className="block w-8 h-1 bg-gradient-to-r from-[#E40E20] to-[#D34A78] rounded-full" />
            Momentos del Atlántico
            <span className="block w-8 h-1 bg-gradient-to-r from-[#D34A78] to-[#E40E20] rounded-full" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg max-w-2xl mx-auto mb-12"
            style={{ color: brandColors.medium }}
          >
            Descubre las mejores experiencias y paisajes del Atlántico a través de nuestro feed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative bg-white rounded-3xl p-1.5 shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(90deg, ${brandColors.primary}30, ${brandColors.secondary}20, ${brandColors.primary}10)`,
              backgroundSize: '200% 200%',
              animation: 'gradientFlow 12s ease infinite',
            }}
          >
            <div className="relative bg-white rounded-3xl p-8">
              {/* Íconos decorativos */}
              <Instagram size={96} className="absolute -left-8 top-1/3 opacity-10 text-[rgba(211,74,120,0.4)]" />
              <Heart     size={88} className="absolute -right-8 bottom-1/3 opacity-10 text-[rgba(211,74,120,0.4)]" />

              {/* Widget Elfsight actualizado */}
              <div className="elfsight-app-4ceb8aab-9936-4357-b003-27c38c147990" data-elfsight-app-lazy />

              {/* Loading */}
              <div className="flex justify-center mt-6">
                <div className="relative group">
                  <span className="text-sm" style={{ color: brandColors.medium }}>Cargando feed...</span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full origin-left transition-transform duration-300 group-hover:scale-x-100"
                       style={{ transform: 'scaleX(0)', background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})` }} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-16 flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: `0 12px 24px ${brandColors.primary}40` }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-3 rounded-full font-bold text-white"
              style={{
                background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})`,
                boxShadow: `0 8px 16px ${brandColors.primary}30`,
              }}
            >
              <Instagram size={20} />
              Visitar nuestro perfil
            </motion.button>
          </div>
        </div>

        {/* Curva inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 100" className="w-full h-24" preserveAspectRatio="none">
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,100L0,100Z"
                  fill="var(--background)" />
          </svg>
        </div>
      </section>
    </>
  );
}
