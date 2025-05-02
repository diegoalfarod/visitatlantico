import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";

// Importamos dinámicamente el componente de cliente,
// deshabilitando SSR para él.
const DestinationsClient = dynamic(
  () => import("./DestinationsClient.jsx"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<p className="p-6 text-center">Cargando destinos…</p>}>
        <DestinationsClient />
      </Suspense>
      <InstagramFeed />
      <Footer />
    </>
  );
}
