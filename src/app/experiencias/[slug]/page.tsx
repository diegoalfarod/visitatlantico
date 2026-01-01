// src/app/experiencias/[slug]/page.tsx
"use client";

import ItineraryDetailPage from "@/components/ItineraryDetailPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;
  
  return <ItineraryDetailPage slug={slug} />;
}