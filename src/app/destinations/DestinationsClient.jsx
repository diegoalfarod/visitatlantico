"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Search as SearchIcon,
  MapPin,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// =============================================================================
// DESIGN SYSTEM - VisitAtlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#0f0f1a",
};

const EASE = [0.22, 1, 0.36, 1];

// =============================================================================
// CONSTANTS
// =============================================================================
const ITEMS_PER_PAGE = 12;

const CATEGORY_CONFIG = {
  Playas: { emoji: "🏖️", color: COLORS.azulBarranquero },
  EcoTurismo: { emoji: "🌱", color: COLORS.verdeBijao },
  Cultura: { emoji: "🎭", color: COLORS.rojoCayena },
  Naturaleza: { emoji: "🌿", color: COLORS.verdeBijao },
  Gastronomía: { emoji: "🍽️", color: COLORS.naranjaSalinas },
  Aventura: { emoji: "🚀", color: COLORS.amarilloArepa },
  Historia: { emoji: "🏛️", color: COLORS.beigeIraca },
  Familia: { emoji: "👨‍👩‍👧", color: COLORS.azulBarranquero },
  Deportes: { emoji: "⚽", color: COLORS.verdeBijao },
  Nocturna: { emoji: "🎺", color: COLORS.naranjaSalinas },
  Bienestar: { emoji: "🧘", color: COLORS.verdeBijao },
  Festivales: { emoji: "🎉", color: COLORS.rojoCayena },
  Romántico: { emoji: "💕", color: COLORS.rojoCayena },
  Avistamiento: { emoji: "🦜", color: COLORS.verdeBijao },
  Artesanías: { emoji: "🎨", color: COLORS.naranjaSalinas },
  Fotografía: { emoji: "📸", color: COLORS.azulBarranquero },
};

const PRIORITY_CATEGORIES = [
  "Playas", "Cultura", "Naturaleza", "Gastronomía", "EcoTurismo", 
  "Aventura", "Historia", "Familia"
];

// =============================================================================
// HELPERS
// =============================================================================
const parseFilterParam = (value) =>
  (value || "").split(",").map((s) => s.trim()).filter(Boolean);

