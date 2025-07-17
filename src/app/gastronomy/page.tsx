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
  FaArrowRight,
  FaQuoteLeft,
  FaHeart,
  FaClock,
  FaUsers
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
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
  const [categoriesDisponibles, setCategoriesDisponibles] = useState<string[]>([]);
  const [showAllFestivales, setShowAllFestivales] = useState(false);
  const [showAllPlatos, setShowAllPlatos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePlato, setActivePlato] = useState<PlatoTipico | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [festivalModalOpen, setFestivalModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fallback images
  const FALLBACK_PLATO_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&crop=center";
  const FALLBACK_FESTIVAL_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&crop=center";

  // Obtener datos de Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const platosSnapshot = await getDocs(collection(db, "platos_tipicos"));
        const platosData = platosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imagen: data.imagePath || data.imagen || FALLBACK_PLATO_IMAGE
          };
        }) as PlatoTipico[];
        
        const festivalesSnapshot = await getDocs(collection(db, "festivales"));
        const festivalesData = festivalesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imagen: data.imagePath || data.imagen || FALLBACK_FESTIVAL_IMAGE
          };
        }) as Festival[];

        setPlatosTipicos(platosData);
        setFestivales(festivalesData);

        const categoriasUnicas = [...new Set(platosData
          .map(plato => plato.categoria)
          .filter(categoria => categoria && categoria.trim() !== "")
        )].sort();
        
        setCategoriesDisponibles(categoriasUnicas);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar platos por categoría - CORREGIDO
  const platosFiltrados = filtroCategoria === "Todos" 
    ? platosTipicos 
    : platosTipicos.filter(plato => {
        if (!plato.categoria) return false;
        const platoCategoria = plato.categoria.toLowerCase().trim();
        const filtroNormalizado = filtroCategoria.toLowerCase().trim();
        return platoCategoria === filtroNormalizado || 
               platoCategoria.includes(filtroNormalizado) ||
               filtroNormalizado.includes(platoCategoria);
      });

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

  // Búsqueda automática en Google para restaurantes
  const searchInGoogle = (platoNombre: string) => {
    const query = `restaurantes "${platoNombre}" Atlántico Colombia Barranquilla`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank');
  };

  // Agregar festival a calendario
  const addToCalendar = () => {
    if (!activeFestival) return;
    
    const currentYear = new Date().getFullYear();
    const eventDate = new Date(`${activeFestival.fecha_mes} ${activeFestival.fecha_dia}, ${currentYear}`);
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activeFestival.nombre)}&dates=${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}/${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(activeFestival.descripcion)}&location=${encodeURIComponent(activeFestival.lugar)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Función para manejar el cambio de filtro - CORREGIDO
  const handleFilterChange = (categoria: string) => {
    setFiltroCategoria(categoria);
    setShowAllPlatos(false);
    // Forzar re-render
    setTimeout(() => {
      const element = document.getElementById('platos-tipicos');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Animaciones mejoradas - MÁS RÁPIDAS
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.645, 0.045, 0.355, 1.0]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Navbar />
      
      {/* CORRECCIÓN: Aplicar padding-top usando la variable CSS del navbar */}
      <div style={{ paddingTop: 'var(--navbar-height, 80px)' }}>
        
        {/* Hero Section Premium */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Fondo con gradiente premium */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-500"></div>
          
          {/* Overlay con patrón */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Elementos flotantes animados */}
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"
            animate={{ 
              y: [0, 20, 0],
              x: [0, -10, 0],
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1.0] }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white mb-6 text-sm font-medium"
              >
                <HiSparkles className="text-yellow-300" />
                <span>Patrimonio Culinario del Caribe</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
                <span className="block font-light mb-2 text-3xl md:text-4xl opacity-90">Descubre la</span>
                Gastronomía
                <span className="block text-yellow-300 mt-2">del Atlántico</span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-white/90 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Un viaje sensorial por los sabores auténticos y las tradiciones 
                culinarias que definen el alma del Caribe colombiano
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button 
                  onClick={() => {
                    const platosSection = document.getElementById('platos-tipicos');
                    platosSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  Explorar Sabores
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                
              </motion.div>
            </motion.div>
          </div>
          
          {/* Wave separator mejorado */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="white"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white" opacity="0.3"></path>
            </svg>
          </div>
        </section>

        {/* Intro Section Premium */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="order-2 lg:order-1">
                <motion.span 
                  className="inline-block text-red-600 font-medium mb-4 text-sm tracking-wider uppercase"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  Tradición & Sabor
                </motion.span>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  El Sabor Auténtico del 
                  <span className="text-red-600 block">Caribe Colombiano</span>
                </h2>
                
                <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-yellow-400 mb-8 rounded-full"></div>
                
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                  <p>
                    El departamento del Atlántico es un crisol de culturas donde convergen 
                    las tradiciones indígenas, africanas y europeas, creando una gastronomía 
                    única que cautiva todos los sentidos.
                  </p>
                  
                  <div className="flex items-start gap-4 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                    <FaQuoteLeft className="text-3xl text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="italic text-gray-700">
                      "Cada plato cuenta una historia, cada sabor es un viaje a través 
                      del tiempo y las tradiciones de nuestra gente."
                    </p>
                  </div>
                  
                  <p>
                    Desde los frescos ceviches bañados por las brisas del Mar Caribe hasta 
                    los aromáticos sancochos que reúnen a las familias, nuestra cocina es 
                    una celebración de la vida y la abundancia de esta tierra bendecida.
                  </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-12">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-red-600 mb-1">50+</div>
                    <div className="text-sm text-gray-600">Platos Típicos</div>
                  </motion.div>
                  <motion.div 
                    className="text-center border-x border-gray-200"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-red-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Festivales Anuales</div>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-red-600 mb-1">100+</div>
                    <div className="text-sm text-gray-600">Años de Tradición</div>
                  </motion.div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Imagen principal con efecto */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                    <Image 
                      src="/images/gastronomia-intro.jpg" 
                      alt="Gastronomía del Atlántico" 
                      width={700} 
                      height={700} 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  
                  {/* Elementos decorativos flotantes */}
                  <motion.div 
                    className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  <motion.div 
                    className="absolute -bottom-6 -left-6 w-24 h-24 bg-red-600 rounded-full opacity-20 blur-2xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  
                  {/* Badge flotante */}
                  <motion.div 
                    className="absolute top-8 right-8 bg-white rounded-2xl p-4 shadow-xl"
                    initial={{ rotate: -12 }}
                    animate={{ rotate: -12, y: [0, -10, 0] }}
                    transition={{ y: { duration: 3, repeat: Infinity } }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl flex items-center justify-center">
                        <FaHeart className="text-white text-lg" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">100%</div>
                        <div className="text-xs text-gray-600">Auténtico</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platos Típicos Section Premium */}
        <section id="platos-tipicos" className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <motion.span 
                className="inline-block text-red-600 font-medium mb-4 text-sm tracking-wider uppercase"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Nuestra Cocina
              </motion.span>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Platos Típicos
              </h2>
              
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-400 mx-auto mb-8 rounded-full"></div>
              
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Descubre los sabores más representativos del Atlántico, donde cada plato 
                es una obra maestra de tradición y creatividad culinaria.
              </p>
            </motion.div>

            {/* Filtros Premium */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => handleFilterChange("Todos")}
                className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  filtroCategoria === "Todos"
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <FaUtensils />
                  Todos ({platosTipicos.length})
                </span>
              </motion.button>

              {categoriesDisponibles.map((categoria) => {
                const count = platosTipicos.filter(plato => {
                  if (!plato.categoria) return false;
                  const platoCategoria = plato.categoria.toLowerCase().trim();
                  const categoriaFilter = categoria.toLowerCase().trim();
                  return platoCategoria === categoriaFilter || 
                         platoCategoria.includes(categoriaFilter) ||
                         categoriaFilter.includes(platoCategoria);
                }).length;
                
                return (
                  <motion.button
                    key={categoria}
                    onClick={() => handleFilterChange(categoria)}
                    className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                      filtroCategoria === categoria
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <FaUtensils />
                      {categoria} ({count})
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Grid de Platos Premium */}
            {loading ? (
              <div className="flex justify-center py-20">
                <motion.div 
                  className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : platosFiltrados.length === 0 ? (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-6">🍽️</div>
                <p className="text-gray-600 text-lg mb-6">
                  No se encontraron platos para la categoría "{filtroCategoria}"
                </p>
                <button
                  onClick={() => handleFilterChange("Todos")}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Ver todos los platos
                </button>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                key={filtroCategoria} // CORRECCIÓN: Forzar re-render cuando cambie el filtro
              >
                {platosVisibles.map((plato) => (
                  <motion.div 
                    key={`${plato.id}-${filtroCategoria}`} // CORRECCIÓN: Key único por filtro
                    variants={scaleIn}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(plato.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                        
                        <Image 
                          src={plato.imagen} 
                          alt={plato.nombre} 
                          width={600} 
                          height={400} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_PLATO_IMAGE;
                          }}
                        />
                        
                        {plato.destacado && (
                          <motion.div 
                            className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <HiSparkles />
                            Destacado
                          </motion.div>
                        )}
                        
                        {/* Overlay con información al hover */}
                        <AnimatePresence>
                          {hoveredCard === plato.id && (
                            <motion.div 
                              className="absolute inset-0 bg-black/70 flex items-center justify-center z-20"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <button
                                onClick={() => openModal(plato)}
                                className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium transform hover:scale-105 transition-transform"
                              >
                                Ver Detalles
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-1">
                          {plato.nombre}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {plato.descripcion}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-500">
                            <FaMapMarkerAlt className="mr-2 text-red-500" />
                            {plato.origen}
                          </div>
                          <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                            {plato.categoria}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Botón Ver Más Premium */}
            {platosFiltrados.length > 6 && (
              <motion.div 
                className="text-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setShowAllPlatos(!showAllPlatos)}
                  className="group inline-flex items-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-medium hover:border-red-500 hover:text-red-600 transition-all duration-300"
                >
                  {showAllPlatos ? (
                    <>
                      <FaChevronUp className="group-hover:-translate-y-1 transition-transform" />
                      Ver Menos
                    </>
                  ) : (
                    <>
                      <span>Ver {platosFiltrados.length - 6} platos más</span>
                      <FaChevronDown className="group-hover:translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Festivales Gastronómicos Premium */}
        <section id="festivales" className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <motion.span 
                className="inline-block text-red-600 font-medium mb-4 text-sm tracking-wider uppercase"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Celebraciones
              </motion.span>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Festivales Gastronómicos
              </h2>
              
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-yellow-400 mx-auto mb-8 rounded-full"></div>
              
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Vive la pasión culinaria del Atlántico a través de festivales que 
                celebran nuestras tradiciones y sabores más emblemáticos.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <motion.div 
                  className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
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
                    variants={scaleIn}
                    className="group"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-2/5 relative h-64 md:h-auto">
                          <Image 
                            src={festival.imagen} 
                            alt={festival.nombre} 
                            width={400} 
                            height={300} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = FALLBACK_FESTIVAL_IMAGE;
                            }}
                          />
                          
                          {/* Badge de fecha mejorado */}
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-red-600">{festival.fecha_dia}</div>
                              <div className="text-sm text-gray-600 uppercase tracking-wider">{festival.fecha_mes}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-3/5 p-8 flex flex-col justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-red-600 transition-colors">
                              {festival.nombre}
                            </h3>
                            
                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                              {festival.descripcion}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-red-500" />
                                {festival.lugar}
                              </div>
                              <div className="flex items-center">
                                <FaUsers className="mr-2 text-red-500" />
                                Evento público
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button 
                              onClick={() => openFestivalModal(festival)}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <FaCalendarAlt />
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Botón Ver Más */}
            {festivales.length > 3 && (
              <motion.div 
                className="text-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setShowAllFestivales(!showAllFestivales)}
                  className="group inline-flex items-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-medium hover:border-red-500 hover:text-red-600 transition-all duration-300"
                >
                  {showAllFestivales ? (
                    <>
                      <FaChevronUp className="group-hover:-translate-y-1 transition-transform" />
                      Ver Menos
                    </>
                  ) : (
                    <>
                      <span>Ver más festivales</span>
                      <FaChevronDown className="group-hover:translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Modal para detalles del plato - Premium */}
        <AnimatePresence>
          {modalOpen && activePlato && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-80">
                  <Image 
                    src={activePlato.imagen} 
                    alt={activePlato.nombre} 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_PLATO_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  <button 
                    className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                    onClick={closeModal}
                  >
                    <FaTimes className="text-gray-700 text-lg" />
                  </button>
                  
                  {activePlato.destacado && (
                    <div className="absolute bottom-6 left-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <HiSparkles />
                      Plato Destacado
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-3 text-gray-900">{activePlato.nombre}</h3>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center text-gray-600">
                        <FaUtensils className="mr-2 text-red-500" />
                        {activePlato.categoria}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        {activePlato.origen}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-red-500" />
                        Preparación tradicional
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-red-500"></span>
                        Descripción
                      </h4>
                      <p className="text-gray-600 leading-relaxed">{activePlato.descripcion}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-red-500"></span>
                        Ingredientes Principales
                      </h4>
                      <ul className="space-y-2">
                        {activePlato.ingredientes && activePlato.ingredientes.length > 0 ? (
                          activePlato.ingredientes.map((ingrediente, index) => (
                            <li key={index} className="flex items-center text-gray-600">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                              {ingrediente}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">Información no disponible</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" />
                      Dónde Probarlo
                    </h4>
                    <p className="text-gray-600">
                      {activePlato.donde_probar || "Consulta con los locales para encontrar los mejores lugares donde degustar este plato tradicional."}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 p-6 bg-gray-50 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-yellow-400 text-lg" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">Altamente recomendado</span>
                  </div>
                  
                  <button 
                    onClick={() => searchInGoogle(activePlato.nombre)}
                    className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <FaMapMarkerAlt />
                    Buscar Restaurantes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal para detalles del festival - Premium */}
        <AnimatePresence>
          {festivalModalOpen && activeFestival && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFestivalModal}
            >
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-80">
                  <Image 
                    src={activeFestival.imagen} 
                    alt={activeFestival.nombre} 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_FESTIVAL_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  <button 
                    className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                    onClick={closeFestivalModal}
                  >
                    <FaTimes className="text-gray-700 text-lg" />
                  </button>
                  
                  {/* Fecha en el modal */}
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600">{activeFestival.fecha_dia}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wider">{activeFestival.fecha_mes}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">{activeFestival.nombre}</h3>
                  
                  <div className="flex items-center gap-6 mb-8 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-red-500" />
                      {activeFestival.fecha_mes} {activeFestival.fecha_dia}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      {activeFestival.lugar}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-red-500" />
                      Evento público
                    </div>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-red-500"></span>
                      Acerca del Festival
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{activeFestival.descripcion}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-center">
                  <button 
                    onClick={addToCalendar}
                    className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-3"
                  >
                    <FaCalendarAlt />
                    Agregar a mi Calendario
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
};

export default GastronomiaPage;