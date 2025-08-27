// src/app/api/itinerary/[shortId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON || "{}");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export async function GET(
  _request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    if (!shortId) {
      return NextResponse.json({ error: "shortId requerido" }, { status: 400 });
    }

    const snapshot = await db
      .collection("saved_itineraries")
      .where("shortId", "==", shortId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Itinerario no encontrado" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.expiresAt) {
      let expirationDate: Date;
      if (data.expiresAt.toDate?.call) {
        expirationDate = data.expiresAt.toDate();
      } else if (data.expiresAt._seconds) {
        expirationDate = new Date(data.expiresAt._seconds * 1000);
      } else if (data.expiresAt.seconds) {
        expirationDate = new Date(data.expiresAt.seconds * 1000);
      } else if (typeof data.expiresAt === "string") {
        expirationDate = new Date(data.expiresAt);
      } else {
        expirationDate = new Date(data.expiresAt);
      }
      if (expirationDate < new Date()) {
        return NextResponse.json({ error: "Itinerario expirado" }, { status: 410 });
      }
    }

    await doc.ref.update({
      views: admin.firestore.FieldValue.increment(1),
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const toISO = (ts: any) => {
      if (!ts) return null;
      if (ts.toDate?.call) return ts.toDate().toISOString();
      if (ts._seconds) return new Date(ts._seconds * 1000).toISOString();
      if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
      if (typeof ts === "string") return ts;
      try { return new Date(ts).toISOString(); } catch { return null; }
    };

    const itinerary = {
      ...data,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
      expiresAt: toISO(data.expiresAt),
      lastViewedAt: toISO(data.lastViewedAt),
    };

    return NextResponse.json(itinerary);
  } catch (e) {
    console.error("Error obteniendo itinerario:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    const body = await request.json();
    const { email } = body;

    const snapshot = await db
      .collection("saved_itineraries")
      .where("shortId", "==", shortId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Itinerario no encontrado" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.profile?.email !== email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await doc.ref.delete();
    await db.collection("itinerary_metadata").doc(shortId).delete();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error eliminando itinerario:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
