// src/app/shared/[id]/page.tsx
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import type { Stop } from "@/components/ItineraryStopCard";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata(): Promise<Metadata> {

  return {
    title: `Itinerario compartido | Atlántico`,
    description: `Explora este itinerario turístico en el Atlántico, Colombia.`,
  };
}

export default async function SharedItineraryPage({ params }: Props) {
  const ref = doc(db, "sharedItineraries", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return notFound();

  const data = snap.data();
  const itinerary = data?.itinerary as Stop[];

  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return <div className="text-center mt-20 text-xl">Itinerario no disponible.</div>;
  }

  const days = 1;
  const grouped = Array.from({ length: days }, (_, i) => {
    const size = Math.ceil(itinerary.length / days);
    return itinerary.slice(i * size, i * size + size);
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 pb-16">
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold mb-2">Itinerario Turístico</h1>
          <p className="text-xl text-white/80">Una aventura compartida desde Atlántico, Colombia</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Paradas</h2>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar /> {days} día
              </span>
              <span className="flex items-center gap-2">
                <MapPin /> {itinerary.length} paradas
              </span>
              <span className="flex items-center gap-2">
                <Clock />{" "}
                {Math.round(
                  itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
                )}{" "}
                h
              </span>
            </div>
          </div>

          <div className="w-full h-64 rounded-2xl overflow-hidden">
            <ItineraryMap stops={itinerary} />
          </div>
        </div>

        {grouped.map((dayStops, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-3xl shadow-xl"
          >
            <h3 className="text-2xl font-semibold mb-6">Día {idx + 1}</h3>
            <ItineraryTimeline stops={dayStops} />
          </div>
        ))}
      </div>
    </main>
  );
}
