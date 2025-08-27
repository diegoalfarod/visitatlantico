"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import { HiGlobeAlt, HiLocationMarker } from "react-icons/hi";
import { RiGovernmentLine } from "react-icons/ri";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PlannerPage from "@/components/planner/PlannerPage"; // ⬅️ nuevo import
import "@/styles/globals.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false); // ⬅️ estado del modal
  const navbarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const links = [
    { href: "/destinations", label: "Destinos", icon: HiLocationMarker },
    { href: "/experiences", label: "Experiencias", icon: RiGovernmentLine },
    { href: "/gastronomy", label: "Gastronomía", icon: HiGlobeAlt },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isActiveLink = (href: string) => pathname === href;

  return (
    <>
      <motion.header
        ref={navbarRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-800"
            : "bg-gray-900/90 backdrop-blur-md shadow-xl border-b border-gray-800/50"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 md:py-4">
          {/* Logo */}
          <Link
            href="/"
            className="group focus-visible:outline focus-visible:outline-red-500 focus-visible:outline-2 rounded-xl p-2"
          >
            <div className="relative">
              <motion.div className="absolute -inset-3 bg-gradient-to-r from-red-600/30 to-yellow-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/logo.png"
                alt="Gobernación del Atlántico"
                width={140}
                height={140}
                priority
                className="relative object-contain transition-transform duration-300 group-hover:scale-105 brightness-110 drop-shadow-lg"
                style={{ maxHeight: "65px", width: "auto" }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-menu items-center gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`group relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  isActiveLink(href)
                    ? "text-white bg-red-600/20 backdrop-blur-sm border border-red-500/30 shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="text-lg" />
                  {label}
                </span>
                {isActiveLink(href) && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 translate-y-2"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* Actions */}
            <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-700">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm rounded-full p-1">
                <Link
                  href="https://visitatlantico.com"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 bg-gray-700 text-white shadow-sm hover:bg-gray-600"
                >
                  ES
                </Link>
                <Link
                  href="https://en.visitatlantico.com"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  EN
                </Link>
              </div>

              {/* CTA Button → abre PlannerPage */}
              <motion.button
                onClick={() => setPlannerOpen(true)}
                className="group relative px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-red-900/30 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-haspopup="dialog"
                aria-expanded={plannerOpen}
                aria-controls="planner-sheet"
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <RiGovernmentLine className="text-lg" />
                  Planifica tu viaje
                </span>
              </motion.button>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <motion.button
            className="mobile-menu-button relative p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 focus-visible:outline focus-visible:outline-red-500 focus-visible:outline-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaTimes className="text-xl" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBars className="text-xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.645, 0.045, 0.355, 1.0] }}
              className="mobile-dropdown bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Mobile Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-3 bg-gradient-to-r from-red-600/30 to-yellow-600/30 rounded-3xl blur-xl opacity:60"
                      animate={{ opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <Image
                      src="/logo.png"
                      alt="Gobernación del Atlántico"
                      width={140}
                      height={140}
                      className="relative object-contain brightness-110 drop-shadow-lg"
                      style={{ maxHeight: "100px", width: "auto" }}
                    />
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3 mb-8">
                  {links.map(({ href, label, icon: Icon }, index) => (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={href}
                        className={`group flex items-center gap-4 p-4 rounded-2xl font-medium transition-all duration-300 ${
                          isActiveLink(href)
                            ? "text-white bg-red-600/20 backdrop-blur-sm border border-red-500/30 shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <div
                          className={`p-2 rounded-xl transition-colors duration-300 ${
                            isActiveLink(href) ? "bg-red-600/30" : "bg-gray-800 group-hover:bg-red-600/20"
                          }`}
                        >
                          <Icon className="text-xl" />
                        </div>
                        <span className="text-lg">{label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Language Selector */}
                  <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
                    <span className="text-sm font-medium text-gray-400">Idioma:</span>
                    <div className="flex gap-2">
                      <Link
                        href="https://visitatlantico.com"
                        className="px-4 py-2 bg-gray-700 text-white rounded-full font-medium shadow-sm hover:bg-gray-600 transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        Español
                      </Link>
                      <Link
                        href="https://en.visitatlantico.com"
                        className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full font-medium transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        English
                      </Link>
                    </div>
                  </div>

                  {/* CTA Button → abre PlannerPage y cierra menú */}
                  <motion.button
                    onClick={() => {
                      setMenuOpen(false);
                      setPlannerOpen(true);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-900/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-haspopup="dialog"
                    aria-expanded={plannerOpen}
                    aria-controls="planner-sheet"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <RiGovernmentLine className="text-xl" />
                      Planifica tu viaje
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* CSS responsive */}
      <style jsx>{`
        .desktop-menu {
          display: none;
        }
        .mobile-menu-button {
          display: block;
        }
        .mobile-dropdown {
          display: block;
        }
        @media (min-width: 1024px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-button,
          .mobile-dropdown {
            display: none !important;
          }
        }
      `}</style>

      {/* PlannerPage montado en el árbol */}
      <PlannerPage open={plannerOpen} onOpenChange={setPlannerOpen} />
    </>
  );
}
