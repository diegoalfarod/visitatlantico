"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineMap
} from "react-icons/hi2";
import { IoRestaurantOutline } from "react-icons/io5";
import { GiPartyFlags, GiWaveSurfer } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PlannerPage from "@/components/planner/PlannerPage";

// =============================================================================
// PALETA - Marca Atlántico Turismo
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#4A4F55",
};

// =============================================================================
// NAVIGATION LINKS
// =============================================================================
const links = [
  {
    href: "/destinations",
    label: "Destinos",
    icon: HiOutlineMapPin,
    color: COLORS.verdeBijao,
  },
  {
    href: "/carnaval",
    label: "Carnaval",
    icon: GiPartyFlags,
    color: COLORS.amarilloArepa,
  },
  {
    href: "/playas",
    label: "Playas",
    icon: GiWaveSurfer,
    color: COLORS.azulBarranquero,
  },
  {
    href: "/mapa",
    label: "Mapa",
    icon: HiOutlineMap,
    color: COLORS.azulBarranquero,
  },
  {
    href: "/eventos",
    label: "Eventos",
    icon: HiOutlineCalendarDays,
    color: COLORS.rojoCayena,
  },
  {
    href: "/ruta23",
    label: "Ruta 23",
    icon: IoRestaurantOutline,
    color: COLORS.naranjaSalinas,
  },
  {
    href: "/turismo-seguro",
    label: "Turismo Seguro",
    icon: HiOutlineShieldCheck,
    color: COLORS.azulBarranquero,
  },
];

// =============================================================================
// PÁGINAS CON HERO DE FONDO CLARO
// Estas páginas necesitan el navbar blanco desde el inicio
// =============================================================================
const LIGHT_HERO_PAGES = ['/ruta23', '/gastronomy'];

