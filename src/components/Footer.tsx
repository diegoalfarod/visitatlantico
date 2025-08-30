"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Clock,
  Building2,
  Users,
  FileText
} from "lucide-react";
import { 
  RiGovernmentLine,
  RiInstagramLine,
} from "react-icons/ri";

export default function Footer() {
  const footerLinks = {
    institucional: [
      { label: "Políticas de Privacidad", href: "/ayuda/privacidad", icon: <FileText size={14} /> },
      { label: "Términos y Condiciones", href: "/ayuda/terminos", icon: <FileText size={14} /> },
      { label: "Mapa del Sitio", href: "/sitemap", icon: <Globe size={14} /> },
    ],
    servicios: [
      { label: "Atención al Ciudadano", href: "https://www.atlantico.gov.co/index.php/ayuda", icon: <Users size={14} /> },
      { label: "Preguntas Frecuentes", href: "/ayuda/faq", icon: <FileText size={14} /> },
      { label: "Contáctenos", href: "/contacto", icon: <Mail size={14} /> },
    ],
  };

  return (
    <footer className="relative w-full bg-gradient-to-b from-gray-50 to-white">
      {/* Decorative element */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-30" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Brand & Institution Section */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Logo and Brand */}
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <Image
                      src="/logo-black.png"
                      alt="Gobernación del Atlántico"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                    <div className="h-16 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                        Visit Atlántico
                      </h2>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        Portal Oficial de Turismo
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                    Descubre la riqueza cultural, gastronómica y natural del corazón 
                    del Caribe colombiano. Un territorio de oportunidades y experiencias únicas.
                  </p>
                </div>

                {/* Institution Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Building2 size={20} className="text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Sede Principal</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          Calle 40 # 45-46
                        </p>
                        <p className="text-xs text-gray-500">
                          Barranquilla, Atlántico, Colombia
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        Lun - Vie: 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Links Section */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Institucional Links */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <RiGovernmentLine className="text-red-600 text-sm" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Institucional
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {footerLinks.institucional.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="group flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-all duration-200"
                          >
                            <span className="text-gray-400 group-hover:text-red-600 transition-colors">
                              {link.icon}
                            </span>
                            <span className="group-hover:translate-x-0.5 transition-transform">
                              {link.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Servicios Links */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="text-green-600 text-sm" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Servicios
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {footerLinks.servicios.map((link) => (
                        <li key={link.href}>
                          {link.href.startsWith('http') ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-all duration-200"
                            >
                              <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                {link.icon}
                              </span>
                              <span className="group-hover:translate-x-0.5 transition-transform">
                                {link.label}
                              </span>
                              <ArrowUpRight size={10} className="opacity-50 ml-1" />
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-all duration-200"
                            >
                              <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                {link.icon}
                              </span>
                              <span className="group-hover:translate-x-0.5 transition-transform">
                                {link.label}
                              </span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact & Social Section */}
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Contact Cards */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-4">
                    Canales de Atención
                  </h3>
                  
                  <a
                    href="mailto:atencionalciudadano@atlantico.gov.co"
                    className="block group"
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center group-hover:from-red-100 group-hover:to-red-200 transition-colors flex-shrink-0">
                          <Mail size={18} className="text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Correo Institucional</p>
                          <p className="text-sm text-gray-700 group-hover:text-red-600 transition-colors break-all">
                            atencionalciudadano@<br/>atlantico.gov.co
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  <a
                    href="tel:+576053307000"
                    className="block group"
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-colors flex-shrink-0">
                          <Phone size={18} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Línea de Atención</p>
                          <p className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                            +57 (605) 330-7000
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-4">
                    Síguenos
                  </h3>
                  <motion.a
                    href="https://instagram.com/turismoatlantico_"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-900 hover:border-gray-700 font-medium"
                  >
                    <RiInstagramLine size={20} />
                    <span className="text-sm">@turismoatlantico_</span>
                  </motion.a>
                </div>

                {/* Government Portal */}
                <div className="pt-6 border-t border-gray-200">
                  <a
                    href="https://www.atlantico.gov.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300 group-hover:from-red-50 group-hover:to-red-100 group-hover:border-red-300 transition-all duration-200 shadow-sm">
                      <Globe size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        Gobernación del Atlántico
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Portal oficial gubernamental
                        <ArrowUpRight size={10} />
                      </p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-black.png"
                  alt="Gobernación del Atlántico"
                  width={30}
                  height={30}
                  className="object-contain opacity-60 invert"
                />
                <p className="text-xs text-gray-400">
                  © {new Date().getFullYear()} VisitAtlántico - Gobernación del Atlántico. 
                  Todos los derechos reservados.
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-xs">
                <Link 
                  href="/ayuda/privacidad" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacidad
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  href="/ayuda/terminos" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Términos
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  href="/accesibilidad" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accesibilidad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}