// src/components/FeaturedDestinations.tsx
"use client";

/* -------------------------------------------------- */
/* Imports                                            */
/* -------------------------------------------------- */
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Grid3X3, Map as MapIcon, Loader2 } from "lucide-react";

import {
  FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer, FaFish, FaVideo,
  FaPaintBrush, FaStar, FaInstagram, FaHandHoldingHeart, FaTree,
  FaChevronDown, FaChevronUp
} from "react-icons/fa";

// Dynamic import para el mapa (mejora el performance inicial)
const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

/* -------------------------------------------------- */
/* Types                                              */
/* -------------------------------------------------- */
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

/* -------------------------------------------------- */
/* Helper Icon Component                              */
/* -------------------------------------------------- */
const IconWrap = ({
  icon: Icon,
  size = 14,
}: { icon: React.ComponentType<{ size?: number }>; size?: number }) => <Icon size={size} />;

/* -------------------------------------------------- */
/* Main Component                                     */
/* -------------------------------------------------- */
export default function FeaturedDestinations() {
  /* ---------------- Brand Colors ------------------ */
  const brandColors = {
    primary: "#E40E20",
    secondary: "#D34A78",
    dark: "#4A4F55",
    medium: "#7A888C",
    light: "#C1C5C8",
    gold: "#F4B223",
    yellow: "#FFD000",
    lightBlue: "#009ADE",
    darkBlue: "#0047BA",
    lightTeal: "#9ED4E9",
    teal: "#00833E",
    green: "#00B4B1",
  };

  /* -------------- Category List (Same as DestinationsClient) -------------- */
  const CATEGORIES = [
    "Playas",
    "Eco",
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
    "Pesca",
    "Cine",
    "Arte",
    "Spots Instagrameables",
    "Artesanías",
    "EcoTurismo",
  ];

  /* -------------- Category Config ----------------- */
  const categoryConfig: Record<string, {
    icon: React.ComponentType<{ size?: number }>;
    color: string;
  }> = {
    "Playas":               { icon: FaUmbrellaBeach, color: brandColors.lightBlue },
    "Eco":                  { icon: FaLeaf,          color: brandColors.green },
    "Gastronomía":          { icon: FaUtensils,      color: brandColors.gold },
    "Aventura":             { icon: FaMountain,      color: brandColors.teal },
    "Cultura":              { icon: FaMusic,         color: brandColors.darkBlue },
    "Historia":             { icon: FaLandmark,      color: brandColors.medium },
    "Familia":              { icon: FaUsers,         color: brandColors.yellow },
    "Deportes":             { icon: FaRunning,       color: brandColors.lightTeal },
    "Nocturna":             { icon: FaMoon,          color: brandColors.dark },
    "Bienestar":            { icon: FaSpa,           color: brandColors.secondary },
    "Festivales":           { icon: FaMusic,         color: brandColors.primary },
    "Romántico":            { icon: FaHeart,         color: brandColors.secondary },
    "Naturaleza":           { icon: FaTree,          color: brandColors.green },
    "Avistamiento":         { icon: FaBinoculars,    color: brandColors.teal },
    "Compras":              { icon: FaShoppingCart,  color: brandColors.medium },
    "Fotografía":           { icon: FaCamera,        color: brandColors.gold },
    "Náutica":              { icon: FaShip,          color: brandColors.lightBlue },
    "Acuáticos":            { icon: FaSwimmer,       color: brandColors.lightTeal },
    "Pesca":                { icon: FaFish,          color: brandColors.primary },
    "Cine":                 { icon: FaVideo,         color: brandColors.yellow },
    "Arte":                 { icon: FaPaintBrush,    color: brandColors.light },
    "Spots Instagrameables": { icon: FaInstagram,    color: brandColors.secondary },
    "Artesanías":           { icon: FaHandHoldingHeart, color: brandColors.gold },
    "EcoTurismo":           { icon: FaTree,          color: brandColors.green },
  };
  const defaultCfg = { icon: FaStar, color: brandColors.primary };

  /* -------------------- State --------------------- */
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string[]>([]);
  const [showCatCount, setShowCatCount] = useState(6);
  const [showCardCount, setShowCardCount] = useState(9);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  /* --------------- Fetch Firestore ---------------- */
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

  /* ------------- Filtering Logic ------------------ */
  const visibleCats = CATEGORIES.slice(0, showCatCount);

  const filtered = activeCat.length
    ? destinations.filter((d) =>
        d.categories.some((c) => activeCat.includes(c))
      )
    : destinations;

  /* ------------- Toggle Categories ---------------- */
  const toggleCategory = useCallback((cat: string) => {
    setActiveCat((prev) =>
      prev.includes(cat) 
        ? prev.filter((c) => c !== cat) 
        : [...prev, cat]
    );
  }, []);

  /* ----------------- Loader UI -------------------- */
  if (loading) {
    return (
      <section className="py-24 flex justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </section>
    );
  }

  /* ------------------------------------------------ */
  /* Helper Card Component                            */
  /* ------------------------------------------------ */
  const Card = ({ d }: { d: Destination }) => {
    return (
      <Link
        href={`/destinations/${d.id}`}
        className="block rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative group bg-white"
      >
        {/* Badge categorías - mismo diseño que DestinationsClient */}
        {d.categories.length > 0 && (
          <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-1 max-w-[60%] justify-end">
            {d.categories.slice(0, 2).map((cat, idx) => {
              const cfg = categoryConfig[cat] || defaultCfg;
              return (
                <span
                  key={idx}
                  className="text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"
                  style={{ backgroundColor: cfg.color }}
                >
                  <IconWrap icon={cfg.icon} size={12} /> {cat}
                </span>
              );
            })}
            {d.categories.length > 2 && (
              <span
                className="text-white text-xs px-3 py-1 rounded-full shadow-lg"
                style={{ backgroundColor: `${brandColors.primary}CC` }}
              >
                +{d.categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Imagen */}
        <div className="relative w-full h-56">
          <Image
            src={d.image}
            alt={d.name}
            fill
            sizes="(max-width:768px)100vw,33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Cuerpo */}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-1">{d.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {d.tagline || d.description.slice(0, 120)}
          </p>

          {d.address && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{d.address}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  /* ------------------------------------------------ */
  /* Render                                           */
  /* ------------------------------------------------ */
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Título */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">Destinos Destacados</h2>
        <p className="text-gray-600 mt-2">
          Explora los lugares imperdibles del Atlántico.
        </p>
      </div>

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
            Lista
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
            Mapa
          </button>
        </div>
      </div>

      {/* Filtros */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-10"
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
              className={`px-4 py-2 rounded-full text-sm border shadow-sm flex items-center gap-1.5 transition-all duration-200
              ${active 
                ? "bg-gray-900 text-white border-gray-900" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
            >
              <IconWrap icon={cfg.icon} size={14} />
              {cat}
            </button>
          );
        })}

        {showCatCount < CATEGORIES.length && (
          <button
            onClick={() => setShowCatCount((v) => v + 6)}
            className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50"
          >
            <FaChevronDown size={14} className="inline mr-1" /> Más categorías
          </button>
        )}
        {showCatCount >= CATEGORIES.length && CATEGORIES.length > 6 && (
          <button
            onClick={() => setShowCatCount(6)}
            className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50"
          >
            <FaChevronUp size={14} className="inline mr-1" /> Menos categorías
          </button>
        )}
      </motion.div>

      {/* Limpiar filtros si hay activos */}
      {activeCat.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveCat([])}
            className="text-red-600 hover:text-red-700 underline text-sm"
          >
            Limpiar filtros ({activeCat.length})
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(0, showCardCount).map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card d={d} />
                </motion.div>
              ))}
            </div>

            {/* No results message */}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">
                  No se encontraron destinos con las categorías seleccionadas.
                </p>
              </div>
            )}

            {/* Botón ver más */}
            {showCardCount < filtered.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setShowCardCount((c) => c + 9)}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Ver más destinos
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Map View */}
            <MapWrapper 
              destinations={filtered} 
              categoryConfig={categoryConfig}
              brandColors={brandColors}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}