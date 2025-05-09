import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import QuickFilters from "@/components/QuickFilters";
import FeaturedExperiences from "@/components/FeaturedExperiences";
import DestinationsPreview from "@/components/DestinationsPreview";  // ahora sí se usa
import EventsMapPreview from "@/components/EventsMapPreview";
import SustainabilityBanner from "@/components/SustainabilityBanner";
import ItineraryBanner from "@/components/ItineraryBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        <HeroCarousel />
        <QuickFilters />
        <FeaturedExperiences />
        {/* ---- nuevo bloque para evitar unused import ---- */}
        <DestinationsPreview />
        {/* ------------------------------------------------- */}
        <EventsMapPreview />
        <SustainabilityBanner />
        <ItineraryBanner />
        <InstagramFeed />
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
