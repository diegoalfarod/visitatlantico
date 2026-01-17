"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Utensils,
  Palette,
  ShoppingBag,
  Users,
  Star,
  Award,
  Globe,
  Heart,
  Newspaper,
  Search,
  TrendingUp,
  Sparkles,
  Quote,
  Play,
  Clock,
  Waves,
  Leaf,
  Camera,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { EventDrawer } from "@/components/EventDrawer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/types/event";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#1a1a2e",
  dorado: "#D4A853",
};

// Easing cinematográfico
const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// =============================================================================
// IMÁGENES
// =============================================================================
const IMAGES = {
  hero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
  gobernadorFeria: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/GOBERNADOR%20-%20RUTA23.jpeg?alt=media&token=ccfee882-68b8-4f0a-9d25-e316a5623d4b",
  arepaCocinando: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/GobernacionRuta23-%20arepa%20cocinando.jpg?alt=media&token=963fbc43-a6c3-48ce-90ba-64169363e3cc",
  enyucate: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/enyucate%20-%20ruta23.jpeg?alt=media&token=4ec8c7c2-29d3-4fdf-95cc-b17c80e6812a",
  tributoBollo: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/GobernacionFestivalBolloFritos%20-Tributos.jpg?alt=media&token=9ec69efd-91b7-4406-819e-dc01555ece87",
  enyucate2: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/enyucate-1-1024x682.jpg?alt=media&token=bf5f0f42-a073-480d-939e-ee3a1f2fd6e0",
  cumbia: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/pareja%20bailando%20cumbia%20ruta23.jpeg?alt=media&token=ca49b0e0-8e3c-4e8c-8e7a-476a7cf685ef",
  gobernadorArroz: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/gobernador%20con%20mujer%20cocinando%20arroz.jpeg?alt=media&token=83ca27ff-efc6-43aa-a0c3-61e3d0e14621",
  festivalMaiz: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/festival%20del%20maiz.jpeg?alt=media&token=78afa541-c3e6-472b-bef8-2ced131e0456",
  artesanoFiguras: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/artesano%20con%20figuras%20del%20carnaval.jpeg?alt=media&token=cf74ebfd-67b6-4138-9887-676fbeb1f0ee",
  artesaniasUsiacuri: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/artesanias%20usiaquri.jpg?alt=media&token=b7da2145-c853-42b6-971f-a34362634ee0",
  casaArtesanal: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/Casa-Artesanal-1%20ruta23.jpg?alt=media&token=fca483d8-020c-43ad-8048-dab122036270",
};

// =============================================================================
// TIPOS
// =============================================================================
type PlatoTipico = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  categoria: string;
  destacado: boolean;
  origen: string;
  ingredientes?: string[];
  donde_probar?: string;
};

// =============================================================================
// DATOS
// =============================================================================
const STATS_HERO = [
  { value: "19", label: "Países", sublabel: "exportan artesanías" },
  { value: "900+", label: "Artesanos", sublabel: "capacitados" },
  { value: "18", label: "Festivales", sublabel: "gastronómicos" },
  { value: "$1M", label: "USD", sublabel: "en exportaciones" },
];

const PROGRAMAS = [
  {
    id: "sello-artesanal", 
    nombre: "Sello Artesanal",
    descripcion: "Capacitación, certificación y apertura de mercados internacionales para artesanos. Presente en Maison & Objet París desde 2019.",
    icon: Palette,
    color: COLORS.dorado,
    stats: "900+ artesanos",
    image: IMAGES.artesaniasUsiacuri,
  },
  {
    id: "feria-ama",
    nombre: "Feria AMA",
    descripcion: "Arte Manual Ancestral — la gran feria artesanal del Caribe colombiano. 80 marcas, 5 departamentos, 8.500 visitantes.",
    icon: ShoppingBag,
    color: COLORS.rojoCayena,
    stats: "$1.000M en ventas",
    image: IMAGES.casaArtesanal,
  },
  {
    id: "ruta-gastronomica",
    nombre: "Ruta Gastronómica",
    descripcion: "18 festivales que celebran los sabores tradicionales. De la arepa de huevo al sancocho de guandú.",
    icon: Utensils,
    color: COLORS.naranjaSalinas,
    stats: "23 municipios",
    image: IMAGES.arepaCocinando,
  },
  {
    id: "yo-emprendo",
    nombre: "Yo Emprendo, Yo Facturo",
    descripcion: "Formación para mujeres emprendedoras en belleza, floristería y decoración. Cada graduada recibe kit profesional.",
    icon: Users,
    color: COLORS.verdeBijao,
    stats: "150 mujeres/año",
    image: IMAGES.enyucate2,
  },
];