// =============================================================================
// COMPONENT
// =============================================================================
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Detectar scroll y páginas con fondo claro
  useEffect(() => {
    const handleScroll = () => {
      // Si es una página con hero claro, siempre mostrar scrolled (navbar blanco)
      if (LIGHT_HERO_PAGES.includes(pathname)) {
        setScrolled(true);
        return;
      }
      setScrolled(window.scrollY > 50);
    };
    
    // Ejecutar inmediatamente para establecer estado inicial
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", `${height}px`);
      }
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActiveLink = (href: string) => pathname === href;

  return (
    <>
      {/* ============================================================= */}
      {/* NAVBAR HEADER */}
      {/* ============================================================= */}
      <motion.header
        ref={navbarRef}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.8)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset'
            : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3 lg:py-4">
          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-3">
            {/* Logo blanco - navbar transparente */}
            <Image
              src="/logo-atlantico.png"
              alt="Atlántico"
              width={200}
              height={60}
              priority
              className="object-contain transition-all duration-300 absolute"
              style={{ 
                height: "50px", 
                width: "auto",
                filter: 'brightness(0) invert(1)',
                opacity: scrolled ? 0 : 1,
                pointerEvents: scrolled ? 'none' : 'auto',
              }}
            />
            {/* Logo rojo - navbar blanco (scrolled) */}
            <Image
              src="/logo-atlantico-rojo.png"
              alt="Atlántico"
              width={200}
              height={60}
              priority
              className="object-contain transition-all duration-300"
              style={{ 
                height: "40px", 
                width: "auto",
                opacity: scrolled ? 1 : 0,
                pointerEvents: scrolled ? 'auto' : 'none',
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group relative px-4 py-2 rounded-full transition-all duration-300"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: scrolled 
                    ? (isActiveLink(href) ? color : COLORS.grisOscuro)
                    : (isActiveLink(href) ? '#ffffff' : 'rgba(255,255,255,0.85)'),
                  backgroundColor: isActiveLink(href) 
                    ? (scrolled ? `${color}15` : 'rgba(255,255,255,0.15)')
                    : 'transparent',
                }}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="text-lg" />
                  {label}
                </span>
                
                {/* Hover underline */}
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full origin-left"
                  style={{ backgroundColor: scrolled ? color : '#ffffff' }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-6 mx-3" style={{ backgroundColor: scrolled ? '#e5e7eb' : 'rgba(255,255,255,0.2)' }} />

            {/* Language Toggle */}
            <div 
              className="flex items-center gap-1 px-1 py-1 rounded-full"
              style={{ backgroundColor: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }}
            >
              <Link
                href="https://visitatlantico.com"
                className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all"
                style={{ 
                  fontFamily: "'Josefin Sans', sans-serif",
                  backgroundColor: scrolled ? COLORS.azulBarranquero : 'rgba(255,255,255,0.95)',
                  color: scrolled ? '#ffffff' : COLORS.azulBarranquero,
                }}
              >
                ES
              </Link>
              <Link
                href="https://en.visitatlantico.com"
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-all hover:bg-white/10"
                style={{ 
                  fontFamily: "'Josefin Sans', sans-serif",
                  color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.7)',
                }}
              >
                EN
              </Link>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => setPlannerOpen(true)}
              className="ml-3 px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 text-white shadow-lg"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(234, 91, 19, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <HiOutlineSparkles className="text-base" />
              Planificar viaje
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative z-50 w-12 h-12 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: menuOpen ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <div className="relative w-6 h-5 flex flex-col justify-between">
              <motion.span
                className="block h-0.5 rounded-full origin-center"
                style={{ backgroundColor: menuOpen ? COLORS.grisOscuro : (scrolled ? COLORS.grisOscuro : '#ffffff') }}
                animate={{
                  rotate: menuOpen ? 45 : 0,
                  y: menuOpen ? 9 : 0,
                  width: menuOpen ? '100%' : '100%',
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="block h-0.5 rounded-full"
                style={{ backgroundColor: menuOpen ? COLORS.grisOscuro : (scrolled ? COLORS.grisOscuro : '#ffffff') }}
                animate={{
                  opacity: menuOpen ? 0 : 1,
                  x: menuOpen ? 20 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 rounded-full origin-center"
                style={{ backgroundColor: menuOpen ? COLORS.grisOscuro : (scrolled ? COLORS.grisOscuro : '#ffffff') }}
                animate={{
                  rotate: menuOpen ? -45 : 0,
                  y: menuOpen ? -9 : 0,
                  width: menuOpen ? '100%' : '70%',
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </button>
        </div>
      </motion.header>

      {/* ============================================================= */}
      {/* MOBILE MENU - Simple pero inmersivo */}
      {/* ============================================================= */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background */}
            <motion.div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(160deg, ${COLORS.azulBarranquero} 0%, #004d7a 100%)` 
              }}
            />

            {/* Subtle decorative circle */}
            <div 
              className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-[0.07]"
              style={{ backgroundColor: '#ffffff' }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col px-6 pt-28 pb-10">
              {/* Navigation Links - Clean & Simple */}
              <nav className="flex-1 flex flex-col justify-center space-y-1">
                {links.map(({ href, label, icon: Icon, color }, index) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={href}
                      className="flex items-center gap-4 py-4 group"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon 
                        className="text-2xl transition-colors"
                        style={{ color: isActiveLink(href) ? color : 'rgba(255,255,255,0.5)' }}
                      />
                      <span 
                        className="text-2xl font-light transition-colors"
                        style={{ color: isActiveLink(href) ? '#ffffff' : 'rgba(255,255,255,0.8)' }}
                      >
                        {label}
                      </span>
                      {isActiveLink(href) && (
                        <motion.div 
                          className="w-1.5 h-1.5 rounded-full ml-auto"
                          style={{ backgroundColor: color }}
                          layoutId="activeMenuDot"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Section */}
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {/* CTA Button */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setPlannerOpen(true);
                  }}
                  className="w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 text-white"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                  }}
                >
                  <HiOutlineSparkles className="text-lg" />
                  Planifica tu viaje
                </button>

                {/* Footer row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Link
                      href="https://visitatlantico.com"
                      className="text-white font-medium"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      ES
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link
                      href="https://en.visitatlantico.com"
                      className="text-white/50"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      EN
                    </Link>
                  </div>
                  <span 
                    className="text-white/30 text-xs tracking-widest uppercase"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Colombia
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planner Modal */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </>
  );
}