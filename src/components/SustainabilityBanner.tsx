"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import PlannerPage from "@/components/planner/PlannerPage";
import {
  Leaf,
  Download,
  MapPin,
  FileText,
  Sparkles,
  Calendar,
  Utensils,
  Map,
  ArrowRight,
} from "lucide-react";

/* ============================================
   RECURSOS PARA VIAJEROS
   Diseño cinematográfico, coherente con el sistema
   
   Paleta: #E40E20, #D31A2B, #4A4F55, #7A858C, #C1C5C8
   ============================================ */

const resources = [
  {
    id: "planner",
    icon: Calendar,
    title: "Planificador de Viaje",
    description: "Crea tu itinerario personalizado con inteligencia artificial",
    badge: "IA",
    action: "modal" as const,
  },
  {
    id: "jimmy",
    avatar: "/jimmy-avatar.png",
    title: "Jimmy - Asistente Virtual",
    description: "Tu guía local disponible 24/7 para resolver todas tus dudas",
    badge: "Chat",
    action: "jimmy" as const,
  },
  {
    id: "gastronomy",
    icon: Utensils,
    title: "Ruta 23 Gastronómica",
    description: "Descubre los sabores auténticos de los 23 municipios",
    badge: "Nuevo",
    href: "/gastronomy",
    action: "link" as const,
  },
  {
    id: "destinations",
    icon: MapPin,
    title: "Destinos Ecológicos",
    description: "Explora reservas naturales, lagunas y senderos",
    href: "/destinations?filter=EcoTurismo",
    action: "link" as const,
  },
  {
    id: "map",
    icon: Map,
    title: "Mapa Interactivo",
    description: "Navega por todos los destinos del departamento",
    href: "/destinations",
    action: "link" as const,
  },
  {
    id: "guide",
    icon: FileText,
    title: "Guía de Viaje PDF",
    description: "Descarga nuestra guía completa para llevar contigo",
    badge: "PDF",
    href: "/docs/guia-turismo.pdf",
    action: "download" as const,
  },
];

/* ============================================
   FEATURED RESOURCE CARD - Large, immersive
   ============================================ */

