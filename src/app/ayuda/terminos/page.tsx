"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  Users,
  Globe,
  Shield,
  AlertTriangle,
  Scale,
  BookOpen,
  Mail,
  Clock,
  ChevronRight,
  Sparkles,
  Map,
  MessageCircle,
  Camera,
  Link2,
  Ban,
  Gavel,
} from "lucide-react";
import Footer from "@/components/Footer";

// =============================================================================
// DESIGN SYSTEM
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  verdeBijao: "#008D39",
  amarilloArepa: "#F39200",
  grisOscuro: "#0f0f1a",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// =============================================================================
// SECTION COMPONENT
// =============================================================================
interface SectionProps {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Section({ number, title, icon: Icon, children }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE }}
      className="scroll-mt-24"
      id={`section-${number}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${COLORS.naranjaSalinas}10` }}
        >
          <Icon className="w-5 h-5" style={{ color: COLORS.naranjaSalinas }} />
        </div>
        <div>
          <span 
            className="text-xs font-semibold uppercase tracking-wider text-slate-400"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Sección {number}
          </span>
          <h2 
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div 
        className="pl-14 space-y-4 text-slate-600 leading-relaxed"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {children}
      </div>
    </motion.section>
  );
}

// =============================================================================
// TABLE OF CONTENTS
// =============================================================================
const tableOfContents = [
  { number: "1", title: "Aceptación de Términos", id: "section-1" },
  { number: "2", title: "Definiciones", id: "section-2" },
  { number: "3", title: "Descripción del Servicio", id: "section-3" },
  { number: "4", title: "Uso Permitido", id: "section-4" },
  { number: "5", title: "Conductas Prohibidas", id: "section-5" },
  { number: "6", title: "Propiedad Intelectual", id: "section-6" },
  { number: "7", title: "Funcionalidades de IA", id: "section-7" },
  { number: "8", title: "Contenido de Usuario", id: "section-8" },
  { number: "9", title: "Enlaces Externos", id: "section-9" },
  { number: "10", title: "Limitación de Responsabilidad", id: "section-10" },
  { number: "11", title: "Modificaciones", id: "section-11" },
  { number: "12", title: "Ley Aplicable", id: "section-12" },
  { number: "13", title: "Contacto", id: "section-13" },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function TerminosPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
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
              style={{ background: COLORS.naranjaSalinas }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
              style={{ background: COLORS.azulBarranquero }}
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
                <FileText size={16} style={{ color: COLORS.naranjaSalinas }} />
                <span 
                  className="text-sm font-medium text-white/70"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Documento legal
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
                Términos y Condiciones
              </motion.h1>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-white/50 max-w-xl leading-relaxed mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Condiciones de uso del portal turístico oficial del Departamento del Atlántico. Por favor, léelos detenidamente antes de utilizar nuestros servicios.
              </motion.p>
              
              {/* Last Updated */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isHeaderInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-2 text-white/40 text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Clock size={14} />
                <span>Última actualización: Enero 2025</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ================================================================
            CONTENT
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar - Table of Contents */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Contenido
                  </h3>
                  <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <span 
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors"
                        >
                          {item.number}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Quick Summary */}
                <div className="mt-6 bg-orange-50 rounded-2xl p-6 border border-orange-100">
                  <h4 
                    className="font-semibold text-slate-800 mb-3 text-sm"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Resumen rápido
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Uso gratuito e informativo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Respetamos tu privacidad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Contenido oficial del Atlántico</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-100 p-8 lg:p-10 shadow-sm">
                
                {/* Intro */}
                <div 
                  className="mb-12 pb-8 border-b border-slate-100"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Bienvenido a <strong>VisitAtlántico</strong>, el portal turístico oficial del Departamento del Atlántico, Colombia. Este sitio es operado por la <strong>Gobernación del Atlántico</strong> a través de su Secretaría de Turismo.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Al acceder y utilizar este sitio web, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, te pedimos que no utilices el sitio.
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-12">
                  
                  {/* Section 1 */}
                  <Section number="1" title="Aceptación de los Términos" icon={CheckCircle2}>
                    <p>
                      Al acceder, navegar o utilizar cualquier funcionalidad de VisitAtlántico, incluyendo el Planificador de Viajes, Jimmy (asistente virtual), el mapa interactivo, o cualquier otro servicio disponible, declaras que:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Has leído y comprendido estos Términos y Condiciones</li>
                      <li>Aceptas quedar vinculado por ellos en su totalidad</li>
                      <li>Tienes la capacidad legal para aceptar estos términos</li>
                      <li>Si actúas en nombre de una organización, tienes autoridad para vincularla</li>
                    </ul>
                    <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
                      El uso continuado del sitio después de cualquier modificación a estos términos constituye tu aceptación de los términos modificados.
                    </p>
                  </Section>

                  {/* Section 2 */}
                  <Section number="2" title="Definiciones" icon={BookOpen}>
                    <p>Para efectos de estos Términos y Condiciones, se entenderá por:</p>
                    
                    <div className="space-y-3">
                      {[
                        { term: "Sitio", def: "El portal web VisitAtlántico, accesible en visitatlantico.gov.co y sus subdominios." },
                        { term: "Usuario", def: "Toda persona que accede, navega o utiliza cualquier funcionalidad del Sitio." },
                        { term: "Contenido", def: "Toda información, textos, imágenes, videos, mapas, datos y materiales disponibles en el Sitio." },
                        { term: "Servicios", def: "Las funcionalidades ofrecidas, incluyendo el Planificador de Viajes, Jimmy, mapa interactivo, agenda de eventos y guías descargables." },
                        { term: "Administrador", def: "La Gobernación del Atlántico, a través de su Secretaría de Turismo, responsable de la operación del Sitio." },
                      ].map((item) => (
                        <div key={item.term} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">{item.term}:</strong>
                            <span className="text-slate-600"> {item.def}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Section 3 */}
                  <Section number="3" title="Descripción del Servicio" icon={Globe}>
                    <p>
                      VisitAtlántico es una plataforma digital de información turística que ofrece:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: Map, title: "Destinos y Experiencias", desc: "Información sobre lugares turísticos, actividades y experiencias en el Atlántico." },
                        { icon: Sparkles, title: "Planificador con IA", desc: "Herramienta para crear itinerarios personalizados usando inteligencia artificial." },
                        { icon: MessageCircle, title: "Jimmy (Asistente Virtual)", desc: "Chatbot conversacional para resolver dudas sobre turismo en la región." },
                        { icon: Camera, title: "Eventos y Festivales", desc: "Agenda actualizada de eventos culturales, gastronómicos y festivos." },
                      ].map((item) => (
                        <div key={item.title} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon className="w-4 h-4" style={{ color: COLORS.azulBarranquero }} />
                            <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                          </div>
                          <p className="text-sm text-slate-600">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-sm">
                      Todos los servicios son <strong>gratuitos</strong> y tienen fines exclusivamente informativos y de promoción turística.
                    </p>
                  </Section>

                  {/* Section 4 */}
                  <Section number="4" title="Uso Permitido" icon={CheckCircle2}>
                    <p>El Usuario puede utilizar el Sitio y sus Servicios para:</p>
                    
                    <ul className="space-y-2">
                      {[
                        "Consultar información turística sobre el Departamento del Atlántico",
                        "Crear itinerarios de viaje personalizados para uso personal",
                        "Descargar y compartir itinerarios generados con familiares y amigos",
                        "Interactuar con Jimmy para obtener recomendaciones turísticas",
                        "Explorar el mapa interactivo de destinos",
                        "Consultar la agenda de eventos y festivales",
                        "Descargar guías turísticas en formato PDF para uso personal",
                        "Compartir contenido del Sitio en redes sociales con atribución apropiada",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>

                  {/* Section 5 */}
                  <Section number="5" title="Conductas Prohibidas" icon={Ban}>
                    <p>Queda expresamente prohibido:</p>
                    
                    <ul className="space-y-2">
                      {[
                        "Reproducir, distribuir o explotar el Contenido con fines comerciales sin autorización escrita",
                        "Utilizar técnicas de scraping, bots o sistemas automatizados para extraer datos del Sitio",
                        "Intentar acceder de forma no autorizada a sistemas, bases de datos o áreas restringidas",
                        "Publicar reseñas falsas, información engañosa o que induzca a error a otros usuarios",
                        "Utilizar Jimmy o el Planificador para generar contenido ofensivo, ilegal o dañino",
                        "Suplantar la identidad de otra persona o entidad",
                        "Introducir virus, malware o cualquier código malicioso",
                        "Interferir con el funcionamiento normal del Sitio o sobrecargar sus servidores",
                        "Utilizar el Sitio para actividades ilegales o contrarias a la moral y el orden público",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-4">
                      El incumplimiento de estas prohibiciones puede resultar en el bloqueo de acceso al Sitio y, de ser procedente, en acciones legales.
                    </p>
                  </Section>

                  {/* Section 6 */}
                  <Section number="6" title="Propiedad Intelectual" icon={Shield}>
                    <p>
                      Todo el Contenido del Sitio, incluyendo pero no limitado a:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Diseño, estructura y apariencia visual</li>
                      <li>Logotipos, marcas e identidad gráfica del Atlántico</li>
                      <li>Textos, descripciones y artículos</li>
                      <li>Fotografías e imágenes</li>
                      <li>Videos y contenido multimedia</li>
                      <li>Software, código y algoritmos</li>
                      <li>Bases de datos de destinos y eventos</li>
                    </ul>
                    
                    <p>
                      Están protegidos por las leyes de propiedad intelectual de Colombia (Ley 23 de 1982 y Decisión Andina 351) y tratados internacionales. La Gobernación del Atlántico se reserva todos los derechos no concedidos expresamente.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                      <strong>Uso permitido:</strong> Puedes compartir enlaces al Sitio y citar contenido breve con atribución a VisitAtlántico. Para otros usos, contacta a <a href="mailto:atencionalciudadano@atlantico.gov.co" style={{ color: COLORS.azulBarranquero }}>atencionalciudadano@atlantico.gov.co</a>.
                    </div>
                  </Section>

                  {/* Section 7 */}
                  <Section number="7" title="Funcionalidades de Inteligencia Artificial" icon={Sparkles}>
                    <p>
                      VisitAtlántico utiliza tecnología de inteligencia artificial en algunas de sus funcionalidades. Al usarlas, aceptas las siguientes condiciones:
                    </p>
                    
                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 mb-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Jimmy (Asistente Virtual)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        <li>Jimmy proporciona información general y recomendaciones, no asesoría profesional</li>
                        <li>Las respuestas se generan automáticamente y pueden contener inexactitudes</li>
                        <li>No debes compartir información personal sensible en las conversaciones</li>
                        <li>Jimmy utiliza tecnología de Anthropic (Claude) para procesar consultas</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <h4 className="font-semibold text-slate-800 mb-3">Planificador de Viajes con IA</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        <li>Los itinerarios son sugerencias generadas automáticamente</li>
                        <li>Debes verificar horarios, disponibilidad y condiciones de cada destino</li>
                        <li>El Planificador no realiza reservas ni garantiza disponibilidad</li>
                        <li>Los tiempos de traslado son estimados y pueden variar</li>
                      </ul>
                    </div>
                    
                    <p className="text-sm mt-4">
                      <strong>Descargo:</strong> Las funcionalidades de IA son herramientas de asistencia. El Usuario es responsable de verificar la información y tomar sus propias decisiones de viaje.
                    </p>
                  </Section>

                  {/* Section 8 */}
                  <Section number="8" title="Contenido Generado por Usuarios" icon={Users}>
                    <p>
                      Si el Sitio permite en el futuro que los usuarios publiquen reseñas, comentarios, fotos u otro contenido:
                    </p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>El Usuario conserva los derechos sobre su contenido original</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>Al publicar, otorgas una licencia no exclusiva para mostrar y promocionar el contenido</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>Eres responsable de que tu contenido no viole derechos de terceros</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>Nos reservamos el derecho de moderar y eliminar contenido inapropiado</span>
                      </li>
                    </ul>
                  </Section>

                  {/* Section 9 */}
                  <Section number="9" title="Enlaces a Sitios Externos" icon={Link2}>
                    <p>
                      El Sitio puede contener enlaces a páginas web de terceros, incluyendo:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Sitios oficiales de la Gobernación del Atlántico</li>
                      <li>Portales de turismo nacional (Colombia.travel)</li>
                      <li>Redes sociales de destinos y establecimientos</li>
                      <li>Plataformas de reserva y servicios turísticos</li>
                    </ul>
                    
                    <p>
                      Estos enlaces se proporcionan únicamente para tu conveniencia. No controlamos, respaldamos ni asumimos responsabilidad por el contenido, políticas de privacidad o prácticas de sitios externos. Te recomendamos revisar los términos de cada sitio que visites.
                    </p>
                  </Section>

                  {/* Section 10 */}
                  <Section number="10" title="Limitación de Responsabilidad" icon={AlertTriangle}>
                    <p>
                      <strong>El Sitio y sus Servicios se proporcionan "tal cual" y "según disponibilidad".</strong> En la máxima medida permitida por la ley:
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>No garantizamos la exactitud, integridad o actualidad de la información</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>No garantizamos la disponibilidad ininterrumpida del Sitio</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>No somos responsables por decisiones tomadas basándose en el contenido del Sitio</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>No somos responsables por la calidad de servicios de terceros mencionados</span>
                      </li>
                    </ul>
                    
                    <p className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <strong>Importante:</strong> Siempre verifica la información directamente con los establecimientos, especialmente horarios, precios y disponibilidad, antes de tu visita.
                    </p>
                  </Section>

                  {/* Section 11 */}
                  <Section number="11" title="Modificaciones" icon={FileText}>
                    <p>
                      Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-2">
                      <li>Inmediatamente después de su publicación en el Sitio</li>
                      <li>Para cambios significativos, publicaremos un aviso destacado</li>
                      <li>La fecha de "última actualización" al inicio reflejará la versión vigente</li>
                    </ul>
                    
                    <p>
                      Te recomendamos revisar esta página periódicamente. El uso continuado del Sitio después de modificaciones constituye tu aceptación de los nuevos términos.
                    </p>
                  </Section>

                  {/* Section 12 */}
                  <Section number="12" title="Ley Aplicable y Jurisdicción" icon={Gavel}>
                    <p>
                      Estos Términos y Condiciones se rigen por las leyes de la <strong>República de Colombia</strong>, incluyendo:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Ley 1581 de 2012 (Protección de Datos Personales)</li>
                      <li>Ley 23 de 1982 (Derechos de Autor)</li>
                      <li>Ley 1480 de 2011 (Estatuto del Consumidor)</li>
                      <li>Decisión Andina 351 (Régimen Común sobre Derecho de Autor)</li>
                    </ul>
                    
                    <p>
                      Para cualquier controversia derivada del uso del Sitio, las partes se someten a la jurisdicción de los jueces y tribunales de la ciudad de <strong>Barranquilla, Atlántico, Colombia</strong>.
                    </p>
                  </Section>

                  {/* Section 13 */}
                  <Section number="13" title="Contacto" icon={Mail}>
                    <p>
                      Si tienes preguntas, comentarios o inquietudes sobre estos Términos y Condiciones, puedes contactarnos a través de:
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-6">
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="font-semibold text-slate-800 mb-1">Gobernación del Atlántico</p>
                          <p className="text-slate-600">Secretaría de Turismo</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-slate-700 mb-1">Dirección</p>
                            <p className="text-slate-600">Calle 40 No. 45-46<br />Barranquilla, Atlántico, Colombia</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 mb-1">Correo electrónico</p>
                            <a 
                              href="mailto:atencionalciudadano@atlantico.gov.co" 
                              className="hover:underline"
                              style={{ color: COLORS.azulBarranquero }}
                            >
                              atencionalciudadano@atlantico.gov.co
                            </a>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 mb-1">Sitio web institucional</p>
                          <a 
                            href="https://www.atlantico.gov.co" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: COLORS.azulBarranquero }}
                          >
                            www.atlantico.gov.co
                          </a>
                        </div>
                      </div>
                    </div>
                  </Section>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            RELATED LINKS
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/ayuda/privacidad"
              className="flex-1 flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Documento relacionado
                </p>
                <p className="font-semibold text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Política de Privacidad
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/faq"
              className="flex-1 flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  ¿Tienes dudas?
                </p>
                <p className="font-semibold text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Preguntas Frecuentes
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}