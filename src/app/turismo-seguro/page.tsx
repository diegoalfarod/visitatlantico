"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Phone, Mail, MapPin, Facebook, AlertTriangle,
  ArrowLeft, ArrowRight, ExternalLink, Shield, ShieldCheck,
  Users, Car, Waves, TreePine, MapPinned, Umbrella, Info
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ============================================
   SISTEMA DE DISEÑO VISITATLÁNTICO
   Consistente con HeroCarousel, UpcomingEvents, FeaturedExperiences
   
   Colores:
   - Rojo Cayena: #E40E20 / #D31A2B
   - Azul Barranquero: #007BC4
   - Gris Oscuro: #4A4F55
   - Gris Medio: #7A858C
   
   Tipografía:
   - Títulos: Josefin Sans
   - Body: Montserrat
   
   Componentes:
   - Cards: rounded-2xl, gradient overlays
   - Animaciones: ease [0.22, 1, 0.36, 1]
   - Headers: línea roja + label + título con acento
   ============================================ */

const EASE = [0.22, 1, 0.36, 1];

/* ============================================
   IMAGES - Firebase Storage URLs
   ============================================ */

const IMAGES = {
  hero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20de%20turismo%20nacional.jpeg?alt=media&token=4671cd80-f4a4-433b-a163-4669fe96d1ae",
  playa: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia-turismo%20en%20playas.jpg?alt=media&token=ec9d7a16-31dd-4f44-b08a-a31234c086e1",
  playaSaludando: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20en%20la%20playa%20saludando.webp?alt=media&token=b333cc06-be35-482b-9c25-c6ec40b3b0ac",
  carretera: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20carretera%20turismo%20seguro.webp?alt=media&token=18ed70be-d881-4df9-9330-6971bbd2bbc4",
  eventos: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20eventos%20ninos.webp?alt=media&token=16822e10-3893-4d88-adc9-0aa2c06801e6",
  sendero: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20vigilando%20en%20sendero%20piedra%20pintada.webp?alt=media&token=fe1847e8-b063-485c-8cd1-764e4d93d478",
  ninos: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/turismo%20policia%20seguro%201.webp?alt=media&token=4ca7b374-1249-45db-a823-8aed7e913096",
  motociclistas: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/policia%20cuidando%20motociclistas.webp?alt=media&token=56120c2a-b08a-4916-a470-344b9512ba4e",
  escudo: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/escudo%20policia%20turismo%20seguro%20atlantico.png?alt=media&token=258cf013-ccc0-4119-bc78-6e684caa28c4",
  logoEstrategia: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/logo-estrategia-turismo-seguro.png?alt=media&token=9f1758f8-8ddf-4a3c-8eef-b2f307953c04",
};

/* ============================================
   DATA
   ============================================ */

const emergencyLines = [
  { number: "123", name: "Emergencias", description: "Policía · Bomberos · Ambulancia", primary: true },
  { number: "165", name: "GAULA", description: "Antisecuestro" },
  { number: "155", name: "Mujer", description: "Violencia de género" },
  { number: "166", name: "Transparencia", description: "Denuncias" },
  { number: "167", name: "Antidrogas", description: "Prevención" },
];

const presenceAreas = [
  {
    title: "Playas",
    location: "Puerto Colombia · Salgar · Pradomar · Santa Verónica",
    description: "85 uniformados en temporada alta vigilando 18km de costa",
    image: IMAGES.playa,
    icon: Waves,
  },
  {
    title: "Carreteras",
    location: "Vía al Mar · Troncal del Caribe",
    description: "Puestos de control y acompañamiento en corredores turísticos",
    image: IMAGES.carretera,
    icon: Car,
  },
  {
    title: "Eventos",
    location: "Carnaval · Festivales · Ferias",
    description: "Dispositivos especiales durante eventos masivos",
    image: IMAGES.eventos,
    icon: Users,
  },
  {
    title: "Ecoturismo",
    location: "Piedra Pintada · Luriza · Reservas",
    description: "Patrullaje en senderos y zonas naturales protegidas",
    image: IMAGES.sendero,
    icon: TreePine,
  },
];

const touristSpots = [
  "Muelle 1888",
  "Castillo de Salgar", 
  "Lago del Cisne",
  "Bocas de Ceniza",
  "Zoológico de Barranquilla",
  "Museo del Caribe",
  "Gran Malecón",
  "Puerto Velero",
];

const tips = [
  { icon: ShieldCheck, text: "Mantén tus objetos personales vigilados" },
  { icon: Umbrella, text: "No dejes niños solos cerca del mar" },
  { icon: MapPinned, text: "Usa solo guías turísticos certificados" },
  { icon: Info, text: "Reporta cualquier situación sospechosa al 123" },
];

