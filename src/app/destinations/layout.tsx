import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinos Turísticos del Atlántico Colombia | 23 Municipios para Visitar",
  description:
    "Explora los 23 municipios del Atlántico Colombia: Barranquilla, Puerto Colombia, Usiacurí, Tubará. Descubre playas, pueblos coloniales, ecoturismo y gastronomía del Caribe colombiano.",
  keywords: [
    "destinos atlántico colombia",
    "turismo barranquilla",
    "pueblos del atlántico",
    "qué visitar en barranquilla",
    "municipios del atlántico",
    "turismo caribe colombiano",
    "destinos cerca de barranquilla",
    "pueblos coloniales colombia",
  ],
  openGraph: {
    title: "Destinos Turísticos del Atlántico | 23 Municipios del Caribe",
    description:
      "🏖️ Playas | 🏛️ Pueblos Coloniales | 🌿 Ecoturismo | 🍽️ Gastronomía. Descubre los tesoros del Atlántico Colombia.",
    images: [
      {
        url: "/images/destinations-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Destinos Turísticos del Atlántico Colombia",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/destinations",
    languages: {
      "es-CO": "/es/destinations",
      "en-US": "/en/destinations",
    },
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
