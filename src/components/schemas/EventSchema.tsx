/**
 * Schema.org para eventos
 * Especialmente importante para el Carnaval de Barranquilla
 */

interface Evento {
  nombre: string;
  descripcion: string;
  fechaInicio: string; // ISO 8601 format: "2026-02-14"
  fechaFin: string;
  imagen: string;
  ubicacion: {
    nombre: string;
    direccion?: string;
    municipio: string;
  };
  organizador?: {
    nombre: string;
    url?: string;
  };
  precio?: {
    minimo: number;
    maximo?: number;
    moneda: string;
  };
  url?: string;
}

export function EventSchema({ evento }: { evento: Evento }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.nombre,
    description: evento.descripcion,
    startDate: evento.fechaInicio,
    endDate: evento.fechaFin,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: evento.ubicacion.nombre,
      address: {
        "@type": "PostalAddress",
        ...(evento.ubicacion.direccion && {
          streetAddress: evento.ubicacion.direccion,
        }),
        addressLocality: evento.ubicacion.municipio,
        addressRegion: "Atlántico",
        addressCountry: "CO",
      },
    },
    image: evento.imagen,
    ...(evento.organizador && {
      organizer: {
        "@type": "Organization",
        name: evento.organizador.nombre,
        ...(evento.organizador.url && { url: evento.organizador.url }),
      },
    }),
    ...(evento.precio && {
      offers: {
        "@type": "AggregateOffer",
        lowPrice: evento.precio.minimo,
        ...(evento.precio.maximo && { highPrice: evento.precio.maximo }),
        priceCurrency: evento.precio.moneda,
      },
    }),
    ...(evento.url && { url: evento.url }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Schema específico para el Carnaval de Barranquilla 2026
 */
export function CarnavalEventSchema() {
  const evento: Evento = {
    nombre: "Carnaval de Barranquilla 2026",
    descripcion:
      "Segundo carnaval más grande del mundo. Patrimonio Cultural Inmaterial de la Humanidad UNESCO. Celebración de 4 días con desfiles, música, danzas tradicionales y cultura caribeña.",
    fechaInicio: "2026-02-14",
    fechaFin: "2026-02-17",
    imagen: "https://visitatlantico.com/images/carnaval-2026.jpg",
    ubicacion: {
      nombre: "Barranquilla",
      municipio: "Barranquilla",
    },
    organizador: {
      nombre: "Fundación Carnaval de Barranquilla",
      url: "https://carnavaldebarranquilla.org",
    },
  };

  return <EventSchema evento={evento} />;
}
