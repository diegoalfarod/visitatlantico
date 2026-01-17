/**
 * Schema.org para atracciones turísticas
 * Mejora el SEO y la visibilidad en Google Search
 */

interface Atraccion {
  nombre: string;
  descripcion: string;
  imagen: string;
  municipio: string;
  latitud?: number;
  longitud?: number;
  tiposTurismo?: string[];
  esGratis?: boolean;
  horario?: {
    abre: string;
    cierra: string;
  };
  telefono?: string;
  sitioWeb?: string;
}

export function TouristAttractionSchema({
  atraccion,
}: {
  atraccion: Atraccion;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: atraccion.nombre,
    description: atraccion.descripcion,
    image: atraccion.imagen,
    address: {
      "@type": "PostalAddress",
      addressLocality: atraccion.municipio,
      addressRegion: "Atlántico",
      addressCountry: "CO",
    },
    ...(atraccion.latitud &&
      atraccion.longitud && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: atraccion.latitud,
          longitude: atraccion.longitud,
        },
      }),
    ...(atraccion.tiposTurismo && {
      touristType: {
        "@type": "Audience",
        audienceType: atraccion.tiposTurismo,
      },
    }),
    availableLanguage: ["Spanish", "English"],
    isAccessibleForFree: atraccion.esGratis ?? true,
    ...(atraccion.horario && {
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        opens: atraccion.horario.abre,
        closes: atraccion.horario.cierra,
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
    ...(atraccion.telefono && { telephone: atraccion.telefono }),
    ...(atraccion.sitioWeb && { url: atraccion.sitioWeb }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
