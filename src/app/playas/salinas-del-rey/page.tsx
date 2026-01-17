import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title:
    "Salinas del Rey Blue Flag | Primera Playa Deportiva Certificada de América",
  description:
    "Salinas del Rey recibe la certificación Blue Flag en diciembre 2024, convirtiéndose en la primera playa deportiva de América con esta distinción. Ubicada en Puerto Colombia, Atlántico. Deportes acuáticos, kitesurf, windsurf y aguas cristalinas.",
  keywords: [
    "salinas del rey blue flag",
    "salinas del rey puerto colombia",
    "primera playa blue flag colombia",
    "playa deportiva blue flag américa",
    "playas con bandera azul colombia",
    "certificación blue flag diciembre 2024",
    "playas puerto colombia",
    "kitesurf salinas del rey",
    "mejores playas atlántico colombia",
  ],
  openGraph: {
    title: "Salinas del Rey Blue Flag | Primera en América",
    description:
      "Primera playa deportiva de América con certificación Blue Flag. Aguas cristalinas, deportes acuáticos y calidad ambiental garantizada.",
    images: [
      {
        url: "/images/salinas-blue-flag.jpg",
        width: 1200,
        height: 630,
        alt: "Salinas del Rey - Primera Playa Blue Flag de América",
      },
    ],
    type: "article",
  },
  alternates: {
    canonical: "/playas/salinas-del-rey",
    languages: {
      "es-CO": "/es/playas/salinas-del-rey",
      "en-US": "/en/beaches/salinas-del-rey",
    },
  },
};

export default function SalinasDelReyPage() {
  return (
    <ComingSoon
      pageName="Salinas del Rey Blue Flag"
      description="Estamos preparando una guía completa de Salinas del Rey, la primera playa deportiva de América con certificación Blue Flag. Muy pronto encontrarás información sobre deportes acuáticos, cómo llegar, escuelas de kitesurf, servicios y todo lo que necesitas para disfrutar de esta joya del Caribe colombiano."
      estimatedDate="Febrero 2026"
      relatedLinks={[
        { href: "/", label: "Volver al inicio", icon: "home" },
        { href: "/playas", label: "Ver todas las playas", icon: "waves" },
        { href: "/destinations", label: "Explorar destinos", icon: "map" },
        { href: "/eventos", label: "Ver eventos", icon: "calendar" },
      ]}
    />
  );
}
