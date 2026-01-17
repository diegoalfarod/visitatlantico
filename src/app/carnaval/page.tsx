import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";
import { Home, Map, Calendar, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Carnaval de Barranquilla 2026 | Guía Completa y Fechas",
  description:
    "Carnaval de Barranquilla 2026 del 14 al 17 de febrero. Segundo carnaval más grande del mundo, Patrimonio UNESCO. Batalla de Flores, Guacherna, Gran Parada. Guía completa con fechas, eventos, hoteles y consejos.",
  keywords: [
    "carnaval de barranquilla 2026",
    "carnaval barranquilla fechas",
    "batalla de flores barranquilla",
    "guacherna barranquilla",
    "carnaval unesco",
    "second largest carnival world",
    "barranquilla carnival tickets",
    "eventos carnaval barranquilla",
    "palcos batalla de flores",
    "hoteles carnaval barranquilla",
  ],
  openGraph: {
    title: "Carnaval de Barranquilla 2026 | 14-17 Febrero",
    description:
      "Segundo carnaval más grande del mundo. Patrimonio Cultural Inmaterial de la Humanidad UNESCO. Vive 4 días de cultura, música y tradición caribeña.",
    images: [
      {
        url: "/images/carnaval-batalla-flores-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Carnaval de Barranquilla 2026 - Batalla de Flores",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/carnaval",
    languages: {
      "es-CO": "/es/carnaval",
      "en-US": "/en/carnival",
    },
  },
};

export default function CarnavalPage() {
  return (
    <ComingSoon
      pageName="Carnaval de Barranquilla 2026"
      description="Estamos preparando una guía completa del Carnaval de Barranquilla 2026, el segundo carnaval más grande del mundo y Patrimonio UNESCO. Muy pronto encontrarás fechas, eventos, consejos de alojamiento, historia y todo lo que necesitas para vivir la fiesta más grande de Colombia."
      estimatedDate="Enero 2026"
      relatedLinks={[
        { href: "/", label: "Volver al inicio", icon: Home },
        { href: "/destinations", label: "Explorar destinos", icon: Map },
        { href: "/eventos", label: "Ver eventos", icon: Calendar },
        { href: "/playas", label: "Conocer las playas", icon: Waves },
      ]}
    />
  );
}
