/**
 * Schema.org Organization Markup
 * Mejora la apariencia de VisitAtlántico en resultados de búsqueda de Google
 * y proporciona información estructurada sobre la organización
 */

export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    "@id": "https://visitatlantico.com/#organization",
    name: "VisitAtlántico",
    alternateName: "Visit Atlántico Colombia",
    url: "https://visitatlantico.com",
    logo: {
      "@type": "ImageObject",
      url: "https://visitatlantico.com/images/logo.png",
      width: 512,
      height: 512,
    },
    image: {
      "@type": "ImageObject",
      url: "https://visitatlantico.com/images/og-image-main.jpg",
      width: 1200,
      height: 630,
    },
    description:
      "Portal oficial de turismo del departamento del Atlántico, Colombia. Información completa sobre el Carnaval de Barranquilla, playas Blue Flag, gastronomía caribeña, eventos culturales y atractivos turísticos de los 17 municipios.",
    slogan: "Descubre el Caribe Colombiano",

    // Ubicación
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barranquilla",
      addressRegion: "Atlántico",
      addressCountry: "CO",
    },

    // Área de servicio
    areaServed: {
      "@type": "State",
      name: "Atlántico",
      "@id": "https://www.wikidata.org/wiki/Q245249",
    },

    // Redes sociales
    sameAs: [
      "https://www.facebook.com/visitatlantico",
      "https://www.instagram.com/visitatlantico",
      "https://twitter.com/visitatlantico",
      "https://www.youtube.com/@visitatlantico",
      "https://www.tiktok.com/@visitatlantico",
    ],

    // Información de contacto
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Información Turística",
        telephone: "+57-300-000-0000",
        email: "info@visitatlantico.com",
        availableLanguage: ["Spanish", "English"],
        areaServed: "CO",
      },
    ],

    // Servicios ofrecidos
    knowsAbout: [
      "Carnaval de Barranquilla",
      "Turismo en Atlántico Colombia",
      "Playas del Caribe Colombiano",
      "Gastronomía Caribeña",
      "Cultura Caribeña",
      "Ecoturismo en Colombia",
      "Eventos culturales Colombia",
    ],

    // Puntos de interés turístico
    touristAttraction: [
      {
        "@type": "TouristAttraction",
        name: "Carnaval de Barranquilla",
        description: "Segundo carnaval más grande del mundo, Patrimonio Cultural de la Humanidad UNESCO",
        url: "https://visitatlantico.com/carnaval",
      },
      {
        "@type": "Beach",
        name: "Salinas del Rey",
        description: "Primera playa deportiva de América con certificación Blue Flag",
        url: "https://visitatlantico.com/playas/salinas-del-rey",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

/**
 * WebSite Schema - Para el sitelinks searchbox de Google
 * Permite búsquedas directas desde Google
 */
export function WebSiteSchema() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://visitatlantico.com/#website",
    url: "https://visitatlantico.com",
    name: "VisitAtlántico",
    description:
      "Portal oficial de turismo del Atlántico, Colombia. Descubre el Carnaval de Barranquilla, playas Blue Flag y gastronomía caribeña.",
    publisher: {
      "@id": "https://visitatlantico.com/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://visitatlantico.com/buscar?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["es-CO", "en-US"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}

/**
 * BreadcrumbList Schema - Para breadcrumbs en Google
 * Mejora la navegación en resultados de búsqueda
 */
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
}
