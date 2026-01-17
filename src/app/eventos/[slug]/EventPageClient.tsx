"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Navigation,
  ArrowLeft,
  Ticket,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Users,
  Heart,
} from "lucide-react";
import type { Event } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";

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
};

// Easing cinematográfico
const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface EventPageClientProps {
  event: Event;
  relatedEvents: Event[];
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
  if (days < 0) return "Evento finalizado";
  if (days === 0) return "¡Hoy!";
  if (days === 1) return "¡Mañana!";
  if (days <= 7) return `En ${days} días`;
  if (days <= 30) return `En ${Math.ceil(days / 7)} semanas`;
  return `En ${Math.ceil(days / 30)} meses`;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventPageClient({ event, relatedEvents }: EventPageClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  const days = getDaysUntil(event.dateStart);
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;
  const isPast = days < 0;
  
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${event.dates} en ${event.municipality}`,
          url
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };
  
  const handleOpenMap = () => {
    const query = event.coordinates
      ? `${event.coordinates.lat},${event.coordinates.lng}`
      : encodeURIComponent(`${event.location}, ${event.municipality}, Atlántico, Colombia`);
    
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };
  
  const handleAddToCalendar = () => {
    const startDate = event.dateStart.replace(/-/g, "");
    const endDate = (event.dateEnd || event.dateStart).replace(/-/g, "");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || event.subtitle)}&location=${encodeURIComponent(`${event.location}, ${event.municipality}`)}`;
    
    window.open(url, "_blank");
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative h-[75vh] sm:h-[80vh] min-h-[500px] max-h-[900px] overflow-hidden">
        {/* Parallax Image with Ken Burns */}
        <motion.div 
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Film grain */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, ease: EASE_CINEMATIC }}
          className="absolute top-6 left-6 z-10"
        >
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/50 hover:text-white transition-all text-sm font-medium"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <ArrowLeft size={16} />
            Volver a eventos
          </Link>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: EASE_CINEMATIC }}
            onClick={handleShare}
            className="h-11 w-11 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/50 hover:text-white transition-all flex items-center justify-center"
          >
            <Share2 size={18} />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ease: EASE_CINEMATIC }}
            className="h-11 w-11 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-white hover:text-red-500 transition-all flex items-center justify-center"
          >
            <Heart size={18} />
          </motion.button>
        </div>
        
        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16"
        >
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Countdown Badge */}
              {!isPast && (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, ease: EASE_CINEMATIC }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
                  style={{
                    background: days <= 7 
                      ? `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`
                      : "rgba(255,255,255,0.95)",
                    color: days <= 7 ? "white" : COLORS.grisOscuro,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  <Calendar size={14} />
                  {formatCountdown(days)}
                </motion.span>
              )}
              
              {/* Category Badge */}
              {category && (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ease: EASE_CINEMATIC }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white/95 backdrop-blur-sm"
                  style={{ 
                    color: COLORS.grisOscuro,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  <span>{category.emoji}</span>
                  {category.label}
                </motion.span>
              )}
              
              {/* Free Badge */}
              {event.isFree && (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, ease: EASE_CINEMATIC }}
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-white"
                  style={{ 
                    background: COLORS.verdeBijao,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Entrada Gratis
                </motion.span>
              )}
            </div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: EASE_CINEMATIC }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 tracking-tight"
              style={{ 
                fontFamily: "'Josefin Sans', sans-serif",
                textShadow: '0 4px 30px rgba(0,0,0,0.3)',
              }}
            >
              {event.title}
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: EASE_CINEMATIC }}
              className="text-xl sm:text-2xl text-white/80 font-medium"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {event.subtitle}
            </motion.p>
            
            {/* Quick Info Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: EASE_CINEMATIC }}
              className="flex flex-wrap items-center gap-3 mt-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <MapPin className="w-4 h-4 text-white/70" />
                <span 
                  className="text-sm text-white/90"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {event.municipality}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                <Calendar className="w-4 h-4 text-white/70" />
                <span 
                  className="text-sm text-white/90"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {event.dates}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span 
            className="text-xs text-white/50 tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
        </motion.div>
      </div>
      
      {/* Content Section */}
      <div className="relative z-10 -mt-6 sm:-mt-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              {event.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
                  className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden"
                >
                  <header className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${COLORS.azulBarranquero}15` }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Acerca del evento
                    </h2>
                  </header>
                  <div className="p-6 sm:p-8">
                    <p 
                      className="text-lg text-slate-600 leading-relaxed"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Details Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_CINEMATIC }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {/* Date */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.naranjaSalinas}10` }}
                  >
                    <Calendar size={22} style={{ color: COLORS.naranjaSalinas }} />
                  </div>
                  <div>
                    <p 
                      className="text-sm text-slate-500 mb-1"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Fecha
                    </p>
                    <p 
                      className="font-semibold text-slate-800 capitalize"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {formatFullDate(event.dateStart)}
                    </p>
                    {event.dateEnd && event.dateEnd !== event.dateStart && (
                      <p 
                        className="text-sm text-slate-500 capitalize mt-0.5"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        hasta {formatFullDate(event.dateEnd)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Time */}
                {event.time && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div 
                      className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${COLORS.azulBarranquero}10` }}
                    >
                      <Clock size={22} style={{ color: COLORS.azulBarranquero }} />
                    </div>
                    <div>
                      <p 
                        className="text-sm text-slate-500 mb-1"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Horario
                      </p>
                      <p 
                        className="font-semibold text-slate-800"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {event.time}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Location */}
                <button 
                  onClick={handleOpenMap}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all text-left group"
                >
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{ background: `${COLORS.verdeBijao}10` }}
                  >
                    <MapPin size={22} style={{ color: COLORS.verdeBijao }} />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm text-slate-500 mb-1"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Ubicación
                    </p>
                    <p 
                      className="font-semibold text-slate-800 group-hover:text-transparent bg-clip-text transition-all"
                      style={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        backgroundImage: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                      }}
                    >
                      {event.location}
                    </p>
                    <p 
                      className="text-sm text-slate-500"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {event.municipality}, Atlántico
                    </p>
                  </div>
                  <Navigation size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </button>
                
                {/* Price */}
                {!event.isFree && event.price && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <div 
                      className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${COLORS.amarilloArepa}15` }}
                    >
                      <Ticket size={22} style={{ color: COLORS.amarilloArepa }} />
                    </div>
                    <div>
                      <p 
                        className="text-sm text-slate-500 mb-1"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Precio
                      </p>
                      <p 
                        className="font-semibold text-slate-800"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {event.price}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
              
              {/* Organizer */}
              {event.organizer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE_CINEMATIC }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <header className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${COLORS.beigeIraca}20` }}
                    >
                      <Users className="w-5 h-5" style={{ color: COLORS.beigeIraca }} />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Organiza
                    </h2>
                  </header>
                  <div className="p-6 sm:p-8">
                    <p 
                      className="font-semibold text-slate-800"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {event.organizer}
                    </p>
                    {event.contact && (
                      <div className="flex flex-wrap gap-4 mt-3">
                        {event.contact.phone && (
                          <a 
                            href={`tel:${event.contact.phone}`} 
                            className="text-sm hover:underline transition-colors"
                            style={{ 
                              color: COLORS.naranjaSalinas,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            {event.contact.phone}
                          </a>
                        )}
                        {event.contact.website && (
                          <a 
                            href={event.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline"
                            style={{ 
                              color: COLORS.naranjaSalinas,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            Sitio web <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: EASE_CINEMATIC }}
                >
                  <h2 
                    className="text-sm font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Etiquetas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Action Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
                  className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4"
                >
                  {!isPast ? (
                    <>
                      <button
                        onClick={handleAddToCalendar}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                          boxShadow: `0 8px 25px -5px ${COLORS.naranjaSalinas}40`,
                          fontFamily: "'Josefin Sans', sans-serif",
                        }}
                      >
                        <Calendar size={18} />
                        Agregar al calendario
                      </button>
                      
                      <button
                        onClick={handleOpenMap}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <Navigation size={18} />
                        Cómo llegar
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <Share2 size={18} />
                        Compartir evento
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p 
                        className="text-slate-500 mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Este evento ya finalizó
                      </p>
                      <Link 
                        href="/eventos" 
                        className="font-medium hover:underline"
                        style={{ 
                          color: COLORS.naranjaSalinas,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        Ver próximos eventos
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
              className="mt-20 pt-16 border-t border-slate-200"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${COLORS.naranjaSalinas}15` }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: COLORS.naranjaSalinas }} />
                    </div>
                    <span 
                      className="text-slate-500 text-sm tracking-[0.15em] uppercase"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Descubre más
                    </span>
                  </div>
                  <h2 
                    className="text-3xl font-bold text-slate-800"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Eventos{" "}
                    <span 
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      relacionados
                    </span>
                  </h2>
                </div>
                
                <Link 
                  href="/eventos"
                  className="hidden sm:inline-flex items-center gap-2 text-sm transition-colors group"
                  style={{ 
                    color: COLORS.naranjaSalinas,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Ver todos
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedEvents.map((relEvent, i) => (
                  <motion.div
                    key={relEvent.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_CINEMATIC }}
                  >
                    <Link href={`/eventos/${relEvent.slug}`} className="block group">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                        <Image
                          src={relEvent.image}
                          alt={relEvent.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <p 
                            className="text-white/70 text-sm mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {relEvent.dates} · {relEvent.municipality}
                          </p>
                          <h3 
                            className="text-lg font-bold text-white"
                            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                          >
                            {relEvent.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="sm:hidden mt-8 text-center">
                <Link 
                  href="/eventos"
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ 
                    color: COLORS.naranjaSalinas,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Ver todos los eventos
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </main>
  );
}