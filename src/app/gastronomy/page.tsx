"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FaUtensils, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaStar, 
  FaChevronDown, 
  FaChevronUp,
  FaTimes,
  FaInstagram,
  FaFacebookF,
  FaTwitter
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Tipos
type PlatoTipico = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  categoria: string;
  destacado: boolean;
  origen: string;
  ingredientes?: string[];
  donde_probar?: string;
};

type Festival = {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_dia: string;
  fecha_mes: string;
  lugar: string;
  imagen: string;
  enfocado: boolean;
};

const GastronomiaPage = () => {
  // Estados
  const [festivales, setFestivales] = useState<Festival[]>([]);
  const [platosTipicos, setPlatosTipicos] = useState<PlatoTipico[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [showAllFestivales, setShowAllFestivales] = useState(false);
  const [showAllPlatos, setShowAllPlatos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePlato, setActivePlato] = useState<PlatoTipico | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [festivalModalOpen, setFestivalModalOpen] = useState(false);

  // Obtener datos de Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener platos típicos
        const platosSnapshot = await getDocs(collection(db, "platos_tipicos"));
        const platosData = platosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PlatoTipico[];
        
        // Obtener festivales
        const festivalesSnapshot = await getDocs(collection(db, "festivales_gastronomicos"));
        const festivalesData = festivalesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Festival[];

        setPlatosTipicos(platosData);
        setFestivales(festivalesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar platos por categoría
  const platosFiltrados = filtroCategoria === "Todos" 
    ? platosTipicos 
    : platosTipicos.filter(plato => plato.categoria === filtroCategoria);

  // Control de visualización
  const festivalesVisibles = showAllFestivales ? festivales : festivales.slice(0, 3);
  const platosVisibles = showAllPlatos ? platosFiltrados : platosFiltrados.slice(0, 6);

  // Manejador de modal para platos
  const openModal = (plato: PlatoTipico) => {
    setActivePlato(plato);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "auto";
  };

  // Manejador de modal para festivales
  const openFestivalModal = (festival: Festival) => {
    setActiveFestival(festival);
    setFestivalModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFestivalModal = () => {
    setFestivalModalOpen(false);
    document.body.style.overflow = "auto";
  };

  // Agregar festival a calendario
  const addToCalendar = () => {
    if (!activeFestival) return;
    
    // Formatear la fecha para el evento de calendario
    const currentYear = new Date().getFullYear();
    const eventDate = new Date(`${activeFestival.fecha_mes} ${activeFestival.fecha_dia}, ${currentYear}`);
    
    // Crear evento para Google Calendar
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activeFestival.nombre)}&dates=${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}/${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(activeFestival.descripcion)}&location=${encodeURIComponent(activeFestival.lugar)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Animaciones
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Colores de marca
  const brandColors = {
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

  return (
    <>
      {/* Overlay de "Muy Pronto" */}
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl">
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          {/* Capa adicional para mejor contraste */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40"></div>
          
          {/* Gradientes animados de fondo */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#E40E20]/30 to-[#F4B223]/30 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#009ADE]/30 to-[#00B451]/30 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#F4B223]/20 to-[#E40E20]/20 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          {/* Contenido principal */}
          <motion.div 
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge de estado */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/30 px-4 py-2 rounded-full mb-8 shadow-2xl"
            >
              <span className="w-2 h-2 bg-[#F4B223] rounded-full animate-pulse shadow-lg shadow-[#F4B223]/50"></span>
              <span className="text-white font-medium font-fivo">En Desarrollo</span>
            </motion.div>

            {/* Título principal */}
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-white mb-6 font-fivo drop-shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Muy Pronto
            </motion.h1>

            {/* Subtítulo */}
            <motion.p 
              className="text-xl md:text-2xl text-white mb-8 font-baloo max-w-2xl mx-auto drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Estamos preparando una experiencia gastronómica única del Atlántico para ti
            </motion.p>

            {/* Línea decorativa animada */}
            <motion.div 
              className="w-32 h-1 bg-gradient-to-r from-[#E40E20] to-[#F4B223] mx-auto mb-12 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            ></motion.div>

            {/* Elementos flotantes de comida */}
            <motion.div 
              className="flex justify-center gap-8 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="w-16 h-16 bg-black/30 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center shadow-xl"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FaUtensils className="text-white text-2xl" />
              </motion.div>
              <motion.div 
                className="w-16 h-16 bg-black/30 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center shadow-xl"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
              >
                <FaStar className="text-white text-2xl" />
              </motion.div>
              <motion.div 
                className="w-16 h-16 bg-black/30 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center shadow-xl"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              >
                <FaCalendarAlt className="text-white text-2xl" />
              </motion.div>
            </motion.div>

            {/* Mensaje de espera */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-md mx-auto"
            >
              <p className="text-white mb-6 font-baloo">
                Sé el primero en descubrir los sabores del Atlántico
              </p>
              <div className="bg-black/40 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center shadow-2xl">
                <p className="text-white mb-3 font-baloo">
                  Estamos cocinando algo especial para ti
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-white rounded-full shadow-lg"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/80 text-xs font-fivo">
                  Lanzamiento estimado: Junio 2025
                </p>
              </div>
            </motion.div>

            {/* Redes sociales */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center gap-4 mt-12"
            >
              <a href="#" className="w-12 h-12 bg-black/30 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition shadow-xl hover:shadow-2xl">
                <FaInstagram />
              </a>
              
            </motion.div>

            {/* Indicador de progreso */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-16"
            >
              <p className="text-white text-xs mb-2 font-fivo">Progreso de desarrollo</p>
              <div className="w-64 h-2 bg-black/30 backdrop-blur-lg rounded-full mx-auto overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#E40E20] to-[#F4B223] rounded-full shadow-lg"
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                ></motion.div>
              </div>
              <p className="text-white text-xs mt-2 font-fivo">75% Completado</p>
            </motion.div>

            {/* Botón de volver */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8"
            >
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-white/80 font-fivo text-sm transition-colors bg-black/30 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30 hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </a>
            </motion.div>
          </motion.div>

          {/* Partículas decorativas */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full shadow-lg"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contenido original con blur */}
      <div className="filter blur-sm pointer-events-none select-none">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden text-white">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/gastronomia-hero.jpg" 
              alt="Gastronomía del Atlántico" 
              fill 
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-fivo">
                Gastronomía del Atlántico
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-baloo">
                Un viaje de sabores por la tradición culinaria del Caribe colombiano
              </p>
              <button 
                onClick={() => {
                  const platosSection = document.getElementById('platos-tipicos');
                  if (platosSection) {
                    platosSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-[#E40E20] px-8 py-3 rounded-full font-fivo font-semibold text-lg hover:bg-opacity-90 transition shadow-lg"
              >
                Explorar Sabores
              </button>
            </motion.div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="flex flex-col md:flex-row gap-12 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.8 }}
            >
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#4A4F55] font-fivo">
                  El Sabor del Caribe Colombiano
                </h2>
                <div className="h-1 w-20 bg-[#E40E20] mb-6 rounded-full"></div>
                <p className="text-[#7A858C] mb-6 font-baloo">
                  El departamento del Atlántico, ubicado en la costa caribeña de Colombia, 
                  es un tesoro de diversidad gastronómica que refleja su rica herencia cultural. 
                  Con el Mar Caribe bañando sus costas, la cocina atlanticense se caracteriza 
                  por su frescura, sabores intensos y creatividad.
                </p>
                <p className="text-[#7A858C] mb-6 font-baloo">
                  La gastronomía del Atlántico es resultado de una fascinante mezcla de influencias 
                  indígenas, africanas, europeas y árabes. Aquí, los mariscos frescos, tubérculos 
                  como la yuca, frutas tropicales y especias locales se transforman en platos 
                  llenos de historia y tradición.
                </p>
                <p className="text-[#7A858C] font-baloo">
                  Los habitantes del Atlántico han convertido su pasión por la comida en una expresión 
                  cultural, celebrando múltiples festivales gastronómicos que honran ingredientes 
                  emblemáticos como la arepa de huevo, el pescado, los pasteles y la butifarra.
                </p>
              </div>
              <div className="md:w-1/2 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image 
                    src="/images/gastronomia-intro.jpg" 
                    alt="Gastronomía del Atlántico" 
                    width={600} 
                    height={600} 
                    className="w-full h-auto"
                  />
                  <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#E40E20] to-[#FF715B]"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg hidden md:block">
                  <Image 
                    src="/images/detalle-gastronomia-1.jpg" 
                    alt="Detalle gastronómico" 
                    width={200} 
                    height={200} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg hidden md:block">
                  <Image 
                    src="/images/detalle-gastronomia-2.jpg" 
                    alt="Detalle gastronómico" 
                    width={200} 
                    height={200} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platos Típicos Section */}
        <section id="platos-tipicos" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4F55] font-fivo">
                Platos Típicos
              </h2>
              <div className="h-1 w-20 bg-[#E40E20] mx-auto mb-6 rounded-full"></div>
              <p className="text-[#7A858C] max-w-3xl mx-auto font-baloo">
                Descubre los sabores más representativos del Atlántico, una mezcla de tradición y 
                creatividad que caracterizan la identidad gastronómica de la región.
              </p>
            </motion.div>

            {/* Filtros */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {["Todos", "Entradas", "Platos Principales", "Postres"].map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setFiltroCategoria(categoria)}
                  className={`px-5 py-3 rounded-full font-medium text-sm inline-flex items-center gap-2 transition-all duration-300 ${
                    filtroCategoria === categoria
                      ? "text-white"
                      : "bg-white text-[#7A858C] hover:bg-[#F5F5F5]"
                  } shadow-sm font-fivo`}
                  style={{
                    backgroundColor: filtroCategoria === categoria ? "#F4B223" : "",
                    boxShadow: filtroCategoria === categoria ? `0 8px 16px ${brandColors.secondary.yellow.main}30` : "",
                  }}
                >
                  <FaUtensils className={filtroCategoria === categoria ? "text-white" : "text-[#7A858C]"} />
                  {categoria}
                </button>
              ))}
            </motion.div>

            {/* Grid de Platos */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40E20]"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {platosVisibles.map((plato) => (
                  <motion.div 
                    key={plato.id}
                    variants={fadeIn}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative">
                      <Image 
                        src={plato.imagen} 
                        alt={plato.nombre} 
                        width={600} 
                        height={400} 
                        className="w-full h-60 object-cover transition-transform duration-500 hover:scale-110"
                      />
                      {plato.destacado && (
                        <div className="absolute top-4 right-4 bg-[#E40E20] text-white text-xs font-bold px-3 py-1 rounded-full font-fivo shadow-lg">
                          Destacado
                        </div>
                      )}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E40E20] to-[#FF715B]"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-[#4A4F55] font-fivo">{plato.nombre}</h3>
                      <p className="text-[#7A858C] mb-4 line-clamp-3 font-baloo">{plato.descripcion}</p>
                      <div className="flex items-center text-sm text-[#7A858C] mb-4 font-fivo">
                        <FaMapMarkerAlt className="mr-2 text-[#009ADE]" />
                        {plato.origen}
                      </div>
                      <button
                        onClick={() => openModal(plato)}
                        className="w-full bg-[#4A4F55] hover:bg-[#5A5F65] text-white py-3 rounded-lg font-fivo transition-colors flex items-center justify-center gap-2"
                      >
                        <FaUtensils size={14} />
                        Ver Detalles
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Botón Ver Más */}
            {platosFiltrados.length > 6 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllPlatos(!showAllPlatos)}
                  className="inline-flex items-center gap-2 bg-white border border-[#E0E0E0] text-[#4A4F55] px-8 py-3 rounded-full shadow-sm hover:shadow transition font-fivo"
                >
                  {showAllPlatos ? (
                    <>
                      <FaChevronUp size={14} />
                      Ver Menos
                    </>
                  ) : (
                    <>
                      <FaChevronDown size={14} />
                      Ver Más Platos
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Festivales Gastronómicos */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4F55] font-fivo">
                Festivales Gastronómicos
              </h2>
              <div className="h-1 w-20 bg-[#E40E20] mx-auto mb-6 rounded-full"></div>
              <p className="text-[#7A858C] max-w-3xl mx-auto font-baloo">
                Celebraciones de la cultura culinaria que preservan tradiciones y sabores 
                auténticos del Atlántico a lo largo del año.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40E20]"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {festivalesVisibles.map((festival) => (
                  <motion.div 
                    key={festival.id}
                    variants={fadeIn}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="md:w-2/5 relative">
                        <Image 
                          src={festival.imagen} 
                          alt={festival.nombre} 
                          width={400} 
                          height={300} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E40E20] to-[#FF715B]"></div>
                        
                        {/* Fecha */}
                        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg">
                          <div className="text-center px-3 py-1">
                            <span className="block text-xl font-bold text-[#E40E20] font-fivo">{festival.fecha_dia}</span>
                            <span className="block text-sm text-[#4A4F55] font-fivo">{festival.fecha_mes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-3/5 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-[#4A4F55] font-fivo">{festival.nombre}</h3>
                          <p className="text-[#7A858C] mb-4 line-clamp-3 font-baloo">{festival.descripcion}</p>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-[#7A858C] mb-4 font-fivo">
                            <FaMapMarkerAlt className="mr-2 text-[#009ADE]" />
                            {festival.lugar}
                          </div>
                          <button 
                            onClick={() => openFestivalModal(festival)}
                            className="w-full bg-[#F4B223] hover:bg-[#E5A213] text-white py-3 rounded-lg font-fivo transition-colors flex items-center justify-center gap-2"
                          >
                            <FaCalendarAlt size={14} />
                            Ver Festival
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Botón Ver Más */}
            {festivales.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllFestivales(!showAllFestivales)}
                  className="inline-flex items-center gap-2 bg-white border border-[#E0E0E0] text-[#4A4F55] px-8 py-3 rounded-full shadow-sm hover:shadow transition font-fivo"
                >
                  {showAllFestivales ? (
                    <>
                      <FaChevronUp size={14} />
                      Ver Menos
                    </>
                  ) : (
                    <>
                      <FaChevronDown size={14} />
                      Ver Más Festivales
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Modal para detalles del plato */}
        <AnimatePresence>
          {modalOpen && activePlato && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div 
                className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-64">
                  <Image 
                    src={activePlato.imagen} 
                    alt={activePlato.nombre} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E40E20] to-[#FF715B]"></div>
                  <button 
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                    onClick={closeModal}
                  >
                    <FaTimes className="text-[#4A4F55]" />
                  </button>
                  
                  {activePlato.destacado && (
                    <div className="absolute bottom-4 left-4 bg-[#E40E20] text-white text-xs font-bold px-3 py-1 rounded-full font-fivo shadow-lg">
                      Destacado
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-2xl font-bold mb-2 text-[#4A4F55] font-fivo">{activePlato.nombre}</h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-sm text-[#7A858C] font-fivo">
                      <FaUtensils className="mr-2 text-[#F4B223]" />
                      {activePlato.categoria}
                    </div>
                    <div className="flex items-center text-sm text-[#7A858C] font-fivo">
                      <FaMapMarkerAlt className="mr-2 text-[#009ADE]" />
                      {activePlato.origen}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-[#4A4F55] mt-6 mb-2 font-fivo">Descripción</h4>
                  <p className="text-[#7A858C] mb-6 font-baloo">{activePlato.descripcion}</p>
                  
                  <h4 className="font-bold text-[#4A4F55] mb-2 font-fivo">Ingredientes Principales</h4>
                  <ul className="list-disc list-inside text-[#7A858C] mb-6 font-baloo">
                    {activePlato.ingredientes && activePlato.ingredientes.length > 0 ? (
                      activePlato.ingredientes.map((ingrediente, index) => (
                        <li key={index}>{ingrediente}</li>
                      ))
                    ) : (
                      <li>Información no disponible</li>
                    )}
                  </ul>
                  
                  <h4 className="font-bold text-[#4A4F55] mb-2 font-fivo">Dónde Probarlo</h4>
                  <p className="text-[#7A858C] font-baloo">
                    {activePlato.donde_probar || "Consulta con los locales para encontrar los mejores lugares donde probar este plato."}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-[#F4B223]" />
                    ))}
                  </div>
                  <button className="bg-[#4A4F55] hover:bg-[#5A5F65] text-white px-6 py-2 rounded-lg font-fivo transition-colors">
                    Ver Restaurantes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal para detalles del festival */}
        <AnimatePresence>
          {festivalModalOpen && activeFestival && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFestivalModal}
            >
              <motion.div 
                className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-64">
                  <Image 
                    src={activeFestival.imagen} 
                    alt={activeFestival.nombre} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E40E20] to-[#FF715B]"></div>
                  <button 
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                    onClick={closeFestivalModal}
                  >
                    <FaTimes className="text-[#4A4F55]" />
                  </button>
                  
                  {/* Fecha en el modal */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-[#E40E20] font-fivo">{activeFestival.fecha_dia}</span>
                      <span className="block text-sm text-[#4A4F55] font-fivo">{activeFestival.fecha_mes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-2xl font-bold mb-2 text-[#4A4F55] font-fivo">{activeFestival.nombre}</h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-sm text-[#7A858C] font-fivo">
                      <FaCalendarAlt className="mr-2 text-[#009ADE]" />
                      {activeFestival.fecha_mes} {activeFestival.fecha_dia}
                    </div>
                    <div className="flex items-center text-sm text-[#7A858C] font-fivo">
                      <FaMapMarkerAlt className="mr-2 text-[#009ADE]" />
                      {activeFestival.lugar}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-[#4A4F55] mt-6 mb-2 font-fivo">Descripción</h4>
                  <p className="text-[#7A858C] mb-6 font-baloo">{activeFestival.descripcion}</p>
                  
                  {activeFestival.enfocado && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaStar className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700 font-fivo">
                            Este festival está enfocado en un plato o ingrediente específico de la región.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50">
                  <button 
                    onClick={addToCalendar}
                    className="bg-[#00B451] hover:bg-[#00833E] text-white px-6 py-2 rounded-lg font-fivo transition-colors flex items-center gap-2"
                  >
                    <FaCalendarAlt />
                    Agregar a Calendario
                  </button>
                  <button className="bg-[#4A4F55] hover:bg-[#5A5F65] text-white px-6 py-2 rounded-lg font-fivo transition-colors">
                    Más Información
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>

      {/* CSS para animaciones */}
      <style jsx global>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .font-fivo {
          font-family: 'Fivo', 'Inter', system-ui, sans-serif;
        }

        .font-baloo {
          font-family: 'Baloo', 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </>
  );
};

export default GastronomiaPage;