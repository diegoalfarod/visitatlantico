"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Plane, 
  TreeDeciduous, 
  Droplet, 
  Recycle, 
  ShoppingBag, 
  Users,
  Award,
  Compass
} from 'lucide-react';

export default function ResponsibleTravel() {
  const [openTab, setOpenTab] = useState<number | null>(null);
  const [pledgeMade, setPledgeMade] = useState<boolean>(false);
  
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
  
  const toggleTab = (index: number): void => {
    if (openTab === index) {
      setOpenTab(null);
    } else {
      setOpenTab(index);
    }
  };
  
  const makePledge = (): void => {
    setPledgeMade(true);
    // Aquí podríamos agregar código para guardar el compromiso en la base de datos del usuario
  };
  
  const tips = [
    {
      title: "Transporte Sostenible",
      icon: <Plane className="w-5 h-5" style={{ color: brandColors.secondary.blue.light }} />,
      content: "Utiliza transporte público o bicicletas para recorrer el corredor costero. Considera alternativas de bajo impacto como kayak o paddle para explorar la Ciénaga de Mallorquín o el río Magdalena. Compensa tu huella de carbono al viajar desde otras regiones a Barranquilla."
    },
    {
      title: "Conservación Natural",
      icon: <TreeDeciduous className="w-5 h-5" style={{ color: brandColors.secondary.green.main }} />,
      content: "Respeta los senderos marcados en los manglares y ecosistemas del Atlántico. No alimentes ni perturbes la fauna en lugares como la Laguna del Cisne o Tubará. Participa en programas de conservación de la zona costera para proteger este paraíso de biodiversidad."
    },
    {
      title: "Ahorro de Agua",
      icon: <Droplet className="w-5 h-5" style={{ color: brandColors.secondary.blue.light }} />,
      content: "El Atlántico es una región con escasez de agua dulce. Toma duchas cortas en tu hospedaje, reutiliza toallas y sé consciente del uso del agua, especialmente en temporada seca. Lleva siempre contigo una botella reutilizable."
    },
    {
      title: "Gestión de Residuos",
      icon: <Recycle className="w-5 h-5" style={{ color: brandColors.secondary.blue.medium }} />,
      content: "No dejes basura en las playas de Puerto Colombia, Tubará o Juan de Acosta. Reduce el uso de plásticos de un solo uso, especialmente durante eventos como el Carnaval de Barranquilla. Dispón correctamente de tus residuos en las zonas rurales."
    },
    {
      title: "Apoyo Local",
      icon: <ShoppingBag className="w-5 h-5" style={{ color: brandColors.secondary.yellow.main }} />,
      content: "Compra artesanías de fibra de palma en Usiacurí o máscaras tradicionales del Carnaval en Galapa. Consume platos locales como arroz de lisa, sancocho de pescado y dulces típicos en restaurantes de comunidades locales, especialmente en municipios pequeños."
    },
    {
      title: "Respeto Cultural",
      icon: <Users className="w-5 h-5" style={{ color: brandColors.secondary.yellow.main }} />,
      content: "Aprende sobre las tradiciones del Carnaval de Barranquilla antes de participar. Pide permiso antes de fotografiar personas o ceremonias locales. Visita los museos que preservan la historia cultural como el Museo Romántico o el Museo Bolivariano."
    },
    {
      title: "Turismo de Aventura Responsable",
      icon: <Compass className="w-5 h-5" style={{ color: brandColors.secondary.green.main }} />,
      content: "Si practicas deportes náuticos en Puerto Velero o Salinas del Rey, respeta las indicaciones de seguridad y los ecosistemas marinos. Para el senderismo en zonas como la Serranía de Piojó, usa solo rutas establecidas y lleva de regreso toda tu basura."
    }
  ];
  
  const stats = [
    { label: "Reducción CO₂", value: "2.5 ton", description: "por viajero que usa transporte público y kayaks" },
    { label: "Apoyo económico", value: "+80%", description: "se queda en comunidades si compras artesanías locales" },
    { label: "Ahorro de agua", value: "1,500 L", description: "por semana usando prácticas responsables" },
    { label: "Plástico evitado", value: "3 kg", description: "por viajero durante una semana de estancia" }
  ];

  // Estilos para animaciones
  const backgroundKeyframes = `
    @keyframes gradientFlow {
      0% { background-position: 0% 50% }
      50% { background-position: 100% 50% }
      100% { background-position: 0% 50% }
    }
    
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(228, 14, 32, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(228, 14, 32, 0); }
      100% { box-shadow: 0 0 0 0 rgba(228, 14, 32, 0); }
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
      <section className="relative bg-background pt-28 pb-24 overflow-hidden" style={{ fontFamily: "'Fivo', 'Inter', sans-serif" }}>
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

        <div className="container mx-auto px-4 relative z-10 pt-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative text-center mb-16"
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
                
                {/* Icono principal */}
                <Award className="w-8 h-8" style={{ color: brandColors.neutral.dark }} />
                
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
              Viaje Responsable en Atlántico
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="text-lg font-medium" 
                style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
                Disfruta el Caribe preservando su belleza 🌊
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="max-w-2xl mx-auto"
              style={{ color: brandColors.neutral.medium }}
            >
              Pequeñas acciones que generan un gran impacto positivo en nuestro destino
            </motion.p>
          </motion.div>

          {/* 1. Infografía de estadísticas de impacto */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-3xl mb-12 shadow-lg border"
            style={{
              backgroundColor: "rgba(0, 154, 222, 0.03)",
              backdropFilter: "blur(8px)",
              borderColor: "rgba(0, 154, 222, 0.1)",
              boxShadow: "0 15px 35px rgba(0, 154, 222, 0.08)",
            }}
          >
            <h3 className="text-xl font-semibold text-center mb-8"
                style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.secondary.blue.medium }}>
              El Impacto de Tus Decisiones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-5 rounded-2xl shadow text-center transition-all duration-300 border"
                  style={{ borderColor: "rgba(0, 154, 222, 0.1)" }}
                >
                  <p className="text-3xl font-bold mb-1" style={{ color: brandColors.secondary.blue.medium }}>
                    {stat.value}
                  </p>
                  <p className="font-medium mb-1" style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}>
                    {stat.label}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* 2. Acordeón de consejos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold text-center mb-8" 
                style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}>
              Consejos para Viajeros Conscientes
            </h3>
            <div className="space-y-3 md:space-y-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.07 }}
                  className="border rounded-2xl overflow-hidden"
                  style={{ borderColor: `${brandColors.primary.main}10` }}
                >
                  <motion.button 
                    className="w-full flex items-center justify-between p-5 bg-white transition-colors duration-300"
                    onClick={() => toggleTab(index)}
                    whileHover={{ backgroundColor: "rgba(237, 242, 255, 0.7)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                           style={{ background: "rgba(0, 0, 0, 0.03)" }}>
                        {tip.icon}
                      </div>
                      <span className="font-semibold text-lg" 
                            style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}>
                        {tip.title}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ background: "rgba(0, 0, 0, 0.03)" }}>
                      {openTab === index ? 
                        <ChevronUp style={{ color: brandColors.primary.main }} /> : 
                        <ChevronDown style={{ color: brandColors.primary.main }} />}
                    </div>
                  </motion.button>
                  
                  {openTab === index && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white px-5 py-4 border-t"
                      style={{ borderColor: `${brandColors.primary.main}05` }}
                    >
                      <p style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium, lineHeight: "1.6" }}>
                        {tip.content}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* 3. Compromiso y badge */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-8 rounded-3xl border relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, ${brandColors.primary.main}05, ${brandColors.primary.main}10)`,
              borderColor: `${brandColors.primary.main}15`,
              boxShadow: `0 15px 35px ${brandColors.primary.main}05`,
            }}
          >
            {/* Elementos decorativos sutiles */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
                 style={{ 
                   background: brandColors.primary.main,
                   filter: 'blur(70px)'
                 }}></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-10"
                 style={{ 
                   background: brandColors.primary.main,
                   filter: 'blur(70px)'
                 }}></div>
            
            <h3 className="text-xl font-semibold text-center mb-4"
                style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}>
              Haz Tu Compromiso con el Atlántico
            </h3>
            <p className="text-center mb-8 max-w-xl mx-auto"
               style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
              Comprométete a seguir estos principios en tu viaje por el Atlántico y demuestra tu apoyo a la sostenibilidad del destino
            </p>
            
            <div className="flex flex-col items-center">
              {!pledgeMade ? (
                <motion.button 
                  onClick={makePledge} 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-all duration-300"
                  style={{ 
                    fontFamily: "'Fivo', 'Inter', sans-serif",
                    color: "white",
                    background: `linear-gradient(to right, ${brandColors.primary.main}, ${brandColors.primary.dark})`,
                    boxShadow: `0 8px 25px ${brandColors.primary.main}20`
                  }}
                >
                  <span>Me comprometo a viajar responsablemente por el Atlántico</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-8 rounded-2xl text-center w-full max-w-md shadow-lg border"
                  style={{
                    borderColor: `${brandColors.primary.main}10`,
                    boxShadow: `0 15px 35px ${brandColors.primary.main}10`,
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                         style={{ background: `${brandColors.primary.main}10` }}>
                      <Award className="h-10 w-10" style={{ color: brandColors.primary.main }} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2"
                      style={{ fontFamily: "'Fivo', 'Inter', sans-serif", color: brandColors.neutral.dark }}>
                    ¡Felicidades!
                  </h4>
                  <p className="mb-3" style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
                    
                  </p>
                  <p className="text-sm mt-2" style={{ fontFamily: "'Baloo', 'Inter', sans-serif", color: brandColors.neutral.medium }}>
                    Gracias por tu compromiso con la sostenibilidad y el respeto por los destinos costeros y culturales del Caribe colombiano.
                  </p>
                </motion.div>
              )}
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
        
        {/* Elemento de curva en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[100px]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
              fill="var(--background)"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
