// src/app/destinations/[id]/page.js

import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { 
  ArrowLeft, 
  Camera, 
  Clock, 
  MapPin, 
  Share2, 
  Heart,
  Navigation,
  ChevronRight,
  Star,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

// =============================================================================
// PALETA INSTITUCIONAL - Gobernación del Atlántico
// =============================================================================
const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#1a1a2e",
};

// Función para formatear texto en párrafos
function formatDescription(text) {
  if (!text) return [];
  
  let paragraphs = text.split(/\n\n+/);
  
  if (paragraphs.length === 1) {
    paragraphs = text.split(/\n+/);
  }
  
  if (paragraphs.length === 1 && text.length > 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    paragraphs = [];
    let currentParagraph = "";
    
    sentences.forEach((sentence, index) => {
      currentParagraph += sentence.trim() + " ";
      
      if ((index + 1) % 3 === 0 || 
          sentence.includes('Por otro lado') || 
          sentence.includes('Además') ||
          sentence.includes('También') ||
          sentence.includes('Sin embargo') ||
          sentence.includes('En conclusión')) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = "";
      }
    });
    
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
  }
  
  return paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// Genera metadata dinámica para cada destino
export async function generateMetadata({ params }) {
  const { id } = params;
  const snap = await getDoc(doc(db, "destinations", id));
  if (!snap.exists()) {
    return { title: "Destino no encontrado - VisitAtlántico" };
  }
  const d = snap.data();
  const title = `${d.name} – VisitAtlántico`;
  const description =
    d.tagline ||
    d.description?.slice(0, 150) ||
    "Explora este destino en Atlántico, Colombia.";

  let imageUrl = "";
  if (d.imagePath) {
    try {
      imageUrl = await getDownloadURL(
        ref(storage, d.imagePath.replace(/^\/+/, ""))
      );
    } catch {}
  }

  const url = `https://visitatlantico.com/destinations/${id}`;

  return {
    title,
    description,
    metadataBase: new URL("https://visitatlantico.com"),
    alternates: {
      canonical: url,
      languages: {
        es: url,
        en: `https://en.visitatlantico.com/destinations/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "VisitAtlántico",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: d.name }]
        : [],
      locale: "es_CO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

// Página de detalle de destino
export default async function DestinationDetail({ params }) {
  const { id } = params;
  const snap = await getDoc(doc(db, "destinations", id));
  if (!snap.exists()) {
    notFound();
    return null;
  }
  const d = snap.data();

  let imageUrl = "";
  if (d.imagePath) {
    try {
      imageUrl = await getDownloadURL(
        ref(storage, d.imagePath.replace(/^\/+/, ""))
      );
    } catch (e) {
      console.error("Error obteniendo imagen:", e);
    }
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    d.address
  )}`;
  
  const descriptionParagraphs = formatDescription(d.description);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: d.name,
            description: d.description,
            image: imageUrl,
            address: d.address,
            url: `https://visitatlantico.com/destinations/${id}`,
          }),
        }}
      />

      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section - Cinematográfico */}
        <div className="relative h-[75vh] sm:h-[80vh] w-full overflow-hidden">
          {imageUrl ? (
            <>
              {/* Background Image with Ken Burns effect via CSS */}
              <div 
                className="absolute inset-0 animate-ken-burns"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              
              {/* Vignette */}
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
                }}
              />
              
              {/* Film grain */}
              <div 
                className="absolute inset-0 z-10 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </>
          ) : (
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${COLORS.grisOscuro} 0%, #16213e 100%)`,
              }}
            />
          )}

          {/* Back Button */}
          <Link
            href="/destinations"
            className="absolute top-6 left-6 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/50 hover:text-white transition-all duration-300"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Destinos</span>
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
            <button className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/50 hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 hover:bg-white hover:text-red-500 transition-all">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end">
            <div className="max-w-6xl mx-auto w-full px-6 sm:px-8 lg:px-12 pb-12 sm:pb-16">
              {/* Categories */}
              {d.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {d.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}CC, ${COLORS.rojoCayena}CC)`,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight"
                style={{ 
                  fontFamily: "'Josefin Sans', sans-serif",
                  textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                }}
              >
                {d.name}
              </h1>

              {/* Tagline */}
              {d.tagline && (
                <p 
                  className="text-xl sm:text-2xl text-white/80 max-w-3xl leading-relaxed"
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  {d.tagline}
                </p>
              )}

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span 
                    className="text-sm text-white/90"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {d.address}
                  </span>
                </div>
                {d.openingTime && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                    <Clock className="w-4 h-4 text-white/70" />
                    <span 
                      className="text-sm text-white/90"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {d.openingTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2">
            <span 
              className="text-xs text-white/50 tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Scroll
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Content Section */}
        <main className="relative z-10 -mt-6 sm:-mt-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                  <header className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${COLORS.azulBarranquero}15` }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: COLORS.azulBarranquero }} />
                    </div>
                    <h2 
                      className="text-2xl font-bold text-slate-800"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Sobre este lugar
                    </h2>
                  </header>
                  <div className="p-6 sm:p-8">
                    <div className="prose prose-slate max-w-none">
                      {descriptionParagraphs.length > 0 ? (
                        descriptionParagraphs.map((paragraph, index) => (
                          <p 
                            key={index} 
                            className="text-slate-600 mb-5 last:mb-0 leading-relaxed text-base sm:text-lg"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p 
                          className="text-slate-600"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {d.description || "No hay descripción disponible."}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Gallery Section */}
                <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                  <header className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${COLORS.naranjaSalinas}15` }}
                      >
                        <Camera className="w-5 h-5" style={{ color: COLORS.naranjaSalinas }} />
                      </div>
                      <h2 
                        className="text-2xl font-bold text-slate-800"
                        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      >
                        Fotos y videos
                      </h2>
                    </div>
                    <button 
                      className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:gap-3"
                      style={{ 
                        color: COLORS.naranjaSalinas,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Ver galería
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </header>
                  <div className="p-6 sm:p-8">
                    <div className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer">
                      {imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt={d.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md"
                              style={{ background: `${COLORS.naranjaSalinas}CC` }}
                            >
                              <Camera className="w-7 h-7 text-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <span 
                            className="text-slate-400"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            Próximamente
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Info Card */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <header className="px-6 py-5 border-b border-slate-100">
                      <h2 
                        className="text-xl font-bold text-slate-800"
                        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      >
                        Información
                      </h2>
                    </header>
                    
                    <div className="divide-y divide-slate-100">
                      {/* Location */}
                      <div className="px-6 py-5 flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${COLORS.azulBarranquero}10` }}
                        >
                          <MapPin className="w-6 h-6" style={{ color: COLORS.azulBarranquero }} />
                        </div>
                        <div>
                          <p 
                            className="text-sm text-slate-500 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            Ubicación
                          </p>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline transition-colors"
                            style={{ 
                              color: COLORS.azulBarranquero,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            {d.address}
                          </a>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="px-6 py-5 flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${COLORS.verdeBijao}10` }}
                        >
                          <Clock className="w-6 h-6" style={{ color: COLORS.verdeBijao }} />
                        </div>
                        <div>
                          <p 
                            className="text-sm text-slate-500 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            Horario
                          </p>
                          <p 
                            className="font-medium text-slate-800"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {d.openingTime || "Todos los días, 9:00 – 18:00"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="p-6 pt-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.naranjaSalinas}, ${COLORS.rojoCayena})`,
                          boxShadow: `0 8px 25px -5px ${COLORS.naranjaSalinas}50`,
                          fontFamily: "'Josefin Sans', sans-serif",
                        }}
                      >
                        <Navigation className="w-5 h-5" />
                        Cómo llegar
                      </a>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                    <h3 
                      className="text-lg font-bold text-slate-800 mb-4"
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                    >
                      Planifica tu visita
                    </h3>
                    <div className="space-y-3">
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <CalendarDays className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-700">Agregar al itinerario</span>
                      </button>
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <Heart className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-700">Guardar en favoritos</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </>
  );
}