// src/data/atlantico-places.ts
// FUENTE ÚNICA DE VERDAD - Base de datos curada de lugares turísticos del Atlántico
//
// ⚠️ IMPORTANTE: Este archivo es usado por TODOS los sistemas:
// - Jimmy Chatbot (conversaciones y recomendaciones)
// - PlannerPage (generación de itinerarios)
// - API /chat (contexto para Claude)
// - API /itinerary/generate (selección de lugares)
//
// Cualquier cambio aquí se refleja automáticamente en toda la aplicación.
// Ver: ACTUALIZAR_BASE_DATOS.md para guía completa de uso

import { 
    Waves, Camera, Utensils, Music, Palette, Bird, 
    Church, Building2, TreePalm, Fish, PartyPopper,
    Coffee, ShoppingBag, Sunrise, Moon, Landmark,
    Ship, Bike, Heart, Sparkles, MapPin
  } from "lucide-react";
  
  // =============================================================================
  // TIPOS
  // =============================================================================
  
  export interface CuratedPlace {
    id: string;
    name: string;
    slug: string;
    
    // Descripción
    shortDescription: string;
    longDescription: string;
    localTip: string;
    
    // Ubicación
    municipality: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    
    // Categorización
    category: PlaceCategory;
    subcategories: string[];
    interests: string[]; // IDs de intereses que satisface
    
    // Información práctica
    typicalDuration: number; // minutos
    priceRange: PriceRange;
    estimatedCost: number; // COP promedio por persona
    
    // Horarios
    schedule: {
      opens: string;
      closes: string;
      closedDays?: string[];
      bestTime?: string;
      peakHours?: string;
    };
    
    // Perfil de visitante
    suitableFor: TripType[];
    physicalLevel: 'low' | 'moderate' | 'high';
    familyFriendly: boolean;
    romanticSpot: boolean;
    instagrammable: boolean;
    
    // Media
    images: string[];
    primaryImage: string;
    
    // Metadata
    rating: number;
    reviewCount: number;
    verified: boolean;
    featured: boolean;
    
    // Contexto para IA
    aiContext: string;
    mustTry: string[];
    avoidIf: string[];
  }
  
  export type PlaceCategory = 
    | 'playa'
    | 'museo'
    | 'restaurante'
    | 'bar'
    | 'parque'
    | 'iglesia'
    | 'monumento'
    | 'mercado'
    | 'artesanias'
    | 'mirador'
    | 'naturaleza'
    | 'entretenimiento'
    | 'cafe'
    | 'hotel';
  
  export type PriceRange = 'gratis' | 'economico' | 'moderado' | 'premium';
  
  export type TripType = 'solo' | 'pareja' | 'familia' | 'amigos';
  
  // =============================================================================
  // LUGARES CURADOS DEL ATLÁNTICO
  // =============================================================================
  
  export const CURATED_PLACES: CuratedPlace[] = [
    // =========================================================================
    // BARRANQUILLA - CULTURA Y ENTRETENIMIENTO
    // =========================================================================
    {
      id: "museo-del-caribe",
      name: "Museo del Caribe",
      slug: "museo-del-caribe",
      shortDescription: "El museo más importante del Caribe colombiano",
      longDescription: "Centro cultural interactivo que celebra la identidad caribeña a través de exposiciones inmersivas sobre naturaleza, historia, música y tradiciones. Cinco salas temáticas te llevan en un viaje por la región.",
      localTip: "Los martes tienen descuento. Pregunta por la visita guiada gratuita a las 10am y 3pm.",
      municipality: "Barranquilla",
      address: "Calle 36 #46-66, Centro Histórico",
      coordinates: { lat: 10.9639, lng: -74.7964 },
      category: "museo",
      subcategories: ["cultura", "historia", "interactivo"],
      interests: ["carnaval_cultura", "historia_patrimonio"],
      typicalDuration: 120,
      priceRange: "economico",
      estimatedCost: 18000,
      schedule: {
        opens: "09:00",
        closes: "17:00",
        closedDays: ["Lunes"],
        bestTime: "Mañana (10-12)",
        peakHours: "Domingos 2-4pm"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/museo-caribe-1.jpg",
        "/images/places/museo-caribe-2.jpg"
      ],
      primaryImage: "/images/places/museo-caribe-1.jpg",
      rating: 4.7,
      reviewCount: 2850,
      verified: true,
      featured: true,
      aiContext: "Museo interactivo ideal para entender la cultura caribeña. Perfecto para familias y parejas. Tiene aire acondicionado, ideal para escapar del calor.",
      mustTry: ["Sala de la Naturaleza con proyecciones", "Exposición de Gabriel García Márquez", "Tienda de souvenirs"],
      avoidIf: ["Buscas actividades al aire libre", "Tienes poco tiempo (necesitas mínimo 2 horas)"]
    },
    
    {
      id: "gran-malecon",
      name: "Gran Malecón del Río",
      slug: "gran-malecon-del-rio",
      shortDescription: "El paseo fluvial más emblemático de Colombia",
      longDescription: "5 kilómetros de paseo junto al Río Magdalena con restaurantes, parques, ciclovía, y la mejor vista del atardecer barranquillero. Reconocido por TripAdvisor como una de las atracciones más populares del mundo.",
      localTip: "Llega al atardecer (5:30pm) para ver el cielo tornarse naranja. Los fines de semana hay shows de luces a las 7pm.",
      municipality: "Barranquilla",
      address: "Vía 40, desde Puerta de Oro hasta Bocas de Ceniza",
      coordinates: { lat: 10.9878, lng: -74.7889 },
      category: "parque",
      subcategories: ["paseo", "gastronomia", "deportes", "familia"],
      interests: ["playas_rio", "gastronomia_local", "naturaleza_aventura"],
      typicalDuration: 150,
      priceRange: "gratis",
      estimatedCost: 0,
      schedule: {
        opens: "06:00",
        closes: "22:00",
        bestTime: "Atardecer (5:30-7pm)",
        peakHours: "Domingos todo el día"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/malecon-1.jpg",
        "/images/places/malecon-2.jpg",
        "/images/places/malecon-atardecer.jpg"
      ],
      primaryImage: "/images/places/malecon-1.jpg",
      rating: 4.6,
      reviewCount: 15200,
      verified: true,
      featured: true,
      aiContext: "Lugar imprescindible de Barranquilla. Ideal para cualquier tipo de viajero. Tiene zona de comidas (Caimán del Río), parque infantil, rueda de la fortuna, y mucho más. Perfecto para atardeceres románticos.",
      mustTry: ["Foto en las letras de BARRANQUILLA", "Raspao o cholao en los kioscos", "Paseo en bicicleta", "Cena en Caimán del Río"],
      avoidIf: ["Es mediodía y hace mucho sol", "Buscas algo tranquilo un domingo"]
    },
    
    {
      id: "casa-del-carnaval",
      name: "Casa del Carnaval",
      slug: "casa-del-carnaval",
      shortDescription: "Vive el Carnaval todo el año",
      longDescription: "Museo dedicado al Carnaval de Barranquilla, Patrimonio de la Humanidad. Exhibe trajes, máscaras, instrumentos y la historia de la fiesta más grande de Colombia. Shows en vivo de cumbia y mapalé.",
      localTip: "Los sábados a las 11am hay presentación de danzas tradicionales incluida en la entrada.",
      municipality: "Barranquilla",
      address: "Carrera 54 #49B-39, Centro",
      coordinates: { lat: 10.9633, lng: -74.7958 },
      category: "museo",
      subcategories: ["carnaval", "folclor", "danza", "musica"],
      interests: ["carnaval_cultura"],
      typicalDuration: 90,
      priceRange: "economico",
      estimatedCost: 15000,
      schedule: {
        opens: "09:00",
        closes: "17:00",
        closedDays: ["Lunes"],
        bestTime: "Sábados 11am (show de danzas)"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/casa-carnaval-1.jpg",
        "/images/places/casa-carnaval-2.jpg"
      ],
      primaryImage: "/images/places/casa-carnaval-1.jpg",
      rating: 4.5,
      reviewCount: 1200,
      verified: true,
      featured: true,
      aiContext: "Ideal para entender el Carnaval de Barranquilla sin importar la época del año. Las presentaciones de danza son espectaculares. Perfecto para familias con niños.",
      mustTry: ["Show de cumbia y mapalé", "Foto con trajes de congo", "Taller de máscaras (previa reserva)"],
      avoidIf: ["Ya viste el Carnaval en vivo", "Tienes menos de 1 hora"]
    },
    
    {
      id: "zoologico-barranquilla",
      name: "Zoológico de Barranquilla",
      slug: "zoologico-barranquilla",
      shortDescription: "El zoológico más antiguo de Colombia",
      longDescription: "Fundado en 1956, alberga más de 500 animales de 140 especies. Destaca por su programa de conservación del cóndor andino y el manatí. Áreas sombreadas y recorrido circular fácil de seguir.",
      localTip: "Llega temprano (9am) cuando los animales están más activos. Lleva agua y protector solar.",
      municipality: "Barranquilla",
      address: "Calle 77 #68-40",
      coordinates: { lat: 10.9972, lng: -74.8125 },
      category: "entretenimiento",
      subcategories: ["naturaleza", "animales", "familia", "educativo"],
      interests: ["naturaleza_aventura"],
      typicalDuration: 180,
      priceRange: "economico",
      estimatedCost: 25000,
      schedule: {
        opens: "09:00",
        closes: "17:00",
        bestTime: "Mañana (9-11am)",
        peakHours: "Domingos"
      },
      suitableFor: ["familia", "amigos"],
      physicalLevel: "moderate",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/zoo-1.jpg",
        "/images/places/zoo-2.jpg"
      ],
      primaryImage: "/images/places/zoo-1.jpg",
      rating: 4.4,
      reviewCount: 3500,
      verified: true,
      featured: false,
      aiContext: "Perfecto para familias con niños. El recorrido toma 2-3 horas. Tiene zonas de descanso con sombra. Evitar en horas de mucho calor.",
      mustTry: ["Exhibición de manatíes", "Aviario tropical", "Área de reptiles"],
      avoidIf: ["No te gustan los zoológicos", "Es un día muy caluroso", "Viajas en pareja sin niños"]
    },
  
    // =========================================================================
    // BARRANQUILLA - GASTRONOMÍA
    // =========================================================================
    {
      id: "la-cueva",
      name: "Restaurante La Cueva",
      slug: "restaurante-la-cueva",
      shortDescription: "Donde García Márquez encontraba inspiración",
      longDescription: "Legendario restaurante-bar donde se reunía el Grupo de Barranquilla (García Márquez, Cepeda Samudio, etc.). Cocina costeña tradicional en un ambiente bohemio lleno de historia literaria.",
      localTip: "Pide el 'sancocho de sábalo' si está disponible. Reserva los fines de semana.",
      municipality: "Barranquilla",
      address: "Carrera 43 #59-03, Boston",
      coordinates: { lat: 10.9789, lng: -74.7981 },
      category: "restaurante",
      subcategories: ["costeño", "historico", "literario"],
      interests: ["gastronomia_local", "historia_patrimonio"],
      typicalDuration: 90,
      priceRange: "moderado",
      estimatedCost: 55000,
      schedule: {
        opens: "12:00",
        closes: "23:00",
        closedDays: ["Domingo noche"],
        bestTime: "Almuerzo o cena temprana"
      },
      suitableFor: ["pareja", "amigos"],
      physicalLevel: "low",
      familyFriendly: false,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/la-cueva-1.jpg"
      ],
      primaryImage: "/images/places/la-cueva-1.jpg",
      rating: 4.5,
      reviewCount: 890,
      verified: true,
      featured: true,
      aiContext: "Restaurante icónico con historia literaria. Ideal para parejas y amigos que aprecian la cultura. La comida es tradicional costeña de alta calidad. No es ideal para familias con niños pequeños.",
      mustTry: ["Sancocho de pescado", "Arroz con coco", "Mojarra frita", "Coctel de la casa"],
      avoidIf: ["Viajas con niños pequeños", "Buscas comida rápida", "Tienes presupuesto muy limitado"]
    },
    
    {
      id: "caiman-del-rio",
      name: "Caimán del Río",
      slug: "caiman-del-rio",
      shortDescription: "Centro gastronómico del Malecón",
      longDescription: "Complejo de restaurantes y bares junto al río Magdalena. Más de 16 opciones gastronómicas desde comida típica hasta internacional. Vista privilegiada del atardecer.",
      localTip: "Llega antes de las 6pm para conseguir mesa con vista al río. Los jueves hay música en vivo.",
      municipality: "Barranquilla",
      address: "Gran Malecón del Río, Vía 40",
      coordinates: { lat: 10.9867, lng: -74.7892 },
      category: "restaurante",
      subcategories: ["variado", "vista", "bar"],
      interests: ["gastronomia_local", "playas_rio"],
      typicalDuration: 120,
      priceRange: "moderado",
      estimatedCost: 65000,
      schedule: {
        opens: "12:00",
        closes: "00:00",
        bestTime: "Atardecer (5:30-7pm)"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/caiman-rio-1.jpg",
        "/images/places/caiman-rio-2.jpg"
      ],
      primaryImage: "/images/places/caiman-rio-1.jpg",
      rating: 4.3,
      reviewCount: 2100,
      verified: true,
      featured: true,
      aiContext: "Perfecto para combinar con paseo por el Malecón. Múltiples opciones para todos los gustos y presupuestos. Ideal para atardeceres románticos o cenas grupales.",
      mustTry: ["Ceviche en cualquier restaurante", "Limonada de coco", "Vista del atardecer"],
      avoidIf: ["Buscas algo muy económico", "No te gusta el calor (terraza al aire libre)"]
    },
    
    {
      id: "narcobollo",
      name: "NarcoBollo",
      slug: "narcobollo",
      shortDescription: "El mejor bollo de la costa, elevado a arte",
      longDescription: "Restaurante que reinventa la cocina costeña tradicional. Su especialidad es el bollo (tamal de maíz) en versiones creativas. Ambiente moderno con raíces tradicionales.",
      localTip: "Prueba el 'bollo de angelito' y el jugo de corozo. Reserva en fin de semana.",
      municipality: "Barranquilla",
      address: "Carrera 53 #75-129, Alto Prado",
      coordinates: { lat: 10.9956, lng: -74.8089 },
      category: "restaurante",
      subcategories: ["costeño", "moderno", "autor"],
      interests: ["gastronomia_local"],
      typicalDuration: 90,
      priceRange: "moderado",
      estimatedCost: 70000,
      schedule: {
        opens: "12:00",
        closes: "22:00",
        closedDays: ["Lunes"],
        bestTime: "Almuerzo"
      },
      suitableFor: ["pareja", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/narcobollo-1.jpg"
      ],
      primaryImage: "/images/places/narcobollo-1.jpg",
      rating: 4.6,
      reviewCount: 650,
      verified: true,
      featured: true,
      aiContext: "Cocina costeña contemporánea. Perfecto para foodies que quieren probar sabores locales con presentación moderna. Ambiente casual pero elegante.",
      mustTry: ["Bollo de angelito", "Arroz de lisa", "Jugo de corozo", "Postre de coco"],
      avoidIf: ["Buscas comida tradicional sin reinvenciones", "Presupuesto muy ajustado"]
    },
  
    // =========================================================================
    // BARRANQUILLA - VIDA NOCTURNA
    // =========================================================================
    {
      id: "la-troja",
      name: "La Troja",
      slug: "la-troja",
      shortDescription: "Templo de la salsa en Barranquilla",
      longDescription: "El bar de salsa más famoso de la costa. Música en vivo, ambiente auténtico, y la mejor pista de baile de la ciudad. Aquí la rumba es hasta que el cuerpo aguante.",
      localTip: "Llega después de las 11pm cuando la fiesta se prende. Los miércoles hay clases de salsa gratis.",
      municipality: "Barranquilla",
      address: "Calle 74 #54-20",
      coordinates: { lat: 10.9912, lng: -74.8023 },
      category: "bar",
      subcategories: ["salsa", "musica_vivo", "baile"],
      interests: ["vida_nocturna"],
      typicalDuration: 180,
      priceRange: "moderado",
      estimatedCost: 80000,
      schedule: {
        opens: "21:00",
        closes: "04:00",
        closedDays: ["Lunes", "Martes"],
        bestTime: "Viernes y sábados después de 11pm"
      },
      suitableFor: ["pareja", "amigos"],
      physicalLevel: "moderate",
      familyFriendly: false,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/la-troja-1.jpg"
      ],
      primaryImage: "/images/places/la-troja-1.jpg",
      rating: 4.4,
      reviewCount: 1800,
      verified: true,
      featured: true,
      aiContext: "Solo para adultos que quieren vivir la rumba costeña auténtica. Música en vivo de alta calidad. Ideal para grupos de amigos o parejas que saben bailar o quieren aprender.",
      mustTry: ["Clases de salsa (miércoles)", "Ron con coca", "Bailar hasta el amanecer"],
      avoidIf: ["No te gusta la salsa", "Viajas con niños", "Prefieres lugares tranquilos", "Vas a manejar"]
    },
    
    {
      id: "frogg-leggs",
      name: "Frogg Leggs",
      slug: "frogg-leggs",
      shortDescription: "Rock, crossover y buena rumba",
      longDescription: "Bar con ambiente rockero pero música variada. Terraza amplia, buena selección de cervezas artesanales, y una de las mejores vistas nocturnas de la ciudad.",
      localTip: "Jueves de rock en vivo. La terraza del segundo piso tiene la mejor vista.",
      municipality: "Barranquilla",
      address: "Carrera 53 #70-109, Alto Prado",
      coordinates: { lat: 10.9923, lng: -74.8067 },
      category: "bar",
      subcategories: ["rock", "cerveza", "terraza"],
      interests: ["vida_nocturna"],
      typicalDuration: 150,
      priceRange: "moderado",
      estimatedCost: 70000,
      schedule: {
        opens: "18:00",
        closes: "02:00",
        bestTime: "Jueves y viernes"
      },
      suitableFor: ["pareja", "amigos"],
      physicalLevel: "low",
      familyFriendly: false,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/frogg-leggs-1.jpg"
      ],
      primaryImage: "/images/places/frogg-leggs-1.jpg",
      rating: 4.3,
      reviewCount: 920,
      verified: true,
      featured: false,
      aiContext: "Alternativa a la salsa para quienes prefieren rock y música variada. Ambiente más relajado que las discotecas. Buena opción para empezar la noche.",
      mustTry: ["Cerveza artesanal local", "Alitas de pollo", "Terraza al anochecer"],
      avoidIf: ["Solo te gusta la salsa/vallenato", "Buscas discoteca para bailar toda la noche"]
    },
  
    // =========================================================================
    // PUERTO COLOMBIA - PLAYAS
    // =========================================================================
    {
      id: "playa-pradomar",
      name: "Playa Pradomar",
      slug: "playa-pradomar",
      shortDescription: "La playa familiar por excelencia",
      longDescription: "Playa de aguas tranquilas ideal para familias. Arena gris característica del Caribe colombiano, servicios completos de carpas y restaurantes. A solo 20 minutos de Barranquilla.",
      localTip: "Llega antes de las 10am para conseguir buena carpa. Negocia el precio de la carpa (debe incluir sillas y mesa).",
      municipality: "Puerto Colombia",
      address: "Malecón de Pradomar",
      coordinates: { lat: 10.9953, lng: -74.9547 },
      category: "playa",
      subcategories: ["familiar", "servicios", "tranquila"],
      interests: ["playas_rio"],
      typicalDuration: 240,
      priceRange: "economico",
      estimatedCost: 40000,
      schedule: {
        opens: "06:00",
        closes: "18:00",
        bestTime: "Mañana (8-11am)",
        peakHours: "Domingos todo el día"
      },
      suitableFor: ["familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/pradomar-1.jpg",
        "/images/places/pradomar-2.jpg"
      ],
      primaryImage: "/images/places/pradomar-1.jpg",
      rating: 4.2,
      reviewCount: 3200,
      verified: true,
      featured: true,
      aiContext: "Playa perfecta para familias con niños por sus aguas tranquilas y servicios. No es la más bonita visualmente pero es la más cómoda y segura. Vendedores de comida típica pasan constantemente.",
      mustTry: ["Ceviche de camarón de los vendedores", "Agua de coco", "Arroz con coco en los restaurantes"],
      avoidIf: ["Buscas playa paradisíaca de postal", "No te gustan las playas concurridas", "Es fin de semana festivo"]
    },
    
    {
      id: "castillo-salgar",
      name: "Castillo de Salgar",
      slug: "castillo-salgar",
      shortDescription: "Fortaleza española con vista al mar",
      longDescription: "Fuerte español del siglo XIX convertido en centro de eventos. Arquitectura histórica imponente con vista panorámica al mar Caribe. Perfecto para fotos y paseos contemplativos.",
      localTip: "Mejor visitarlo al atardecer. La entrada es gratuita si no hay evento privado.",
      municipality: "Puerto Colombia",
      address: "Salgar, Puerto Colombia",
      coordinates: { lat: 10.9989, lng: -74.9367 },
      category: "monumento",
      subcategories: ["historico", "arquitectura", "vistas"],
      interests: ["historia_patrimonio", "playas_rio"],
      typicalDuration: 60,
      priceRange: "gratis",
      estimatedCost: 0,
      schedule: {
        opens: "09:00",
        closes: "18:00",
        bestTime: "Atardecer (5-6pm)"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/castillo-salgar-1.jpg",
        "/images/places/castillo-salgar-2.jpg"
      ],
      primaryImage: "/images/places/castillo-salgar-1.jpg",
      rating: 4.5,
      reviewCount: 1500,
      verified: true,
      featured: true,
      aiContext: "Sitio histórico perfecto para combinar con playa. Ideal para parejas y fotos. A veces cierran por eventos privados, verificar antes de ir.",
      mustTry: ["Fotos desde los balcones", "Recorrido por los pasillos históricos", "Atardecer desde la terraza"],
      avoidIf: ["Hay evento privado ese día", "Buscas actividades interactivas"]
    },
    
    {
      id: "muelle-puerto-colombia",
      name: "Muelle de Puerto Colombia",
      slug: "muelle-puerto-colombia",
      shortDescription: "Segundo muelle más largo de Sudamérica",
      longDescription: "Histórico muelle de 200 metros reconstruido en 2022. Fue punto de llegada de inmigrantes y el segundo muelle más largo de Sudamérica. Hoy es paseo peatonal con vistas espectaculares.",
      localTip: "Visítalo al amanecer o atardecer. Los fines de semana hay más ambiente pero también más gente.",
      municipality: "Puerto Colombia",
      address: "Malecón de Puerto Colombia",
      coordinates: { lat: 10.9878, lng: -74.9647 },
      category: "monumento",
      subcategories: ["historico", "paseo", "vistas"],
      interests: ["historia_patrimonio", "playas_rio"],
      typicalDuration: 45,
      priceRange: "gratis",
      estimatedCost: 0,
      schedule: {
        opens: "06:00",
        closes: "22:00",
        bestTime: "Atardecer"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/muelle-pc-1.jpg",
        "/images/places/muelle-pc-2.jpg"
      ],
      primaryImage: "/images/places/muelle-pc-1.jpg",
      rating: 4.4,
      reviewCount: 2800,
      verified: true,
      featured: true,
      aiContext: "Paseo obligado en Puerto Colombia. Perfecto para caminatas románticas o familiares. Hay vendedores de comida típica en el malecón cercano.",
      mustTry: ["Caminar hasta el final del muelle", "Foto al atardecer", "Raspao de los vendedores"],
      avoidIf: ["Es mediodía y hace mucho sol", "No te gusta caminar"]
    },
    
    {
      id: "puerto-velero",
      name: "Puerto Velero",
      slug: "puerto-velero",
      shortDescription: "Marina y deportes acuáticos",
      longDescription: "Complejo turístico con marina, 25+ restaurantes, y centro de deportes acuáticos. Ideal para windsurf, paddleboard, y kitesurf. Ambiente más exclusivo que otras playas.",
      localTip: "Reserva con anticipación si quieres hacer deportes acuáticos. Los domingos hay brunch en varios restaurantes.",
      municipality: "Juan de Acosta",
      address: "Km 19 Vía al Mar",
      coordinates: { lat: 10.9456, lng: -75.0234 },
      category: "playa",
      subcategories: ["deportes", "marina", "restaurantes", "premium"],
      interests: ["playas_rio", "naturaleza_aventura"],
      typicalDuration: 300,
      priceRange: "premium",
      estimatedCost: 150000,
      schedule: {
        opens: "08:00",
        closes: "18:00",
        bestTime: "Todo el día"
      },
      suitableFor: ["pareja", "amigos"],
      physicalLevel: "moderate",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/puerto-velero-1.jpg",
        "/images/places/puerto-velero-2.jpg"
      ],
      primaryImage: "/images/places/puerto-velero-1.jpg",
      rating: 4.5,
      reviewCount: 1900,
      verified: true,
      featured: true,
      aiContext: "La opción premium de playas en el Atlántico. Perfecto para parejas y grupos que buscan comodidad y actividades. Más caro pero mejor servicio que otras playas.",
      mustTry: ["Paddleboard o kayak", "Almuerzo frente al mar", "Paseo en velero (reservar)"],
      avoidIf: ["Presupuesto limitado", "Prefieres playas más auténticas/locales"]
    },
  
    // =========================================================================
    // GALAPA - ARTESANÍAS
    // =========================================================================
    {
      id: "taller-selva-africana",
      name: "Taller Selva Africana",
      slug: "taller-selva-africana",
      shortDescription: "Máscaras de Carnaval hechas a mano",
      longDescription: "Taller del maestro José Francisco Llanos, Rey Momo 2013. Aquí se crean las icónicas máscaras de madera del Carnaval de Barranquilla. Se pueden ver artesanos trabajando y comprar piezas únicas.",
      localTip: "Llama antes para confirmar horario. José Francisco a veces da tours personalizados si le avisas con anticipación.",
      municipality: "Galapa",
      address: "Calle 18 #14-15, Galapa",
      coordinates: { lat: 10.8933, lng: -74.8861 },
      category: "artesanias",
      subcategories: ["mascaras", "madera", "carnaval", "taller"],
      interests: ["artesanias_tradiciones", "carnaval_cultura"],
      typicalDuration: 90,
      priceRange: "gratis",
      estimatedCost: 0,
      schedule: {
        opens: "08:00",
        closes: "17:00",
        closedDays: ["Domingo"],
        bestTime: "Mañana"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/selva-africana-1.jpg",
        "/images/places/selva-africana-2.jpg"
      ],
      primaryImage: "/images/places/selva-africana-1.jpg",
      rating: 4.8,
      reviewCount: 320,
      verified: true,
      featured: true,
      aiContext: "Experiencia auténtica de artesanía local. Perfecto para entender la tradición de las máscaras del Carnaval. Puedes comprar máscaras desde $50,000 hasta varios millones.",
      mustTry: ["Ver a los artesanos trabajando", "Comprar una máscara pequeña como souvenir", "Escuchar la historia de José Francisco"],
      avoidIf: ["No te interesa la artesanía", "Tienes muy poco tiempo"]
    },
    
    {
      id: "museo-muga",
      name: "MUGA - Museo de Galapa",
      slug: "museo-muga",
      shortDescription: "5,000 piezas precolombinas y coloniales",
      longDescription: "Museo con una de las colecciones más importantes de cerámica Tayrona, Zenú y Mokaná del país. Fundado por el coleccionista local Carlos Vásquez. Guías locales apasionados por la historia.",
      localTip: "Pide la visita guiada (incluida). Carlos o su equipo te cuentan historias increíbles de cada pieza.",
      municipality: "Galapa",
      address: "Calle 11 #11-30, Galapa",
      coordinates: { lat: 10.8928, lng: -74.8856 },
      category: "museo",
      subcategories: ["precolombino", "historia", "arqueologia"],
      interests: ["historia_patrimonio", "artesanias_tradiciones"],
      typicalDuration: 75,
      priceRange: "economico",
      estimatedCost: 10000,
      schedule: {
        opens: "09:00",
        closes: "17:00",
        closedDays: ["Lunes"],
        bestTime: "Mañana"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/muga-1.jpg"
      ],
      primaryImage: "/images/places/muga-1.jpg",
      rating: 4.7,
      reviewCount: 280,
      verified: true,
      featured: false,
      aiContext: "Joya escondida del Atlántico. Colección impresionante de piezas precolombinas. La pasión de los guías locales hace la visita especial. Ideal para combinar con taller de máscaras.",
      mustTry: ["Visita guiada completa", "Sección de cerámica Mokaná", "Historia de cómo se formó la colección"],
      avoidIf: ["No te interesa la historia precolombina", "Tienes menos de 1 hora"]
    },
  
    // =========================================================================
    // USIACURÍ - ARTESANÍAS Y NATURALEZA
    // =========================================================================
    {
      id: "centro-artesanal-usiacuri",
      name: "Centro Artesanal Corina Urueta",
      slug: "centro-artesanal-usiacuri",
      shortDescription: "Tejidos de palma de iraca",
      longDescription: "Centro donde artesanas locales tejen bolsos, sombreros y decoración con palma de iraca. Puedes ver el proceso completo y comprar directamente a las creadoras. Cada pieza toma días de trabajo.",
      localTip: "Pregunta por talleres de tejido si quieres aprender lo básico. Las artesanas son muy pacientes.",
      municipality: "Usiacurí",
      address: "Calle Principal, Usiacurí",
      coordinates: { lat: 10.7419, lng: -74.9761 },
      category: "artesanias",
      subcategories: ["tejidos", "palma", "local", "taller"],
      interests: ["artesanias_tradiciones"],
      typicalDuration: 90,
      priceRange: "gratis",
      estimatedCost: 0,
      schedule: {
        opens: "08:00",
        closes: "17:00",
        bestTime: "Mañana"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/usiacuri-artesanal-1.jpg",
        "/images/places/usiacuri-artesanal-2.jpg"
      ],
      primaryImage: "/images/places/usiacuri-artesanal-1.jpg",
      rating: 4.6,
      reviewCount: 450,
      verified: true,
      featured: true,
      aiContext: "Experiencia auténtica de artesanía local. Los productos son de alta calidad y apoyas directamente a las artesanas. Bolsos desde $40,000, sombreros desde $80,000.",
      mustTry: ["Ver el proceso de tejido", "Comprar un bolso de iraca", "Conversar con las artesanas sobre su trabajo"],
      avoidIf: ["No planeas comprar nada", "Tienes prisa"]
    },
    
    {
      id: "casa-museo-julio-florez",
      name: "Casa Museo Julio Flórez",
      slug: "casa-museo-julio-florez",
      shortDescription: "Hogar del poeta más romántico de Colombia",
      longDescription: "Casa donde vivió sus últimos años el poeta Julio Flórez, uno de los más importantes de Colombia. Conserva muebles originales, manuscritos y objetos personales. Jardín con su tumba.",
      localTip: "Pide que te lean algunos de sus poemas. La guía local los recita de memoria con mucha emoción.",
      municipality: "Usiacurí",
      address: "Calle 3 #5-12, Usiacurí",
      coordinates: { lat: 10.7415, lng: -74.9758 },
      category: "museo",
      subcategories: ["literatura", "poeta", "historico"],
      interests: ["historia_patrimonio"],
      typicalDuration: 60,
      priceRange: "economico",
      estimatedCost: 5000,
      schedule: {
        opens: "09:00",
        closes: "17:00",
        closedDays: ["Lunes"],
        bestTime: "Mañana"
      },
      suitableFor: ["solo", "pareja"],
      physicalLevel: "low",
      familyFriendly: false,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/julio-florez-1.jpg"
      ],
      primaryImage: "/images/places/julio-florez-1.jpg",
      rating: 4.5,
      reviewCount: 380,
      verified: true,
      featured: false,
      aiContext: "Ideal para parejas románticas y amantes de la literatura. El ambiente es tranquilo y poético. Usiacurí era conocido por sus aguas termales que Julio Flórez buscaba para su salud.",
      mustTry: ["Escuchar poemas recitados", "Ver la tumba en el jardín", "Leer 'Mis Flores Negras'"],
      avoidIf: ["Viajas con niños", "No te interesa la poesía", "Buscas actividades dinámicas"]
    },
  
    // =========================================================================
    // NATURALEZA Y ECOTURISMO
    // =========================================================================
    {
      id: "cienaga-mallorquin",
      name: "Ciénaga de Mallorquín",
      slug: "cienaga-mallorquin",
      shortDescription: "650 hectáreas de biodiversidad costera",
      longDescription: "Humedal Ramsar donde el río Magdalena se encuentra con el mar. Ecoparque con torre de observación de 11 metros, sendero elevado de 800m entre manglares, y avistamiento de 150+ especies de aves.",
      localTip: "Ve temprano (6-8am) para mejor avistamiento de aves. Lleva binoculares y repelente.",
      municipality: "Barranquilla",
      address: "Vía a Bocas de Ceniza",
      coordinates: { lat: 11.0234, lng: -74.8456 },
      category: "naturaleza",
      subcategories: ["aves", "manglar", "ecoturismo"],
      interests: ["naturaleza_aventura"],
      typicalDuration: 180,
      priceRange: "economico",
      estimatedCost: 15000,
      schedule: {
        opens: "06:00",
        closes: "17:30",
        closedDays: ["Lunes"],
        bestTime: "Amanecer (6-8am) o atardecer (4-6pm)"
      },
      suitableFor: ["solo", "pareja", "amigos"],
      physicalLevel: "moderate",
      familyFriendly: true,
      romanticSpot: false,
      instagrammable: true,
      images: [
        "/images/places/cienaga-1.jpg",
        "/images/places/cienaga-2.jpg"
      ],
      primaryImage: "/images/places/cienaga-1.jpg",
      rating: 4.5,
      reviewCount: 890,
      verified: true,
      featured: true,
      aiContext: "Paraíso para amantes de la naturaleza y aves. El tren eléctrico a Bocas de Ceniza sale desde aquí. Ideal para fotógrafos de naturaleza. Evitar horas de mucho calor.",
      mustTry: ["Torre de observación", "Sendero del manglar", "Avistamiento de aves al amanecer", "Tren a Bocas de Ceniza"],
      avoidIf: ["No te gusta madrugar", "Tienes movilidad reducida (senderos irregulares)", "Es época de lluvias fuertes"]
    },
    
    {
      id: "bocas-de-ceniza",
      name: "Bocas de Ceniza",
      slug: "bocas-de-ceniza",
      shortDescription: "Donde el río Magdalena besa el mar",
      longDescription: "El punto exacto donde el río más importante de Colombia desemboca en el mar Caribe. Accesible en tren eléctrico desde la Ciénaga de Mallorquín. Paisaje único y emotivo.",
      localTip: "Toma el tren de las 8am para tener tiempo de explorar. Lleva protector solar y gorra.",
      municipality: "Barranquilla",
      address: "Desembocadura del Río Magdalena",
      coordinates: { lat: 11.0600, lng: -74.8500 },
      category: "naturaleza",
      subcategories: ["rio", "mar", "paisaje"],
      interests: ["naturaleza_aventura", "playas_rio"],
      typicalDuration: 120,
      priceRange: "economico",
      estimatedCost: 25000,
      schedule: {
        opens: "06:00",
        closes: "17:30",
        bestTime: "Mañana"
      },
      suitableFor: ["solo", "pareja", "familia", "amigos"],
      physicalLevel: "low",
      familyFriendly: true,
      romanticSpot: true,
      instagrammable: true,
      images: [
        "/images/places/bocas-ceniza-1.jpg",
        "/images/places/bocas-ceniza-2.jpg"
      ],
      primaryImage: "/images/places/bocas-ceniza-1.jpg",
      rating: 4.6,
      reviewCount: 1200,
      verified: true,
      featured: true,
      aiContext: "Experiencia única y emotiva. El tren eléctrico es parte de la aventura. Hay un restaurante básico pero la comida es fresca. Perfecto para combinar con Ciénaga de Mallorquín.",
      mustTry: ["Tren eléctrico (70 pasajeros por vagón)", "Foto en el punto de encuentro río-mar", "Pescado frito en el restaurante local"],
      avoidIf: ["Es lunes (cerrado)", "Hace muy mal tiempo", "No quieres madrugar"]
    }
  ];
  
  // =============================================================================
  // FUNCIONES DE CONSULTA
  // =============================================================================
  
  /**
   * Obtener lugares por municipio
   */
  export function getPlacesByMunicipality(municipality: string): CuratedPlace[] {
    return CURATED_PLACES.filter(p => 
      p.municipality.toLowerCase() === municipality.toLowerCase()
    );
  }
  
  /**
   * Obtener lugares por interés
   */
  export function getPlacesByInterest(interestId: string): CuratedPlace[] {
    return CURATED_PLACES.filter(p => 
      p.interests.includes(interestId)
    );
  }
  
  /**
   * Obtener lugares por categoría
   */
  export function getPlacesByCategory(category: PlaceCategory): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.category === category);
  }
  
  /**
   * Obtener lugares aptos para un tipo de viaje
   */
  export function getPlacesByTripType(tripType: TripType): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.suitableFor.includes(tripType));
  }
  
  /**
   * Obtener lugares por rango de precio
   */
  export function getPlacesByPriceRange(priceRange: PriceRange): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.priceRange === priceRange);
  }
  
  /**
   * Obtener lugares destacados
   */
  export function getFeaturedPlaces(): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.featured);
  }
  
  /**
   * Obtener lugares románticos
   */
  export function getRomanticPlaces(): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.romanticSpot);
  }
  
  /**
   * Obtener lugares family-friendly
   */
  export function getFamilyFriendlyPlaces(): CuratedPlace[] {
    return CURATED_PLACES.filter(p => p.familyFriendly);
  }
  
  /**
   * Buscar lugares por texto
   */
  export function searchPlaces(query: string): CuratedPlace[] {
    const lowerQuery = query.toLowerCase();
    return CURATED_PLACES.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.shortDescription.toLowerCase().includes(lowerQuery) ||
      p.municipality.toLowerCase().includes(lowerQuery) ||
      p.subcategories.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }
  
  /**
   * Obtener lugar por ID
   */
  export function getPlaceById(id: string): CuratedPlace | undefined {
    return CURATED_PLACES.find(p => p.id === id);
  }
  
  /**
   * Obtener lugares para un itinerario según perfil
   */
  export function getPlacesForItinerary(params: {
    interests: string[];
    tripType: TripType;
    priceRange: PriceRange;
    days: number;
  }): CuratedPlace[] {
    const { interests, tripType, priceRange, days } = params;
    
    // Filtrar por intereses
    let places = CURATED_PLACES.filter(p => 
      p.interests.some(i => interests.includes(i))
    );
    
    // Filtrar por tipo de viaje
    places = places.filter(p => p.suitableFor.includes(tripType));
    
    // Filtrar por presupuesto (incluir gratis y el nivel seleccionado)
    const priceOrder: PriceRange[] = ['gratis', 'economico', 'moderado', 'premium'];
    const maxPriceIndex = priceOrder.indexOf(priceRange);
    places = places.filter(p => 
      priceOrder.indexOf(p.priceRange) <= maxPriceIndex
    );
    
    // Si es familia, filtrar solo family-friendly
    if (tripType === 'familia') {
      places = places.filter(p => p.familyFriendly);
    }
    
    // Ordenar por rating y featured
    places.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    return places;
  }
  
  /**
   * Calcular duración total de una lista de lugares
   */
  export function calculateTotalDuration(placeIds: string[]): number {
    return placeIds.reduce((total, id) => {
      const place = getPlaceById(id);
      return total + (place?.typicalDuration || 0);
    }, 0);
  }
  
  /**
   * Calcular costo total estimado
   */
  export function calculateTotalCost(placeIds: string[]): number {
    return placeIds.reduce((total, id) => {
      const place = getPlaceById(id);
      return total + (place?.estimatedCost || 0);
    }, 0);
  }
  
  // =============================================================================
  // ESTADÍSTICAS
  // =============================================================================
  
  export const PLACES_STATS = {
    total: CURATED_PLACES.length,
    byMunicipality: {
      barranquilla: CURATED_PLACES.filter(p => p.municipality === 'Barranquilla').length,
      puertoColombiaPlaces: CURATED_PLACES.filter(p => p.municipality === 'Puerto Colombia').length,
      galapa: CURATED_PLACES.filter(p => p.municipality === 'Galapa').length,
      usiacuri: CURATED_PLACES.filter(p => p.municipality === 'Usiacurí').length,
      juanDeAcosta: CURATED_PLACES.filter(p => p.municipality === 'Juan de Acosta').length,
    },
    featured: CURATED_PLACES.filter(p => p.featured).length,
    familyFriendly: CURATED_PLACES.filter(p => p.familyFriendly).length,
    romantic: CURATED_PLACES.filter(p => p.romanticSpot).length,
  };
  
  console.log(`📍 Base de datos cargada: ${PLACES_STATS.total} lugares curados del Atlántico`);

  // =============================================================================
