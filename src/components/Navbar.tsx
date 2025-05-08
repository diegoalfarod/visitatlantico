"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import "@/styles/globals.css";

// 👇 Solución al error de TypeScript
declare global {
  interface Window {
    Weglot: any;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("es");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Weglot) {
      setLang(window.Weglot.getCurrentLang());
    }
  }, []);

  const toggleLanguage = () => {
    if (typeof window !== "undefined" && window.Weglot) {
      const nextLang = lang === "es" ? "en" : "es";
      window.Weglot.switchTo(nextLang);
      setLang(nextLang);
    }
  };

  const links = [
    { href: "/destinations", label: "Destinos" },
    { href: "#experiencias", label: "Experiencias" },
    { href: "#eventos", label: "Eventos" },
    { href: "#gastronomia", label: "Gastronomía" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#4A4F55] border-b border-[#7A858C] shadow-sm text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="VisitAtlántico Logo"
              width={145}
              height={140}
              className="object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="desktop-menu items-center gap-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-fivo text-sm hover:text-[#E40E20] transition-all"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-6">
              <button
                onClick={toggleLanguage}
                className="font-fivo text-sm hover:text-[#E40E20] transition-colors"
              >
                {lang === "es" ? "ES | EN" : "EN | ES"}
              </button>
              <Link href="/planner">
                <button className="font-fivo px-5 py-2 text-sm bg-[#E40E20] font-semibold rounded-full hover:bg-[#D31A2B] shadow-md">
                  Planifica tu viaje
                </button>
              </Link>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="mobile-menu-button text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mobile-dropdown open bg-[#4A4F55] text-white backdrop-blur-md shadow-md flex flex-col gap-6 px-6 py-8"
            >
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-fivo hover:text-[#E40E20] transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMenuOpen(false);
                  }}
                  className="font-fivo text-sm hover:text-[#E40E20]"
                >
                  {lang === "es" ? "ES | EN" : "EN | ES"}
                </button>
                <Link href="/planner" onClick={() => setMenuOpen(false)}>
                  <button className="font-fivo w-full px-5 py-3 bg-[#E40E20] font-semibold rounded-full hover:bg-[#D31A2B]">
                    Planifica tu viaje
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CSS Hardcodeado */}
      <style jsx>{`
        .desktop-menu {
          display: none;
        }
        .mobile-menu-button {
          display: block;
        }
        .mobile-dropdown {
          display: none;
        }
        .mobile-dropdown.open {
          display: flex;
        }

        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-button,
          .mobile-dropdown {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
