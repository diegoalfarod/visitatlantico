"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Grid3X3, Map as MapIcon, Loader2 } from "lucide-react";
import { RiGovernmentLine } from "react-icons/ri";

import {
  FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer, FaFish, FaVideo,
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

export default function FeaturedDestinations() {
  /* Category List */
  const CATEGORIES = [
    "Playas",
    "Artesanías",
    "Gastronomía",
    "Aventura",
    "Cultura",
    "Historia",
    "Familia",
    "Deportes",
    "Nocturna",
    "Bienestar",
    "Festivales",
    "Romántico",
    "Naturaleza",
    "Avistamiento",
    "Compras",
    "Fotografía",
    "Náutica",
    "Acuáticos",
    "Arte",
    "Spots instagrameables",
    "EcoTurismo",
  ];

  /* Category Config - Colores más institucionales */
  const categoryConfig: Record<string, {
    icon: React.ComponentType<{ size?: number }>;
    color: string;
  }> = {
    "Playas":               { icon: FaUmbrellaBeach, color: "#0891b2" },
    "Gastronomía":          { icon: FaUtensils,      color: "#dc2626" },
    "Aventura":             { icon: FaMountain,      color: "#059669" },
    "Cultura":              { icon: FaMusic,         color: "#7c3aed" },
    "Historia":             { icon: FaLandmark,      color: "#b45309" },
    "Familia":              { icon: FaUsers,         color: "#0284c7" },
    "Deportes":             { icon: FaRunning,       color: "#ea580c" },
    "Nocturna":             { icon: FaMoon,          color: "#6b7280" },
    "Bienestar":            { icon: FaSpa,           color: "#ec4899" },
    "Festivales":           { icon: FaMusic,         color: "#dc2626" },
    "Romántico":            { icon: FaHeart,         color: "#e11d48" },
    "Naturaleza":           { icon: FaTree,          color: "#16a34a" },
    "Avistamiento":         { icon: FaBinoculars,    color: "#0d9488" },
    "Compras":              { icon: FaShoppingCart,  color: "#9333ea" },
    "Fotografía":           { icon: FaCamera,        color: "#f59e0b" },
    "Náutica":              { icon: FaShip,          color: "#06b6d4" },
    "Acuáticos":            { icon: FaSwimmer,       color: "#0ea5e9" },
    "Arte":                 { icon: FaPaintBrush,    color: "#8b5cf6" },
    "Spots instagrameables": { icon: FaInstagram,    color: "#ec4899" },
    "Artesanías":           { icon: FaHandHoldingHeart, color: "#f97316" },
    "EcoTurismo":           { icon: FaTree,          color: "#10b981" },
  };
  const defaultCfg = { icon: FaStar, color: "#dc2626" };

  /* State */
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string[]>([]);
  const [showCatCount, setShowCatCount] = useState(6);
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
  const visibleCats = CATEGORIES.slice(0, showCatCount);

  const filtered = activeCat.length
    ? destinations.filter((d) =>
        d.categories.some((c) => activeCat.includes(c))
      )
    : destinations;

  /* Toggle Categories */
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
      <section className="py-20 flex justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
      </section>
    );
  }

  /* Card Component - Diseño más institucional */
  const Card = ({ d }: { d: Destination }) => {
    return (
      <Link
        href={`/destinations/${d.id}`}
        className="block rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 bg-white group"
      >
        {/* Categorías badge - más sobrio */}
        {d.categories.length > 0 && (
          <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1 max-w-[60%] justify-end">
            {d.categories.slice(0, 2).map((cat, idx) => {
              const cfg = categoryConfig[cat] || defaultCfg;
              return (
                <span
                  key={idx}
                  className="bg-white/90 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/50"
                  style={{ color: cfg.color }}
                >
                  <IconWrap icon={cfg.icon} size={10} />
                  <span className="font-medium">{cat}</span>
                </span>
              );
            })}
            {d.categories.length > 2 && (
              <span className="bg-gray-900/80 text-white text-xs px-2.5 py-1 rounded-full shadow-md">
                +{d.categories.length - 2}
              </span>
            )}
          </div>
        )}

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
    <section className="bg-white py-16 sm:py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Badge oficial */}
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <RiGovernmentLine className="text-lg" />
            <span>Destinos Recomendados</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Explora el <span className="text-red-600">Atlántico</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lugares verificados y recomendados por la Gobernación del Atlántico
          </p>
        </motion.div>

        {/* View Mode Toggle - Más sobrio */}
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
              <MapIcon className="w-4 h-4" />
              Vista Mapa
            </button>
          </div>
        </div>

        {/* Filtros - Estilo más institucional */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {visibleCats.map((cat) => {
            const active = activeCat.includes(cat);
            const cfg = categoryConfig[cat] || defaultCfg;
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-sm border font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  active 
                    ? "bg-red-600 text-white border-red-600 shadow-md" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <IconWrap icon={cfg.icon} size={14} />
                {cat}
              </button>
            );
          })}

          {showCatCount < CATEGORIES.length && (
            <button
              onClick={() => setShowCatCount((v) => v + 6)}
              className="px-3.5 py-2 rounded-full text-sm bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
            >
              <FaChevronDown size={12} className="inline mr-1" /> 
              Más filtros
            </button>
          )}
          {showCatCount >= CATEGORIES.length && CATEGORIES.length > 6 && (
            <button
              onClick={() => setShowCatCount(6)}
              className="px-3.5 py-2 rounded-full text-sm bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
            >
              <FaChevronUp size={12} className="inline mr-1" /> 
              Menos filtros
            </button>
          )}
        </motion.div>

        {/* Limpiar filtros */}
        {activeCat.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setActiveCat([])}
              className="text-red-600 hover:text-red-700 text-sm font-medium underline underline-offset-2"
            >
              Limpiar filtros ({activeCat.length} activos)
            </button>
          </div>
        )}

        {/* Content - Grid or Map */}
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
                  <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
    </section>
  );
}