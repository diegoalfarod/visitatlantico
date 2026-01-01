"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, Clock, MapPin, Users, ChevronRight, Filter,
  Search, X, Star, ArrowRight, Compass
} from "lucide-react";
import { itineraries, type Itinerary } from "@/components/FeaturedExperiences";

/* ============================================
   FILTER OPTIONS
   ============================================ */

const durationFilters = [
  { label: "Todos", value: "all" },
  { label: "1 día", value: "1" },
  { label: "2 días", value: "2" },
  { label: "3+ días", value: "3+" },
];

const difficultyFilters = [
  { label: "Todos", value: "all" },
  { label: "Fácil", value: "Fácil" },
  { label: "Moderado", value: "Moderado" },
  { label: "Aventurero", value: "Aventurero" },
];

const categoryFilters = [
  { label: "Todos", value: "all" },
  { label: "Playas", value: "Playas" },
  { label: "Cultura", value: "Cultura" },
  { label: "Gastronomía", value: "Gastronomía" },
  { label: "Naturaleza", value: "Naturaleza" },
  { label: "Artesanías", value: "Artesanías" },
];

/* ============================================
   COMPONENTS
   ============================================ */

const ExperienceCard = ({ itinerary, index }: { itinerary: Itinerary; index: number }) => {
  const Icon = itinerary.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/experiencias/${itinerary.slug}`}>
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <div className="absolute inset-0 bg-slate-200">
              <div className={`absolute inset-0 bg-gradient-to-br ${itinerary.gradient} opacity-30`} />
            </div>
            <Image
              src={itinerary.image}
              alt={itinerary.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                {itinerary.duration}
              </span>
              
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: itinerary.color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-1">{itinerary.title}</h3>
              <p className="text-white/80 text-sm">{itinerary.tagline}</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
              {itinerary.description}
            </p>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {itinerary.categories.slice(0, 3).map((cat, i) => (
                <span 
                  key={i} 
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                >
                  {cat}
                </span>
              ))}
            </div>
            
            {/* Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {itinerary.municipalities.length} lugares
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {itinerary.groupSize}
                </span>
              </div>
              
              <span 
                className="flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2"
                style={{ color: itinerary.color }}
              >
                Explorar
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ============================================
   MAIN PAGE COMPONENT
   ============================================ */

export default function ExperienciasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredItineraries = useMemo(() => {
    return itineraries.filter(itinerary => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          itinerary.title.toLowerCase().includes(query) ||
          itinerary.description.toLowerCase().includes(query) ||
          itinerary.municipalities.some(m => m.toLowerCase().includes(query)) ||
          itinerary.categories.some(c => c.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Duration
      if (durationFilter !== "all") {
        if (durationFilter === "3+") {
          if (itinerary.durationDays < 3) return false;
        } else {
          if (itinerary.durationDays !== parseInt(durationFilter)) return false;
        }
      }
      
      // Difficulty
      if (difficultyFilter !== "all") {
        if (itinerary.difficulty !== difficultyFilter) return false;
      }
      
      // Category
      if (categoryFilter !== "all") {
        if (!itinerary.categories.includes(categoryFilter)) return false;
      }
      
      return true;
    });
  }, [searchQuery, durationFilter, difficultyFilter, categoryFilter]);
  
  const clearFilters = () => {
    setSearchQuery("");
    setDurationFilter("all");
    setDifficultyFilter("all");
    setCategoryFilter("all");
  };
  
  const hasActiveFilters = searchQuery || durationFilter !== "all" || difficultyFilter !== "all" || categoryFilter !== "all";
  
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative bg-slate-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              <span>Experiencias Curadas</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Descubre el <span className="text-red-400">Atlántico</span>
            </h1>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Itinerarios diseñados por expertos locales para que vivas experiencias 
              auténticas en el corazón del Caribe colombiano.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar experiencias, lugares, categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block" preserveAspectRatio="none">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                  showFilters || hasActiveFilters 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {[durationFilter !== "all", difficultyFilter !== "all", categoryFilter !== "all", searchQuery].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            
            <p className="text-sm text-slate-500">
              {filteredItineraries.length} {filteredItineraries.length === 1 ? 'experiencia' : 'experiencias'} encontradas
            </p>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-6 mb-8 border border-slate-100 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duración</label>
                  <div className="flex flex-wrap gap-2">
                    {durationFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setDurationFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          durationFilter === filter.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dificultad</label>
                  <div className="flex flex-wrap gap-2">
                    {difficultyFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setDifficultyFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          difficultyFilter === filter.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setCategoryFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          categoryFilter === filter.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Results */}
          {filteredItineraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItineraries.map((itinerary, index) => (
                <ExperienceCard key={itinerary.id} itinerary={itinerary} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron experiencias</h3>
              <p className="text-slate-500 mb-4">Intenta ajustar tus filtros de búsqueda</p>
              <button
                onClick={clearFilters}
                className="text-red-600 font-medium hover:text-red-700"
              >
                Ver todas las experiencias
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            ¿Quieres una experiencia personalizada?
          </h2>
          <p className="text-slate-600 mb-8">
            Nuestro equipo puede crear un itinerario a medida según tus intereses, 
            tiempo disponible y preferencias.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full shadow-lg transition-all"
          >
            <Calendar className="w-5 h-5" />
            Planifica tu Viaje
          </Link>
        </div>
      </section>
    </main>
  );
}