// src/app/api/analytics/track/route.ts
// Endpoint para trackear engagement de itinerarios

import { NextRequest, NextResponse } from "next/server";

interface TrackRequest {
  event: 'view' | 'share' | 'pdf' | 'place_click' | 'time_update';
  itineraryId: string;
  data?: {
    timeOnPage?: number;
    scrollDepth?: number;
    shareMethod?: string;
    placeId?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackRequest = await req.json();
    const { event, itineraryId, data } = body;

    if (!itineraryId) {
      return NextResponse.json({ error: 'itineraryId requerido' }, { status: 400 });
    }

    if (!process.env.FIREBASE_SERVICE_JSON) {
      return NextResponse.json({ success: true, message: 'Analytics disabled' });
    }

    const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    const analyticsRef = db.collection("analytics_itineraries").doc(itineraryId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (event) {
      case 'view':
        await analyticsRef.update({
          'engagement.viewed': true,
          'engagement.viewedAt': now,
          updatedAt: now
        });
        
        // Actualizar contador diario de vistas
        await db.collection("analytics_daily").doc(today).set({
          totalViews: FieldValue.increment(1),
          updatedAt: now
        }, { merge: true });
        break;

      case 'time_update':
        if (data?.timeOnPage) {
          await analyticsRef.update({
            'engagement.timeOnPage': data.timeOnPage,
            'engagement.scrollDepth': data.scrollDepth || 0,
            updatedAt: now
          });
        }
        break;

      case 'share':
        await analyticsRef.update({
          'engagement.shared': true,
          'engagement.sharedVia': FieldValue.arrayUnion(data?.shareMethod || 'unknown'),
          updatedAt: now
        });
        
        // Actualizar contador de shares
        await db.collection("analytics_daily").doc(today).set({
          totalShares: FieldValue.increment(1),
          [`sharesByMethod.${data?.shareMethod || 'unknown'}`]: FieldValue.increment(1),
          updatedAt: now
        }, { merge: true });
        break;

      case 'pdf':
        await analyticsRef.update({
          'engagement.savedPdf': true,
          updatedAt: now
        });
        
        await db.collection("analytics_daily").doc(today).set({
          totalPdfDownloads: FieldValue.increment(1),
          updatedAt: now
        }, { merge: true });
        break;

      case 'place_click':
        if (data?.placeId) {
          await analyticsRef.update({
            'engagement.clickedPlaces': FieldValue.arrayUnion(data.placeId),
            updatedAt: now
          });
          
          // Actualizar contador de clicks por lugar
          await db.collection("analytics_global").doc("place_stats").set({
            [`clickCount.${data.placeId.replace(/[^a-zA-Z0-9_-]/g, '_')}`]: FieldValue.increment(1),
            lastUpdated: now
          }, { merge: true });
        }
        break;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Error tracking event' },
      { status: 500 }
    );
  }
}