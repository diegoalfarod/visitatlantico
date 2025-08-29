// app/api/places/photo/route.ts
// Proxy seguro para fotos de Google Places (NFR-3)
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
const ref = req.nextUrl.searchParams.get('ref');
const w = req.nextUrl.searchParams.get('w') || '800';
if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
const key = process.env.GOOGLE_MAPS_API_KEY;
if (!key) return NextResponse.json({ error: 'Missing API key' }, { status: 500 });


// La API de photo redirige a la imagen final. Seguir redirect y retornar binario.
const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(
w,
)}&photo_reference=${encodeURIComponent(ref)}&key=${key}`;


const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) return NextResponse.json({ error: 'Photo fetch failed' }, { status: 502 });


const contentType = res.headers.get('content-type') || 'image/jpeg';
const arrayBuf = await res.arrayBuffer();
return new NextResponse(arrayBuf, {
headers: {
'content-type': contentType,
'cache-control': 'public, max-age=86400',
},
});
}