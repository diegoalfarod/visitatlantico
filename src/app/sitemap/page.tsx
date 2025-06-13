"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  ExternalLink
} from "lucide-react";

export default function SitemapPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  
  const sitemap = [
    {
      title: "Inicio",
      icon: <Home className="w-5 h-5" />,
      links: [
        { label: "Página Principal", href: "/" },
        { label: "Sobre Atlántico", href: "/#about" }
      ]
    },
    {
      title: "Planifica tu Viaje",
      icon: <Calendar className="w-5 h-5" />,
      links: [
        { label: "Planificador con IA", href: "/planner" },
        { label: "Crear Itinerario Personalizado", href: "/planner" },
        { label: "Guías de Viaje", href: "/#guides" }
      ]
    },
    {
      title: "Destinos Turísticos",
      icon: <MapPin className="w-5 h-5" />,
      links: [
        { label: "Todos los Destinos", href: "/destinations" },
        { label: "Playas", href: "/destinations?category=Playas" },
        { label: "Sitios Culturales", href: "/destinations?category=Cultura" },
        { label: "Naturaleza y Ecoturismo", href: "/destinations?category=Eco" },
        { label: "Aventura", href: "/destinations?category=Aventura" },
        { label: "Sitios Históricos", href: "/destinations?category=Historia" }
      ]
    },
    {
      title: "Experiencias",
      icon: <Compass className="w-5 h-5" />,
      links: [
        { label: "Todas las Experiencias", href: "/destinations" },
        { label: "Deportes Acuáticos", href: "/destinations?category=Acuáticos" },
        { label: "Tours Gastronómicos", href: "/destinations?category=Gastronomía" },
        { label: "Festivales y Eventos", href: "/destinations?category=Festivales" },
        { label: "Vida Nocturna", href: "/destinations?category=Nocturna" },
        { label: "Bienestar y Spa", href: "/destinations?category=Bienestar" }
      ]
    },
    {
      title: "Gastronomía",
      icon: <Utensils className="w-5 h-5" />,
      links: [
        { label: "Platos Típicos", href: "/gastronomy#platos-tipicos" },
        { label: "Festivales Gastronómicos", href: "/gastronomy#festivales" },
        { label: "Restaurantes Recomendados", href: "/gastronomy#restaurantes" },
        { label: "Ruta Gastronómica", href: "/gastronomy#rutas" }
      ]
    },
    {
      title: "Información y Ayuda",
      icon: <Info className="w-5 h-5" />,
      links: [
        { label: "Preguntas Frecuentes", href: "/ayuda/faq" },
        { label: "Contacto", href: "/contacto" },
        { label: "Atención al Ciudadano", href: "https://www.atlantico.gov.co/index.php/ayuda", external: true },
        { label: "Guías de Turismo Responsable", href: "/#responsible-travel" }
      ]
    },
    {
      title: "Legal",
      icon: <Shield className="w-5 h-5" />,
      links: [
        { label: "Términos y Condiciones", href: "/ayuda/terminos" },
        { label: "Política de Privacidad", href: "/ayuda/privacidad" },
        { label: "Accesibilidad", href: "/accesibilidad" }
      ]
    },
    {
      title: "Idiomas",
      icon: <Globe className="w-5 h-5" />,
      links: [
        { label: "Español", href: "https://visitatlantico.com" },
        { label: "English", href: "https://en.visitatlantico.com" }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Map className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h1 className="text-4xl font-bold mb-4">Mapa del Sitio</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Encuentra fácilmente toda la información que necesitas para planificar tu viaje al Atlántico
            </p>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Mapa del Sitio</span>
        </nav>
      </div>

      {/* Sitemap Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitemap.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span className="group-hover:underline">{link.label}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span className="group-hover:underline">{link.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-blue-50 rounded-xl p-8 text-center"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            ¿No encuentras lo que buscas?
          </h3>
          <p className="text-slate-600 mb-6">
            Nuestro equipo está aquí para ayudarte a planificar la mejor experiencia en el Atlántico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Contáctanos
            </Link>
            <Link
              href="/ayuda/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
            >
              <FileText className="w-5 h-5" />
              Ver Preguntas Frecuentes
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}