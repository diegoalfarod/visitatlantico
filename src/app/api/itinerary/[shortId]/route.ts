import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;

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

    // Verificar si no ha expirado
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
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

    // Convertir timestamps a strings
    const itinerary = {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
      lastViewedAt: data.lastViewedAt?.toDate?.()?.toISOString() || data.lastViewedAt,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;

    // Verificar autorización (por email o token)
    const body = await request.json();
    const { email } = body;

    // Buscar el itinerario
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

    // Verificar que el email coincida
    if (data.profile?.email !== email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Eliminar documento
    await doc.ref.delete();

    // Eliminar metadata
    await db.collection('itinerary_metadata').doc(shortId).delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error eliminando itinerario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}