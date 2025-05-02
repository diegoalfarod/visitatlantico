"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { FaUmbrellaBeach, FaLeaf, FaUtensils, FaMountain, FaLandmark, FaHandHoldingHeart, FaCamera } from "react-icons/fa6";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const categories = [
  "Todos",
  "Playas",
  "Cultura",
  "EcoTurismo",
  "Gastronomía",
  "Historia",
  "Artesanías",
  "Spots Instagrameables",
];

// Configuración de iconos para categorías
const categoryConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  "Todos": { icon: FaMountain, color: "#4A4F55" },
  "Playas": { icon: FaUmbrellaBeach, color: "#009ADE" },
  "Cultura": { icon: FaLandmark, color: "#D34A78" },
  "EcoTurismo": { icon: FaLeaf, color: "#00B451" },
  "Gastronomía": { icon: FaUtensils, color: "#F4B223" },
  "Historia": { icon: FaLandmark, color: "#0047BA" },
  "Artesanías": { icon: FaHandHoldingHeart, color: "#E40E20" },
  "Spots Instagrameables": { icon: FaCamera, color: "#D31A2B" },
};

// Colores adaptados según la guía de marca
const brandColors = {
  primary: {
    main: "#E40E20", // Color principal - RGB E40E20
    light: "#FF715B", // Una variante más clara del coral
    dark: "#D31A2B", // Variante oscura - RGB D31A2B
  },
  secondary: {
    blue: {
      light: "#009ADE", // Azul claro - RGB 009ADE
      medium: "#0047BA", // Azul medio - RGB 0047BA
      dark: "#4A4F55", // Gris azulado - RGB 4A4F55
    },
    yellow: {
      main: "#F4B223", // Amarillo principal - RGB F4B223
      light: "#FFDD00", // Amarillo claro - RGB FFDD00
    },
    green: {
      main: "#00B451", // Verde principal - RGB 00B451
      light: "#00B451", // Verde claro con transparencia
      dark: "#00833E", // Verde oscuro - RGB 00833E
    }
  },
  neutral: {
    light: "#C1C5C8", // Gris claro - RGB C1C5C8
    medium: "#7A858C", // Gris medio - RGB 7A858C
    dark: "#4A4F55", // Gris oscuro para textos
  }
};

interface Destination {
  lng: number;
  lat: number;
  title: string;
  description: string;
  image: string;
  category: string;
  highlight: boolean;
  icon?: string;
}

const destinations: Destination[] = [
  {
    lng: -74.9191,
    lat: 10.9854,
    title: "Malecón del Río",
    description: "Disfruta de vistas al río Magdalena en este paseo vibrante.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Malecon_bquilla.jpg",
    category: "Spots Instagrameables",
    highlight: true,
    icon: "📸",
  },
  {
    lng: -74.9166,
    lat: 10.7814,
    title: "Playa de Salgar",
    description: "Relájate en esta playa popular con historia y atardeceres épicos.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Playa_Salgar.jpg",
    category: "Playas",
    highlight: true,
    icon: "🏖️",
  },
  {
    lng: -74.7926,
    lat: 10.993,
    title: "Museo del Atlántico",
    description: "Arte y cultura de la región en un espacio icónico.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/53/Museo_del_Atlantico_Barranquilla.jpg",
    category: "Cultura",
    highlight: false,
    icon: "🎭",
  },
  {
    lng: -74.828,
    lat: 10.956,
    title: "Puerto Colombia",
    description: "Histórico muelle y playa a solo minutos de Barranquilla.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Puerto_Colombia.jpg",
    category: "Historia",
    highlight: true,
    icon: "🏛️",
  },
  {
    lng: -74.8500,
    lat: 10.8500,
    title: "EcoParque Los Rosales",
    description: "Senderos verdes perfectos para los amantes del ecoturismo.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Ecoparque_Los_Rosales.jpg",
    category: "EcoTurismo",
    highlight: false,
    icon: "🌳",
  },
  {
    lng: -74.7817,
    lat: 10.8471,
    title: "Usiacurí",
    description: "Pueblo mágico conocido por sus artesanías únicas.",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Usiacuri.jpg",
    category: "Artesanías",
    highlight: true,
    icon: "🧵",
  },
  {
    lng: -74.7937,
    lat: 10.9935,
    title: "Carnaval de Barranquilla",
    description: "La fiesta cultural más importante de Colombia.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Carnaval_de_Barranquilla.jpg",
    category: "Cultura",
    highlight: true,
    icon: "🎉",
  },
  {
    lng: -74.801,
    lat: 10.976,
    title: "Gastronomía Local",
    description: "Deléitate con platos típicos como arepas de huevo y bollos.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Arepa_de_huevo.jpg",
    category: "Gastronomía",
    highlight: false,
    icon: "🍽️",
  },
  {
    lng: -74.8835,
    lat: 10.7631,
    title: "Tubará",
    description: "Cultura indígena viva y naturaleza impresionante.",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Tubara_Atl%C3%A1ntico.jpg",
    category: "EcoTurismo",
    highlight: false,
    icon: "🏞️",
  },
  {
    lng: -74.7998,
    lat: 10.9639,
    title: "Centro Histórico Barranquilla",
    description: "Arquitectura colonial y calles llenas de historia.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Barranquilla_Center.jpg",
    category: "Historia",
    highlight: false,
    icon: "🏛️",
  },
];

