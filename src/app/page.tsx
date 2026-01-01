// src/app/page.tsx
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import DestinationsExplorer from "@/components/DestinationsExplorer";
import FeaturedExperiences from "@/components/FeaturedExperiences";
import UpcomingEvents from "@/components/UpcomingEvents";
import TurismoSeguroBanner from "@/components/TurismoSeguroBanner";
import SustainabilityBanner from "@/components/SustainabilityBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import VideoShowcase from "@/components/VideoShowcase";
import { getAllEvents } from "@/services/eventsService";
import "@/styles/globals.css";


export default async function Home() {
  // Fetch events from Firebase
  const events = await getAllEvents();
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col">
        {/* Hero Section */}
        <HeroCarousel />

        {/* Video Showcase */}
        <VideoShowcase/>

        {/* Upcoming Events & Festivals */}
        <UpcomingEvents events={events} />

        {/* Featured Experiences / Itineraries */}
        <FeaturedExperiences />

        {/* PromoBanner */}
        <PromoBanner />

        {/* Sustainability */}
        <SustainabilityBanner />

        {/* Turismo Seguro - Policía del Atlántico */}
        <TurismoSeguroBanner />  
        
        {/* Social Proof */}
        <InstagramFeed />
      </main>
      <Footer />
    </>
  );
}