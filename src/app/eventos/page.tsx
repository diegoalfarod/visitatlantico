import { Metadata } from "next";
import { getAllEvents } from "@/services/eventsService";
import EventsPageClient from "./EventsPageClient";

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: "Eventos y Festivales del Atlántico 2025 | Agenda Cultural Completa",
  description: "Descubre todos los eventos del Atlántico Colombia: Carnaval de Barranquilla 2026, festivales gastronómicos, eventos culturales, tradiciones. Agenda actualizada con fechas, lugares y actividades.",
  keywords: [
    "eventos atlántico colombia",
    "agenda cultural barranquilla",
    "festivales del atlántico",
    "eventos barranquilla 2025",
    "carnaval de barranquilla 2026",
    "festivales gastronómicos colombia",
    "eventos culturales caribe",
    "qué hacer en barranquilla",
  ],
  openGraph: {
    title: "Eventos y Festivales del Atlántico 2025 | Agenda Cultural",
    description: "🎉 Carnaval de Barranquilla | 🎭 Festivales | 🎨 Eventos Culturales. Agenda completa actualizada del Atlántico Colombia.",
    images: [
      {
        url: "/images/eventos-atlantico-og.jpg",
        width: 1200,
        height: 630,
        alt: "Eventos y Festivales del Atlántico Colombia",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos del Atlántico 2025 | Agenda Cultural",
    description: "Descubre el Carnaval, festivales y eventos culturales del Atlántico Colombia.",
  },
  alternates: {
    canonical: "/eventos",
    languages: {
      "es-CO": "/es/eventos",
      "en-US": "/en/events",
    },
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function EventsPage() {
  const events = await getAllEvents();
  
  return <EventsPageClient initialEvents={events} />;
}