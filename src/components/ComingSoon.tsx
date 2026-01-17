"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Construction,
  ArrowLeft,
  Home,
  Map,
  Sparkles,
  Calendar,
  Waves,
  Utensils,
} from "lucide-react";

const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  verdeBijao: "#008D39",
  amarilloArepa: "#F39200",
  grisOscuro: "#0f0f1a",
};

// Map of icon names to components
const ICON_MAP = {
  home: Home,
  map: Map,
  calendar: Calendar,
  waves: Waves,
  utensils: Utensils,
  arrowLeft: ArrowLeft,
};

type IconName = keyof typeof ICON_MAP;

interface ComingSoonProps {
  pageName: string;
  description?: string;
  estimatedDate?: string;
  relatedLinks?: Array<{
    href: string;
    label: string;
    icon?: IconName;
  }>;
}

export default function ComingSoon({
  pageName,
  description = "Estamos trabajando en esta sección para ofrecerte la mejor experiencia.",
  estimatedDate,
  relatedLinks = [
    { href: "/", label: "Volver al inicio", icon: "home" },
    { href: "/destinations", label: "Explorar destinos", icon: "map" },
    { href: "/eventos", label: "Ver eventos", icon: "calendar" },
  ],
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with Icon */}
          <div
            className="relative h-32 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: COLORS.grisOscuro }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px]"
                style={{ background: COLORS.naranjaSalinas }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 blur-[60px]"
                style={{ background: COLORS.azulBarranquero }}
              />
            </div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Construction size={40} className="text-white" />
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12">
            {/* Title */}
            <h1
              className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 text-center"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {pageName}
            </h1>

            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${COLORS.amarilloArepa}15`,
                  color: COLORS.amarilloArepa,
                }}
              >
                <Sparkles size={16} />
                <span>Próximamente</span>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-lg text-slate-600 text-center mb-6 leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {description}
            </p>

            {/* Estimated Date (optional) */}
            {estimatedDate && (
              <p
                className="text-sm text-slate-400 text-center mb-8"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Fecha estimada: <strong>{estimatedDate}</strong>
              </p>
            )}

            {/* Related Links */}
            <div className="space-y-3">
              <p
                className="text-xs text-slate-400 uppercase tracking-wider text-center mb-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Mientras tanto, explora:
              </p>

              <div className="grid gap-3">
                {relatedLinks.map((link, index) => {
                  const Icon = link.icon ? ICON_MAP[link.icon] : ArrowLeft;
                  return (
                    <Link
                      key={index}
                      href={link.href}
                      className="flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group border border-slate-100 hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className="w-5 h-5 transition-colors"
                          style={{ color: COLORS.azulBarranquero }}
                        />
                        <span
                          className="font-medium text-slate-700"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {link.label}
                        </span>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-sm text-slate-400 mt-8"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          ¿Tienes preguntas?{" "}
          <Link
            href="/contacto"
            className="underline hover:text-slate-600 transition-colors"
          >
            Contáctanos
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
