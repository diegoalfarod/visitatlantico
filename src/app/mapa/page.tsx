// src/app/mapa/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  MapPin, 
  Search, 
  X, 
  ChevronRight,
  Compass,
  List,
  Grid3X3,
  Sparkles,
  Navigation,
  Star,
  ArrowRight,
  Loader2
} from "lucide-react";

// ============================================================================
// PALETA VISITATLÁNTICO
// ============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

// ============================================================================
// CONFIGURACIÓN DE CATEGORÍAS
// ============================================================================
const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  "Playas": { icon: "🏖️", color: COLORS.azulBarranquero, label: "Playas" },
  "Gastronomía": { icon: "🍽️", color: COLORS.naranjaSalinas, label: "Gastronomía" },
  "Cultura": { icon: "🎭", color: COLORS.rojoCayena, label: "Cultura" },
  "Naturaleza": { icon: "🌿", color: COLORS.verdeBijao, label: "Naturaleza" },
  "Historia": { icon: "🏛️", color: COLORS.beigeIraca, label: "Historia" },
  "Aventura": { icon: "🚀", color: COLORS.amarilloArepa, label: "Aventura" },
  "Artesanías": { icon: "🎨", color: COLORS.rojoCayena, label: "Artesanías" },
  "Vida Nocturna": { icon: "🎺", color: COLORS.naranjaSalinas, label: "Rumba" },
  "EcoTurismo": { icon: "🌱", color: COLORS.verdeBijao, label: "EcoTurismo" },
  "Familia": { icon: "👨‍👩‍👧", color: COLORS.azulBarranquero, label: "Familia" },
};

// ============================================================================
// DYNAMIC IMPORT DEL MAPA (sin SSR)
// ============================================================================
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ============================================================================
// SKELETON DEL MAPA - Loading messages
// ============================================================================
const LOADING_MESSAGES = [
  "Preparando el mapa interactivo...",
  "Cargando destinos del Atlántico...",
  "Ubicando lugares increíbles...",
  "Casi listo para explorar...",
];

