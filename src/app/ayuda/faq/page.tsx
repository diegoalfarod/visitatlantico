"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  HelpCircle,
  MapPin,
  Sparkles,
  Utensils,
  Globe,
  Clock,
  MessageCircle,
  Map,
  Calendar,
  Compass,
  Download,
  Share2,
  Search,
  Route,
  Phone,
  Mail,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

// =============================================================================
// DESIGN SYSTEM
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#0f0f1a",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// =============================================================================
// FAQ DATA - Contenido completo y útil
// =============================================================================
const faqCategories = [
  {
    id: "jimmy",
    title: "Jimmy, tu Guía Virtual",
    icon: MessageCircle,
    color: COLORS.azulBarranquero,
    description: "Asistente conversacional 24/7",
    questions: [
      {
        id: "jimmy-1",
        question: "¿Quién es Jimmy y cómo puede ayudarme?",
        answer: "Jimmy es tu guía virtual del Atlántico, un asistente conversacional con inteligencia artificial disponible 24/7. Conoce a fondo la región: destinos, eventos, gastronomía, rutas y consejos locales. Puedes preguntarle cualquier cosa sobre tu viaje: desde '¿qué playas me recomiendas?' hasta '¿dónde comer un buen sancocho?'. Jimmy responde en español con personalidad costeña auténtica."
      },
      {
        id: "jimmy-2",
        question: "¿Cómo accedo a Jimmy?",
        answer: "Puedes abrir Jimmy de varias formas: 1) Haz clic en el botón flotante en la esquina inferior derecha de cualquier página. 2) En la sección 'Recursos para viajeros' del inicio, selecciona la tarjeta de Jimmy. 3) Escribe cualquier pregunta y Jimmy aparecerá automáticamente para ayudarte."
      },
      {
        id: "jimmy-3",
        question: "¿Jimmy puede crear itinerarios personalizados?",
        answer: "¡Sí! Jimmy puede sugerirte itinerarios basados en tus preferencias. Solo cuéntale cuántos días estarás, qué te interesa (playas, cultura, gastronomía, etc.) y él te propondrá un plan. Para itinerarios más detallados con horarios y mapas, te recomendará usar el Planificador de Viajes con IA."
      },
      {
        id: "jimmy-4",
        question: "¿Puedo preguntarle a Jimmy sobre eventos actuales?",
        answer: "Sí, Jimmy tiene acceso a la agenda de eventos del Atlántico. Pregúntale '¿qué eventos hay este fin de semana?' o '¿cuándo es el próximo festival gastronómico?' y te dará información actualizada con fechas, lugares y detalles."
      },
    ]
  },
  {
    id: "planificador",
    title: "Planificador con IA",
    icon: Sparkles,
    color: COLORS.naranjaSalinas,
    description: "Crea itinerarios personalizados",
    questions: [
      {
        id: "plan-1",
        question: "¿Cómo funciona el Planificador de Viajes?",
        answer: "El Planificador usa inteligencia artificial para crear itinerarios a tu medida. El proceso es simple: 1) Indica cuántos días estarás (1-7 días). 2) Selecciona hasta 3 tipos de experiencias que te interesan. 3) Elige si quieres explorar solo Barranquilla o también otros municipios. 4) La IA genera un itinerario optimizado con horarios, rutas y recomendaciones específicas para cada día."
      },
      {
        id: "plan-2",
        question: "¿Puedo modificar el itinerario después de generarlo?",
        answer: "¡Absolutamente! El itinerario es completamente editable: arrastra actividades para reordenarlas, ajusta horarios haciendo clic en ellos, elimina lugares que no te interesen, agrega nuevos destinos desde nuestra base de datos, e incluye descansos o comidas entre actividades. En móvil, mantén presionado para arrastrar."
      },
      {
        id: "plan-3",
        question: "¿Cómo descargo o comparto mi itinerario?",
        answer: "Tienes dos opciones: 1) Descargar PDF: Genera un documento completo con horarios, descripciones, direcciones y consejos. Perfecto para consultar offline o imprimir. 2) Compartir enlace: Crea un link único que puedes enviar por WhatsApp, email o redes sociales. En móvil se abre el menú nativo de compartir."
      },
      {
        id: "plan-4",
        question: "¿Necesito crear una cuenta para usar el Planificador?",
        answer: "No, el Planificador funciona sin registro. Solo pedimos tu email opcionalmente al final para enviarte el itinerario. Puedes descargar el PDF o compartir el enlace sin proporcionar ningún dato personal. Valoramos tu privacidad."
      },
      {
        id: "plan-5",
        question: "¿El Planificador considera distancias y tiempos de traslado?",
        answer: "Sí, la IA organiza las actividades considerando ubicaciones geográficas para minimizar traslados. Agrupa destinos cercanos y sugiere rutas lógicas. Cada actividad incluye información sobre cómo llegar desde el punto anterior."
      },
    ]
  },
  {
    id: "destinos",
    title: "Destinos y Experiencias",
    icon: MapPin,
    color: COLORS.verdeBijao,
    description: "Explora lugares increíbles",
    questions: [
      {
        id: "dest-1",
        question: "¿Qué tipos de destinos puedo encontrar?",
        answer: "Tenemos más de 15 categorías: Playas, Cultura, Naturaleza, Gastronomía, EcoTurismo, Aventura, Historia, Familia, Deportes, Vida Nocturna, Bienestar, Festivales, Romántico, Avistamiento de aves, Artesanías y Fotografía. Cada destino puede pertenecer a múltiples categorías."
      },
      {
        id: "dest-2",
        question: "¿Cómo filtro destinos según mis intereses?",
        answer: "En la página de Destinos encontrarás una barra de filtros sticky. Puedes: 1) Buscar por nombre o palabra clave. 2) Filtrar por categoría haciendo clic en los chips (Playas, Cultura, etc.). 3) Ver resultados que coincidan con tu búsqueda. Los filtros se combinan y la URL se actualiza, así que puedes guardar o compartir búsquedas específicas."
      },
      {
        id: "dest-3",
        question: "¿Cuál es la diferencia entre 'Destino' y 'Experiencia'?",
        answer: "Los Destinos son lugares físicos: playas, museos, parques, restaurantes, etc. Las Experiencias son actividades o tours que puedes realizar: avistamiento de aves, clases de cocina, recorridos culturales, deportes acuáticos. Ambos aparecen en la misma página con badges que los identifican."
      },
      {
        id: "dest-4",
        question: "¿Cada destino tiene página propia con más información?",
        answer: "Sí, cada destino tiene una página detallada con: galería de fotos, descripción completa, ubicación exacta con mapa, categorías, horarios (cuando aplica), consejos locales, y destinos relacionados que podrían interesarte."
      },
    ]
  },
  {
    id: "eventos",
    title: "Eventos y Festivales",
    icon: Calendar,
    color: COLORS.rojoCayena,
    description: "Agenda cultural del Atlántico",
    questions: [
      {
        id: "event-1",
        question: "¿Cómo encuentro eventos durante mi visita?",
        answer: "La página de Eventos muestra toda la agenda cultural del Atlántico. Puedes filtrar por: 1) Mes específico (Enero, Febrero, etc.). 2) Categoría (Música, Gastronomía, Deportes, Cultural, Feria, Religioso). 3) Búsqueda por nombre. Los eventos próximos aparecen primero, y los pasados se muestran en gris al final."
      },
      {
        id: "event-2",
        question: "¿Qué información incluye cada evento?",
        answer: "Cada evento muestra: nombre, fechas (inicio y fin si aplica), ubicación, categoría, si es gratuito o de pago, descripción, y un contador que indica cuántos días faltan. Los eventos destacados aparecen en una sección especial con más visibilidad."
      },
      {
        id: "event-3",
        question: "¿Puedo ver detalles de eventos pasados?",
        answer: "Sí, los eventos pasados permanecen visibles (con estilo atenuado) para referencia. Esto te ayuda a planificar futuras visitas conociendo qué eventos se celebran en cada época del año."
      },
      {
        id: "event-4",
        question: "¿Cómo me entero de nuevos eventos?",
        answer: "Actualizamos la agenda regularmente. Para estar al día, puedes: visitar la sección de eventos periódicamente, seguir las redes sociales de VisitAtlántico, o preguntarle a Jimmy sobre eventos próximos."
      },
    ]
  },
  {
    id: "mapa",
    title: "Mapa Interactivo",
    icon: Map,
    color: COLORS.azulBarranquero,
    description: "Explora geográficamente",
    questions: [
      {
        id: "map-1",
        question: "¿Cómo funciona el mapa interactivo?",
        answer: "El mapa muestra todos los destinos del Atlántico con marcadores interactivos. Puedes: hacer zoom para explorar áreas específicas, clic en marcadores para ver información rápida, filtrar por categorías para mostrar solo ciertos tipos de lugares, y navegar directamente a la página de cualquier destino."
      },
      {
        id: "map-2",
        question: "¿Puedo filtrar qué aparece en el mapa?",
        answer: "Sí, usa los filtros de categoría en la parte superior del mapa. Selecciona una o más categorías (Playas, Cultura, Gastronomía, etc.) y el mapa mostrará solo los destinos que coincidan. Esto es útil para planificar rutas temáticas."
      },
      {
        id: "map-3",
        question: "¿El mapa funciona en dispositivos móviles?",
        answer: "Sí, el mapa está optimizado para móviles. Usa gestos táctiles para navegar: pellizca para zoom, arrastra para mover, toca marcadores para ver información. La interfaz se adapta a pantallas pequeñas."
      },
    ]
  },
  {
    id: "gastronomia",
    title: "Ruta 23 - Gastronomía",
    icon: Utensils,
    color: COLORS.amarilloArepa,
    description: "Sabores del Atlántico",
    questions: [
      {
        id: "gastro-1",
        question: "¿Qué es la Ruta 23?",
        answer: "Ruta 23 es la iniciativa gastronómica de la Gobernación del Atlántico, liderada por la Primera Gestora Social Liliana Borrero. Promueve los 23 municipios del departamento a través de su riqueza culinaria: platos típicos, restaurantes locales, festivales gastronómicos y recetas tradicionales."
      },
      {
        id: "gastro-2",
        question: "¿Qué platos típicos puedo probar en el Atlántico?",
        answer: "La gastronomía atlanticense es rica y variada: arroz de lisa, sancocho de guandú, butifarra soledeña, carimañolas, arepas de huevo, bocachico frito, mojarra frita, arroz con coco, enyucado, y mucho más. Cada municipio tiene especialidades únicas que reflejan su historia y cultura."
      },
      {
        id: "gastro-3",
        question: "¿Hay festivales gastronómicos durante el año?",
        answer: "¡Sí! El Atlántico celebra numerosos festivales gastronómicos: Festival del Dulce en Semana Santa, Festival de la Arepa de Huevo en Luruaco, Festival del Pastel en Pital de Megua, y muchos más. Consulta la sección de Eventos filtrando por 'Gastronomía' para ver fechas específicas."
      },
    ]
  },
  {
    id: "rutas",
    title: "Rutas e Itinerarios",
    icon: Route,
    color: COLORS.verdeBijao,
    description: "Recorridos sugeridos",
    questions: [
      {
        id: "ruta-1",
        question: "¿Qué son las rutas turísticas?",
        answer: "Las rutas son itinerarios prediseñados que conectan varios destinos bajo una temática común. Por ejemplo: Ruta de Playas (recorrido por las mejores playas del departamento), Ruta Cultural (museos y sitios históricos), Ruta Gastronómica (sabores locales), Ruta de Naturaleza (ecoturismo y avistamiento)."
      },
      {
        id: "ruta-2",
        question: "¿Puedo personalizar una ruta existente?",
        answer: "Sí, las rutas son puntos de partida. Puedes usar el Planificador para generar un itinerario basado en una ruta y luego modificarlo: agregar paradas, quitar destinos, ajustar tiempos. También puedes crear rutas completamente nuevas desde cero."
      },
      {
        id: "ruta-3",
        question: "¿Las rutas incluyen información de transporte?",
        answer: "Las rutas muestran las ubicaciones y distancias entre puntos. Para transporte específico, recomendamos: transporte público para destinos urbanos, taxi o carro particular para rutas largas, o contratar tours organizados que incluyen transporte."
      },
    ]
  },
  {
    id: "practica",
    title: "Info Práctica del Atlántico",
    icon: Clock,
    color: COLORS.beigeIraca,
    description: "Consejos para tu viaje",
    questions: [
      {
        id: "prac-1",
        question: "¿Cuál es la mejor época para visitar?",
        answer: "El Atlántico tiene clima cálido tropical todo el año (24°C - 32°C). Temporada seca (diciembre-abril): ideal para playas y actividades al aire libre. Temporada de lluvias (mayo-noviembre): lluvias cortas, generalmente por la tarde. El Carnaval de Barranquilla (febrero/marzo) es la época más vibrante pero concurrida."
      },
      {
        id: "prac-2",
        question: "¿Cómo me muevo entre municipios?",
        answer: "Barranquilla es el hub principal. Opciones de transporte: 1) Transmetro y buses para zonas urbanas. 2) Taxis y apps de transporte (Uber, inDriver) para trayectos cortos. 3) Buses intermunicipales desde terminales. 4) Carro particular o alquiler para mayor libertad. 5) Tours organizados que incluyen transporte."
      },
      {
        id: "prac-3",
        question: "¿Es seguro viajar por el Atlántico?",
        answer: "El Atlántico es generalmente seguro para turistas. Recomendaciones básicas: guarda objetos de valor, usa transporte confiable, evita mostrar dinero en efectivo, prefiere zonas turísticas en la noche. Los locales son amables y serviciales con los visitantes. En emergencias: Policía de Turismo disponible en zonas turísticas."
      },
      {
        id: "prac-4",
        question: "¿Qué debo empacar para mi viaje?",
        answer: "Esenciales para clima tropical: ropa ligera y fresca, protector solar (SPF 50+), sombrero o gorra, lentes de sol, traje de baño, sandalias cómodas, repelente de insectos, botella de agua reutilizable. Para actividades específicas: zapatos cerrados para senderismo, ropa cómoda para el Carnaval."
      },
      {
        id: "prac-5",
        question: "¿Qué moneda se usa y cómo pago?",
        answer: "La moneda es el Peso Colombiano (COP). Tarjetas de crédito/débito son aceptadas en establecimientos grandes. Recomendamos llevar efectivo para mercados, vendedores ambulantes y zonas rurales. Hay cajeros automáticos en todas las cabeceras municipales."
      },
    ]
  },
  {
    id: "sitio",
    title: "Uso del Sitio Web",
    icon: Globe,
    color: COLORS.azulBarranquero,
    description: "Navegación y funciones",
    questions: [
      {
        id: "sitio-1",
        question: "¿El sitio está disponible en inglés?",
        answer: "Sí, VisitAtlántico está disponible en español e inglés. Usa el selector de idioma (ES | EN) en la navegación para cambiar. Todo el contenido, incluyendo destinos, eventos y el Planificador, está traducido."
      },
      {
        id: "sitio-2",
        question: "¿Puedo usar el sitio sin conexión a internet?",
        answer: "El sitio requiere conexión para funcionar. Sin embargo, puedes: 1) Descargar itinerarios como PDF para consultar offline. 2) Tomar capturas de pantalla de información importante. 3) Descargar la Guía Turística PDF desde la sección de Recursos."
      },
      {
        id: "sitio-3",
        question: "¿El sitio funciona bien en móviles?",
        answer: "Sí, VisitAtlántico está completamente optimizado para móviles. Todas las funciones están adaptadas: navegación por gestos, menús táctiles, imágenes responsivas, y formularios optimizados para pantallas pequeñas."
      },
      {
        id: "sitio-4",
        question: "¿Cómo reporto un error o sugiero mejoras?",
        answer: "Agradecemos tu feedback. Puedes: 1) Usar la página de Contacto. 2) Enviar email a atencionalciudadano@atlantico.gov.co. 3) Contactarnos por redes sociales. Si encuentras información desactualizada, indícanos el lugar específico para corregirlo."
      },
      {
        id: "sitio-5",
        question: "¿Cómo descargo la Guía Turística PDF?",
        answer: "La Guía Turística gratuita está disponible en: 1) Sección 'Recursos para viajeros' en la página de inicio. 2) Footer del sitio. 3) Haciendo clic en 'Descargar guía' en varios lugares del sitio. El PDF incluye información esencial sobre destinos, mapas y consejos."
      },
    ]
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function CategoryButton({ 
  category, 
  isActive, 
  onClick 
}: { 
  category: typeof faqCategories[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const Icon = category.icon;
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
        transition-all duration-300 text-left
        ${isActive 
          ? "bg-white shadow-lg border border-slate-100" 
          : "hover:bg-white/50"
        }
      `}
    >
      <div 
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-300
        `}
        style={{ 
          backgroundColor: isActive ? `${category.color}15` : "transparent",
        }}
      >
        <Icon 
          className="w-5 h-5 transition-colors" 
          style={{ color: isActive ? category.color : "#888" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className={`font-medium text-sm truncate transition-colors ${
            isActive ? "text-slate-900" : "text-slate-600"
          }`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {category.title}
        </p>
        <p 
          className="text-xs text-slate-400 truncate"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {category.description}
        </p>
      </div>
      {isActive && (
        <div 
          className="w-1.5 h-8 rounded-full"
          style={{ backgroundColor: category.color }}
        />
      )}
    </button>
  );
}

function QuestionItem({ 
  question, 
  isOpen, 
  onToggle,
  index,
  color,
}: { 
  question: { id: string; question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: EASE }}
      className={`
        border rounded-2xl overflow-hidden transition-all duration-300
        ${isOpen 
          ? "border-slate-200 bg-white shadow-sm" 
          : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-start gap-4 text-left"
      >
        <div 
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            transition-all duration-300 mt-0.5
          `}
          style={{ 
            backgroundColor: isOpen ? `${color}15` : "#f5f5f5",
          }}
        >
          <span 
            className="text-sm font-semibold"
            style={{ color: isOpen ? color : "#888" }}
          >
            {index + 1}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-semibold transition-colors ${
              isOpen ? "text-slate-900" : "text-slate-700"
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {question.question}
          </h3>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown 
            className="w-5 h-5 transition-colors"
            style={{ color: isOpen ? color : "#ccc" }}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pl-[4.5rem]">
              <p 
                className="text-slate-600 leading-relaxed"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {question.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("jimmy");
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const toggleQuestion = (id: string) => {
    setOpenQuestions(prev =>
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const currentCategory = faqCategories.find(cat => cat.id === activeCategory);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenQuestions([]);
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <div 
        className="relative overflow-hidden"
        style={{ backgroundColor: COLORS.grisOscuro }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
            style={{ background: COLORS.azulBarranquero }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
            style={{ background: COLORS.naranjaSalinas }}
          />
          {/* Grain */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-16">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-10 group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Inicio
            </Link>
          </motion.div>
          
          <div ref={headerRef} className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <HelpCircle size={16} style={{ color: COLORS.naranjaSalinas }} />
              <span 
                className="text-sm font-medium text-white/70"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Centro de ayuda
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Preguntas Frecuentes
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-white/50 max-w-xl leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Todo lo que necesitas saber para aprovechar al máximo tu experiencia en VisitAtlántico y planificar tu viaje perfecto.
            </motion.p>
          </div>
        </div>
      </div>

      {/* ================================================================
          FAQ CONTENT
          ================================================================ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Categories */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Mobile Category Selector */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {currentCategory && (
                    <>
                      <currentCategory.icon 
                        className="w-5 h-5" 
                        style={{ color: currentCategory.color }}
                      />
                      <span 
                        className="font-medium text-slate-800"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {currentCategory.title}
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg p-2">
                      {faqCategories.map((category) => (
                        <CategoryButton
                          key={category.id}
                          category={category}
                          isActive={activeCategory === category.id}
                          onClick={() => handleCategoryChange(category.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-8">
              <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                <h2 
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2 mb-1"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Categorías
                </h2>
                <div className="space-y-1">
                  {faqCategories.map((category) => (
                    <CategoryButton
                      key={category.id}
                      category={category}
                      isActive={activeCategory === category.id}
                      onClick={() => handleCategoryChange(category.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Questions */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Category Header */}
                {currentCategory && (
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${currentCategory.color}15` }}
                      >
                        <currentCategory.icon 
                          className="w-6 h-6" 
                          style={{ color: currentCategory.color }}
                        />
                      </div>
                      <div>
                        <h2 
                          className="text-2xl font-bold text-slate-900"
                          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                        >
                          {currentCategory.title}
                        </h2>
                        <p 
                          className="text-slate-500 text-sm"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {currentCategory.questions.length} preguntas
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-3">
                  {currentCategory?.questions.map((q, index) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      isOpen={openQuestions.includes(q.id)}
                      onToggle={() => toggleQuestion(q.id)}
                      index={index}
                      color={currentCategory.color}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================================================================
          CONTACT CTA
          ================================================================ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
          style={{ backgroundColor: COLORS.grisOscuro }}
        >
          {/* Background glow */}
          <div 
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
            style={{ background: COLORS.azulBarranquero }}
          />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 
                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                ¿No encontraste lo que buscabas?
              </h3>
              <p 
                className="text-white/60 max-w-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Nuestro equipo está disponible para resolver cualquier duda adicional sobre tu viaje al Atlántico.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Mail className="w-5 h-5" />
                Contáctanos
              </Link>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("jimmy:open"));
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: `${COLORS.azulBarranquero}`,
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <MessageCircle className="w-5 h-5" />
                Pregúntale a Jimmy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}