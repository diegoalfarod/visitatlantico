"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import type { Event, EventCategory } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";
import { EventDrawer } from "@/components/EventDrawer";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/schemas/FAQSchema";
import RelatedContent from "@/components/RelatedContent";

// =============================================================================
// DESIGN SYSTEM - VisitAtlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#0f0f1a",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// =============================================================================
// CONSTANTS
// =============================================================================
const EVENTS_PER_PAGE = 12;

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
};

const MONTH_SHORT: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic"
};

// =============================================================================
// HELPERS
// =============================================================================
function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number): string {
  if (days < 0) return "Finalizado";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days <= 7) return `${days} días`;
  if (days <= 30) return `${Math.ceil(days / 7)} semanas`;
  return `${Math.ceil(days / 30)} meses`;
}

function formatDateRange(dateStart: string, dateEnd?: string): string {
  const start = new Date(dateStart);
  const startDay = start.getDate();
  const startMonth = MONTH_SHORT[String(start.getMonth() + 1).padStart(2, '0')];
  
  if (!dateEnd || dateEnd === dateStart) {
    return `${startDay} ${startMonth}`;
  }
  
  const end = new Date(dateEnd);
  const endDay = end.getDate();
  const endMonth = MONTH_SHORT[String(end.getMonth() + 1).padStart(2, '0')];
  
  if (startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

// =============================================================================
// FEATURED EVENT CARD - Editorial spotlight design
// =============================================================================
interface FeaturedEventProps {
  event: Event;
  onClick: () => void;
}

function FeaturedEvent({ event, onClick }: FeaturedEventProps) {
  const days = getDaysUntil(event.dateStart);
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="group relative"
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900">
          <div className="grid lg:grid-cols-2 min-h-[480px]">
            {/* Image Side */}
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/90 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent lg:hidden" />
              
              {/* Countdown Badge */}
              {days >= 0 && days <= 30 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-6 left-6"
                >
                  <div 
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md flex items-center gap-2"
                    style={{
                      background: days <= 7 
                        ? `linear-gradient(135deg, ${COLORS.rojoCayena}, ${COLORS.naranjaSalinas})`
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    {formatCountdown(days)}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Content Side */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-center">
              {/* Category & Free Badge */}
              <div className="flex items-center gap-3 mb-6">
                {category && (
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/90"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-lg">{category.emoji}</span>
                    {category.label}
                  </span>
                )}
                {event.isFree && (
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: COLORS.verdeBijao,
                      color: "white",
                    }}
                  >
                    Gratis
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {event.title}
              </h2>
              
              {/* Subtitle */}
              {event.subtitle && (
                <p 
                  className="text-xl text-white/60 mb-8"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {event.subtitle}
                </p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/70 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Calendar size={18} style={{ color: COLORS.naranjaSalinas }} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>Fecha</p>
                    <p className="text-white font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {event.dates || formatDateRange(event.dateStart, event.dateEnd)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin size={18} style={{ color: COLORS.naranjaSalinas }} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>Lugar</p>
                    <p className="text-white font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div 
                className="inline-flex items-center gap-3 font-semibold text-lg group/btn"
                style={{ color: COLORS.naranjaSalinas }}
              >
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>Ver detalles del evento</span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

// =============================================================================
// EVENT CARD - Clean modern design
// =============================================================================
interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
}

function EventCard({ event, index, onClick }: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  
  const days = getDaysUntil(event.dateStart);
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;
  const isPast = days < 0;
  
  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
    >
      <button
        onClick={onClick}
        className={`w-full text-left group ${isPast ? "opacity-50 grayscale-[30%]" : ""}`}
      >
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {!isPast && days <= 14 && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: days <= 7 
                      ? `linear-gradient(135deg, ${COLORS.rojoCayena}, ${COLORS.naranjaSalinas})`
                      : "rgba(0,0,0,0.5)",
                  }}
                >
                  {formatCountdown(days)}
                </span>
              )}
              {event.isFree && (
                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white ml-auto"
                  style={{ backgroundColor: COLORS.verdeBijao }}
                >
                  Gratis
                </span>
              )}
            </div>
            
            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <Calendar size={14} />
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {event.dates || formatDateRange(event.dateStart, event.dateEnd)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {/* Category */}
            {category && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{category.emoji}</span>
                <span 
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: COLORS.azulBarranquero, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {category.label}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h3 
              className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {event.title}
            </h3>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin size={14} />
              <span className="truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {event.municipality}
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

// =============================================================================
// FILTER CHIP COMPONENT
// =============================================================================
interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  emoji?: string;
}

function FilterChip({ label, isActive, onClick, emoji }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap 
        transition-all duration-300 border
        ${isActive 
          ? "text-white border-transparent shadow-lg scale-[1.02]" 
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
      style={{
        backgroundColor: isActive ? COLORS.naranjaSalinas : undefined,
        boxShadow: isActive ? `0 4px 20px ${COLORS.naranjaSalinas}40` : undefined,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
    </button>
  );
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <nav className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginación">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Página anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, idx) => (
          page === "..." ? (
            <span 
              key={`ellipsis-${idx}`} 
              className="px-3 py-2 text-slate-400"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                min-w-[44px] h-11 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                ${currentPage === page 
                  ? "text-white shadow-lg" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
              style={{
                backgroundColor: currentPage === page ? COLORS.naranjaSalinas : undefined,
                boxShadow: currentPage === page ? `0 4px 15px ${COLORS.naranjaSalinas}40` : undefined,
                fontFamily: "'Montserrat', sans-serif",
              }}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Página siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
interface EventsPageClientProps {
  initialEvents: Event[];
}

export default function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Generate month options from events
  const monthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    initialEvents.forEach(event => {
      if (event.dateStart) {
        const month = event.dateStart.substring(0, 7);
        monthsSet.add(month);
      }
    });
    return Array.from(monthsSet).sort();
  }, [initialEvents]);
  
  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialEvents.forEach(event => {
      if (event.category) {
        counts[event.category] = (counts[event.category] || 0) + 1;
      }
    });
    return counts;
  }, [initialEvents]);
  
  // Filter events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (selectedMonth && !event.dateStart.startsWith(selectedMonth)) return false;
      if (selectedCategory && event.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          event.title.toLowerCase().includes(query) ||
          event.subtitle?.toLowerCase().includes(query) ||
          event.municipality.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [initialEvents, selectedMonth, selectedCategory, searchQuery]);
  
  // Separate upcoming and past events
  const upcomingEvents = useMemo(() => 
    filteredEvents.filter(e => getDaysUntil(e.dateStart) >= 0)
      .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()),
    [filteredEvents]
  );
  
  const pastEvents = useMemo(() => 
    filteredEvents.filter(e => getDaysUntil(e.dateStart) < 0)
      .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()),
    [filteredEvents]
  );
  
  // Featured event (next upcoming) - only show when no filters
  const featuredEvent = !selectedMonth && !selectedCategory && !searchQuery ? upcomingEvents[0] : null;
  const remainingUpcoming = featuredEvent ? upcomingEvents.slice(1) : upcomingEvents;
  
  // Combine for pagination
  const paginatedEvents = [...remainingUpcoming, ...pastEvents];
  const totalPages = Math.ceil(paginatedEvents.length / EVENTS_PER_PAGE);
  const currentEvents = paginatedEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );
  
  // Reset page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const handleMonthChange = (month: string | null) => {
    setSelectedMonth(month);
    handleFilterChange();
  };
  
  const handleCategoryChange = (category: EventCategory | null) => {
    setSelectedCategory(category);
    handleFilterChange();
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };
  
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  const activeFiltersCount = [selectedMonth, selectedCategory, searchQuery].filter(Boolean).length;

  // FAQs data
  const eventosFAQs = [
    {
      question: "¿Cuándo es el Carnaval de Barranquilla 2026?",
      answer:
        "El Carnaval de Barranquilla 2026 se celebra del <strong>14 al 17 de febrero de 2026</strong>. Los eventos pre-carnaval inician en enero con la Lectura del Bando y coronación de reyes. Los 4 días oficiales incluyen: Batalla de Flores (sábado 14), Gran Parada de Tradición (domingo 15), Gran Parada de Fantasía (lunes 16) y Muerte de Joselito (martes 17).",
    },
    {
      question: "¿Dónde puedo ver eventos gratuitos en el Atlántico?",
      answer:
        "El Atlántico ofrece múltiples eventos gratuitos durante todo el año:<br/><br/><strong>• Carnaval de Barranquilla:</strong> Desfiles en las calles (sin costo), aunque las palcos tienen precio.<br/><strong>• Festivales municipales:</strong> Mayoría de festivales gastronómicos son de entrada libre.<br/><strong>• Eventos culturales:</strong> Museo del Caribe, eventos en plazas públicas.<br/><strong>• Fechas especiales:</strong> Día de la Independencia, festividades religiosas.<br/><br/>Filtra por 'Eventos Gratuitos' en nuestra agenda para ver la lista completa.",
    },
    {
      question: "¿Qué festivales gastronómicos hay en el Atlántico?",
      answer:
        "El Atlántico es famoso por sus festivales gastronómicos:<br/><br/><strong>• Festival del Bollo:</strong> Juan de Acosta - Septiembre<br/><strong>• Festival del Mango:</strong> Luruaco - Julio<br/><strong>• Festival del Sancocho:</strong> Sabanagrande - Agosto<br/><strong>• Ruta 23 Gastronómica:</strong> 18 festivales en diferentes municipios<br/><strong>• Festival del Chicharrón:</strong> Palmar de Varela<br/><strong>• Festival de la Butifarra:</strong> Soledad<br/><br/>Cada festival celebra la tradición culinaria local con degustaciones, concursos y música en vivo.",
    },
    {
      question: "¿Cómo compro boletos para los eventos?",
      answer:
        "Las boleterías varían según el evento:<br/><br/><strong>Carnaval de Barranquilla:</strong> Palcos oficiales en <a href='https://www.carnavaldebarranquilla.org' target='_blank' rel='noopener' style='color: #EA5B13; text-decoration: underline;'>carnavaldebarranquilla.org</a> desde diciembre.<br/><strong>Eventos en vivo:</strong> TuBoleta, Eticket, puntos de venta autorizados.<br/><strong>Festivales municipales:</strong> Generalmente entrada libre o taquilla presencial.<br/><strong>Conciertos:</strong> Plataformas digitales o taquillas de venue.<br/><br/>Consulta los detalles de cada evento en nuestra agenda para enlaces directos de compra.",
    },
    {
      question: "¿Cuál es la mejor época para visitar el Atlántico?",
      answer:
        "El Atlántico es destino de sol todo el año, pero estas son las mejores épocas:<br/><br/><strong>Diciembre - Marzo (Temporada alta):</strong><br/>• Menos lluvias, clima perfecto para playas<br/>• Carnaval de Barranquilla en febrero<br/>• Temperaturas 28-32°C<br/><br/><strong>Junio - Agosto (Temporada media):</strong><br/>• Festivales gastronómicos en municipios<br/>• Buen clima, menos turistas<br/><br/><strong>Septiembre - Noviembre (Temporada baja):</strong><br/>• Precios más económicos<br/>• Lluvias ocasionales (principalmente tardes)<br/>• Eventos culturales locales<br/><br/><strong>Eventos especiales:</strong> Planifica para fechas específicas como Carnaval, Semana Santa, o festivales municipales según tus intereses.",
    },
  ];

  return (
    <>
      {/* Schema.org FAQ */}
      <FAQSchema faqs={eventosFAQs} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ name: "Eventos", url: "https://visitatlantico.com/eventos" }]}
      />

      <main className="min-h-screen bg-[#fafafa]">
        {/* ================================================================
            HERO SECTION
            ================================================================ */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundColor: COLORS.grisOscuro }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-15 blur-[120px]"
              style={{ background: COLORS.naranjaSalinas }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]"
              style={{ background: COLORS.azulBarranquero }}
            />
            {/* Grain overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
            <div ref={headerRef} className="max-w-4xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Calendar size={16} style={{ color: COLORS.naranjaSalinas }} />
                <span 
                  className="text-sm font-medium text-white/70"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Agenda Cultural 2025
                </span>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Eventos del{" "}
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.amarilloArepa})` }}
                >
                  Atlántico
                </span>
              </motion.h1>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-white/50 max-w-2xl leading-relaxed"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Carnavales, festivales, tradiciones y experiencias únicas que hacen del Caribe colombiano un destino inolvidable.
              </motion.p>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-10 mt-12"
              >
                {[
                  { value: upcomingEvents.length, label: "Próximos", color: COLORS.naranjaSalinas },
                  { value: initialEvents.filter(e => e.isFree).length, label: "Gratuitos", color: COLORS.verdeBijao },
                  { value: Object.keys(categoryCounts).length, label: "Categorías", color: "white" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p 
                      className="text-4xl font-bold"
                      style={{ fontFamily: "'Josefin Sans', sans-serif", color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p 
                      className="text-white/40 text-sm mt-1"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================
            STICKY FILTERS BAR
            ================================================================ */}
        <section className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Left: Search + Mobile Filter Toggle */}
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                    className="w-full pl-12 pr-10 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); handleFilterChange(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X size={14} className="text-slate-400" />
                    </button>
                  )}
                </div>
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal size={18} />
                  {activeFiltersCount > 0 && (
                    <span 
                      className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: COLORS.naranjaSalinas }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Right: Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3 overflow-x-auto pb-1 -mb-1">
                {/* Month Chips */}
                <div className="flex items-center gap-2">
                  <FilterChip
                    label="Todos"
                    isActive={!selectedMonth}
                    onClick={() => handleMonthChange(null)}
                    emoji="📅"
                  />
                  {monthOptions.slice(0, 6).map(month => {
                    const [, m] = month.split("-");
                    return (
                      <FilterChip
                        key={month}
                        label={MONTH_SHORT[m]}
                        isActive={selectedMonth === month}
                        onClick={() => handleMonthChange(selectedMonth === month ? null : month)}
                      />
                    );
                  })}
                </div>
                
                {/* Separator */}
                <div className="w-px h-8 bg-slate-200 mx-2" />
                
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => handleCategoryChange((e.target.value as EventCategory) || null)}
                    className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <option value="">Todas las categorías</option>
                    {Object.entries(EVENT_CATEGORIES).map(([id, { label, emoji }]) => (
                      <option key={id} value={id}>
                        {emoji} {label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
                
                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: COLORS.rojoCayena, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <X size={14} />
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Filters Expanded */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden overflow-hidden"
                >
                  <div className="pt-4 space-y-4 border-t border-slate-100 mt-4">
                    {/* Months */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Mes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <FilterChip label="Todos" isActive={!selectedMonth} onClick={() => handleMonthChange(null)} emoji="📅" />
                        {monthOptions.map(month => {
                          const [year, m] = month.split("-");
                          return (
                            <FilterChip
                              key={month}
                              label={`${MONTH_SHORT[m]} '${year.slice(2)}`}
                              isActive={selectedMonth === month}
                              onClick={() => handleMonthChange(selectedMonth === month ? null : month)}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Categories */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Categoría
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <FilterChip label="Todas" isActive={!selectedCategory} onClick={() => handleCategoryChange(null)} />
                        {Object.entries(EVENT_CATEGORIES).map(([id, { label, emoji }]) => (
                          <FilterChip
                            key={id}
                            label={label}
                            emoji={emoji}
                            isActive={selectedCategory === id}
                            onClick={() => handleCategoryChange(selectedCategory === id ? null : id as EventCategory)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ================================================================
            EVENTS CONTENT
            ================================================================ */}
        <section ref={resultsRef} className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 scroll-mt-24">
          {filteredEvents.length > 0 ? (
            <div className="space-y-16">
              {/* Featured Event */}
              {featuredEvent && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}20, ${COLORS.rojoCayena}20)` }}
                    >
                      <Sparkles size={20} style={{ color: COLORS.naranjaSalinas }} />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Próximo evento destacado
                    </h2>
                  </div>
                  <FeaturedEvent event={featuredEvent} onClick={() => handleEventClick(featuredEvent)} />
                </div>
              )}
              
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 
                    className="text-xl font-bold text-slate-800"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    {activeFiltersCount > 0 ? "Resultados de búsqueda" : "Todos los eventos"}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Mostrando {currentEvents.length} de {paginatedEvents.length} eventos
                  </p>
                </div>
              </div>
              
              {/* Events Grid */}
              {currentEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
                style={{ background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}15, ${COLORS.rojoCayena}15)` }}
              >
                <Calendar size={40} style={{ color: COLORS.naranjaSalinas }} />
              </div>
              <h3 
                className="text-2xl font-bold text-slate-800 mb-3"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                No encontramos eventos
              </h3>
              <p 
                className="text-slate-500 mb-8 max-w-md mx-auto"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Intenta ajustar tus filtros o busca con otros términos para descubrir eventos increíbles.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:shadow-xl hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Ver todos los eventos
              </button>
            </motion.div>
          )}
        </section>

        {/* ================================================================
            FAQ SECTION
            ================================================================ */}
        <section className="bg-white py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <FAQ faqs={eventosFAQs} />
          </div>
        </section>

        {/* ================================================================
            CTA SECTION
            ================================================================ */}
        <section className="bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 lg:p-12 rounded-3xl" style={{ backgroundColor: COLORS.grisOscuro }}>
              <div className="text-center lg:text-left">
                <h2
                  className="text-2xl lg:text-3xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  ¿Organizas un evento en el Atlántico?
                </h2>
                <p
                  className="text-white/50 max-w-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Contáctanos para incluir tu evento en nuestra agenda cultural y llegar a miles de visitantes.
                </p>
              </div>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] group"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Contactar
                <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Related Content */}
      <RelatedContent
        title="Explora más del Atlántico"
        items={[
          {
            title: "Carnaval de Barranquilla 2026",
            description:
              "El segundo carnaval más grande del mundo. 4 días de fiesta, cultura y tradición caribeña.",
            url: "/carnaval",
            image: "/images/carnaval-batalla-flores.jpg",
            category: "Eventos",
          },
          {
            title: "Playas del Atlántico",
            description:
              "Descubre playas Blue Flag, kitesurf en Puerto Velero y paraísos caribeños.",
            url: "/playas",
            image: "/images/playas-atlantico-hero.jpg",
            category: "Naturaleza",
          },
          {
            title: "Ruta 23 Gastronómica",
            description:
              "18 festivales gastronómicos que celebran los sabores auténticos del Caribe.",
            url: "/ruta23",
            image:
              "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
            category: "Gastronomía",
          },
        ]}
      />
      
      <EventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
      
      {/* Global Styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}