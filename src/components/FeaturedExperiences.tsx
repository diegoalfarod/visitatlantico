"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  ArrowRight, 
  Clock, 
  Navigation,
  ChevronRight,
  Route,
  Flag,
  Waves
} from "lucide-react";
import { allRoutes, TouristRoute, getRouteBySlug } from "@/data/routes-data";

export { allRoutes, getRouteBySlug };
export type { TouristRoute };

// =============================================================================
// DESIGN TOKENS - Light Theme
// =============================================================================

const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

// =============================================================================
// DECORATIVE ELEMENTS - Identidad regional
// =============================================================================

function RiverPattern({ color, className }: { color: string; className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 60" 
      className={className}
      style={{ opacity: 0.08 }}
    >
      <path
        d="M0,30 Q25,10 50,30 T100,30 T150,30 T200,30"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M0,40 Q25,20 50,40 T100,40 T150,40 T200,40"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function CarnivalAccent({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className}>
      <circle cx="30" cy="30" r="4" fill={color} opacity="0.15" />
      <circle cx="30" cy="30" r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.1" />
      <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.08" />
      <circle cx="30" cy="8" r="2" fill={color} opacity="0.12" />
      <circle cx="52" cy="30" r="2" fill={color} opacity="0.12" />
      <circle cx="30" cy="52" r="2" fill={color} opacity="0.12" />
      <circle cx="8" cy="30" r="2" fill={color} opacity="0.12" />
    </svg>
  );
}

// =============================================================================
// TIMELINE STOP - Componente individual para cada parada con su propio hover state
// =============================================================================

