// src/app/page.tsx

import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import QuickFilters from "@/components/QuickFilters";
import FeaturedExperiences from "@/components/FeaturedExperiences";
import EventsMapPreview from "@/components/EventsMapPreview";
import SustainabilityBanner from "@/components/SustainabilityBanner";
import DestinationsPreview from "@/components/DestinationsPreview";
import ItineraryBanner from "@/components/ItineraryBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";  // Import directo de tu componente cliente



export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        <HeroCarousel />
        <QuickFilters />
        <FeaturedExperiences />
        <EventsMapPreview />
        <SustainabilityBanner />
        <DestinationsPreview />

        {/* Banner de Itinerario Inteligente con IA */}
        <ItineraryBanner />

        {/* Feed de Instagram */}
        <InstagramFeed />
      </main>

      <Footer />

      {/* Chatbot flotante */}
      <ChatBot />
    </>
  );
}
