"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubscribe = () => {
    if (email.match(/.+@.+\..+/)) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setEmail("");
    }
  };

  /* ---- enlaces de navegación ---- */
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
      icon: <Instagram size={18} />,
      label: "Instagram",
      href: "https://instagram.com/turismoatlantico_",
    },
  ];

  /* ---------- UI ---------- */
  return (
    <footer className="w-full relative bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
      {/* Sección superior con logo y info principal */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Logo e información institucional */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo-black.png"
                  alt="VisitAtlántico - Gobernación del Atlántico"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    VisitAtlántico
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Gobernación del Atlántico
                  </p>
                </div>
              </div>
              
              <p className="text-slate-600 leading-relaxed">
                Portal oficial de turismo del departamento del Atlántico. 
                Descubre la riqueza cultural, gastronómica y natural del corazón 
                del Caribe colombiano.
              </p>

              {/* Información de contacto */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Contacto Institucional
                </h3>
                <div className="space-y-2">
                  <a
                    href="mailto:atencionalciudadano@atlantico.gov.co"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors group"
                  >
                    <Mail size={16} className="text-blue-500" />
                    <span>atencionalciudadano@atlantico.gov.co</span>
                  </a>
                  <a
                    href="tel:+576053307000"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone size={16} className="text-blue-500" />
                    <span>+57 (605) 330-7000</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-blue-500 mt-0.5" />
                    <span>CL 40 45 46<br />Barranquilla, Atlántico, Colombia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces institucionales y servicios */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Institucional
                </h3>
                <ul className="space-y-2">
                  {footerLinks.institucional.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 group transition-all duration-200"
                      >
                        <span className="group-hover:underline">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
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
                          className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 group transition-all duration-200"
                        >
                          <span className="group-hover:underline">{link.label}</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 group transition-all duration-200"
                        >
                          <span className="group-hover:underline">{link.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Boletín Informativo
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Recibe las últimas noticias y eventos turísticos del Atlántico.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubscribe();
                  }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-3 px-4 pr-12 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                      aria-label="Suscribirme"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  {sent && (
                    <p className="text-green-600 text-xs flex items-center gap-1">
                      ✓ Suscripción exitosa
                    </p>
                  )}
                </form>

                {/* Redes sociales */}
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <p className="text-xs font-semibold text-slate-700 mb-3">SÍGUENOS</p>
                  <div className="flex gap-2">
                    {socialMedia.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="bg-white border border-slate-200 p-2.5 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces gubernamentales */}
      <div className="bg-slate-50 py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center text-sm">
            <a
              href="https://www.atlantico.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <span>Gobernación del Atlántico</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span>
              © {new Date().getFullYear()} VisitAtlántico - Gobernación del Atlántico. 
              Todos los derechos reservados.
            </span>
            <div className="flex items-center gap-6">
              <Link href="/ayuda/privacidad" className="hover:text-blue-600 transition-colors">
                Privacidad
              </Link>
              <Link href="/ayuda/terminos" className="hover:text-blue-600 transition-colors">
                Términos
              </Link>
              <Link href="/accesibilidad" className="hover:text-blue-600 transition-colors">
                Accesibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}