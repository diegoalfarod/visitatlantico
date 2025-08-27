// app/api/itinerary/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Intentar obtener de Firebase
    const projectId = "visitatlantico-f5c09";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/generated_itineraries/${id}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Intentar buscar en itinerarios_creados
      const altUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/itinerarios_creados/${id}`;
      const altResponse = await fetch(altUrl);
      
      if (!altResponse.ok) {
        return NextResponse.json(
          { error: "Itinerario no encontrado" },
          { status: 404 }
        );
      }
      
      // Devolver datos básicos si está en itinerarios_creados
      const altData = await altResponse.json();
      return NextResponse.json({
        id,
        status: "pending",
        message: "El itinerario está siendo generado..."
      });
    }
    
    const data = await response.json();
    
    // Transformar los datos de Firebase al formato esperado
    const fields = data.fields;
    const itinerary = fields.itinerary?.arrayValue?.values?.map((item: any) => {
      const f = item.mapValue.fields;
      return {
        id: f.id?.stringValue,
        name: f.name?.stringValue,
        day: f.day?.integerValue || 1,
        dayTitle: f.dayTitle?.stringValue,
        startTime: f.startTime?.stringValue,
        endTime: f.endTime?.stringValue,
        lat: f.lat?.doubleValue,
        lng: f.lng?.doubleValue,
        description: f.description?.stringValue,
        municipality: f.municipality?.stringValue,
        category: f.category?.stringValue,
        durationMinutes: f.durationMinutes?.integerValue || 60,
        estimatedCost: f.estimatedCost?.integerValue || 0,
        crowdLevel: f.crowdLevel?.stringValue || "medium",
        tip: f.tip?.stringValue,
        mustTry: f.mustTry?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
        distance: f.distance?.doubleValue || 0,
        imageUrl: f.imageUrl?.stringValue,
        rating: f.rating?.doubleValue,
        address: f.address?.stringValue
      };
    }) || [];
    
    const profile = {
      days: fields.profile?.mapValue?.fields?.days?.integerValue,
      email: fields.profile?.mapValue?.fields?.email?.stringValue,
      interests: fields.profile?.mapValue?.fields?.interests?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
      tripType: fields.profile?.mapValue?.fields?.tripType?.stringValue,
      budget: fields.profile?.mapValue?.fields?.budget?.stringValue,
      locationRange: fields.profile?.mapValue?.fields?.locationRange?.stringValue
    };
    
    return NextResponse.json({
      id,
      profile,
      itinerary,
      createdAt: fields.createdAt?.timestampValue,
      status: fields.status?.stringValue || "generated"
    });
    
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return NextResponse.json(
      { error: "Error al obtener el itinerario" },
      { status: 500 }
    );
  }
}