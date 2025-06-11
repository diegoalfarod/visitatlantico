import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import admin from "firebase-admin";

/* ─────────── Tipos ─────────── */
interface FirestoreDoc {
  coordinates?: { lat: number; lng: number };
  name?: string;
  title?: string;
  description?: string;
  municipality?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
  imagePath?: string;
  imagePaths?: string[];
}

export interface ItineraryStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  startTime: string;
  durationMinutes: number;
  description: string;
  type: "destination" | "experience";
  category?: string;
  imageUrl?: string;
  photos?: string[];              // 👈 se añade galería
}

/* ─────────── Helpers ─────────── */
const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const R = 6371;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const travelMinutes = (a: ItineraryStop, b: ItineraryStop) =>
  Math.max(10, Math.round((haversine(a, b) / 30) * 60));

const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const getMunicipality = (address?: string) =>
  address ? address.split(",")[0].trim() : "Ubicación desconocida";

/* ═══════════════════════════════════════════ */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ itinerary?: ItineraryStop[]; error?: string }>
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!process.env.FIREBASE_SERVICE_JSON || !process.env.OPENAI_API_KEY)
      throw new Error("Configuración del servidor incompleta");

    const { profile, location } = req.body as {
      profile: Record<string, string>;
      location: { lat: number; lng: number } | null;
    };

    const totalDays = Number(profile?.Días);
    if (!totalDays || totalDays < 1 || !profile?.Motivo)
      return res
        .status(400)
        .json({ error: "Perfil incompleto: faltan días (>0) o motivo" });

    /* ── Firebase ── */
    if (!admin.apps.length) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_JSON);
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: svc.project_id,
          clientEmail: svc.client_email,
          privateKey: svc.private_key.replace(/\\n/g, "\n"),
        }),
      });
    }
    const db = admin.firestore();

    /* ── Cargar destinos y experiencias ── */
    const [destinations, experiences] = await Promise.all([
      loadCollection(db, "destinations"),
      loadCollection(db, "experiences"),
    ]);
    const allStops = [...destinations, ...experiences];
    if (!allStops.length)
      return res
        .status(404)
        .json({ error: "No hay material turístico cargado" });

    /* ── Prompts ── */
    const systemPrompt = buildSystemPrompt(
      totalDays,
      allStops.map(({ id, name, municipality, type, category }) => ({
        id,
        name,
        municipality,
        type,
        category,
      })),
      location
    );
    const userPrompt = buildUserPrompt(profile);

    /* ── OpenAI ── */
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const aiRaw = await generateAIItinerary(openai, systemPrompt, userPrompt);

    /* ── Validar respuesta ── */
    const { validItinerary, invalidIds } = validateAIResponse(aiRaw, allStops);

    if (!validItinerary.length)
      return res.status(400).json({
        error:
          invalidIds.length > 0
            ? `La IA devolvió IDs inexistentes: ${invalidIds.join(", ")}`
            : "La IA no generó un itinerario válido",
      });

    /* ── Verificar contra Firestore ── */
    const verified = await verifyFirestoreDocuments(db, validItinerary);
    if (!verified.length)
      return res.status(404).json({ error: "Documentos no encontrados" });

    /* ── Horarios finales ── */
    const finalItinerary = calculateTimings(verified);

    /* ── Persistir solicitud ── */
    savePlanningRequest(db, profile, location, finalItinerary).catch(
      console.error
    );

    return res.status(200).json({ itinerary: finalItinerary });
  } catch (err) {
    console.error("Error generate.ts:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Error interno del servidor",
    });
  }
}

/* ─────────── Auxiliares ─────────── */

async function loadCollection(
  db: FirebaseFirestore.Firestore,
  collection: "destinations" | "experiences"
) {
  try {
    const snap = await db.collection(collection).get();
    return snap.docs
      .map((doc) => {
        const data = doc.data() as FirestoreDoc;
        if (!data.coordinates?.lat || !data.coordinates?.lng || !data.description)
          return null;

        return {
          id: doc.id,
          name:
            collection === "destinations"
              ? data.name || "Destino sin nombre"
              : data.title || "Experiencia sin nombre",
          lat: data.coordinates.lat,
          lng: data.coordinates.lng,
          municipality:
            data.municipality || getMunicipality(data.address),
          description: data.description,
          category: data.category || "general",
          imageUrl:
            data.imageUrl ||
            data.imagePath ||
            data.imagePaths?.[0] ||
            "/default-image.jpg",
          photos: Array.isArray(data.imagePaths) ? data.imagePaths : undefined,
          type: collection === "destinations" ? "destination" : "experience",
          startTime: "",
          durationMinutes: 0,
        } as ItineraryStop;
      })
      .filter(Boolean) as ItineraryStop[];
  } catch (e) {
    console.error(`Error cargando ${collection}:`, e);
    return [];
  }
}

