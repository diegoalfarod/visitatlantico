"use client";

import { useState } from "react";
import { 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  ChevronRight,
  ExternalLink 
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = () => {
    if (email.includes('@') && email.includes('.')) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  const footerLinks = {
    destinos: [
      { label: "Barranquilla", href: "/destinos/barranquilla" },
      { label: "Puerto Colombia", href: "/destinos/puerto-colombia" },
      { label: "Tubará", href: "/destinos/tubara" },
      { label: "Usiacurí", href: "/destinos/usiacuri" },
      { label: "Mapa Completo", href: "/mapa" }
    ],
    experiencias: [
      { label: "Playas", href: "/experiencias/playas" },
      { label: "Cultura", href: "/experiencias/cultura" },
      { label: "Gastronomía", href: "/experiencias/gastronomia" },
      { label: "Aventura", href: "/experiencias/aventura" },
      { label: "Ecoturismo", href: "/experiencias/ecoturismo" }
    ],
    ayuda: [
      { label: "Preguntas Frecuentes", href: "/ayuda/faq" },
      { label: "Términos y Condiciones", href: "/ayuda/terminos" },
      { label: "Política de Privacidad", href: "/ayuda/privacidad" },
      { label: "Accesibilidad", href: "/ayuda/accesibilidad" },
      { label: "Contacto", href: "/contacto" }
    ]
  };

  const socialMedia = [
    { icon: <Instagram size={20} />, label: "Instagram", href: "https://instagram.com/visitatlantico", color: "hover:text-pink-500" }
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, text: "info@visitatlantico.co" },
    { icon: <Phone size={16} />, text: "+57 (605) 330-7000" },
    { icon: <MapPin size={16} />, text: "Barranquilla, Atlántico, Colombia" }
  ];

  return (
    <footer className="w-full relative pt-20 pb-10 mt-16 overflow-hidden bg-background/30 border-t border-muted">
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full h-[60px]" preserveAspectRatio="none">
          <path d="M0,32L48,26.7C96,21,192,11,288,16C384,21,480,43,576,48C672,53,768,43,864,37.3C960,32,1056,32,1152,26.7C1248,21,1344,11,1392,5.3L1440,0L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="url(#footer-grad)" opacity="0.2" />
          <defs>
            <linearGradient id="footer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0065FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF715B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-3 flex flex-col">
            <div className="mb-6">
              <div className="text-2xl font-heading font-bold text-foreground">
                VisitAtlántico
              </div>
              <div className="h-1 w-10 bg-primary mt-2 rounded-full"></div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Explora el corazón del Caribe colombiano. Playas, cultura, gastronomía y aventuras inolvidables te esperan en el departamento del Atlántico.
            </p>
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-4">Destinos</h3>
              <ul className="space-y-2">
                {footerLinks.destinos.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-4">Experiencias</h3>
              <ul className="space-y-2">
                {footerLinks.experiencias.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-4">Ayuda</h3>
              <ul className="space-y-2">
                {footerLinks.ayuda.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col">
            <h3 className="font-sans font-semibold text-foreground mb-4">Mantente Informado</h3>
            <p className="text-sm text-muted-foreground mb-4">Suscríbete para recibir ofertas exclusivas e información sobre eventos y destinos.</p>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              {isSubmitted && <div className="text-green-600 text-xs mt-2">¡Gracias por suscribirte!</div>}
            </div>
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-4">Síguenos</h3>
              <div className="flex gap-3">
                {socialMedia.map((social, index) => (
                  <a key={index} href={social.href} target="_blank" rel="noopener noreferrer"
                    className={`bg-background border border-gray-200 p-2 rounded-full ${social.color} transition-all hover:scale-110 hover:border-primary/50 hover:shadow-md`}
                    aria-label={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-muted to-transparent my-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VisitAtlántico. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="https://www.atlantico.gov.co" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              Gobernación del Atlántico <ExternalLink size={12} />
            </a>
            <a href="https://github.com/diegoalfarod/visitatlantico" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              Créditos <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
