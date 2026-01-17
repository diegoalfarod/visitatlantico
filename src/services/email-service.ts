// src/services/email-service.ts
// Servicio para enviar emails desde el cliente

export interface SendItineraryEmailParams {
  email: string;
  itineraryId: string;
  profile: {
    days: number;
    tripType: string;
    budget: string;
    interests: string[];
    pace?: string;
  };
  itinerary?: any;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Enviar itinerario por email
 */
export async function sendItineraryEmail(
  params: SendItineraryEmailParams
): Promise<EmailResult> {
  try {
    const response = await fetch('/api/send-itinerary-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar el correo');
    }

    return { 
      success: true,
      id: data.id
    };
  } catch (error: any) {
    console.error('Error en sendItineraryEmail:', error);
    return {
      success: false,
      error: error.message || 'Error al enviar el correo'
    };
  }
}

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Reenviar itinerario por email
 */
export async function resendItineraryEmail(
  itineraryId: string,
  email: string
): Promise<EmailResult> {
  try {
    const response = await fetch('/api/send-itinerary-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        itineraryId,
        profile: {} // El API obtendrá el profile de Firebase
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al reenviar el correo');
    }

    return { 
      success: true,
      id: data.id
    };
  } catch (error: any) {
    console.error('Error en resendItineraryEmail:', error);
    return {
      success: false,
      error: error.message || 'Error al reenviar el correo'
    };
  }
}