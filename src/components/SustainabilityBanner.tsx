"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import PlannerPage from "@/components/planner/PlannerPage";
import {
  Leaf,
  Download,
  Sparkles,
  ArrowRight,
  FileText,
  Map,
  MessageCircle,
  CalendarDays,
  UtensilsCrossed,
  TreePine,
} from "lucide-react";

/* ============================================
   RECURSOS PARA VIAJEROS
   Diseño minimal highend - limpio y elegante
   ============================================ */

const EASE = [0.22, 1, 0.36, 1];

// Colores institucionales
const COLORS = {
  azulBarranquero: "#007BC4",
  naranjaSalinas: "#EA5B13",
  verdeBijao: "#008D39",
  rojoCayena: "#D31A2B",
  amarilloArepa: "#F39200",
};

interface Resource {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  href?: string;
  action: "modal" | "jimmy" | "link" | "download";
  image?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const resources: Resource[] = [
  {
    id: "jimmy",
    title: "Jimmy",
    subtitle: "Tu guía local 24/7",
    badge: "Chat",
    action: "jimmy",
    image: "/jimmy-avatar.png",
    icon: MessageCircle,
    accentColor: COLORS.azulBarranquero,
  },
  {
    id: "planner",
    title: "Planificador",
    subtitle: "Crea tu itinerario con IA",
    badge: "IA",
    action: "modal",
    image: "/planner-portada.png",
    icon: CalendarDays,
    accentColor: COLORS.naranjaSalinas,
  },
  {
    id: "gastronomy",
    title: "Ruta 23",
    subtitle: "Gastronomía local",
    badge: "Nuevo",
    href: "/gastronomy",
    action: "link",
    image: "/RUTA23LOGO.png",
    icon: UtensilsCrossed,
    accentColor: COLORS.rojoCayena,
  },
  {
    id: "destinations",
    title: "Ecoturismo",
    subtitle: "Naturaleza y aventura",
    href: "/destinations?filter=EcoTurismo",
    action: "link",
    image: "/ecoparque-cienaga.jpg",
    icon: TreePine,
    accentColor: COLORS.verdeBijao,
  },
  {
    id: "map",
    title: "Mapa",
    subtitle: "Explora destinos",
    href: "/mapa",
    action: "link",
    image: "/map-icon.jpg",
    icon: Map,
    accentColor: COLORS.azulBarranquero,
  },
  {
    id: "guide",
    title: "Guía PDF",
    subtitle: "Descarga gratis",
    href: "/docs/guia-turismo.pdf",
    action: "download",
    icon: FileText,
    accentColor: COLORS.amarilloArepa,
  },
];

/* ============================================
   OPCIÓN 1: GRAYSCALE CON REVEAL EN HOVER
   Elegante, minimalista, muy usado en sitios premium
   ============================================ */

function ResourceCardGrayscale({ 
  resource, 
  index,
  onClick 
}: { 
  resource: Resource; 
  index: number;
  onClick?: () => void;
}) {
  const Icon = resource.icon;
  const hasImage = !!resource.image;
  
  const cardContent = (
    <motion.div
      className="
        group relative h-full
        p-6 rounded-2xl
        bg-white
        border border-[#e8e8e8] hover:border-[#d0d0d0]
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        cursor-pointer
      "
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      {/* Top row: Visual + Badge */}
      <div className="flex items-start justify-between mb-5">
        {/* Image con grayscale que se revela en hover */}
        {hasImage ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5f5f5]">
            <Image
              src={resource.image!}
              alt={resource.title}
              fill
              className="
                object-cover 
                grayscale group-hover:grayscale-0
                opacity-80 group-hover:opacity-100
                transition-all duration-500 ease-out
              "
            />
          </div>
        ) : (
          <div 
            className="
              w-14 h-14 rounded-xl 
              bg-[#f5f5f5] group-hover:bg-opacity-80
              flex items-center justify-center
              transition-all duration-300
            "
            style={{ 
              backgroundColor: `${resource.accentColor}10`,
            }}
          >
            <Icon 
              className="w-6 h-6 transition-colors duration-300" 
              style={{ color: resource.accentColor }}
              strokeWidth={1.5} 
            />
          </div>
        )}
        
        {/* Badge */}
        {resource.badge && (
          <span className="px-2.5 py-1 rounded-full bg-[#f5f5f5] text-[#666] text-[11px] font-medium uppercase tracking-wide">
            {resource.badge}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1 tracking-tight">
          {resource.title}
        </h3>
        <p className="text-sm text-[#888] leading-relaxed">
          {resource.subtitle}
        </p>
      </div>
      
      {/* Hover arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight className="w-5 h-5 text-[#ccc] group-hover:text-[#999] group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.div>
  );

  if (resource.action === "link" && resource.href) {
    return <Link href={resource.href} className="block h-full">{cardContent}</Link>;
  }
  if (resource.action === "download" && resource.href) {
    return (
      <a href={resource.href} download target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }
  return (
    <button type="button" className="block w-full h-full text-left" onClick={onClick}>
      {cardContent}
    </button>
  );
}

/* ============================================
   OPCIÓN 2: OVERLAY DE COLOR CON ICONO
   Más bold, colorido pero consistente
   ============================================ */

function ResourceCardOverlay({ 
  resource, 
  index,
  onClick 
}: { 
  resource: Resource; 
  index: number;
  onClick?: () => void;
}) {
  const Icon = resource.icon;
  const hasImage = !!resource.image;
  
  const cardContent = (
    <motion.div
      className="
        group relative h-full
        p-6 rounded-2xl
        bg-white
        border border-[#e8e8e8] hover:border-[#d0d0d0]
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        cursor-pointer
      "
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      {/* Top row: Visual + Badge */}
      <div className="flex items-start justify-between mb-5">
        {/* Image con overlay de color */}
        <div 
          className="relative w-14 h-14 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${resource.accentColor}15` }}
        >
          {hasImage && (
            <>
              <Image
                src={resource.image!}
                alt={resource.title}
                fill
                className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              />
              {/* Color overlay */}
              <div 
                className="absolute inset-0 mix-blend-multiply opacity-30"
                style={{ backgroundColor: resource.accentColor }}
              />
            </>
          )}
          {/* Icon always visible */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon 
              className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
              style={{ color: resource.accentColor }}
              strokeWidth={1.5} 
            />
          </div>
        </div>
        
        {/* Badge */}
        {resource.badge && (
          <span 
            className="px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide transition-colors duration-300"
            style={{ 
              backgroundColor: `${resource.accentColor}10`,
              color: resource.accentColor,
            }}
          >
            {resource.badge}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1 tracking-tight group-hover:text-[#333] transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-[#888] leading-relaxed">
          {resource.subtitle}
        </p>
      </div>
      
      {/* Accent line on hover */}
      <div 
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: resource.accentColor }}
      />
      
      {/* Hover arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight 
          className="w-5 h-5 group-hover:translate-x-0.5 transition-all" 
          style={{ color: resource.accentColor }}
        />
      </div>
    </motion.div>
  );

  if (resource.action === "link" && resource.href) {
    return <Link href={resource.href} className="block h-full">{cardContent}</Link>;
  }
  if (resource.action === "download" && resource.href) {
    return (
      <a href={resource.href} download target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }
  return (
    <button type="button" className="block w-full h-full text-left" onClick={onClick}>
      {cardContent}
    </button>
  );
}

/* ============================================
   OPCIÓN 3: SOLO ICONOS (MÁS MINIMALISTA)
   Ultra clean, sin imágenes
   ============================================ */

function ResourceCardIconOnly({ 
  resource, 
  index,
  onClick 
}: { 
  resource: Resource; 
  index: number;
  onClick?: () => void;
}) {
  const Icon = resource.icon;
  
  const cardContent = (
    <motion.div
      className="
        group relative h-full
        p-6 rounded-2xl
        bg-white
        border border-[#e8e8e8] hover:border-transparent
        shadow-sm hover:shadow-lg
        transition-all duration-300 ease-out
        cursor-pointer
        overflow-hidden
      "
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      {/* Background glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top left, ${resource.accentColor}08 0%, transparent 50%)`,
        }}
      />
      
      {/* Top row: Icon + Badge */}
      <div className="relative flex items-start justify-between mb-5">
        {/* Icon container */}
        <div 
          className="
            w-12 h-12 rounded-xl 
            flex items-center justify-center
            transition-all duration-300
            group-hover:scale-105
          "
          style={{ 
            backgroundColor: `${resource.accentColor}10`,
          }}
        >
          <Icon 
            className="w-5 h-5 transition-colors duration-300" 
            style={{ color: resource.accentColor }}
            strokeWidth={1.75} 
          />
        </div>
        
        {/* Badge */}
        {resource.badge && (
          <span 
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${resource.accentColor}10`,
              color: resource.accentColor,
            }}
          >
            {resource.badge}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="relative">
        <h3 className="text-[17px] font-semibold text-[#1a1a1a] mb-1.5 tracking-tight">
          {resource.title}
        </h3>
        <p className="text-[13px] text-[#888] leading-relaxed">
          {resource.subtitle}
        </p>
      </div>
      
      {/* Hover arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        <ArrowRight 
          className="w-4 h-4" 
          style={{ color: resource.accentColor }}
        />
      </div>
    </motion.div>
  );

  if (resource.action === "link" && resource.href) {
    return <Link href={resource.href} className="block h-full">{cardContent}</Link>;
  }
  if (resource.action === "download" && resource.href) {
    return (
      <a href={resource.href} download target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }
  return (
    <button type="button" className="block w-full h-full text-left" onClick={onClick}>
      {cardContent}
    </button>
  );
}

/* ============================================
   MAIN COMPONENT
   Cambiar ResourceCard por la variante deseada:
   - ResourceCardGrayscale (elegante, reveal en hover)
   - ResourceCardOverlay (colorido pero consistente)  
   - ResourceCardIconOnly (ultra minimalista)
   ============================================ */

// 👇 CAMBIA AQUÍ LA VARIANTE QUE PREFIERAS
const ResourceCard = ResourceCardGrayscale;

export default function SustainabilityBanner() {
  const [plannerOpen, setPlannerOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleResourceClick = (resource: Resource) => {
    if (resource.action === "jimmy") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("jimmy:open"));
        window.dispatchEvent(new Event("jimmy-open"));
        (window as any).openJimmy?.();
      }
    } else if (resource.action === "modal") {
      setPlannerOpen(true);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-[#fafafa]"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#E40E20]" />
                <span className="text-[#999] text-xs tracking-[0.15em] uppercase">
                  Planifica tu viaje
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#1a1a1a] tracking-tight">
                Recursos para viajeros
              </h2>
            </div>
            
            <p className="text-[#888] text-sm max-w-xs">
              Herramientas para que tu experiencia sea inolvidable
            </p>
          </div>
        </motion.div>

        {/* Sustainability note */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        >
          <div className="inline-flex items-center gap-2 text-[#888] text-sm">
            <Leaf className="w-4 h-4 text-[#22c55e]" />
            <span>Viaja sostenible · Apoya la economía local</span>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {resources.map((resource, i) => (
            <ResourceCard 
              key={resource.id}
              resource={resource} 
              index={i}
              onClick={() => handleResourceClick(resource)}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
        >
          <button
            onClick={() => setPlannerOpen(true)}
            className="
              inline-flex items-center gap-2.5 
              px-6 py-3 rounded-full
              bg-[#1a1a1a] hover:bg-[#333]
              text-white text-sm font-medium
              transition-colors duration-200
            "
          >
            <Sparkles className="w-4 h-4" />
            <span>Planificar con IA</span>
          </button>
          
          <a
            href="/docs/guia-turismo.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2 
              px-5 py-3
              text-[#666] hover:text-[#1a1a1a]
              text-sm font-medium
              transition-colors duration-200
            "
          >
            <Download className="w-4 h-4" />
            <span>Descargar guía</span>
          </a>
        </motion.div>
      </div>

      {/* Planner Modal */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </section>
  );
}