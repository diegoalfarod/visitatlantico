"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import {
  FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaUsers,
  FaRunning, FaMoon, FaSpa, FaMusic, FaHeart, FaBinoculars,
  FaShoppingCart, FaCamera, FaShip, FaSwimmer, FaFish, FaVideo,
  FaPaintBrush, FaStar, FaCocktail, FaCoffee, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Configuración de categorías
const categoryConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  "Playas":      { icon: FaUmbrellaBeach, color: "#009ADE" },
  "Eco":         { icon: FaLeaf,          color: "#00B4B1" },
  "Gastronomía": { icon: FaUtensils,      color: "#F4B223" },
  "Aventura":    { icon: FaMountain,      color: "#00833E" },
  "Cultura":     { icon: FaMusic,         color: "#0047BA" },
  "Historia":    { icon: FaLandmark,      color: "#7A888C" },
  "Familia":     { icon: FaUsers,         color: "#FFD000" },
  "Deportes":    { icon: FaRunning,       color: "#9ED4E9" },
  "Nocturna":    { icon: FaMoon,          color: "#4A4F55" },
  "Bienestar":   { icon: FaSpa,           color: "#D34A78" },
  "Festivales":  { icon: FaMusic,         color: "#E40E20" },
  "Romántico":   { icon: FaHeart,         color: "#D34A78" },
  "Naturaleza":  { icon: FaMountain,      color: "#00B4B1" },
  "Avistamiento":{ icon: FaBinoculars,    color: "#00833E" },
  "Compras":     { icon: FaShoppingCart,  color: "#7A888C" },
  "Fotografía":  { icon: FaCamera,        color: "#F4B223" },
  "Náutica":     { icon: FaShip,          color: "#009ADE" },
  "Acuáticos":   { icon: FaSwimmer,       color: "#9ED4E9" },
  "Pesca":       { icon: FaFish,          color: "#E40E20" },
  "Cine":        { icon: FaVideo,         color: "#FFD000" },
  "Arte":        { icon: FaPaintBrush,    color: "#C1C5C8" },
  "Estelar":     { icon: FaStar,          color: "#4A4F55" },
  "Coctelería":  { icon: FaCocktail,      color: "#D34A78" },
  "RutaCafé":    { icon: FaCoffee,        color: "#F4B223" },
};

const categories = Object.keys(categoryConfig);

// Configuración de colores
interface BrandColors {
  primary: {
    main: string;
    light: string;
    dark: string;
  };
  secondary: {
    blue: {
      light: string;
      medium: string;
      dark: string;
    };
    yellow: {
      main: string;
      light: string;
    };
    green: {
      main: string;
      light: string;
      dark: string;
    };
  };
  neutral: {
    light: string;
    medium: string;
    dark: string;
  };
}

const brandColors: BrandColors = {
  primary: {
    main: "#E40E20",
    light: "#FF715B",
    dark: "#D31A2B",
  },
  secondary: {
    blue: {
      light: "#009ADE",
      medium: "#0047BA",
      dark: "#4A4F55",
    },
    yellow: {
      main: "#F4B223",
      light: "#FFDD00",
    },
    green: {
      main: "#00B451",
      light: "#00B451",
      dark: "#00833E",
    }
  },
  neutral: {
    light: "#C1C5C8",
    medium: "#7A858C",
    dark: "#4A4F55",
  }
};

interface Destination {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  name: string;
  description: string;
  image?: string;
  categories: string[];
  highlight?: boolean;
  tagline?: string;
  address?: string;
  openingTime?: string;
  phone?: string;
  website?: string;
  email?: string;
}

interface MapWithMarkers extends Map {
  _markers: Marker[];
}

