/*  src/pages/api/chat.ts  */
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions";
import { dbAdmin } from "@/lib/firebaseAdmin";
import Redis from "ioredis";
import { franc } from "franc-min";
import { randomUUID } from "crypto";

/* ────────────────── Redis (caché opcional) ────────────────── */
const redis =
  process.env.REDIS_URL !== undefined ? new Redis(process.env.REDIS_URL) : null;

/* ────────────────── Tipos ────────────────── */
interface Message {
  role: "user" | "assistant" | "system";
  content?: string;
}

interface ChatRequest {
  conversationId?: string;
  messages: Message[];
  context?: ConversationContext;
}

interface ConversationContext {
  budget?: "economico" | "medio" | "alto";
  interests?: string[];
  travelDates?: { checkIn: string; checkOut: string };
  groupSize?: number;
  location?: string;
  previousRecommendations?: string[];
  language?: "es" | "en";
}

interface DestinationCard {
  id: string;
  name: string;
  url: string;
  image?: string;
  tagline?: string;
  type: "destination";
}

interface PlaceCard {
  id: string;
  name: string;
  address: string;
  rating?: number;
  price_level?: number;
  photo?: string;
  place_id: string;
  type: "place";
  category: "hotel" | "restaurant" | "attraction";
}

type Card = DestinationCard | PlaceCard;

/* Google Places (solo campos usados) */
interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  rating?: number;
  price_level?: number;
  photos?: { photo_reference: string }[];
}

/* ────────────────── Utilidades ────────────────── */
function detectLanguage(text: string): "es" | "en" {
  const code = franc(text, { minLength: 10 });
  if (code === "spa") return "es";
  if (code === "eng") return "en";
  return /[¿¡óáéíú]/i.test(text) ? "es" : "en";
}

/* ---------- Curiosidad / campos faltantes ---------- */
const REQUIRED_FIELDS = ["budget", "interests", "groupSize", "travelDates", "location"] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

const FIELD_PROMPTS: Record<RequiredField, { es: string; en: string }> = {
  budget: {
    es: "¿Qué presupuesto tienen para el viaje — económico, medio o alto?",
    en: "What's your budget for this trip — economical, medium or high?",
  },
  interests: {
    es: "Cuéntame qué tipo de actividades disfrutan (playa, gastronomía, aventura, cultura…).",
    en: "Tell me what activities you enjoy (beach, food, adventure, culture…).",
  },
  groupSize: {
    es: "¿Cuántas personas viajarán en total?",
    en: "How many people are in your group?",
  },
  travelDates: {
    es: "¿Ya tienen fechas de viaje (check-in y check-out)?",
    en: "Do you already have travel dates (check-in and check-out)?",
  },
  location: {
    es: "¿En qué ciudad o zona se van a hospedar o quisieran explorar primero?",
    en: "Which city or area are you staying in or want to explore first?",
  },
};

const missingFields = (c: ConversationContext) =>
  REQUIRED_FIELDS.filter((k) => !c[k]);

const buildFollowUpPrompt = (f: RequiredField[], lang: "es" | "en") =>
  !f.length
    ? ""
    : lang === "en"
    ? `Before giving any recommendations, ask: ${f.map((k) => FIELD_PROMPTS[k].en).join(" ")}`
    : `Antes de recomendar, pregunta: ${f.map((k) => FIELD_PROMPTS[k].es).join(" ")}`;

/* ────────────────── Google Places helper ────────────────── */
async function searchPlaces(
  query: string,
  type: "lodging" | "restaurant" | "tourist_attraction",
  location?: string
): Promise<PlaceCard[]> {
  const searchQuery = location
    ? `${query} ${location} Atlántico Colombia`
    : `${query} Atlántico Colombia`;

  const cacheKey = `places:${type}:${searchQuery}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery
    )}&type=${type}&region=co&language=es&key=${process.env.GOOGLE_PLACES_API_KEY}`
  );
  const data = (await res.json()) as {
    status: string;
    results: GooglePlace[];
    error_message?: string;
  };
  if (data.status !== "OK") {
    console.error("Google Places API:", data.status, data.error_message);
    return [];
  }

  const places: PlaceCard[] = data.results.slice(0, 3).map((p) => ({
    id: p.place_id,
    name: p.name,
    address: p.formatted_address ?? p.vicinity ?? "Dirección no disponible",
    rating: p.rating,
    price_level: p.price_level,
    photo: p.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      : undefined,
    place_id: p.place_id,
    type: "place",
    category:
      type === "lodging"
        ? "hotel"
        : type === "restaurant"
        ? "restaurant"
        : "attraction",
  }));

  if (redis) await redis.set(cacheKey, JSON.stringify(places), "EX", 3600);
  return places;
}

