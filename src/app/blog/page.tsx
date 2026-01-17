import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import { Home, Map, Calendar, Utensils } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog de Turismo del Atlántico | Guías y Consejos de Viaje",
  description:
    "Descubre guías de viaje, consejos de turismo y curiosidades sobre el Atlántico Colombia. Carnaval, playas, gastronomía, eventos y más. Blog oficial de VisitAtlántico.",
  keywords: [
    "blog turismo atlántico",
    "guías de viaje barranquilla",
    "consejos turismo colombia",
    "qué hacer en barranquilla",
    "turismo caribe colombiano",
  ],
  openGraph: {
    title: "Blog VisitAtlántico | Guías y Consejos de Viaje",
    description:
      "Guías de viaje, tips de turismo y curiosidades del Caribe colombiano. Descubre el Atlántico con nosotros.",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
    languages: {
      "es-CO": "/es/blog",
      "en-US": "/en/blog",
    },
  },
};

export default function BlogPage() {
  return (
    <ComingSoon
      pageName="Blog de Turismo"
      description="Estamos preparando contenido exclusivo con guías de viaje, consejos prácticos y las mejores recomendaciones para descubrir el Atlántico. Muy pronto encontrarás artículos sobre playas, gastronomía, cultura y mucho más."
      estimatedDate="Febrero 2026"
      relatedLinks={[
        { href: "/", label: "Volver al inicio", icon: Home },
        { href: "/destinations", label: "Explorar destinos", icon: Map },
        { href: "/eventos", label: "Ver eventos", icon: Calendar },
        { href: "/ruta23", label: "Ruta gastronómica", icon: Utensils },
      ]}
    />
  );
}
