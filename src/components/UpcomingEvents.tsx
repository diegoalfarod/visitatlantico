"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Clock, Ticket, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { GiCarnivalMask } from "react-icons/gi";
import type { Event } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";
import { EventDrawer } from "./EventDrawer";

// =============================================================================
// PALETA
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  grisOscuro: "#4A4F55",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
};

// =============================================================================
// TYPES
// =============================================================================
interface UpcomingEventsProps {
  events?: Event[];
}

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
  if (days === 0) return "¡Hoy!";
  if (days === 1) return "Mañana";
  if (days <= 7) return `${days} días`;
  if (days <= 30) return `${Math.ceil(days / 7)} sem`;
  return `${Math.ceil(days / 30)} mes`;
}

// =============================================================================
// HERO SPOTLIGHT - Full width con contenido superpuesto
// =============================================================================
function HeroSpotlight({ 
  event, 
  onClick 
}: { 
  event: Event; 
  onClick: () => void;
}) {
  const days = getDaysUntil(event.dateStart);
  const isUrgent = days >= 0 && days <= 7;
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;

  return (
    <motion.div
      className="relative w-full cursor-pointer group"
      style={{ height: 'clamp(400px, 55vh, 600px)' }}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Image - Full bleed */}
      <div className="absolute inset-0">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          priority
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-black/30" />
      
      {/* Vignette */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)' }} />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-10 sm:pb-14 lg:pb-16">
          <div className="max-w-2xl">
            {/* Badges */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {days >= 0 && days <= 30 && (
                <motion.span 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: isUrgent 
                      ? `linear-gradient(135deg, ${COLORS.rojoCayena}, #ff4757)` 
                      : `linear-gradient(135deg, ${COLORS.amarilloArepa}, ${COLORS.naranjaSalinas})`,
                    color: '#ffffff',
                    boxShadow: `0 4px 20px ${isUrgent ? 'rgba(211,26,43,0.5)' : 'rgba(243,146,0,0.5)'}`,
                  }}
                  animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {formatCountdown(days)}
                </motion.span>
              )}
              
              {category && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                  }}
                >
                  {category.emoji} {category.label}
                </span>
              )}
              
              {event.isFree && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: COLORS.verdeBijao, color: '#ffffff' }}
                >
                  Gratis
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h3 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-4 leading-[1.1]"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {event.title}
            </motion.h3>
            
            {/* Subtitle */}
            <motion.p 
              className="text-white/80 text-base sm:text-lg lg:text-xl mb-5 line-clamp-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {event.subtitle}
            </motion.p>
            
            {/* Meta Row */}
            <motion.div 
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.dates}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.municipality}
              </span>
              {event.price && (
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  {event.price}
                </span>
              )}
            </motion.div>
            
            {/* CTA */}
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all group/btn"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ 
                background: 'rgba(255,255,255,0.25)',
                scale: 1.02,
              }}
            >
              Ver detalles
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// EVENT CARD - Para carrusel
// =============================================================================
function EventCard({ 
  event, 
  onClick,
}: { 
  event: Event; 
  onClick: () => void;
}) {
  const days = getDaysUntil(event.dateStart);
  const isUrgent = days >= 0 && days <= 7;
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;

  return (
    <motion.div
      className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px] group cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        
        {/* Hover glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{ boxShadow: `inset 0 0 0 2px ${COLORS.amarilloArepa}` }}
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {days >= 0 && days <= 14 && (
            <span 
              className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg"
              style={{
                background: isUrgent 
                  ? `linear-gradient(135deg, ${COLORS.rojoCayena}, #ff4757)` 
                  : 'rgba(255,255,255,0.95)',
                color: isUrgent ? '#ffffff' : COLORS.grisOscuro,
              }}
            >
              {formatCountdown(days)}
            </span>
          )}
          {event.isFree && (
            <span 
              className="px-2.5 py-1 rounded-full text-[11px] font-bold ml-auto"
              style={{ background: COLORS.verdeBijao, color: '#ffffff' }}
            >
              Gratis
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {category && (
            <span 
              className="text-[11px] font-semibold mb-2 inline-block"
              style={{ color: COLORS.amarilloArepa }}
            >
              {category.emoji} {category.label}
            </span>
          )}
          
          <h4 
            className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {event.title}
          </h4>
          
          <div className="flex items-center gap-3 text-[13px] text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {event.dates}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{event.municipality}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MOBILE EVENT CARD - Optimizado para móvil
// =============================================================================
function MobileEventCard({ 
  event, 
  onClick,
}: { 
  event: Event; 
  onClick: () => void;
}) {
  const days = getDaysUntil(event.dateStart);
  const isUrgent = days >= 0 && days <= 7;
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;

  return (
    <motion.div
      className="flex-shrink-0 w-[75vw] max-w-[300px] snap-center"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
        />
        
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {days >= 0 && days <= 14 && (
            <span 
              className="px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: isUrgent 
                  ? `linear-gradient(135deg, ${COLORS.rojoCayena}, #ff4757)` 
                  : 'rgba(255,255,255,0.95)',
                color: isUrgent ? '#ffffff' : COLORS.grisOscuro,
              }}
            >
              {formatCountdown(days)}
            </span>
          )}
          {event.isFree && (
            <span 
              className="px-2.5 py-1 rounded-full text-[11px] font-bold ml-auto"
              style={{ background: COLORS.verdeBijao, color: '#ffffff' }}
            >
              Gratis
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {category && (
            <span 
              className="text-[11px] font-semibold mb-1.5 inline-block"
              style={{ color: COLORS.amarilloArepa }}
            >
              {category.emoji} {category.label}
            </span>
          )}
          
          <h4 
            className="text-lg font-bold text-white leading-tight mb-1.5 line-clamp-2"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {event.title}
          </h4>
          
          <p 
            className="text-white/60 text-sm mb-2 line-clamp-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {event.subtitle}
          </p>
          
          <div className="flex items-center gap-2 text-[12px] text-white/50">
            <Calendar className="w-3 h-3" />
            <span>{event.dates}</span>
            <span>•</span>
            <span>{event.municipality}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// HORIZONTAL SCROLL ROW - Desktop
// =============================================================================
function EventRow({ 
  title,
  icon,
  events, 
  onEventClick,
}: { 
  title: string;
  icon?: React.ReactNode;
  events: Event[];
  onEventClick: (event: Event) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [events]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-5">
        <div className="flex items-center justify-between">
          <h3 
            className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {icon}
            {title}
          </h3>
          <Link 
            href="/eventos"
            className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative group/row">
        {/* Left Arrow - Desktop */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  background: 'rgba(0,0,0,0.7)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow - Desktop */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  background: 'rgba(0,0,0,0.7)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#050a14] to-transparent z-[5] pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#050a14] to-transparent z-[5] pointer-events-none" />

        {/* Cards - Desktop */}
        <div 
          ref={scrollRef}
          className="hidden sm:flex gap-5 overflow-x-auto scrollbar-hide px-6 sm:px-8 lg:px-12 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event) => (
            <EventCard 
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>

        {/* Cards - Mobile */}
        <div 
          className="flex sm:hidden gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((event) => (
            <MobileEventCard 
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MONTH PILLS
// =============================================================================
function MonthPills({ 
  active, 
  onChange,
  options
}: { 
  active: string | null;
  onChange: (month: string | null) => void;
  options: { id: string | null; label: string }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((month) => {
        const isActive = active === month.id;
        return (
          <motion.button
            key={month.id || 'all'}
            onClick={() => onChange(month.id)}
            className="relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              background: isActive 
                ? `linear-gradient(135deg, ${COLORS.amarilloArepa}, ${COLORS.naranjaSalinas})`
                : 'rgba(255,255,255,0.08)',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
              boxShadow: isActive ? `0 4px 20px ${COLORS.amarilloArepa}50` : 'none',
            }}
            whileHover={{ 
              background: isActive 
                ? `linear-gradient(135deg, ${COLORS.amarilloArepa}, ${COLORS.naranjaSalinas})`
                : 'rgba(255,255,255,0.12)',
              color: '#ffffff',
            }}
            whileTap={{ scale: 0.96 }}
          >
            {month.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// =============================================================================
// MOBILE HERO - Versión simplificada para móvil
// =============================================================================
function MobileHero({ 
  event, 
  onClick 
}: { 
  event: Event; 
  onClick: () => void;
}) {
  const days = getDaysUntil(event.dateStart);
  const isUrgent = days >= 0 && days <= 7;
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;

  return (
    <motion.div
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mx-auto max-w-[400px]"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        src={event.image}
        alt={event.title}
        fill
        className="object-cover"
        priority
      />
      
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      {/* Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
        {days >= 0 && days <= 30 && (
          <motion.span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: isUrgent 
                ? `linear-gradient(135deg, ${COLORS.rojoCayena}, #ff4757)` 
                : `linear-gradient(135deg, ${COLORS.amarilloArepa}, ${COLORS.naranjaSalinas})`,
              color: '#ffffff',
            }}
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Clock className="w-3 h-3" />
            {formatCountdown(days)}
          </motion.span>
        )}
        
        {event.isFree && (
          <span 
            className="px-2.5 py-1 rounded-full text-[11px] font-bold ml-auto"
            style={{ background: COLORS.verdeBijao, color: '#ffffff' }}
          >
            Gratis
          </span>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {category && (
          <span 
            className="text-[11px] font-semibold mb-2 inline-block"
            style={{ color: COLORS.amarilloArepa }}
          >
            {category.emoji} {category.label}
          </span>
        )}
        
        <h3 
          className="text-2xl font-bold text-white mb-2 leading-tight"
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          {event.title}
        </h3>
        
        <p 
          className="text-white/70 text-sm mb-3 line-clamp-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {event.subtitle}
        </p>
        
        <div className="flex items-center gap-3 text-[12px] text-white/50 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {event.dates}
          </span>
          <span>•</span>
          <span>{event.municipality}</span>
        </div>
        
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
          }}
        >
          Ver detalles
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div 
      className="text-center py-16 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div 
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <GiCarnivalMask className="text-4xl text-white/30" />
      </div>
      <p 
        className="text-xl font-semibold text-white/70 mb-2"
        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
      >
        No hay eventos este mes
      </p>
      <p 
        className="text-sm text-white/40 mb-6"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        Explora otros meses para descubrir más
      </p>
      <motion.button
        onClick={onReset}
        className="px-6 py-2.5 rounded-full text-sm font-semibold"
        style={{
          background: `linear-gradient(135deg, ${COLORS.amarilloArepa}, ${COLORS.naranjaSalinas})`,
          color: '#ffffff',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Ver todos los eventos
      </motion.button>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  
  // Filtrar solo eventos próximos
  const upcomingEvents = useMemo(() => {
    return events.filter(e => e.dateStart && getDaysUntil(e.dateStart) >= 0);
  }, [events]);
  
  // Generar opciones de meses
  const monthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    upcomingEvents.forEach(event => {
      if (event.dateStart) {
        monthsSet.add(event.dateStart.substring(0, 7));
      }
    });
    
    return [
      { id: null, label: "Todos" },
      ...Array.from(monthsSet).sort().map(m => ({
        id: m,
        label: MONTH_NAMES[m.split("-")[1]]
      }))
    ];
  }, [upcomingEvents]);
  
  // Año dinámico
  const currentYear = useMemo(() => {
    if (upcomingEvents.length > 0 && upcomingEvents[0].dateStart) {
      return upcomingEvents[0].dateStart.substring(0, 4);
    }
    return new Date().getFullYear().toString();
  }, [upcomingEvents]);
  
  // Filtrar por mes
  const filteredEvents = useMemo(() => {
    if (!activeMonth) return upcomingEvents;
    return upcomingEvents.filter(e => e.dateStart && e.dateStart.startsWith(activeMonth));
  }, [upcomingEvents, activeMonth]);
  
  // Separar hero y resto
  const heroEvent = useMemo(() => {
    return filteredEvents.find(e => e.featured) || filteredEvents[0] || null;
  }, [filteredEvents]);
  
  const otherEvents = useMemo(() => {
    if (!heroEvent) return filteredEvents;
    return filteredEvents.filter(e => e.id !== heroEvent.id);
  }, [filteredEvents, heroEvent]);
  
  // Agrupar por categoría
  const carnavalEvents = otherEvents.filter(e => e.category === 'carnaval');
  const otherCategoryEvents = otherEvents.filter(e => e.category !== 'carnaval');

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };
  
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  if (events.length === 0) return null;
  
  return (
    <>
      <section 
        id="upcoming-events"
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ backgroundColor: '#050a14' }}
      >
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-[150px] opacity-[0.15]"
            style={{ background: COLORS.azulBarranquero }}
          />
          <div 
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12]"
            style={{ background: COLORS.amarilloArepa }}
          />
        </div>

        {/* Header */}
        <motion.div 
          className="relative pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <span 
                  className="text-xs font-semibold tracking-[0.2em] uppercase mb-2 inline-block"
                  style={{ color: COLORS.amarilloArepa }}
                >
                  Agenda {currentYear}
                </span>
                <h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Próximos Eventos
                </h2>
              </div>
              
              <Link 
                href="/eventos"
                className="hidden sm:flex text-sm font-medium text-white/50 hover:text-white items-center gap-2 transition-colors"
              >
                Calendario completo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <MonthPills 
              active={activeMonth} 
              onChange={setActiveMonth}
              options={monthOptions}
            />
          </div>
        </motion.div>
        
        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMonth || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative pb-12 sm:pb-16 lg:pb-20"
          >
            {filteredEvents.length > 0 ? (
              <div className="space-y-10 sm:space-y-14">
                {/* Hero - Desktop */}
                {heroEvent && (
                  <div className="hidden sm:block">
                    <HeroSpotlight 
                      event={heroEvent} 
                      onClick={() => handleEventClick(heroEvent)}
                    />
                  </div>
                )}
                
                {/* Hero - Mobile */}
                {heroEvent && (
                  <div className="sm:hidden px-6">
                    <MobileHero 
                      event={heroEvent} 
                      onClick={() => handleEventClick(heroEvent)}
                    />
                  </div>
                )}
                
                {/* Carnaval Row */}
                {carnavalEvents.length > 0 && (
                  <EventRow 
                    title="Carnaval de Barranquilla"
                    icon={<span className="text-2xl">🎭</span>}
                    events={carnavalEvents}
                    onEventClick={handleEventClick}
                  />
                )}
                
                {/* Other Events Row */}
                {otherCategoryEvents.length > 0 && (
                  <EventRow 
                    title="Más eventos"
                    icon={<Sparkles className="w-6 h-6 text-amber-400" />}
                    events={otherCategoryEvents}
                    onEventClick={handleEventClick}
                  />
                )}
                
                {/* Mobile CTA */}
                <div className="sm:hidden px-6 pt-4">
                  <Link 
                    href="/eventos"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                      color: '#ffffff',
                    }}
                  >
                    Ver calendario completo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState onReset={() => setActiveMonth(null)} />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
      
      <EventDrawer 
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}