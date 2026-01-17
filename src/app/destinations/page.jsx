"use client";
export const dynamic = "force-dynamic";

import dynamicLoad from "next/dynamic";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/schemas/FAQSchema";
import RelatedContent from "@/components/RelatedContent";

/* Carga del componente cliente sin SSR */
const DestinationsClient = dynamicLoad(
  () => import("./DestinationsClient.jsx"),
  { 
    ssr: false,
    loading: () => <DestinationsLoadingSkeleton />,
  },
);

// =============================================================================
// Loading Skeleton
// =============================================================================
function DestinationsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Skeleton */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: '#0f0f1a',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
          <div className="animate-pulse">
            {/* Back link skeleton */}
            <div className="h-4 w-16 rounded bg-white/10 mb-12" />
            
            {/* Badge skeleton */}
            <div className="h-10 w-56 rounded-full bg-white/10 mb-8" />
            
            {/* Title skeleton */}
            <div className="h-16 w-96 max-w-full rounded-xl bg-white/10 mb-6" />
            
            {/* Description skeleton */}
            <div className="space-y-3 mb-12">
              <div className="h-5 w-full max-w-2xl rounded bg-white/10" />
              <div className="h-5 w-3/4 max-w-xl rounded bg-white/10" />
            </div>
            
            {/* Stats skeleton */}
            <div className="flex gap-10">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-10 w-16 rounded bg-white/10 mb-2" />
                  <div className="h-4 w-20 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-4 animate-pulse">
            {/* Search skeleton */}
            <div className="h-12 flex-1 max-w-md rounded-xl bg-slate-100" />
            
            {/* Filter chips skeleton */}
            <div className="hidden lg:flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-10 rounded-full bg-slate-100"
                  style={{ width: `${90 + Math.random() * 30}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Featured skeleton */}
        <div className="mb-16 animate-pulse">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="h-6 w-40 rounded bg-slate-200" />
          </div>
          <div className="rounded-3xl bg-slate-200 h-[420px]" />
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5">
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FAQ Data
// =============================================================================
const destinationsFAQs = [
  {
    question: "¿Cuáles son los mejores destinos del Atlántico Colombia?",
    answer:
      "Los destinos más populares del Atlántico incluyen:<br/><br/><strong>🏖️ Playas:</strong> Puerto Colombia (Salinas del Rey Blue Flag), Puerto Velero (kitesurf), Playa Mendoza.<br/><strong>🏛️ Pueblos Coloniales:</strong> Usiacurí (artesanías en iraca), Tubará (arquitectura colonial), Suan (gastronomía).<br/><strong>🌿 Ecoturismo:</strong> Piedra Pintada en Luruaco, Ciénaga de Mallorquín, Embalse del Guájaro.<br/><strong>🎭 Cultura:</strong> Barranquilla (Carnaval, museos), Puerto Colombia (Muelle histórico).<br/><br/>Cada municipio ofrece experiencias únicas de playas, cultura, naturaleza y gastronomía caribeña.",
  },
  {
    question: "¿Cómo llegar desde Barranquilla a los municipios del Atlántico?",
    answer:
      "<strong>En Bus/Buseta:</strong><br/>• Terminal Metropolitana de Barranquilla: rutas a todos los municipios<br/>• Precio promedio: $5,000 - $15,000 COP según distancia<br/>• Frecuencia: cada 15-30 minutos a destinos principales<br/><br/><strong>En Carro:</strong><br/>• Playas (Puerto Colombia, Salinas): 20-30 min por Vía al Mar<br/>• Pueblos del sur (Usiacurí, Tubará): 30-45 min<br/>• Zona norte: 45-60 min por Troncal del Caribe<br/><br/><strong>Tours organizados:</strong> Disponibles para rutas gastronómicas y ecoturismo con transporte incluido.",
  },
  {
    question: "¿Qué hacer en un día en los municipios del Atlántico?",
    answer:
      "<strong>Ruta de Playas (1 día):</strong><br/>• Mañana: Desayuno en Puerto Colombia + Muelle 1888<br/>• Mediodía: Playa en Salinas del Rey o Puerto Velero<br/>• Tarde: Atardecer en Castillo de Salgar<br/><br/><strong>Ruta Cultural (1 día):</strong><br/>• Mañana: Usiacurí (artesanías, taller de sombreros vueltiaos)<br/>• Mediodía: Almuerzo típico en Tubará<br/>• Tarde: Suan (dulces artesanales) + Galapa<br/><br/><strong>Ruta Natural (1 día):</strong><br/>• Mañana: Piedra Pintada en Luruaco (senderismo)<br/>• Mediodía: Almuerzo en Repelón<br/>• Tarde: Embalse del Guájaro (avistamiento de aves)",
  },
  {
    question: "¿Cuál es la mejor época para visitar el Atlántico?",
    answer:
      "<strong>Temporada seca (Dic-Marzo):</strong><br/>• Clima perfecto para playas (28-32°C)<br/>• Carnaval de Barranquilla en febrero<br/>• Temporada alta: más turistas, precios más altos<br/><br/><strong>Temporada media (Jun-Ago):</strong><br/>• Festivales gastronómicos en municipios<br/>• Menos turistas, precios moderados<br/>• Buen clima con lluvias ocasionales<br/><br/><strong>Temporada baja (Sep-Nov):</strong><br/>• Precios más económicos<br/>• Lluvias por las tardes<br/>• Ideal para ecoturismo<br/><br/><strong>Tip:</strong> El Atlántico es destino de sol todo el año. Cualquier época es buena para visitar.",
  },
  {
    question: "¿Dónde comer comida típica del Atlántico?",
    answer:
      "La gastronomía del Atlántico es rica y variada:<br/><br/><strong>Platos típicos por municipio:</strong><br/>• <strong>Juan de Acosta:</strong> Bollo limpio, queso costeño<br/>• <strong>Luruaco:</strong> Dulce de mango, conservas<br/>• <strong>Suan:</strong> Dulce de coco, enyucados<br/>• <strong>Sabanagrande:</strong> Sancocho de guandú<br/>• <strong>Palmar de Varela:</strong> Chicharrón<br/>• <strong>Soledad:</strong> Butifarra<br/><br/><strong>Ruta 23 Gastronómica:</strong> Recorre 18 festivales gastronómicos en diferentes municipios durante todo el año.<br/><br/>Encuentra restaurantes locales en plazas de mercado y centros de cada municipio para experiencias auténticas.",
  },
];

// =============================================================================
// Main Page Component
// =============================================================================
export default function DestinationsPage() {
  return (
    <>
      {/* Schema.org FAQ */}
      <FAQSchema faqs={destinationsFAQs} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: "Destinos", url: "https://visitatlantico.com/destinations" },
        ]}
      />

      <main>
        <DestinationsClient />

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
            <FAQ faqs={destinationsFAQs} />
          </div>
        </section>
      </main>

      {/* Related Content */}
      <RelatedContent
        title="Planea tu viaje al Atlántico"
        items={[
          {
            title: "Carnaval de Barranquilla 2026",
            description:
              "El segundo carnaval más grande del mundo. 4 días de fiesta, tradición y cultura caribeña.",
            url: "/carnaval",
            image: "/images/carnaval-batalla-flores.jpg",
            category: "Eventos",
          },
          {
            title: "Playas del Atlántico",
            description:
              "Descubre playas Blue Flag, kitesurf en Puerto Velero y paraísos del Caribe colombiano.",
            url: "/playas",
            image: "/images/playas-atlantico-hero.jpg",
            category: "Naturaleza",
          },
          {
            title: "Ruta 23 Gastronómica",
            description:
              "18 festivales gastronómicos que celebran los sabores auténticos del Atlántico.",
            url: "/ruta23",
            image:
              "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
            category: "Gastronomía",
          },
        ]}
      />

      <InstagramFeed />
      <Footer />
    </>
  );
}