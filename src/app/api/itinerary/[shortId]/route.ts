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
  context: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await context.params;

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

    // Verificar si no ha expirado - Manejo mejorado de timestamps
    if (data.expiresAt) {
      let expirationDate: Date;
      
      // Manejar diferentes formatos de fecha
      if (data.expiresAt.toDate && typeof data.expiresAt.toDate === 'function') {
        // Es un Timestamp de Firestore
        expirationDate = data.expiresAt.toDate();
      } else if (data.expiresAt._seconds) {
        // Es un objeto Timestamp serializado
        expirationDate = new Date(data.expiresAt._seconds * 1000);
      } else if (data.expiresAt.seconds) {
        // Otro formato de Timestamp
        expirationDate = new Date(data.expiresAt.seconds * 1000);
      } else if (typeof data.expiresAt === 'string') {
        // Es una string de fecha
        expirationDate = new Date(data.expiresAt);
      } else {
        // Intentar convertir directamente
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
      
      // Type guard para Firestore Timestamp
      if (typeof timestamp === 'object' && timestamp !== null) {
        const ts = timestamp as any;
        if (ts.toDate && typeof ts.toDate === 'function') {
          return ts.toDate().toISOString();
        } else if (ts._seconds) {
          return new Date(ts._seconds * 1000).toISOString();
        } else if (ts.seconds) {
          return new Date(ts.seconds * 1000).toISOString();
        }
      }
      
      if (typeof timestamp === 'string') {
        return timestamp;
      }
      
      try {
        return new Date(timestamp as any).toISOString();
      } catch {
        return null;
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await context.params;

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