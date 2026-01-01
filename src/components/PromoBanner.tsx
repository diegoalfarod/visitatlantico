"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Sparkles, MapPin, Utensils, Award, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ============================================
   PROMO BANNER - Diseño Moderno
   
   Slides:
   1. Tesoros del Atlántico - Con mockup del website
   2. Ruta 23 - Sabores del Atlántico
   3. Carnaval 2025
   4. Ecoturismo
   ============================================ */

interface PromoSlide {
  id: string;
  type: "tesoros" | "ruta23" | "ecoturismo" | "default";
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaSecondary?: string;
  href: string;
  hrefSecondary?: string;
  external?: boolean;
  image: string;
  mockupImage?: string;
  accentColor: string;
  features?: string[];
}

const promoSlides: PromoSlide[] = [
  {
    id: "tesoros",
    type: "tesoros",
    title: "Tesoros del Atlántico",
    subtitle: "Conecta · Descubre · Vive",
    description: "Explora la plataforma oficial de turismo, cultura y experiencias auténticas del Caribe colombiano",
    cta: "Visitar plataforma",
    href: "https://tesorosdelatlantico.com",
    external: true,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FTesorosDelAtlantico%20Foto%20referencia.png?alt=media&token=6b469a26-641a-4e39-97e2-ef425779afab",
    mockupImage: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fscreenshot%20tesoros%20del%20atlantico.png?alt=media&token=f8ced3de-b77b-4719-8727-b6eeacb9876b",
    accentColor: "#fbbf24",
    features: ["Rutas turísticas", "Tiendas locales", "Eventos"],
  },
  {
    id: "ruta23",
    type: "ruta23",
    title: "Ruta 23",
    subtitle: "Iniciativa Primera Gestora Social",
    description: "Un viaje gastronómico y cultural por los 23 municipios del Atlántico",
    cta: "Explorar sabores",
    href: "/ruta23",
    external: false,
    // Imagen de gastronomía/platos típicos del Atlántico
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    accentColor: "#E40E20",
    features: ["50+ platos típicos", "900 artesanos", "19 países"],
  },
  {
    id: "carnaval",
    type: "default",
    title: "Carnaval 2025",
    subtitle: "Patrimonio de la Humanidad",
    description: "Vive la fiesta más grande de Colombia. Música, color y tradición en las calles de Barranquilla",
    cta: "Ver programación",
    href: "/eventos?categoria=carnaval",
    external: false,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FMarimondas-de-Barrio-Abajo.jpg?alt=media&token=935c0b1e-8425-45a2-b927-8f94c7e75322",
    accentColor: "#E40E20",
  },
  {
    id: "ecoturismo",
    type: "ecoturismo",
    title: "Ecoturismo",
    subtitle: "Naturaleza viva del Atlántico",
    description: "Reservas naturales, avistamiento de aves y experiencias sostenibles en el Caribe",
    cta: "Explorar destinos",
    href: "/destinations?filter=EcoTurismo",
    external: false,
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fcienaga-de-mallorquin-avistamiento-de-aves.jpg?alt=media&token=e9bd6991-dbf8-400e-b712-5c431297c1e9",
    accentColor: "#10b981",
  },
];

const AUTOPLAY_INTERVAL = 7000;

// =============================================================================
// TESOROS SLIDE - Con mockup del website
// =============================================================================

// =============================================================================
// TESOROS SLIDE - Diseño cinematográfico con texto abajo
// =============================================================================

