import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Playas del Atlántico Colombia | Guía Completa 2026",
  description:
    "Descubre las mejores playas del Atlántico Colombia: Salinas del Rey Blue Flag, Puerto Velero para kitesurf, Playa Mendoza. Guía completa con cómo llegar, qué hacer, mejor época para visitar y más.",
  keywords: [
    "playas atlántico colombia",
    "playas barranquilla",
    "salinas del rey blue flag",
    "puerto velero kitesurf",
    "playa mendoza",
    "mejores playas caribe colombiano",
    "playas cerca barranquilla",
  ],
  openGraph: {
    title: "Playas del Atlántico | Caribe Colombiano",
    description:
      "Playas Blue Flag, kitesurf y paraísos caribeños a minutos de Barranquilla. Descubre Salinas del Rey, Puerto Velero y más.",
    images: [
      {
        url: "/images/playas-atlantico-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Playas del Atlántico Colombia",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/playas",
    languages: {
      "es-CO": "/es/playas",
      "en-US": "/en/beaches",
    },
  },
};

export default function PlayasPage() {
  return (
    <ComingSoon
      pageName="Playas del Atlántico"
      description="Estamos preparando una guía completa de las mejores playas del Caribe colombiano. Muy pronto encontrarás información detallada sobre Salinas del Rey Blue Flag, Puerto Velero (paraíso del kitesurf), Playa Mendoza, cómo llegar, mejor época para visitar, deportes acuáticos y gastronomía costera."
      estimatedDate="Febrero 2026"
      relatedLinks={[
        { href: "/", label: "Volver al inicio", icon: "home" },
        { href: "/destinations", label: "Explorar destinos", icon: "map" },
        { href: "/eventos", label: "Ver eventos", icon: "calendar" },
        { href: "/ruta23", label: "Ruta gastronómica", icon: "utensils" },
      ]}
    />
  );
}
