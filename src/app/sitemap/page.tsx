"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  Compass,
  Utensils,
  Calendar,
  Info,
  Globe,
  Home,
  ChevronRight,
  Map,
  Phone,
  FileText,
  Shield,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Route,
  Camera,
  Music,
  Users,
  Building2,
  HelpCircle,
  Mail,
  ArrowLeft,
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
// SITEMAP DATA
// =============================================================================
const sitemap = [
  {
    title: "Inicio",
    icon: Home,
    color: COLORS.azulBarranquero,
    description: "Página principal",
    links: [
      { label: "Página Principal", href: "/" },
      { label: "Video Showcase", href: "/#video" },
      { label: "Próximos Eventos", href: "/#eventos" },
      { label: "Experiencias Destacadas", href: "/#experiencias" },
      { label: "Recursos para Viajeros", href: "/#recursos" },
    ],
  },
  {
    title: "Planifica tu Viaje",
    icon: Sparkles,
    color: COLORS.naranjaSalinas,
    description: "Herramientas de planificación",
    links: [
      { label: "Planificador con IA", href: "/", action: "planner" },
      { label: "Jimmy - Guía Virtual", href: "/", action: "jimmy" },
      { label: "Guía Turística PDF", href: "/docs/guia-turismo.pdf", download: true },
    ],
  },
  {
    title: "Destinos",
    icon: MapPin,
    color: COLORS.verdeBijao,
    description: "Lugares para visitar",
    links: [
      { label: "Todos los Destinos", href: "/destinations" },
      { label: "Playas", href: "/destinations?filter=Playas" },
      { label: "Cultura", href: "/destinations?filter=Cultura" },
      { label: "Naturaleza", href: "/destinations?filter=Naturaleza" },
      { label: "EcoTurismo", href: "/destinations?filter=EcoTurismo" },
      { label: "Aventura", href: "/destinations?filter=Aventura" },
      { label: "Historia", href: "/destinations?filter=Historia" },
      { label: "Gastronomía", href: "/destinations?filter=Gastronomía" },
      { label: "Familia", href: "/destinations?filter=Familia" },
    ],
  },
  {
    title: "Experiencias",
    icon: Compass,
    color: COLORS.amarilloArepa,
    description: "Actividades y tours",
    links: [
      { label: "Todas las Experiencias", href: "/destinations" },
      { label: "Deportes Acuáticos", href: "/destinations?filter=Deportes" },
      { label: "Avistamiento de Aves", href: "/destinations?filter=Avistamiento" },
      { label: "Vida Nocturna", href: "/destinations?filter=Nocturna" },
      { label: "Bienestar", href: "/destinations?filter=Bienestar" },
      { label: "Romántico", href: "/destinations?filter=Romántico" },
      { label: "Fotografía", href: "/destinations?filter=Fotografía" },
    ],
  },
  {
    title: "Eventos",
    icon: Calendar,
    color: COLORS.rojoCayena,
    description: "Agenda cultural",
    links: [
      { label: "Todos los Eventos", href: "/eventos" },
      { label: "Carnaval de Barranquilla", href: "/eventos?filter=Cultural" },
      { label: "Festivales de Música", href: "/eventos?filter=Música" },
      { label: "Eventos Gastronómicos", href: "/eventos?filter=Gastronomía" },
      { label: "Ferias y Fiestas", href: "/eventos?filter=Feria" },
      { label: "Eventos Deportivos", href: "/eventos?filter=Deportes" },
    ],
  },
  {
    title: "Gastronomía",
    icon: Utensils,
    color: COLORS.rojoCayena,
    description: "Ruta 23 - Sabores del Atlántico",
    links: [
      { label: "Ruta 23", href: "/gastronomy" },
      { label: "Platos Típicos", href: "/gastronomy#platos" },
      { label: "Festivales Gastronómicos", href: "/gastronomy#festivales" },
      { label: "Restaurantes", href: "/gastronomy#restaurantes" },
    ],
  },
  {
    title: "Mapa Interactivo",
    icon: Map,
    color: COLORS.azulBarranquero,
    description: "Explora geográficamente",
    links: [
      { label: "Ver Mapa", href: "/mapa" },
      { label: "Destinos en el Mapa", href: "/mapa?view=destinos" },
      { label: "Rutas Sugeridas", href: "/mapa?view=rutas" },
    ],
  },
  {
    title: "Rutas Turísticas",
    icon: Route,
    color: COLORS.verdeBijao,
    description: "Itinerarios prediseñados",
    links: [
      { label: "Todas las Rutas", href: "/rutas" },
      { label: "Ruta de Playas", href: "/rutas/playas" },
      { label: "Ruta Cultural", href: "/rutas/cultural" },
      { label: "Ruta Gastronómica", href: "/rutas/gastronomica" },
      { label: "Ruta de Naturaleza", href: "/rutas/naturaleza" },
    ],
  },
  {
    title: "Ayuda",
    icon: HelpCircle,
    color: COLORS.naranjaSalinas,
    description: "Soporte y preguntas",
    links: [
      { label: "Preguntas Frecuentes", href: "/faq" },
      { label: "Contacto", href: "/contacto" },
      { label: "Mapa del Sitio", href: "/sitemap" },
    ],
  },
  {
    title: "Legal",
    icon: Shield,
    color: COLORS.grisOscuro,
    description: "Documentos legales",
    links: [
      { label: "Términos y Condiciones", href: "/ayuda/terminos" },
      { label: "Política de Privacidad", href: "/ayuda/privacidad" },
    ],
  },
  {
    title: "Institucional",
    icon: Building2,
    color: COLORS.azulBarranquero,
    description: "Gobernación del Atlántico",
    links: [
      { label: "Gobernación del Atlántico", href: "https://www.atlantico.gov.co", external: true },
      { label: "Atención al Ciudadano", href: "https://www.atlantico.gov.co/index.php/ayuda", external: true },
      { label: "Colombia.travel", href: "https://colombia.travel", external: true },
    ],
  },
  {
    title: "Idiomas",
    icon: Globe,
    color: COLORS.verdeBijao,
    description: "Versiones del sitio",
    links: [
      { label: "Español", href: "/" },
      { label: "English", href: "/en" },
    ],
  },
];

