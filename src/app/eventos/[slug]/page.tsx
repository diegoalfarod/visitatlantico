import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getRelatedEvents, getAllEvents } from "@/services/eventsService";
import EventPageClient from "./EventPageClient";

// =============================================================================
// STATIC PARAMS - Generate static pages for all events
// =============================================================================

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({
    slug: event.slug,
  }));
}

// =============================================================================
// METADATA
// =============================================================================

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  
  if (!event) {
    return {
      title: "Evento no encontrado | VisitAtlántico",
    };
  }
  
  return {
    title: `${event.title} | Eventos | VisitAtlántico`,
    description: event.description || event.subtitle,
    openGraph: {
      title: event.title,
      description: event.description || event.subtitle,
      images: [event.image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description || event.subtitle,
      images: [event.image],
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function EventPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  
  if (!event) {
    notFound();
  }
  
  const relatedEvents = await getRelatedEvents(event, 3);
  
  return <EventPageClient event={event} relatedEvents={relatedEvents} />;
}