const TECNICAS_ARTESANALES = [
  {
    id: "usiacuri",
    municipio: "Usiacurí",
    tecnica: "Tejido en Palma de Iraca",
    descripcion: "Más de 1.000 tejedoras dominan puntadas ancestrales como ojito de perdiz, catatumba y panal. Sus piezas tienen Sello de Calidad Icontec.",
    artesana: "Julia Salas, 'la señora de los jarrones'",
    image: IMAGES.artesaniasUsiacuri,
    color: COLORS.beigeIraca,
  },
  {
    id: "galapa",
    municipio: "Galapa",
    tecnica: "Máscaras de Carnaval",
    descripcion: "Máscaras zoomorfas en madera de ceiba roja que representan el mestizaje cultural. Las del taller Selva Africana llegaron al Super Bowl con Shakira.",
    artesana: "José Francisco Llanos, Selva Africana",
    image: IMAGES.artesanoFiguras,
    color: COLORS.rojoCayena,
  },
  {
    id: "tubara",
    municipio: "Tubará",
    tecnica: "Arte en Totumo",
    descripcion: "Los artesanos Mokaná transforman el totumo mediante calado, tallado y pirograbado. Cada pieza representa la herencia indígena del Atlántico.",
    artesana: "Adolfo Coll Castro, Artesanías Coll Mokaná",
    image: IMAGES.casaArtesanal,
    color: COLORS.verdeBijao,
  },
];

const GALERIA_IMAGES = [
  { src: IMAGES.arepaCocinando, alt: "Arepa de huevo cocinándose" },
  { src: IMAGES.cumbia, alt: "Pareja bailando cumbia" },
  { src: IMAGES.festivalMaiz, alt: "Festival del maíz" },
  { src: IMAGES.tributoBollo, alt: "Tributo al bollo" },
  { src: IMAGES.enyucate, alt: "Enyucate tradicional" },
  { src: IMAGES.artesanoFiguras, alt: "Artesano con figuras del carnaval" },
];

const NOTICIAS = [
  {
    titulo: "Feria AMA 2025 cerró con $1.000 millones en ventas",
    fuente: "Zona Cero",
    fecha: "Mayo 2025",
    url: "https://zonacero.com/generales/feria-ama-genero-ventas-por-1000-millones-en-atlantico-gobernacion",
    destacado: true,
  },
  {
    titulo: "Liliana Borrero recibe Premio Tonantzin 2025 en México",
    fuente: "Gobernación del Atlántico",
    fecha: "Agosto 2025",
    url: "https://www.atlantico.gov.co/index.php/noticias/prensa-cultura/26453-el-liderazgo-de-la-primera-gestora-social-del-atlantico-liliana-borrero-es-reconocido-en-mexico",
    destacado: true,
  },
  {
    titulo: "Atlántico brilla en Expoartesanías con 'Macondo Surrealista'",
    fuente: "El Heraldo",
    fecha: "Diciembre 2025",
    url: "https://www.elheraldo.co/atlantico/2025/12/08/la-riqueza-cultural-de-atlantico-se-apodera-de-expoartesanias-2025-con-macondo-surrealista/",
    destacado: false,
  },
  {
    titulo: "Artesanías del Atlántico conquistan Maison & Objet París",
    fuente: "Diario La Libertad",
    fecha: "Febrero 2025",
    url: "https://diariolalibertad.com/sitio/2025/02/12/artesanias-del-atlantico-brillan-en-importantes-ferias-internacionales/",
    destacado: false,
  },
];

// Fallback
const FALLBACK_PLATO_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop";

// =============================================================================
// ANIMACIONES
// =============================================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: EASE_CINEMATIC }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: EASE_CINEMATIC }
  }
};

// =============================================================================
// COMPONENTES
// =============================================================================

// Horizontal Scroll Gallery
function GaleriaHorizontal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  
  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GALERIA_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex-shrink-0 snap-center first:pl-6 last:pr-6 sm:first:pl-8 sm:last:pr-8 lg:first:pl-12 lg:last:pr-12"
          >
            <div className="relative w-72 sm:w-80 lg:w-96 aspect-[4/3] rounded-2xl overflow-hidden group">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p 
                  className="text-white text-sm font-medium"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {img.alt}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="flex justify-center mt-4 gap-2">
        <span 
          className="text-xs text-slate-400 flex items-center gap-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <ArrowRight size={12} />
          Desliza para ver más
        </span>
      </div>
    </div>
  );
}

// Programa Card - Visual
function ProgramaCardVisual({ programa, index }: { programa: typeof PROGRAMAS[0]; index: number }) {
  const Icon = programa.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE_CINEMATIC }}
      className="group relative"
    >
      <div className="relative h-80 rounded-2xl overflow-hidden">
        <Image
          src={programa.image}
          alt={programa.nombre}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        
        {/* Icon */}
        <div 
          className="absolute top-5 left-5 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: `${programa.color}30`, border: `1px solid ${programa.color}50` }}
        >
          <Icon size={24} style={{ color: programa.color }} />
        </div>
        
        {/* Stats badge */}
        <div className="absolute top-5 right-5">
          <span 
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm"
            style={{ backgroundColor: `${programa.color}90` }}
          >
            {programa.stats}
          </span>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {programa.nombre}
          </h3>
          <p 
            className="text-white/80 text-sm leading-relaxed line-clamp-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {programa.descripcion}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Técnica Artesanal Card
