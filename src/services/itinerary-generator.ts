// src/services/itinerary-generator.ts

import type { TravelerProfile } from "@/types/planner";

export async function generateItinerary(
  profile: TravelerProfile,
  requestId: string,
  signal?: AbortSignal
): Promise<{
  success: boolean;
  itineraryId?: string;
  itinerary?: any;
  error?: string;
}> {
  try {
    console.log("Enviando perfil al servidor:", profile);
    
    // Preparar los datos en el formato correcto
    const requestData = {
      profile: {
        days: profile.days,
        email: profile.email,
        interests: profile.interests,
        tripType: profile.tripType,
        budget: profile.budget,
        startLocation: profile.startLocation,
        travelPace: profile.travelPace,  // Se envía directamente en profile
        maxDistance: profile.maxDistance,  // Se envía directamente en profile
        itineraryRequestId: requestId
      }
    };

    console.log("Datos formateados para enviar:", requestData);

    const response = await fetch('/api/itinerary/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal
    });

    console.log(`Respuesta del servidor: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error del servidor:", errorData);
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("Itinerario generado exitosamente:", result.itineraryId);
    
    return {
      success: true,
      itineraryId: result.itineraryId,
      itinerary: result.itinerary
    };
  } catch (error: any) {
    console.error("Error en generateItinerary:", error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'La generación fue cancelada'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
}