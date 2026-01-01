"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  GiPalmTree, 
  GiWaveSurfer,
  GiDrum,
  GiSunrise
} from "react-icons/gi";
import { TbBuildingBridge2 } from "react-icons/tb";

// =============================================================================
// PALETA - Marca Atlántico Turismo
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

// =============================================================================
// SLIDES - Experiencias del Atlántico (sin Carnaval, reordenado)
// =============================================================================
const slides = [
  {
    id: 1,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/Mujer%20en%20Campo%20Floral%20mariposa%202.png?alt=media&token=9d598de3-a3d8-4407-922a-6a0126bb4df6",
    icon: GiSunrise,
    location: "Campo Atlántico",
    title: "Descubre",
    subtitle: "lo mágico",
    description: "Tradiciones ancestrales en cada rincón de nuestra tierra",
    accent: COLORS.amarilloArepa,
    position: "center",
    tagline: "Tierra de Mariposas",
  },
  {
    id: 2,
    image: "https://appdevelopi.s3.us-east-1.amazonaws.com/AtlanticoEsMas/Parque+Cienaga+De+Mallorquin.jpeg",
    icon: GiPalmTree,
    location: "Ciénaga de Mallorquín",
    title: "Vive la",
    subtitle: "Naturaleza",
    description: "Manglares, aves y atardeceres que pintan el cielo de fuego",
    accent: COLORS.verdeBijao,
    position: "center",
    tagline: "Santuario Natural",
  },
  {
    id: 3,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/Muelle_1888_Nocturna.jpg?alt=media&token=f04dc293-9a06-43fa-82f2-6244cd4e44f6",
    icon: TbBuildingBridge2,
    location: "Puerto Colombia",
    title: "Noches de",
    subtitle: "historia",
    description: "Donde el pasado y presente se encuentran bajo las estrellas",
    accent: COLORS.naranjaSalinas,
    position: "center",
    tagline: "Muelle Histórico 1888",
  },
  {
    id: 4,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/SALINAS%20DEL%20REY%20%20(2)B.jpg?alt=media&token=37590d7d-c860-41b3-b07c-d60853359022",
    icon: GiWaveSurfer,
    location: "Salinas del Rey",
    title: "Viento y",
    subtitle: "libertad",
    description: "El paraíso del kitesurf en el Caribe colombiano",
    accent: COLORS.azulBarranquero,
    position: "top",
    tagline: "Capital del Viento",
  },
];

// =============================================================================
// KEN BURNS - Movimiento cinematográfico
// =============================================================================
const kenBurnsVariants = [
  { initial: { scale: 1.0, x: "0%", y: "0%" }, animate: { scale: 1.1, x: "2%", y: "1%" } },
  { initial: { scale: 1.08, x: "2%", y: "0%" }, animate: { scale: 1.0, x: "-1%", y: "0.5%" } },
  { initial: { scale: 1.1, x: "0%", y: "2%" }, animate: { scale: 1.02, x: "1%", y: "-1%" } },
  { initial: { scale: 1.0, x: "-1%", y: "-1%" }, animate: { scale: 1.08, x: "1.5%", y: "1.5%" } },
];

