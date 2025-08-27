"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Grid3X3, Map, Loader2 } from "lucide-react";
import { 
  HiLocationMarker,
  HiColorSwatch,
} from "react-icons/hi";
import { 
  RiGovernmentLine,
  RiLeafLine,
  RiRestaurantLine,
  RiAncientGateLine,
  RiCameraLine,
  RiCompassLine
} from "react-icons/ri";
import {
  FaUmbrellaBeach, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer,
  FaPaintBrush, FaStar, FaInstagram, FaHandHoldingHeart, FaTree,
  FaChevronDown, FaChevronUp
} from "react-icons/fa";

// Dynamic import para el mapa
const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-xl bg-gray-100 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
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
  coordinates?: {
    lat: number;
    lng: number;
  };
};

type ViewMode = 'grid' | 'map';

/* Helper Icon Component */
const IconWrap = ({
  icon: Icon,
  size = 14,
}: { icon: React.ComponentType<{ size?: number }>; size?: number }) => <Icon size={size} />;

export default function UnifiedDestinationsExplorer() {
  const router = useRouter();
  
  /* Category List - Primera fila y categorías adicionales */
  const FIRST_ROW_CATEGORIES = [
    "Playas",
    "Historia", 
    "Gastronomía",
    "EcoTurismo",
    "Fotografía",
    "Artesanías",
    "Cultura",
  ];

  const ADDITIONAL_CATEGORIES = [
    "Aventura",
    "Familia",
    "Deportes",
    "Nocturna",
    "Bienestar",
    "Festivales",
    "Romántico",
    "Naturaleza",
    "Avistamiento",
    "Compras",
    "Náutica",
    "Acuáticos",
    "Arte",
    "Spots instagrameables",
  ];

  const ALL_CATEGORIES = [...FIRST_ROW_CATEGORIES, ...ADDITIONAL_CATEGORIES];

  /* Category Config - Configuración unificada con estilo QuickFilters */
  const categoryConfig: Record<string, {
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    bgColor: string;
    hoverBg: string;
    textColor: string;
  }> = {
    "Playas": { 
      icon: HiLocationMarker, 
      color: "#0891b2",
      bgColor: "bg-cyan-50",
      hoverBg: "hover:bg-cyan-100",
      textColor: "text-cyan-600"
    },
    "Historia": { 
      icon: RiAncientGateLine, 
      color: "#b45309",
      bgColor: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
      textColor: "text-amber-600"
    },
    "Gastronomía": { 
      icon: RiRestaurantLine, 
      color: "#dc2626",
      bgColor: "bg-red-50",
      hoverBg: "hover:bg-red-100",
      textColor: "text-red-600"
    },
    "EcoTurismo": { 
      icon: RiLeafLine, 
      color: "#10b981",
      bgColor: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      textColor: "text-green-600"
    },
    "Fotografía": { 
      icon: RiCameraLine, 
      color: "#8b5cf6",
      bgColor: "bg-purple-50",
      hoverBg: "hover:bg-purple-100",
      textColor: "text-purple-600"
    },
    "Artesanías": { 
      icon: HiColorSwatch, 
      color: "#f97316",
      bgColor: "bg-orange-50",
      hoverBg: "hover:bg-orange-100",
      textColor: "text-orange-600"
    },
    "Cultura": { 
      icon: RiGovernmentLine, 
      color: "#dc2626",
      bgColor: "bg-red-50",
      hoverBg: "hover:bg-red-100",
      textColor: "text-red-600"
    },
    "Aventura": { 
      icon: FaMountain, 
      color: "#059669",
      bgColor: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-100",
      textColor: "text-emerald-600"
    },
    "Familia": { 
      icon: FaUsers, 
      color: "#0284c7",
      bgColor: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
      textColor: "text-blue-600"
    },
    "Deportes": { 
      icon: FaRunning, 
      color: "#ea580c",
      bgColor: "bg-orange-50",
      hoverBg: "hover:bg-orange-100",
      textColor: "text-orange-600"
    },
    "Nocturna": { 
      icon: FaMoon, 
      color: "#6366f1",
      bgColor: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      textColor: "text-indigo-600"
    },
    "Bienestar": { 
      icon: FaSpa, 
      color: "#ec4899",
      bgColor: "bg-pink-50",
      hoverBg: "hover:bg-pink-100",
      textColor: "text-pink-600"
    },
    "Festivales": { 
      icon: FaMusic, 
      color: "#f59e0b",
      bgColor: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
      textColor: "text-amber-600"
    },
    "Romántico": { 
      icon: FaHeart, 
      color: "#e11d48",
      bgColor: "bg-rose-50",
      hoverBg: "hover:bg-rose-100",
      textColor: "text-rose-600"
    },
    "Naturaleza": { 
      icon: FaTree, 
      color: "#16a34a",
      bgColor: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      textColor: "text-green-600"
    },
    "Avistamiento": { 
      icon: FaBinoculars, 
      color: "#0d9488",
      bgColor: "bg-teal-50",
      hoverBg: "hover:bg-teal-100",
      textColor: "text-teal-600"
    },
    "Compras": { 
      icon: FaShoppingCart, 
      color: "#9333ea",
      bgColor: "bg-purple-50",
      hoverBg: "hover:bg-purple-100",
      textColor: "text-purple-600"
    },
    "Náutica": { 
      icon: FaShip, 
      color: "#06b6d4",
      bgColor: "bg-cyan-50",
      hoverBg: "hover:bg-cyan-100",
      textColor: "text-cyan-600"
    },
    "Acuáticos": { 
      icon: FaSwimmer, 
      color: "#0ea5e9",
      bgColor: "bg-sky-50",
      hoverBg: "hover:bg-sky-100",
      textColor: "text-sky-600"
    },
    "Arte": { 
      icon: FaPaintBrush, 
      color: "#a855f7",
      bgColor: "bg-violet-50",
      hoverBg: "hover:bg-violet-100",
      textColor: "text-violet-600"
    },
    "Spots instagrameables": { 
      icon: FaInstagram, 
      color: "#ec4899",
      bgColor: "bg-pink-50",
      hoverBg: "hover:bg-pink-100",
      textColor: "text-pink-600"
    },
  };

  const defaultCfg = { 
    icon: FaStar, 
    color: "#dc2626", 
    bgColor: "bg-red-50", 
    hoverBg: "hover:bg-red-100", 
    textColor: "text-red-600" 
  };

  /* State */
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showCardCount, setShowCardCount] = useState(9);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  /* Fetch Firestore */
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const snap = await getDocs(collection(db, "destinations"));
        const data = await Promise.all(
          snap.docs.map(async (doc) => {
            const d = doc.data();
            const cats = Array.isArray(d.categories)
              ? d.categories
              : d.categories ? [d.categories] : [];

            const rawImg =
              (Array.isArray(d.imagePaths) && d.imagePaths[0]) ||
              d.imagePath ||
              "";
            let img = "/placeholder-destination.jpg";
            if (rawImg.startsWith("http")) img = rawImg;
            else if (rawImg) {
              try {
                img = await getDownloadURL(ref(storage, rawImg));
              } catch { /* ignore */ }
            }

            return {
              id: doc.id,
              name: d.name || "Sin nombre",
              tagline: d.tagline || "",
              description: d.description || "",
              address: d.address || "",
              image: img,
              categories: cats.length ? cats : ["Otros"],
              coordinates: d.coordinates || null,
            } as Destination;
          })
        );
        setDestinations(data);
      } catch (err) {
        console.error("fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  /* Filtering Logic */
  const filtered = activeCat.length
    ? destinations.filter((d) =>
        d.categories.some((c) => activeCat.includes(c))
      )
    : destinations;

  /* Toggle Category */
  const toggleCategory = useCallback((cat: string) => {
    setActiveCat((prev) =>
      prev.includes(cat) 
        ? prev.filter((c) => c !== cat) 
        : [...prev, cat]
    );
  }, []);

  /* Loader UI */
  if (loading) {
    return (
      <section className="py-20 flex justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
      </section>
    );
  }

  /* Filter Button Component */
  const FilterButton = ({ label, idx }: { label: string; idx: number }) => {
    const cfg = categoryConfig[label] || defaultCfg;
    const isActive = activeCat.includes(label);
    
    return (
      <motion.button
        onClick={() => toggleCategory(label)}
        className={`group relative bg-white border rounded-xl p-4 sm:p-5 
                  transition-all duration-300 min-w-[100px] sm:min-w-[120px] lg:min-w-0
                  ${isActive 
                    ? 'border-red-600 bg-red-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg ' + cfg.hoverBg
                  }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -4,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: idx * 0.05, duration: 0.4 }}
      >
        {/* Icon with background */}
        <motion.div 
          className={`flex justify-center items-center w-12 h-12 mx-auto mb-2 rounded-lg ${
            isActive ? 'bg-red-100' : cfg.bgColor
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <IconWrap 
            icon={cfg.icon} 
            size={24}
          />
        </motion.div>
        
        {/* Label */}
        <h3 className={`text-xs sm:text-sm font-semibold transition-colors ${
          isActive ? 'text-red-700' : 'text-gray-700 group-hover:text-gray-900'
        }`}>
          {label}
        </h3>
        
        {/* Bottom highlight */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            isActive ? 'bg-red-600 opacity-100' : `${cfg.textColor.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100`
          } rounded-b-xl`}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </motion.button>
    );
  };

  /* Card Component */
  const Card = ({ d }: { d: Destination }) => {
    return (
      <Link
        href={`/destinations/${d.id}`}
        className="block rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 bg-white group"
      >
        {/* Imagen */}
        <div className="relative w-full h-52 overflow-hidden bg-gray-100">
          <Image
            src={d.image}
            alt={d.name}
            fill
            sizes="(max-width:768px)100vw,33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Contenido */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{d.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {d.tagline || d.description.slice(0, 120)}
          </p>

          {d.address && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">{d.address}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  /* Render */
  return (
    <section className="relative w-full bg-white py-16 sm:py-20 border-t border-gray-200">
      
      {/* Background pattern - subtle */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px)`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <RiCompassLine className="text-lg" />
            <span>Categorías Oficiales</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Explora el <span className="text-red-600">Atlántico</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experiencias recomendadas por la Gobernación del Atlántico
          </p>
        </motion.div>

        {/* Filters Section - Estilo QuickFilters unificado */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Primera fila de filtros - Siempre visible */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex lg:grid lg:grid-cols-7 gap-3 sm:gap-4 min-w-max lg:min-w-0">
              {FIRST_ROW_CATEGORIES.map((label, idx) => (
                <FilterButton key={label} label={label} idx={idx} />
              ))}
            </div>
          </div>

          {/* Filtros adicionales - Expandible */}
          <AnimatePresence>
            {showMoreFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mt-4">
                  {ADDITIONAL_CATEGORIES.map((label, idx) => (
                    <FilterButton key={label} label={label} idx={idx + 7} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de expandir/contraer */}
          <div className="flex justify-center mt-6">
            <motion.button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="px-4 py-2 rounded-full text-sm bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium flex items-center gap-2 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMoreFilters ? (
                <>
                  <FaChevronUp size={12} />
                  Menos filtros
                </>
              ) : (
                <>
                  <FaChevronDown size={12} />
                  Más filtros ({ADDITIONAL_CATEGORIES.length})
                </>
              )}
            </motion.button>
          </div>

          {/* Limpiar filtros */}
          {activeCat.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setActiveCat([])}
                className="text-red-600 hover:text-red-700 text-sm font-medium underline underline-offset-2"
              >
                Limpiar filtros ({activeCat.length} activos)
              </button>
            </div>
          )}
        </motion.div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Vista Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4" />
              Vista Mapa
            </button>
          </div>
        </div>

        {/* Content - Grid or Map */}
        <div id="destinations-grid">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.slice(0, showCardCount).map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                    >
                      <Card d={d} />
                    </motion.div>
                  ))}
                </div>

                {/* No results */}
                {filtered.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium mb-2">
                      No se encontraron destinos
                    </p>
                    <p className="text-sm text-gray-500">
                      Intenta con otras categorías o limpia los filtros actuales
                    </p>
                  </div>
                )}

                {/* Ver más button */}
                {showCardCount < filtered.length && (
                  <div className="flex justify-center mt-10">
                    <motion.button
                      onClick={() => setShowCardCount((c) => c + 9)}
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Ver más destinos ({filtered.length - showCardCount} restantes)
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl overflow-hidden border border-gray-200 shadow-lg"
              >
                {/* Map View */}
                <MapWrapper 
                  destinations={filtered} 
                  categoryConfig={categoryConfig}
                  brandColors={{
                    primary: "#dc2626",
                    secondary: "#f87171",
                    dark: "#1f2937",
                    medium: "#6b7280",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between mt-12 p-4 sm:p-6 
                     bg-gray-50 border border-gray-200 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          
          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-8 mb-4 sm:mb-0">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">23</div>
              <div className="text-xs text-gray-600">Municipios</div>
            </div>
            
            <div className="w-px h-8 bg-gray-300" />
            
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-600">50+</div>
              <div className="text-xs text-gray-600">Experiencias</div>
            </div>
            
            <div className="w-px h-8 bg-gray-300" />
            
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">100%</div>
              <div className="text-xs text-gray-600">Verificado</div>
            </div>
          </div>
          
          {/* Official Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <RiGovernmentLine className="text-white text-xl" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">Recomendación Oficial</div>
              <div className="text-xs text-gray-500">Gobernación del Atlántico</div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}