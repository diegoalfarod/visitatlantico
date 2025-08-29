// src/app/api/itinerary/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itineraryId = params.id;
    
    if (!itineraryId) {
      return NextResponse.json(
        { error: "ID de itinerario requerido" },
        { status: 400 }
      );
    }

    console.log(`Recuperando itinerario con ID: ${itineraryId}`);

    // Buscar en Firebase
    if (process.env.FIREBASE_SERVICE_JSON) {
      const { getFirestore } = await import("firebase-admin/firestore");
      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
      const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
      const db = getFirestore(app);

      const doc = await db.collection("generated_itineraries").doc(itineraryId).get();
      
      if (!doc.exists) {
        console.error(`Itinerario no encontrado: ${itineraryId}`);
        return NextResponse.json(
          { error: "Itinerario no encontrado" },
          { status: 404 }
        );
      }

      const data = doc.data();
      
      // Validar estructura de datos
      if (!data) {
        console.error("Documento vacío en Firebase");
        return NextResponse.json(
          { error: "Datos de itinerario inválidos" },
          { status: 500 }
        );
      }

      // Si tiene el formato antiguo (itinerary array), necesita conversión
      if (data.itinerary && Array.isArray(data.itinerary) && !data.days) {
        console.log("Detectado formato antiguo, convirtiendo...");
        
        // Importar el conversor dinámicamente
        const { convertItineraryToFrontendFormat } = await import('@/lib/itinerary-converter');
        
        const converted = convertItineraryToFrontendFormat(
          data.itinerary,
          data.profile || { days: 3 }
        );
        
        // Actualizar el documento en Firebase con el nuevo formato
        try {
          await db.collection("generated_itineraries").doc(itineraryId).update({
            days: converted.days,
            metadata: {
              ...data.metadata,
              formatUpdated: true,
              updatedAt: new Date()
            }
          });
          console.log("Formato actualizado en Firebase");
        } catch (updateError) {
          console.error("Error actualizando formato:", updateError);
        }
        
        // Retornar el formato convertido
        return NextResponse.json({
          id: itineraryId,
          profile: data.profile || {},
          days: converted.days,
          metadata: {
            ...data.metadata,
            generatedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            totalActivities: converted.days.reduce((acc: number, day: any) => 
              acc + (day.activities?.length || 0), 0
            )
          }
        });
      }

      // Si ya tiene el formato correcto (days)
      if (data.days && Array.isArray(data.days)) {
        return NextResponse.json({
          id: itineraryId,
          profile: data.profile || {},
          days: data.days,
          metadata: {
            ...data.metadata,
            generatedAt: data.createdAt?.toDate?.()?.toISOString() || 
                        data.metadata?.generatedAt || 
                        new Date().toISOString(),
            totalActivities: data.days.reduce((acc: number, day: any) => 
              acc + (day.activities?.length || 0), 0
            )
          }
        });
      }

      // Si no tiene ningún formato reconocible
      console.error("Estructura de datos no reconocida:", Object.keys(data));
      return NextResponse.json(
        { error: "Formato de itinerario no reconocido" },
        { status: 500 }
      );
    }

    // Si no hay Firebase configurado
    return NextResponse.json(
      { error: "Servicio de base de datos no disponible" },
      { status: 503 }
    );

  } catch (error: any) {
    console.error("Error recuperando itinerario:", error);
    return NextResponse.json(
      { 
        error: "Error al recuperar el itinerario", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}