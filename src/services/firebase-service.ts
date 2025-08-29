import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import type { TravelerProfile } from "@/types/planner";
import { ATLANTICO_INTERESTS, BUDGET_OPTIONS, TRAVEL_PACE, TRAVEL_DISTANCE, PREDEFINED_LOCATIONS } from "@/config/planner-options";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_KbSPZjdXgR_u8r-c6NZ8oxR85loKvUU",
  authDomain: "visitatlantico-f5c09.firebaseapp.com",
  projectId: "visitatlantico-f5c09",
  storageBucket: "visitatlantico-f5c09.firebasestorage.app",
  messagingSenderId: "1097999694057",
  appId: "1:1097999694057:web:2e01d75dabe931d24dd878",
  measurementId: "G-P11NC2E1RQ"
};

function getDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

export async function saveItineraryRequest(profile: TravelerProfile): Promise<string> {
  const db = getDb();
  
  // Preparar datos enriquecidos
  const selectedInterests = profile.interests.map(id => 
    ATLANTICO_INTERESTS.find(i => i.id === id)
  ).filter(Boolean);

  const startLocationData = profile.startLocation 
    ? typeof profile.startLocation === 'object'
      ? {
          lat: profile.startLocation.lat,
          lng: profile.startLocation.lng,
          name: profile.startLocation.name || 'Ubicación actual'
        }
      : PREDEFINED_LOCATIONS.find(l => l.id === profile.startLocation)?.coords
    : null;

  const itineraryRequestData = {
    // Datos básicos
    days: profile.days,
    email: profile.email,
    
    // Ubicación
    startLocation: startLocationData,
    
    // Preferencias
    interests: profile.interests,
    interestsData: selectedInterests?.map(i => ({
      id: i?.id,
      googleTypes: i?.googleTypes,
      geminiContext: i?.geminiContext
    })),
    
    tripType: profile.tripType,
    budget: profile.budget,
    budgetLevel: BUDGET_OPTIONS.find(b => b.id === profile.budget)?.priceLevel,
    
    travelPace: profile.travelPace,
    activitiesPerDay: TRAVEL_PACE.find(p => p.id === profile.travelPace)?.activitiesPerDay,
    
    maxDistance: profile.maxDistance,
    searchRadiusKm: TRAVEL_DISTANCE.find(d => d.id === profile.maxDistance)?.radiusKm,
    
    // Metadata
    createdAt: serverTimestamp(),
    status: 'pending',
    source: 'web_planner_v2',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
    screenSize: typeof window !== 'undefined' 
      ? `${window.screen.width}x${window.screen.height}` 
      : null,
    language: 'es'
  };
  
  const docRef = await addDoc(collection(db, "itinerarios_creados"), itineraryRequestData);
  return docRef.id;
}

export async function updateItineraryStatus(
  requestId: string, 
  status: 'completed' | 'failed', 
  itineraryId?: string,
  error?: string
) {
  const db = getDb();
  const docRef = doc(db, "itinerarios_creados", requestId);
  
  await updateDoc(docRef, {
    status,
    ...(itineraryId && { generatedItineraryId: itineraryId }),
    ...(error && { error }),
    updatedAt: serverTimestamp()
  });
}

export async function saveGeneratedItinerary(itineraryData: any) {
  const db = getDb();
  const docRef = await addDoc(collection(db, "itinerarios_generados"), {
    ...itineraryData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}