function TesorosSlide({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradiente de abajo hacia arriba */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      </div>
      
      {/* Browser mockup - Floating top right - Desktop only */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute top-4 right-4 lg:top-6 lg:right-12 z-10 hidden lg:block"
      >
        <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl w-[400px] xl:w-[480px]">
          {/* Browser header */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
              <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
              <div className="w-2 h-2 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-2">
              <div className="bg-white rounded px-2 py-0.5 text-[10px] text-gray-500 border border-gray-200 truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-green-500" />
                </span>
                tesorosdelatlantico.com
              </div>
            </div>
          </div>
          
          {/* Screenshot */}
          <div className="relative aspect-[2.5/1]">
            <Image
              src={slide.mockupImage || slide.image}
              alt="Tesoros del Atlántico Website"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
        
        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -bottom-2 -left-2 bg-[#fbbf24] rounded-lg px-2.5 py-1.5 shadow-xl"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-[#78350f]">23</span>
            <span className="text-[9px] font-semibold text-[#78350f]/80">Municipios</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Content - Bottom aligned */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="h-full flex flex-col justify-end pb-12 sm:pb-14">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fbbf24] text-[#78350f] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              {slide.subtitle}
            </span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {slide.title}
          </motion.h2>
          
          {/* Description + Features + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-4xl"
          >
            <div>
              <p className="text-white/90 text-sm sm:text-base max-w-lg leading-relaxed mb-4">
                {slide.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {slide.features?.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <a
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] bg-[#fbbf24] text-[#78350f] shadow-lg hover:bg-[#fcd34d] whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              <span>{slide.cta}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]" />
    </div>
  );
}

// =============================================================================
// RUTA 23 SLIDE - Diseño cinematográfico con texto abajo
// =============================================================================

function Ruta23Slide({ slide }: { slide: PromoSlide }) {
  const supportImages = {
    butifarras: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FAtlantico%20Butifarras.jpeg?alt=media&token=142929c0-3266-4c5f-9350-4adc71d61f9b",
    pizza: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fruta23%20pizza.jpeg?alt=media&token=0dbe9d62-61af-4362-b56b-ae4133128c3b",
    cocineros: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fruta23cocineros.jpeg?alt=media&token=e23e6bf8-cc7f-4a56-a651-386d0555abd7",
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background - imagen de comida */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradiente de abajo hacia arriba */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      </div>
      
      {/* Floating images strip - Top right - Desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute top-4 right-4 lg:top-6 lg:right-12 z-10 hidden sm:flex gap-2"
      >
        <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-xl overflow-hidden shadow-xl border-2 border-white/20">
          <Image src={supportImages.cocineros} alt="Cocineros" fill className="object-cover" />
        </div>
        <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-xl overflow-hidden shadow-xl border-2 border-white/20">
          <Image src={supportImages.butifarras} alt="Butifarras" fill className="object-cover" />
        </div>
        <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-xl overflow-hidden shadow-xl border-2 border-white/20 hidden lg:block">
          <Image src={supportImages.pizza} alt="Pizza" fill className="object-cover" />
        </div>
      </motion.div>
      
      {/* Content - Bottom aligned */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="h-full flex flex-col justify-end pb-12 sm:pb-14">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
              {slide.subtitle}
            </span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            Ruta <span className="text-[#E40E20]">23</span>
          </motion.h2>
          
          {/* Description + Stats + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-4xl"
          >
            <div>
              <p className="text-white/90 text-sm sm:text-base max-w-lg leading-relaxed mb-4">
                {slide.description}
              </p>
              
              {/* Stats as tags */}
              <div className="flex flex-wrap gap-2">
                {slide.features?.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] bg-[#E40E20] text-white shadow-lg hover:bg-[#c90d1c] whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              <Utensils className="w-4 h-4" />
              <span>{slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E40E20]" />
    </div>
  );
}

// =============================================================================
// ECOTURISMO SLIDE - Diseño cinematográfico con texto abajo
// =============================================================================

function EcoturismoSlide({ slide }: { slide: PromoSlide }) {
  const ecoImages = {
    background: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fcienaga-de-mallorquin-avistamiento-de-aves.jpg?alt=media&token=e9bd6991-dbf8-400e-b712-5c431297c1e9",
    barranquero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FEl%20Barranquero.jpg?alt=media&token=d2343956-d681-423f-b12e-ae29589f8fde",
    avistamiento: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FAvistamiento%20de%20Aves2png.png?alt=media&token=1cdf9f28-7109-4e2f-be2a-1a1fb66d464c",
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background - Ciénaga de Mallorquín */}
      <div className="absolute inset-0">
        <Image
          src={ecoImages.background}
          alt={slide.title}
          fill
          className="object-cover"
          style={{ objectPosition: 'center 30%' }}
          priority
        />
        {/* Gradiente de abajo hacia arriba */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      </div>
      
      {/* Floating bird card - Desktop only */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute top-6 right-6 lg:top-8 lg:right-12 z-10 hidden sm:block"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3">
            {/* Bird image */}
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden">
              <Image
                src={ecoImages.barranquero}
                alt="El Barranquero"
                fill
                className="object-cover object-top"
              />
            </div>
            
            {/* Info */}
            <div className="pr-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="bg-[#10b981] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  AVE OFICIAL
                </span>
              </div>
              <h4 className="text-white font-bold text-sm">El Barranquero</h4>
              <p className="text-white/60 text-[10px]">Momotus subrufescens</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Content - Bottom aligned */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="h-full flex flex-col justify-end pb-12 sm:pb-14">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981] text-white text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              {slide.subtitle}
            </span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {slide.title}
          </motion.h2>
          
          {/* Description + Tags + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-4xl"
          >
            <div>
              <p className="text-white/90 text-sm sm:text-base max-w-lg leading-relaxed mb-4">
                {slide.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {["🦜 200+ especies", "🌿 Reservas naturales", "🌅 Ciénagas"].map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] bg-[#10b981] text-white shadow-lg hover:bg-[#059669] whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              <span>{slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#10b981]" />
    </div>
  );
}

// =============================================================================
// DEFAULT SLIDE - Para slides genéricos (Carnaval)
// =============================================================================

function DefaultSlide({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>
      
      {/* Content - Centered layout */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="h-full flex flex-col justify-end pb-12 sm:pb-16">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-3"
          >
            <span 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: slide.accentColor }}
            >
              {slide.id === "carnaval" ? <Calendar className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {slide.subtitle}
            </span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {slide.title}
          </motion.h2>
          
          {/* Description + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-3xl"
          >
            <p className="text-white/90 text-sm sm:text-base max-w-md leading-relaxed">
              {slide.description}
            </p>
            
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.98] text-white shadow-lg whitespace-nowrap"
              style={{ 
                fontFamily: "'Josefin Sans', sans-serif",
                backgroundColor: slide.accentColor
              }}
            >
              <span>{slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: slide.accentColor }}
      />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slide = promoSlides[current];

  const goToSlide = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % promoSlides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  // Colores del indicador según el slide
  const getIndicatorColor = (slideId: string) => {
    const s = promoSlides.find(p => p.id === slideId);
    if (s?.id === "tesoros") return "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]";
    if (s?.id === "ecoturismo") return "bg-[#10b981]";
    return "bg-[#E40E20]";
  };

  return (
    <section 
      className="relative h-[480px] sm:h-[420px] lg:h-[420px] overflow-hidden bg-[#1a1a1a]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {slide.type === "tesoros" && <TesorosSlide slide={slide} />}
          {slide.type === "ruta23" && <Ruta23Slide slide={slide} />}
          {slide.type === "ecoturismo" && <EcoturismoSlide slide={slide} />}
          {slide.type === "default" && <DefaultSlide slide={slide} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {promoSlides.map((s, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === current 
                ? `w-8 ${getIndicatorColor(s.id)}` 
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
        <motion.div
          className={`h-full ${getIndicatorColor(slide.id)}`}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? undefined : "100%" }}
          transition={{ 
            duration: AUTOPLAY_INTERVAL / 1000, 
            ease: "linear",
            repeat: 0 
          }}
          key={`progress-${current}-${isPaused}`}
        />
      </div>
    </section>
  );
}