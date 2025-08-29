import type { TravelerProfile, ProcessedProfile } from "@/types/planner";
import { TRAVEL_PACE, TRAVEL_DISTANCE, PREDEFINED_LOCATIONS } from "@/config/planner-options";
import { updateItineraryStatus } from "./firebase-service";

export async function generateItinerary(
  profile: TravelerProfile, 
  requestId: string,
  signal?: AbortSignal
) {
  try {
    // Procesar perfil para el backend
    const processedProfile = processProfile(profile);
    
    // Llamar al API
    const response = await fetch('/api/itinerary/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: processedProfile,
        itineraryRequestId: requestId,
        preferences: {
          pace: TRAVEL_PACE.find(p => p.id === profile.travelPace)?.mappedValue || 'normal',
          timePreference: 'normal',
          searchRadius: TRAVEL_DISTANCE.find(d => d.id === profile.maxDistance)?.radiusKm || 30
        }
      }),
      signal
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Actualizar estado en Firebase
    await updateItineraryStatus(requestId, 'completed', data.itineraryId);
    
    return {
      success: true,
      itineraryId: data.itineraryId,
      itinerary: data.itinerary
    };
    
  } catch (error: any) {
    console.error('Error generando itinerario:', error);
    
    // Actualizar estado de error en Firebase
    await updateItineraryStatus(requestId, 'failed', undefined, error.message);
    
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}

function processProfile(profile: TravelerProfile): ProcessedProfile {
  // Mapear ubicación
  let startLocation;
  if (profile.startLocation) {
    if (typeof profile.startLocation === 'object') {
      startLocation = profile.startLocation;
    } else {
      const predefined = PREDEFINED_LOCATIONS.find(l => l.id === profile.startLocation);
      if (predefined) {
        startLocation = {
          ...predefined.coords,
          name: predefined.label
        };
      }
    }
  }
  
  // Mapear locationRange basado en maxDistance
  const locationRange = profile.maxDistance === 'ciudad' 
    ? 'barranquilla' 
    : 'todo_atlantico';
  
  // Mapear pace
  const pace = TRAVEL_PACE.find(p => p.id === profile.travelPace)?.mappedValue || 'normal';
  
  // Mapear tripType
  const tripType = profile.tripType === 'solo_pareja' ? 'pareja' : profile.tripType;
  
  return {
    days: profile.days,
    email: profile.email,
    interests: profile.interests,
    tripType,
    budget: profile.budget,
    pace,
    locationRange,
    startLocation
  };
}