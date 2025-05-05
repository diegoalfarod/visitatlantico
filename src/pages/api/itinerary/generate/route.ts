import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import admin from "firebase-admin";

interface FirestoreDoc {
  coordinates?: { lat: number; lng: number };
  name?: string;
  title?: string;
  description?: string;
  municipality?: string;
}

interface ItineraryStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  startTime: string;
  durationMinutes: number;
  description: string;
  type: "destination" | "experience";
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ itinerary?: ItineraryStop[]; error?: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { profile, location } = req.body as {
    profile?: Record<string, string>;
    location?: { lat: number; lng: number } | null;
  };
  if (!profile) {
    return res.status(400).json({ error: "Faltan datos de perfil" });
  }

  // Inicializar Firebase Admin desde JSON en env
  if (!admin.apps.length) {
    const svc = JSON.parse(process.env.FIREBASE_SERVICE_JSON!) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: svc.project_id,
        clientEmail: svc.client_email,
        privateKey: svc.private_key.replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = admin.firestore();

  // Cargar colecciones
  const load = async (col: "destinations" | "experiences") => {
    const snap = await db.collection(col).get();
    return snap.docs
      .map((doc) => {
        const d = doc.data() as FirestoreDoc;
        if (
          d.coordinates?.lat != null &&
          d.coordinates?.lng != null &&
          (d.name || d.title) &&
          d.description
        ) {
          return {
            id: doc.id,
            name: col === "destinations" ? d.name! : d.title!,
            description: d.description,
            lat: d.coordinates.lat,
            lng: d.coordinates.lng,
            municipality: d.municipality ?? "",
            type: col === "destinations" ? "destination" : "experience",
            startTime: "",
            durationMinutes: 0,
          } as ItineraryStop;
        }
        return null;
      })
      .filter((s): s is ItineraryStop => s !== null);
  };

  const allStops = [
    ...(await load("destinations")),
    ...(await load("experiences")),
  ];

  if (location) {
    allStops.sort(
      (a, b) =>
        haversineDistance(location.lat, location.lng, a.lat, a.lng) -
        haversineDistance(location.lat, location.lng, b.lat, b.lng)
    );
  }

  // Construir prompt
  const profileText = Object.entries(profile)
    .map(([q, a]) => `- ${q}: ${a}`)
    .join("\n");
  const locText = location
    ? `Ubicación actual: (${location.lat}, ${location.lng})`
    : "Ubicación no proporcionada";
  const stopsList = allStops
    .map((s, i) => `${i + 1}. ${s.id} | ${s.name} (${s.lat},${s.lng})`)
    .join("\n");

  const systemPrompt = `
Eres un asistente de viajes para turistas en el Atlántico, Colombia.
Genera un itinerario de 5–7 paradas en formato JSON basado en el perfil y la ubicación.

Perfil:
${profileText}
${locText}

Opciones disponibles:
${stopsList}

Respuesta requerida (solo JSON):
[
  {
    "id": "...",
    "name": "...",
    "lat": 0.0,
    "lng": 0.0,
    "municipality": "...",
    "startTime": "HH:MM",
    "durationMinutes": 0,
    "description": "...",
    "type": "destination"|"experience"
  }
]
`.trim();

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      max_tokens: 1000,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const json = raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
    const itinerary = JSON.parse(json) as ItineraryStop[];

    return res.status(200).json({ itinerary });
  } catch (err) {
    console.error("Error generando itinerario:", err);
    return res.status(500).json({ error: "Respuesta inválida de OpenAI" });
  }
}