// AGREGAR ESTO AL FINAL DE TU ARCHIVO src/data/atlantico-places.ts
// DESPUÉS de la línea: console.log(`📍 Base de datos cargada:...`)
// 
// ⚠️ IMPORTANTE: Primero elimina cualquier contenido duplicado que hayas
// agregado anteriormente (todo lo que esté después del primer console.log)
// =============================================================================

// =============================================================================
// INTERESES - Sincronizados con PlannerPage
// =============================================================================

export const INTERESTS = [
  {
    id: "carnaval_cultura",
    label: "Carnaval y Folclor",
    tagline: "Vive la fiesta más grande de Colombia",
    icon: "PartyPopper",
    color: "#D31A2B",
    emoji: "🎭",
    image: "/images/interests/carnaval.jpg",
    preview: "Museo del Carnaval, Casa del Carnaval, talleres de máscaras"
  },
  {
    id: "playas_rio",
    label: "Playas y Río",
    tagline: "90 km de costa caribeña te esperan",
    icon: "Waves",
    color: "#007BC4",
    emoji: "🏖️",
    image: "/images/interests/playas.jpg",
    preview: "Puerto Colombia, Pradomar, Malecón del Río, Bocas de Ceniza"
  },
  {
    id: "gastronomia_local",
    label: "Sabores Costeños",
    tagline: "Donde nació la arepa 'e huevo",
    icon: "Utensils",
    color: "#F39200",
    emoji: "🍽️",
    image: "/images/interests/gastronomia.jpg",
    preview: "Arroz de lisa, sancocho, butifarra, jugos naturales"
  },
  {
    id: "vida_nocturna",
    label: "Rumba y Música",
    tagline: "Salsa, champeta y vallenato",
    icon: "Music",
    color: "#EA5B13",
    emoji: "🎺",
    image: "/images/interests/rumba.jpg",
    preview: "La Troja, bares con música en vivo, rumba costeña"
  },
  {
    id: "historia_patrimonio",
    label: "Historia y Patrimonio",
    tagline: "La Puerta de Oro de Colombia",
    icon: "Building2",
    color: "#4A4F55",
    emoji: "🏛️",
    image: "/images/interests/historia.jpg",
    preview: "Centro Histórico, Museo del Caribe, arquitectura republicana"
  },
  {
    id: "artesanias_tradiciones",
    label: "Artesanías",
    tagline: "Máscaras de Galapa, tejidos de Usiacurí",
    icon: "Palette",
    color: "#B8A88A",
    emoji: "🎨",
    image: "/images/interests/artesanias.jpg",
    preview: "Talleres de máscaras, tejidos de palma de iraca"
  },
  {
    id: "naturaleza_aventura",
    label: "Ecoturismo",
    tagline: "Donde el río Magdalena besa el mar",
    icon: "TreePalm",
    color: "#008D39",
    emoji: "🌿",
    image: "/images/interests/naturaleza.jpg",
    preview: "Ciénaga de Mallorquín, avistamiento de aves, Bocas de Ceniza"
  }
] as const;

