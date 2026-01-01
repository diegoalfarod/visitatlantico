"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ============================================
   INSTAGRAM FEED
   Diseño cinematográfico, coherente con el sistema
   
   Paleta: #E40E20, #D31A2B, #4A4F55, #7A858C, #C1C5C8
   ============================================ */

export default function InstagramFeed() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
    <section 
      id="instagram" 
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-white overflow-hidden"
    >
      {/* Subtle background texture - consistent with system */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A4F55' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header - Matching system pattern */}
        <motion.div 
          className="mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#E40E20]" />
                <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">
                  @turismoatlantico_
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4A4F55] tracking-tight">
                Síguenos en
                <br />
                <span className="text-[#E40E20]">Instagram</span>
              </h2>
            </div>
            
            {/* Subtitle */}
            <p className="text-[#7A858C] text-sm max-w-xs">
              Descubre experiencias y paisajes del Atlántico en nuestras publicaciones
            </p>
          </div>
        </motion.div>

        {/* Widget Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Instagram Widget */}
          <div className="relative rounded-2xl overflow-hidden">
            {/* Subtle frame effect */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
              }}
            />
            
            <div
              className="elfsight-app-4ceb8aab-9936-4357-b003-27c38c147990 w-full"
              data-elfsight-app-lazy
              style={{ 
                width: '100%',
              }}
            />
          </div>
          
          {/* Loading / Noscript fallback */}
          <noscript>
            <div className="text-center py-16 bg-[#f8f9fa] rounded-2xl">
              <p className="text-[#7A858C]">
                Por favor, habilita JavaScript para ver el feed de Instagram.
              </p>
            </div>
          </noscript>
        </motion.div>

        {/* CTA - Matching system style */}
        <motion.div 
          className="mt-14 lg:mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <a
            href="https://www.instagram.com/turismoatlantico_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[#4A4F55] hover:text-[#E40E20] transition-colors group"
          >
            {/* Instagram icon */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
              <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/>
              <circle cx="18.406" cy="5.594" r="1.44"/>
            </svg>
            <span className="text-sm tracking-[0.15em] uppercase">Visitar perfil completo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}