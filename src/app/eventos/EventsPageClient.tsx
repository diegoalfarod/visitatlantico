"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Search,
  X,
  Filter,
  Grid3X3,
  List,
  ChevronDown
} from "lucide-react";
import type { Event, EventCategory } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";
import { EventDrawer } from "@/components/EventDrawer";

// =============================================================================
// PALETA INSTITUCIONAL
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

interface EventsPageClientProps {
  initialEvents: Event[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

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

const CATEGORIES_LIST: { id: EventCategory | null; label: string; emoji: string }[] = [
  { id: null, label: "Todas las categorías", emoji: "📅" },
  ...Object.entries(EVENT_CATEGORIES).map(([id, { label, emoji }]) => ({
    id: id as EventCategory,
    label,
    emoji,
  })),
];

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
  if (days <= 7) return `En ${days} días`;
  if (days <= 30) return `En ${Math.ceil(days / 7)} sem`;
  return `En ${Math.ceil(days / 30)} mes`;
}

// =============================================================================
// FILTER DROPDOWN COMPONENT
// =============================================================================

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { id: string | null; label: string; emoji?: string; short?: string }[];
  onChange: (value: string | null) => void;
  icon?: React.ReactNode;
}

function FilterDropdown({ label, value, options, onChange, icon }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close on click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  
  // Setup click outside listener
  if (typeof window !== "undefined") {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }
  
  const selectedOption = options.find(o => o.id === value) || options[0];
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 whitespace-nowrap
          ${isOpen 
            ? "bg-[#E40E20] text-white" 
            : "bg-white border border-[#C1C5C8]/30 text-[#4A4F55] hover:border-[#E40E20]/50"
          }
        `}
      >
        {icon}
        <span className="hidden sm:inline">{selectedOption.label}</span>
        <span className="sm:hidden">{selectedOption.short || selectedOption.emoji || label}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 mt-2
              min-w-[220px] max-h-[320px] overflow-y-auto
              bg-white rounded-xl shadow-2xl border border-[#C1C5C8]/20
              py-2 z-[100]
            "
          >
            {options.map((option) => (
              <button
                key={option.id || "all"}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                  transition-colors
                  ${option.id === value 
                    ? "bg-[#E40E20]/10 text-[#E40E20] font-medium" 
                    : "text-[#4A4F55] hover:bg-[#FAFAFA]"
                  }
                `}
              >
                {option.emoji && <span>{option.emoji}</span>}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// EVENT CARD COMPONENT
// =============================================================================

interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
  viewMode: "grid" | "list";
}

