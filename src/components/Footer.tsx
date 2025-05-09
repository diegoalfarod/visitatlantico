"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronRight,
  ExternalLink,
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
    destinos: [
      { label: "Barranquilla", href: "/destinos/barranquilla" },
      { label: "Puerto Colombia", href: "/destinos/puerto-colombia" },
      { label: "Tubará", href: "/destinos/tubara" },
      { label: "Usiacurí", href: "/destinos/usiacuri" },
      { label: "Mapa Completo", href: "/mapa" },
    ],
    experiencias: [
      { label: "Playas", href: "/experiencias/playas" },
      { label: "Cultura", href: "/experiencias/cultura" },
      { label: "Gastronomía", href: "/experiencias/gastronomia" },
      { label: "Aventura", href: "/experiencias/aventura" },
      { label: "Ecoturismo", href: "/experiencias/ecoturismo" },
    ],
    ayuda: [
      { label: "Preguntas Frecuentes", href: "/ayuda/faq" },
      { label: "Términos y Condiciones", href: "/ayuda/terminos" },
      { label: "Política de Privacidad", href: "/ayuda/privacidad" },
      { label: "Accesibilidad", href: "/ayuda/accesibilidad" },
      { label: "Contacto", href: "/contacto" },
    ],
  };

  const socialMedia = [
    {
      icon: <Instagram size={20} />,
      label: "Instagram",
      href: "https://instagram.com/visitatlantico",
      color: "hover:text-pink-500",
    },
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, text: "info@visitatlantico.co" },
    { icon: <Phone size={16} />, text: "+57 (605) 330-7000" },
    { icon: <MapPin size={16} />, text: "Barranquilla – Atlántico, Colombia" },
  ];

  /* ---------- UI ---------- */
  return (
    <footer className="w-full relative pt-20 pb-10 mt-16 overflow-hidden bg-background/30 border-t border-muted">
      {/* onda decorativa */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          className="w-full h-[60px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32L48,26.7C96,21,192,11,288,16C384,21,480,43,576,48C672,53,768,43,864,37.3C960,32,1056,32,1152,26.7C1248,21,1344,11,1392,5.3L1440,0V100H0Z"
            fill="url(#footer-grad)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="footer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0065FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF715B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* ---------- columnas principales ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* marca & contacto */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">
                VisitAtlántico
              </h2>
              <div className="h-1 w-10 bg-primary mt-2 rounded-full" />
            </div>

            <p className="text-sm text-muted-foreground">
              Explora el corazón del Caribe colombiano. Playas, cultura,
              gastronomía y aventuras inolvidables te esperan en el Atlántico.
            </p>

            <ul className="space-y-3">
              {contactInfo.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">{c.icon}</span>
                  {c.text}
                </li>
              ))}
            </ul>
          </div>

          {/* enlaces destinos / experiencias / ayuda */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {(["destinos", "experiencias", "ayuda"] as const).map((section) => (
              <div key={section}>
                <h3 className="font-semibold text-foreground mb-4 capitalize">
                  {section}
                </h3>
                <ul className="space-y-2">
                  {footerLinks[section].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 group transition-all"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* newsletter & redes */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Mantente informado
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Suscríbete y recibe ofertas exclusivas y novedades.
              </p>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-12 text-sm focus:ring-primary/40 focus:border-primary/60 outline-none"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-md hover:bg-primary/90"
                  aria-label="Suscribirme"
                >
                  <Send size={16} />
                </button>
              </div>
              {sent && (
                <p className="text-green-600 text-xs mt-1">
                  ¡Gracias por suscribirte!
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Síguenos</h3>
              <div className="flex gap-3">
                {socialMedia.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`border p-2 rounded-full ${s.color} hover:scale-110 transition`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* divisor */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-muted to-transparent my-8" />

        {/* credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} VisitAtlántico. Todos los derechos
            reservados.
          </span>
          <div className="flex gap-6">
            <a
              href="https://www.atlantico.gov.co"
              target="_blank"
              className="hover:text-primary flex items-center gap-1"
              rel="noopener noreferrer"
            >
              Gobernación del Atlántico <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/diegoalfarod/visitatlantico"
              target="_blank"
              className="hover:text-primary flex items-center gap-1"
              rel="noopener noreferrer"
            >
              Créditos <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
