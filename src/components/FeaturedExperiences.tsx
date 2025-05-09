// src/components/FeaturedDestinations.tsx
"use client";

/* -------------------------------------------------- */
/* Imports                                            */
/* -------------------------------------------------- */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import {
  FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer, FaFish, FaVideo,
  FaPaintBrush, FaStar, FaCocktail, FaCoffee, FaChevronDown, FaChevronUp
} from "react-icons/fa";

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
};

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

  /* -------------- Category Config ----------------- */
  const categoryConfig: Record<string, {
    icon: React.ComponentType<{ size?: number }>;
    color: string;
  }> = {
    Playas:      { icon: FaUmbrellaBeach, color: brandColors.lightBlue },
    Eco:         { icon: FaLeaf,          color: brandColors.green },
    Gastronomía: { icon: FaUtensils,      color: brandColors.gold },
    Aventura:    { icon: FaMountain,      color: brandColors.teal },
    Cultura:     { icon: FaMusic,         color: brandColors.darkBlue },
    Historia:    { icon: FaLandmark,      color: brandColors.medium },
    Familia:     { icon: FaUsers,         color: brandColors.yellow },
    Deportes:    { icon: FaRunning,       color: brandColors.lightTeal },
    Nocturna:    { icon: FaMoon,          color: brandColors.dark },
    Bienestar:   { icon: FaSpa,           color: brandColors.secondary },
    Festivales:  { icon: FaMusic,         color: brandColors.primary },
    Romántico:   { icon: FaHeart,         color: brandColors.secondary },
    Naturaleza:  { icon: FaMountain,      color: brandColors.green },
    Avistamiento:{ icon: FaBinoculars,    color: brandColors.teal },
    Compras:     { icon: FaShoppingCart,  color: brandColors.medium },
    Fotografía:  { icon: FaCamera,        color: brandColors.gold },
    Náutica:     { icon: FaShip,          color: brandColors.lightBlue },
    Acuáticos:   { icon: FaSwimmer,       color: brandColors.lightTeal },
    Pesca:       { icon: FaFish,          color: brandColors.primary },
    Cine:        { icon: FaVideo,         color: brandColors.yellow },
    Arte:        { icon: FaPaintBrush,    color: brandColors.light },
    Estelar:     { icon: FaStar,          color: brandColors.dark },
    Coctelería:  { icon: FaCocktail,      color: brandColors.secondary },
    RutaCafé:    { icon: FaCoffee,        color: brandColors.gold },
  };
  const defaultCfg = { icon: FaStar, color: brandColors.primary };

  /* -------------------- State --------------------- */
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string[]>([]);
  const [showCatCount, setShowCatCount] = useState(6);
  const [showCardCount, setShowCardCount] = useState(9); // 3 filas

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
              name: d.name,
              tagline: d.tagline ?? "",
              description: d.description ?? "",
              address: d.address ?? "",
              image: img,
              categories: cats.length ? cats : ["Otros"],
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
  const categories = Object.keys(categoryConfig);
  const visibleCats = categories.slice(0, showCatCount);

  const filtered = activeCat.length
    ? destinations.filter((d) =>
        d.categories.some((c) => activeCat.includes(c))
      )
    : destinations;

  /* ----------------- Loader UI -------------------- */
  if (loading) {
    return (
      <section className="py-24 flex justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </section>
    );
  }

  /* ------------------------------------------------ */
  /* Helper Card (clon del diseño DestinationsClient) */
  /* ------------------------------------------------ */
  const Card = ({ d }: { d: Destination }) => {
    const mainCat = d.categories[0];
    const cfg = categoryConfig[mainCat] || defaultCfg;

    return (
      <Link
        href={`/destinations/${d.id}`}
        className="block rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition relative group"
      >
        {/* Badge categoría */}
        <span
          className="absolute top-4 right-4 z-20 text-xs text-white px-3 py-1 rounded-full flex items-center gap-1"
          style={{ background: cfg.color }}
        >
          <IconWrap icon={cfg.icon} size={12} /> {mainCat}
        </span>

        {/* Imagen */}
        <div className="relative w-full h-48">
          <Image
            src={d.image}
            alt={d.name}
            fill
            sizes="(max-width:768px)100vw,33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
        </div>

        {/* Cuerpo */}
        <div className="p-5 bg-white">
          <h3 className="text-lg font-semibold">{d.name}</h3>
          <p className="text-gray-600 mt-1 line-clamp-2">
            {d.tagline || d.description.slice(0, 120)}
          </p>

          {d.address && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" /> {d.address}
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

      {/* Filtros */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {visibleCats.map((cat) => {
          const active = activeCat.includes(cat);
          return (
            <button
              key={cat}
              onClick={() =>
                setActiveCat((prev) =>
                  active ? prev.filter((c) => c !== cat) : [...prev, cat]
                )
              }
              className={`px-4 py-1.5 rounded-full text-sm border shadow-sm flex items-center gap-1
              ${active ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              {cat}
            </button>
          );
        })}

        {showCatCount < categories.length && (
          <button
            onClick={() => setShowCatCount((v) => v + 5)}
            className="px-4 py-1.5 rounded-full text-sm bg-white border border-gray-200 shadow-sm text-gray-600"
          >
            <FaChevronDown size={14} className="inline mr-1" /> Más
          </button>
        )}
        {showCatCount >= categories.length && categories.length > 6 && (
          <button
            onClick={() => setShowCatCount(6)}
            className="px-4 py-1.5 rounded-full text-sm bg-white border border-gray-200 shadow-sm text-gray-600"
          >
            <FaChevronUp size={14} className="inline mr-1" /> Menos
          </button>
        )}
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
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
      </motion.div>

      {/* Botón ver más */}
      {showCardCount < filtered.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowCardCount((c) => c + 9)}
            className="px-6 py-3 bg-black text-white rounded-full flex items-center gap-2"
          >
            <FaChevronDown size={16} /> Ver más
          </button>
        </div>
      )}
      {showCardCount > 9 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowCardCount(9)}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-full flex items-center gap-2"
          >
            <FaChevronUp size={16} /> Menos
          </button>
        </div>
      )}
    </section>
  );
}
