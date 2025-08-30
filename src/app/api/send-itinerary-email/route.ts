// app/api/send-itinerary-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, itineraryId, profile } = await request.json();

    // Generar la URL del itinerario
    const itineraryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://visitatlantico.com'}/itinerary/${itineraryId}`;

    // Mapear los valores a texto legible
    const tripTypeLabels: any = {
      'solo': 'Viaje Solo',
      'pareja': 'En Pareja',
      'familia': 'En Familia',
      'amigos': 'Con Amigos',
      'negocios': 'Viaje de Negocios'
    };

    const budgetLabels: any = {
      'economico': 'Económico',
      'moderado': 'Moderado',
      'premium': 'Premium'
    };

    const paceLabels: any = {
      'relajado': 'Relajado',
      'moderado': 'Moderado',
      'intenso': 'Intenso'
    };

    // HTML del correo - Diseño institucional
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .wrapper {
              background-color: #f5f5f5;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto;
              background: white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            /* Header gubernamental */
            .gov-header {
              background: linear-gradient(90deg, #1f2937 0%, #374151 100%);
              padding: 20px 30px;
              border-bottom: 4px solid #dc2626;
            }
            .gov-header img {
              height: 60px;
              width: auto;
            }
            .gov-title {
              color: white;
              font-size: 14px;
              margin: 10px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            /* Banner principal */
            .main-banner {
              background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .main-banner h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .main-banner p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            
            /* Contenido */
            .content { 
              padding: 40px 30px;
              background: white;
            }
            .section-title {
              color: #1f2937;
              font-size: 20px;
              font-weight: 600;
              margin: 0 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .greeting {
              font-size: 16px;
              color: #374151;
              margin-bottom: 25px;
              line-height: 1.6;
            }
            
            /* Tabla de detalles */
            .details-table {
              width: 100%;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin: 25px 0;
              overflow: hidden;
            }
            .details-table-header {
              background: #1f2937;
              color: white;
              padding: 15px 20px;
              font-weight: 600;
              font-size: 16px;
            }
            .details-table-body {
              padding: 20px;
            }
            .detail-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              flex: 0 0 140px;
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
            }
            .detail-value {
              flex: 1;
              color: #1f2937;
              font-size: 14px;
              font-weight: 600;
            }
            
            /* Botón oficial */
            .button-container {
              text-align: center;
              margin: 35px 0;
              padding: 25px;
              background: #fef3c7;
              border-radius: 8px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 40px; 
              background: #dc2626;
              color: white !important; 
              text-decoration: none; 
              border-radius: 4px; 
              font-weight: 600;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
            }
            .button:hover {
              background: #b91c1c;
            }
            
            /* Información adicional */
            .info-box {
              background: #f0f9ff;
              border-left: 4px solid #0284c7;
              padding: 20px;
              margin: 25px 0;
            }
            .info-box h4 {
              margin: 0 0 10px 0;
              color: #0c4a6e;
              font-size: 16px;
              font-weight: 600;
            }
            .info-box ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .info-box li {
              color: #075985;
              font-size: 14px;
              margin: 8px 0;
              line-height: 1.5;
            }
            
            /* Footer institucional */
            .footer { 
              background: #f9fafb;
              padding: 30px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .footer-info {
              text-align: center;
              color: #6b7280;
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-info strong {
              color: #374151;
              display: block;
              margin-bottom: 5px;
            }
            .social-link {
              display: inline-block;
              margin: 15px 0 10px 0;
              padding: 8px 16px;
              background: #1f2937;
              color: white !important;
              text-decoration: none;
              border-radius: 4px;
              font-size: 13px;
            }
            .legal {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <!-- Header Gubernamental -->
              <div class="gov-header">
                <div class="gov-title">
                  Gobernación del Atlántico
                </div>
                <div class="gov-title" style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
                  Secretaría de Desarrollo Económico - Turismo
                </div>
              </div>
              
              <!-- Banner Principal -->
              <div class="main-banner">
                <h1>Itinerario Oficial Generado</h1>
                <p>Sistema de Planificación Turística del Atlántico</p>
              </div>
              
              <!-- Contenido Principal -->
              <div class="content">
                <p class="greeting">
                  Estimado(a) visitante,
                </p>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                  El Sistema Oficial de Planificación Turística del Departamento del Atlántico ha generado 
                  exitosamente su itinerario personalizado de <strong>${profile.days} ${profile.days === 1 ? 'día' : 'días'}</strong>. 
                  Este documento ha sido diseñado considerando sus preferencias específicas y los recursos 
                  turísticos disponibles en nuestro territorio.
                </p>
                
                <!-- Tabla de Detalles -->
                <div class="details-table">
                  <div class="details-table-header">
                    Información del Itinerario
                  </div>
                  <div class="details-table-body">
                    <div class="detail-row">
                      <div class="detail-label">Código de Referencia:</div>
                      <div class="detail-value">${itineraryId.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Duración:</div>
                      <div class="detail-value">${profile.days} ${profile.days === 1 ? 'día' : 'días'}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Tipo de Viaje:</div>
                      <div class="detail-value">${tripTypeLabels[profile.tripType] || profile.tripType}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Categoría:</div>
                      <div class="detail-value">${budgetLabels[profile.budget] || profile.budget}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Ritmo de Viaje:</div>
                      <div class="detail-value">${paceLabels[profile.travelPace] || profile.travelPace}</div>
                    </div>
                    <div class="detail-row">
                      <div class="detail-label">Fecha de Generación:</div>
                      <div class="detail-value">${new Date().toLocaleDateString('es-CO', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                  </div>
                </div>

                <!-- Botón de Acceso -->
                <div class="button-container">
                  <p style="margin: 0 0 15px 0; color: #92400e; font-size: 14px;">
                    Para acceder a su itinerario completo con mapas interactivos y detalles de cada actividad:
                  </p>
                  <a href="${itineraryUrl}" class="button">
                    ACCEDER AL ITINERARIO
                  </a>
                </div>

                <!-- Información Adicional -->
                <div class="info-box">
                  <h4>Su itinerario incluye:</h4>
                  <ul>
                    <li>Mapa interactivo con rutas optimizadas</li>
                    <li>Información detallada de cada lugar a visitar</li>
                    <li>Horarios recomendados y tiempos de traslado</li>
                    <li>Recomendaciones gastronómicas locales</li>
                    <li>Información de contacto y precios actualizados</li>
                    <li>Tips y recomendaciones de seguridad</li>
                  </ul>
                </div>

                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 25px;">
                  <strong>Importante:</strong> Se recomienda guardar este correo para futuras referencias. 
                  El enlace de acceso al itinerario permanecerá activo durante 30 días.
                </p>
              </div>
              
              <!-- Footer Institucional -->
              <div class="footer">
                <div class="footer-info">
                  <strong>Gobernación del Atlántico</strong>
                  Secretaría de Desarrollo Económico - Oficina de Turismo<br>
                  Calle 40 No. 45-46, Barranquilla, Atlántico, Colombia<br>
                  Teléfono: (605) 330 7000<br>
                  <a href="https://instagram.com/turismoatlantico_" class="social-link">
                    Síguenos en Instagram @turismoatlantico_
                  </a>
                </div>
                <div class="legal">
                  <p style="margin: 5px 0;">
                    Este es un correo electrónico oficial de la Gobernación del Atlántico. 
                    Por favor no responda a este mensaje.
                  </p>
                  <p style="margin: 5px 0;">
                    © 2025 Gobernación del Atlántico. Todos los derechos reservados.
                  </p>
                  <p style="margin: 5px 0;">
                    Correo enviado a: ${email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar el correo con Resend
    const { data, error } = await resend.emails.send({
      from: 'Sistema de Turismo Atlántico <onboarding@resend.dev>', // Cambia cuando verifiques tu dominio
      to: [email],
      subject: `Itinerario Oficial - ${profile.days} ${profile.days === 1 ? 'día' : 'días'} en el Atlántico [Ref: ${itineraryId.slice(0, 8).toUpperCase()}]`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('Email enviado exitosamente:', data);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json(
      { success: false, error: 'Error al enviar el correo' },
      { status: 500 }
    );
  }
}