import { notFound } from "next/navigation";
import { Metadata } from "next";
import { allRoutes, getRouteBySlug } from "@/data/routes-data";
import RoutePageClient from "./RoutePageClient";

// =============================================================================
// TIPOS
// =============================================================================

interface RoutePageProps {
  params: {
    slug: string;
  };
}

// =============================================================================
// GENERACIÓN ESTÁTICA
// =============================================================================

export async function generateStaticParams() {
  return allRoutes.map((route) => ({
    slug: route.slug,
  }));
}

// =============================================================================
// METADATA DINÁMICA
// =============================================================================

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const route = getRouteBySlug(params.slug);
  
  if (!route) {
    return {
      title: "Ruta no encontrada | VisitAtlántico",
    };
  }
  
  return {
    title: `${route.title} | Rutas Turísticas | VisitAtlántico`,
    description: route.description,
    openGraph: {
      title: `${route.title} - ${route.tagline}`,
      description: route.description,
      images: [route.image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.tagline,
      images: [route.image],
    },
  };
}

// =============================================================================
// PÁGINA - Server Component
// =============================================================================

export default function Page({ params }: RoutePageProps) {
  const route = getRouteBySlug(params.slug);
  
  if (!route) {
    notFound();
  }
  
  // Solo pasamos el slug al Client Component
  // El Client Component buscará la ruta internamente
  return <RoutePageClient slug={params.slug} />;
}