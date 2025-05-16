import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Stop } from "@/components/ItineraryStopCard";

export async function generateUniqueLink(
  itinerary: Stop[],
  days: number
): Promise<string> {
  if (!itinerary.length) throw new Error("Itinerario vacío");

  const ref = await addDoc(collection(db, "sharedItineraries"), {
    itinerary,
    days,
    createdAt: Date.now(),
  });

  return `${window.location.origin}/shared/${ref.id}`;
}