/* ────────────────── Contexto ────────────────── */
function extractContext(messages: Message[], prev?: ConversationContext): ConversationContext {
  const last =
    messages.filter((m) => m.role === "user").pop()?.content?.toLowerCase() ?? "";
  const ctx: ConversationContext = { ...prev };

  if (/(económic|barat|low budget|ahorro|económica)/.test(last)) ctx.budget = "economico";
  else if (/(medio|moderad|promedio|standard)/.test(last)) ctx.budget = "medio";
  else if (/(alto|lujo|luxury|premium|exclusivo)/.test(last)) ctx.budget = "alto";

  const addInt = (k: string) => {
    const s = new Set(ctx.interests);
    s.add(k);
    ctx.interests = [...s];
  };
  if (/(aventura|adventure|deportes|actividades)/.test(last)) addInt("aventura");
  if (/(relajar|relax|descanso|spa)/.test(last)) addInt("relajacion");
  if (/(cultura|historic|museos|patrimonio)/.test(last)) addInt("cultura");
  if (/(comida|gastronomía|food|restaurantes)/.test(last)) addInt("gastronomia");
  if (/(playa|beach|mar|costa)/.test(last)) addInt("playa");
  if (/(vida nocturna|nightlife|bares|discotecas)/.test(last)) addInt("vida-nocturna");
  if (/(familia|family|niños|kids)/.test(last)) addInt("familia");
  if (/(naturaleza|nature|parques|ecoturismo)/.test(last)) addInt("naturaleza");

  const locs = [
    "barranquilla","cartagena","santa marta","soledad","malambo","puerto colombia",
    "galapa","tubará","santo tomás","palmar de varela","sabanagrande","baranoa",
    "usiacurí","juan de acosta","piojó",
  ];
  const l = locs.find((x) => last.includes(x));
  if (l) ctx.location = l;

  const m = last.match(/(\d+)\s*(personas|people|persona|person)/);
  if (m) ctx.groupSize = Number(m[1]);

  ctx.language = detectLanguage(last);
  return ctx;
}

/* ────────────────── Memoria ────────────────── */
async function loadMemory(conversationId?: string) {
  if (!conversationId) return {};
  const doc = await dbAdmin.collection("conversations").doc(conversationId).get();
  return doc.exists ? (doc.data() as { context?: ConversationContext }) : {};
}

async function saveMemory(
  conversationId: string | undefined,
  ctx: ConversationContext,
  msgs: Message[]
) {
  if (!conversationId) return;
  await dbAdmin
    .collection("conversations")
    .doc(conversationId)
    .set(
      { context: ctx, summary: msgs.slice(-20).map((m) => m.content).join("\n") },
      { merge: true }
    );
}

/* ────────────────── Intento explícito de restaurantes/hoteles/atracciones ────────────────── */
type ForcedSearch = { query: string; place_type: "restaurant" | "lodging" | "tourist_attraction" } | null;

function detectForcedSearch(lastMsg: string): ForcedSearch {
  if (/(restaurantes?|restaurant|comida (local|típica)|local food|gastronomía)/i.test(lastMsg)) {
    return { query: "comida típica", place_type: "restaurant" };
  }
  if (/(hotel|hospedaje|alojamiento|lodging|resort)/i.test(lastMsg)) {
    return { query: "hotel", place_type: "lodging" };
  }
  if (/(atracciones?|things to do|lugares para visitar|turismo)/i.test(lastMsg)) {
    return { query: "atracciones turísticas", place_type: "tourist_attraction" };
  }
  return null;
}

