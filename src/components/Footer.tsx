"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { GiPalmTree } from "react-icons/gi";

// =============================================================================
// PALETA - Marca Atlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#4A4F55",
  grisMedio: "#7A858C",
  grisClaro: "#C1C5C8",
};

const footerLinks = {
  explora: [
    { label: "Destinos", href: "/destinations" },
    { label: "Eventos", href: "/eventos" },
    { label: "Ruta 23", href: "/ruta23" },
    { label: "Turismo Seguro", href: "/turismo-seguro" },
  ],
  institucional: [
    { label: "Políticas de Privacidad", href: "/ayuda/privacidad" },
    { label: "Términos y Condiciones", href: "/ayuda/terminos" },
    { label: "Mapa del Sitio", href: "/sitemap" },
  ],
  ayuda: [
    { label: "Atención al Ciudadano", href: "https://www.atlantico.gov.co/index.php/ayuda", external: true },
    { label: "Preguntas Frecuentes", href: "/ayuda/faq" },
    { label: "Contáctenos", href: "/contacto" },
  ],
};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  return (
    <footer 
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0a0f1a' }}
    >
      {/* Background pattern - subtle stars */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.1) 0%, transparent 100%)
          `,
          backgroundSize: '100% 100%',
        }}
      />

      {/* Top gradient line */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${COLORS.azulBarranquero}50, ${COLORS.amarilloArepa}50, transparent)`,
        }}
      />

      {/* Main Content */}
      <div className="relative px-6 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-20">
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand Section */}
            <motion.div 
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/logogobernaciondelatlantico.png"
                  alt="Gobernación del Atlántico"
                  width={220}
                  height={80}
                  className="object-contain"
                  style={{ height: '70px', width: 'auto' }}
                />
              </div>

              {/* Tagline */}
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-8 h-[2px] rounded-full"
                  style={{ backgroundColor: COLORS.amarilloArepa }}
                />
                <span 
                  className="text-xs font-semibold tracking-[0.2em] uppercase"
                  style={{ 
                    fontFamily: "'Josefin Sans', sans-serif",
                    color: COLORS.amarilloArepa,
                  }}
                >
                  Portal de Turismo
                </span>
              </div>
              
              <p 
                className="text-sm leading-relaxed mb-8 max-w-sm"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Descubre la riqueza cultural, gastronómica y natural del corazón 
                del Caribe colombiano.
              </p>

              {/* Location Card */}
              <div 
                className="rounded-2xl p-5 border"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.azulBarranquero}20` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                  </div>
                  <h3 
                    className="font-semibold text-white text-sm"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Sede Principal
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-4" />
                    <div>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        Calle 40 # 45-46
                      </p>
                      <p 
                        className="text-xs"
                        style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        Barranquilla, Atlántico
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <p 
                      className="text-sm"
                      style={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      Lun - Vie: 8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Links Sections */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                {/* Explora */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="w-6 h-px"
                      style={{ backgroundColor: COLORS.amarilloArepa }}
                    />
                    <h3 
                      className="text-xs tracking-[0.2em] uppercase"
                      style={{ 
                        fontFamily: "'Josefin Sans', sans-serif",
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Explora
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {footerLinks.explora.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-sm transition-colors"
                          style={{ 
                            fontFamily: "'Montserrat', sans-serif",
                            color: 'rgba(255,255,255,0.6)',
                          }}
                        >
                          <span className="group-hover:translate-x-1 group-hover:text-white transition-all">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="w-6 h-px"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                    <h3 
                      className="text-xs tracking-[0.2em] uppercase"
                      style={{ 
                        fontFamily: "'Josefin Sans', sans-serif",
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Legal
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {footerLinks.institucional.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-sm transition-colors"
                          style={{ 
                            fontFamily: "'Montserrat', sans-serif",
                            color: 'rgba(255,255,255,0.6)',
                          }}
                        >
                          <span className="group-hover:translate-x-1 group-hover:text-white transition-all">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ayuda */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="w-6 h-px"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                    <h3 
                      className="text-xs tracking-[0.2em] uppercase"
                      style={{ 
                        fontFamily: "'Josefin Sans', sans-serif",
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Ayuda
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {footerLinks.ayuda.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm transition-colors"
                            style={{ 
                              fontFamily: "'Montserrat', sans-serif",
                              color: 'rgba(255,255,255,0.6)',
                            }}
                          >
                            <span className="group-hover:translate-x-1 group-hover:text-white transition-all">
                              {link.label}
                            </span>
                            <ArrowUpRight className="w-3 h-3 opacity-50" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="group flex items-center gap-2 text-sm transition-colors"
                            style={{ 
                              fontFamily: "'Montserrat', sans-serif",
                              color: 'rgba(255,255,255,0.6)',
                            }}
                          >
                            <span className="group-hover:translate-x-1 group-hover:text-white transition-all">
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

            {/* Contact Section */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div 
                  className="w-6 h-px"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <h3 
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ 
                    fontFamily: "'Josefin Sans', sans-serif",
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Contacto
                </h3>
              </div>

              {/* Contact Cards */}
              <div className="space-y-3 mb-8">
                <a
                  href="mailto:atencionalciudadano@atlantico.gov.co"
                  className="group block rounded-xl p-4 transition-all border"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.rojoCayena}20` }}
                    >
                      <Mail className="w-5 h-5" style={{ color: COLORS.rojoCayena }} />
                    </div>
                    <div className="min-w-0">
                      <p 
                        className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ 
                          fontFamily: "'Josefin Sans', sans-serif",
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        Email
                      </p>
                      <p 
                        className="text-sm truncate group-hover:text-white transition-colors"
                        style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          color: 'rgba(255,255,255,0.8)',
                        }}
                      >
                        atencionalciudadano@atlantico.gov.co
                      </p>
                    </div>
                  </div>
                </a>
                
                <a
                  href="tel:+576053307000"
                  className="group block rounded-xl p-4 transition-all border"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <Phone className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                    </div>
                    <div className="min-w-0">
                      <p 
                        className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ 
                          fontFamily: "'Josefin Sans', sans-serif",
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        Teléfono
                      </p>
                      <p 
                        className="text-sm group-hover:text-white transition-colors"
                        style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          color: 'rgba(255,255,255,0.8)',
                        }}
                      >
                        +57 (605) 330-7000
                      </p>
                    </div>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <a
                  href="https://instagram.com/turismoatlantico_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors group"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/>
                    <circle cx="18.406" cy="5.594" r="1.44"/>
                  </svg>
                  <span 
                    className="text-sm group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    @turismoatlantico_
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
                
                <a
                  href="https://www.atlantico.gov.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors group"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  <GiPalmTree className="w-5 h-5" />
                  <span 
                    className="text-sm group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    atlantico.gov.co
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="relative border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logogobernaciondelatlantico.png"
                alt="Gobernación del Atlántico"
                width={120}
                height={40}
                className="object-contain"
                style={{ height: '32px', width: 'auto' }}
              />
              <div 
                className="h-4 w-px"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              />
              <p 
                className="text-xs"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                © {new Date().getFullYear()} Visit Atlántico
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-xs">
              <Link 
                href="/ayuda/privacidad" 
                className="transition-colors"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Privacidad
              </Link>
              <Link 
                href="/ayuda/terminos" 
                className="transition-colors"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Términos
              </Link>
              <Link 
                href="/accesibilidad" 
                className="transition-colors"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Accesibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}