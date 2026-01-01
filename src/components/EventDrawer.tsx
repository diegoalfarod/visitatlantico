"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Navigation,
  ChevronRight,
  Ticket,
  ExternalLink
} from "lucide-react";
import type { Event } from "@/types/event";
import { EVENT_CATEGORIES } from "@/types/event";

// =============================================================================
// PALETA INSTITUCIONAL
// Principal: #E40E20, #D31A2B
// Neutros: #4A4F55, #7A858C, #C1C5C8
// =============================================================================

interface EventDrawerProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
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
// COMPONENT
// =============================================================================

export function EventDrawer({ event, isOpen, onClose }: EventDrawerProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);
  
  // Handle drag end for mobile bottom sheet
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  }, [onClose]);
  
  // Share event
  const handleShare = async () => {
    if (!event) return;
    
    const url = `${window.location.origin}/eventos/${event.slug}`;
    
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
      // Could add a toast notification here
    }
  };
  
  // Open in Google Maps
  const handleOpenMap = () => {
    if (!event) return;
    
    const query = event.coordinates
      ? `${event.coordinates.lat},${event.coordinates.lng}`
      : encodeURIComponent(`${event.location}, ${event.municipality}, Atlántico, Colombia`);
    
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };
  
  // Add to calendar
  const handleAddToCalendar = () => {
    if (!event) return;
    
    const startDate = event.dateStart.replace(/-/g, "");
    const endDate = (event.dateEnd || event.dateStart).replace(/-/g, "");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || event.subtitle)}&location=${encodeURIComponent(`${event.location}, ${event.municipality}`)}`;
    
    window.open(url, "_blank");
  };
  
  if (!event) return null;
  
  const days = getDaysUntil(event.dateStart);
  const category = event.category ? EVENT_CATEGORIES[event.category] : null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Drawer - Mobile (Bottom Sheet) */}
          <motion.div
            ref={constraintsRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="
              fixed bottom-0 left-0 right-0 z-[101]
              bg-white rounded-t-3xl overflow-hidden
              max-h-[90vh] flex flex-col
              lg:hidden
            "
            style={{ touchAction: "none" }}
          >
            {/* Drag Handle */}
            <div 
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 rounded-full bg-[#C1C5C8]" />
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <DrawerContent 
                event={event} 
                days={days} 
                category={category}
                onClose={onClose}
                onShare={handleShare}
                onOpenMap={handleOpenMap}
                onAddToCalendar={handleAddToCalendar}
              />
            </div>
          </motion.div>
          
          {/* Drawer - Desktop (Side Panel) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="
              fixed top-0 right-0 bottom-0 z-[101]
              w-full max-w-lg bg-white overflow-hidden
              hidden lg:flex lg:flex-col
              shadow-2xl
            "
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="
                absolute top-4 right-4 z-10
                h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm
                flex items-center justify-center
                shadow-lg hover:bg-white transition-colors
              "
            >
              <X size={20} className="text-[#4A4F55]" />
            </button>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <DrawerContent 
                event={event} 
                days={days} 
                category={category}
                onClose={onClose}
                onShare={handleShare}
                onOpenMap={handleOpenMap}
                onAddToCalendar={handleAddToCalendar}
                isDesktop
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// DRAWER CONTENT
// =============================================================================

interface DrawerContentProps {
  event: Event;
  days: number;
  category: { label: string; emoji: string } | null;
  onClose: () => void;
  onShare: () => void;
  onOpenMap: () => void;
  onAddToCalendar: () => void;
  isDesktop?: boolean;
}

function DrawerContent({ 
  event, 
  days, 
  category,
  onClose,
  onShare, 
  onOpenMap,
  onAddToCalendar,
  isDesktop = false 
}: DrawerContentProps) {
  return (
    <div className="pb-8">
      {/* Hero Image */}
      <div className={`relative ${isDesktop ? "aspect-[16/10]" : "aspect-[16/9]"} w-full`}>
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Countdown badge */}
        {days >= 0 && (
          <div className="absolute top-4 left-4">
            <span className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold
              ${days <= 7 
                ? "bg-[#E40E20] text-white" 
                : "bg-white/95 text-[#4A4F55] backdrop-blur-sm"
              }
            `}>
              <Calendar size={14} />
              {formatCountdown(days)}
            </span>
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <div className="absolute top-4 right-4">
            <span className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              bg-white/95 text-[#4A4F55] backdrop-blur-sm
            ">
              <span>{category.emoji}</span>
              {category.label}
            </span>
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {event.isFree && (
            <span className="
              inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
              bg-emerald-500 text-white mb-3
            ">
              Entrada Gratis
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {event.title}
          </h2>
          <p className="text-white/80 text-base">
            {event.subtitle}
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-5 py-4 border-b border-[#C1C5C8]/20">
        <div className="flex gap-2">
          <button
            onClick={onAddToCalendar}
            className="
              flex-1 flex items-center justify-center gap-2
              h-11 rounded-xl text-sm font-medium
              bg-[#E40E20] text-white
              hover:bg-[#D31A2B] transition-colors
            "
          >
            <Calendar size={16} />
            Agregar al calendario
          </button>
          
          <button
            onClick={onShare}
            className="
              h-11 w-11 rounded-xl flex items-center justify-center
              bg-[#F5F5F5] text-[#4A4F55]
              hover:bg-[#EBEBEB] transition-colors
            "
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="px-5 py-5 space-y-5">
        {/* Date & Time */}
        <div className="flex items-start gap-4">
          <div className="
            h-12 w-12 rounded-xl bg-[#E40E20]/10 
            flex items-center justify-center flex-shrink-0
          ">
            <Calendar size={22} className="text-[#E40E20]" />
          </div>
          <div>
            <p className="font-semibold text-[#4A4F55] capitalize">
              {formatFullDate(event.dateStart)}
            </p>
            {event.dateEnd && event.dateEnd !== event.dateStart && (
              <p className="text-sm text-[#7A858C] capitalize">
                hasta {formatFullDate(event.dateEnd)}
              </p>
            )}
            {event.time && (
              <p className="text-sm text-[#7A858C] mt-0.5 flex items-center gap-1">
                <Clock size={12} />
                {event.time}
              </p>
            )}
          </div>
        </div>
        
        {/* Location */}
        <button 
          onClick={onOpenMap}
          className="flex items-start gap-4 w-full text-left group"
        >
          <div className="
            h-12 w-12 rounded-xl bg-[#E40E20]/10 
            flex items-center justify-center flex-shrink-0
            group-hover:bg-[#E40E20]/20 transition-colors
          ">
            <MapPin size={22} className="text-[#E40E20]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#4A4F55] group-hover:text-[#E40E20] transition-colors">
              {event.location}
            </p>
            <p className="text-sm text-[#7A858C]">
              {event.municipality}, Atlántico
            </p>
            {event.address && (
              <p className="text-xs text-[#7A858C] mt-0.5">
                {event.address}
              </p>
            )}
          </div>
          <Navigation size={18} className="text-[#C1C5C8] group-hover:text-[#E40E20] transition-colors mt-1" />
        </button>
        
        {/* Price */}
        {!event.isFree && event.price && (
          <div className="flex items-start gap-4">
            <div className="
              h-12 w-12 rounded-xl bg-[#E40E20]/10 
              flex items-center justify-center flex-shrink-0
            ">
              <Ticket size={22} className="text-[#E40E20]" />
            </div>
            <div>
              <p className="font-semibold text-[#4A4F55]">
                {event.price}
              </p>
              <p className="text-sm text-[#7A858C]">
                Precio de entrada
              </p>
            </div>
          </div>
        )}
        
        {/* Description */}
        {event.description && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-[#4A4F55] uppercase tracking-wide mb-2">
              Acerca del evento
            </h3>
            <p className="text-[#4A4F55] leading-relaxed">
              {event.description}
            </p>
          </div>
        )}
        
        {/* Organizer */}
        {event.organizer && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-[#4A4F55] uppercase tracking-wide mb-2">
              Organiza
            </h3>
            <p className="text-[#7A858C]">
              {event.organizer}
            </p>
            {event.contact?.website && (
              <a 
                href={event.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1 text-sm text-[#E40E20] 
                  hover:underline mt-1
                "
              >
                Sitio web <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
        
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {event.tags.map((tag) => (
              <span 
                key={tag}
                className="
                  px-3 py-1 rounded-full text-xs font-medium
                  bg-[#F5F5F5] text-[#7A858C]
                "
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* View Full Page CTA */}
      <div className="px-5 pt-4">
        <Link
          href={`/eventos/${event.slug}`}
          onClick={onClose}
          className="
            flex items-center justify-between w-full
            px-5 py-4 rounded-2xl
            bg-[#F5F5F5] hover:bg-[#EBEBEB]
            transition-colors group
          "
        >
          <div>
            <p className="font-semibold text-[#4A4F55]">
              Ver página del evento
            </p>
            <p className="text-sm text-[#7A858C]">
              Más información y detalles
            </p>
          </div>
          <ChevronRight 
            size={20} 
            className="text-[#C1C5C8] group-hover:text-[#E40E20] group-hover:translate-x-1 transition-all" 
          />
        </Link>
      </div>
    </div>
  );
}

export default EventDrawer;