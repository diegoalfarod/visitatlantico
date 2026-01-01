"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Shield, ArrowRight, AlertCircle, ExternalLink } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ============================================
   TURISMO SEGURO BANNER
   Diseño moderno, limpio y minimalista
   Enfocado en la información esencial
   ============================================ */

export default function TurismoSeguroBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 sm:py-20 overflow-hidden"
    >
      {/* Background - Gradient sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8faf8] via-white to-[#f0f7f2]" />
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Main Banner Card */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background con gradiente verde institucional */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a472a] via-[#1e5631] to-[#1a472a]" />
          
          {/* Pattern decorativo sutil */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          {/* Content */}
          <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
              
              {/* Left - Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                  {/* Shield icon con glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#ffd700]/30 rounded-full blur-lg" />
                    <div className="relative w-14 h-14 bg-[#ffd700]/20 rounded-2xl flex items-center justify-center border border-[#ffd700]/30">
                      <Shield className="w-7 h-7 text-[#ffd700]" />
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[#ffd700] text-xs font-semibold tracking-wider uppercase">
                      Policía de Turismo
                    </span>
                    <h2 
                      className="text-2xl sm:text-3xl font-bold text-white"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Turismo Seguro
                    </h2>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg mb-6">
                  Tu seguridad es nuestra prioridad. La Policía de Turismo del Atlántico 
                  está disponible 24/7 para proteger tu experiencia.
                </p>
                
                {/* Contact pills */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href="tel:123"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E40E20] hover:bg-[#c90d1c] rounded-full text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Emergencias: 123</span>
                  </a>
                  
                  <a
                    href="tel:+573245710123"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>324 571 0123</span>
                  </a>
                </div>
              </div>
              
              {/* Right - CTA Card */}
              <div className="lg:w-[320px] flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  {/* ESCNNA Warning - Compacto */}
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b border-white/10">
                    <AlertCircle className="w-5 h-5 text-[#ffd700] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">
                        No a la ESCNNA
                      </h4>
                      <p className="text-white/60 text-xs leading-relaxed">
                        La explotación de menores es un delito grave. Denuncie al 123.
                      </p>
                    </div>
                  </div>
                  
                  {/* Link to page */}
                  <Link 
                    href="/turismo-seguro"
                    className="flex items-center justify-between w-full group"
                  >
                    <span className="text-white text-sm font-medium">
                      Más información
                    </span>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}