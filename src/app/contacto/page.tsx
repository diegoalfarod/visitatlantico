"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ExternalLink,
  Building2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Footer from "@/components/Footer";

// =============================================================================
// DESIGN SYSTEM
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  verdeBijao: "#008D39",
  amarilloArepa: "#F39200",
  grisOscuro: "#0f0f1a",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// =============================================================================
// CONTACT INFO
// =============================================================================
const contactInfo = [
  {
    icon: Mail,
    label: "Correo electrónico",
    value: "atencionalciudadano@atlantico.gov.co",
    href: "mailto:atencionalciudadano@atlantico.gov.co",
    color: COLORS.azulBarranquero,
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+57 (605) 330 7000",
    href: "tel:+576053307000",
    color: COLORS.verdeBijao,
  },
  {
    icon: MapPin,
    label: "Dirección",
    value: "Calle 40 No. 45-46, Barranquilla",
    href: "https://maps.google.com/?q=Gobernacion+del+Atlantico+Barranquilla",
    color: COLORS.rojoCayena,
  },
  {
    icon: Clock,
    label: "Horario de atención",
    value: "Lunes a Viernes: 8:00 AM - 5:00 PM",
    href: null,
    color: COLORS.naranjaSalinas,
  },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/GobAtlantico", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/gobatlantico", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/GobAtlantico", label: "Twitter" },
  { icon: Youtube, href: "https://www.youtube.com/@GobernaciondelAtlantico", label: "YouTube" },
];

const quickLinks = [
  {
    icon: HelpCircle,
    title: "Preguntas Frecuentes",
    description: "Encuentra respuestas rápidas",
    href: "/faq",
    color: COLORS.azulBarranquero,
  },
  {
    icon: MessageCircle,
    title: "Habla con Jimmy",
    description: "Asistente virtual 24/7",
    action: "jimmy",
    color: COLORS.verdeBijao,
  },
  {
    icon: Sparkles,
    title: "Planifica tu viaje",
    description: "Crea tu itinerario con IA",
    href: "/",
    action: "planner",
    color: COLORS.naranjaSalinas,
  },
];

