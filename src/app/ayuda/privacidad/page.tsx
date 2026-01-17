"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Database,
  Eye,
  Cookie,
  Users,
  Lock,
  Clock,
  Globe,
  Mail,
  MessageCircle,
  Sparkles,
  Map,
  FileText,
  ChevronRight,
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
          style={{ backgroundColor: `${COLORS.azulBarranquero}10` }}
        >
          <Icon className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
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
  { number: "1", title: "Información que Recopilamos", id: "section-1" },
  { number: "2", title: "Uso de la Información", id: "section-2" },
  { number: "3", title: "Jimmy y el Planificador IA", id: "section-3" },
  { number: "4", title: "Cookies y Tecnologías", id: "section-4" },
  { number: "5", title: "Compartir con Terceros", id: "section-5" },
  { number: "6", title: "Tus Derechos", id: "section-6" },
  { number: "7", title: "Seguridad de Datos", id: "section-7" },
  { number: "8", title: "Retención de Datos", id: "section-8" },
  { number: "9", title: "Menores de Edad", id: "section-9" },
  { number: "10", title: "Cambios y Contacto", id: "section-10" },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function PrivacidadPage() {
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
              style={{ background: COLORS.azulBarranquero }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
              style={{ background: COLORS.verdeBijao }}
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
                <Shield size={16} style={{ color: COLORS.verdeBijao }} />
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
                Política de Privacidad
              </motion.h1>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-white/50 max-w-xl leading-relaxed mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Tu privacidad es importante para nosotros. Este documento explica cómo recopilamos, usamos y protegemos tu información personal.
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
                  <nav className="space-y-1">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <span 
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                        >
                          {item.number}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Quick Contact */}
                <div className="mt-6 bg-slate-50 rounded-2xl p-6">
                  <p 
                    className="text-sm text-slate-600 mb-4"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    ¿Tienes preguntas sobre privacidad?
                  </p>
                  <a
                    href="mailto:atencionalciudadano@atlantico.gov.co"
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: COLORS.azulBarranquero, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <Mail size={16} />
                    Contáctanos
                  </a>
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
                    La <strong>Gobernación del Atlántico</strong>, a través de su portal turístico <strong>VisitAtlántico</strong>, se compromete a proteger la privacidad de los usuarios. Esta Política de Privacidad describe nuestras prácticas de recopilación, uso y protección de datos personales, en cumplimiento con la <strong>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales de Colombia) y sus decretos reglamentarios.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Al utilizar VisitAtlántico, aceptas las prácticas descritas en esta política. Te recomendamos leerla detenidamente.
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-12">
                  
                  {/* Section 1 */}
                  <Section number="1" title="Información que Recopilamos" icon={Database}>
                    <p>Recopilamos diferentes tipos de información dependiendo de cómo interactúas con nuestro sitio:</p>
                    
                    <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Información que proporcionas voluntariamente</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                          <li>Correo electrónico (cuando usas el Planificador de Viajes o te suscribes al boletín)</li>
                          <li>Preferencias de viaje seleccionadas en el Planificador (días, intereses, municipios)</li>
                          <li>Mensajes y consultas enviadas a través de Jimmy o formularios de contacto</li>
                          <li>Comentarios o feedback sobre destinos y experiencias</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Información recopilada automáticamente</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                          <li>Datos de navegación (páginas visitadas, tiempo de permanencia, rutas de navegación)</li>
                          <li>Información del dispositivo (tipo de navegador, sistema operativo, resolución de pantalla)</li>
                          <li>Dirección IP y ubicación aproximada</li>
                          <li>Datos de referencia (cómo llegaste al sitio)</li>
                        </ul>
                      </div>
                    </div>
                  </Section>

                  {/* Section 2 */}
                  <Section number="2" title="Cómo Utilizamos tu Información" icon={Eye}>
                    <p>Utilizamos la información recopilada para los siguientes fines:</p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Personalizar tu experiencia:</strong>
                          <span className="text-slate-600"> Generar itinerarios adaptados a tus preferencias, mostrar destinos relevantes y recordar tu idioma preferido.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Mejorar el servicio:</strong>
                          <span className="text-slate-600"> Analizar patrones de uso para optimizar el sitio, corregir errores y desarrollar nuevas funcionalidades.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Comunicaciones:</strong>
                          <span className="text-slate-600"> Enviarte tu itinerario por email (si lo solicitas), boletines informativos (con tu consentimiento) y responder a tus consultas.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Estadísticas agregadas:</strong>
                          <span className="text-slate-600"> Generar informes sobre tendencias turísticas que ayuden a mejorar la oferta del departamento.</span>
                        </div>
                      </li>
                    </ul>
                  </Section>

                  {/* Section 3 - Specific to Jimmy and Planner */}
                  <Section number="3" title="Jimmy (Asistente IA) y Planificador de Viajes" icon={Sparkles}>
                    <p>
                      VisitAtlántico incluye funcionalidades de inteligencia artificial que merecen mención especial:
                    </p>
                    
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageCircle className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                        <h4 className="font-semibold text-slate-800">Jimmy, tu Guía Virtual</h4>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        <li>Las conversaciones con Jimmy se procesan para generar respuestas relevantes</li>
                        <li>No almacenamos el historial de conversaciones de forma permanente asociado a tu identidad</li>
                        <li>Jimmy utiliza tecnología de Anthropic (Claude) para procesar consultas</li>
                        <li>No compartas información personal sensible en las conversaciones</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <Map className="w-5 h-5" style={{ color: COLORS.naranjaSalinas }} />
                        <h4 className="font-semibold text-slate-800">Planificador de Viajes con IA</h4>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
                        <li>Tus preferencias de viaje se usan únicamente para generar el itinerario</li>
                        <li>El email es opcional y solo se usa para enviarte el itinerario si lo solicitas</li>
                        <li>Los itinerarios generados pueden compartirse mediante enlaces únicos</li>
                        <li>Puedes descargar tu itinerario como PDF sin proporcionar ningún dato personal</li>
                      </ul>
                    </div>
                  </Section>

                  {/* Section 4 */}
                  <Section number="4" title="Cookies y Tecnologías Similares" icon={Cookie}>
                    <p>Utilizamos cookies y tecnologías similares para mejorar tu experiencia:</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left p-3 font-semibold text-slate-800 rounded-tl-lg">Tipo</th>
                            <th className="text-left p-3 font-semibold text-slate-800">Propósito</th>
                            <th className="text-left p-3 font-semibold text-slate-800 rounded-tr-lg">Duración</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-3 text-slate-800 font-medium">Esenciales</td>
                            <td className="p-3 text-slate-600">Funcionamiento básico del sitio, preferencias de idioma</td>
                            <td className="p-3 text-slate-600">Sesión / 1 año</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-slate-800 font-medium">Analíticas</td>
                            <td className="p-3 text-slate-600">Estadísticas de uso anónimas (Google Analytics)</td>
                            <td className="p-3 text-slate-600">2 años</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-slate-800 font-medium">Funcionales</td>
                            <td className="p-3 text-slate-600">Recordar preferencias del Planificador</td>
                            <td className="p-3 text-slate-600">30 días</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-sm">
                      Puedes gestionar las cookies desde la configuración de tu navegador. Desactivar ciertas cookies puede afectar la funcionalidad del sitio.
                    </p>
                  </Section>

                  {/* Section 5 */}
                  <Section number="5" title="Compartir Información con Terceros" icon={Users}>
                    <p><strong>No vendemos ni alquilamos tu información personal.</strong> Podemos compartir datos en las siguientes circunstancias:</p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Proveedores de servicios:</strong>
                          <span className="text-slate-600"> Firebase (almacenamiento de datos), Anthropic (procesamiento de IA), servicios de email, analytics.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Requerimientos legales:</strong>
                          <span className="text-slate-600"> Cuando sea necesario por ley, orden judicial o para proteger derechos, seguridad o propiedad.</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Datos agregados:</strong>
                          <span className="text-slate-600"> Estadísticas anónimas sobre tendencias turísticas pueden compartirse con entidades gubernamentales del Atlántico.</span>
                        </div>
                      </li>
                    </ul>
                  </Section>

                  {/* Section 6 */}
                  <Section number="6" title="Tus Derechos (Ley 1581 de 2012)" icon={FileText}>
                    <p>De acuerdo con la legislación colombiana, tienes los siguientes derechos:</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { title: "Acceso", desc: "Conocer qué datos tenemos sobre ti" },
                        { title: "Rectificación", desc: "Corregir datos inexactos o incompletos" },
                        { title: "Supresión", desc: "Solicitar eliminación de tus datos" },
                        { title: "Revocación", desc: "Retirar tu consentimiento en cualquier momento" },
                        { title: "Consulta", desc: "Solicitar información sobre el uso de tus datos" },
                        { title: "Reclamo", desc: "Presentar quejas ante la SIC si consideras vulnerados tus derechos" },
                      ].map((right) => (
                        <div key={right.title} className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-1">{right.title}</h4>
                          <p className="text-sm text-slate-600">{right.desc}</p>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-sm">
                      Para ejercer estos derechos, contacta a: <a href="mailto:atencionalciudadano@atlantico.gov.co" className="font-medium" style={{ color: COLORS.azulBarranquero }}>atencionalciudadano@atlantico.gov.co</a>
                    </p>
                  </Section>

                  {/* Section 7 */}
                  <Section number="7" title="Seguridad de los Datos" icon={Lock}>
                    <p>Implementamos medidas técnicas y organizativas para proteger tu información:</p>
                    
                    <ul className="list-disc list-inside space-y-2">
                      <li>Cifrado SSL/TLS en todas las comunicaciones</li>
                      <li>Almacenamiento seguro en servidores de Firebase (Google Cloud)</li>
                      <li>Acceso restringido a datos personales solo a personal autorizado</li>
                      <li>Monitoreo regular de seguridad y actualizaciones</li>
                      <li>Copias de seguridad periódicas</li>
                    </ul>
                    
                    <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <strong>Nota:</strong> Ningún sistema es 100% seguro. Si detectas alguna vulnerabilidad o tienes preocupaciones de seguridad, contáctanos inmediatamente.
                    </p>
                  </Section>

                  {/* Section 8 */}
                  <Section number="8" title="Retención de Datos" icon={Clock}>
                    <p>Conservamos tu información solo durante el tiempo necesario:</p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-slate-800">Datos de navegación:</strong> 26 meses máximo (alineado con Google Analytics)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-slate-800">Emails de boletín:</strong> Hasta que te des de baja</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-slate-800">Itinerarios compartidos:</strong> 90 días desde su creación</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span><strong className="text-slate-800">Conversaciones con Jimmy:</strong> No se almacenan de forma permanente</span>
                      </li>
                    </ul>
                  </Section>

                  {/* Section 9 */}
                  <Section number="9" title="Menores de Edad" icon={Users}>
                    <p>
                      VisitAtlántico es un sitio de información turística apto para todas las edades. No recopilamos intencionalmente información personal de menores de 14 años sin el consentimiento de sus padres o tutores legales.
                    </p>
                    <p>
                      Si eres padre o tutor y crees que tu hijo ha proporcionado información personal, contáctanos para eliminarla.
                    </p>
                  </Section>

                  {/* Section 10 */}
                  <Section number="10" title="Cambios a esta Política y Contacto" icon={Globe}>
                    <p>
                      Podemos actualizar esta Política de Privacidad periódicamente. Los cambios significativos serán notificados mediante un aviso destacado en el sitio. Te recomendamos revisar esta página regularmente.
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-6 mt-6">
                      <h4 className="font-semibold text-slate-800 mb-4">Información de Contacto</h4>
                      <div className="space-y-3 text-sm">
                        <p>
                          <strong className="text-slate-700">Responsable:</strong><br />
                          Gobernación del Atlántico - Secretaría de Turismo
                        </p>
                        <p>
                          <strong className="text-slate-700">Dirección:</strong><br />
                          Calle 40 No. 45-46, Barranquilla, Atlántico, Colombia
                        </p>
                        <p>
                          <strong className="text-slate-700">Email:</strong><br />
                          <a href="mailto:atencionalciudadano@atlantico.gov.co" style={{ color: COLORS.azulBarranquero }}>
                            atencionalciudadano@atlantico.gov.co
                          </a>
                        </p>
                        <p>
                          <strong className="text-slate-700">Sitio web oficial:</strong><br />
                          <a href="https://www.atlantico.gov.co" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.azulBarranquero }}>
                            www.atlantico.gov.co
                          </a>
                        </p>
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
              href="/ayuda/terminos"
              className="flex-1 flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Documento relacionado
                </p>
                <p className="font-semibold text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Términos y Condiciones
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