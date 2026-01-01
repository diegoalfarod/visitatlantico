"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  ArrowRight,
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
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventDrawer } from "@/components/EventDrawer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/types/event";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// Dorado accent: #eab308
// =============================================================================

// Tipos
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

// Programas de Ruta 23
const PROGRAMAS = [
  {
    id: "ruta-gastronomica",
    nombre: "Ruta Gastronómica",
    descripcion: "Recorrido por los sabores auténticos del Atlántico, conectando festivales, restaurantes y tradiciones culinarias de los 23 municipios.",
    icon: Utensils,
    color: "#E40E20",
    stats: "50+ platos típicos",
  },
  {
    id: "sello-artesanal", 
    nombre: "Sello Artesanal",
    descripcion: "Programa insignia que impulsa los oficios tradicionales, capacita artesanos y abre mercados internacionales. Presente en 19 países.",
    icon: Palette,
    color: "#eab308",
    stats: "900 artesanos beneficiados",
  },
  {
    id: "feria-ama",
    nombre: "Feria AMA",
    descripcion: "Arte Manual Ancestral - La gran feria artesanal del Caribe que celebra la innovación y tradición con impacto internacional.",
    icon: ShoppingBag,
    color: "#E40E20",
    stats: "$1.000M en ventas 2025",
  },
  {
    id: "yo-emprendo",
    nombre: "Yo Emprendo, Yo Facturo",
    descripcion: "Formación y apoyo a mujeres emprendedoras en los 23 territorios para alcanzar autonomía económica.",
    icon: Users,
    color: "#eab308",
    stats: "23 municipios impactados",
  },
];

// Animaciones
const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: EASE_CINEMATIC }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// Fallback images
const FALLBACK_PLATO_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop";

// =============================================================================
// COMPONENTES
// =============================================================================

