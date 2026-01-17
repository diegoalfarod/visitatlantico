// src/app/api/send-itinerary-email/route.ts
// Endpoint para enviar itinerarios por email usando Resend

import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// TIPOS
// =============================================================================

interface EmailRequest {
  email: string;
  itineraryId: string;
  profile: {
    days: number;
    tripType: string;
    budget: string;
    interests: string[];
    pace?: string;
  };
  itinerary?: {
    days: Array<{
      day: number;
      title: string;
      activities: Array<{
        name: string;
        time: string;
        description: string;
      }>;
    }>;
  };
}

// =============================================================================
// COLORES DE MARCA
// =============================================================================

const COLORS = {
  azulBarranquero: "#007BC4",
  rojoCayena: "#D31A2B",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
};

// =============================================================================
// TEMPLATE DE EMAIL
// =============================================================================

function generateEmailHTML(data: EmailRequest): string {
  const { email, itineraryId, profile, itinerary } = data;
  const viewUrl = `https://visitatlantico.com/itinerary/${itineraryId}`;
  
  const tripTypeLabels: Record<string, string> = {
    solo: "Viaje Solo",
    pareja: "Viaje en Pareja",
    familia: "Viaje en Familia",
    amigos: "Viaje con Amigos"
  };

  const interestLabels: Record<string, string> = {
    carnaval_cultura: "🎭 Carnaval y Cultura",
    playas_rio: "🏖️ Playas y Río",
    gastronomia_local: "🍽️ Gastronomía",
    vida_nocturna: "🎵 Vida Nocturna",
    historia_patrimonio: "🏛️ Historia",
    artesanias_tradiciones: "🎨 Artesanías",
    naturaleza_aventura: "🌿 Naturaleza"
  };

  const interestsFormatted = profile.interests
    .map(i => interestLabels[i] || i)
    .join(" • ");

  // Generar resumen de días si tenemos el itinerario
  let daysHTML = "";
  if (itinerary?.days) {
    daysHTML = itinerary.days.map(day => `
      <div style="margin-bottom: 24px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${COLORS.naranjaSalinas};">
        <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 18px;">
          Día ${day.day}: ${day.title}
        </h3>
        <div style="color: #64748b; font-size: 14px;">
          ${day.activities.slice(0, 3).map(a => `
            <div style="margin: 8px 0; padding-left: 12px; border-left: 2px solid #e2e8f0;">
              <strong style="color: ${COLORS.azulBarranquero};">${a.time}</strong> - ${a.name}
            </div>
          `).join('')}
          ${day.activities.length > 3 ? `<div style="color: #94a3b8; font-style: italic; margin-top: 8px;">+ ${day.activities.length - 3} actividades más...</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Itinerario en el Atlántico</title>
  <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Montserrat', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header con gradiente -->
    <div style="background: linear-gradient(135deg, ${COLORS.azulBarranquero} 0%, #004d7a 50%, ${COLORS.rojoCayena} 100%); padding: 40px 30px; text-align: center;">
      <img src="https://visitatlantico.com/logo-atlantico-blanco.png" alt="Atlántico" style="height: 50px; margin-bottom: 20px;" />
      <h1 style="margin: 0; color: #ffffff; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 28px; font-weight: 700;">
        ¡Tu Aventura Está Lista!
      </h1>
      <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
        ${profile.days} días de experiencias inolvidables en el Caribe colombiano
      </p>
    </div>

    <!-- Contenido principal -->
    <div style="padding: 40px 30px;">
      
      <!-- Saludo -->
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        ¡Hola! 👋<br><br>
        Hemos creado un itinerario personalizado especialmente para ti. Cada lugar fue seleccionado considerando tus intereses y estilo de viaje.
      </p>

      <!-- Resumen del viaje -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; color: #92400e; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 18px; font-weight: 600;">
          📋 Resumen de tu Viaje
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Duración</td>
            <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600; text-align: right;">${profile.days} días</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Tipo de viaje</td>
            <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600; text-align: right;">${tripTypeLabels[profile.tripType] || profile.tripType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Presupuesto</td>
            <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600; text-align: right; text-transform: capitalize;">${profile.budget}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Intereses</p>
          <p style="margin: 8px 0 0 0; color: #1c1917; font-size: 14px; line-height: 1.6;">${interestsFormatted}</p>
        </div>
      </div>

      <!-- Preview de días -->
      ${daysHTML ? `
        <div style="margin-bottom: 32px;">
          <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 20px; font-weight: 600;">
            🗓️ Tu Itinerario
          </h2>
          ${daysHTML}
        </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, ${COLORS.naranjaSalinas} 0%, ${COLORS.rojoCayena} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(234, 91, 19, 0.3);">
          Ver Itinerario Completo →
        </a>
      </div>

      <!-- Tips -->
      <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-top: 32px;">
        <h3 style="margin: 0 0 12px 0; color: ${COLORS.azulBarranquero}; font-family: 'Josefin Sans', Arial, sans-serif; font-size: 16px;">
          💡 Tips para tu viaje
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 14px; line-height: 1.8;">
          <li>Guarda este email para acceder fácilmente a tu itinerario</li>
          <li>Descarga el PDF desde la página para tenerlo offline</li>
          <li>Los precios son estimados y pueden variar</li>
          <li>Reserva con anticipación en temporada alta</li>
        </ul>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #1a1a2e; padding: 30px; text-align: center;">
      <img src="https://visitatlantico.com/logo-atlantico-blanco.png" alt="Atlántico" style="height: 35px; margin-bottom: 16px; opacity: 0.8;" />
      <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.6); font-size: 13px;">
        Gobernación del Atlántico - Secretaría de Turismo
      </p>
      <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 12px;">
        © ${new Date().getFullYear()} VisitAtlántico. Todos los derechos reservados.
      </p>
      <div style="margin-top: 20px;">
        <a href="https://visitatlantico.com" style="color: ${COLORS.amarilloArepa}; text-decoration: none; font-size: 13px; margin: 0 10px;">Sitio Web</a>
        <a href="https://instagram.com/visitatlantico" style="color: ${COLORS.amarilloArepa}; text-decoration: none; font-size: 13px; margin: 0 10px;">Instagram</a>
        <a href="https://facebook.com/visitatlantico" style="color: ${COLORS.amarilloArepa}; text-decoration: none; font-size: 13px; margin: 0 10px;">Facebook</a>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

// =============================================================================
// HANDLER
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json();
    const { email, itineraryId, profile } = body;

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!itineraryId) {
      return NextResponse.json(
        { error: 'ID de itinerario requerido' },
        { status: 400 }
      );
    }

    // Verificar API key de Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY no configurada');
      // En desarrollo, simular éxito
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Email simulado para:', email);
        return NextResponse.json({ 
          success: true, 
          message: 'Email simulado (development mode)',
          id: `dev_${Date.now()}`
        });
      }
      return NextResponse.json(
        { error: 'Servicio de email no configurado' },
        { status: 500 }
      );
    }

    // Obtener itinerario completo de Firebase para incluir en el email
    let itineraryData = body.itinerary;
    
    if (!itineraryData && process.env.FIREBASE_SERVICE_JSON) {
      try {
        const { getFirestore } = await import("firebase-admin/firestore");
        const { initializeApp, getApps, cert } = await import("firebase-admin/app");
        
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
        const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
        const db = getFirestore(app);
        
        const doc = await db.collection("generated_itineraries").doc(itineraryId).get();
        if (doc.exists) {
          itineraryData = doc.data() as any;
        }
      } catch (error) {
        console.warn('No se pudo obtener itinerario de Firebase:', error);
      }
    }

    // Generar HTML del email
    const htmlContent = generateEmailHTML({
      ...body,
      itinerary: itineraryData
    });

    // Enviar con Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VisitAtlántico <itinerarios@visitatlantico.com>',
        to: [email],
        subject: `🌴 Tu itinerario de ${profile.days} días en el Atlántico`,
        html: htmlContent,
        tags: [
          { name: 'category', value: 'itinerary' },
          { name: 'trip_type', value: profile.tripType },
          { name: 'days', value: String(profile.days) }
        ]
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error de Resend:', result);
      throw new Error(result.message || 'Error enviando email');
    }

    console.log(`📧 Email enviado exitosamente a ${email}, ID: ${result.id}`);

    // Guardar en analytics que se envió email
    if (process.env.FIREBASE_SERVICE_JSON) {
      try {
        const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
        const { getApps } = await import("firebase-admin/app");
        const db = getFirestore(getApps()[0]);
        
        await db.collection("analytics_itineraries").doc(itineraryId).update({
          'email.sent': true,
          'email.sentAt': new Date(),
          'email.resendId': result.id,
          updatedAt: new Date()
        });

        // Actualizar contador diario
        const today = new Date().toISOString().split('T')[0];
        await db.collection("analytics_daily").doc(today).set({
          emailsSent: FieldValue.increment(1),
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        console.warn('Error actualizando analytics de email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
      id: result.id
    });

  } catch (error: any) {
    console.error('Error en /api/send-itinerary-email:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}