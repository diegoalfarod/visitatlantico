"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MapPin, Mountain, Utensils, Landmark, Umbrella, Camera, ChevronRight } from 'lucide-react';

interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

export default function DestinationsPreview() {
  const [visibleDestinations, setVisibleDestinations] = useState<number>(4);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [open, setOpen] = useState(false);
  
  // Color palette from client brand identity - manteniendo estructura igual a FeaturedExperiences
  const brandColors = {
    primary: "#E40E20",      // Main brand red - RGB: E40E20
    secondary: "#D34A78",    // Secondary pink - RGB: D34A78
    dark: "#4A4F55",         // Dark gray - RGB: 4A4F55
    medium: "#7A888C",       // Medium gray - RGB: 7A888C
    light: "#C1C5C8",        // Light gray - RGB: C1C5C8
    gold: "#F4B223",         // Gold - RGB: F4B223
    yellow: "#FFD000",       // Yellow - RGB: FFD000
    lightBlue: "#009ADE",    // Light blue - RGB: 009ADE
    darkBlue: "#0047BA",     // Dark blue - RGB: 0047BA
    lightTeal: "#9ED4E9",    // Light teal - RGB: 9ED4E9
    teal: "#00833E",         // Teal blue - RGB: 00833E
    green: "#00B451",        // Green - RGB: 00B451
  };

  // Configuración de categorías con iconos y colores coherentes con FeaturedExperiences
  const categoryConfig = {
    "Playas": { 
      icon: <Umbrella className="w-5 h-5" />, 
      color: brandColors.lightBlue 
    },
    "Ecoturismo": { 
      icon: <Mountain className="w-5 h-5" />, 
      color: brandColors.green 
    },
    "Deportes": { 
      icon: <Umbrella className="w-5 h-5" />, 
      color: brandColors.darkBlue 
    },
    "Artesanías": { 
      icon: <Landmark className="w-5 h-5" />, 
      color: brandColors.gold 
    },
    "Cultura": { 
      icon: <Landmark className="w-5 h-5" />, 
      color: brandColors.secondary 
    },
    "Gastronomía": { 
      icon: <Utensils className="w-5 h-5" />, 
      color: brandColors.gold 
    },
    "Historia": { 
      icon: <Landmark className="w-5 h-5" />, 
      color: brandColors.darkBlue 
    },
    "Paisajes": { 
      icon: <Camera className="w-5 h-5" />, 
      color: brandColors.green 
    },
    "Urbano": { 
      icon: <MapPin className="w-5 h-5" />, 
      color: brandColors.primary 
    },
    "Bienestar": { 
      icon: <Mountain className="w-5 h-5" />, 
      color: brandColors.teal 
    }
  };
  
  // Definición de los destinos del Atlántico con colores de categoría integrados
  const destinations = [
    {
      id: 1,
      name: "Puerto Colombia",
      description: "Playas hermosas, historia del antiguo muelle y gastronomía local. Un paraíso a solo 30 minutos de Barranquilla.",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Puerto_Colombia.jpg",
      category: "Playas",
      icon: categoryConfig["Playas"].icon,
      color: categoryConfig["Playas"].color
    },
    {
      id: 2,
      name: "Tubará",
      description: "Ricos en cultura indígena, naturaleza impresionante y artesanías tradicionales que reflejan su historia.",
      image: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Tubara_Atl%C3%A1ntico.jpg",
      category: "Ecoturismo",
      icon: categoryConfig["Ecoturismo"].icon,
      color: categoryConfig["Ecoturismo"].color
    },
    {
      id: 3,
      name: "Puerto Velero",
      description: "Ideal para deportes acuáticos como kitesurf y paddle, con aguas cristalinas y atardeceres espectaculares.",
      image: "https://puertovelero.com/wp-content/uploads/2019/05/resort-puerto-velero-principal.jpg",
      category: "Deportes",
      icon: categoryConfig["Deportes"].icon,
      color: categoryConfig["Deportes"].color
    },
    {
      id: 4,
      name: "Usiacurí",
      description: "Famoso por sus artesanías en palma de iraca y la Casa Museo del poeta Julio Flórez.",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Usiacuri.jpg",
      category: "Artesanías",
      icon: categoryConfig["Artesanías"].icon,
      color: categoryConfig["Artesanías"].color
    },
    {
      id: 5,
      name: "Barranquilla",
      description: "Capital del Atlántico conocida por el Carnaval y su vibrante cultura caribeña y gastronomía.",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Barranquilla_Center.jpg",
      category: "Cultura",
      icon: categoryConfig["Cultura"].icon,
      color: categoryConfig["Cultura"].color
    },
    {
      id: 6,
      name: "Luruaco",
      description: "Famoso por su laguna y las deliciosas arepas de huevo, un auténtico sabor de la región.",
      image: "https://cdn.colombia.com/images/turismo/sitios-turisticos/barranquilla/luruaco-800.jpg",
      category: "Gastronomía",
      icon: categoryConfig["Gastronomía"].icon,
      color: categoryConfig["Gastronomía"].color
    },
    {
      id: 7,
      name: "Piojó",
      description: "Ofrece hermosos miradores con vistas panorámicas a la Serranía y senderos ecológicos.",
      image: "https://i0.wp.com/www.semana.com/resizer/lDYxiAXQszBTVKuQhiIYzT-p7g8=/1125x649/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/semana/JLCTJAJZPVHPHCUYJJQ6QM562U.jpg",
      category: "Ecoturismo",
      icon: categoryConfig["Ecoturismo"].icon,
      color: categoryConfig["Ecoturismo"].color
    },
    {
      id: 8,
      name: "Salgar",
      description: "Conocido por su histórico castillo fortificado y sus playas tranquilas para disfrutar del Caribe.",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Playa_Salgar.jpg",
      category: "Historia",
      icon: categoryConfig["Historia"].icon,
      color: categoryConfig["Historia"].color
    },
    {
      id: 9,
      name: "Bocas de Ceniza",
      description: "Impresionante punto donde el río Magdalena se encuentra con el mar Caribe, accesible en tren turístico.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Bocas_de_Ceniza.jpg",
      category: "Paisajes",
      icon: categoryConfig["Paisajes"].icon,
      color: categoryConfig["Paisajes"].color
    },
    {
      id: 10,
      name: "Juan de Acosta",
      description: "Reconocido por sus playas vírgenes y cultura local, además de sus espectaculares paisajes naturales.",
      image: "https://www.atlantico.gov.co/images/stories/parques/GALE2.jpg",
      category: "Playas",
      icon: categoryConfig["Playas"].icon,
      color: categoryConfig["Playas"].color
    },
    {
      id: 11,
      name: "Ciénaga del Totumo",
      description: "Famoso volcán de lodo donde puedes disfrutar de un baño medicinal natural único.",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Volc%C3%A1n_del_Totumo.jpg",
      category: "Bienestar",
      icon: categoryConfig["Bienestar"].icon,
      color: categoryConfig["Bienestar"].color
    },
    {
      id: 12,
      name: "Pradomar",
      description: "Playa exclusiva con excelentes restaurantes de mariscos y ambiente relajado.",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Playa_Pradomar.jpg",
      category: "Playas",
      icon: categoryConfig["Playas"].icon,
      color: categoryConfig["Playas"].color
    },
    {
      id: 13,
      name: "Malecón del Río",
      description: "Moderno paseo al lado del río Magdalena en Barranquilla con vistas, restaurantes y cultura.",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Malecon_bquilla.jpg",
      category: "Urbano",
      icon: categoryConfig["Urbano"].icon,
      color: categoryConfig["Urbano"].color
    },
    {
      id: 14,
      name: "Museo del Caribe",
      description: "Impresionante espacio cultural que exhibe la diversidad y riqueza de la región Caribe.",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/53/Museo_del_Atlantico_Barranquilla.jpg",
      category: "Cultura",
      icon: categoryConfig["Cultura"].icon,
      color: categoryConfig["Cultura"].color
    },
    {
      id: 15,
      name: "Lago del Cisne",
      description: "Hermosa reserva natural ideal para avistamiento de aves y actividades al aire libre.",
      image: "https://www.atlantico.gov.co/images/stories/parques/lagocisne1.jpg",
      category: "Ecoturismo",
      icon: categoryConfig["Ecoturismo"].icon,
      color: categoryConfig["Ecoturismo"].color
    },
    {
      id: 16,
      name: "Santa Verónica",
      description: "Playa tranquila perfecta para deportes acuáticos y degustar pescado fresco.",
      image: "https://cdn.colombia.com/images/turismo/sitios-turisticos/barranquilla/santa-veronica-800.jpg",
      category: "Playas",
      icon: categoryConfig["Playas"].icon,
      color: categoryConfig["Playas"].color
    }
  ];

  const showMoreDestinations = () => {
    setVisibleDestinations(prev => 
      prev + 4 <= destinations.length ? prev + 4 : destinations.length
    );
  };

  const showLessDestinations = () => {
    setVisibleDestinations(4);
  };
  
  const handleOpenModal = (destination: Destination) => {
    setSelected(destination);
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 300); // Esperar a que termine la animación
  };

  // Estilos personalizados y animaciones
  const customStyles = `
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
    
    @keyframes gradientFlow {
      0% { background-position: 0% 50% }
      50% { background-position: 100% 50% }
      100% { background-position: 0% 50% }
    }
    
    @keyframes floatAnimation {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(228, 14, 32, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(228, 14, 32, 0); }
      100% { box-shadow: 0 0 0 0 rgba(228, 14, 32, 0); }
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <section className="relative w-full bg-background pb-32 overflow-hidden">
        {/* Modern background design with brand colors */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blurred gradient background */}
          <div className="absolute inset-0 opacity-10 backdrop-blur-3xl">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full" style={{ backgroundColor: brandColors.primary + "30" }}></div>
            <div className="absolute top-60 right-20 w-80 h-80 rounded-full" style={{ backgroundColor: brandColors.lightBlue + "20" }}></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full" style={{ backgroundColor: brandColors.gold + "20" }}></div>
          </div>
          
          {/* Decorative elements - using brand colors */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  brandColors.primary + "10",
                  brandColors.lightBlue + "10", 
                  brandColors.gold + "10",
                  brandColors.dark + "10"
                ][Math.floor(i % 4)]
              }}
              animate={{
                y: [0, Math.random() * 20 - 10],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Top transition - modern wave with brand colors */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          {/* Decorative wave pattern */}
          <svg 
            viewBox="0 0 1200 120" 
            className="w-full h-20 md:h-32 text-background"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              fill={brandColors.primary}
              opacity=".15"
            />
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              fill={brandColors.lightBlue}
              opacity=".25"
            />
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              fill="currentColor"
            />
          </svg>
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
          {/* Header with brand colors and refined styling */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-4">
              <motion.div
                className="absolute -inset-1 rounded-lg blur-xl opacity-40"
                style={{ background: `linear-gradient(90deg, ${brandColors.primary}40, ${brandColors.secondary}40)` }}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 3, 0] 
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
              <h2 className="relative text-4xl md:text-6xl font-fivo font-bold text-foreground tracking-tight">
                Destinos Imperdibles
              </h2>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-foreground/70 font-fivo font-medium text-lg mb-6">
              <span 
                className="h-0.5 w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)` }}
              />
              <span>Paraísos del Atlántico</span>
              <span 
                className="h-0.5 w-16 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${brandColors.primary}, transparent)` }}
              />
            </div>
            
            <motion.p 
              className="max-w-2xl mx-auto text-foreground/70 font-fivo text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Explora la diversidad de lugares que este hermoso departamento del Caribe colombiano tiene para ofrecer
            </motion.p>
          </motion.div>

          {/* Destination cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.slice(0, visibleDestinations).map((dest, idx) => (
              <motion.div
                key={dest.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => handleOpenModal(dest)}
              >
                {/* Glass morphism effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                  style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${dest.color}10, transparent 70%)`,
                    backdropFilter: "blur(3px)" 
                  }}
                ></motion.div>
                
                {/* Image container with parallax effect */}
                <div className="relative h-56 overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.8, ease: "easeOutQuint" }}
                  >
                    <Image
                      loader={({ src }) => src}
                      unoptimized
                      src={dest.image}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700"
                    />
                  </motion.div>
                  
                  {/* Enhanced overlay gradient */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(to top, ${dest.color}90, transparent 80%)` 
                    }}
                  ></div>
                  
                  {/* Glass morphism category badge */}
                  <div
                    className="absolute top-4 left-4 inline-flex items-center gap-2 text-white text-xs font-fivo font-semibold px-3 py-1.5 rounded-full backdrop-blur-lg shadow-lg z-20"
                    style={{ 
                      backgroundColor: dest.color + "AA",
                      boxShadow: `0 4px 12px ${dest.color}40`
                    }}
                  >
                    {dest.icon}
                    {dest.category}
                  </div>
                  
                  {/* Button shown on hover */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white text-sm font-fivo font-medium px-4 py-2 rounded-lg shadow-lg"
                      style={{ color: dest.color }}
                    >
                      Descubrir
                    </motion.button>
                  </div>
                </div>

                {/* Text content */}
                <div className="p-6 relative z-20">
                  {/* Animated accent line */}
                  <motion.div 
                    className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-1/2 transition-all duration-700 ease-out"
                    style={{ backgroundColor: dest.color }}
                  ></motion.div>
                  
                  <h3 className="font-fivo font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {dest.name}
                  </h3>
                  
                  <p className="font-fivo text-foreground/70 text-sm leading-relaxed">
                    {dest.description.length > 120 ? dest.description.substring(0, 120) + "..." : dest.description}
                  </p>
                  
                  {/* Enhanced "Ver más" link */}
                  <div className="mt-4 pt-3 border-t border-foreground/10 flex justify-end">
                    <motion.span 
                      className="text-sm font-fivo font-medium inline-flex items-center gap-1 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: dest.color }}
                    >
                      Ver más
                      <ChevronRight className="w-4 h-4" />
                    </motion.span>
                  </div>
                </div>
                
                {/* Corner decoration */}
                <div 
                  className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: `radial-gradient(circle at 100% 100%, ${dest.color}30, transparent 70%)` 
                  }}
                ></div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Load More button */}
          {visibleDestinations < destinations.length ? (
            <motion.div
              className="flex justify-center mt-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 8px 15px ${brandColors.primary}30`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={showMoreDestinations}
                className="inline-flex items-center gap-2 text-white font-fivo font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden"
                style={{ backgroundColor: brandColors.primary }}
              >
                {/* Animated shine effect */}
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)"
                  }}
                  animate={{ 
                    x: ['-100%', '200%'],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
                
                <span className="relative z-10">Ver más destinos</span>
                <ChevronRight className="w-5 h-5 relative z-10" />
              </motion.button>
            </motion.div>
          ) : (
            visibleDestinations > 4 && (
              <motion.div
                className="flex justify-center mt-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={showLessDestinations}
                  className="inline-flex items-center gap-2 font-fivo font-semibold px-8 py-3 rounded-full shadow-sm transition-all duration-300 relative"
                  style={{ 
                    color: brandColors.primary,
                    backgroundColor: "white",
                    border: `1px solid ${brandColors.primary}20`
                  }}
                >
                  <span>Mostrar menos</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12L5 12M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </motion.div>
            )
          )}
        </div>
        
        {/* Modal detallado para cada destino */}
        <AnimatePresence>
          {open && selected && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              <motion.div
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>

                <div className="flex flex-col md:flex-row">
                  {/* Left: Enhanced image section */}
                  <div className="md:w-1/2 relative">
                    <div className="relative h-64 md:h-full">
                      <Image
                        loader={({ src }) => src}
                        unoptimized
                        src={selected.image}
                        alt={selected.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      
                      {/* Enhanced gradient overlay */}
                      <div 
                        className="absolute inset-0 md:bg-gradient-to-r md:from-black/40 md:to-transparent"
                        style={{ 
                          background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.3) 60%, transparent)" 
                        }}
                      ></div>
                      
                      {/* Category badge */}
                      <div
                        className="absolute top-4 left-4 inline-flex items-center gap-2 text-white text-xs font-fivo font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg"
                        style={{ 
                          backgroundColor: selected.color + "CC",
                          boxShadow: `0 4px 12px ${selected.color}40` 
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full opacity-30"
                          style={{ 
                            background: `conic-gradient(from 0deg, ${selected.color}, transparent)`,
                            filter: "blur(8px)"
                          }}
                        />
                        {selected.category}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Enhanced content section */}
                  <div className="md:w-1/2 p-6 md:p-8">
                    <h2 className="font-fivo font-bold text-2xl md:text-3xl text-foreground mb-4">
                      {selected.name}
                    </h2>
                    
                    {/* Animated accent line */}
                    <motion.div 
                      className="h-0.5 w-0 mb-6"
                      initial={{ width: 0 }}
                      animate={{ width: "4rem" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: `${selected.color}70` }}
                    ></motion.div>
                    
                    <div className="prose prose-sm max-w-none font-fivo text-foreground/90 leading-relaxed">
                      <p>{selected.description}</p>
                      
                      <div className="mt-3 text-foreground/70">
                        <p>En este destino podrás disfrutar de:</p>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Paisajes naturales únicos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Experiencias auténticas con la comunidad local</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Gastronomía típica del Atlántico</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Actividades turísticas para toda la familia</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Enhanced Call to Action */}
                    <div className="mt-8">
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          boxShadow: `0 10px 25px ${brandColors.primary}25`,
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center w-full py-3 px-6 text-white font-fivo font-semibold rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          backgroundColor: brandColors.primary,
                          boxShadow: `0 8px 16px ${brandColors.primary}20`
                        }}
                      >
                        {/* Animated shine effect */}
                        <motion.div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)"
                          }}
                          animate={{ 
                            x: ['-100%', '200%'],
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut"
                          }}
                        />
                        
                        <span className="relative z-10">Planear visita a {selected.name}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
