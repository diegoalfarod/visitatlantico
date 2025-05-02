import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Stop } from "@/components/ItineraryStopCard";

export async function generateUniqueLink(itinerary: Stop[] | null): Promise<string> {
  if (!itinerary || itinerary.length === 0) throw new Error("Itinerario vacío");

  const docRef = await addDoc(collection(db, "sharedItineraries"), {
    itinerary,
    createdAt: new Date(),
  });

  return `${window.location.origin}/shared/${docRef.id}`;
}