// =============================================================================
// SECTION CARD COMPONENT
// =============================================================================
interface SectionCardProps {
  section: typeof sitemap[0];
  index: number;
}

function SectionCard({ section, index }: SectionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = section.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${section.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: section.color }} />
          </div>
          <div>
            <h2
              className="font-bold text-slate-900"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {section.title}
            </h2>
            <p
              className="text-xs text-slate-500"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {section.description}
            </p>
          </div>
        </div>
      </div>

      {/* Links */}
      <ul className="p-4 space-y-1">
        {section.links.map((link) => {
          const isExternal = 'external' in link && link.external;
          const isDownload = 'download' in link && link.download;
          const isAction = 'action' in link && link.action;

          const linkContent = (
            <span
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <ChevronRight
                className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors"
              />
              <span className="flex-1">{link.label}</span>
              {isExternal && <ExternalLink className="w-3 h-3 text-slate-400" />}
            </span>
          );

          if (isExternal) {
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {linkContent}
                </a>
              </li>
            );
          }

          if (isDownload) {
            return (
              <li key={link.href}>
                <a href={link.href} download target="_blank" rel="noopener noreferrer">
                  {linkContent}
                </a>
              </li>
            );
          }

          if (isAction) {
            return (
              <li key={link.label}>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      if (link.action === "jimmy") {
                        window.dispatchEvent(new Event("jimmy:open"));
                      } else if (link.action === "planner") {
                        window.dispatchEvent(new CustomEvent("open-planner"));
                      }
                    }
                  }}
                  className="w-full text-left"
                >
                  {linkContent}
                </button>
              </li>
            );
          }

          return (
            <li key={link.href}>
              <Link href={link.href}>{linkContent}</Link>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function SitemapPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

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
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />
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
                <Map size={16} style={{ color: COLORS.azulBarranquero }} />
                <span
                  className="text-sm font-medium text-white/70"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Navegación
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
                Mapa del Sitio
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-white/50 max-w-xl leading-relaxed"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Encuentra fácilmente todas las secciones y páginas de VisitAtlántico para planificar tu viaje perfecto.
              </motion.p>
            </div>
          </div>
        </div>

        {/* ================================================================
            SITEMAP GRID
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: "Secciones", value: sitemap.length },
              { label: "Páginas", value: sitemap.reduce((acc, s) => acc + s.links.length, 0) },
              { label: "Destinos", value: "100+" },
              { label: "Eventos", value: "50+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-slate-100 p-4 text-center"
              >
                <p
                  className="text-2xl font-bold text-slate-900"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm text-slate-500"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sitemap.map((section, index) => (
              <SectionCard key={section.title} section={section} index={index} />
            ))}
          </div>
        </div>

        {/* ================================================================
            CTA SECTION
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{ backgroundColor: COLORS.grisOscuro }}
          >
            {/* Background glow */}
            <div
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
              style={{ background: COLORS.verdeBijao }}
            />

            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h3
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  ¿No encuentras lo que buscas?
                </h3>
                <p
                  className="text-white/60 max-w-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Usa nuestras herramientas de búsqueda o contacta con nosotros para ayudarte a planificar tu viaje.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <HelpCircle className="w-5 h-5" />
                  Preguntas Frecuentes
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: COLORS.azulBarranquero,
                    color: "white",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Contactar
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}