function FeaturedCard({ 
  resource, 
  index, 
  onClick 
}: { 
  resource: typeof resources[0]; 
  index: number;
  onClick?: () => void;
}) {
  const Icon = resource.icon;
  
  const cardContent = (
    <motion.div
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={{
          background: index === 0 
            ? 'linear-gradient(135deg, #E40E20 0%, #D31A2B 100%)'
            : 'linear-gradient(135deg, #4A4F55 0%, #2d3238 100%)'
        }}
      />
      
      {/* Decorative elements */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
        }}
      />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Gradient overlay - cinematic */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        {/* Top - Badge & Icon */}
        <div className="flex items-start justify-between">
          {resource.badge && (
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/10">
              {resource.badge}
            </span>
          )}
          
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            {resource.avatar ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <Image 
                  src={resource.avatar}
                  alt={resource.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              Icon && <Icon className="w-7 h-7 text-white" />
            )}
          </div>
        </div>
        
        {/* Bottom - Info */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
            {resource.title}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {resource.description}
          </p>
          
          {/* Hover indicator */}
          <div className="flex items-center gap-2 text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>
              {resource.action === 'download' ? 'Descargar' : 
               resource.action === 'jimmy' ? 'Abrir chat' :
               resource.action === 'modal' ? 'Comenzar' : 'Explorar'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (resource.action === "link" && resource.href) {
    return <Link href={resource.href} className="block">{cardContent}</Link>;
  }
  if (resource.action === "download" && resource.href) {
    return <a href={resource.href} download target="_blank" rel="noopener noreferrer" className="block">{cardContent}</a>;
  }
  return <button type="button" className="block w-full text-left" onClick={onClick}>{cardContent}</button>;
}

/* ============================================
   COMPACT RESOURCE CARD - Smaller grid items
   ============================================ */

function CompactCard({ 
  resource, 
  index, 
  onClick 
}: { 
  resource: typeof resources[0]; 
  index: number;
  onClick?: () => void;
}) {
  const Icon = resource.icon;
  
  const cardContent = (
    <motion.div
      className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-[#f8f9fa] transition-colors duration-300 group-hover:bg-[#f1f3f5]"
      />
      
      {/* Subtle gradient on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(228,14,32,0.03) 0%, transparent 100%)'
        }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col p-5">
        {/* Top - Icon & Badge */}
        <div className="flex items-start justify-between mb-auto">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
            {resource.avatar ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image 
                  src={resource.avatar}
                  alt={resource.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              Icon && <Icon className="w-5 h-5 text-[#4A4F55]" />
            )}
          </div>
          
          {resource.badge && (
            <span className="px-2 py-1 bg-white text-[#7A858C] text-[10px] font-semibold uppercase tracking-wider rounded-md shadow-sm">
              {resource.badge}
            </span>
          )}
        </div>
        
        {/* Bottom - Info */}
        <div>
          <h3 className="text-base font-semibold text-[#4A4F55] mb-1 leading-tight">
            {resource.title}
          </h3>
          <p className="text-[#7A858C] text-xs leading-relaxed line-clamp-2">
            {resource.description}
          </p>
        </div>
      </div>
      
      {/* Bottom border accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E40E20] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  );

  if (resource.action === "link" && resource.href) {
    return <Link href={resource.href} className="block">{cardContent}</Link>;
  }
  if (resource.action === "download" && resource.href) {
    return <a href={resource.href} download target="_blank" rel="noopener noreferrer" className="block">{cardContent}</a>;
  }
  return <button type="button" className="block w-full text-left" onClick={onClick}>{cardContent}</button>;
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export default function SustainabilityBanner() {
  const [plannerOpen, setPlannerOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleResourceClick = (resource: typeof resources[0]) => {
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

  // Separate featured (first 2) and compact (rest)
  const featured = resources.slice(0, 2);
  const compact = resources.slice(2);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-white overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A4F55' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header - Matching system pattern */}
        <motion.div 
          className="mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#E40E20]" />
                <span className="text-[#7A858C] text-sm tracking-[0.2em] uppercase">
                  Planifica tu Viaje
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4A4F55] tracking-tight">
                Recursos para
                <br />
                <span className="text-[#E40E20]">Viajeros</span>
              </h2>
            </div>
            
            {/* Subtitle */}
            <p className="text-[#7A858C] text-sm max-w-xs">
              Herramientas y guías para que tu experiencia sea inolvidable
            </p>
          </div>
        </motion.div>

        {/* Sustainability Tip - Refined */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 text-[#7A858C] text-sm">
            <Leaf className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p>
              <span className="text-[#4A4F55] font-medium">Viaja sostenible:</span>
              {" "}Apoya la economía local · Respeta el medio ambiente · Preserva las tradiciones
            </p>
          </div>
        </motion.div>

        {/* Desktop Grid - Asymmetric, editorial (matching UpcomingEvents) */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-6">
            {/* Featured resources - larger */}
            {featured.map((resource, i) => (
              <div key={resource.id} className="col-span-5">
                <FeaturedCard 
                  resource={resource} 
                  index={i}
                  onClick={() => handleResourceClick(resource)}
                />
              </div>
            ))}
            
            {/* Spacer for asymmetry */}
            <div className="col-span-2" />
            
            {/* Compact resources - smaller grid */}
            <div className="col-span-12 grid grid-cols-4 gap-4 mt-6">
              {compact.map((resource, i) => (
                <CompactCard 
                  key={resource.id} 
                  resource={resource} 
                  index={i}
                  onClick={() => handleResourceClick(resource)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="lg:hidden grid grid-cols-2 gap-4">
          {resources.map((resource, i) => (
            <CompactCard 
              key={resource.id} 
              resource={resource} 
              index={i}
              onClick={() => handleResourceClick(resource)}
            />
          ))}
        </div>

        {/* CTA - View all / Download */}
        <motion.div 
          className="mt-14 lg:mt-20 flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <a
            href="/docs/guia-turismo.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#4A4F55] hover:bg-[#3a3f44] text-white rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Guía Completa</span>
          </a>
          
          <button
            onClick={() => setPlannerOpen(true)}
            className="inline-flex items-center gap-3 text-[#4A4F55] hover:text-[#E40E20] transition-colors group"
          >
            <span className="text-sm tracking-[0.15em] uppercase">Planificar con IA</span>
            <Sparkles className="w-4 h-4" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Planner Modal */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </section>
  );
}