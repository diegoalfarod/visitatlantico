"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  MapPin, 
  Utensils, 
  Award, 
  Calendar,
  Flag,
  Waves,
  Leaf,
  Globe,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ============================================
   PROMO BANNER - Editorial Magazine Style
   
   MOBILE: Editorial card-based layout with
   asymmetric image compositions - NO full bg
   
   DESKTOP: Editorial side-by-side layout
   ============================================ */

const AUTOPLAY_INTERVAL = 10000;
const SWIPE_THRESHOLD = 50;

const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  dorado: "#D4A853",
  blueFlag: "#0077B6",
};

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface PromoSlide {
  id: string;
  type: "tesoros" | "ruta23" | "blueflag" | "carnaval" | "ecoturismo";
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  accentColor: string;
  features?: string[];
  bgGradient: string;
}

const promoSlides: PromoSlide[] = [
  {
    id: "tesoros",
    type: "tesoros",
    title: "Tesoros del Atlántico",
    subtitle: "Conecta · Descubre · Vive",
    description: "La plataforma oficial de turismo del Caribe colombiano.",
    cta: "Visitar",
    href: "https://tesorosdelatlantico.com",
    external: true,
    accentColor: "#fbbf24",
    features: ["23 municipios", "Rutas", "Tiendas"],
    bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
  },
  {
    id: "ruta23",
    type: "ruta23",
    title: "Ruta 23",
    subtitle: "Primera Gestora Social",
    description: "Artesanías y gastronomía de los 23 municipios.",
    cta: "Explorar",
    href: "/ruta23",
    external: false,
    accentColor: COLORS.rojoCayena,
    features: ["900+ artesanos", "19 países", "Tonantzin"],
    bgGradient: "from-slate-900 via-slate-800 to-slate-900",
  },
  {
    id: "blueflag",
    type: "blueflag",
    title: "Blue Flag",
    subtitle: "Salinas del Rey",
    description: "Primera playa deportiva certificada en América.",
    cta: "Conocer",
    href: "/destinations/playa-de-salinas-del-rey",
    external: false,
    accentColor: COLORS.blueFlag,
    features: ["Certificación FEE", "Calidad A+"],
    bgGradient: "from-sky-50 via-cyan-50 to-blue-50",
  },
  {
    id: "carnaval",
    type: "carnaval",
    title: "Carnaval 2025",
    subtitle: "Patrimonio UNESCO",
    description: "La fiesta más grande de Colombia.",
    cta: "Programación",
    href: "/eventos?categoria=carnaval",
    external: false,
    accentColor: COLORS.rojoCayena,
    features: ["1-4 Marzo", "500+ comparsas"],
    bgGradient: "from-red-50 via-orange-50 to-yellow-50",
  },
  {
    id: "ecoturismo",
    type: "ecoturismo",
    title: "Ecoturismo",
    subtitle: "Naturaleza viva",
    description: "Avistamiento de aves y reservas naturales.",
    cta: "Explorar",
    href: "/destinations?filter=EcoTurismo",
    external: false,
    accentColor: COLORS.verdeBijao,
    features: ["200+ especies", "Ciénagas"],
    bgGradient: "from-emerald-50 via-teal-50 to-green-50",
  },
];

const IMAGES = {
  tesoros1: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FTesorosDelAtlantico%20Foto%20referencia.png?alt=media&token=6b469a26-641a-4e39-97e2-ef425779afab",
  tesorosMockup: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fscreenshot%20tesoros%20del%20atlantico.png?alt=media&token=f8ced3de-b77b-4719-8727-b6eeacb9876b",
  ruta23Hero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
  ruta23Logo: "/RUTA23LOGO.png",
  ruta23Arepa: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/GobernacionRuta23-%20arepa%20cocinando.jpg?alt=media&token=963fbc43-a6c3-48ce-90ba-64169363e3cc",
  ruta23Artesanias: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/artesanias%20usiaquri.jpg?alt=media&token=b7da2145-c853-42b6-971f-a34362634ee0",
  ruta23Cumbia: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/pareja%20bailando%20cumbia%20ruta23.jpeg?alt=media&token=ca49b0e0-8e3c-4e8c-8e7a-476a7cf685ef",
  blueFlagBandera: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/bandera%20azul%20en%20salinas%20del%20rey.avif?alt=media&token=872b408c-78ad-44bc-b5cb-b31511f01226",
  blueFlagPlaya: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/foto%20de%20salina%20del%20rey%20con%20sus%20chozas%20de%20comida.jpg?alt=media&token=69176eec-7235-4986-b008-2d5900645999",
  carnavalMarimondas: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FMarimondas-de-Barrio-Abajo.jpg?alt=media&token=935c0b1e-8425-45a2-b927-8f94c7e75322",
  carnavalMascaras: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/artesano%20con%20figuras%20del%20carnaval.jpeg?alt=media&token=cf74ebfd-67b6-4138-9887-676fbeb1f0ee",
  ecoAvistamiento: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2Fcienaga-de-mallorquin-avistamiento-de-aves.jpg?alt=media&token=e9bd6991-dbf8-400e-b712-5c431297c1e9",
  ecoBarranquero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FEl%20Barranquero.jpg?alt=media&token=d2343956-d681-423f-b12e-ae29589f8fde",
};