const contactInfo = {
  unit: "Grupo de Protección al Turismo y Patrimonio Nacional",
  department: "Policía Metropolitana de Barranquilla",
  address: "Calle 81 No. 14-33, Almendros II etapa",
  city: "Soledad, Atlántico",
  phone: "+57 324 571 0123",
  email: "Deata.gutur@policia.gov.co",
  facebook: "departamentodepoliciaatlantico",
};

/* ============================================
   HERO SECTION - Estilo cinematográfico VisitAtlántico
   ============================================ */

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-[85vh] min-h-[600px] overflow-hidden bg-black">
      {/* Background with Ken Burns effect */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src={IMAGES.ninos}
          alt="Policía de Turismo protegiendo familias"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      
      {/* Gradient overlays - estilo HeroCarousel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      
      {/* Back navigation */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Visit Atlántico</span>
          </Link>
        </div>
      </div>
      
      {/* Content - estilo HeroCarousel */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 w-full">
          <div className="max-w-2xl">
            {/* Logos */}
            <motion.div 
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <Image src={IMAGES.escudo} alt="Escudo" fill className="object-contain" />
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="relative w-28 h-12 sm:w-32 sm:h-14">
                <Image src={IMAGES.logoEstrategia} alt="Estrategia" fill className="object-contain" />
              </div>
            </motion.div>
            
            {/* Label - estilo VisitAtlántico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-px bg-[#E40E20]" />
              <span className="text-white/60 text-xs tracking-[0.2em] uppercase">
                Policía Nacional de Colombia
              </span>
            </motion.div>
            
            {/* Title - Josefin Sans */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-4"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Turismo
              <br />
              <span className="text-[#E40E20]">Seguro</span>
            </motion.h1>
            
            {/* Subtitle - Montserrat */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="text-white/70 text-lg sm:text-xl max-w-md mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Protegiendo tu experiencia en playas, carreteras y destinos turísticos del Atlántico
            </motion.p>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
              className="flex flex-wrap items-center gap-4"
            >
              <a 
                href="tel:123"
                className="inline-flex items-center gap-3 px-6 py-4 bg-[#E40E20] hover:bg-[#D31A2B] text-white rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-5 h-5" />
                <span>Emergencias: 123</span>
              </a>
              <a 
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium transition-all border border-white/10"
              >
                <Phone className="w-5 h-5" />
                <span>324 571 0123</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   STATS BAR - Datos rápidos
   ============================================ */

function StatsBar() {
  const stats = [
    { value: "72+", label: "Policías de turismo" },
    { value: "24/7", label: "Disponibilidad" },
    { value: "23", label: "Municipios cubiertos" },
    { value: "889K", label: "Turistas protegidos en 2024" },
  ];

  return (
    <section className="bg-[#4A4F55] py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: EASE }}
              className="text-center"
            >
              <p 
                className="text-3xl sm:text-4xl font-bold text-white mb-1"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRESENCE SECTION - Cards estilo UpcomingEvents
   ============================================ */

function PresenceSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header - estilo VisitAtlántico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#E40E20]" />
            <span className="text-[#7A858C] text-xs tracking-[0.2em] uppercase">
              Cobertura
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A4F55] tracking-tight"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Presencia en el{" "}
              <span className="text-[#E40E20]">Atlántico</span>
            </h2>
            <p className="text-[#7A858C] max-w-sm lg:text-right">
              Equipos especializados en los principales destinos turísticos
            </p>
          </div>
        </motion.div>
        
        {/* Cards Grid - estilo FeaturedExperiences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {presenceAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: EASE }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <Image
                  src={area.image}
                  alt={area.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Icon badge */}
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-white/50 text-xs mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {area.location}
                  </p>
                  <h3 
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    {area.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   EMERGENCY LINES
   ============================================ */

function EmergencySection() {
  return (
    <section className="py-20 sm:py-28 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#E40E20]" />
            <span className="text-[#7A858C] text-xs tracking-[0.2em] uppercase">
              Atención Inmediata
            </span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A4F55] tracking-tight"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            Líneas de{" "}
            <span className="text-[#E40E20]">Emergencia</span>
          </h2>
        </motion.div>
        
        {/* Lines Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {emergencyLines.map((line, index) => (
            <motion.a
              key={line.number}
              href={`tel:${line.number}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
              className={`
                group p-6 rounded-2xl text-center transition-all duration-300
                ${line.primary 
                  ? 'bg-[#E40E20] hover:bg-[#D31A2B] shadow-lg shadow-red-500/20' 
                  : 'bg-white hover:shadow-lg border border-[#e8e8e8]'
                }
              `}
            >
              <p 
                className={`text-4xl sm:text-5xl font-bold mb-2 ${line.primary ? 'text-white' : 'text-[#4A4F55]'}`}
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {line.number}
              </p>
              <p className={`font-semibold text-sm mb-1 ${line.primary ? 'text-white' : 'text-[#4A4F55]'}`}>
                {line.name}
              </p>
              <p className={`text-xs ${line.primary ? 'text-white/70' : 'text-[#7A858C]'}`}>
                {line.description}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TIPS & SPOTS SECTION
   ============================================ */

function TipsSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#E40E20]" />
              <span className="text-[#7A858C] text-xs tracking-[0.2em] uppercase">
                Recomendaciones
              </span>
            </div>
            <h3 
              className="text-2xl sm:text-3xl font-bold text-[#4A4F55] mb-8"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Viaja <span className="text-[#E40E20]">Seguro</span>
            </h3>
            
            <div className="space-y-4">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4, ease: EASE }}
                    className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E40E20]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#E40E20]" />
                    </div>
                    <p className="text-[#4A4F55] text-sm">{tip.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Protected spots */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#E40E20]" />
              <span className="text-[#7A858C] text-xs tracking-[0.2em] uppercase">
                Sitios Protegidos
              </span>
            </div>
            <h3 
              className="text-2xl sm:text-3xl font-bold text-[#4A4F55] mb-8"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Destinos <span className="text-[#E40E20]">Vigilados</span>
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {touristSpots.map((spot, index) => (
                <motion.span
                  key={spot}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3, ease: EASE }}
                  className="px-4 py-2.5 bg-[#fafafa] rounded-full text-[#4A4F55] text-sm font-medium border border-[#e8e8e8]"
                >
                  {spot}
                </motion.span>
              ))}
            </div>
            
            <p className="mt-6 text-[#7A858C] text-sm">
              Y más de 50 atractivos turísticos adicionales en todo el departamento
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   ESCNNA WARNING
   ============================================ */

function EscnnaWarning() {
  return (
    <section className="py-12 bg-amber-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col sm:flex-row items-start gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#4A4F55] mb-2">
              Turismo Responsable
            </h3>
            <p className="text-[#7A858C] text-sm leading-relaxed mb-3">
              La explotación sexual de niños, niñas y adolescentes (ESCNNA) es un delito grave. 
              Denuncie de inmediato al <strong className="text-[#4A4F55]">123</strong>. Su denuncia es confidencial.
            </p>
            <span className="text-amber-600 text-sm font-semibold">#OjosEnTodasPartes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT SECTION
   ============================================ */

function ContactSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#E40E20]" />
              <span className="text-[#7A858C] text-xs tracking-[0.2em] uppercase">
                Contacto
              </span>
            </div>
            <h2 
              className="text-3xl sm:text-4xl font-bold text-[#4A4F55] mb-2"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Policía de{" "}
              <span className="text-[#E40E20]">Turismo</span>
            </h2>
            <p className="text-[#7A858C] mb-8">
              {contactInfo.unit}
            </p>
            
            <div className="space-y-3">
              <a 
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8e8e8] hover:border-[#E40E20]/30 hover:shadow-sm transition-all"
              >
                <Phone className="w-5 h-5 text-[#E40E20]" />
                <div>
                  <p className="text-[#4A4F55] font-medium">{contactInfo.phone}</p>
                  <p className="text-[#7A858C] text-sm">Atención 24 horas</p>
                </div>
              </a>
              
              <a 
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8e8e8] hover:border-[#E40E20]/30 hover:shadow-sm transition-all"
              >
                <Mail className="w-5 h-5 text-[#E40E20]" />
                <p className="text-[#4A4F55] font-medium">{contactInfo.email}</p>
              </a>
              
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address + ', ' + contactInfo.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8e8e8] hover:border-[#E40E20]/30 hover:shadow-sm transition-all group"
              >
                <MapPin className="w-5 h-5 text-[#E40E20]" />
                <div className="flex-1">
                  <p className="text-[#4A4F55] font-medium">{contactInfo.address}</p>
                  <p className="text-[#7A858C] text-sm">{contactInfo.city}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#7A858C] group-hover:text-[#E40E20] transition-colors" />
              </a>
              
              <a 
                href={`https://facebook.com/${contactInfo.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8e8e8] hover:border-[#E40E20]/30 hover:shadow-sm transition-all group"
              >
                <Facebook className="w-5 h-5 text-[#E40E20]" />
                <p className="text-[#4A4F55] font-medium">@{contactInfo.facebook}</p>
                <ExternalLink className="w-4 h-4 text-[#7A858C] group-hover:text-[#E40E20] transition-colors ml-auto" />
              </a>
            </div>
          </motion.div>
          
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative h-[400px] lg:h-full min-h-[350px] rounded-2xl overflow-hidden"
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
  );
}

/* ============================================
   FOOTER
   ============================================ */

function Footer() {
  return (
    <footer className="py-10 bg-[#4A4F55]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image src={IMAGES.escudo} alt="Escudo" fill className="object-contain" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Policía Nacional de Colombia</p>
              <p className="text-white/50 text-xs">Dios y Patria</p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Visit Atlántico
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */

export default function TurismoSeguroPage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <StatsBar />
      <PresenceSection />
      <EmergencySection />
      <TipsSection />
      <EscnnaWarning />
      <ContactSection />
      <Footer />
    </main>
  );
}