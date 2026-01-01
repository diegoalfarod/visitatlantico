"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Phone, Mail, MapPin, Facebook, AlertTriangle,
  ArrowLeft, Clock, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

/* ============================================
   DATA
   ============================================ */

const emergencyLines = [
  { 
    number: "123", 
    name: "Emergencias", 
    description: "Policía, bomberos, ambulancia",
    available: "24 horas",
    primary: true 
  },
  { 
    number: "165", 
    name: "Antisecuestro", 
    description: "GAULA - Antiextorsión",
    available: "24 horas"
  },
  { 
    number: "155", 
    name: "Atención a la Mujer", 
    description: "Violencia de género",
    available: "24 horas"
  },
  { 
    number: "166", 
    name: "Transparencia", 
    description: "Denuncias institucionales",
    available: "24 horas"
  },
  { 
    number: "167", 
    name: "Antidrogas", 
    description: "Prevención y denuncia",
    available: "24 horas"
  },
];

const contactInfo = {
  unit: "Grupo de Protección al Turismo",
  department: "Departamento de Policía Atlántico",
  address: "Calle 81 No. 14-33, Almendros II etapa",
  city: "Soledad, Atlántico",
  phone: "+57 324 571 0123",
  email: "Deata.gutur@policia.gov.co",
  facebook: "departamentodepoliciaatlantico",
  hours: "Atención 24 horas"
};

const gallery = [
  "/images/policia-gallery/1.jpg",
  "/images/policia-gallery/2.jpg",
  "/images/policia-gallery/3.jpg",
  "/images/policia-gallery/4.jpg",
];

/* ============================================
   PAGE
   ============================================ */

export default function TurismoSeguroPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      
      {/* ===================== HERO ===================== */}
      <section className="relative bg-[#0f2942] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2942] via-[#1a3d5c] to-[#0f2942]" />
        
        {/* Gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="pt-8 pb-16 sm:pb-20">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Visit Atlántico</span>
            </Link>
          </div>
          
          {/* Hero Content */}
          <div className="pb-20 sm:pb-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-[#d4af37] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                  Policía Nacional de Colombia
                </p>
                <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] mb-6">
                  Turismo<br />Seguro
                </h1>
                <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                  Estamos presentes en todo el Atlántico para garantizar 
                  tu seguridad mientras disfrutas de nuestros destinos.
                </p>
              </motion.div>
              
              {/* Main CTA */}
              <motion.div 
                className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <a 
                  href="tel:123"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-semibold text-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Emergencias: <strong>123</strong></span>
                </a>
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-medium transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#d4af37]" />
                  <span>324 571 0123</span>
                </a>
              </motion.div>
            </div>
            
            {/* Right: Shield */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-52 h-52 sm:w-64 sm:h-64">
                {/* Glow */}
                <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full blur-3xl scale-150" />
                {/* Shield */}
                <Image 
                  src="/images/policia-escudo.png"
                  alt="Escudo Policía Nacional"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60H1440V0C1440 0 1140 60 720 60C300 60 0 0 0 0V60Z" fill="#f5f7fa"/>
          </svg>
        </div>
      </section>
      
      {/* ===================== PHONE LINES ===================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Líneas de Atención
            </h2>
            <p className="text-slate-500">
              Disponibles las 24 horas, los 7 días de la semana
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {emergencyLines.map((line, index) => (
              <motion.a
                key={line.number}
                href={`tel:${line.number}`}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                  line.primary 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Phone icon indicator */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  line.primary ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                } transition-colors`}>
                  <Phone className={`w-5 h-5 ${line.primary ? 'text-white' : 'text-slate-600'}`} />
                </div>
                
                {/* Number */}
                <p className={`text-4xl font-bold mb-2 ${line.primary ? 'text-white' : 'text-slate-900'}`}>
                  {line.number}
                </p>
                
                {/* Name */}
                <p className={`font-semibold mb-1 ${line.primary ? 'text-white' : 'text-slate-900'}`}>
                  {line.name}
                </p>
                
                {/* Description */}
                <p className={`text-sm ${line.primary ? 'text-white/70' : 'text-slate-500'}`}>
                  {line.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
      
      {/* ===================== GALLERY ===================== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Presencia en el Atlántico
            </h2>
            <p className="text-slate-500">
              Protegiendo playas, monumentos y zonas turísticas
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, index) => (
              <motion.div
                key={index}
                className={`relative overflow-hidden rounded-2xl ${
                  index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'
                }`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Image
                  src={src}
                  alt={`Policía de Turismo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ===================== ESCNNA WARNING ===================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Warning accent */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            
            <div className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Turismo Responsable
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    La explotación sexual de niños, niñas y adolescentes <strong>(ESCNNA)</strong> es 
                    un delito grave. Si tiene conocimiento de algún caso, denuncie de inmediato. 
                    Su denuncia es confidencial y puede salvar vidas.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <a 
                      href="tel:123"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Denuncie: 123
                    </a>
                    <span className="text-amber-600 font-semibold text-sm">
                      #OjosEnTodasPartes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ===================== CONTACT ===================== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Contacto
              </h2>
              <p className="text-slate-500 mb-8">
                Policía de Turismo del Atlántico
              </p>
              
              <div className="space-y-4">
                {/* Address */}
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address + ', ' + contactInfo.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dirección</p>
                    <p className="text-slate-900 font-medium">{contactInfo.address}</p>
                    <p className="text-slate-500 text-sm">{contactInfo.city}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </a>
                
                {/* Phone */}
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                    <p className="text-slate-900 font-medium">{contactInfo.phone}</p>
                  </div>
                </a>
                
                {/* Email */}
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Correo</p>
                    <p className="text-slate-900 font-medium truncate">{contactInfo.email}</p>
                  </div>
                </a>
                
                {/* Facebook */}
                <a 
                  href={`https://facebook.com/${contactInfo.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Facebook className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Facebook</p>
                    <p className="text-slate-900 font-medium">@{contactInfo.facebook}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </a>
                
                {/* Hours */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Horario</p>
                    <p className="text-slate-900 font-medium">{contactInfo.hours}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Map */}
            <motion.div
              className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-100"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.5!2d-74.79!3d10.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef5d3f6a8b9f1a7%3A0x9f5a8b9c7d6e5f4a!2sSoledad%2C%20Atl%C3%A1ntico!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#0f2942] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative flex-shrink-0">
                <Image 
                  src="/images/policia-escudo.png"
                  alt="Policía Nacional"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-white font-semibold">Policía Nacional de Colombia</p>
                <p className="text-[#d4af37] text-sm">Dios y Patria</p>
              </div>
            </div>
            
            {/* Back Link */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Visit Atlántico
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}