// =============================================================================
// FORM TYPES
// =============================================================================
type FormStatus = "idle" | "sending" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function ContactoPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      // Guardar en Firebase Firestore
      await addDoc(collection(db, "contactMessages"), {
        ...form,
        createdAt: serverTimestamp(),
        read: false,
        replied: false,
        source: "website",
      });

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
      setErrorMessage("Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.");
    }
  };

  const handleQuickAction = (action?: string) => {
    if (action === "jimmy") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("jimmy:open"));
      }
    } else if (action === "planner") {
      // Scroll to planner or open modal
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-planner"));
      }
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#fafafa]">
        {/* ================================================================
            HERO SECTION
            ================================================================ */}
        <div 
          className="relative overflow-hidden"
          style={{ backgroundColor: COLORS.grisOscuro }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
              style={{ background: COLORS.azulBarranquero }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
              style={{ background: COLORS.verdeBijao }}
            />
            {/* Grain */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-16">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-10 group"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Inicio
              </Link>
            </motion.div>
            
            <div ref={headerRef} className="max-w-3xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Mail size={16} style={{ color: COLORS.azulBarranquero }} />
                <span 
                  className="text-sm font-medium text-white/70"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Estamos para ayudarte
                </span>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Contáctanos
              </motion.h1>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-white/50 max-w-xl leading-relaxed"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                ¿Tienes preguntas sobre tu viaje al Atlántico? ¿Sugerencias para mejorar el portal? Nos encantaría escucharte.
              </motion.p>
            </div>
          </div>
        </div>

        {/* ================================================================
            MAIN CONTENT
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            
            {/* Contact Form - 3 columns */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <div className="mb-8">
                  <h2 
                    className="text-2xl font-bold text-slate-900 mb-2"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    Envíanos un mensaje
                  </h2>
                  <p 
                    className="text-slate-500"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Completa el formulario y te responderemos lo antes posible.
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor="name" 
                        className="block text-sm font-medium text-slate-700 mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="
                          w-full px-4 py-3 rounded-xl
                          border border-slate-200
                          text-slate-800 placeholder:text-slate-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                          transition-all duration-200
                        "
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-slate-700 mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="
                          w-full px-4 py-3 rounded-xl
                          border border-slate-200
                          text-slate-800 placeholder:text-slate-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                          transition-all duration-200
                        "
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label 
                      htmlFor="subject" 
                      className="block text-sm font-medium text-slate-700 mb-2"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Asunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="
                        w-full px-4 py-3 rounded-xl
                        border border-slate-200
                        text-slate-800
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                        transition-all duration-200
                        bg-white
                      "
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="consulta-turismo">Consulta sobre turismo</option>
                      <option value="sugerencia">Sugerencia para el portal</option>
                      <option value="error-sitio">Reportar error en el sitio</option>
                      <option value="informacion-destino">Información sobre un destino</option>
                      <option value="colaboracion">Propuesta de colaboración</option>
                      <option value="prensa">Prensa y medios</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label 
                      htmlFor="message" 
                      className="block text-sm font-medium text-slate-700 mb-2"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      className="
                        w-full px-4 py-3 rounded-xl
                        border border-slate-200
                        text-slate-800 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                        transition-all duration-200
                        resize-none
                      "
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="
                        inline-flex items-center justify-center gap-2
                        px-6 py-3.5 rounded-xl
                        text-white font-medium
                        transition-all duration-200
                        disabled:opacity-70 disabled:cursor-not-allowed
                        hover:shadow-lg hover:-translate-y-0.5
                      "
                      style={{ 
                        backgroundColor: COLORS.azulBarranquero,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Enviar mensaje
                        </>
                      )}
                    </button>

                    {/* Status Messages */}
                    {status === "success" && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-green-600"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">¡Mensaje enviado correctamente!</span>
                      </motion.div>
                    )}
                    
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-red-600"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <AlertCircle size={18} />
                        <span className="text-sm">{errorMessage}</span>
                      </motion.div>
                    )}
                  </div>
                </form>

                {/* Privacy Note */}
                <p 
                  className="mt-6 text-xs text-slate-400"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Al enviar este formulario, aceptas nuestra{" "}
                  <Link href="/ayuda/privacidad" className="underline hover:text-slate-600">
                    Política de Privacidad
                  </Link>
                  . Tus datos serán tratados de forma confidencial.
                </p>
              </motion.div>
            </div>

            {/* Sidebar - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h3 
                  className="text-lg font-bold text-slate-900 mb-5"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Información de contacto
                </h3>
                
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.color}10` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p 
                          className="text-xs text-slate-400 uppercase tracking-wider mb-0.5"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-sm font-medium text-slate-700 hover:underline"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p 
                            className="text-sm font-medium text-slate-700"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Social Links */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p 
                    className="text-xs text-slate-400 uppercase tracking-wider mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Síguenos
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="
                          w-10 h-10 rounded-xl
                          bg-slate-50 hover:bg-slate-100
                          flex items-center justify-center
                          text-slate-500 hover:text-slate-700
                          transition-colors
                        "
                      >
                        <social.icon size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <h3 
                  className="text-lg font-bold text-slate-900 mb-5"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Respuesta rápida
                </h3>
                
                <div className="space-y-3">
                  {quickLinks.map((link) => {
                    const content = (
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${link.color}10` }}
                        >
                          <link.icon className="w-5 h-5" style={{ color: link.color }} />
                        </div>
                        <div className="flex-1">
                          <p 
                            className="font-medium text-slate-800 text-sm"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {link.title}
                          </p>
                          <p 
                            className="text-xs text-slate-500"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {link.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </div>
                    );

                    if (link.action) {
                      return (
                        <button
                          key={link.title}
                          onClick={() => handleQuickAction(link.action)}
                          className="
                            w-full p-3 rounded-xl
                            bg-slate-50 hover:bg-slate-100
                            transition-colors text-left
                          "
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={link.title}
                        href={link.href!}
                        className="
                          block p-3 rounded-xl
                          bg-slate-50 hover:bg-slate-100
                          transition-colors
                        "
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              {/* Government Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: `${COLORS.grisOscuro}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p 
                      className="font-semibold text-white text-sm"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Gobernación del Atlántico
                    </p>
                    <p 
                      className="text-xs text-white/50"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Portal oficial de turismo
                    </p>
                  </div>
                </div>
                
                <a
                  href="https://www.atlantico.gov.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2.5 rounded-lg
                    bg-white/10 hover:bg-white/20
                    text-white text-sm font-medium
                    transition-colors
                  "
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <Globe size={16} />
                  Visitar sitio oficial
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ================================================================
            MAP SECTION (Optional)
            ================================================================ */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                Encuéntranos
              </h3>
              <p 
                className="text-sm text-slate-500"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Sede principal de la Gobernación del Atlántico
              </p>
            </div>
            <div className="aspect-[21/9] bg-slate-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3983!2d-74.8053!3d10.9639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d3c3e5e5e5d%3A0x3c3c3c3c3c3c3c3c!2sGobernaci%C3%B3n%20del%20Atl%C3%A1ntico!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la Gobernación del Atlántico"
              />
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}