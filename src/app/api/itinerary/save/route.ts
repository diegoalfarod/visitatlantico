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

    // Guardar en Firestore
    const docRef = await db.collection('saved_itineraries').add({
      ...body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Guardar metadata para búsquedas rápidas
    await db.collection('itinerary_metadata').doc(body.shortId).set({
      shortId: body.shortId,
      title: body.title,
      days: body.days,
      totalStops: body.stops.length,
      email: body.profile?.email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: body.expiresAt ? admin.firestore.Timestamp.fromDate(new Date(body.expiresAt)) : null,
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
    const data = doc.data() as SavedItinerary;

    // Verificar si no ha expirado
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Itinerario expirado' },
        { status: 410 }
      );
    }

    // Actualizar vistas
    await doc.ref.update({
      views: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error obteniendo itinerario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}