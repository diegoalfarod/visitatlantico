// =============================================================================
// Seed Script - Populate Firebase Events Collection
// Run with: npx ts-node --project tsconfig.json scripts/seedEvents.ts
// Or add to package.json: "seed:events": "ts-node scripts/seedEvents.ts"
// =============================================================================

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_KbSPZjdXgR_u8r-c6NZ8oxR85loKvUU",
  authDomain: "visitatlantico-f5c09.firebaseapp.com",
  projectId: "visitatlantico-f5c09",
  storageBucket: "visitatlantico-f5c09.firebasestorage.app",
  messagingSenderId: "1097999694057",
  appId: "1:1097999694057:web:2e01d75dabe931d24dd878",
  measurementId: "G-P11NC2E1RQ"
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getFirestore();

// =============================================================================
// SAMPLE EVENTS DATA
// =============================================================================

const events = [
  {
    id: "lectura-del-bando-2025",
    slug: "lectura-del-bando-2025",
    title: "Lectura del Bando",
    subtitle: "Inicio oficial del Carnaval",
    description: "La Lectura del Bando marca el inicio oficial del Carnaval de Barranquilla. En este evento, la Reina del Carnaval lee el decreto que invita a todos los barranquilleros y visitantes a participar de la fiesta más grande de Colombia. Un espectáculo lleno de color, música y alegría que da la bienvenida a la temporada carnavalera.",
    dates: "18 Ene",
    dateStart: "2025-01-18",
    time: "5:00 PM",
    location: "Estadio Romelio Martínez",
    municipality: "Barranquilla",
    address: "Calle 72 con Carrera 46",
    image: "/images/events/lectura-bando.jpg",
    isFree: true,
    featured: false,
    category: "carnaval",
    tags: ["carnaval", "tradicional", "apertura"],
    coordinates: { lat: 10.9878, lng: -74.7889 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "la-guacherna-2025",
    slug: "la-guacherna-2025",
    title: "La Guacherna",
    subtitle: "Desfile nocturno de faroles y cumbia",
    description: "La Guacherna es uno de los eventos más emblemáticos del Carnaval de Barranquilla. Este desfile nocturno recorre las principales calles de la ciudad iluminado por miles de faroles y velas. Los grupos folclóricos danzan al ritmo de la cumbia mientras la ciudad se llena de magia y tradición. En 2025, el evento rendirá un homenaje especial a los 25 años de carrera de Shakira.",
    dates: "22 Feb",
    dateStart: "2025-02-22",
    time: "7:00 PM",
    location: "Carrera 44",
    municipality: "Barranquilla",
    address: "Carrera 44 desde Calle 72 hasta Calle 84",
    image: "/images/events/guacherna.jpg",
    isFree: true,
    featured: true,
    category: "carnaval",
    tags: ["carnaval", "desfile", "nocturno", "cumbia"],
    coordinates: { lat: 10.9932, lng: -74.7922 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "coronacion-reyes-2025",
    slug: "coronacion-reyes-2025",
    title: "Coronación de Reyes",
    subtitle: "Show con Maluma en concierto",
    description: "La noche de Coronación de los Reyes del Carnaval es una de las más esperadas. En este magno evento se coronan oficialmente a la Reina y al Rey Momo del Carnaval 2025. El espectáculo incluye shows de artistas nacionales e internacionales, este año con la presentación especial de Maluma.",
    dates: "28 Feb",
    dateStart: "2025-02-28",
    time: "8:00 PM",
    location: "Estadio Romelio Martínez",
    municipality: "Barranquilla",
    address: "Calle 72 con Carrera 46",
    image: "/images/events/coronacion-reyes.jpg",
    isFree: false,
    price: "Desde $150.000 COP",
    featured: false,
    category: "carnaval",
    tags: ["carnaval", "concierto", "coronación"],
    coordinates: { lat: 10.9878, lng: -74.7889 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "batalla-de-flores-2025",
    slug: "batalla-de-flores-2025",
    title: "Batalla de Flores",
    subtitle: "El desfile más grande de Colombia",
    description: "La Batalla de Flores es el evento central del Carnaval de Barranquilla y el desfile más grande de Colombia. Más de 500 grupos folclóricos, carrozas decoradas con miles de flores, comparsas y cumbiambas recorren la Vía 40 en un espectáculo de color, música y alegría que dura más de 8 horas. Es considerado Patrimonio Cultural e Inmaterial de la Humanidad por la UNESCO.",
    dates: "1 Mar",
    dateStart: "2025-03-01",
    time: "12:00 PM",
    location: "Vía 40",
    municipality: "Barranquilla",
    address: "Vía 40 desde Calle 17 hasta Country",
    image: "/images/events/batalla-flores.jpg",
    isFree: false,
    price: "Palcos desde $80.000 COP",
    featured: true,
    category: "carnaval",
    tags: ["carnaval", "desfile", "patrimonio", "UNESCO"],
    coordinates: { lat: 11.0041, lng: -74.8070 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "gran-parada-tradicion-2025",
    slug: "gran-parada-tradicion-2025",
    title: "Gran Parada de Tradición",
    subtitle: "Cumbia, mapalé y folclor puro",
    description: "La Gran Parada de Tradición es el espacio donde las expresiones folclóricas más auténticas del Caribe colombiano se toman las calles. Cumbiambas, grupos de mapalé, danzas de congo y todas las manifestaciones tradicionales desfilan sin carrozas ni vehículos, mostrando la esencia pura del Carnaval.",
    dates: "2 Mar",
    dateStart: "2025-03-02",
    time: "1:00 PM",
    location: "Vía 40",
    municipality: "Barranquilla",
    address: "Vía 40 desde Calle 17 hasta Country",
    image: "/images/events/gran-parada-tradicion.jpg",
    isFree: false,
    price: "Palcos desde $60.000 COP",
    featured: false,
    category: "carnaval",
    tags: ["carnaval", "tradición", "folclor", "cumbia"],
    coordinates: { lat: 11.0041, lng: -74.8070 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "festival-orquestas-2025",
    slug: "festival-orquestas-2025",
    title: "Festival de Orquestas",
    subtitle: "Competencia por el Congo de Oro",
    description: "El Festival de Orquestas es la competencia musical más importante del Carnaval. Las mejores orquestas del país compiten por el codiciado Congo de Oro interpretando porros, cumbias, salsas y otros ritmos tropicales. Una noche llena de música y baile que se extiende hasta el amanecer.",
    dates: "2 Mar",
    dateStart: "2025-03-02",
    time: "8:00 PM",
    location: "Par Vial Carrera 50",
    municipality: "Barranquilla",
    address: "Carrera 50 con Calle 79",
    image: "/images/events/festival-orquestas.jpg",
    isFree: false,
    price: "Desde $100.000 COP",
    featured: false,
    category: "musica",
    tags: ["música", "orquestas", "salsa", "carnaval"],
    coordinates: { lat: 10.9956, lng: -74.7967 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "entierro-joselito-2025",
    slug: "entierro-joselito-2025",
    title: "Entierro de Joselito",
    subtitle: "Despedida del Carnaval",
    description: "El Entierro de Joselito marca el final del Carnaval de Barranquilla. Joselito representa el espíritu del carnaval que 'muere' después de cuatro días de fiesta intensa. Las viudas de Joselito (hombres disfrazados de mujeres enlutadas) lloran y bailan mientras despiden al personaje más querido del carnaval. Un evento lleno de humor, nostalgia y la promesa de volver el próximo año.",
    dates: "4 Mar",
    dateStart: "2025-03-04",
    time: "3:00 PM",
    location: "Parque Los Fundadores",
    municipality: "Barranquilla",
    address: "Calle 74 con Carrera 57",
    image: "/images/events/entierro-joselito.jpg",
    isFree: true,
    featured: false,
    category: "carnaval",
    tags: ["carnaval", "tradición", "cierre"],
    coordinates: { lat: 10.9889, lng: -74.7878 },
    organizer: "Carnaval de Barranquilla S.A.S.",
    contact: {
      phone: "+57 605 3197716",
      website: "https://carnavaldebarranquilla.org"
    }
  },
  {
    id: "festival-ciruela-2025",
    slug: "festival-ciruela-2025",
    title: "Festival de la Ciruela",
    subtitle: "Tradición gastronómica de Campeche",
    description: "El Festival de la Ciruela celebra la cosecha de esta fruta tropical en el corregimiento de Campeche, Baranoa. Durante cuatro días, los visitantes pueden disfrutar de productos derivados de la ciruela, dulces tradicionales, artesanías y presentaciones folclóricas. Una fiesta que resalta la riqueza gastronómica del Atlántico.",
    dates: "21-24 Mar",
    dateStart: "2025-03-21",
    dateEnd: "2025-03-24",
    time: "10:00 AM - 10:00 PM",
    location: "Campeche",
    municipality: "Baranoa",
    address: "Plaza Principal de Campeche",
    image: "/images/events/festival-ciruela.jpg",
    isFree: true,
    featured: true,
    category: "gastronomia",
    tags: ["gastronomía", "festival", "tradición", "frutas"],
    coordinates: { lat: 10.7942, lng: -74.9167 },
    organizer: "Alcaldía de Baranoa",
    contact: {
      phone: "+57 605 8787676",
      website: "https://baranoa-atlantico.gov.co"
    }
  },
  {
    id: "festival-arepa-huevo-2025",
    slug: "festival-arepa-huevo-2025",
    title: "Festival de la Arepa de Huevo",
    subtitle: "36 años celebrando el sabor del Atlántico",
    description: "El Festival de la Arepa de Huevo es una celebración de uno de los platos más emblemáticos de la gastronomía del Caribe colombiano. En Luruaco, cuna de la arepa de huevo, los mejores cocineros compiten por preparar la arepa perfecta. El festival incluye concursos, muestras gastronómicas, música en vivo y actividades culturales para toda la familia.",
    dates: "28-30 Jun",
    dateStart: "2025-06-28",
    dateEnd: "2025-06-30",
    time: "9:00 AM - 11:00 PM",
    location: "Plaza Principal",
    municipality: "Luruaco",
    address: "Plaza Principal de Luruaco",
    image: "/images/events/festival-arepa-huevo.jpg",
    isFree: true,
    featured: true,
    category: "gastronomia",
    tags: ["gastronomía", "arepa", "tradición", "concurso"],
    coordinates: { lat: 10.6108, lng: -75.1436 },
    organizer: "Alcaldía de Luruaco",
    contact: {
      phone: "+57 605 8797070",
      website: "https://luruaco-atlantico.gov.co"
    }
  }
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seedEvents() {
  console.log("🌱 Starting events seed...\n");
  
  const eventsRef = collection(db, "events");
  
  for (const event of events) {
    try {
      const eventDoc = doc(eventsRef, event.id);
      await setDoc(eventDoc, {
        ...event,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Created: ${event.title}`);
    } catch (error) {
      console.error(`❌ Error creating ${event.title}:`, error);
    }
  }
  
  console.log("\n🎉 Seed completed!");
  console.log(`📊 Total events: ${events.length}`);
  process.exit(0);
}

// Run seed
seedEvents();