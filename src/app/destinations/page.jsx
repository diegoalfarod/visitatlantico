"use client";
export const dynamic = "force-dynamic";   // ← se mantiene

import dynamicLoad from "next/dynamic";   // ← alias para evitar conflicto
import Navbar from "@/components/Navbar";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";

/* carga del componente cliente sin SSR */
const DestinationsClient = dynamicLoad(
  () => import("./DestinationsClient.jsx"),
  { ssr: false },
);

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <DestinationsClient />
      <InstagramFeed />
      <Footer />
    </>
  );
}