interface MapWithMarkers extends Map {
  _markers: Marker[];
}

export default function EventsMapPreview() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapWithMarkers | null>(null);
  const [filter, setFilter] = useState<string>("Todos");

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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    (map._markers ?? []).forEach((marker) => marker.remove());
    map._markers = [];

    destinations
      .filter(dest => filter === "Todos" || dest.category === filter)
      .forEach((dest) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "36px";
        el.style.height = "36px";
        el.style.background = "white";
        el.style.border = `2px solid ${dest.highlight ? brandColors.primary.main : brandColors.secondary.blue.medium}`;
        el.style.borderRadius = "50%";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "18px";
        el.style.cursor = "pointer";
        el.style.boxShadow = dest.highlight 
          ? `0 0 0 3px rgba(228, 14, 32, 0.3)` 
          : `0 0 0 3px rgba(0, 71, 186, 0.3)`;
          
        if (dest.highlight) {
          el.style.animation = "pulse 2s infinite";
        }
        el.innerText = dest.icon ?? "📍";

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
        src="${dest.image}" 
        alt="${dest.title}" 
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
        ${dest.title}
      </h3>
      <p style="
        font-family: 'Baloo', 'Inter', sans-serif;
        font-size: 14px;
        color: ${brandColors.secondary.blue.dark};
        line-height: 1.4;
        margin-bottom: 10px;
      ">
        ${dest.description}
      </p>
      <a href="#" style="
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
      " onmouseover="this.style.backgroundColor='${brandColors.primary.dark}';" onmouseout="this.style.backgroundColor='${brandColors.primary.main}';">
        Ver más ➔
      </a>
    </div>
  </div>
`;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([dest.lng, dest.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map);

        map._markers.push(marker);
      });
  }, [filter]);

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

  return (
    <>
      <style>{backgroundKeyframes}</style>
      <section className="relative pt-0 pb-20" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
        {/* Decoración superior minimalista y moderna */}
        <div className="absolute top-0 left-0 w-full h-16 overflow-hidden" style={{ zIndex: 0 }}>
          {/* Gradiente de fondo sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent"></div>
          
          {/* Formas modernas con sombreado suave */}
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
          
          {/* Línea decorativa horizontal con efecto de sombra */}
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
               
          {/* Acento minimalista */}
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
            {/* Icono de ubicación moderno */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Efecto de resplandor/sombra */}
                <div className="absolute w-10 h-10 rounded-full opacity-10"
                     style={{ 
                       background: `radial-gradient(circle, ${brandColors.primary.main} 0%, transparent 70%)`,
                       filter: 'blur(8px)'
                     }}></div>
                
                {/* Marcador principal */}
                <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                  <path 
                    d="M16 0C7.164 0 0 7.164 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.164 24.836 0 16 0ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z" 
                    fill={brandColors.neutral.dark}
                  />
                  <path 
                    d="M16 12C13.79 12 12 13.79 12 16C12 18.21 13.79 20 16 20C18.21 20 20 18.21 20 16C20 13.79 18.21 12 16 12Z" 
                    fill="white"
                  />
                  
                  {/* Sutiles detalles de brillo */}
                  <path 
                    d="M8 15C8 11.134 11.134 8 15 8" 
                    stroke={`${brandColors.primary.main}50`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                
                {/* Círculo punteado decorativo */}
                <div className="absolute w-16 h-16 rounded-full border border-dashed" 
                     style={{ borderColor: `${brandColors.neutral.medium}20` }}></div>
                     
                {/* Pequeña animación de ping */}
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

          {/* Filtros con estilo de FeaturedExperiences */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("Todos")}
              className={`px-5 py-3 rounded-full font-medium text-sm transition-all duration-300 inline-flex items-center gap-2 ${
                filter === "Todos"
                  ? "text-white shadow-lg"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              }`}
              style={{
                backgroundColor: filter === "Todos" ? brandColors.primary.main : "",
                boxShadow: filter === "Todos" ? `0 8px 16px ${brandColors.primary.main}30` : "",
                fontFamily: "'Fivo', 'Inter', sans-serif",
              }}
            >
              <FaMountain className={filter === "Todos" ? "text-white" : "text-foreground/60"} />
              Todos
            </motion.button>
            
            {categories.slice(1).map((category) => {
              const CategoryIcon = categoryConfig[category]?.icon || FaMountain;
              const categoryColor = categoryConfig[category]?.color || brandColors.neutral.dark;
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
          </motion.div>

          {/* Mapa con marco de marca y iluminación verde */}
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
            
            {/* Indicador de carga con verde */}
            <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 shadow-lg"
                style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.secondary.green.dark }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: `${brandColors.secondary.green.main}80` }}></div>
              Explorando destinos
            </div>
          </motion.div>
          
          {/* Decoración inferior minimalista con sombras */}
          <div className="relative h-18 mt-6 overflow-hidden">
            {/* Línea decorativa superior */}
            <div className="absolute inset-x-0 top-0 h-px" 
                 style={{
                   background: `linear-gradient(to right, 
                                transparent, 
                                ${brandColors.neutral.medium}10 30%, 
                                ${brandColors.neutral.medium}20 50%,
                                ${brandColors.neutral.medium}10 70%,
                                transparent)`,
                 }}></div>
            
            {/* Efectos de sombra modernos */}
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