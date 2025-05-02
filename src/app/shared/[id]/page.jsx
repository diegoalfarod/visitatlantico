import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";

import { MapPin, Clock, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Itinerario compartido | Atlántico",
    description:
      "Explora este itinerario turístico en el Atlántico, Colombia.",
  };
}

export default async function SharedItineraryPage({ params }) {
  const { id } = params;

  const snap = await getDoc(doc(db, "sharedItineraries", id));
  if (!snap.exists()) notFound();

  const itinerary = snap.get("itinerary") || [];
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Itinerario no disponible.</p>
      </div>
    );
  }

  const totalHours = Math.round(
    itinerary.reduce((sum, stop) => sum + (stop.durationMinutes || 0), 0) / 60
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 pb-16">
      {/* Hero */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold mb-2">Itinerario Turístico</h1>
          <p className="text-xl text-white/80">
            Una aventura compartida desde Atlántico, Colombia
          </p>
        </div>
      </header>

      {/* Resumen + mapa */}
      <section className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Paradas</h2>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar /> 1 día
              </span>
              <span className="flex items-center gap-2">
                <MapPin /> {itinerary.length} paradas
              </span>
              <span className="flex items-center gap-2">
                <Clock /> {totalHours} h
              </span>
            </div>
          </div>

          <div className="w-full h-64 rounded-2xl overflow-hidden">
            <ItineraryMap stops={itinerary} />
          </div>
        </div>

        {/* Línea de tiempo */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-2xl font-semibold mb-6">Día 1</h3>
          <ItineraryTimeline stops={itinerary} />
        </div>
      </section>
    </main>
  );
}
