"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  MapPin, Grid3X3, Map, X, ChevronDown, ChevronRight,
  ArrowUpRight, Navigation, Clock, Star, Compass
} from "lucide-react";
import { HiLocationMarker, HiColorSwatch } from "react-icons/hi";
import { 
  RiGovernmentLine, RiLeafLine, RiRestaurantLine, 
  RiAncientGateLine, RiCameraLine
} from "react-icons/ri";
import {
  FaMountain, FaUsers, FaRunning, FaMoon, FaSpa, FaMusic, 
  FaHeart, FaBinoculars, FaShoppingCart, FaShip, FaSwimmer,
  FaPaintBrush, FaStar, FaInstagram, FaTree
} from "react-icons/fa";

// Lazy load map
const MapComponent = dynamic(() => import('./DestinationsMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

/* Types */
type Destination = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  image: string;
  categories: string[];
  coordinates?: { lat: number; lng: number };
};

/* Constants */
const MAIN_CATEGORIES = ["Playas", "Historia", "Gastronomía", "EcoTurismo", "Cultura", "Aventura", "Naturaleza"];
const ALL_CATEGORIES = [
  "Playas", "Historia", "Gastronomía", "EcoTurismo", "Fotografía", "Artesanías", "Cultura",
  "Aventura", "Familia", "Deportes", "Nocturna", "Bienestar", "Festivales", "Romántico",
  "Naturaleza", "Avistamiento", "Compras", "Náutica", "Acuáticos", "Arte", "Spots instagrameables",
];

const categoryConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
  "Playas": { icon: HiLocationMarker, color: "#0891b2" },
  "Historia": { icon: RiAncientGateLine, color: "#b45309" },
  "Gastronomía": { icon: RiRestaurantLine, color: "#dc2626" },
  "EcoTurismo": { icon: RiLeafLine, color: "#10b981" },
  "Fotografía": { icon: RiCameraLine, color: "#8b5cf6" },
  "Artesanías": { icon: HiColorSwatch, color: "#f97316" },
  "Cultura": { icon: RiGovernmentLine, color: "#dc2626" },
  "Aventura": { icon: FaMountain, color: "#059669" },
  "Familia": { icon: FaUsers, color: "#0284c7" },
  "Deportes": { icon: FaRunning, color: "#ea580c" },
  "Nocturna": { icon: FaMoon, color: "#6366f1" },
  "Bienestar": { icon: FaSpa, color: "#ec4899" },
  "Festivales": { icon: FaMusic, color: "#f59e0b" },
  "Romántico": { icon: FaHeart, color: "#e11d48" },
  "Naturaleza": { icon: FaTree, color: "#16a34a" },
  "Avistamiento": { icon: FaBinoculars, color: "#0d9488" },
  "Compras": { icon: FaShoppingCart, color: "#9333ea" },
  "Náutica": { icon: FaShip, color: "#06b6d4" },
  "Acuáticos": { icon: FaSwimmer, color: "#0ea5e9" },
  "Arte": { icon: FaPaintBrush, color: "#a855f7" },
  "Spots instagrameables": { icon: FaInstagram, color: "#ec4899" },
};

const defaultCfg = { icon: FaStar, color: "#dc2626" };
const brandColors = { primary: "#dc2626", secondary: "#f87171", dark: "#1f2937", medium: "#6b7280" };

/* Cache */
let destinationsCache: { data: Destination[] | null; time: number } = { data: null, time: 0 };
const CACHE_TTL = 5 * 60 * 1000;

