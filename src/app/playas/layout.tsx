import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playas del Atlántico Colombia | Guía Completa 2026",
  description:
    "Descubre las mejores playas del Atlántico: Salinas del Rey (Blue Flag), Puerto Velero (kitesurf), Puerto Colombia, Playa Mendoza. Guía completa con fotos, cómo llegar, qué hacer y mejor época para visitar.",
  keywords: [
    "playas del atlántico colombia",
    "mejores playas barranquilla",
    "playas puerto colombia",
    "puerto velero kitesurf",
    "salinas del rey blue flag",
    "playas cerca de barranquilla",
    "playa mendoza atlántico",
    "playas caribe colombiano",
    "turismo de sol y playa atlántico",
  ],
  openGraph: {
    title: "Playas del Atlántico Colombia | Guía Completa 2026",
    description:
      "🏖️ Salinas del Rey Blue Flag | 🪁 Puerto Velero Kitesurf | 🌊 Playas Caribeñas del Atlántico. Aguas cristalinas, deportes acuáticos y naturaleza.",
    images: [
      {
        url: "/images/og-image-playas.jpg",
        width: 1200,
        height: 630,
        alt: "Playas del Atlántico Colombia - Caribe Colombiano",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/playas",
    languages: {
      "es-CO": "/es/playas",
      "en-US": "/en/beaches",
    },
  },
};

export default function PlayasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
