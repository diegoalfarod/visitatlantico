/**
 * Schema.org para restaurantes y gastronomía
 * Importante para la Ruta de la Butifarra y restaurantes destacados
 */

interface Restaurante {
  nombre: string;
  descripcion: string;
  imagen: string;
  municipio: string;
  direccion?: string;
  telefono?: string;
  sitioWeb?: string;
  horario?: {
    abre: string;
    cierra: string;
  };
  tipoCocina?: string[];
  rangoPrecios?: string; // "$", "$$", "$$$", "$$$$"
  calificacion?: {
    valor: number; // 1-5
    total: number;
  };
  latitud?: number;
  longitud?: number;
}

export function RestaurantSchema({
  restaurante,
}: {
  restaurante: Restaurante;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurante.nombre,
    description: restaurante.descripcion,
    image: restaurante.imagen,
    address: {
      "@type": "PostalAddress",
      ...(restaurante.direccion && { streetAddress: restaurante.direccion }),
      addressLocality: restaurante.municipio,
      addressRegion: "Atlántico",
      addressCountry: "CO",
    },
    ...(restaurante.telefono && { telephone: restaurante.telefono }),
    ...(restaurante.sitioWeb && { url: restaurante.sitioWeb }),
    ...(restaurante.tipoCocina && { servesCuisine: restaurante.tipoCocina }),
    ...(restaurante.rangoPrecios && { priceRange: restaurante.rangoPrecios }),
    ...(restaurante.horario && {
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        opens: restaurante.horario.abre,
        closes: restaurante.horario.cierra,
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    }),
    ...(restaurante.calificacion && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: restaurante.calificacion.valor,
        reviewCount: restaurante.calificacion.total,
      },
    }),
    ...(restaurante.latitud &&
      restaurante.longitud && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: restaurante.latitud,
          longitude: restaurante.longitud,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
