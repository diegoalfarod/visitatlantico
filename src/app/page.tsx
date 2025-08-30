// src/app/page.tsx
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import QuickFilters from "@/components/QuickFilters";
import InstitutionalDivider from "@/components/InstitutionalDivider";
import SustainabilityBanner from "@/components/SustainabilityBanner";
import ItineraryBanner from "@/components/ItineraryBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        <HeroCarousel />
       
        <QuickFilters />

        {/* Divider decorativo institucional */}
        <InstitutionalDivider />
        <ItineraryBanner />
        <SustainabilityBanner />
        <InstagramFeed />
      </main>
      <Footer />
      {/* GeminiWidget se renderiza desde layout.tsx, no es necesario aquí */}
    </>
  );
}