function EventCard({ event, index, onClick, viewMode }: EventCardProps) {
  const days = getDaysUntil(event.dateStart);
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;
  const isPast = days < 0;
  
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        <button
          onClick={onClick}
          className={`
            w-full flex gap-4 sm:gap-6 p-4 rounded-2xl text-left
            bg-white border border-[#C1C5C8]/20
            hover:border-[#E40E20]/30 hover:shadow-lg
            transition-all duration-300 group
            ${isPast ? "opacity-60" : ""}
          `}
        >
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {!isPast && days <= 7 && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#E40E20] text-white">
                  {formatCountdown(days)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#4A4F55] group-hover:text-[#E40E20] transition-colors truncate">
                  {event.title}
                </h3>
                <p className="text-sm text-[#7A858C] mt-0.5">{event.subtitle}</p>
              </div>
              {category && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-[#7A858C] flex-shrink-0">
                  {category.emoji} {category.label}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#7A858C]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#E40E20]" />
                {event.dates}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#E40E20]" />
                {event.municipality}
              </span>
              {event.isFree && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Gratis
                </span>
              )}
            </div>
          </div>
        </button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <button
        onClick={onClick}
        className={`
          w-full text-left group
          ${isPast ? "opacity-60" : ""}
        `}
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {!isPast && days <= 14 && (
              <span className={`
                px-3 py-1.5 rounded-full text-xs font-semibold
                ${days <= 7 ? "bg-[#E40E20] text-white" : "bg-white/95 text-[#4A4F55]"}
              `}>
                {formatCountdown(days)}
              </span>
            )}
            {category && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/95 text-[#4A4F55] ml-auto">
                {category.emoji}
              </span>
            )}
          </div>
          
          {event.isFree && (
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-white">
                Gratis
              </span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white/60 text-sm mb-1">
              {event.dates} · {event.municipality}
            </p>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-white/70 text-sm line-clamp-1">{event.subtitle}</p>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  
  // Generar meses dinámicamente desde los eventos
  const monthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    initialEvents.forEach(event => {
      if (event.dateStart) {
        const month = event.dateStart.substring(0, 7); // "2026-01"
        monthsSet.add(month);
      }
    });
    
    const sortedMonths = Array.from(monthsSet).sort();
    
    return [
      { id: null, label: "Todos los meses", short: "Todos", emoji: "📅" },
      ...sortedMonths.map(m => {
        const [year, month] = m.split("-");
        return {
          id: m,
          label: `${MONTH_NAMES[month]} ${year}`,
          short: MONTH_SHORT[month],
          emoji: undefined
        };
      })
    ];
  }, [initialEvents]);
  
  // Filter events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (selectedMonth && !event.dateStart.startsWith(selectedMonth)) {
        return false;
      }
      
      if (selectedCategory && event.category !== selectedCategory) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesSubtitle = event.subtitle?.toLowerCase().includes(query) || false;
        const matchesMunicipality = event.municipality.toLowerCase().includes(query);
        const matchesLocation = event.location.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesSubtitle && !matchesMunicipality && !matchesLocation) {
          return false;
        }
      }
      
      return true;
    });
  }, [initialEvents, selectedMonth, selectedCategory, searchQuery]);
  
  const upcomingEvents = filteredEvents.filter(e => getDaysUntil(e.dateStart) >= 0);
  const pastEvents = filteredEvents.filter(e => getDaysUntil(e.dateStart) < 0);
  
  const activeFiltersCount = [selectedMonth, selectedCategory, searchQuery].filter(Boolean).length;
  
  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedCategory(null);
    setSearchQuery("");
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };
  
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  return (
    <>
      <main className="min-h-screen bg-[#FAFAFA]">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E40E20]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E40E20]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
              >
                <ArrowLeft size={16} />
                Volver al inicio
              </Link>
            </motion.div>
            
            <div ref={headerRef}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#E40E20]" />
                  <span className="text-white/50 text-sm tracking-[0.2em] uppercase">
                    Agenda Cultural
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
                  Eventos del
                  <br />
                  <span className="text-[#E40E20]">Atlántico</span>
                </h1>
                
                <p className="text-white/60 text-lg max-w-2xl">
                  Descubre festivales, carnavales, eventos culturales y tradiciones 
                  que hacen del Atlántico un destino único.
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-8 mt-10"
            >
              <div>
                <p className="text-3xl font-bold text-white">{initialEvents.length}</p>
                <p className="text-white/50 text-sm">Eventos totales</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#E40E20]">{upcomingEvents.length}</p>
                <p className="text-white/50 text-sm">Próximos eventos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {initialEvents.filter(e => e.isFree).length}
                </p>
                <p className="text-white/50 text-sm">Eventos gratuitos</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Filters Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C1C5C8]/20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A858C]" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full pl-11 pr-4 py-2.5 rounded-xl text-sm
                    bg-[#FAFAFA] border border-[#C1C5C8]/30
                    text-[#4A4F55] placeholder-[#7A858C]
                    focus:outline-none focus:border-[#E40E20] focus:bg-white
                    transition-colors
                  "
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#C1C5C8]/20 rounded-full"
                  >
                    <X size={14} className="text-[#7A858C]" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <FilterDropdown
                  label="Mes"
                  value={selectedMonth || ""}
                  options={monthOptions.map(m => ({ ...m, id: m.id || "" }))}
                  onChange={(v) => setSelectedMonth(v || null)}
                  icon={<Calendar size={16} />}
                />
                
                <FilterDropdown
                  label="Categoría"
                  value={selectedCategory || ""}
                  options={CATEGORIES_LIST.map(c => ({ ...c, id: c.id || "" }))}
                  onChange={(v) => setSelectedCategory((v as EventCategory) || null)}
                  icon={<Filter size={16} />}
                />
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="
                      flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
                      text-[#E40E20] hover:bg-[#E40E20]/10 transition-colors
                    "
                  >
                    <X size={14} />
                    Limpiar ({activeFiltersCount})
                  </button>
                )}
                
                <div className="hidden sm:flex items-center gap-1 ml-auto bg-[#FAFAFA] rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${viewMode === "grid" 
                        ? "bg-white text-[#E40E20] shadow-sm" 
                        : "text-[#7A858C] hover:text-[#4A4F55]"
                      }
                    `}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${viewMode === "list" 
                        ? "bg-white text-[#E40E20] shadow-sm" 
                        : "text-[#7A858C] hover:text-[#4A4F55]"
                      }
                    `}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Events Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[#7A858C] text-sm">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""} encontrado{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          {filteredEvents.length > 0 ? (
            <div className="space-y-16">
              {upcomingEvents.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#4A4F55] mb-6">
                    Próximos eventos
                  </h2>
                  
                  <div className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }>
                    {upcomingEvents.map((event, i) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={i}
                        onClick={() => handleEventClick(event)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
              
              {pastEvents.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#4A4F55] mb-2">
                    Eventos pasados
                  </h2>
                  <p className="text-[#7A858C] text-sm mb-6">
                    Estos eventos ya finalizaron, pero volverán el próximo año.
                  </p>
                  
                  <div className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }>
                    {pastEvents.map((event, i) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={i}
                        onClick={() => handleEventClick(event)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-[#E40E20]/10 flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-[#E40E20]" />
              </div>
              <h3 className="text-xl font-bold text-[#4A4F55] mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-[#7A858C] mb-6 max-w-md mx-auto">
                No hay eventos que coincidan con tus filtros. 
                Intenta ajustar tu búsqueda o explorar otras categorías.
              </p>
              <button
                onClick={clearFilters}
                className="
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-[#E40E20] text-white font-medium
                  hover:bg-[#D31A2B] transition-colors
                "
              >
                Ver todos los eventos
              </button>
            </motion.div>
          )}
        </div>
      </main>
      
      <EventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}