// =============================================================================
// FILTER CHIP COMPONENT
// =============================================================================
function FilterChip({ label, isActive, onClick, emoji, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap 
        transition-all duration-300 border
        ${isActive 
          ? "text-white border-transparent shadow-lg scale-[1.02]" 
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
      style={{
        backgroundColor: isActive ? COLORS.azulBarranquero : undefined,
        boxShadow: isActive ? `0 4px 20px ${COLORS.azulBarranquero}40` : undefined,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${isActive ? "text-white/70" : "text-slate-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  const getVisiblePages = () => {
    const pages = [];
    const delta = 2;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    if (rangeStart > 2) pages.push("...");
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    if (rangeEnd < totalPages - 1) pages.push("...");
    
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };
  
  return (
    <nav className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginación">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Página anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, idx) => (
          page === "..." ? (
            <span 
              key={`ellipsis-${idx}`} 
              className="px-3 py-2 text-slate-400"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[44px] h-11 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                ${currentPage === page 
                  ? "text-white shadow-lg" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
              style={{
                backgroundColor: currentPage === page ? COLORS.azulBarranquero : undefined,
                boxShadow: currentPage === page ? `0 4px 15px ${COLORS.azulBarranquero}40` : undefined,
                fontFamily: "'Montserrat', sans-serif",
              }}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Página siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}

// =============================================================================
// FEATURED DESTINATION CARD
// =============================================================================
function FeaturedDestination({ item }) {
  const categoryConfig = CATEGORY_CONFIG[item.categories[0]] || { emoji: "📍", color: COLORS.azulBarranquero };
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="group relative"
    >
      <Link
        href={item.kind === "destino" ? `/destinations/${item.id}` : `/experiencias/${item.id}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-3xl bg-slate-900">
          <div className="grid lg:grid-cols-2 min-h-[420px]">
            {/* Image Side */}
            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/90 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent lg:hidden" />
              
              {/* Kind Badge */}
              <div className="absolute top-6 left-6">
                <span 
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md"
                  style={{ backgroundColor: item.kind === "destino" ? `${COLORS.azulBarranquero}cc` : `${COLORS.verdeBijao}cc` }}
                >
                  {item.kind === "destino" ? "✨ Destino destacado" : "🎯 Experiencia destacada"}
                </span>
              </div>
            </div>
            
            {/* Content Side */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-center">
              {/* Category */}
              <div className="flex items-center gap-3 mb-6">
                <span 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/90"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <span className="text-lg">{categoryConfig.emoji}</span>
                  {item.categories[0]}
                </span>
                {item.rating && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-amber-400 bg-amber-400/10">
                    <Star size={14} fill="currentColor" />
                    {item.rating}
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {item.name}
              </h2>
              
              {/* Description */}
              <p 
                className="text-lg text-white/60 mb-6 line-clamp-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {item.tagline || item.description}
              </p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/70 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin size={18} style={{ color: COLORS.naranjaSalinas }} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>Ubicación</p>
                    <p className="text-white font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {item.address || item.municipality || "Atlántico"}
                    </p>
                  </div>
                </div>
                {item.openingTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Clock size={18} style={{ color: COLORS.naranjaSalinas }} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>Horario</p>
                      <p className="text-white font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {item.openingTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* CTA */}
              <div 
                className="inline-flex items-center gap-3 font-semibold text-lg group/btn"
                style={{ color: COLORS.naranjaSalinas }}
              >
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>Explorar este lugar</span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover/btn:translate-x-1">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// =============================================================================
// DESTINATION CARD
// =============================================================================
function DestinationCard({ item, index }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  
  const categoryConfig = CATEGORY_CONFIG[item.categories[0]] || { emoji: "📍", color: COLORS.azulBarranquero };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
    >
      <Link
        href={item.kind === "destino" ? `/destinations/${item.id}` : `/experiencias/${item.id}`}
        className="block group"
      >
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <span 
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: `${categoryConfig.color}cc` }}
              >
                {categoryConfig.emoji} {item.categories[0]}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white/90 backdrop-blur-md"
                style={{ backgroundColor: item.kind === "destino" ? "rgba(0,123,196,0.8)" : "rgba(0,141,57,0.8)" }}
              >
                {item.kind === "destino" ? "Destino" : "Experiencia"}
              </span>
            </div>
            
            {/* Rating */}
            {item.rating && (
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400 bg-black/50 backdrop-blur-sm">
                  <Star size={12} fill="currentColor" />
                  {item.rating}
                </span>
              </div>
            )}
            
            {/* Location on image */}
            <div className="absolute bottom-4 right-4">
              <span className="inline-flex items-center gap-1.5 text-white/90 text-sm">
                <MapPin size={14} />
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {item.municipality || "Atlántico"}
                </span>
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <h3 
              className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {item.name}
            </h3>
            
            {/* Description */}
            <p 
              className="text-sm text-slate-500 line-clamp-2 mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {item.tagline || item.description}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              {item.openingTime && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Clock size={14} />
                  <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{item.openingTime}</span>
                </div>
              )}
              <div 
                className="inline-flex items-center gap-1.5 text-sm font-semibold ml-auto group-hover:gap-2.5 transition-all"
                style={{ color: COLORS.naranjaSalinas, fontFamily: "'Montserrat', sans-serif" }}
              >
                Explorar
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function DestinationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  
  // URL sync
  const filtersFromUrl = parseFilterParam(searchParams.get("filter"));
  
  // Fetch data from Firebase
  useEffect(() => {
    async function fetchCol(col, kind) {
      const snap = await getDocs(collection(db, col));
      return Promise.all(
        snap.docs.map(async (doc) => {
          const d = doc.data();
          const cats = Array.isArray(d.categories) ? d.categories : d.categories ? [d.categories] : [];
          
          const raw = (Array.isArray(d.imagePaths) && d.imagePaths[0]) || d.imagePath || "";
          let img = "/placeholder-destination.jpg";
          if (typeof raw === "string" && raw.startsWith("http")) {
            img = raw;
          } else if (raw) {
            try {
              img = await getDownloadURL(ref(storage, raw));
            } catch (e) {
              console.warn("No image in Storage:", raw);
            }
          }
          
          return {
            kind,
            id: doc.id,
            name: d.name ?? "",
            description: d.description ?? "",
            tagline: d.tagline ?? "",
            address: d.address ?? "",
            municipality: d.municipality ?? "",
            openingTime: d.openingTime ?? "",
            categories: cats.filter(Boolean),
            image: img,
            rating: d.rating ?? null,
          };
        })
      );
    }
    
    async function fetchAll() {
      setIsLoading(true);
      try {
        const [dest, exp] = await Promise.all([
          fetchCol("destinations", "destino"),
          fetchCol("experiences", "experiencia"),
        ]);
        const merged = [...dest, ...exp].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" })
        );
        setAllItems(merged);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAll();
  }, []);
  
  // Initial filter from URL
  useEffect(() => {
    if (filtersFromUrl.length > 0) {
      setSelectedCategory(filtersFromUrl[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory) {
      params.set("filter", selectedCategory);
    } else {
      params.delete("filter");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCategory, pathname, router, searchParams]);
  
  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    allItems.forEach(item => {
      item.categories.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return counts;
  }, [allItems]);
  
  // Available categories (sorted by priority and count)
  const availableCategories = useMemo(() => {
    const cats = Object.keys(categoryCounts);
    return cats.sort((a, b) => {
      const aIdx = PRIORITY_CATEGORIES.indexOf(a);
      const bIdx = PRIORITY_CATEGORIES.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return (categoryCounts[b] || 0) - (categoryCounts[a] || 0);
    });
  }, [categoryCounts]);
  
  // Filter items
  const filteredItems = useMemo(() => {
    let result = allItems;
    
    if (selectedCategory) {
      result = result.filter(item => item.categories.includes(selectedCategory));
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => {
        const text = `${item.name} ${item.description} ${item.tagline} ${item.address} ${item.categories.join(" ")}`.toLowerCase();
        return text.includes(q);
      });
    }
    
    return result;
  }, [allItems, selectedCategory, search]);
  
  // Featured item (only when no filters)
  const featuredItem = !selectedCategory && !search.trim() ? filteredItems[0] : null;
  const remainingItems = featuredItem ? filteredItems.slice(1) : filteredItems;
  
  // Pagination
  const totalPages = Math.ceil(remainingItems.length / ITEMS_PER_PAGE);
  const currentItems = remainingItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset page on filter change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    handleFilterChange();
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setCurrentPage(1);
    inputRef.current?.focus();
  };
  
  const activeFiltersCount = [selectedCategory, search.trim()].filter(Boolean).length;

  return (
    <section className="relative w-full min-h-screen bg-[#fafafa]">
      {/* HERO SECTION */}
      <div 
        className="relative overflow-hidden"
        style={{ backgroundColor: COLORS.grisOscuro }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-15 blur-[120px]"
            style={{ background: COLORS.azulBarranquero }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]"
            style={{ background: COLORS.naranjaSalinas }}
          />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-12 group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Inicio
            </Link>
          </motion.div>
          
          <div ref={headerRef} className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Compass size={16} style={{ color: COLORS.naranjaSalinas }} />
              <span 
                className="text-sm font-medium text-white/70"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Explora el Caribe colombiano
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Descubre{" "}
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.azulBarranquero}, ${COLORS.verdeBijao})` }}
              >
                Atlántico
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-white/50 max-w-2xl leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Playas vírgenes, pueblos con encanto, gastronomía única y experiencias que solo encontrarás en el Caribe colombiano.
            </motion.p>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-10 mt-12"
            >
              {[
                { value: isLoading ? "..." : allItems.filter(i => i.kind === "destino").length, label: "Destinos", color: COLORS.azulBarranquero },
                { value: isLoading ? "..." : allItems.filter(i => i.kind === "experiencia").length, label: "Experiencias", color: COLORS.verdeBijao },
                { value: isLoading ? "..." : availableCategories.length, label: "Categorías", color: "white" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p 
                    className="text-4xl font-bold"
                    style={{ fontFamily: "'Josefin Sans', sans-serif", color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p 
                    className="text-white/40 text-sm mt-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* STICKY FILTERS BAR */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search + Mobile Toggle */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar destinos, experiencias..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
                  className="w-full pl-12 pr-10 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); handleFilterChange(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal size={18} />
                {activeFiltersCount > 0 && (
                  <span 
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: COLORS.azulBarranquero }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 overflow-x-auto pb-1 -mb-1 no-scrollbar">
              <FilterChip
                label="Todos"
                isActive={!selectedCategory}
                onClick={() => handleCategoryChange(null)}
                emoji="✨"
              />
              {availableCategories.slice(0, 8).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <FilterChip
                    key={cat}
                    label={cat}
                    emoji={config?.emoji}
                    isActive={selectedCategory === cat}
                    onClick={() => handleCategoryChange(selectedCategory === cat ? null : cat)}
                    count={categoryCounts[cat]}
                  />
                );
              })}
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                  style={{ color: COLORS.rojoCayena, fontFamily: "'Montserrat', sans-serif" }}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Filters */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Categoría
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip label="Todas" isActive={!selectedCategory} onClick={() => handleCategoryChange(null)} emoji="✨" />
                    {availableCategories.map(cat => {
                      const config = CATEGORY_CONFIG[cat];
                      return (
                        <FilterChip
                          key={cat}
                          label={cat}
                          emoji={config?.emoji}
                          isActive={selectedCategory === cat}
                          onClick={() => handleCategoryChange(selectedCategory === cat ? null : cat)}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENT */}
      <div ref={resultsRef} className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 scroll-mt-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 rounded-2xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
              style={{ background: `${COLORS.azulBarranquero}15` }}
            >
              <SearchIcon size={40} style={{ color: COLORS.azulBarranquero }} />
            </div>
            <h3 
              className="text-2xl font-bold text-slate-800 mb-3"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              No encontramos resultados
            </h3>
            <p 
              className="text-slate-500 mb-8 max-w-md mx-auto"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Intenta con otro término de búsqueda o explora todas las categorías disponibles.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:shadow-xl hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${COLORS.azulBarranquero}, ${COLORS.verdeBijao})`,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Ver todos los destinos
            </button>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Featured */}
            {featuredItem && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${COLORS.azulBarranquero}20, ${COLORS.verdeBijao}20)` }}
                  >
                    <Sparkles size={20} style={{ color: COLORS.azulBarranquero }} />
                  </div>
                  <h2 
                    className="text-xl font-bold text-slate-800"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Destacado para ti
                  </h2>
                </div>
                <FeaturedDestination item={featuredItem} />
              </div>
            )}
            
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 
                  className="text-xl font-bold text-slate-800"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  {selectedCategory || search.trim() ? "Resultados" : "Explora todos los destinos"}
                </h2>
                <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Mostrando {currentItems.length} de {remainingItems.length} lugares
                </p>
              </div>
            </div>
            
            {/* Grid */}
            {currentItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((item, i) => (
                  <DestinationCard key={`${item.kind}-${item.id}`} item={item} index={i} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}