// =============================================================================
// COMPONENT
// =============================================================================
export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 10000; // 10 segundos (antes 8s, +2s más lento)

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, startAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (isAutoPlaying) startAutoPlay();
  };

  const currentData = slides[currentSlide];
  const kenBurns = kenBurnsVariants[currentSlide % kenBurnsVariants.length];
  const IconComponent = currentData.icon;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* ============================================================= */}
      {/* BACKGROUND - Ken Burns Effect */}
      {/* ============================================================= */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={kenBurns.initial}
            animate={kenBurns.animate}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          >
            <Image
              src={currentData.image}
              alt={currentData.title}
              fill
              priority
              quality={90}
              className="object-cover"
              style={{ objectPosition: currentData.position }}
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ============================================================= */}
      {/* OVERLAYS - Cinematográficos con mejor legibilidad */}
      {/* ============================================================= */}
      
      {/* Bottom gradient - más fuerte para legibilidad */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.05) 100%)"
        }}
      />
      
      {/* Left gradient for text - más pronunciado */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.1) 50%, transparent 65%)"
        }}
      />

      {/* Color accent overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        animate={{ 
          background: `linear-gradient(135deg, ${currentData.accent}15 0%, transparent 50%)` 
        }}
        transition={{ duration: 1 }}
      />

      {/* ============================================================= */}
      {/* DECORATIVE ELEMENTS - Cultura Atlántico */}
      {/* ============================================================= */}
      
      {/* Floating cultural patterns - Top right */}
      <motion.div 
        className="absolute top-32 right-8 lg:right-16 z-10 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 0.15 : 0, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          {/* Patrón inspirado en las artesanías de Galapa */}
          <circle cx="60" cy="60" r="55" stroke="white" strokeWidth="1" strokeDasharray="4 4"/>
          <circle cx="60" cy="60" r="40" stroke="white" strokeWidth="1"/>
          <circle cx="60" cy="60" r="25" stroke="white" strokeWidth="1" strokeDasharray="2 2"/>
          <path d="M60 5 L60 25 M60 95 L60 115 M5 60 L25 60 M95 60 L115 60" stroke="white" strokeWidth="1"/>
        </svg>
      </motion.div>

      {/* Wave pattern - Bottom decorative */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden">
        <motion.svg 
          className="absolute bottom-0 w-full h-24 text-white/5"
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <path 
            d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,75 1440,50 L1440,100 L0,100 Z" 
            fill="currentColor"
          />
        </motion.svg>
      </div>

      {/* ============================================================= */}
      {/* MAIN CONTENT */}
      {/* ============================================================= */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pb-32 sm:pb-36 lg:pb-44">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="max-w-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Icon + Location Tag */}
              <motion.div
                className="flex items-center gap-3 mb-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: `${currentData.accent}30` }}
                  whileHover={{ scale: 1.1 }}
                >
                  <IconComponent 
                    className="text-xl"
                    style={{ color: currentData.accent }}
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span 
                    className="text-[10px] font-semibold tracking-[0.3em] uppercase"
                    style={{ 
                      fontFamily: "'Josefin Sans', sans-serif",
                      color: currentData.accent 
                    }}
                  >
                    {currentData.location}
                  </span>
                  <span 
                    className="text-[10px] tracking-[0.2em] uppercase text-white/50"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    {currentData.tagline}
                  </span>
                </div>
              </motion.div>

              {/* Main Title */}
              <div className="space-y-0 mb-5">
                <div className="overflow-hidden">
                  <motion.h1
                    className="text-5xl sm:text-6xl lg:text-8xl font-light text-white leading-[0.9] tracking-[-0.02em]"
                    style={{ 
                      fontFamily: "'Josefin Sans', sans-serif",
                      textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {currentData.title}
                  </motion.h1>
                </div>
                <div className="overflow-hidden">
                  <motion.h2
                    className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.9] tracking-[-0.02em]"
                    style={{ 
                      fontFamily: "'Josefin Sans', sans-serif",
                      color: currentData.accent,
                      textShadow: "0 2px 15px rgba(0,0,0,0.4)"
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {currentData.subtitle}
                  </motion.h2>
                </div>
              </div>

              {/* Description */}
              <motion.p
                className="text-base sm:text-lg text-white/80 max-w-lg leading-relaxed mb-8"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: "0 1px 8px rgba(0,0,0,0.3)"
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentData.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                {/* Primary CTA */}
                <Link
                  href="/destinations"
                  className="group inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300"
                  style={{ 
                    fontFamily: "'Josefin Sans', sans-serif",
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  }}
                >
                  <span className="text-white font-semibold text-sm sm:text-base">
                    Explorar Atlántico
                  </span>
                  <motion.span 
                    className="text-white"
                    whileHover={{ x: 3 }}
                  >
                    →
                  </motion.span>
                </Link>

                {/* Secondary CTA */}
                <Link
                  href="/eventos"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  <GiDrum className="text-lg text-white/70 group-hover:text-white" />
                  <span className="text-white/90 font-medium text-sm">
                    Ver eventos
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SLIDE NAVIGATION - Vertical Right */}
      {/* ============================================================= */}
      <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-end gap-3">
        {slides.map((slide, index) => {
          const SlideIcon = slide.icon;
          const isActive = index === currentSlide;
          
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="group flex items-center gap-3 transition-all duration-300"
              aria-label={`Ir a ${slide.location}`}
            >
              {/* Label - appears on hover or active */}
              <motion.span 
                className="text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: isActive ? currentData.accent : 'rgba(255,255,255,0.6)',
                  opacity: isActive ? 1 : undefined,
                }}
              >
                {slide.location}
              </motion.span>
              
              {/* Icon indicator */}
              <motion.div
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: isActive ? "40px" : "32px",
                  height: isActive ? "40px" : "32px",
                  backgroundColor: isActive ? `${currentData.accent}30` : 'rgba(255,255,255,0.1)',
                  border: isActive ? `2px solid ${currentData.accent}` : '1px solid rgba(255,255,255,0.2)',
                }}
                whileHover={{ scale: 1.1 }}
              >
                <SlideIcon 
                  className="transition-all duration-300"
                  style={{ 
                    fontSize: isActive ? "18px" : "14px",
                    color: isActive ? currentData.accent : 'rgba(255,255,255,0.5)',
                  }}
                />
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* MOBILE INDICATORS */}
      {/* ============================================================= */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 md:hidden">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">
          {slides.map((slide, index) => {
            const SlideIcon = slide.icon;
            const isActive = index === currentSlide;
            
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="relative p-1.5 transition-all duration-300"
                aria-label={`Ir a ${slide.location}`}
              >
                <SlideIcon 
                  style={{ 
                    fontSize: "16px",
                    color: isActive ? currentData.accent : 'rgba(255,255,255,0.4)',
                  }}
                />
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full -translate-x-1/2"
                    style={{ backgroundColor: currentData.accent }}
                    layoutId="mobileIndicator"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* PROGRESS BAR - Bottom */}
      {/* ============================================================= */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <motion.div
          className="h-full origin-left"
          style={{ backgroundColor: currentData.accent }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          key={currentSlide}
        />
      </div>

      {/* ============================================================= */}
      {/* CORNER INFO - Slide counter */}
      {/* ============================================================= */}
      <div className="absolute bottom-8 left-6 sm:left-8 lg:left-12 z-20 hidden sm:flex items-center gap-4">
        <div 
          className="flex items-baseline gap-1"
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          <span 
            className="text-3xl font-light"
            style={{ color: currentData.accent }}
          >
            {String(currentSlide + 1).padStart(2, "0")}
          </span>
          <span className="text-white/30 text-sm mx-1">/</span>
          <span className="text-white/30 text-sm">{String(slides.length).padStart(2, "0")}</span>
        </div>
        
        {/* Mini tagline */}
        <div className="h-4 w-px bg-white/20" />
        <span 
          className="text-xs text-white/40 tracking-wider uppercase"
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          Atlántico es más
        </span>
      </div>
    </section>
  );
}