function MapSkeleton() {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[70vh] lg:h-[80vh] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{ backgroundColor: COLORS.azulBarranquero }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ backgroundColor: COLORS.naranjaSalinas }}
        />
      </div>

      {/* Loading content */}
      <div className="text-center relative z-10 px-6">
        {/* Animated map icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 rounded-full mx-auto"
              style={{
                borderColor: `${COLORS.azulBarranquero}30`,
                borderTopColor: COLORS.azulBarranquero,
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: COLORS.azulBarranquero }}
            >
              <MapPin size={32} className="animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Loading message with animation */}
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {LOADING_MESSAGES[loadingStep]}
          </motion.p>
        </AnimatePresence>

        <p
          className="text-sm text-slate-500 dark:text-slate-400"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Esto puede tomar unos segundos...
        </p>

        {/* Progress indicator */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/3 rounded-full"
              style={{ backgroundColor: COLORS.azulBarranquero }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INTERFAZ DE DESTINO
// ============================================================================
interface Destination {
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
  municipality?: string;
  rating?: number;
}

// ============================================================================
// COMPONENTE DE TARJETA COMPACTA
// ============================================================================
function DestinationCard({ 
  destination, 
  isActive, 
  onClick 
}: { 
  destination: Destination; 
  isActive: boolean;
  onClick: () => void;
}) {
  const primaryCategory = destination.categories[0] || "Otros";
  const config = CATEGORY_CONFIG[primaryCategory] || { icon: "📍", color: COLORS.azulBarranquero, label: primaryCategory };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group w-full text-left p-4 rounded-xl transition-all duration-300
        ${isActive 
          ? "bg-white dark:bg-slate-800 shadow-lg ring-2" 
          : "bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
        }
      `}
      style={{
        ringColor: isActive ? config.color : "transparent",
      }}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
          <Image
            src={destination.image || "/placeholder-destination.jpg"}
            alt={destination.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div 
            className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: config.color }}
          >
            <span>{config.icon}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-slate-900 dark:text-white text-sm truncate mb-1"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {destination.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {destination.tagline || destination.municipality || destination.address}
          </p>
          <div className="flex items-center gap-2">
            {destination.rating && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star size={10} fill="currentColor" />
                <span>{destination.rating}</span>
              </div>
            )}
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ 
                backgroundColor: `${config.color}15`,
                color: config.color 
              }}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight 
          size={16} 
          className={`
            flex-shrink-0 text-slate-400 transition-all
            ${isActive ? "text-primary translate-x-1" : "group-hover:translate-x-1"}
          `}
        />
      </div>
    </motion.button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function MapaPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showSidebar, setShowSidebar] = useState(true);

  // ============================================================================
  // FETCH DESTINATIONS FROM FIREBASE
  // ============================================================================
  useEffect(() => {
    async function fetchDestinations() {
      try {
        setLoading(true);
        
        // Fetch from Firebase Firestore
        const snap = await getDocs(collection(db, "destinations"));
        
        const destinationsData = await Promise.all(
          snap.docs.map(async (doc) => {
            const d = doc.data();
            
            // Parse categories
            const cats = Array.isArray(d.categories)
              ? d.categories
              : d.categories
                ? [d.categories]
                : [];
            
            // Get image URL
            const raw = (Array.isArray(d.imagePaths) && d.imagePaths[0]) || d.imagePath || d.image || "";
            let img = "/placeholder-destination.jpg";
            
            if (typeof raw === "string" && raw.startsWith("http")) {
              img = raw;
            } else if (raw) {
              try {
                img = await getDownloadURL(ref(storage, raw));
              } catch {
                console.warn("No image in Storage:", raw);
              }
            }
            
            // Parse coordinates
            let coordinates: { lat: number; lng: number } | undefined;
            
            if (d.coordinates) {
              // Handle GeoPoint from Firestore
              if (d.coordinates._lat !== undefined && d.coordinates._long !== undefined) {
                coordinates = {
                  lat: d.coordinates._lat,
                  lng: d.coordinates._long,
                };
              } else if (d.coordinates.latitude !== undefined && d.coordinates.longitude !== undefined) {
                coordinates = {
                  lat: d.coordinates.latitude,
                  lng: d.coordinates.longitude,
                };
              } else if (d.coordinates.lat !== undefined && d.coordinates.lng !== undefined) {
                coordinates = {
                  lat: d.coordinates.lat,
                  lng: d.coordinates.lng,
                };
              }
            }
            
            return {
              id: doc.id,
              name: d.name ?? "",
              description: d.description ?? "",
              tagline: d.tagline ?? "",
              address: d.address ?? "",
              municipality: d.municipality ?? "",
              categories: cats.filter(Boolean),
              image: img,
              rating: d.rating ?? null,
              coordinates,
            } as Destination;
          })
        );
        
        // Filter only destinations with valid coordinates
        const withCoordinates = destinationsData.filter(
          (d) => d.coordinates && d.coordinates.lat && d.coordinates.lng
        );
        
        console.log(`✅ Loaded ${withCoordinates.length} destinations with coordinates`);
        setDestinations(withCoordinates);
        
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  // ============================================================================
  // CONTROL DE LOADING SCREEN - espera a que todo esté cargado + 4 segundos
  // ============================================================================
  useEffect(() => {
    // Cuando tanto los datos como el mapa estén cargados, esperar 4 segundos adicionales
    if (!loading && mapLoaded) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [loading, mapLoaded]);

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch = !searchQuery || 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.municipality?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !activeCategory || dest.categories.includes(activeCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [destinations, searchQuery, activeCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    destinations.forEach(d => d.categories.forEach(c => cats.add(c)));
    return Array.from(cats).filter(c => CATEGORY_CONFIG[c]).slice(0, 10);
  }, [destinations]);

  // Handle destination selection
  const handleDestinationSelect = (dest: Destination) => {
    setSelectedDestination(dest);
    // En móvil, ocultar sidebar al seleccionar
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  return (
    <>
      {/* Full Page Loading Screen */}
      <AnimatePresence>
        {!showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"
          >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
                style={{ backgroundColor: COLORS.azulBarranquero }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
                style={{ backgroundColor: COLORS.naranjaSalinas }}
              />
            </div>

            {/* Loading content */}
            <div className="relative z-10 text-center px-6 max-w-md">
              {/* Animated logo/icon */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  {/* Outer rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 rounded-full"
                    style={{
                      borderColor: `${COLORS.azulBarranquero}30`,
                      borderTopColor: COLORS.azulBarranquero,
                      borderRightColor: COLORS.naranjaSalinas,
                    }}
                  />

                  {/* Inner counter-rotating ring */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-3 border-4 rounded-full"
                    style={{
                      borderColor: `${COLORS.naranjaSalinas}20`,
                      borderBottomColor: COLORS.naranjaSalinas,
                      borderLeftColor: COLORS.azulBarranquero,
                    }}
                  />

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin size={48} className="text-white animate-pulse" />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Preparando tu{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${COLORS.azulBarranquero}, ${COLORS.naranjaSalinas})`,
                  }}
                >
                  Aventura
                </span>
              </motion.h2>

              {/* Loading messages */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={loading ? "data" : "map"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg text-white/70 mb-8"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {loading
                    ? "Cargando destinos del Atlántico..."
                    : mapLoaded
                    ? "Finalizando detalles..."
                    : "Preparando el mapa interactivo..."}
                </motion.p>
              </AnimatePresence>

              {/* Progress steps */}
              <div className="flex justify-center gap-3 mb-6">
                {[
                  { label: "Destinos", done: !loading },
                  { label: "Mapa", done: mapLoaded },
                  { label: "Listo", done: showContent },
                ].map((step, idx) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        step.done
                          ? "border-transparent shadow-lg"
                          : "border-white/30"
                      }`}
                      style={{
                        backgroundColor: step.done
                          ? COLORS.azulBarranquero
                          : "transparent",
                      }}
                    >
                      {step.done ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs text-white/50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {step.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: loading ? "33%" : mapLoaded ? "66%" : showContent ? "100%" : "33%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.azulBarranquero}, ${COLORS.naranjaSalinas})`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* ================================================================
            HERO COMPACTO
            ================================================================ */}
        <section className="relative pt-24 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23007BC4' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: `${COLORS.azulBarranquero}15`, color: COLORS.azulBarranquero }}
              >
                <Compass className="w-4 h-4" />
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>Explora el Atlántico</span>
              </motion.div>

              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Mapa{" "}
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.azulBarranquero}, ${COLORS.naranjaSalinas})` }}
                >
                  Interactivo
                </span>
              </h1>

              <p 
                className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Descubre playas paradisíacas, pueblos con encanto y experiencias únicas en cada rincón del departamento
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              {[
                { value: loading ? "..." : destinations.length, label: "Destinos", icon: MapPin },
                { value: loading ? "..." : categories.length, label: "Categorías", icon: Grid3X3 },
                { value: "23", label: "Municipios", icon: Navigation },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.azulBarranquero}10` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================================================================
            CONTROLES Y FILTROS
            ================================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 lg:p-6"
            >
              {/* Search & View Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar destinos, playas, restaurantes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("map")}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                      ${viewMode === "map" 
                        ? "text-white shadow-lg" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }
                    `}
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      backgroundColor: viewMode === "map" ? COLORS.azulBarranquero : undefined,
                      boxShadow: viewMode === "map" ? `0 10px 30px ${COLORS.azulBarranquero}30` : undefined,
                    }}
                  >
                    <Compass size={18} />
                    <span className="hidden sm:inline">Mapa</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                      ${viewMode === "list" 
                        ? "text-white shadow-lg" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }
                    `}
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      backgroundColor: viewMode === "list" ? COLORS.azulBarranquero : undefined,
                      boxShadow: viewMode === "list" ? `0 10px 30px ${COLORS.azulBarranquero}30` : undefined,
                    }}
                  >
                    <List size={18} />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${!activeCategory 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }
                  `}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <Sparkles size={14} />
                  Todos
                </button>
                {categories.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  if (!config) return null;
                  
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                        ${activeCategory === cat 
                          ? "text-white shadow-lg" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }
                      `}
                      style={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        backgroundColor: activeCategory === cat ? config.color : undefined,
                      }}
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================
            MAPA Y SIDEBAR
            ================================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: COLORS.azulBarranquero }} />
                  <p className="text-slate-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Cargando destinos...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col lg:flex-row gap-6"
              >
                {/* Sidebar - Lista de destinos */}
                <AnimatePresence>
                  {showSidebar && (
                    <motion.aside
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full lg:w-96 flex-shrink-0 order-2 lg:order-1"
                    >
                      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 max-h-[70vh] lg:max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                          <div>
                            <h2 
                              className="font-semibold text-slate-900 dark:text-white"
                              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                            >
                              {activeCategory || "Todos los destinos"}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                              {filteredDestinations.length} lugares encontrados
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSidebar(false)}
                            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                          {filteredDestinations.length === 0 ? (
                            <div className="text-center py-12">
                              <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                              <p className="text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                No se encontraron destinos
                              </p>
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  setActiveCategory(null);
                                }}
                                className="mt-4 font-medium text-sm hover:underline"
                                style={{ color: COLORS.azulBarranquero }}
                              >
                                Limpiar filtros
                              </button>
                            </div>
                          ) : (
                            filteredDestinations.map((dest) => (
                              <DestinationCard
                                key={dest.id}
                                destination={dest}
                                isActive={selectedDestination?.id === dest.id}
                                onClick={() => handleDestinationSelect(dest)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Mapa Principal */}
                <div className="flex-1 order-1 lg:order-2 relative">
                  {/* Toggle sidebar button (mobile) */}
                  {!showSidebar && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setShowSidebar(true)}
                      className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg text-slate-700 dark:text-white font-medium lg:hidden"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      <List size={18} />
                      Ver lista ({filteredDestinations.length})
                    </motion.button>
                  )}

                  {viewMode === "map" ? (
                    <MapView
                      destinations={filteredDestinations}
                      categoryConfig={Object.fromEntries(
                        Object.entries(CATEGORY_CONFIG).map(([key, val]) => [
                          key,
                          { icon: () => null, color: val.color }
                        ])
                      )}
                      brandColors={{ primary: COLORS.azulBarranquero }}
                      mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
                      onMapLoad={() => setMapLoaded(true)}
                    />
                  ) : (
                    /* Vista de lista completa */
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 min-h-[70vh]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredDestinations.map((dest, idx) => {
                          const config = CATEGORY_CONFIG[dest.categories[0]] || { icon: "📍", color: COLORS.azulBarranquero, label: dest.categories[0] || "Otros" };
                          return (
                            <motion.div
                              key={dest.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                href={`/destinations/${dest.id}`}
                                className="group block bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                              >
                                <div className="relative aspect-[4/3]">
                                  <Image
                                    src={dest.image || "/placeholder-destination.jpg"}
                                    alt={dest.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <h3 
                                      className="text-white font-semibold text-lg mb-1"
                                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                                    >
                                      {dest.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="text-xs px-2 py-1 rounded-full font-medium text-white"
                                        style={{ backgroundColor: `${config.color}cc` }}
                                      >
                                        {config.icon} {dest.categories[0]}
                                      </span>
                                      {dest.rating && (
                                        <span className="text-white/90 text-xs flex items-center gap-1">
                                          <Star size={10} fill="currentColor" />
                                          {dest.rating}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <p 
                                    className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                  >
                                    {dest.tagline || dest.description?.slice(0, 100)}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <MapPin size={12} />
                                      {dest.municipality || dest.address}
                                    </span>
                                    <ArrowRight 
                                      size={16} 
                                      className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
                                      style={{ color: COLORS.azulBarranquero }}
                                    />
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ================================================================
            CTA FINAL
            ================================================================ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                ¿Necesitas ayuda para planificar?
              </h2>
              <p 
                className="text-slate-400 mb-8 max-w-xl mx-auto"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Jimmy, tu guía virtual, puede ayudarte a crear el itinerario perfecto según tus intereses
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <MapPin size={18} />
                  Ver todos los destinos
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event("jimmy:open"));
                      window.dispatchEvent(new Event("jimmy-open"));
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all text-white"
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`
                  }}
                >
                  <Sparkles size={18} />
                  Hablar con Jimmy
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Estilos globales */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}