/* Skeleton Components */
const MapSkeleton = () => (
  <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin" />
      <p className="text-sm text-slate-500">Cargando mapa...</p>
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-2 p-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
        <div className="w-14 h-14 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/* Floating Popup Card */
const FloatingPopupCard = memo(({ destination, onClose }: { destination: Destination; onClose: () => void }) => {
  const cfg = categoryConfig[destination.categories[0]] || defaultCfg;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-44 overflow-hidden">
        <Image src={destination.image} alt={destination.name} fill className="object-cover" sizes="340px" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
        
        <div className="absolute top-3 left-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: cfg.color }}>
            {destination.categories[0]}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white">{destination.name}</h3>
          {destination.address && (
            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {destination.address}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {destination.tagline || destination.description.slice(0, 100)}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            4.8
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            2-3 horas
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/destinations/${destination.id}`} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl text-center transition-colors">
            Ver detalles
          </Link>
          <button
            onClick={() => destination.coordinates && window.open(`https://maps.google.com/?q=${destination.coordinates.lat},${destination.coordinates.lng}`, '_blank')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Navigation className="w-4 h-4" />
            Ir
          </button>
        </div>
      </div>
    </motion.div>
  );
});
FloatingPopupCard.displayName = 'FloatingPopupCard';

/* Destination List Item */
const DestinationListItem = memo(({ destination, isSelected, onHover, onClick }: { 
  destination: Destination; isSelected?: boolean; onHover?: (d: Destination | null) => void; onClick?: (d: Destination) => void;
}) => {
  const cfg = categoryConfig[destination.categories[0]] || defaultCfg;
  
  return (
    <div
      onMouseEnter={() => onHover?.(destination)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(destination)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-red-50 ring-1 ring-red-200' : 'hover:bg-slate-50'
      }`}
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
        <Image src={destination.image} alt={destination.name} fill className="object-cover" sizes="56px" loading="lazy" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm truncate">{destination.name}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
          <span className="text-[11px] text-slate-500">{destination.categories[0]}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </div>
  );
});
DestinationListItem.displayName = 'DestinationListItem';

/* Destination Card (for grid view) */
const DestinationCard = memo(({ destination, isSelected, onHover, onClick }: { 
  destination: Destination; isSelected?: boolean; onHover?: (d: Destination | null) => void; onClick?: (d: Destination) => void;
}) => {
  const cfg = categoryConfig[destination.categories[0]] || defaultCfg;

  return (
    <div
      onMouseEnter={() => onHover?.(destination)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(destination)}
      className={`bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-red-500' : 'shadow-sm'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image src={destination.image} alt={destination.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" loading="lazy" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: cfg.color }}>
            {destination.categories[0]}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-lg">{destination.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {destination.tagline || destination.description.slice(0, 100)}
        </p>
        <div className="flex items-center justify-between">
          {destination.address && (
            <div className="flex items-center text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 mr-1 text-red-500" />
              <span className="truncate max-w-[150px]">{destination.address}</span>
            </div>
          )}
          <span className="text-xs font-medium text-red-600 flex items-center gap-1">
            Ver más <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
});
DestinationCard.displayName = 'DestinationCard';

/* Category Pill */
const CategoryPill = memo(({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => {
  const cfg = categoryConfig[label] || defaultCfg;
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
        isActive 
          ? 'text-white shadow-lg' 
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
      style={isActive ? { backgroundColor: cfg.color, boxShadow: `0 4px 14px ${cfg.color}40` } : {}}
    >
      {label}
    </button>
  );
});
CategoryPill.displayName = 'CategoryPill';

/* Main Component */
export default function DestinationsExplorer() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [visibleCards, setVisibleCards] = useState(6);

  useEffect(() => {
    setMapboxToken(process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '');
  }, []);

  useEffect(() => {
    async function fetchDestinations() {
      const now = Date.now();
      if (destinationsCache.data && (now - destinationsCache.time) < CACHE_TTL) {
        setDestinations(destinationsCache.data);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, "destinations"));
        const results: Destination[] = [];
        
        for (const doc of snap.docs) {
          const d = doc.data();
          const cats = Array.isArray(d.categories) ? d.categories : d.categories ? [d.categories] : [];
          const rawImg = (Array.isArray(d.imagePaths) && d.imagePaths[0]) || d.imagePath || "";
          
          let img = "/placeholder-destination.jpg";
          if (rawImg.startsWith("http")) img = rawImg;
          else if (rawImg) { try { img = await getDownloadURL(ref(storage, rawImg)); } catch { } }
          
          results.push({
            id: doc.id, name: d.name || "Sin nombre", tagline: d.tagline || "", description: d.description || "",
            address: d.address || "", image: img, categories: cats.length ? cats : ["Otros"], coordinates: d.coordinates || null,
          });
        }
        
        destinationsCache = { data: results, time: now };
        setDestinations(results);
      } catch (err) {
        console.error("fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  const filtered = useMemo(() => {
    if (!activeCat) return destinations;
    return destinations.filter((d) => d.categories.includes(activeCat));
  }, [destinations, activeCat]);

  const mappableDestinations = useMemo(() => filtered.filter(d => d.coordinates?.lat && d.coordinates?.lng), [filtered]);

  const toggleCategory = useCallback((cat: string) => {
    setActiveCat(prev => prev === cat ? null : cat);
    setVisibleCards(6);
    setSelectedDestination(null);
  }, []);

  const handleSelectDestination = useCallback((dest: Destination | null) => setSelectedDestination(dest), []);
  const handleClosePopup = useCallback(() => setSelectedDestination(null), []);

  if (loading) {
    return (
      <section id="destinations-explorer" className="relative bg-slate-50 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Compass className="w-4 h-4" />
              <span>Explora el Territorio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              Descubre el <span className="text-red-600">Atlántico</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] lg:h-[550px]"><MapSkeleton /></div>
            <div className="bg-white rounded-2xl border border-slate-200"><ListSkeleton /></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="destinations-explorer" className="relative bg-slate-50 pt-8 pb-16">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.4]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Compass className="w-4 h-4" />
            <span>Explora el Territorio</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Descubre el <span className="text-red-600">Atlántico</span>
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explora más de {destinations.length} destinos únicos en el corazón del Caribe colombiano
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => { setActiveCat(null); setSelectedDestination(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              Todos
            </button>
            {(showAllCategories ? ALL_CATEGORIES : MAIN_CATEGORIES).map((cat) => (
              <CategoryPill key={cat} label={cat} isActive={activeCat === cat} onClick={() => toggleCategory(cat)} />
            ))}
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1 transition-colors"
            >
              {showAllCategories ? 'Menos' : `+${ALL_CATEGORIES.length - MAIN_CATEGORIES.length}`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{filtered.length}</span> destinos
              {activeCat && <span> en <span className="text-red-600">{activeCat}</span></span>}
            </p>
            
            <div className="bg-white p-1 rounded-lg flex border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Mapa</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Galería</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {viewMode === 'map' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[550px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                {mapboxToken ? (
                  <MapComponent
                    destinations={mappableDestinations}
                    categoryConfig={categoryConfig}
                    brandColors={brandColors}
                    mapboxToken={mapboxToken}
                    selectedDestination={selectedDestination}
                    hoveredDestination={hoveredDestination}
                    onSelectDestination={handleSelectDestination}
                    onHoverDestination={setHoveredDestination}
                  />
                ) : (
                  <MapSkeleton />
                )}
              </div>

              {/* List */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[400px] sm:max-h-[500px] lg:max-h-[550px]">
                <div className="p-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Destinos</h3>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">{filtered.length}</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filtered.slice(0, 20).map((d) => (
                    <DestinationListItem
                      key={d.id}
                      destination={d}
                      isSelected={selectedDestination?.id === d.id || hoveredDestination?.id === d.id}
                      onHover={setHoveredDestination}
                      onClick={handleSelectDestination}
                    />
                  ))}
                  
                  {filtered.length > 20 && (
                    <Link href="/destinations" className="block p-3 text-center text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      Ver todos →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.slice(0, visibleCards).map((d) => (
                  <DestinationCard key={d.id} destination={d} isSelected={selectedDestination?.id === d.id} onHover={setHoveredDestination} onClick={handleSelectDestination} />
                ))}
              </div>

              {filtered.length > visibleCards && (
                <div className="mt-10 text-center">
                  <button onClick={() => setVisibleCards(v => v + 6)} className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 shadow-lg transition-colors">
                    Ver más ({filtered.length - visibleCards} restantes)
                  </button>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Map className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron destinos</h3>
                  <button onClick={() => setActiveCat(null)} className="text-red-600 font-medium">Ver todos</button>
                </div>
              )}
            </>
          )}

          {/* Floating Popup */}
          <AnimatePresence>
            {selectedDestination && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  onClick={handleClosePopup}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <FloatingPopupCard destination={selectedDestination} onClose={handleClosePopup} />
                </div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* Organic Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 120L48 112C96 104 192 88 288 80C384 72 480 72 576 78.7C672 85 768 99 864 101.3C960 104 1056 96 1152 88C1248 80 1344 72 1392 68L1440 64V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}