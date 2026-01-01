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
  ArrowRight
} from "lucide-react";
import type { Event } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";

// =============================================================================
// PALETA INSTITUCIONAL
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

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
  
  // Share event
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
  
  // Open in Google Maps
  const handleOpenMap = () => {
    const query = event.coordinates
      ? `${event.coordinates.lat},${event.coordinates.lng}`
      : encodeURIComponent(`${event.location}, ${event.municipality}, Atlántico, Colombia`);
    
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };
  
  // Add to calendar
  const handleAddToCalendar = () => {
    const startDate = event.dateStart.replace(/-/g, "");
    const endDate = (event.dateEnd || event.dateStart).replace(/-/g, "");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || event.subtitle)}&location=${encodeURIComponent(`${event.location}, ${event.municipality}`)}`;
    
    window.open(url, "_blank");
  };
  
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        {/* Parallax Image */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-6 left-6 z-10"
        >
          <Link
            href="/eventos"
            className="
              inline-flex items-center gap-2 
              px-4 py-2.5 rounded-full
              bg-white/10 backdrop-blur-md text-white
              hover:bg-white/20 transition-colors
              text-sm font-medium
            "
          >
            <ArrowLeft size={16} />
            Volver a eventos
          </Link>
        </motion.div>
        
        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleShare}
          className="
            absolute top-6 right-6 z-10
            h-11 w-11 rounded-full
            bg-white/10 backdrop-blur-md text-white
            hover:bg-white/20 transition-colors
            flex items-center justify-center
          "
        >
          <Share2 size={18} />
        </motion.button>
        
        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16"
        >
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Countdown Badge */}
              {!isPast && (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                    ${days <= 7 
                      ? "bg-[#E40E20] text-white" 
                      : "bg-white/95 text-[#4A4F55]"
                    }
                  `}
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
                  transition={{ delay: 0.4 }}
                  className="
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                    bg-white/95 text-[#4A4F55]
                  "
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
                  transition={{ delay: 0.5 }}
                  className="
                    inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
                    bg-emerald-500 text-white
                  "
                >
                  Entrada Gratis
                </motion.span>
              )}
            </div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight"
            >
              {event.title}
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl sm:text-2xl text-white/80 font-medium"
            >
              {event.subtitle}
            </motion.p>
          </div>
        </motion.div>
      </div>
      
      {/* Content Section */}
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
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-sm font-semibold text-[#7A858C] uppercase tracking-[0.2em] mb-4">
                  Acerca del evento
                </h2>
                <p className="text-lg text-[#4A4F55] leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            )}
            
            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {/* Date */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFAFA]">
                <div className="h-12 w-12 rounded-xl bg-[#E40E20]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} className="text-[#E40E20]" />
                </div>
                <div>
                  <p className="text-sm text-[#7A858C] mb-1">Fecha</p>
                  <p className="font-semibold text-[#4A4F55] capitalize">
                    {formatFullDate(event.dateStart)}
                  </p>
                  {event.dateEnd && event.dateEnd !== event.dateStart && (
                    <p className="text-sm text-[#7A858C] capitalize mt-0.5">
                      hasta {formatFullDate(event.dateEnd)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Time */}
              {event.time && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFAFA]">
                  <div className="h-12 w-12 rounded-xl bg-[#E40E20]/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={22} className="text-[#E40E20]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A858C] mb-1">Horario</p>
                    <p className="font-semibold text-[#4A4F55]">{event.time}</p>
                  </div>
                </div>
              )}
              
              {/* Location */}
              <button 
                onClick={handleOpenMap}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFAFA] hover:bg-[#F0F0F0] transition-colors text-left group"
              >
                <div className="h-12 w-12 rounded-xl bg-[#E40E20]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E40E20]/20 transition-colors">
                  <MapPin size={22} className="text-[#E40E20]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#7A858C] mb-1">Ubicación</p>
                  <p className="font-semibold text-[#4A4F55] group-hover:text-[#E40E20] transition-colors">
                    {event.location}
                  </p>
                  <p className="text-sm text-[#7A858C]">{event.municipality}, Atlántico</p>
                </div>
                <Navigation size={18} className="text-[#C1C5C8] group-hover:text-[#E40E20] transition-colors mt-1" />
              </button>
              
              {/* Price */}
              {!event.isFree && event.price && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFAFA]">
                  <div className="h-12 w-12 rounded-xl bg-[#E40E20]/10 flex items-center justify-center flex-shrink-0">
                    <Ticket size={22} className="text-[#E40E20]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A858C] mb-1">Precio</p>
                    <p className="font-semibold text-[#4A4F55]">{event.price}</p>
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
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-sm font-semibold text-[#7A858C] uppercase tracking-[0.2em] mb-4">
                  Organiza
                </h2>
                <div className="p-5 rounded-2xl bg-[#FAFAFA]">
                  <p className="font-semibold text-[#4A4F55]">{event.organizer}</p>
                  {event.contact && (
                    <div className="flex flex-wrap gap-4 mt-3">
                      {event.contact.phone && (
                        <a href={`tel:${event.contact.phone}`} className="text-sm text-[#E40E20] hover:underline">
                          {event.contact.phone}
                        </a>
                      )}
                      {event.contact.website && (
                        <a 
                          href={event.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[#E40E20] hover:underline"
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
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-sm font-semibold text-[#7A858C] uppercase tracking-[0.2em] mb-4">
                  Etiquetas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-[#FAFAFA] text-[#7A858C] hover:bg-[#F0F0F0] transition-colors"
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
            <div className="sticky top-8 space-y-6">
              {/* Action Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-6 rounded-2xl bg-[#FAFAFA] space-y-4"
              >
                {!isPast ? (
                  <>
                    <button
                      onClick={handleAddToCalendar}
                      className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-[#E40E20] text-white hover:bg-[#D31A2B] transition-colors"
                    >
                      <Calendar size={18} />
                      Agregar al calendario
                    </button>
                    
                    <button
                      onClick={handleOpenMap}
                      className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-white text-[#4A4F55] border border-[#C1C5C8]/30 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Navigation size={18} />
                      Cómo llegar
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-white text-[#4A4F55] border border-[#C1C5C8]/30 hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Share2 size={18} />
                      Compartir evento
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[#7A858C] mb-2">Este evento ya finalizó</p>
                    <Link href="/eventos" className="text-[#E40E20] font-medium hover:underline">
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
            transition={{ duration: 0.8 }}
            className="mt-20 pt-16 border-t border-[#C1C5C8]/20"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-px bg-[#E40E20]" />
                  <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">Descubre más</span>
                </div>
                <h2 className="text-3xl font-bold text-[#4A4F55]">
                  Eventos <span className="text-[#E40E20]">relacionados</span>
                </h2>
              </div>
              
              <Link 
                href="/eventos"
                className="hidden sm:inline-flex items-center gap-2 text-sm text-[#4A4F55] hover:text-[#E40E20] transition-colors group"
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
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/eventos/${relEvent.slug}`} className="block group">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                      <Image
                        src={relEvent.image}
                        alt={relEvent.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white/70 text-sm mb-1">{relEvent.dates} · {relEvent.municipality}</p>
                        <h3 className="text-lg font-bold text-white">{relEvent.title}</h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="sm:hidden mt-8 text-center">
              <Link 
                href="/eventos"
                className="inline-flex items-center gap-2 text-sm text-[#4A4F55] hover:text-[#E40E20] transition-colors"
              >
                Ver todos los eventos
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}