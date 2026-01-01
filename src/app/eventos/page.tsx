import { Metadata } from "next";
import { getAllEvents } from "@/services/eventsService";
import EventsPageClient from "./EventsPageClient";

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: "Eventos | VisitAtlántico - Agenda Cultural del Atlántico",
  description: "Descubre todos los eventos, festivales y celebraciones del departamento del Atlántico. Carnaval de Barranquilla, festivales gastronómicos, eventos culturales y más.",
  openGraph: {
    title: "Eventos | VisitAtlántico",
    description: "Agenda completa de eventos del Atlántico: Carnaval, festivales, cultura y tradición.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos | VisitAtlántico",
    description: "Agenda completa de eventos del Atlántico: Carnaval, festivales, cultura y tradición.",
  },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function EventsPage() {
  const events = await getAllEvents();
  
  return <EventsPageClient initialEvents={events} />;
}