// src/services/firebase-service.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import type { TravelerProfile } from "@/types/planner";
import { ATLANTICO_INTERESTS, BUDGET_OPTIONS, TRAVEL_PACE, TRAVEL_DISTANCE, PREDEFINED_LOCATIONS } from "@/config/planner-options";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

function getDb() {
  // Verificar que la configuración esté completa
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase configuration is incomplete");
    throw new Error("Firebase no está configurado correctamente");
  }
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

export async function saveItineraryRequest(profile: TravelerProfile): Promise<string> {
  try {
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
    
    console.log("Guardando solicitud en Firebase...");
    const docRef = await addDoc(collection(db, "itinerarios_creados"), itineraryRequestData);
    console.log("Solicitud guardada con ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("Error guardando solicitud:", error);
    // Retornar un ID local como fallback
    return `fallback_${Date.now()}`;
  }
}

export async function updateItineraryStatus(
  requestId: string, 
  status: 'completed' | 'failed', 
  itineraryId?: string,
  error?: string
) {
  try {
    const db = getDb();
    const docRef = doc(db, "itinerarios_creados", requestId);
    
    await updateDoc(docRef, {
      status,
      ...(itineraryId && { generatedItineraryId: itineraryId }),
      ...(error && { error }),
      updatedAt: serverTimestamp()
    });
    console.log(`Status actualizado para ${requestId}: ${status}`);
  } catch (error) {
    console.error("Error actualizando status:", error);
  }
}

export async function saveGeneratedItinerary(itineraryData: any) {
  try {
    const db = getDb();
    const docRef = await addDoc(collection(db, "itinerarios_generados"), {
      ...itineraryData,
      createdAt: serverTimestamp()
    });
    console.log("Itinerario generado guardado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error guardando itinerario generado:", error);
    return `error_${Date.now()}`;
  }
}