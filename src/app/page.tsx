// src/app/page.tsx
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import QuickFilters from "@/components/QuickFilters";
import InstitutionalDivider from "@/components/InstitutionalDivider"; // << nuevo import
import FeaturedExperiences from "@/components/FeaturedExperiences";
import SustainabilityBanner from "@/components/SustainabilityBanner";
import ItineraryBanner from "@/components/ItineraryBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import GeminiWidget from '@/components/gemini/GeminiWidget';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        <HeroCarousel />
        <QuickFilters />

        {/* Divider decorativo institucional */}
        <InstitutionalDivider />
        <FeaturedExperiences />
        <SustainabilityBanner />
        <ItineraryBanner />
        <InstagramFeed />
      </main>
      <Footer />
      <GeminiWidget />
    </>
  );
}
