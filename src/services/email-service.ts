// services/email-service.ts
export async function sendItineraryEmail(
    email: string,
    itineraryId: string,
    profile: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-itinerary-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          itineraryId,
          profile,
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el correo');
      }
  
      return { success: true };
    } catch (error: any) {
      console.error('Error en sendItineraryEmail:', error);
      return { 
        success: false, 
        error: error.message || 'Error al enviar el correo' 
      };
    }
  }