function buildSystemPrompt(
  days: number,
  stops: Array<{
    id: string;
    name: string;
    municipality: string;
    type: string;
    category?: string;
  }>,
  location: { lat: number; lng: number } | null
) {
  return `
Eres un guía turístico experto del Atlántico, Colombia.
Crea un itinerario de ${days} día(s) usando **solo** los siguientes lugares (ID exacto):

${stops
  .map(
    (s) =>
      `• ${s.id} | ${s.type.toUpperCase()} | ${s.name} (${s.municipality})`
  )
  .join("\n")}

Reglas:
1. Usa únicamente IDs listados.
2. Entre 2 y 3 paradas por día (idealmente 3).
3. Formato JSON final: {"itinerary":[{"id":"xxx","startTime":"HH:MM","durationMinutes":NN},…]}
4. Horario entre 08:00 y 20:00 y respeta cercanía geográfica.
5. Balancea destinos y experiencias.

${
  location
    ? `Punto inicial del usuario: ${location.lat}, ${location.lng}`
    : ""
}`.trim();
}

function buildUserPrompt(profile: Record<string, string>) {
  return `
Viajero:
• Días: ${profile.Días}
• Intereses: ${profile.Motivo}
• ¿Visitar otros municipios?: ${profile["Otros municipios"] ?? "No"}
`.trim();
}

async function generateAIItinerary(
  openai: OpenAI,
  systemPrompt: string,
  userPrompt: string
) {
  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1500,
  });
  return resp.choices[0]?.message?.content ?? "{}";
}

function validateAIResponse(aiJSON: string, allStops: ItineraryStop[]) {
  try {
    const parsed = JSON.parse(aiJSON);
    const aiItinerary =
      parsed.itinerary ??
      parsed.Itinerario ??
      parsed.Itinerary ??
      parsed.itinerario ??
      [];

    const valid: ItineraryStop[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();

    interface AIItem {
      id: string;
      startTime?: string;
      durationMinutes?: number;
    }

    aiItinerary.forEach((item: AIItem) => {
      if (!item?.id || seen.has(item.id)) return;
      seen.add(item.id);
      const found = allStops.find((s) => s.id === item.id);
      if (!found) {
        invalid.push(item.id);
        return;
      }
      valid.push({
        ...found,
        // handle optional times gracefully
        startTime: validateTime(item.startTime ?? ''),
        durationMinutes: validateDuration(item.durationMinutes),
      });
    });

    return { validItinerary: valid, invalidIds: invalid };
  } catch (e) {
    console.error("Error parseando JSON IA:", e);
    return { validItinerary: [], invalidIds: [] };
  }
}

const validateTime = (t: string) => (/^\d{1,2}:\d{2}$/.test(t) ? t : "");
const validateDuration = (d?: number) => Math.max(30, Math.min(d || 60, 240));

async function verifyFirestoreDocuments(
  db: FirebaseFirestore.Firestore,
  itinerary: ItineraryStop[]
) {
  const results = await Promise.all(
    itinerary.map(async (s) => {
      const snap = await db
        .collection(s.type === "destination" ? "destinations" : "experiences")
        .doc(s.id)
        .get();
      return snap.exists ? s : null;
    })
  );
  return results.filter(Boolean) as ItineraryStop[];
}

function calculateTimings(itinerary: ItineraryStop[]) {
  let current = 9 * 60;
  return itinerary.map((s, idx) => {
    if (idx) current += travelMinutes(itinerary[idx - 1], s);
    const start = s.startTime || toHHMM(current);
    current = toMin(start) + s.durationMinutes;
    return { ...s, startTime: start };
  });
}

async function savePlanningRequest(
  db: FirebaseFirestore.Firestore,
  profile: Record<string, string>,
  location: { lat: number; lng: number } | null,
  itinerary: ItineraryStop[]
) {
  try {
    await db.collection("planner_requests").add({
      email: profile.Email ?? null,
      profile,
      location,
      itinerary,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("Error guardando planner_requests:", e);
  }
}
