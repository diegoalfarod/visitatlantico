"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import RoutePage from "@/components/pages/RoutePage";
import { getRouteBySlug } from "@/data/routes-data";

interface RoutePageClientProps {
  slug: string;
}

export default function RoutePageClient({ slug }: RoutePageClientProps) {
  // Buscar la ruta en el cliente para evitar problemas de serialización
  const route = useMemo(() => getRouteBySlug(slug), [slug]);
  
  if (!route) {
    notFound();
  }
  
  return <RoutePage route={route} />;
}