// =============================================================================
// MOBILE SLIDES - Editorial Magazine Style
// =============================================================================

function TesorosMobile({ slide, isActive }: { slide: PromoSlide; isActive: boolean }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-200/40 rounded-full blur-2xl" />
      
      <div className="relative h-full px-5 py-6 flex flex-col">
        {/* Header with badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm"
            style={{ backgroundColor: slide.accentColor, color: "#78350f" }}
          >
            <Globe className="w-3.5 h-3.5" />
            Plataforma Oficial
          </span>
          <motion.div 
            animate={{ y: [0, -3, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="text-right"
          >
            <span className="text-2xl font-bold" style={{ color: slide.accentColor, fontFamily: "'Josefin Sans'" }}>23</span>
            <span className="text-[10px] text-slate-500 block -mt-1">municipios</span>
          </motion.div>
        </motion.div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Image composition - Magazine style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-5"
          >
            {/* Main circular image */}
            <div className="relative mx-auto w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <Image src={IMAGES.tesoros1} alt="Tesoros" fill className="object-cover" />
            </div>
            
            {/* Floating browser mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-28 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200"
            >
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 border-b">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              </div>
              <div className="relative aspect-[16/10]">
                <Image src={IMAGES.tesorosMockup} alt="Web" fill className="object-cover object-top" />
              </div>
            </motion.div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Josefin Sans'" }}>
              {slide.title}
            </h2>
            <p className="text-sm font-medium mb-2" style={{ color: slide.accentColor, fontFamily: "'Montserrat'" }}>
              {slide.subtitle}
            </p>
            <p className="text-slate-600 text-sm mb-4 max-w-[280px] mx-auto" style={{ fontFamily: "'Montserrat'" }}>
              {slide.description}
            </p>
            
            {/* Features */}
            <div className="flex justify-center gap-2 mb-5">
              {slide.features?.map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/80 text-slate-600 border border-slate-200 shadow-sm">
                  {f}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <a
                href={slide.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: slide.accentColor, color: "#78350f", fontFamily: "'Josefin Sans'" }}
              >
                {slide.cta}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${slide.accentColor}, ${slide.accentColor}60)` }} />
    </div>
  );
}

function Ruta23Mobile({ slide, isActive }: { slide: PromoSlide; isActive: boolean }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${COLORS.naranjaSalinas}, transparent)` }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: `radial-gradient(circle, ${COLORS.dorado}, transparent)` }} />
      
      <div className="relative h-full px-5 py-6 flex flex-col">
        {/* Header - Logo grande y badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-5"
        >
          <Image src={IMAGES.ruta23Logo} alt="Ruta 23" width={140} height={44} className="h-11 w-auto" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium bg-white/10 border border-white/20 text-white/90">
            <Award className="w-3.5 h-3.5" style={{ color: COLORS.dorado }} />
            Tonantzin
          </span>
        </motion.div>

        {/* Single hero image - Clean and simple */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-5 flex-shrink-0"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
            <Image src={IMAGES.ruta23Hero} alt="Ruta 23" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          
          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-3 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg"
          >
            <span className="text-xl font-bold" style={{ color: COLORS.rojoCayena, fontFamily: "'Josefin Sans'" }}>900+</span>
            <span className="text-[10px] text-slate-500 block -mt-0.5">artesanos</span>
          </motion.div>
        </motion.div>

        {/* Content - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "'Montserrat'" }}>
            {slide.subtitle}
          </p>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Josefin Sans'" }}>
            Sabores y tradición de los 23 municipios
          </h2>
          
          <div className="flex gap-2 mb-5">
            {["Artesanías", "Gastronomía", "19 países"].map((f, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/10 text-white/80 border border-white/10">
                {f}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}
            >
              <Utensils className="w-4 h-4" />
              {slide.cta} sabores
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function BlueFlagMobile({ slide, isActive }: { slide: PromoSlide; isActive: boolean }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}>
      {/* Wave decoration */}
      <div className="absolute bottom-20 left-0 right-0 h-20 opacity-10">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full">
          <path d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z" fill={COLORS.blueFlag} />
        </svg>
      </div>
      
      <div className="relative h-full px-5 py-6 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: slide.accentColor }}
          >
            <Flag className="w-3.5 h-3.5" />
            Blue Flag
          </span>
          <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 shadow-md">
            <Flag className="w-4 h-4" style={{ color: slide.accentColor }} />
            <div className="text-left">
              <span className="text-[9px] text-slate-400 block">Playa #10</span>
              <span className="text-[11px] font-bold text-slate-700">Colombia</span>
            </div>
          </div>
        </motion.div>

        {/* Main image - Large with overlay card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-5"
        >
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image src={IMAGES.blueFlagBandera} alt="Blue Flag" fill className="object-cover" />
          </div>
          
          {/* Floating secondary image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-3 -left-2 w-24 aspect-[4/3] rounded-xl overflow-hidden shadow-xl border-2 border-white"
          >
            <Image src={IMAGES.blueFlagPlaya} alt="Playa" fill className="object-cover" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-1" style={{ fontFamily: "'Montserrat'" }}>
            <MapPin className="w-3.5 h-3.5" />
            {slide.subtitle}
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Josefin Sans'", color: slide.accentColor }}>
            Certificación Internacional
          </h2>
          <p className="text-slate-600 text-sm mb-4" style={{ fontFamily: "'Montserrat'" }}>
            {slide.description}
          </p>
          
          <div className="flex gap-2 mb-5">
            {slide.features?.map((f, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `${slide.accentColor}10`, borderColor: `${slide.accentColor}30`, color: slide.accentColor }}>
                {f}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}
            >
              <Waves className="w-4 h-4" />
              {slide.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function CarnavalMobile({ slide, isActive }: { slide: PromoSlide; isActive: boolean }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}>
      {/* Confetti dots */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-8 left-6 w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} className="absolute top-16 right-8 w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.6 }} className="absolute top-24 left-1/3 w-2 h-2 rounded-full bg-blue-400 opacity-60" />
      
      <div className="relative h-full px-5 py-6 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: slide.accentColor }}
          >
            <Calendar className="w-3.5 h-3.5" />
            1-4 Marzo 2025
          </span>
          <motion.div 
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-white rounded-xl px-2.5 py-1.5 shadow-md"
          >
            <Star className="w-4 h-4 mx-auto" style={{ color: COLORS.dorado }} />
            <span className="text-[9px] font-bold text-slate-700 block">UNESCO</span>
          </motion.div>
        </motion.div>

        {/* Image composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-5"
        >
          <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden shadow-2xl mx-4">
            <Image src={IMAGES.carnavalMarimondas} alt="Carnaval" fill className="object-cover" />
          </div>
          
          {/* Floating masks */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-3 -right-1 w-20 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-white"
          >
            <Image src={IMAGES.carnavalMascaras} alt="Máscaras" fill className="object-cover" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col text-center"
        >
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Montserrat'" }}>
            {slide.subtitle}
          </p>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Josefin Sans'" }}>
            {slide.title}
          </h2>
          <p className="text-slate-600 text-sm mb-4" style={{ fontFamily: "'Montserrat'" }}>
            {slide.description}
          </p>
          
          <div className="flex justify-center gap-2 mb-5">
            {slide.features?.map((f, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${slide.accentColor}15`, color: slide.accentColor }}>
                {f}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}
            >
              {slide.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function EcoturismoMobile({ slide, isActive }: { slide: PromoSlide; isActive: boolean }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}>
      {/* Decorative leaf shape */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-20" style={{ background: `radial-gradient(circle, ${COLORS.verdeBijao}, transparent)`, borderRadius: '0 0 0 100%' }} />
      
      <div className="relative h-full px-5 py-6 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: slide.accentColor }}
          >
            <Leaf className="w-3.5 h-3.5" />
            Turismo Sostenible
          </span>
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-right"
          >
            <span className="text-2xl font-bold" style={{ color: slide.accentColor, fontFamily: "'Josefin Sans'" }}>200+</span>
            <span className="text-[10px] text-slate-500 block -mt-1">especies</span>
          </motion.div>
        </motion.div>

        {/* Main image with Barranquero card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-5"
        >
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image src={IMAGES.ecoAvistamiento} alt="Ecoturismo" fill className="object-cover" style={{ objectPosition: 'center 30%' }} />
          </div>
          
          {/* Barranquero floating card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-3 -left-2 bg-white rounded-xl p-2 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <Image src={IMAGES.ecoBarranquero} alt="Barranquero" fill className="object-cover object-top" />
              </div>
              <div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: slide.accentColor }}>AVE OFICIAL</span>
                <p className="text-[11px] font-bold text-slate-800 mt-0.5">El Barranquero</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: "'Montserrat'" }}>
            {slide.subtitle}
          </p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Josefin Sans'" }}>
            {slide.title}
          </h2>
          <p className="text-slate-600 text-sm mb-4" style={{ fontFamily: "'Montserrat'" }}>
            {slide.description}
          </p>
          
          <div className="flex gap-2 mb-5">
            {slide.features?.map((f, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium border" style={{ backgroundColor: `${slide.accentColor}10`, borderColor: `${slide.accentColor}30`, color: slide.accentColor }}>
                {f}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}
            >
              {slide.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

// =============================================================================
// DESKTOP SLIDES - Keep Original Editorial Layout
// =============================================================================

function TesorosDesktop({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="h-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE_CINEMATIC }} className="z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: slide.accentColor, color: "#78350f" }}>
                <Globe className="w-3.5 h-3.5" />
                Plataforma Oficial
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-3 leading-tight" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>Tesoros del Atlántico</h2>
            <p className="text-lg font-medium mb-4" style={{ color: slide.accentColor, fontFamily: "'Montserrat', sans-serif" }}>Conecta · Descubre · Vive</p>
            <p className="text-slate-600 leading-relaxed mb-5 max-w-md" style={{ fontFamily: "'Montserrat', sans-serif" }}>La plataforma oficial de turismo del Caribe colombiano. Rutas, tiendas locales y experiencias auténticas.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["23 municipios", "Rutas turísticas", "Tiendas locales"].map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{f}</span>
              ))}
            </div>
            <a href={slide.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: slide.accentColor, color: "#78350f", fontFamily: "'Josefin Sans'" }}>
              Visitar plataforma
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }} className="relative flex justify-end">
            <div className="relative">
              <div className="relative w-64 lg:w-80 h-64 lg:h-80 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image src={IMAGES.tesoros1} alt="Tesoros del Atlántico" fill className="object-cover" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -left-8 lg:-bottom-8 lg:-left-12 w-52 lg:w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border-b border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] text-slate-400 truncate">tesorosdelatlantico.com</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image src={IMAGES.tesorosMockup} alt="Website" fill className="object-cover object-top" />
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-4 right-0 bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-100">
                <div className="text-center">
                  <span className="text-2xl font-bold block" style={{ color: slide.accentColor, fontFamily: "'Josefin Sans'" }}>23</span>
                  <span className="text-[10px] text-slate-500">municipios</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${slide.accentColor}, ${slide.accentColor}60)` }} />
    </div>
  );
}

function Ruta23Desktop({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${COLORS.naranjaSalinas}, transparent)` }} />
      
      <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="h-full grid lg:grid-cols-12 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE_CINEMATIC }} className="lg:col-span-5 z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                <Award className="w-3.5 h-3.5" style={{ color: COLORS.dorado }} />
                Premio Tonantzin 2025
              </span>
            </div>
            <div className="mb-4">
              <Image src={IMAGES.ruta23Logo} alt="Ruta 23" width={160} height={50} className="h-10 lg:h-12 w-auto" />
            </div>
            <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: "'Montserrat'" }}>Iniciativa Primera Gestora Social</p>
            <p className="text-white/80 leading-relaxed mb-5 max-w-sm" style={{ fontFamily: "'Montserrat'" }}>Artesanías, gastronomía y cultura de los 23 municipios. De Usiacurí a París.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["900+ artesanos", "19 países", "Premio Tonantzin"].map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">{f}</span>
              ))}
            </div>
            <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}>
              <Utensils className="w-4 h-4" />
              Explorar sabores
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }} className="lg:col-span-7">
            <div className="relative flex gap-3 justify-end">
              <div className="relative w-44 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.ruta23Hero} alt="Ruta 23" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative w-32 lg:w-40 aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image src={IMAGES.ruta23Arepa} alt="Arepa" fill className="object-cover" />
                </div>
                <div className="relative w-32 lg:w-40 aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image src={IMAGES.ruta23Artesanias} alt="Artesanías" fill className="object-cover" />
                </div>
              </div>
              <div className="relative w-32 lg:w-36 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mt-8">
                <Image src={IMAGES.ruta23Cumbia} alt="Cumbia" fill className="object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function BlueFlagDesktop({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-sky-50 via-white to-cyan-50 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full">
          <path d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z" fill={COLORS.blueFlag} />
        </svg>
      </div>
      
      <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="h-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE_CINEMATIC }} className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: slide.accentColor }}>
                <Flag className="w-3.5 h-3.5" />
                Certificación Internacional
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-2 leading-tight" style={{ fontFamily: "'Josefin Sans'", color: slide.accentColor }}>Blue Flag</h2>
            <p className="text-slate-500 text-sm flex items-center gap-2 mb-4" style={{ fontFamily: "'Montserrat'" }}>
              <MapPin className="w-4 h-4" />
              Salinas del Rey · Juan de Acosta
            </p>
            <p className="text-slate-600 leading-relaxed mb-5 max-w-md" style={{ fontFamily: "'Montserrat'" }}>Primera playa deportiva certificada en América. Kitesurf y turismo sostenible.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Certificación FEE", "33 criterios", "Calidad A+"].map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ backgroundColor: `${slide.accentColor}10`, borderColor: `${slide.accentColor}30`, color: slide.accentColor }}>{f}</span>
              ))}
            </div>
            <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}>
              <Waves className="w-4 h-4" />
              Conocer la playa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }} className="flex justify-end">
            <div className="relative">
              <div className="relative w-72 lg:w-80 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.blueFlagBandera} alt="Blue Flag" fill className="object-cover" />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -left-8 w-40 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <Image src={IMAGES.blueFlagPlaya} alt="Playa" fill className="object-cover" />
              </motion.div>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${slide.accentColor}15` }}>
                    <Flag className="w-4 h-4" style={{ color: slide.accentColor }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400">Playa #10</p>
                    <p className="text-xs font-bold text-slate-700">Colombia</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function CarnavalDesktop({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-red-50 via-white to-yellow-50 overflow-hidden">
      <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-red-400 opacity-60" />
      <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-yellow-400 opacity-60" />
      <div className="absolute bottom-32 left-1/4 w-5 h-5 rounded-full bg-blue-400 opacity-40" />
      
      <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="h-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE_CINEMATIC }} className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: slide.accentColor }}>
                <Calendar className="w-3.5 h-3.5" />
                1 - 4 Marzo 2025
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-2 leading-tight" style={{ fontFamily: "'Josefin Sans'" }}>Carnaval 2025</h2>
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-4" style={{ fontFamily: "'Montserrat'" }}>Patrimonio de la Humanidad</p>
            <p className="text-slate-600 leading-relaxed mb-5 max-w-md" style={{ fontFamily: "'Montserrat'" }}>La fiesta más grande de Colombia. Música, color y tradición en Barranquilla.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["1-4 Marzo", "500+ comparsas", "UNESCO"].map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${slide.accentColor}15`, color: slide.accentColor }}>{f}</span>
              ))}
            </div>
            <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}>
              Ver programación
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }} className="flex justify-end">
            <div className="relative">
              <div className="relative w-64 lg:w-72 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src={IMAGES.carnavalMarimondas} alt="Carnaval" fill className="object-cover" />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -left-10 w-36 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <Image src={IMAGES.carnavalMascaras} alt="Máscaras" fill className="object-cover" />
              </motion.div>
              <motion.div animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-4 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-100">
                <Star className="w-5 h-5 mx-auto mb-1" style={{ color: COLORS.dorado }} />
                <span className="text-[10px] font-bold text-slate-700 block">UNESCO</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
    </div>
  );
}

function EcoturismoDesktop({ slide }: { slide: PromoSlide }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10" style={{ background: `radial-gradient(circle, ${COLORS.verdeBijao}, transparent)`, borderRadius: '0 0 0 100%' }} />
      
      <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="h-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE_CINEMATIC }} className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: slide.accentColor }}>
                <Leaf className="w-3.5 h-3.5" />
                Turismo Sostenible
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-2 leading-tight" style={{ fontFamily: "'Josefin Sans'" }}>Ecoturismo</h2>
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-4" style={{ fontFamily: "'Montserrat'" }}>Naturaleza viva del Atlántico</p>
            <p className="text-slate-600 leading-relaxed mb-5 max-w-md" style={{ fontFamily: "'Montserrat'" }}>Avistamiento de aves, reservas naturales y experiencias sostenibles.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["200+ especies", "Ciénagas", "El Barranquero"].map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ backgroundColor: `${slide.accentColor}10`, borderColor: `${slide.accentColor}30`, color: slide.accentColor }}>{f}</span>
              ))}
            </div>
            <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg" style={{ backgroundColor: slide.accentColor, fontFamily: "'Josefin Sans'" }}>
              Explorar destinos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }} className="flex justify-end">
            <div className="relative">
              <div className="relative w-72 lg:w-80 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.ecoAvistamiento} alt="Ecoturismo" fill className="object-cover" style={{ objectPosition: 'center 30%' }} />
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -left-10 bg-white rounded-2xl p-3 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <Image src={IMAGES.ecoBarranquero} alt="Barranquero" fill className="object-cover object-top" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: slide.accentColor }}>AVE OFICIAL</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">El Barranquero</p>
                    <p className="text-[10px] text-slate-400 italic">Momotus subrufescens</p>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-100">
                <span className="text-2xl font-bold block" style={{ color: slide.accentColor, fontFamily: "'Josefin Sans'" }}>200+</span>
                <span className="text-[10px] text-slate-500">especies</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: slide.accentColor }} />
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

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, next]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 500) {
      info.offset.x > 0 ? prev() : next();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const renderMobile = (s: PromoSlide) => {
    switch (s.type) {
      case "tesoros": return <TesorosMobile slide={s} isActive={true} />;
      case "ruta23": return <Ruta23Mobile slide={s} isActive={true} />;
      case "blueflag": return <BlueFlagMobile slide={s} isActive={true} />;
      case "carnaval": return <CarnavalMobile slide={s} isActive={true} />;
      case "ecoturismo": return <EcoturismoMobile slide={s} isActive={true} />;
      default: return <TesorosMobile slide={s} isActive={true} />;
    }
  };

  const renderDesktop = (s: PromoSlide) => {
    switch (s.type) {
      case "tesoros": return <TesorosDesktop slide={s} />;
      case "ruta23": return <Ruta23Desktop slide={s} />;
      case "blueflag": return <BlueFlagDesktop slide={s} />;
      case "carnaval": return <CarnavalDesktop slide={s} />;
      case "ecoturismo": return <EcoturismoDesktop slide={s} />;
      default: return <TesorosDesktop slide={s} />;
    }
  };

  return (
    <section 
      className="relative h-[580px] sm:h-[480px] lg:h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          <div className="sm:hidden h-full">{renderMobile(slide)}</div>
          <div className="hidden sm:block h-full">{renderDesktop(slide)}</div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Navigation */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hidden sm:flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-lg transition-all" aria-label="Anterior">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hidden sm:flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-lg transition-all" aria-label="Siguiente">
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Mobile Navigation */}
      <div className="absolute bottom-4 left-0 right-0 z-20 sm:hidden">
        <div className="flex items-center justify-center gap-2.5">
          {promoSlides.map((s, i) => (
            <button key={i} onClick={() => goToSlide(i)} className={`h-2 rounded-full transition-all duration-500 ${i === current ? "w-7" : "w-2 bg-slate-300/60"}`} style={{ backgroundColor: i === current ? s.accentColor : undefined }} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Desktop Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-2">
        {promoSlides.map((s, i) => (
          <button key={i} onClick={() => goToSlide(i)} className={`h-2 rounded-full transition-all duration-500 ${i === current ? "w-8" : "w-2 bg-slate-300 hover:bg-slate-400"}`} style={{ backgroundColor: i === current ? s.accentColor : undefined }} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 z-10">
        <motion.div className="h-full" style={{ backgroundColor: slide.accentColor }} initial={{ width: "0%" }} animate={{ width: isPaused ? undefined : "100%" }} transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }} key={`progress-${current}-${isPaused}`} />
      </div>
    </section>
  );
}