export type InterestId = typeof INTERESTS[number]['id'];

// =============================================================================
// IMÁGENES DE BIENVENIDA (para el panel de Jimmy)
// =============================================================================

export const WELCOME_IMAGES = {
  hero: "/images/hero/barranquilla-skyline.jpg",
  carnival: "/images/hero/carnaval-marimonda.jpg",
  beach: "/images/hero/puerto-colombia-atardecer.jpg",
  gastronomy: "/images/hero/gastronomia-costeña.jpg",
  malecon: "/images/hero/gran-malecon.jpg",
  fallbacks: {
    hero: "https://images.unsplash.com/photo-1583531172005-763a424a7c48?w=1200&q=80",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  }
};

// =============================================================================
// FALLBACKS POR CATEGORÍA
// =============================================================================

export const CATEGORY_FALLBACKS: Record<string, string> = {
  playa: "/images/categories/playa.jpg",
  restaurante: "/images/categories/restaurante.jpg",
  museo: "/images/categories/museo.jpg",
  naturaleza: "/images/categories/naturaleza.jpg",
  bar: "/images/categories/bar.jpg",
  artesanias: "/images/categories/artesanias.jpg",
  parque: "/images/categories/parque.jpg",
  monumento: "/images/categories/monumento.jpg",
  entretenimiento: "/images/categories/entretenimiento.jpg",
  cafe: "/images/categories/cafe.jpg",
  iglesia: "/images/categories/iglesia.jpg",
  mercado: "/images/categories/mercado.jpg",
  mirador: "/images/categories/mirador.jpg",
  hotel: "/images/categories/hotel.jpg",
  default: "/images/categories/default.jpg",
};