function TecnicaCard({ tecnica, index }: { tecnica: typeof TECNICAS_ARTESANALES[0]; index: number }) {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE_CINEMATIC }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
    >
      {/* Image */}
      <div className="w-full lg:w-1/2">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
          <Image
            src={tecnica.image}
            alt={tecnica.tecnica}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{ background: `linear-gradient(135deg, ${tecnica.color}, transparent)` }}
          />
          
          {/* Municipio badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-md"
              style={{ backgroundColor: `${tecnica.color}CC` }}
            >
              <MapPin size={14} className="inline mr-1.5 -mt-0.5" />
              {tecnica.municipio}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="w-full lg:w-1/2 space-y-4">
        <div>
          <span 
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: tecnica.color, fontFamily: "'Montserrat', sans-serif" }}
          >
            Técnica Ancestral
          </span>
          <h3 
            className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {tecnica.tecnica}
          </h3>
        </div>
        
        <p 
          className="text-slate-600 leading-relaxed"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {tecnica.descripcion}
        </p>
        
        <div 
          className="flex items-center gap-3 pt-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${tecnica.color}15` }}
          >
            <Star size={18} style={{ color: tecnica.color }} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Artesano destacado</p>
            <p className="text-sm font-semibold text-slate-700">{tecnica.artesana}</p>
          </div>
        </div>
        
        <Link
          href={`/destinations?filter=${tecnica.municipio}`}
          className="inline-flex items-center gap-2 text-sm font-semibold group/link mt-4"
          style={{ color: tecnica.color }}
        >
          Explorar {tecnica.municipio}
          <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

// Plato Card
function PlatoCard({ 
  plato, 
  index, 
  onOpenModal 
}: { 
  plato: PlatoTipico; 
  index: number;
  onOpenModal: (plato: PlatoTipico) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_CINEMATIC }}
    >
      <button
        onClick={() => onOpenModal(plato)}
        className="w-full text-left group"
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={plato.imagen || FALLBACK_PLATO_IMAGE}
            alt={plato.nombre}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_PLATO_IMAGE;
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {plato.destacado && (
            <div className="absolute top-4 right-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ background: COLORS.dorado }}
              >
                <Star size={12} />
                Destacado
              </span>
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm text-slate-700"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {plato.categoria}
            </span>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p 
              className="text-white/60 text-sm mb-1 flex items-center gap-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <MapPin size={12} />
              {plato.origen}
            </p>
            <h3 
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {plato.nombre}
            </h3>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// Evento Card
function EventoCard({ 
  event, 
  index,
  onOpenDrawer
}: { 
  event: Event; 
  index: number;
  onOpenDrawer: (event: Event) => void;
}) {
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const days = getDaysUntil(event.dateStart);
  const isPast = days < 0;
  const isSoon = !isPast && days <= 7;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE_CINEMATIC }}
    >
      <button
        onClick={() => onOpenDrawer(event)}
        className={`w-full flex gap-4 p-4 rounded-2xl text-left bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group ${isPast ? "opacity-60" : ""}`}
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          {isSoon && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})` }}
            >
              <div className="text-center text-white">
                <div className="text-2xl font-bold">{days}</div>
                <div className="text-[10px] uppercase tracking-wide">días</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-start justify-between gap-2">
            <h4 
              className="font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {event.title}
            </h4>
            {event.isFree && (
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0"
                style={{ background: `${COLORS.verdeBijao}15`, color: COLORS.verdeBijao }}
              >
                Gratis
              </span>
            )}
          </div>
          
          <p 
            className="text-sm text-slate-500 mt-0.5 line-clamp-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {event.subtitle}
          </p>
          
          <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Calendar size={14} style={{ color: COLORS.naranjaSalinas }} />
              {event.dates}
            </span>
          </div>
        </div>
        
        <ArrowRight 
          size={18} 
          className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-6" 
        />
      </button>
    </motion.div>
  );
}

// Noticia Card
function NoticiaCard({ noticia, index }: { noticia: typeof NOTICIAS[0]; index: number }) {
  return (
    <motion.a
      href={noticia.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE_CINEMATIC }}
      className={`group block p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
        noticia.destacado 
          ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700" 
          : "bg-white border-slate-100 hover:border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {noticia.destacado && (
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase mb-3"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.dorado})`,
                color: "white",
              }}
            >
              <TrendingUp size={10} />
              Destacado
            </span>
          )}
          <h3 
            className={`font-bold mb-2 group-hover:underline ${
              noticia.destacado ? "text-white" : "text-slate-800"
            }`}
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {noticia.titulo}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className={noticia.destacado ? "text-white/60" : "text-slate-500"}>
              {noticia.fuente}
            </span>
            <span className={noticia.destacado ? "text-white/40" : "text-slate-300"}>•</span>
            <span className={noticia.destacado ? "text-white/60" : "text-slate-500"}>
              {noticia.fecha}
            </span>
          </div>
        </div>
        <ExternalLink 
          size={18} 
          className={`flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
            noticia.destacado ? "text-white/40" : "text-slate-300"
          }`} 
        />
      </div>
    </motion.a>
  );
}

// Plato Modal
function PlatoModal({ 
  plato, 
  isOpen, 
  onClose 
}: { 
  plato: PlatoTipico | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  const searchInGoogle = (nombre: string) => {
    const query = `restaurantes "${nombre}" Atlántico Colombia`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };
  
  if (!plato) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72">
              <Image
                src={plato.imagen || FALLBACK_PLATO_IMAGE}
                alt={plato.nombre}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
              
              {plato.destacado && (
                <div className="absolute bottom-4 left-4">
                  <span 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-bold"
                    style={{ background: COLORS.dorado }}
                  >
                    <Star size={14} />
                    Plato Destacado
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    background: `${COLORS.naranjaSalinas}10`,
                    color: COLORS.naranjaSalinas,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {plato.categoria}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-500 flex items-center gap-1"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <MapPin size={12} />
                  {plato.origen}
                </span>
              </div>
              
              <h2 
                className="text-3xl font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {plato.nombre}
              </h2>
              <p 
                className="text-slate-600 leading-relaxed mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {plato.descripcion}
              </p>
              
              {plato.ingredientes && plato.ingredientes.length > 0 && (
                <div className="mb-6">
                  <h3 
                    className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Ingredientes principales
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plato.ingredientes.map((ing, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {plato.donde_probar && (
                <div className="p-4 rounded-2xl bg-slate-50">
                  <h3 
                    className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <MapPin size={16} style={{ color: COLORS.naranjaSalinas }} />
                    Dónde probarlo
                  </h3>
                  <p 
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {plato.donde_probar}
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50">
              <button
                onClick={() => searchInGoogle(plato.nombre)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  fontFamily: "'Josefin Sans', sans-serif",
                }}
              >
                <MapPin size={18} />
                Buscar restaurantes cercanos
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function Ruta23Page() {
  // Estados
  const [platosTipicos, setPlatosTipicos] = useState<PlatoTipico[]>([]);
  const [eventosGastronomicos, setEventosGastronomicos] = useState<Event[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [showAllPlatos, setShowAllPlatos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePlato, setActivePlato] = useState<PlatoTipico | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // FAQs sobre Ruta 23 (sincronizadas con layout.tsx)
  const ruta23FAQs = [
    {
      question: "¿Qué es la Ruta 23 del Atlántico?",
      answer: "La <strong>Ruta 23</strong> es una iniciativa de la Gobernación del Atlántico que conecta los <strong>23 municipios del departamento</strong> a través de su gastronomía tradicional y artesanías. Es un recorrido cultural y gastronómico que promueve los sabores auténticos del Caribe colombiano, con <strong>18 festivales gastronómicos</strong> al año y más de <strong>900 artesanos capacitados</strong>. La Ruta 23 ha logrado exportar productos artesanales a <strong>19 países</strong>, generando más de <strong>$1 millón USD</strong> en exportaciones anuales.",
    },
    {
      question: "¿Cuáles son los platos típicos más famosos del Atlántico?",
      answer: "Los platos típicos más emblemáticos del Atlántico son:<br/><br/><strong>1. Arepa de Huevo:</strong> Arepa frita rellena con huevo. El snack más icónico del Caribe colombiano.<br/><br/><strong>2. Bollo Limpio:</strong> Masa de maíz envuelta en hojas de bijao. Se come con queso costeño.<br/><br/><strong>3. Sancocho de Guandú:</strong> Sopa espesa con guandú (frijol), cerdo, yuca y plátano. Plato dominical tradicional.<br/><br/><strong>4. Enyucado:</strong> Postre dulce hecho de yuca rallada con coco y panela.<br/><br/><strong>5. Arroz de Lisa:</strong> Arroz con pescado lisa (mugil), típico de municipios costeros.<br/><br/><strong>6. Carimañola:</strong> Bollo de yuca frito relleno de carne o queso.",
    },
    {
      question: "¿Dónde puedo probar la gastronomía auténtica del Atlántico?",
      answer: "Los mejores lugares para probar gastronomía auténtica del Atlántico son:<br/><br/><strong>Festivales Gastronómicos:</strong><br/>🎪 <strong>Festival del Bollo:</strong> Repelón (junio)<br/>🎪 <strong>Festival del Maíz:</strong> Tubará (julio)<br/>🎪 <strong>Festival del Enyucado:</strong> Campo de la Cruz (agosto)<br/><br/><strong>Municipios recomendados:</strong><br/>📍 <strong>Soledad:</strong> Famosa por arepas de huevo y carimañolas<br/>📍 <strong>Galapa:</strong> Bollos y sancocho de guandú<br/>📍 <strong>Tubará:</strong> Platos a base de maíz<br/>📍 <strong>Puerto Colombia:</strong> Pescados y mariscos frescos<br/><br/><strong>Mercados locales:</strong><br/>🏪 Mercado de Soledad<br/>🏪 Plaza de Galapa<br/>🏪 Mercado de Malambo",
    },
    {
      question: "¿Qué artesanías se producen en el Atlántico?",
      answer: "El Atlántico es reconocido por sus artesanías tradicionales:<br/><br/><strong>Artesanías en Iraca (palma):</strong><br/>🎨 Sombreros vueltiaos y panameños<br/>🎨 Bolsos, esteras y abanicos<br/>🎨 Figuras decorativas<br/><br/><strong>Municipios productores:</strong><br/>📍 <strong>Usiacurí:</strong> Capital artesanal del Atlántico. Famoso por trabajos en iraca.<br/>📍 <strong>Tubará:</strong> Artesanías en barro y cerámica<br/>📍 <strong>Galapa:</strong> Tejidos tradicionales<br/><br/><strong>Exportaciones:</strong><br/>Las artesanías del Atlántico se exportan a <strong>19 países</strong> incluyendo Estados Unidos, España, Francia, Alemania y Japón. La Gobernación ha capacitado más de <strong>900 artesanos</strong> en técnicas de producción y comercialización internacional.",
    },
    {
      question: "¿Cuándo se celebran los festivales gastronómicos del Atlántico?",
      answer: "El Atlántico celebra <strong>18 festivales gastronómicos</strong> durante el año:<br/><br/><strong>Primer Semestre:</strong><br/>🎉 <strong>Enero:</strong> Festival del Sancocho (Malambo)<br/>🎉 <strong>Marzo:</strong> Festival del Mote de Queso (Campo de la Cruz)<br/>🎉 <strong>Abril:</strong> Festival del Arroz de Lisa (Puerto Colombia)<br/>🎉 <strong>Junio:</strong> Festival del Bollo (Repelón)<br/><br/><strong>Segundo Semestre:</strong><br/>🎉 <strong>Julio:</strong> Festival del Maíz (Tubará)<br/>🎉 <strong>Agosto:</strong> Festival del Enyucado (Campo de la Cruz)<br/>🎉 <strong>Septiembre:</strong> Festival de la Butifarra (Soledad)<br/>🎉 <strong>Octubre:</strong> Festival del Suero Costeño (Galapa)<br/><br/><strong>Consejo:</strong> Los festivales son gratuitos y abiertos al público. Incluyen concursos de cocina, degustaciones, música en vivo y venta de productos artesanales.",
    },
    {
      question: "¿Cómo llegar a los municipios de la Ruta 23 desde Barranquilla?",
      answer: "Todos los municipios de la Ruta 23 están <strong>a menos de 1 hora</strong> de Barranquilla:<br/><br/><strong>Cercanos (15-30 min):</strong><br/>🚗 <strong>Soledad:</strong> 10 km - Bus desde Portal del Prado ($2,000 COP)<br/>🚗 <strong>Galapa:</strong> 18 km - Bus desde Terminal ($3,000 COP)<br/>🚗 <strong>Puerto Colombia:</strong> 20 km - Bus o taxi ($25,000 COP)<br/><br/><strong>Distancia media (30-50 min):</strong><br/>🚗 <strong>Usiacurí:</strong> 35 km - Bus desde Terminal ($5,000 COP)<br/>🚗 <strong>Tubará:</strong> 42 km - Bus desde Terminal ($6,000 COP)<br/>🚗 <strong>Repelón:</strong> 55 km - Bus desde Terminal ($8,000 COP)<br/><br/><strong>Recomendación:</strong> Alquila un auto para visitar varios municipios en un día. Las carreteras están en buen estado y señalizadas.",
    },
  ];
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const platosSnapshot = await getDocs(collection(db, "platos_tipicos"));
        const platosData = platosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imagen: data.imagePath || data.imagen || FALLBACK_PLATO_IMAGE
          };
        }) as PlatoTipico[];
        
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const allEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        const gastroEvents = allEvents
          .filter(e => e.category === "gastronomia")
          .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
        
        setPlatosTipicos(platosData);
        setEventosGastronomicos(gastroEvents);
        
        const categoriasUnicas = [...new Set(platosData
          .map(plato => plato.categoria)
          .filter(categoria => categoria && categoria.trim() !== "")
        )].sort();
        
        setCategorias(categoriasUnicas);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const platosFiltrados = filtroCategoria === "Todos"
    ? platosTipicos
    : platosTipicos.filter(p => p.categoria?.toLowerCase() === filtroCategoria.toLowerCase());
  
  const platosVisibles = showAllPlatos ? platosFiltrados : platosFiltrados.slice(0, 8);
  
  const openModal = (plato: PlatoTipico) => {
    setActivePlato(plato);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setActivePlato(null), 300);
  };
  
  const openDrawer = (event: Event) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  const searchNews = () => {
    const query = "Ruta 23 Atlántico artesanías gastronomía";
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`, '_blank');
  };
  
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white" style={{ paddingTop: 'var(--navbar-height, 80px)' }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Gastronomía", url: "https://visitatlantico.com/ruta23" },
            { name: "Ruta 23", url: "https://visitatlantico.com/ruta23" },
          ]}
        />

        {/* ============================================================= */}
        {/* HERO - Editorial Style */}
        {/* ============================================================= */}
        <section className="relative bg-slate-50 overflow-hidden">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div ref={heroRef} className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 py-12 sm:py-16 lg:py-20 items-center">
              
              {/* Content - Left */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
                >
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}15, ${COLORS.rojoCayena}15)`,
                      border: `1px solid ${COLORS.naranjaSalinas}25`,
                    }}
                  >
                    <Award size={16} style={{ color: COLORS.dorado }} />
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        color: COLORS.naranjaSalinas,
                      }}
                    >
                      Iniciativa de la Primera Gestora Social
                    </span>
                  </motion.div>
                  
                  {/* Logo */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-6"
                  >
                    <Image
                      src="/RUTA23LOGO.png"
                      alt="Ruta 23"
                      width={220}
                      height={80}
                      className="h-16 sm:h-20 w-auto"
                    />
                  </motion.div>
                  
                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight mb-6"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Artesanías, gastronomía y cultura de los{" "}
                    <span 
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      23 municipios
                    </span>{" "}
                    del Atlántico
                  </motion.h1>
                  
                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Una estrategia que ha llevado los saberes, sabores y tradiciones del Atlántico 
                    a escenarios internacionales como París, Nueva York y Ciudad de México.
                  </motion.p>
                  
                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8"
                  >
                    {STATS_HERO.map((stat, i) => (
                      <div key={i} className="text-center sm:text-left">
                        <div 
                          className="text-2xl sm:text-3xl font-bold"
                          style={{ 
                            fontFamily: "'Josefin Sans', sans-serif",
                            color: i % 2 === 0 ? COLORS.naranjaSalinas : COLORS.dorado,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div 
                          className="text-sm font-medium text-slate-700"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {stat.label}
                        </div>
                        <div 
                          className="text-xs text-slate-500"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {stat.sublabel}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                  
                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-wrap gap-4"
                  >
                    <button
                      onClick={() => document.getElementById('programas')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold transition-all hover:shadow-xl group"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                        fontFamily: "'Josefin Sans', sans-serif",
                      }}
                    >
                      Explorar Ruta 23
                      <ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                    
                    <Link
                      href="/destinations"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Ver destinos
                      <ArrowRight size={18} />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Image - Right */}
              <div className="lg:col-span-5 order-1 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 30 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE_CINEMATIC }}
                  className="relative"
                >
                  {/* Main Image */}
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={IMAGES.hero}
                      alt="Ruta 23 - Atlántico"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${COLORS.naranjaSalinas}30, transparent 50%)`,
                      }}
                    />
                  </div>
                  
                  {/* Floating Quote Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="absolute -bottom-6 -left-6 sm:-left-10 bg-white rounded-2xl p-5 shadow-xl max-w-[280px] border border-slate-100"
                  >
                    <Quote size={24} className="text-slate-200 mb-2" />
                    <p 
                      className="text-sm text-slate-600 italic leading-relaxed mb-3"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      "Ruta 23 ha llevado los sabores, saberes y tradiciones del Atlántico a escenarios internacionales"
                    </p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.dorado})` }}
                      >
                        <Heart size={18} className="text-white" />
                      </div>
                      <div>
                        <p 
                          className="text-sm font-bold text-slate-800"
                          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                        >
                          Liliana Borrero
                        </p>
                        <p 
                          className="text-xs text-slate-500"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          Primera Gestora Social
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Award size={14} style={{ color: COLORS.dorado }} />
                      <span 
                        className="text-xs font-medium"
                        style={{ color: COLORS.dorado }}
                      >
                        Premio Tonantzin 2025
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center"
          >
            <div className="w-[1px] h-12 bg-gradient-to-b from-slate-300 to-transparent" />
          </motion.div>
        </section>
        
        {/* ============================================================= */}
        {/* GALERÍA HORIZONTAL */}
        {/* ============================================================= */}
        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <GaleriaHorizontal />
        </section>
        
        {/* ============================================================= */}
        {/* INTRO / QUÉ ES RUTA 23 */}
        {/* ============================================================= */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <span 
                className="text-sm font-medium tracking-widest uppercase mb-4 block"
                style={{ color: COLORS.naranjaSalinas, fontFamily: "'Montserrat', sans-serif" }}
              >
                Sobre el programa
              </span>
              
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-8 leading-tight"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                ¿Qué es{" "}
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Ruta 23
                </span>
                ?
              </h2>
              
              <div 
                className="text-lg text-slate-600 leading-relaxed space-y-6 text-left sm:text-center"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <p>
                  <strong className="text-slate-800">Ruta 23</strong> es la estrategia de turismo cultural y gastronómico 
                  de la Gobernación del Atlántico que conecta los <strong className="text-slate-800">22 municipios 
                  y el Distrito de Barranquilla</strong> a través de sus artesanías, sabores y tradiciones.
                </p>
                <p>
                  Liderada por la Primera Gestora Social <strong className="text-slate-800">Liliana Borrero de Verano</strong>, 
                  esta iniciativa ha logrado que las artesanías atlanticenses lleguen a <strong style={{ color: COLORS.naranjaSalinas }}>19 países</strong>, 
                  generen ventas cercanas al <strong style={{ color: COLORS.naranjaSalinas }}>millón de dólares</strong>, y que 
                  la región brille en escenarios como <strong className="text-slate-800">Maison & Objet París</strong> y 
                  el <strong className="text-slate-800">Premio Internacional Tonantzin</strong> en México.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* PROGRAMAS */}
        {/* ============================================================= */}
        <section id="programas" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}15, ${COLORS.rojoCayena}15)`,
                  border: `1px solid ${COLORS.naranjaSalinas}20`,
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: COLORS.naranjaSalinas }} />
                <span 
                  className="text-sm font-medium"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: COLORS.naranjaSalinas }}
                >
                  Nuestros Programas
                </span>
              </motion.div>
              
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Cuatro ejes que transforman el{" "}
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Atlántico
                </span>
              </h2>
              
              <p 
                className="text-slate-500 text-lg max-w-2xl mx-auto"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Artesanías, gastronomía y emprendimiento unidos para posicionar 
                la cultura atlanticense en el mundo.
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROGRAMAS.map((programa, i) => (
                <ProgramaCardVisual key={programa.id} programa={programa} index={i} />
              ))}
            </div>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* TÉCNICAS ARTESANALES */}
        {/* ============================================================= */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <span 
                className="text-sm font-medium tracking-widest uppercase mb-4 block"
                style={{ color: COLORS.beigeIraca, fontFamily: "'Montserrat', sans-serif" }}
              >
                Patrimonio vivo
              </span>
              
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Técnicas{" "}
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.beigeIraca}, ${COLORS.dorado})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Artesanales
                </span>
              </h2>
              
              <p 
                className="text-slate-500 text-lg max-w-2xl mx-auto"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Tres municipios, tres técnicas ancestrales que definen la identidad artesanal del Atlántico.
              </p>
            </motion.div>
            
            <div className="space-y-16 lg:space-y-24">
              {TECNICAS_ARTESANALES.map((tecnica, i) => (
                <TecnicaCard key={tecnica.id} tecnica={tecnica} index={i} />
              ))}
            </div>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* FESTIVALES GASTRONÓMICOS */}
        {/* ============================================================= */}
        {eventosGastronomicos.length > 0 && (
          <section className="py-16 sm:py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${COLORS.naranjaSalinas}15` }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: COLORS.naranjaSalinas }} />
                    </div>
                    <span 
                      className="text-slate-500 text-sm tracking-widest uppercase"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Agenda
                    </span>
                  </div>
                  
                  <h2 
                    className="text-3xl sm:text-4xl font-bold text-slate-800"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Festivales{" "}
                    <span 
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Gastronómicos
                    </span>
                  </h2>
                </div>
                
                <Link
                  href="/eventos?categoria=gastronomia"
                  className="inline-flex items-center gap-2 text-sm font-medium group"
                  style={{ color: COLORS.naranjaSalinas, fontFamily: "'Montserrat', sans-serif" }}
                >
                  Ver todos los eventos
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {eventosGastronomicos.slice(0, 4).map((event, i) => (
                  <EventoCard
                    key={event.id}
                    event={event}
                    index={i}
                    onOpenDrawer={openDrawer}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* ============================================================= */}
        {/* PLATOS TÍPICOS */}
        {/* ============================================================= */}
        <section id="platos" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}15, ${COLORS.dorado}15)`,
                  border: `1px solid ${COLORS.naranjaSalinas}20`,
                }}
              >
                <Utensils className="w-4 h-4" style={{ color: COLORS.naranjaSalinas }} />
                <span 
                  className="text-sm font-medium"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: COLORS.naranjaSalinas }}
                >
                  Ruta Gastronómica
                </span>
              </motion.div>
              
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Platos{" "}
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Típicos
                </span>
              </h2>
              
              <p 
                className="text-slate-500 text-lg max-w-2xl mx-auto mb-8"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Los sabores que definen la identidad culinaria del Atlántico.
              </p>
              
              {/* Filtros */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setFiltroCategoria("Todos")}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: filtroCategoria === "Todos" 
                      ? `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`
                      : "white",
                    color: filtroCategoria === "Todos" ? "white" : "#64748b",
                    border: filtroCategoria === "Todos" ? "none" : "1px solid #e2e8f0",
                    boxShadow: filtroCategoria === "Todos" ? `0 4px 15px -3px ${COLORS.naranjaSalinas}40` : "none",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Todos ({platosTipicos.length})
                </button>
                
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: filtroCategoria === cat 
                        ? `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`
                        : "white",
                      color: filtroCategoria === cat ? "white" : "#64748b",
                      border: filtroCategoria === cat ? "none" : "1px solid #e2e8f0",
                      boxShadow: filtroCategoria === cat ? `0 4px 15px -3px ${COLORS.naranjaSalinas}40` : "none",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Grid de platos */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div 
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${COLORS.naranjaSalinas} transparent ${COLORS.naranjaSalinas} ${COLORS.naranjaSalinas}` }}
                />
              </div>
            ) : platosFiltrados.length === 0 ? (
              <div className="text-center py-20">
                <Utensils size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  No hay platos en esta categoría
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  key={`${filtroCategoria}-${showAllPlatos}`}
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                  {platosVisibles.map((plato, i) => (
                    <PlatoCard
                      key={plato.id}
                      plato={plato}
                      index={i}
                      onOpenModal={openModal}
                    />
                  ))}
                </motion.div>
                
                {platosFiltrados.length > 8 && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setShowAllPlatos(!showAllPlatos)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-200 text-slate-600 font-medium hover:border-slate-300 transition-all"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {showAllPlatos ? (
                        <>
                          <ChevronUp size={18} />
                          Ver menos
                        </>
                      ) : (
                        <>
                          Ver {platosFiltrados.length - 8} platos más
                          <ChevronDown size={18} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* NOTICIAS */}
        {/* ============================================================= */}
        <section className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${COLORS.azulBarranquero}15` }}
                  >
                    <Newspaper className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                  </div>
                  <span 
                    className="text-slate-500 text-sm tracking-widest uppercase"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    En los medios
                  </span>
                </div>
                
                <h2 
                  className="text-3xl sm:text-4xl font-bold text-slate-800"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Noticias de{" "}
                  <span 
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Ruta 23
                  </span>
                </h2>
              </div>
              
              <button
                onClick={searchNews}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <Search size={16} />
                Buscar más noticias
              </button>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {NOTICIAS.map((noticia, i) => (
                <NoticiaCard key={i} noticia={noticia} index={i} />
              ))}
            </div>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* CTA FINAL */}
        {/* ============================================================= */}
        <section 
          className="py-20 sm:py-28 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${COLORS.grisOscuro} 0%, #16213e 100%)` }}
        >
          {/* Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Decorative circles */}
          <div 
            className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${COLORS.naranjaSalinas} 0%, transparent 70%)`,
            }}
          />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
            >
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Vive la experiencia
                <br />
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.amarilloArepa})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Ruta 23
                </span>
              </h2>
              
              <p 
                className="text-white/70 text-lg mb-10 max-w-2xl mx-auto"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Planifica tu recorrido por los sabores, tradiciones y maravillas 
                del Atlántico. Cada municipio tiene una historia que contar.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/eventos"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-semibold transition-all hover:shadow-xl group"
                  style={{ 
                    color: COLORS.grisOscuro,
                    fontFamily: "'Josefin Sans', sans-serif",
                  }}
                >
                  Ver Calendario de Eventos
                  <Calendar size={18} className="group-hover:scale-110 transition-transform" />
                </Link>
                
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Explorar Destinos
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ
          title="Preguntas Frecuentes sobre la Ruta 23"
          subtitle="Todo lo que necesitas saber sobre gastronomía y artesanías del Atlántico"
          faqs={ruta23FAQs}
        />
      </main>

      <Footer />
      
      {/* Modals */}
      <PlatoModal plato={activePlato} isOpen={modalOpen} onClose={closeModal} />
      <EventDrawer event={selectedEvent} isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  );
}