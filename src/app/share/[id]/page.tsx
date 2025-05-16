// src/app/share/[id]/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PremiumPlannerPage from "@/app/planner/page"; // reutiliza tu componente

export default async function SharePage({ params }: { params: { id: string } }) {
  const snap = await getDoc(doc(db, "shared_itineraries", params.id));
  if (!snap.exists()) return <p>Link inválido</p>;

  const { itinerary, days } = snap.data() as { itinerary: any[]; days: number };

  /* Reusa tu planner en modo solo-lectura */
  return (
    <PremiumPlannerPage
      /* props especiales para que salte el wizard:
         view="itinerary" itinerary={itinerary} days={days} */
      shared={{ itinerary, days }}
    />
  );
}
