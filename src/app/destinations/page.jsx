// src/app/destinations/page.jsx
"use client";
export const dynamic = "force-dynamic";

import dynamicLoad from "next/dynamic";           // Renombrada para no chocar
import Navbar from "@/components/Navbar";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";

// Import dinámico del cliente sin SSR
const DestinationsClient = dynamicLoad(
  () => import("./DestinationsClient.jsx"),
  { ssr: false }
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