export default function EventsMapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapWithMarkers | null>(null);
  const [filter, setFilter] = useState<string>("Todos");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(6);

  // Obtener destinos de Firebase
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinations"));
        const fetchedDestinations: Destination[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedDestinations.push({
            id: doc.id,
            coordinates: {
              lat: data.coordinates?.lat || 0,
              lng: data.coordinates?.lng || 0,
            },
            name: data.name || "",
            description: data.description || "",
            image: Array.isArray(data.imagePaths)
              ? data.imagePaths[0]
              : data.imagePath || "",
            categories: data.categories || [],
            highlight: data.highlight || false,
            tagline: data.tagline || "",
            address: data.address || "",
            openingTime: data.openingTime || "",
            phone: data.phone || "",
            website: data.website || "",
            email: data.email || "",
          });
        });
  
        setDestinations(fetchedDestinations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setLoading(false);
      }
    };
  
    fetchDestinations();
  }, []);
  

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.9, 10.9],
      zoom: 9,
      maxBounds: [
        [-75.3, 10.5],
        [-74.2, 11.3],
      ],
    }) as MapWithMarkers;

    map._markers = [];
    mapRef.current = map;

    return () => map.remove();
  }, []);

  // Actualizar marcadores cuando cambian los destinos o el filtro
  useEffect(() => {
    if (!mapRef.current || loading) return;
    const map = mapRef.current;

    // Limpiar marcadores existentes
    (map._markers ?? []).forEach((marker) => marker.remove());
    map._markers = [];

    // Añadir nuevos marcadores basados en el filtro
    destinations
      .filter(dest => filter === "Todos" || dest.categories.includes(filter))
      .forEach((dest) => {
        // Trunca la descripción a 100 caracteres y añade "…" si es muy larga
        const fullDesc = dest.description || "";
        const shortDesc =
          fullDesc.length > 100
            ? fullDesc.slice(0, 100).trimEnd() + "…"
            : fullDesc;

        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "36px";
        el.style.height = "36px";
        el.style.background = "white";
        
        // Get category color or use default
        const firstCategory = dest.categories[0] || "Todos";
        const categoryColor = categoryConfig[firstCategory]?.color || brandColors.secondary.blue.medium;
        
        el.style.border = `2px solid ${dest.highlight ? brandColors.primary.main : categoryColor}`;
        el.style.borderRadius = "50%";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "18px";
        el.style.cursor = "pointer";
        el.style.boxShadow = dest.highlight 
          ? `0 0 0 3px rgba(228, 14, 32, 0.3)` 
          : `0 0 0 3px ${categoryColor}30`;
          
        if (dest.highlight) {
          el.style.animation = "pulse 2s infinite";
        }
        
        // Crear y añadir imagen del destino
        const img = document.createElement("img");
        img.src = dest.image || "https://via.placeholder.com/40";
        img.alt = dest.name;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "50%";
        img.style.border = "2px solid white";
        el.appendChild(img);

        const popupContent = `
  <div style="
    max-width: 250px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    overflow: hidden;
    font-family: 'Fivo', 'Inter', sans-serif;
  ">
    <div style="
      position: relative;
      width: 100%;
      height: 140px;
      overflow: hidden;
    ">
      <img 
        src="${dest.image || 'https://via.placeholder.com/250x140?text=No+Image'}" 
        alt="${dest.name}" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
        " 
      />
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, ${brandColors.primary.main}, ${brandColors.primary.light});
      "></div>
    </div>
    <div style="padding: 16px;">
      <h3 style="
        font-family: 'Fivo', 'Inter', sans-serif;
        font-size: 18px;
        font-weight: 700;
        color: ${brandColors.primary.main};
        margin-top: 0;
        margin-bottom: 6px;
      ">
        ${dest.name}
      </h3>
      ${dest.tagline ? `<p style="
        font-family: 'Baloo', 'Inter', sans-serif;
        font-size: 14px;
        font-style: italic;
        color: ${brandColors.neutral.medium};
        margin-bottom: 8px;
      ">
        ${dest.tagline}
      </p>` : ''}
      <p style="
        font-family: 'Baloo', 'Inter', sans-serif;
        font-size: 14px;
        color: ${brandColors.secondary.blue.dark};
        line-height: 1.4;
        margin-bottom: 10px;
      ">
        ${shortDesc}
      </p>
      ${dest.openingTime ? `<p style="
        font-family: 'Baloo', 'Inter', sans-serif;
        font-size: 13px;
        color: ${brandColors.neutral.medium};
        margin-bottom: 8px;
      ">
        <strong>Horario:</strong> ${dest.openingTime}
      </p>` : ''}
      <a
        href="/destinations/${dest.id}"
        target="_blank"
      rel="noopener noreferrer"
        style="
          display: inline-block;
          background-color: ${brandColors.primary.main};
          color: white;
          font-family: 'Fivo', 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          width: 100%;
          transition: background-color 0.3s;
        "
        onmouseover="this.style.backgroundColor='${brandColors.primary.dark}';"
        onmouseout="this.style.backgroundColor='${brandColors.primary.main}';"
      >
        Ver más ➔
      </a>
    </div>
  </div>
`;


        const marker = new mapboxgl.Marker(el)
          .setLngLat([dest.coordinates.lng, dest.coordinates.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map);

        map._markers.push(marker);
      });
  }, [filter, destinations, loading]);

  // Estilos para animaciones
  const backgroundKeyframes = `
    @keyframes gradientFlow {
      0% { background-position: 0% 50% }
      50% { background-position: 100% 50% }
      100% { background-position: 0% 50% }
    }
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(228, 14, 32, 0.4); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(228, 14, 32, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(228, 14, 32, 0); }
    }
    @font-face {
      font-family: 'Fivo';
      src: local('Fivo Sans');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'Baloo';
      src: local('Baloo');
      font-weight: normal;
      font-style: normal;
    }
  `;

  const visibleCategories = ["Todos", ...categories.slice(0, visibleCategoryCount - 1)];

  return (
    <>
      <style>{backgroundKeyframes}</style>
      <section className="relative pt-0 pb-20" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-16 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent"></div>
          
          <div className="absolute left-1/4 top-4 w-40 h-8 rounded-full opacity-10"
               style={{ 
                 background: `linear-gradient(135deg, ${brandColors.primary.light}20, ${brandColors.primary.main}50)`,
                 filter: 'blur(12px)',
                 transform: 'skewX(-15deg)'
               }}></div>
               
          <div className="absolute right-1/3 top-6 w-32 h-6 rounded-full opacity-10"
               style={{ 
                 background: `linear-gradient(135deg, ${brandColors.secondary.green.main}20, ${brandColors.secondary.blue.light}40)`,
                 filter: 'blur(8px)',
                 transform: 'skewX(20deg)'
               }}></div>
          
          <div className="absolute bottom-0 left-0 w-full h-px" 
               style={{
                 background: `linear-gradient(to right, 
                              transparent, 
                              ${brandColors.primary.main}15 20%, 
                              ${brandColors.primary.main}30 50%,
                              ${brandColors.primary.main}15 80%,
                              transparent)`,
                 boxShadow: `0 1px 2px rgba(0,0,0,0.05)`
               }}></div>
               
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 rounded-t-full"
               style={{ 
                 background: `linear-gradient(to right, ${brandColors.primary.main}70, ${brandColors.primary.light})`,
                 boxShadow: `0 -1px 3px ${brandColors.primary.main}30`
               }}></div>
        </div>

        <div className="container mx-auto px-4 pt-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute w-10 h-10 rounded-full opacity-10"
                     style={{ 
                       background: `radial-gradient(circle, ${brandColors.primary.main} 0%, transparent 70%)`,
                       filter: 'blur(8px)'
                     }}></div>
                
                <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                  <path 
                    d="M16 0C7.164 0 0 7.164 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.164 24.836 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" 
                    fill={brandColors.neutral.dark}
                  />
                  <path 
                    d="M16 12C13.79 12 12 13.79 12 16C12 18.21 13.79 20 16 20C18.21 20 20 18.21 20 16C20 13.79 18.21 12 16 12Z" 
                    fill="white"
                  />
                  <path 
                    d="M8 15C8 11.134 11.134 8 15 8" 
                    stroke={`${brandColors.primary.main}50`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                
                <div className="absolute w-16 h-16 rounded-full border border-dashed" 
                     style={{ borderColor: `${brandColors.neutral.medium}20` }}></div>
                     
                <motion.div 
                  className="absolute w-14 h-14 rounded-full"
                  style={{ border: `1px solid ${brandColors.primary.main}10` }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-3 text-center"
              style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}
            >
              Explora el Atlántico
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="text-lg font-medium" 
                style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
                Descubre cada rincón 🌴
              </div>
            </motion.div>
          </motion.div>

          {/* Filtros */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {visibleCategories.map((category) => {
              const CategoryIcon = category === "Todos" ? FaMountain : categoryConfig[category]?.icon || FaStar;
              const categoryColor = category === "Todos" ? brandColors.neutral.dark : categoryConfig[category]?.color || brandColors.primary.main;
              
              return (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(category)}
                  className={`px-5 py-3 rounded-full font-medium text-sm inline-flex items-center gap-2 transition-all duration-300 ${
                    filter === category
                      ? "text-white shadow-lg"
                      : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                  }`}
                  style={{
                    backgroundColor: filter === category ? categoryColor : "",
                    boxShadow: filter === category ? `0 8px 16px ${categoryColor}30` : "",
                    fontFamily: "'Fivo', 'Inter', sans-serif",
                  }}
                >
                  <CategoryIcon className={filter === category ? "text-white" : "text-foreground/60"} />
                  {category}
                </motion.button>
              );
            })}

            {visibleCategoryCount < categories.length && (
              <motion.button
                onClick={() => setVisibleCategoryCount(prev => prev + 5)}
                className="px-5 py-3 rounded-full font-medium text-sm inline-flex items-center gap-2 transition-all duration-300 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              >
                <FaChevronDown /> Más filtros
              </motion.button>
            )}
            {visibleCategoryCount >= categories.length && categories.length > 6 && (
              <motion.button
                onClick={() => setVisibleCategoryCount(6)}
                className="px-5 py-3 rounded-full font-medium text-sm inline-flex items-center gap-2 transition-all duration-300 bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              >
                <FaChevronUp /> Ocultar filtros
              </motion.button>
            )}
          </motion.div>

          {/* Mapa */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 rounded-3xl p-1.5"
            style={{
              background: `linear-gradient(to bottom right, ${brandColors.primary.main}40, ${brandColors.secondary.green.main}60, ${brandColors.secondary.blue.light}30)`,
              backgroundSize: "200% 200%",
              animation: "gradientFlow 15s ease infinite",
              boxShadow: `0 25px 50px -12px ${brandColors.secondary.green.main}40, inset 0 0 20px ${brandColors.secondary.green.light}30`,
            }}
          >
            <div
              ref={mapContainer}
              className="w-full h-[500px] rounded-2xl shadow-inner overflow-hidden border border-white/40 bg-white"
            />
            
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                <div className="bg-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg"
                  style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.secondary.green.dark }}>
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: brandColors.secondary.green.main }}></div>
                  Cargando destinos...
                </div>
              </div>
            )}
            
            {!loading && (
              <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 shadow-lg"
                style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.secondary.green.dark }}>
                <div className="w-2 h-2 rounded-full" style={{ background: brandColors.secondary.green.main }}></div>
                {destinations.length} destinos encontrados
              </div>
            )}
          </motion.div>
          
          {/* Decoración inferior */}
          <div className="relative h-18 mt-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px" 
                 style={{
                   background: `linear-gradient(to right, 
                                transparent, 
                                ${brandColors.neutral.medium}10 30%, 
                                ${brandColors.neutral.medium}20 50%,
                                ${brandColors.neutral.medium}10 70%,
                                transparent)`,
                 }}></div>
            
            <div className="absolute left-1/3 bottom-0 w-64 h-8 rounded-full opacity-5"
                 style={{ 
                   background: `radial-gradient(ellipse, ${brandColors.secondary.blue.medium}90, transparent)`,
                   filter: 'blur(10px)',
                 }}></div>
                 
            <div className="absolute right-1/4 bottom-2 w-40 h-6 rounded-full opacity-5"
                 style={{ 
                   background: `radial-gradient(ellipse, ${brandColors.primary.main}90, transparent)`,
                   filter: 'blur(8px)',
                 }}></div>
          </div>
        </div>
      </section>
    </>
  );
}
