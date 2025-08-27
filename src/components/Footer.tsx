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
  Shield
} from "lucide-react";
import { 
  RiGovernmentLine,
  RiInstagramLine,
  RiFacebookLine,
  RiTwitterXLine
} from "react-icons/ri";

export default function Footer() {
  const footerLinks = {
    institucional: [
      { label: "Políticas de Privacidad", href: "/ayuda/privacidad" },
      { label: "Términos y Condiciones", href: "/ayuda/terminos" },
      { label: "Mapa del Sitio", href: "/sitemap" },
    ],
    servicios: [
      { label: "Atención al Ciudadano", href: "https://www.atlantico.gov.co/index.php/ayuda" },
      { label: "Preguntas Frecuentes", href: "/ayuda/faq" },
      { label: "Contáctenos", href: "/contacto" },
    ],
  };

  const socialMedia = [
    {
      icon: <RiInstagramLine size={20} />,
      label: "Instagram",
      href: "https://instagram.com/turismoatlantico_",
    },
    {
      icon: <RiFacebookLine size={20} />,
      label: "Facebook",
      href: "#",
    },
    {
      icon: <RiTwitterXLine size={20} />,
      label: "X",
      href: "#",
    },
  ];

  return (
    <footer className="relative w-full bg-white border-t border-gray-200">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px)`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand & Contact Section */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-xl">
                      <RiGovernmentLine className="text-white text-3xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Shield size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Visit Atlántico
                    </h2>
                    <p className="text-sm text-gray-500">
                      Portal Oficial de Turismo
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                  Descubre la riqueza cultural, gastronómica y natural del corazón 
                  del Caribe colombiano. Tu puerta de entrada al Atlántico.
                </p>

                {/* Contact Info - Redesigned */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px bg-red-600 w-8"></div>
                    Contacto Institucional
                  </h3>
                  
                  <div className="grid gap-3">
                    <a
                      href="mailto:atencionalciudadano@atlantico.gov.co"
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                        <Mail size={18} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <p className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                          atencionalciudadano@atlantico.gov.co
                        </p>
                      </div>
                    </a>
                    
                    <a
                      href="tel:+576053307000"
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                        <Phone size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Teléfono</p>
                        <p className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                          +57 (605) 330-7000
                        </p>
                      </div>
                    </a>
                    
                    <div className="flex items-start gap-3 p-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Dirección</p>
                        <p className="text-sm text-gray-700">
                          CL 40 45 46<br />
                          Barranquilla, Atlántico
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Links Section */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 gap-8"
              >
                {/* Institucional Links */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="h-px bg-gray-300 w-4"></div>
                    Institucional
                  </h3>
                  <ul className="space-y-2">
                    {footerLinks.institucional.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group text-sm text-gray-600 hover:text-red-600 flex items-center gap-2 py-1 transition-all duration-200"
                        >
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Servicios Links */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="h-px bg-gray-300 w-4"></div>
                    Servicios
                  </h3>
                  <ul className="space-y-2">
                    {footerLinks.servicios.map((link) => (
                      <li key={link.href}>
                        {link.href.startsWith('http') ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group text-sm text-gray-600 hover:text-red-600 flex items-center gap-2 py-1 transition-all duration-200"
                          >
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                            <span>{link.label}</span>
                            <ArrowUpRight size={12} className="opacity-50" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="group text-sm text-gray-600 hover:text-red-600 flex items-center gap-2 py-1 transition-all duration-200"
                          >
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                            <span>{link.label}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Social & Gov Section */}
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Social Media */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="h-px bg-gray-300 w-4"></div>
                    Síguenos
                  </h3>
                  <div className="flex gap-2">
                    {socialMedia.map((social) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200 hover:border-red-200"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Government Link */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Portal Gubernamental</p>
                  <a
                    href="https://www.atlantico.gov.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300 group-hover:from-red-50 group-hover:to-red-100 group-hover:border-red-300 transition-all duration-200">
                      <Globe size={20} className="text-gray-700 group-hover:text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        Gobernación del Atlántico
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Portal oficial
                        <ArrowUpRight size={10} />
                      </p>
                    </div>
                  </a>
                </div>

                {/* Gov Badge */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Shield size={16} className="text-green-600" />
                    <span className="text-xs font-medium text-gray-700">Sitio Verificado GOV.CO</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600 text-center sm:text-left">
                © {new Date().getFullYear()} VisitAtlántico - Gobernación del Atlántico. 
                Todos los derechos reservados.
              </p>
              
              <div className="flex items-center gap-6 text-xs">
                <Link 
                  href="/ayuda/privacidad" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Privacidad
                </Link>
                <Link 
                  href="/ayuda/terminos" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Términos
                </Link>
                <Link 
                  href="/accesibilidad" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
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