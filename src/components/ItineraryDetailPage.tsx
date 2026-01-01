"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, MapPin, ChevronRight, ChevronDown,
  Sun, Check, Star, ArrowLeft, Share2, Heart, Bookmark,
  Lightbulb, Utensils, Download, Printer, Map,
  ExternalLink
} from "lucide-react";
// Importar desde el nuevo archivo de datos
import { allRoutes, getRouteBySlug, type TouristRoute, type RouteStop } from "@/data/routes-data";

interface ItineraryDetailPageProps {
  slug: string;
}

/* ============================================
   HELPER COMPONENTS
   ============================================ */

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    "easy": { color: "bg-green-100 text-green-700", label: "Fácil", dots: 1 },
    "moderate": { color: "bg-amber-100 text-amber-700", label: "Moderado", dots: 2 },
    "challenging": { color: "bg-red-100 text-red-700", label: "Aventurero", dots: 3 },
  };
  const { color, label, dots } = config[difficulty as keyof typeof config] || config["easy"];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <span className="flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-current' : 'bg-current/30'}`} />
        ))}
      </span>
      {label}
    </span>
  );
};

const StopCard = ({ 
  stop, 
  index, 
  isLast, 
  color,
  isExpanded,
  onToggle
}: { 
  stop: RouteStop;
  index: number;
  isLast: boolean;
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const Icon = stop.icon;
  
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200" />
      )}
      
      {/* Timeline dot */}
      <div 
        className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {index + 1}
      </div>
      
      {/* Stop Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <button 
          onClick={onToggle}
          className="w-full p-4 flex items-start justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-800">{stop.name}</h4>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stop.duration}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{stop.description}</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                {/* Activities */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    Qué hacer aquí
                  </h5>
                  <ul className="space-y-1.5">
                    {stop.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Tips */}
                {stop.tips && stop.tips.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {stop.tips.map((tip, idx) => (
                          <p key={idx} className="text-xs text-amber-800 leading-relaxed">{tip}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ============================================
   MAIN PAGE COMPONENT
   ============================================ */

export default function ItineraryDetailPage({ slug }: ItineraryDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'info'>('itinerary');
  const [isSaved, setIsSaved] = useState(false);
  const [expandedStops, setExpandedStops] = useState<string[]>([]);
  
  const route = useMemo(() => {
    return getRouteBySlug(slug);
  }, [slug]);
  
  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Ruta no encontrada</h1>
          <Link href="/#rutas" className="text-red-600 font-medium hover:underline">
            Ver todas las rutas
          </Link>
        </div>
      </div>
    );
  }
  
  const Icon = route.icon;
  
  const toggleStop = (stopId: string) => {
    setExpandedStops(prev => 
      prev.includes(stopId) 
        ? prev.filter(id => id !== stopId)
        : [...prev, stopId]
    );
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: route.title,
          text: route.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[350px] max-h-[450px]">
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-800">
          <Image
            src={route.image}
            alt={route.title}
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20" />
        </div>
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Volver</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                    isSaved ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'text-white fill-white' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-8">
            {/* Icon Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: route.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                Ruta Turística
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {route.title}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl">
              {route.tagline}
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{route.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{route.stops.length} paradas</span>
              </div>
              <DifficultyBadge difficulty={route.difficulty} />
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 -mt-4 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Sobre esta ruta</h2>
              <p className="text-slate-600 leading-relaxed">
                {route.longDescription}
              </p>
              
              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mt-4">
                {route.highlights.map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${route.color}15`, color: route.color }}
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Tab Headers */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                    activeTab === 'itinerary' 
                      ? 'text-slate-900' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  El Recorrido
                  {activeTab === 'itinerary' && (
                    <motion.div 
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: route.color }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                    activeTab === 'info' 
                      ? 'text-slate-900' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Información práctica
                  {activeTab === 'info' && (
                    <motion.div 
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: route.color }}
                    />
                  )}
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'itinerary' ? (
                    <motion.div
                      key="itinerary"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {/* Start/End Points */}
                      <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Punto de inicio</p>
                            <p className="text-sm font-medium text-slate-900">{route.startPoint}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Punto final</p>
                            <p className="text-sm font-medium text-slate-900">{route.endPoint}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stops Timeline */}
                      <div className="space-y-0">
                        {route.stops.map((stop, idx) => (
                          <StopCard
                            key={stop.id}
                            stop={stop}
                            index={idx}
                            isLast={idx === route.stops.length - 1}
                            color={route.color}
                            isExpanded={expandedStops.includes(stop.id)}
                            onToggle={() => toggleStop(stop.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Transport Options */}
                      <div>
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Map className="w-5 h-5" style={{ color: route.color }} />
                          Cómo llegar
                        </h3>
                        <div className="space-y-3">
                          {route.transport.map((option, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-slate-900">{option.name}</span>
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                                  {option.duration}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{option.description}</p>
                              <p className="text-sm font-medium" style={{ color: route.color }}>
                                Costo: {option.cost}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* What to Bring */}
                      <div className="pt-5 border-t border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-3">Qué llevar</h3>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {route.whatToBring.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <Check className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Warnings */}
                      {route.warnings && route.warnings.length > 0 && (
                        <div className="pt-5 border-t border-slate-100">
                          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Ten en cuenta
                          </h3>
                          <ul className="space-y-2">
                            {route.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {idx + 1}
                                </span>
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Información rápida</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Duración</p>
                      <p className="text-sm text-slate-600">{route.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Sun className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mejor momento</p>
                      <p className="text-sm text-slate-600">{route.bestTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Paradas</p>
                      <p className="text-sm text-slate-600">{route.stops.length} ubicaciones</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">💰</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Presupuesto estimado</p>
                      <p className="text-sm text-slate-600">
                        ${route.estimatedBudget.low} - ${route.estimatedBudget.high} {route.estimatedBudget.currency}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Accessibility */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-900 mb-2">Accesibilidad</p>
                  <p className="text-sm text-slate-600">{route.accessibility}</p>
                </div>
              </div>
              
              {/* Actions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Acciones</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isSaved 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'text-white hover:opacity-90'
                    }`}
                    style={{ backgroundColor: isSaved ? undefined : route.color }}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Guardado' : 'Guardar ruta'}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-full py-3 px-4 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Compartir
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full py-3 px-4 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir guía
                  </button>
                </div>
              </div>
              
              {/* Need Help Card */}
              <div 
                className="rounded-2xl p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${route.color} 0%, ${route.color}cc 100%)` }}
              >
                <h3 className="font-bold mb-2">¿Listo para explorar?</h3>
                <p className="text-sm text-white/80 mb-4">
                  Guarda esta ruta y compártela con tus compañeros de viaje.
                </p>
                <Link 
                  href="/#rutas"
                  className="block w-full py-2.5 px-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-sm text-center"
                >
                  Ver más rutas
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Routes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Otras rutas que te pueden interesar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {allRoutes
              .filter(r => r.id !== route.id)
              .slice(0, 3)
              .map((related) => {
                const RelatedIcon = related.icon;
                return (
                  <Link key={related.id} href={`/rutas/${related.slug}`}>
                    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative h-32">
                        <Image
                          src={related.image}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div 
                          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: related.color }}
                        >
                          <RelatedIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {related.duration}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}