function TimelineStop({ 
  stop, 
  index, 
  color, 
  isOnImage,
  delay 
}: { 
  stop: { id: string; name: string }; 
  index: number; 
  color: string; 
  isOnImage: boolean;
  delay: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ zIndex: isHovered ? 50 : 10 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Punto */}
      <motion.div 
        className="w-2.5 h-2.5 rounded-full transition-transform duration-200"
        style={{ 
          backgroundColor: isOnImage ? 'white' : color,
          transform: isHovered ? 'scale(1.6)' : 'scale(1)'
        }}
      />
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <div 
              className="px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap shadow-xl"
              style={{ 
                backgroundColor: color, 
                color: 'white',
                boxShadow: `0 4px 20px ${color}50`
              }}
            >
              <span className="opacity-60 mr-1">{index + 1}.</span>
              {stop.name}
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
                style={{ borderTopColor: color }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// TIMELINE START POINT - Punto de inicio con hover independiente
// =============================================================================

function TimelineStartPoint({ color, isOnImage }: { color: string; isOnImage: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative cursor-pointer"
      style={{ zIndex: isHovered ? 50 : 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`w-3 h-3 rounded-full ${isOnImage ? 'ring-2 ring-white/30' : 'ring-2 ring-white'}`}
        style={{ 
          backgroundColor: color,
          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
          transition: 'transform 0.2s'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      />
      {/* Pulso */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <div 
              className="px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap shadow-xl"
              style={{ 
                backgroundColor: color, 
                color: 'white',
                boxShadow: `0 4px 20px ${color}50`
              }}
            >
              🚩 Inicio
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
                style={{ borderTopColor: color }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// TIMELINE END FLAG - Bandera final con hover independiente
// =============================================================================

function TimelineEndFlag({ color, isOnImage }: { color: string; isOnImage: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ zIndex: isHovered ? 50 : 10 }}
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.5, type: "spring" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        style={{ 
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
          transition: 'transform 0.2s'
        }}
      >
        <Flag className="w-3.5 h-3.5" style={{ color: isOnImage ? 'white' : color }} />
      </motion.div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <div 
              className="px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap shadow-xl"
              style={{ 
                backgroundColor: color, 
                color: 'white',
                boxShadow: `0 4px 20px ${color}50`
              }}
            >
              🏁 Meta
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
                style={{ borderTopColor: color }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// ROUTE TIMELINE - Timeline principal usando componentes individuales
// =============================================================================

function RouteTimeline({ route, variant = 'light' }: { route: TouristRoute; variant?: 'light' | 'onImage' }) {
  const visibleStops = route.stops.slice(0, 4);
  const isOnImage = variant === 'onImage';
  
  return (
    <div className="flex items-center gap-0.5 relative">
      {/* Punto de inicio */}
      <TimelineStartPoint color={route.color} isOnImage={isOnImage} />
      
      {/* Paradas */}
      {visibleStops.map((stop, idx) => (
        <div key={stop.id} className="flex items-center">
          {/* Línea conectora animada */}
          <motion.div 
            className="h-[2px] w-6 sm:w-8 relative overflow-hidden"
            style={{ backgroundColor: isOnImage ? 'rgba(255,255,255,0.3)' : `${route.color}25` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2"
              style={{ backgroundColor: isOnImage ? 'white' : route.color }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
            />
          </motion.div>
          
          {/* Punto de parada */}
          <TimelineStop 
            stop={stop}
            index={idx}
            color={route.color}
            isOnImage={isOnImage}
            delay={0.15 + idx * 0.08}
          />
        </div>
      ))}
      
      {/* Línea final */}
      <motion.div 
        className="h-[2px] w-4 sm:w-6"
        style={{ backgroundColor: isOnImage ? 'rgba(255,255,255,0.3)' : `${route.color}25` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4 }}
      />
      
      {/* Bandera de llegada */}
      <TimelineEndFlag color={route.color} isOnImage={isOnImage} />
      
      {/* Indicador de paradas adicionales */}
      {route.stops.length > 4 && (
        <span 
          className={`text-[10px] ml-1.5 font-medium ${isOnImage ? 'text-white/60' : 'text-gray-400'}`}
        >
          +{route.stops.length - 4}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// ROUTE CARD
// =============================================================================

function RouteCard({ 
  route, 
  index,
  isSelected,
  onSelect
}: { 
  route: TouristRoute;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = route.icon;
  
  // Determinar posición de imagen según la ruta
  const getImagePosition = () => {
    if (route.slug === 'ruta-de-aves') return 'top'; // Mostrar cabeza del pájaro
    return 'center';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE_CINEMATIC }}
    >
      <button
        onClick={onSelect}
        className={`w-full text-left group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 border ${
          isSelected 
            ? 'ring-2 shadow-xl scale-[1.02]' 
            : 'shadow-md hover:shadow-lg hover:scale-[1.01] border-gray-100'
        }`}
        style={{ 
          ringColor: isSelected ? route.color : 'transparent',
          borderColor: isSelected ? route.color : undefined
        }}
      >
        {/* Decoración de esquina */}
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
          <CarnivalAccent color={route.color} className="w-full h-full" />
        </div>
        
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={route.image}
            alt={route.title}
            fill
            className={`object-cover transition-transform duration-700 ${
              isSelected ? 'scale-105' : 'group-hover:scale-105'
            }`}
            style={{ objectPosition: getImagePosition() }}
            sizes="(max-width: 768px) 100vw, 350px"
          />
          
          {/* Gradiente sutil */}
          <div 
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
            }}
          />
          
          {/* Badge de ruta */}
          <div className="absolute top-3 left-3">
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white shadow-lg"
              style={{ backgroundColor: route.color }}
            >
              <Route className="w-3 h-3" />
              <span 
                className="text-[10px] font-bold tracking-wider"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                RUTA 0{index + 1}
              </span>
            </div>
          </div>
          
          {/* Icono */}
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-md">
              <Icon className="w-5 h-5" style={{ color: route.color }} />
            </div>
          </div>
          
          {/* Timeline sobre imagen */}
          <div className="absolute bottom-3 left-3 right-3">
            <RouteTimeline route={route} variant="onImage" />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 relative">
          {/* River accent sutil */}
          <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden pointer-events-none opacity-50">
            <RiverPattern color={route.color} className="w-full h-full" />
          </div>
          
          <h3 
            className="text-lg font-bold text-gray-900 mb-1 leading-tight"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {route.title}
          </h3>
          
          <p 
            className="text-sm font-medium mb-3 transition-colors duration-300"
            style={{ 
              fontFamily: "'Josefin Sans', sans-serif",
              color: route.color
            }}
          >
            {route.tagline}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-500 text-xs">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${route.color}15` }}
              >
                <Clock className="w-3 h-3" style={{ color: route.color }} />
              </div>
              {route.duration}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-xs">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${route.color}15` }}
              >
                <MapPin className="w-3 h-3" style={{ color: route.color }} />
              </div>
              {route.stops.length} paradas
            </span>
          </div>
        </div>
        
        {/* Barra inferior de selección */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: route.color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </button>
    </motion.div>
  );
}

// =============================================================================
// ROUTE DETAIL PANEL
// =============================================================================

function RouteDetailPanel({ route }: { route: TouristRoute }) {
  const Icon = route.icon;
  
  // Determinar posición de imagen según la ruta
  const getImagePosition = () => {
    if (route.slug === 'ruta-de-aves') return 'top';
    return 'center';
  };
  
  return (
    <motion.div
      key={route.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
      className="h-full"
    >
      <div className="h-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-gray-100">
        {/* Decoraciones */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40">
            <CarnivalAccent color={route.color} className="w-full h-full" />
          </div>
          <div className="absolute -bottom-5 -left-5 w-28 h-28 rotate-45">
            <CarnivalAccent color={route.color} className="w-full h-full" />
          </div>
        </div>
        
        {/* Hero image */}
        <div className="relative h-44 flex-shrink-0">
          <Image
            src={route.image}
            alt={route.title}
            fill
            className="object-cover"
            style={{ objectPosition: getImagePosition() }}
            sizes="500px"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0.5) 30%, transparent 60%)'
            }}
          />
          
          {/* Icono flotante */}
          <div 
            className="absolute -bottom-7 left-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ backgroundColor: route.color }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          {/* Badge de dificultad */}
          <div className="absolute top-4 right-4">
            <span 
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider text-white shadow-md"
              style={{ backgroundColor: route.color }}
            >
              {route.difficulty === 'easy' ? '🌴 FÁCIL' : 
               route.difficulty === 'moderate' ? '⛰️ MODERADO' : '🏔️ DESAFIANTE'}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col p-6 pt-10 relative z-10">
          
          {/* Header */}
          <div className="mb-4">
            <h2 
              className="text-2xl font-bold text-gray-900 leading-tight mb-1"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {route.title}
            </h2>
            
            <p 
              className="text-base font-medium"
              style={{ color: route.color, fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {route.tagline}
            </p>
          </div>
          
          {/* Description */}
          <p 
            className="text-gray-500 text-sm leading-relaxed mb-5"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {route.description}
          </p>
          
          {/* Recorrido */}
          <div className="flex-1 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${route.color}15` }}
              >
                <Route className="w-3.5 h-3.5" style={{ color: route.color }} />
              </div>
              <span 
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Tu recorrido
              </span>
            </div>
            
            <div className="relative pl-4">
              {/* Línea vertical */}
              <div 
                className="absolute left-[7px] top-1 bottom-1 w-0.5 rounded-full"
                style={{ backgroundColor: `${route.color}20` }}
              />
              
              <div className="space-y-3">
                {route.stops.slice(0, 4).map((stop, idx) => (
                  <motion.div
                    key={stop.id}
                    className="flex items-center gap-3 relative group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* Punto numerado */}
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white relative z-10 ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: route.color }}
                    >
                      {idx + 1}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex items-center justify-between py-1">
                      <span className="text-gray-700 text-sm font-medium truncate">
                        {stop.name}
                      </span>
                      <span className="text-gray-400 text-[11px] flex-shrink-0 ml-2">
                        {stop.duration}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {route.stops.length > 4 && (
                  <div className="flex items-center gap-3 pl-0.5">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `${route.color}30` }}
                    />
                    <span className="text-gray-400 text-xs">
                      +{route.stops.length - 4} paradas más
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div 
            className="flex items-center gap-2 p-3 rounded-xl mb-4 border"
            style={{ 
              backgroundColor: `${route.color}05`,
              borderColor: `${route.color}15`
            }}
          >
            <div className="flex-1 text-center py-1">
              <div className="text-lg font-bold" style={{ color: route.color }}>
                {route.duration}
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">
                Duración
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex-1 text-center py-1">
              <div className="text-lg font-bold" style={{ color: route.color }}>
                {route.stops.length}
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">
                Paradas
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex-1 text-center py-1">
              <div className="text-lg font-bold" style={{ color: route.color }}>
                ${route.estimatedBudget.low}k
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider">
                Desde COP
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <Link 
            href={`/rutas/${route.slug}`}
            className="group relative flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            style={{ 
              backgroundColor: route.color,
              fontFamily: "'Josefin Sans', sans-serif"
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Navigation className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Comenzar aventura</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MOBILE ROUTE CARD
// =============================================================================

function MobileRouteCard({ route, index }: { route: TouristRoute; index: number }) {
  const Icon = route.icon;
  
  // Determinar posición de imagen según la ruta
  const getImagePosition = () => {
    if (route.slug === 'ruta-de-aves') return 'top';
    return 'center';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_CINEMATIC }}
    >
      <Link href={`/rutas/${route.slug}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 group-active:scale-[0.98] hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={route.image}
              alt={route.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: getImagePosition() }}
              sizes="100vw"
            />
            
            <div 
              className="absolute inset-x-0 bottom-0 h-20"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
              }}
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3">
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white shadow-lg"
                style={{ backgroundColor: route.color }}
              >
                <Route className="w-3 h-3" />
                <span 
                  className="text-[10px] font-bold tracking-wider"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  RUTA 0{index + 1}
                </span>
              </div>
            </div>
            
            <div className="absolute top-3 right-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-md">
                <Icon className="w-5 h-5" style={{ color: route.color }} />
              </div>
            </div>
            
            {/* Timeline */}
            <div className="absolute bottom-3 left-3 right-3">
              <RouteTimeline route={route} variant="onImage" />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 
              className="text-lg font-bold text-gray-900 mb-1"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {route.title}
            </h3>
            
            <p 
              className="text-sm font-medium mb-3"
              style={{ color: route.color, fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {route.tagline}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {route.duration}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {route.stops.length} paradas
                </span>
              </div>
              
              <div 
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: route.color }}
              >
                <span>Explorar</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FeaturedExperiences() {
  const [selectedId, setSelectedId] = useState<string>(allRoutes[0].id);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const selectedRoute = allRoutes.find(r => r.id === selectedId) || allRoutes[0];

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-white"
    >
      {/* Patrón de puntos sutil */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Decoraciones flotantes */}
      <div className="absolute top-20 left-10 w-32 h-32 pointer-events-none">
        <CarnivalAccent color={selectedRoute.color} className="w-full h-full" />
      </div>
      <div className="absolute bottom-40 right-10 w-24 h-24 pointer-events-none">
        <CarnivalAccent color={selectedRoute.color} className="w-full h-full" />
      </div>
      
      {/* Río decorativo */}
      <div className="absolute top-1/3 left-0 right-0 h-20 pointer-events-none">
        <RiverPattern color={selectedRoute.color} className="w-full h-full" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 lg:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm bg-white"
              style={{ borderColor: `${selectedRoute.color}30` }}
            >
              <Waves className="w-4 h-4" style={{ color: selectedRoute.color }} />
              <span 
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ 
                  color: selectedRoute.color,
                  fontFamily: "'Josefin Sans', sans-serif" 
                }}
              >
                Rutas del Atlántico
              </span>
            </div>
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            Vive la experiencia{" "}
            <span style={{ color: selectedRoute.color }}>Caribe</span>
          </h2>
          
          <p 
            className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Recorre los mejores destinos del departamento con rutas diseñadas para 
            descubrir nuestra cultura, naturaleza y tradiciones
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          
          {/* Route Cards */}
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {allRoutes.map((route, i) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  index={i}
                  isSelected={selectedId === route.id}
                  onSelect={() => setSelectedId(route.id)}
                />
              ))}
            </div>
            
            {/* CTA */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                href="/planificador"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all text-sm font-medium border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                <span>✨</span>
                <span>Crear mi propia ruta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
          
          {/* Detail Panel */}
          <div className="col-span-5">
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                <RouteDetailPanel key={selectedId} route={selectedRoute} />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {allRoutes.map((route, i) => (
            <MobileRouteCard key={route.id} route={route} index={i} />
          ))}
          
          {/* Mobile CTA */}
          <motion.div
            className="pt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/planificador"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-gray-600 font-medium border border-gray-200 bg-white shadow-sm"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              <span>✨</span>
              <span>Crear ruta personalizada</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}