// Programa Card
function ProgramaCard({ programa, index }: { programa: typeof PROGRAMAS[0]; index: number }) {
  const Icon = programa.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE_CINEMATIC }}
      className="group"
    >
      <div className="
        relative h-full p-8 rounded-2xl
        bg-white border border-[#C1C5C8]/20
        hover:border-[#E40E20]/30 hover:shadow-xl
        transition-all duration-500
      ">
        {/* Icon */}
        <div 
          className="
            w-14 h-14 rounded-2xl flex items-center justify-center mb-6
            transition-transform duration-300 group-hover:scale-110
          "
          style={{ backgroundColor: `${programa.color}15` }}
        >
          <Icon size={28} style={{ color: programa.color }} />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-[#4A4F55] mb-3 group-hover:text-[#E40E20] transition-colors">
          {programa.nombre}
        </h3>
        <p className="text-[#7A858C] leading-relaxed mb-4">
          {programa.descripcion}
        </p>
        
        {/* Stats badge */}
        <div className="
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-[#FAFAFA] text-sm font-medium text-[#4A4F55]
        ">
          <Star size={14} className="text-[#eab308]" />
          {programa.stats}
        </div>
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
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_CINEMATIC }}
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
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_PLATO_IMAGE;
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Featured badge */}
          {plato.destacado && (
            <div className="absolute top-4 right-4">
              <span className="
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-[#eab308] text-white text-xs font-bold
              ">
                <Star size={12} />
                Destacado
              </span>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="
              px-3 py-1.5 rounded-full text-xs font-medium
              bg-white/95 text-[#4A4F55]
            ">
              {plato.categoria}
            </span>
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white/60 text-sm mb-1 flex items-center gap-1">
              <MapPin size={12} />
              {plato.origen}
            </p>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
              {plato.nombre}
            </h3>
            <p className="text-white/70 text-sm line-clamp-2">{plato.descripcion}</p>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// Event Card for Gastronomic Events
function EventoGastronomicoCard({ 
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
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE_CINEMATIC }}
    >
      <button
        onClick={() => onOpenDrawer(event)}
        className={`
          w-full flex gap-5 p-5 rounded-2xl text-left
          bg-white border border-[#C1C5C8]/20
          hover:border-[#E40E20]/30 hover:shadow-lg
          transition-all duration-300 group
          ${isPast ? "opacity-60" : ""}
        `}
      >
        {/* Image */}
        <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          {!isPast && days <= 7 && (
            <div className="absolute inset-0 bg-[#E40E20]/90 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold">{days}</div>
                <div className="text-[10px] uppercase tracking-wide">días</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-[#4A4F55] group-hover:text-[#E40E20] transition-colors">
                {event.title}
              </h4>
              <p className="text-sm text-[#7A858C] mt-0.5">{event.subtitle}</p>
            </div>
            {event.isFree && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 flex-shrink-0">
                Gratis
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-[#7A858C]">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-[#E40E20]" />
              {event.dates}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#E40E20]" />
              {event.municipality}
            </span>
          </div>
        </div>
        
        <ArrowRight size={18} className="text-[#C1C5C8] group-hover:text-[#E40E20] group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
      </button>
    </motion.div>
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
    const query = `restaurantes "${nombre}" Atlántico Colombia Barranquilla`;
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
            {/* Hero image */}
            <div className="relative h-64 sm:h-80">
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
                <X size={20} className="text-[#4A4F55]" />
              </button>
              
              {plato.destacado && (
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#eab308] text-white font-bold">
                    <Star size={14} />
                    Plato Destacado
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#E40E20]/10 text-[#E40E20]">
                  {plato.categoria}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#FAFAFA] text-[#7A858C] flex items-center gap-1">
                  <MapPin size={12} />
                  {plato.origen}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-[#4A4F55] mb-4">{plato.nombre}</h2>
              <p className="text-[#7A858C] leading-relaxed mb-6">{plato.descripcion}</p>
              
              {plato.ingredientes && plato.ingredientes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#4A4F55] uppercase tracking-wide mb-3">
                    Ingredientes principales
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plato.ingredientes.map((ing, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-[#FAFAFA] text-[#4A4F55]">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {plato.donde_probar && (
                <div className="p-4 rounded-2xl bg-[#FAFAFA] mb-6">
                  <h3 className="text-sm font-semibold text-[#4A4F55] mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-[#E40E20]" />
                    Dónde probarlo
                  </h3>
                  <p className="text-[#7A858C] text-sm">{plato.donde_probar}</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-[#C1C5C8]/20 p-4 sm:p-6 bg-[#FAFAFA]">
              <button
                onClick={() => searchInGoogle(plato.nombre)}
                className="
                  w-full flex items-center justify-center gap-2
                  px-6 py-3 rounded-xl
                  bg-[#E40E20] text-white font-medium
                  hover:bg-[#D31A2B] transition-colors
                "
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
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch platos típicos - MISMA LÓGICA DEL CÓDIGO ORIGINAL
        const platosSnapshot = await getDocs(collection(db, "platos_tipicos"));
        const platosData = platosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imagen: data.imagePath || data.imagen || FALLBACK_PLATO_IMAGE
          };
        }) as PlatoTipico[];
        
        // Fetch eventos gastronómicos (sin filtro complejo para evitar índices)
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const allEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        // Filtrar eventos gastronómicos en el cliente
        const gastroEvents = allEvents
          .filter(e => e.category === "gastronomia")
          .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
        
        setPlatosTipicos(platosData);
        setEventosGastronomicos(gastroEvents);
        
        // Extraer categorías únicas - MISMA LÓGICA DEL CÓDIGO ORIGINAL
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
  
  // Filtrar platos
  const platosFiltrados = filtroCategoria === "Todos"
    ? platosTipicos
    : platosTipicos.filter(p => p.categoria?.toLowerCase() === filtroCategoria.toLowerCase());
  
  const platosVisibles = showAllPlatos ? platosFiltrados : platosFiltrados.slice(0, 8);
  
  // Modal handlers
  const openModal = (plato: PlatoTipico) => {
    setActivePlato(plato);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setActivePlato(null), 300);
  };
  
  // Drawer handlers
  const openDrawer = (event: Event) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };
  
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white" style={{ paddingTop: 'var(--navbar-height, 80px)' }}>
        {/* ============================================================= */}
        {/* HERO SECTION */}
        {/* ============================================================= */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]" />
          
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#E40E20]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#eab308]/15 rounded-full blur-2xl" />
          
          <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 mb-6">
                  <Award size={16} className="text-[#eab308]" />
                  <span className="text-sm font-medium">Iniciativa de la Primera Gestora Social</span>
                </div>
                
                {/* Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                  Ruta
                  <span className="text-[#E40E20]"> 23</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-xl">
                  Descubre los <strong className="text-[#eab308]">23 municipios</strong> del Atlántico 
                  a través de su gastronomía, artesanías y cultura. Una ruta que conecta 
                  tradición, sabor e identidad.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-10">
                  <div>
                    <div className="text-4xl font-bold text-[#E40E20]">23</div>
                    <div className="text-white/60 text-sm">Municipios</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#eab308]">900+</div>
                    <div className="text-white/60 text-sm">Artesanos</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white">19</div>
                    <div className="text-white/60 text-sm">Países alcanzados</div>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => document.getElementById('platos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="
                      inline-flex items-center gap-3 px-8 py-4 rounded-full
                      bg-[#E40E20] text-white font-semibold
                      hover:bg-[#D31A2B] transition-colors group
                    "
                  >
                    Explorar Sabores
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => document.getElementById('programas')?.scrollIntoView({ behavior: 'smooth' })}
                    className="
                      inline-flex items-center gap-3 px-8 py-4 rounded-full
                      bg-white/10 text-white font-semibold backdrop-blur-sm
                      hover:bg-white/20 transition-colors
                    "
                  >
                    Ver Programas
                  </button>
                </div>
              </motion.div>
              
              {/* Image/Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE_CINEMATIC }}
                className="relative hidden lg:block"
              >
                <div className="relative">
                  {/* Main image placeholder - could be a map or collage */}
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#E40E20]/20 to-[#eab308]/20 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <Globe size={80} className="text-white/40 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">
                        Conectando tradiciones<br />del Atlántico al mundo
                      </p>
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <motion.div
                    initial={{ rotate: -6 }}
                    animate={{ rotate: -6, y: [0, -10, 0] }}
                    transition={{ y: { duration: 3, repeat: Infinity } }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E40E20] to-[#eab308] flex items-center justify-center">
                        <Heart size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#4A4F55]">Liliana Borrero</div>
                        <div className="text-xs text-[#7A858C]">Primera Gestora Social</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg className="relative block w-full h-16 sm:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity=".3"/>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,googl224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff"/>
            </svg>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* PROGRAMAS SECTION */}
        {/* ============================================================= */}
        <section id="programas" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#E40E20]" />
                <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">
                  Nuestros Programas
                </span>
                <div className="w-8 h-px bg-[#E40E20]" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-[#4A4F55] mb-6">
                Construyendo un <span className="text-[#E40E20]">Atlántico</span>
                <br />para el mundo
              </h2>
              
              <p className="text-[#7A858C] text-lg max-w-3xl mx-auto">
                Ruta 23 integra programas que impulsan el turismo, la gastronomía, 
                las artesanías y el emprendimiento en los 23 municipios del departamento.
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROGRAMAS.map((programa, i) => (
                <ProgramaCard key={programa.id} programa={programa} index={i} />
              ))}
            </div>
          </div>
        </section>
        
        {/* ============================================================= */}
        {/* EVENTOS GASTRONÓMICOS */}
        {/* ============================================================= */}
        {eventosGastronomicos.length > 0 && (
          <section className="py-24 bg-[#FAFAFA]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#E40E20]" />
                  <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">
                    Agenda Gastronómica
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-bold text-[#4A4F55]">
                      Festivales <span className="text-[#E40E20]">Gastronómicos</span>
                    </h2>
                    <p className="text-[#7A858C] mt-2">
                      Celebraciones que honran la tradición culinaria del Atlántico
                    </p>
                  </div>
                  
                  <Link
                    href="/eventos?categoria=gastronomia"
                    className="inline-flex items-center gap-2 text-sm text-[#E40E20] hover:underline group"
                  >
                    Ver todos los eventos
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
              
              <div className="grid lg:grid-cols-2 gap-4">
                {eventosGastronomicos.slice(0, 4).map((event, i) => (
                  <EventoGastronomicoCard
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
        <section id="platos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#E40E20]" />
                <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">
                  Ruta Gastronómica
                </span>
                <div className="w-8 h-px bg-[#E40E20]" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-[#4A4F55] mb-6">
                Platos <span className="text-[#E40E20]">Típicos</span>
              </h2>
              
              <p className="text-[#7A858C] text-lg max-w-2xl mx-auto mb-10">
                Descubre los sabores que definen la identidad culinaria del Atlántico, 
                desde el mar hasta cada rincón de nuestros municipios.
              </p>
              
              {/* Filtros */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setFiltroCategoria("Todos")}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${filtroCategoria === "Todos"
                      ? "bg-[#E40E20] text-white shadow-lg shadow-red-500/25"
                      : "bg-white text-[#4A4F55] border border-[#C1C5C8]/30 hover:border-[#E40E20]/50"
                    }
                  `}
                >
                  Todos ({platosTipicos.length})
                </button>
                
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-medium transition-all
                      ${filtroCategoria === cat
                        ? "bg-[#E40E20] text-white shadow-lg shadow-red-500/25"
                        : "bg-white text-[#4A4F55] border border-[#C1C5C8]/30 hover:border-[#E40E20]/50"
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Grid de platos */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#E40E20] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : platosFiltrados.length === 0 ? (
              <div className="text-center py-20">
                <Utensils size={48} className="text-[#C1C5C8] mx-auto mb-4" />
                <p className="text-[#7A858C]">No hay platos en esta categoría</p>
              </div>
            ) : (
              <>
                <motion.div
                  key={`${filtroCategoria}-${showAllPlatos}`}
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
                
                {/* Ver más */}
                {platosFiltrados.length > 8 && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => setShowAllPlatos(!showAllPlatos)}
                      className="
                        inline-flex items-center gap-2 px-8 py-3 rounded-full
                        border-2 border-[#C1C5C8]/30 text-[#4A4F55] font-medium
                        hover:border-[#E40E20] hover:text-[#E40E20] transition-colors
                      "
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
        {/* CTA SECTION */}
        {/* ============================================================= */}
        <section className="py-24 bg-gradient-to-br from-[#E40E20] to-[#D31A2B] relative overflow-hidden">
          {/* Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Vive la experiencia
                <br />Ruta 23
              </h2>
              
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                Planifica tu recorrido por los sabores, tradiciones y maravillas 
                del Atlántico. Cada municipio tiene una historia que contar.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/eventos"
                  className="
                    inline-flex items-center gap-3 px-8 py-4 rounded-full
                    bg-white text-[#E40E20] font-semibold
                    hover:shadow-xl transition-all group
                  "
                >
                  Ver Calendario de Eventos
                  <Calendar size={18} className="group-hover:scale-110 transition-transform" />
                </Link>
                
                <Link
                  href="/destinations"
                  className="
                    inline-flex items-center gap-3 px-8 py-4 rounded-full
                    bg-white/10 text-white font-semibold backdrop-blur-sm
                    hover:bg-white/20 transition-colors
                  "
                >
                  Explorar Destinos
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <PlatoModal plato={activePlato} isOpen={modalOpen} onClose={closeModal} />
      <EventDrawer event={selectedEvent} isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  );
}