// =============================================================================
// INTERFACE PARA IMÁGENES DE LUGAR
// =============================================================================

export interface PlaceImages {
  primaryImage: string;
  gallery: string[];
  mapQuery: string;
}

// =============================================================================
// FUNCIONES DE IMÁGENES
// =============================================================================

export function getPlaceImages(placeId: string): PlaceImages | null {
  const place = getPlaceById(placeId);
  if (!place) return null;
  
  return {
    primaryImage: place.primaryImage,
    gallery: place.images && place.images.length > 0 
      ? place.images 
      : [place.primaryImage],
    mapQuery: encodeURIComponent(`${place.name} ${place.municipality} Atlantico Colombia`),
  };
}

export function getCategoryFallback(category: string): string {
  const normalized = category.toLowerCase();
  if (CATEGORY_FALLBACKS[normalized]) {
    return CATEGORY_FALLBACKS[normalized];
  }
  for (const [key, value] of Object.entries(CATEGORY_FALLBACKS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return CATEGORY_FALLBACKS.default;
}

// =============================================================================
// FUNCIONES PARA EL CHATBOT JIMMY
// =============================================================================

export function getPlacesForInterest(interestId: string, limit: number = 5): CuratedPlace[] {
  return CURATED_PLACES
    .filter(p => p.interests.includes(interestId))
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

export function getPlacesForProfile(profile: {
  interests?: string[];
  tripType?: TripType;
  budget?: PriceRange;
  days?: number;
}): CuratedPlace[] {
  let places = [...CURATED_PLACES];
  
  if (profile.interests && profile.interests.length > 0) {
    places = places.filter(p => 
      p.interests.some(i => profile.interests!.includes(i))
    );
  }
  
  if (profile.tripType) {
    places = places.filter(p => p.suitableFor.includes(profile.tripType!));
  }
  
  if (profile.budget) {
    const priceOrder: PriceRange[] = ['gratis', 'economico', 'moderado', 'premium'];
    const maxIndex = priceOrder.indexOf(profile.budget);
    places = places.filter(p => priceOrder.indexOf(p.priceRange) <= maxIndex);
  }
  
  places.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.rating - a.rating;
  });
  
  const limit = (profile.days || 3) * 4;
  return places.slice(0, limit);
}

export function findPlaceByName(name: string): CuratedPlace | undefined {
  const normalized = name.toLowerCase().trim();
  
  let found = CURATED_PLACES.find(p => 
    p.name.toLowerCase() === normalized ||
    p.slug === normalized ||
    p.slug === normalized.replace(/\s+/g, '-')
  );
  
  if (found) return found;
  
  return CURATED_PLACES.find(p => 
    p.name.toLowerCase().includes(normalized) ||
    normalized.includes(p.name.toLowerCase())
  );
}

export function findMentionedPlaces(text: string): CuratedPlace[] {
  const mentioned: CuratedPlace[] = [];
  const lowerText = text.toLowerCase();
  
  CURATED_PLACES.forEach(place => {
    if (
      lowerText.includes(place.name.toLowerCase()) ||
      lowerText.includes(place.slug.replace(/-/g, ' '))
    ) {
      mentioned.push(place);
    }
  });
  
  return mentioned;
}

export function getPlacesForUserIntent(message: string, limit: number = 5): CuratedPlace[] {
  const lower = message.toLowerCase();
  
  if (/playa|mar|costa|nadar|arena|sol/i.test(lower)) {
    return getPlacesByCategory('playa').slice(0, limit);
  }
  if (/comer|comida|restaurante|almorzar|cenar|hambre|típic/i.test(lower)) {
    return getPlacesByCategory('restaurante').slice(0, limit);
  }
  if (/museo|cultura|historia|patrimonio|arte/i.test(lower)) {
    return getPlacesByCategory('museo').slice(0, limit);
  }
  if (/bar|rumba|fiesta|bailar|noche|salsa|música/i.test(lower)) {
    return getPlacesByCategory('bar').slice(0, limit);
  }
  if (/naturaleza|aves|ciénaga|eco|río|bocas/i.test(lower)) {
    return getPlacesByCategory('naturaleza').slice(0, limit);
  }
  if (/artesanía|máscara|tejido|galapa|usiacurí/i.test(lower)) {
    return getPlacesByCategory('artesanias').slice(0, limit);
  }
  if (/carnaval|folclor|danza|cumbia/i.test(lower)) {
    return getPlacesForInterest('carnaval_cultura', limit);
  }
  if (/familia|niños|hijos/i.test(lower)) {
    return getFamilyFriendlyPlaces().slice(0, limit);
  }
  if (/pareja|romántico|amor|aniversario/i.test(lower)) {
    return getRomanticPlaces().slice(0, limit);
  }
  
  return getFeaturedPlaces().slice(0, limit);
}

// =============================================================================
// CATEGORÍAS PARA EL PANEL DE BIENVENIDA DE JIMMY
// =============================================================================

export const CHAT_WELCOME_CATEGORIES = [
  { id: "playas_rio", emoji: "🏖️", label: "Playas", query: "¿Cuáles son las mejores playas?" },
  { id: "carnaval_cultura", emoji: "🎭", label: "Carnaval", query: "Cuéntame sobre el Carnaval" },
  { id: "gastronomia_local", emoji: "🍽️", label: "Comida", query: "¿Dónde comer comida típica?" },
  { id: "vida_nocturna", emoji: "🎺", label: "Rumba", query: "¿Dónde hay buena rumba?" },
];

// =============================================================================
// SUGERENCIAS CONTEXTUALES PARA JIMMY
// =============================================================================

export const CHAT_SUGGESTIONS = {
  initial: [
    "🗓️ Estoy planeando un viaje",
    "📍 Ya estoy en Barranquilla", 
    "🤔 Quiero conocer el Atlántico"
  ],
  afterBeaches: [
    "🍽️ ¿Dónde comer cerca de la playa?",
    "⏰ ¿Cuál es la mejor hora para ir?",
    "🏊 ¿Cuál es la más tranquila?"
  ],
  afterFood: [
    "💰 ¿Cuál es más económico?",
    "📍 ¿Cómo llego?",
    "🍺 ¿Tienen buenos tragos?"
  ],
  afterPlaces: [
    "📍 ¿Cómo llego?",
    "💰 ¿Cuánto cuesta?",
    "⏰ ¿Qué horario tienen?"
  ],
  planTrip: [
    "1️⃣ Solo tengo 1 día",
    "3️⃣ Tengo 3 días",
    "7️⃣ Tengo una semana"
  ]
};

// =============================================================================
// GENERACIÓN DE CONTEXTO PARA CLAUDE
// =============================================================================

export function generatePlacesContextForAI(places: CuratedPlace[]): string {
  return places.map(p => `
**${p.name}** (${p.municipality}) - ${p.category}
- ${p.shortDescription}
- Rating: ${p.rating}/5 • ${p.reviewCount} reseñas
- Precio: ${p.priceRange} (~$${p.estimatedCost.toLocaleString()} COP/persona)
- Horario: ${p.schedule.opens} - ${p.schedule.closes}
- Ideal para: ${p.suitableFor.join(', ')}
- 💡 Tip: ${p.localTip}
`).join('\n---\n');
}

export function placesToChatJSON(places: CuratedPlace[]): object[] {
  return places.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    shortDescription: p.shortDescription,
    longDescription: p.longDescription,
    address: p.address,
    municipality: p.municipality,
    rating: p.rating,
    reviewCount: p.reviewCount,
    primaryImage: p.primaryImage,
    images: p.images,
    localTip: p.localTip,
    schedule: p.schedule,
    priceRange: p.priceRange,
    estimatedCost: p.estimatedCost,
    coordinates: p.coordinates,
    suitableFor: p.suitableFor,
  }));
}

// =============================================================================
// DATOS ADICIONALES
// =============================================================================

export const ATLANTICO_INFO = {
  bounds: { north: 11.1, south: 10.5, east: -74.5, west: -75.2 },
  center: { lat: 10.9639, lng: -74.7964 },
  capital: "Barranquilla",
};