/* ────────────────── API Handler ────────────────── */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Método no permitido");

  const body = req.body as ChatRequest;
  let conversationId = body.conversationId || randomUUID();
  const messages = body.messages;
  const prevCtx = body.context;

  if (!messages?.length) return res.status(400).end("Sin mensajes");

  const mem = await loadMemory(conversationId);
  const context = extractContext(messages, prevCtx ?? mem.context);
  const gaps = missingFields(context);

  /* --- Destinos Firestore --- */
  const snap = await dbAdmin.collection("destinations").get();
  const destinations: DestinationCard[] = snap.docs.map((d) => {
    const img = d.get("imagePath")?.replace(/^\/+/, "");
    return {
      id: d.id,
      name: d.get("name"),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/destinations/${d.id}`,
      image: img ? `${process.env.NEXT_PUBLIC_SITE_URL}/${img}` : undefined,
      tagline: d.get("tagline"),
      type: "destination",
    };
  });
  const destListText = destinations
    .map((d) => `• ${d.name} (id: ${d.id}) — ${d.tagline ?? ""} → ${d.url}`)
    .join("\n");

  /* --- Prompts --- */
  const personaPrompt = `
Eres Jimmy 🌴, el concierge premium del Atlántico, Colombia.

DESTINOS OFICIALES:
${destListText}

— Presupuesto: ${context.budget ?? "no definido"}
— Intereses: ${context.interests?.join(", ") || "ninguno"}
— Grupo: ${context.groupSize ?? "?"} personas
— Idioma: ${context.language}

Tu misión:
• Responder con calidez caribeña, emojis y tips internos.
• Si la consulta es sobre lugares a visitar o itinerarios → usa *destination_cards*.
• Si la consulta es sobre restaurantes, hoteles o atracciones puntuales → usa *search_places*.
• Si falta info para personalizar, pregunta antes de recomendar.
`.trim();

  const languageDir = `
When you reply:
• Spanish input → Spanish answer.
• English input → English answer.
• Mixed → Spanglish natural.
No invent fake data; ask if unsure.`.trim();

  const followUp = buildFollowUpPrompt(gaps, context.language ?? "es");
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content ?? "";
  const forcedSearch = detectForcedSearch(lastUserMsg);

  const history: ChatCompletionMessageParam[] = [
    { role: "system", content: personaPrompt },
    ...(followUp ? [{ role: "system", content: followUp }] : []),
    ...messages.map(({ role, content }) => ({ role, content: content ?? "" })),
    { role: "system", content: languageDir },
  ];

  const functions = [
    {
      name: "destination_cards",
      description: "Return up to 3 destination cards from the official list.",
      parameters: {
        type: "object",
        properties: {
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                url: { type: "string" },
                image: { type: "string" },
                tagline: { type: "string" },
              },
              required: ["id", "name", "url"],
            },
            maxItems: 3,
          },
        },
        required: ["cards"],
      },
    },
    {
      name: "search_places",
      description: "Search and return hotels, restaurants or attractions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          place_type: {
            type: "string",
            enum: ["lodging", "restaurant", "tourist_attraction"],
          },
          location: { type: "string" },
        },
        required: ["query", "place_type"],
      },
    },
  ] as const;

  /* --- OpenAI call --- */
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: history,
    functions,
    function_call: "auto",
    temperature: 0.9,
    presence_penalty: 0.4,
    max_tokens: 800,
  });

  const choice = completion.choices[0].message;
  const cards: Card[] = [];
  let reply = choice.content?.trim() ?? "";

  /* ---- destination_cards ---- */
  if (choice.function_call?.name === "destination_cards") {
    const { cards: recv } = JSON.parse(choice.function_call.arguments) as { cards: DestinationCard[] };
    cards.push(
      ...recv
        .filter((c) => destinations.some((d) => d.id === c.id))
        .slice(0, 3)
        .map((c) => ({ ...c, type: "destination" as const }))
    );
    if (!reply) {
      reply =
        context.language === "en"
          ? "Here are some must-see spots! 🌴✨"
          : "¡Estos destinos te van a encantar! 🌴✨";
    }
  }

  /* ---- search_places (llamada por modelo) ---- */
  if (choice.function_call?.name === "search_places") {
    const { query, place_type, location } = JSON.parse(choice.function_call.arguments) as {
      query: string;
      place_type: "lodging" | "restaurant" | "tourist_attraction";
      location?: string;
    };
    const places = await searchPlaces(query, place_type, location ?? context.location);
    cards.push(...places);
    if (!reply) {
      const cat =
        place_type === "lodging"
          ? context.language === "en"
            ? "accommodations"
            : "alojamientos"
          : place_type === "restaurant"
          ? context.language === "en"
            ? "restaurants"
            : "restaurantes"
          : context.language === "en"
          ? "attractions"
          : "atracciones";
      reply =
        context.language === "en"
          ? `Perfect! I found these ${cat} for you. 🎯✨`
          : `¡Perfecto! Encontré estas ${cat} para ti. 🎯✨`;
    }
  }

  /* ---- forced search (cuando el modelo no lo hizo) ---- */
  if (!cards.length && forcedSearch) {
    const places = await searchPlaces(
      forcedSearch.query,
      forcedSearch.place_type,
      context.location
    );
    if (places.length) {
      cards.push(...places);
      reply =
        context.language === "en"
          ? "Great picks! Here are some local spots: 🍽️"
          : "¡Buenísimo! Aquí tienes opciones locales: 🍽️";
    }
  }

  /* Fallback genérico */
  if (!reply) {
    reply =
      context.language === "en"
        ? "Let me know how else I can help you explore Atlántico! 🌴"
        : "¡Cuéntame cómo más puedo ayudarte a explorar el Atlántico! 🌴";
  }

  /* Guarda memoria si ya no faltan datos */
  if (!missingFields(context).length) {
    await saveMemory(conversationId, context, messages);
  }

  return res.status(200).json({
    reply: { role: "assistant", content: reply },
    cards,
    context,
    conversationId,
  });
}
