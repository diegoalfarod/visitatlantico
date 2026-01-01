"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  MapPin, 
  Clock, 
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Check,
  AlertTriangle,
  Car,
  Bus,
  Navigation,
  Play,
  Pause,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  BookmarkCheck,
  Sun,
  Wallet,
  Trophy,
  Sparkles,
  Info,
  Route,
  Target
} from "lucide-react";
import { TouristRoute, RouteStop } from "@/data/routes-data";

// =============================================================================
// TYPES
// =============================================================================

interface RoutePageProps {
  route: TouristRoute;
}

interface StopStatus {
  isCompleted: boolean;
  completedAt?: Date;
  skipped?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function getEstimatedArrival(minutesFromNow: number): string {
  const arrival = new Date(Date.now() + minutesFromNow * 60000);
  return arrival.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (duration.includes('hora')) return num * 60;
    return num;
  }
  return 30;
}

// =============================================================================
// NAVIGATION HEADER
// =============================================================================

function NavigationHeader({ 
  route, 
  currentStopIndex,
  isNavigating,
  onToggleNavigation,
  onBack
}: { 
  route: TouristRoute;
  currentStopIndex: number;
  isNavigating: boolean;
  onToggleNavigation: () => void;
  onBack: () => void;
}) {
  const currentStop = route.stops[currentStopIndex];
  const Icon = route.icon;
  const progress = ((currentStopIndex) / route.stops.length) * 100;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-black/20">
        <motion.div 
          className="h-full"
          style={{ backgroundColor: route.color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div 
        className="backdrop-blur-xl border-b border-white/10"
        style={{ backgroundColor: 'rgba(10,10,10,0.9)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${route.color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: route.color }} />
                </div>
                <div>
                  <p className="text-xs text-white/50">Ruta activa</p>
                  <p className="text-sm font-semibold text-white">{route.title}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 mx-4 text-center">
              <p className="text-xs text-white/50">
                Parada {currentStopIndex + 1} de {route.stops.length}
              </p>
              <p className="text-sm font-medium text-white truncate">
                {currentStop.name}
              </p>
            </div>
            
            <button
              onClick={onToggleNavigation}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all"
              style={{ 
                backgroundColor: isNavigating ? route.color : 'rgba(255,255,255,0.1)',
                color: isNavigating ? 'white' : 'rgba(255,255,255,0.8)'
              }}
            >
              {isNavigating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">Navegar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CURRENT STOP CARD
// =============================================================================

function CurrentStopCard({ 
  stop, 
  index,
  totalStops,
  status,
  themeColor,
  onComplete,
  onSkip,
  onOpenGallery,
  onOpenMaps
}: { 
  stop: RouteStop;
  index: number;
  totalStops: number;
  status: StopStatus;
  themeColor: string;
  onComplete: () => void;
  onSkip: () => void;
  onOpenGallery: () => void;
  onOpenMaps: () => void;
}) {
  const Icon = stop.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div 
        className="relative aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group"
        onClick={onOpenGallery}
      >
        <Image
          src={stop.image}
          alt={stop.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, ${themeColor}20 40%, transparent 100%)`
          }}
        />
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            {index + 1}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
            <span className="text-xs text-white/80">
              de {totalStops} paradas
            </span>
          </div>
        </div>
        
        {stop.gallery && stop.gallery.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur-sm">
            <Camera className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">+{stop.gallery.length}</span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {stop.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-white/70">
            <span className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4" />
              {stop.duration}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Icon className="w-4 h-4" />
              {stop.activities.length} actividades
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-4">
        <button
          onClick={onOpenMaps}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
        >
          <Navigation className="w-5 h-5" />
          <span>Cómo llegar</span>
        </button>
        
        {status.isCompleted ? (
          <div 
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-medium"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            <Check className="w-5 h-5" />
            <span>Completada</span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            <Check className="w-5 h-5" />
            <span>Completar</span>
          </button>
        )}
      </div>
      
      <div className="mt-6 p-5 rounded-xl bg-white/5">
        <p className="text-white/70 leading-relaxed">
          {stop.description}
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <Play className="w-4 h-4" style={{ color: themeColor }} />
          Qué hacer aquí
        </h3>
        <div className="space-y-2">
          {stop.activities.map((activity, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <span className="text-xs font-medium" style={{ color: themeColor }}>
                  {idx + 1}
                </span>
              </div>
              <span className="text-sm text-white/70">{activity}</span>
            </div>
          ))}
        </div>
      </div>
      
      {stop.tips && stop.tips.length > 0 && (
        <div 
          className="mt-4 p-4 rounded-xl"
          style={{ backgroundColor: `${themeColor}10`, borderLeft: `3px solid ${themeColor}` }}
        >
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: themeColor }}>
            <Sparkles className="w-4 h-4" />
            Tips del local
          </h4>
          <ul className="space-y-1.5">
            {stop.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-white/60 flex items-start gap-2">
                <span style={{ color: themeColor }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {!status.isCompleted && (
        <button
          onClick={onSkip}
          className="w-full mt-4 py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          Saltar esta parada →
        </button>
      )}
    </motion.div>
  );
}

// =============================================================================
// ROUTE OVERVIEW
// =============================================================================

function RouteOverview({ 
  route, 
  stopStatuses,
  currentStopIndex,
  onSelectStop,
  themeColor
}: { 
  route: TouristRoute;
  stopStatuses: Map<string, StopStatus>;
  currentStopIndex: number;
  onSelectStop: (index: number) => void;
  themeColor: string;
}) {
  const completedCount = Array.from(stopStatuses.values()).filter(s => s.isCompleted).length;
  
  let cumulativeTime = 0;
  const stopTimes = route.stops.map((stop, idx) => {
    const time = cumulativeTime;
    cumulativeTime += parseDuration(stop.duration);
    if (idx < route.stops.length - 1) cumulativeTime += 15;
    return time;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Trophy className="w-6 h-6" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {completedCount}/{route.stops.length}
            </p>
            <p className="text-xs text-white/50">paradas completadas</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {formatTime(cumulativeTime)}
          </p>
          <p className="text-xs text-white/50">tiempo total</p>
        </div>
      </div>
      
      <div className="space-y-1">
        {route.stops.map((stop, idx) => {
          const status = stopStatuses.get(stop.id) || { isCompleted: false };
          const isCurrent = idx === currentStopIndex;
          
          return (
            <button
              key={stop.id}
              onClick={() => onSelectStop(idx)}
              className="w-full text-left"
            >
              <div 
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                style={isCurrent ? { 
                  border: `1px solid ${themeColor}40`,
                  backgroundColor: `${themeColor}10`
                } : {}}
              >
                {idx < route.stops.length - 1 && (
                  <div 
                    className="absolute left-[30px] top-[56px] w-0.5 h-[calc(100%-24px)]"
                    style={{ 
                      backgroundColor: status.isCompleted ? themeColor : 'rgba(255,255,255,0.1)'
                    }}
                  />
                )}
                
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all"
                  style={{ 
                    backgroundColor: status.isCompleted ? themeColor : isCurrent ? `${themeColor}30` : 'rgba(255,255,255,0.1)',
                    border: isCurrent && !status.isCompleted ? `2px solid ${themeColor}` : 'none'
                  }}
                >
                  {status.isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span 
                      className="text-xs font-bold"
                      style={{ color: isCurrent ? themeColor : 'rgba(255,255,255,0.5)' }}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p 
                      className={`font-medium truncate ${
                        status.isCompleted ? 'text-white/50 line-through' : 
                        isCurrent ? 'text-white' : 'text-white/80'
                      }`}
                    >
                      {stop.name}
                    </p>
                    {isCurrent && (
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ backgroundColor: themeColor, color: 'white' }}
                      >
                        Actual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {stop.duration}
                    </span>
                    <span className="text-xs text-white/40">
                      ETA: {getEstimatedArrival(stopTimes[idx])}
                    </span>
                  </div>
                </div>
                
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={stop.image}
                    alt={stop.name}
                    fill
                    className={`object-cover ${status.isCompleted ? 'opacity-50' : ''}`}
                    sizes="56px"
                  />
                  {status.isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Check className="w-5 h-5" style={{ color: themeColor }} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// BOTTOM NAVIGATION
// =============================================================================

function BottomNavigation({ 
  route,
  currentStopIndex,
  stopStatuses,
  onPrevious,
  onNext,
  onComplete,
  themeColor
}: { 
  route: TouristRoute;
  currentStopIndex: number;
  stopStatuses: Map<string, StopStatus>;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  themeColor: string;
}) {
  const currentStop = route.stops[currentStopIndex];
  const status = stopStatuses.get(currentStop.id) || { isCompleted: false };
  const isFirst = currentStopIndex === 0;
  const isLast = currentStopIndex === route.stops.length - 1;
  const nextStop = !isLast ? route.stops[currentStopIndex + 1] : null;
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10"
      style={{ backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isFirst ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          {status.isCompleted ? (
            isLast ? (
              <div 
                className="flex-1 flex items-center justify-center gap-3 py-3 rounded-xl"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Trophy className="w-5 h-5" style={{ color: themeColor }} />
                <span className="font-semibold" style={{ color: themeColor }}>
                  ¡Ruta completada!
                </span>
              </div>
            ) : (
              <button
                onClick={onNext}
                className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                    <Image
                      src={nextStop!.image}
                      alt={nextStop!.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Siguiente parada</p>
                    <p className="text-sm font-medium text-white">{nextStop!.name}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </button>
            )
          ) : (
            <button
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: themeColor }}
            >
              <Check className="w-5 h-5" />
              <span>Marcar como completada</span>
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={isLast}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isLast ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COLLAPSIBLE PANELS
// =============================================================================

function RouteInfoPanel({ route, themeColor, isOpen, onToggle }: { 
  route: TouristRoute; themeColor: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5" style={{ color: themeColor }} />
          <span className="font-medium text-white">Información de la ruta</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: themeColor }} />
                  <p className="text-sm font-semibold text-white">{route.duration}</p>
                  <p className="text-[10px] text-white/50">Duración</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <MapPin className="w-5 h-5 mx-auto mb-1" style={{ color: themeColor }} />
                  <p className="text-sm font-semibold text-white">{route.stops.length}</p>
                  <p className="text-[10px] text-white/50">Paradas</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <Wallet className="w-5 h-5 mx-auto mb-1" style={{ color: themeColor }} />
                  <p className="text-sm font-semibold text-white">${route.estimatedBudget.low}k</p>
                  <p className="text-[10px] text-white/50">Desde</p>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/50 mb-1">Mejor momento</p>
                <p className="text-sm text-white">{route.bestTime}</p>
              </div>
              
              <div>
                <p className="text-xs text-white/50 mb-2">Qué llevar</p>
                <div className="flex flex-wrap gap-2">
                  {route.whatToBring.slice(0, 5).map((item, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70">{item}</span>
                  ))}
                </div>
              </div>
              
              {route.warnings && route.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">Ten en cuenta</span>
                  </div>
                  <ul className="space-y-1">
                    {route.warnings.map((warning, idx) => (
                      <li key={idx} className="text-xs text-white/60">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TransportPanel({ route, themeColor, isOpen, onToggle }: { 
  route: TouristRoute; themeColor: string; isOpen: boolean; onToggle: () => void;
}) {
  const getIcon = (type: string) => type === 'car' ? Car : Bus;
  
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5" style={{ color: themeColor }} />
          <span className="font-medium text-white">Cómo llegar</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-3">
              {route.transport.map((option, idx) => {
                const Icon = getIcon(option.type);
                return (
                  <div key={idx} className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5" style={{ color: themeColor }} />
                      <div>
                        <p className="font-medium text-white">{option.name}</p>
                        <p className="text-xs text-white/50">{option.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{option.description}</p>
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                      {option.cost}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// VIEW TOGGLE
// =============================================================================

function ViewToggle({ activeView, onChangeView, themeColor }: { 
  activeView: 'current' | 'overview'; onChangeView: (view: 'current' | 'overview') => void; themeColor: string;
}) {
  return (
    <div className="flex rounded-xl bg-white/5 p-1">
      <button
        onClick={() => onChangeView('current')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'current' ? 'text-white' : 'text-white/50'}`}
        style={activeView === 'current' ? { backgroundColor: themeColor } : {}}
      >
        <Target className="w-4 h-4" />
        <span>Parada actual</span>
      </button>
      <button
        onClick={() => onChangeView('overview')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'overview' ? 'text-white' : 'text-white/50'}`}
        style={activeView === 'overview' ? { backgroundColor: themeColor } : {}}
      >
        <Route className="w-4 h-4" />
        <span>Ver ruta</span>
      </button>
    </div>
  );
}

// =============================================================================
// CELEBRATION & GALLERY MODALS
// =============================================================================

function CompletionCelebration({ route, onClose, onShare }: { route: TouristRoute; onClose: () => void; onShare: () => void; }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md text-center">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${route.color}20` }}>
          <Trophy className="w-12 h-12" style={{ color: route.color }} />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Felicitaciones!</h2>
        <p className="text-lg text-white/70 mb-2">Completaste la ruta</p>
        <p className="text-xl font-semibold mb-8" style={{ color: route.color }}>{route.title}</p>
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{route.stops.length}</p>
            <p className="text-xs text-white/50">Paradas visitadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{route.duration}</p>
            <p className="text-xs text-white/50">Tiempo total</p>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={onShare} className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: route.color }}>
            <Share2 className="w-5 h-5" />
            Compartir logro
          </button>
          <button onClick={onClose} className="w-full py-4 rounded-xl font-semibold text-white/70 bg-white/10">Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GalleryModal({ images, title, onClose }: { images: string[]; title: string; onClose: () => void; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-10" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>
      <div className="absolute top-4 left-4 text-white z-10">
        <p className="text-sm text-white/60">{currentIndex + 1} / {images.length}</p>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {images.length > 1 && (
        <>
          <button className="absolute left-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-10" onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + images.length) % images.length); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="absolute right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-10" onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % images.length); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      <motion.div key={currentIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full max-w-4xl max-h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <Image src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} fill className="object-contain" sizes="100vw" />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function RoutePage({ route }: RoutePageProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [stopStatuses, setStopStatuses] = useState<Map<string, StopStatus>>(new Map());
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeView, setActiveView] = useState<'current' | 'overview'>('current');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showTransportPanel, setShowTransportPanel] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [galleryData, setGalleryData] = useState<{ images: string[]; title: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const currentStop = route.stops[currentStopIndex];
  
  const completeCurrentStop = useCallback(() => {
    setStopStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(currentStop.id, { isCompleted: true, completedAt: new Date() });
      return newMap;
    });
    const newCompletedCount = Array.from(stopStatuses.values()).filter(s => s.isCompleted).length + 1;
    if (newCompletedCount === route.stops.length) {
      setTimeout(() => setShowCelebration(true), 500);
    }
  }, [currentStop.id, stopStatuses, route.stops.length]);
  
  const skipCurrentStop = useCallback(() => {
    setStopStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(currentStop.id, { isCompleted: false, skipped: true });
      return newMap;
    });
    if (currentStopIndex < route.stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
    }
  }, [currentStop.id, currentStopIndex, route.stops.length]);
  
  const goToNextStop = useCallback(() => {
    if (currentStopIndex < route.stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
      setActiveView('current');
    }
  }, [currentStopIndex, route.stops.length]);
  
  const goToPreviousStop = useCallback(() => {
    if (currentStopIndex > 0) {
      setCurrentStopIndex(prev => prev - 1);
      setActiveView('current');
    }
  }, [currentStopIndex]);
  
  const openMaps = useCallback(() => {
    if (currentStop.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${currentStop.coordinates.lat},${currentStop.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentStop.name + ' ' + route.title)}`;
      window.open(url, '_blank');
    }
  }, [currentStop, route.title]);
  
  const openGallery = useCallback(() => {
    const images = [currentStop.image, ...(currentStop.gallery || [])];
    setGalleryData({ images, title: currentStop.name });
  }, [currentStop]);
  
  const shareRoute = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Completé la ruta ${route.title}`,
          text: `¡Acabo de completar la ruta "${route.title}" en el Atlántico, Colombia!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  }, [route.title]);
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <NavigationHeader 
        route={route}
        currentStopIndex={currentStopIndex}
        isNavigating={isNavigating}
        onToggleNavigation={() => setIsNavigating(!isNavigating)}
        onBack={() => window.history.back()}
      />
      
      <div className="pt-[72px] pb-[100px]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isSaved ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" style={{ color: route.color }} /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Guardada' : 'Guardar'}</span>
              </button>
              <button onClick={shareRoute} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm font-medium">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/70">32°C</span>
            </div>
          </div>
          
          <div className="mb-6">
            <ViewToggle activeView={activeView} onChangeView={setActiveView} themeColor={route.color} />
          </div>
          
          <AnimatePresence mode="wait">
            {activeView === 'current' ? (
              <motion.div key="current" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <CurrentStopCard 
                  stop={currentStop}
                  index={currentStopIndex}
                  totalStops={route.stops.length}
                  status={stopStatuses.get(currentStop.id) || { isCompleted: false }}
                  themeColor={route.color}
                  onComplete={completeCurrentStop}
                  onSkip={skipCurrentStop}
                  onOpenGallery={openGallery}
                  onOpenMaps={openMaps}
                />
              </motion.div>
            ) : (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <RouteOverview 
                  route={route}
                  stopStatuses={stopStatuses}
                  currentStopIndex={currentStopIndex}
                  onSelectStop={(idx) => { setCurrentStopIndex(idx); setActiveView('current'); }}
                  themeColor={route.color}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-6 space-y-3">
            <RouteInfoPanel route={route} themeColor={route.color} isOpen={showInfoPanel} onToggle={() => setShowInfoPanel(!showInfoPanel)} />
            <TransportPanel route={route} themeColor={route.color} isOpen={showTransportPanel} onToggle={() => setShowTransportPanel(!showTransportPanel)} />
          </div>
        </div>
      </div>
      
      <BottomNavigation 
        route={route}
        currentStopIndex={currentStopIndex}
        stopStatuses={stopStatuses}
        onPrevious={goToPreviousStop}
        onNext={goToNextStop}
        onComplete={completeCurrentStop}
        themeColor={route.color}
      />
      
      <AnimatePresence>
        {showCelebration && <CompletionCelebration route={route} onClose={() => setShowCelebration(false)} onShare={shareRoute} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {galleryData && <GalleryModal images={galleryData.images} title={galleryData.title} onClose={() => setGalleryData(null)} />}
      </AnimatePresence>
    </div>
  );
}