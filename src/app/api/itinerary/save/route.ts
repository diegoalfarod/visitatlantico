import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { SavedItinerary } from '@/types/itinerary';

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON || '{}');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const body: SavedItinerary = await request.json();

    // Validar datos básicos
    if (!body.shortId || !body.title || !body.stops || !Array.isArray(body.stops)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el shortId no exista
    const existing = await db.collection('saved_itineraries')
      .where('shortId', '==', body.shortId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'ID ya existe' },
        { status: 409 }
      );
    }

    // Preparar datos con timestamps de Firestore
    const now = admin.firestore.FieldValue.serverTimestamp();
    const expiresAt = body.expiresAt 
      ? admin.firestore.Timestamp.fromDate(new Date(body.expiresAt))
      : admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 días por defecto

    const dataToSave = {
      ...body,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAt,
      views: 0,
      lastViewedAt: null
    };

    // Guardar en Firestore
    const docRef = await db.collection('saved_itineraries').add(dataToSave);

    // Guardar metadata para búsquedas rápidas
    await db.collection('itinerary_metadata').doc(body.shortId).set({
      shortId: body.shortId,
      title: body.title,
      days: body.days,
      totalStops: body.stops.length,
      email: body.profile?.email || null,
      createdAt: now,
      expiresAt: expiresAt,
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      shortId: body.shortId 
    });

  } catch (error) {
    console.error('Error guardando itinerario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shortId = searchParams.get('shortId');

    if (!shortId) {
      return NextResponse.json(
        { error: 'shortId requerido' },
        { status: 400 }
      );
    }

    // Buscar por shortId
    const snapshot = await db.collection('saved_itineraries')
      .where('shortId', '==', shortId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Itinerario no encontrado' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Verificar si no ha expirado - Mismo manejo que en [shortId]/route.ts
    if (data.expiresAt) {
      let expirationDate: Date;
      
      if (data.expiresAt.toDate && typeof data.expiresAt.toDate === 'function') {
        expirationDate = data.expiresAt.toDate();
      } else if (data.expiresAt._seconds) {
        expirationDate = new Date(data.expiresAt._seconds * 1000);
      } else if (data.expiresAt.seconds) {
        expirationDate = new Date(data.expiresAt.seconds * 1000);
      } else if (typeof data.expiresAt === 'string') {
        expirationDate = new Date(data.expiresAt);
      } else {
        expirationDate = new Date(data.expiresAt);
      }

      if (expirationDate < new Date()) {
        return NextResponse.json(
          { error: 'Itinerario expirado' },
          { status: 410 }
        );
      }
    }

    // Actualizar vistas
    await doc.ref.update({
      views: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Función helper para convertir timestamps
    const convertTimestamp = (timestamp: unknown): string | null => {
      if (!timestamp) return null;
      
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
      } else if ((timestamp as any)._seconds) {
        return new Date((timestamp as any)._seconds * 1000).toISOString();
      } else if ((timestamp as any).seconds) {
        return new Date((timestamp as any).seconds * 1000).toISOString();
      } else if (typeof timestamp === 'string') {
        return timestamp;
      } else {
        try {
          return new Date(timestamp).toISOString();
        } catch {
          return null;
        }
      }
    };

    // Convertir timestamps a strings para la respuesta
    const itinerary = {
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      expiresAt: convertTimestamp(data.expiresAt),
      lastViewedAt: convertTimestamp(data.lastViewedAt),
    };

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error obteniendo itinerario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}