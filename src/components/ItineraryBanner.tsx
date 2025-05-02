"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Compass, 
  Sparkles, 
  Map, 
  Brain, 
  Clock,
  Landmark,
  Utensils,
  Mountain,
  ChevronRight
} from "lucide-react";

export default function ItineraryBanner() {
  // Color palette from client brand identity
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

  // Animaciones
  const customStyles = `
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
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
      70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes glow {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
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

  // Variantes de animación para framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <section className="py-10 px-4 mx-auto my-16 relative overflow-hidden" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2rem] overflow-hidden"
          >
            {/* Fondo premium con gradiente animado adaptado a la marca usando azules */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundSize: "200% 200%",
                animation: "gradientFlow 15s ease infinite",
                background: `linear-gradient(135deg, ${brandColors.darkBlue} 0%, ${brandColors.lightBlue}CC 50%, ${brandColors.lightTeal} 100%)`,
              }}
            />
            
            {/* Efectos decorativos que armonizan con el diseño general */}
            <div className="absolute inset-0 z-0">
              {/* Círculos decorativos similares a los otros componentes */}
              <div className="absolute -top-20 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-white/10 blur-3xl opacity-80"></div>
              
              {/* Elementos decorativos sutiles */}
              <div className="absolute top-12 left-1/4 w-6 h-6 rounded-full bg-white/20"></div>
              <div className="absolute top-24 right-1/3 w-8 h-8 rounded-full bg-white/30"></div>
              <div className="absolute top-8 right-1/4 w-3 h-3 rounded-full bg-white/40"></div>
            </div>
            
            {/* Patrón geométrico sutil */}
            <div className="absolute inset-0 z-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Formas geométricas como en los otros componentes */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <svg 
                viewBox="0 0 1440 200" 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute top-0 left-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Forma base */}
                <path 
                  d="M0,192L30,176C60,160,120,128,180,122.7C240,117,300,139,360,160C420,181,480,203,540,197.3C600,192,660,160,720,133.3C780,107,840,85,900,85.3C960,85,1020,107,1080,112C1140,117,1200,107,1260,90.7C1320,75,1380,53,1410,42.7L1440,32L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z" 
                  fill="url(#grad1)"
                  opacity="0.3"
                />
                
                {/* Forma superpuesta con desplazamiento */}
                <path 
                  d="M0,160L40,138.7C80,117,160,75,240,64C320,53,400,75,480,96C560,117,640,139,720,133.3C800,128,880,96,960,85.3C1040,75,1120,85,1200,101.3C1280,117,1360,139,1400,149.3L1440,160L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
                  fill="url(#grad2)"
                  opacity="0.3"
                />
                
                {/* Tercera forma para más dinamismo */}
                <path 
                  d="M0,64L48,69.3C96,75,192,85,288,96C384,107,480,117,576,112C672,107,768,85,864,80C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                  fill="url(#grad3)"
                  opacity="0.2"
                />
                
                {/* Definimos gradientes con colores de marca */}
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={brandColors.secondary} stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="50%" stopColor={brandColors.secondary} stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Íconos flotantes premium */}
            <div className="absolute inset-0 z-0">
              <div 
                className="absolute left-[5%] top-[20%] text-white/10" 
                style={{ animation: "floatAnimation 6s ease-in-out infinite" }}
              >
                <Map className="w-16 h-16" />
              </div>
              <div 
                className="absolute right-[8%] bottom-[15%] text-white/10" 
                style={{ animation: "floatAnimation 7s ease-in-out infinite 1s" }}
              >
                <Compass className="w-14 h-14" />
              </div>
            </div>
            
            {/* Capa de desenfoque glassmorphism */}
            <div className="absolute inset-0 z-0 backdrop-blur-[2px]"></div>
            
            {/* Contenido principal */}
            <div className="relative z-10 flex flex-col md:flex-row items-stretch">
              {/* Lado izquierdo - Información */}
              <div className="p-8 md:p-12 lg:p-16 text-white md:w-7/12 flex flex-col justify-center">
                {/* Badge exclusiva */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 self-start border border-white/20 shadow-xl"
                  style={{ boxShadow: "0 4px 20px rgba(255,255,255,0.2)" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span className="text-sm font-medium" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Nuevo | Powered by AI</span>
                </motion.div>
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
                    style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}
                  >
                    Tu Itinerario{" "}
                    <span 
                      className="bg-clip-text text-transparent"
                      style={{ 
                        backgroundImage: "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0.8))",
                        textShadow: "0 0 20px rgba(255,255,255,0.3)",
                        fontFamily: "'Fivo', 'Inter', sans-serif"
                      }}
                    >
                      Inteligente
                    </span>
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="mb-8 text-lg md:text-xl text-white/90 max-w-xl leading-relaxed"
                    style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}
                  >
                    Gracias a la IA avanzada, creamos la ruta perfecta por el Atlántico colombiano basada en tus preferencias, optimizando cada momento de tu aventura.
                  </motion.p>
                  
                  {/* Badges de intereses con efecto de vidrio */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-3 mb-10"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/20"
                         style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
                      <Compass className="w-4 h-4 text-white" /> Playas
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/20"
                         style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
                      <Landmark className="w-4 h-4 text-white" /> Cultura
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/20"
                         style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
                      <Utensils className="w-4 h-4 text-white" /> Gastronomía
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/20"
                         style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
                      <Mountain className="w-4 h-4 text-white" /> Aventura
                    </div>
                  </motion.div>
                  
                  {/* Beneficios premium */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-6 mb-10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Personalizado</h4>
                        <p className="text-sm text-white/80" style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}>Adaptado a tus preferencias</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Rutas Locales</h4>
                        <p className="text-sm text-white/80" style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}>Descubre joyas ocultas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Optimizado</h4>
                        <p className="text-sm text-white/80" style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}>Maximiza tu tiempo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Personalizable</h4>
                        <p className="text-sm text-white/80" style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}>Ajústalo a tu agenda</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                  >
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white font-semibold py-4 px-8 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300"
                      style={{ 
                        fontFamily: "'Fivo', 'Inter', sans-serif",
                        color: brandColors.darkBlue,
                        boxShadow: "0 10px 30px rgba(255, 255, 255, 0.2)" 
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Crear Itinerario Personalizado</span>
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Lado derecho - Visualización premium */}
              <div className="hidden md:flex md:w-5/12 relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                
                <div className="relative h-full flex items-center justify-center p-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="relative z-10"
                  >
                    {/* Itinerario simulado - Diseño premium */}
                    <div 
                      className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm transform rotate-1"
                      style={{ 
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {/* Header del itinerario */}
                      <div className="p-5" style={{ backgroundColor: brandColors.darkBlue }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Tu Aventura Atlántico</h3>
                            <p className="text-white/70 text-sm" style={{ fontFamily: "'Baloo', 'Inter', sans-serif" }}>3 días de experiencias</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido del itinerario */}
                      <div className="p-5">
                        {/* Día 1 */}
                        <div className="mb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-semibold"
                                 style={{ backgroundColor: brandColors.darkBlue }}>1</div>
                            <div className="font-bold text-gray-800" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Barranquilla Cultural</div>
                          </div>
                          <div className="pl-11 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue }}></div>
                              <div className="h-5 rounded bg-gray-200 w-full"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite"
                                }}></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue + "BB" }}></div>
                              <div className="h-5 rounded bg-gray-200 w-4/5"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite 0.2s"
                                }}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Día 2 */}
                        <div className="mb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-semibold"
                                 style={{ backgroundColor: brandColors.darkBlue }}>2</div>
                            <div className="font-bold text-gray-800" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Playas del Atlántico</div>
                          </div>
                          <div className="pl-11 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue }}></div>
                              <div className="h-5 rounded bg-gray-200 w-full"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite 0.4s"
                                }}></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue + "BB" }}></div>
                              <div className="h-5 rounded bg-gray-200 w-3/4"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite 0.6s"
                                }}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Día 3 */}
                        <div className="mb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-semibold"
                                 style={{ backgroundColor: brandColors.darkBlue }}>3</div>
                            <div className="font-bold text-gray-800" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>Aventura y Gastronomía</div>
                          </div>
                          <div className="pl-11 space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue }}></div>
                              <div className="h-5 rounded bg-gray-200 w-full"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite 0.8s"
                                }}></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="min-w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: brandColors.darkBlue + "BB" }}></div>
                              <div className="h-5 rounded bg-gray-200 w-2/3"
                                style={{ 
                                  background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                                  backgroundSize: "200% 100%",
                                  animation: "shimmer 2s infinite 1s"
                                }}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mapa premium */}
                        <div className="mt-6 relative overflow-hidden rounded-xl">
                          <div className="h-32 bg-gray-200 rounded-xl"
                            style={{ 
                              background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 2s infinite 0.3s"
                            }}>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                                 style={{ backgroundColor: brandColors.darkBlue + "E0" }}>
                              <Map className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Elemento decorativo detrás del itinerario */}
                                          <div 
                      className="absolute -z-10 -bottom-4 -left-4 right-4 top-4 bg-gradient-to-br rounded-2xl -rotate-2"
                      style={{ 
                        backgroundImage: `linear-gradient(to bottom right, ${brandColors.darkBlue}20, ${brandColors.lightBlue}10)`,
                        boxShadow: "0 15px 50px -12px rgba(0, 0, 0, 0.25)" 
                      }}
                    ></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}