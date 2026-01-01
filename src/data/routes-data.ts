import { 
    Waves, 
    Bird, 
    Palmtree, 
    Palette,
    MapPin,
    Clock,
    Car,
    Bus,
    Camera,
    Utensils,
    Binoculars,
    Footprints,
    Sun,
    Coffee,
    ShoppingBag,
    TreePine,
    Landmark,
    Music
  } from "lucide-react";
  import { ComponentType } from "react";
  
  // =============================================================================
  // TIPOS ACTUALIZADOS - Ahora con soporte para imágenes por parada
  // =============================================================================
  
  export interface RouteStop {
    id: string;
    name: string;
    description: string;
    duration: string;
    activities: string[];
    tips?: string[];
    coordinates?: { lat: number; lng: number };
    icon: ComponentType<{ className?: string }>;
    // ✅ NUEVO: Soporte para imágenes por parada
    image: string;           // Imagen principal de la parada
    gallery?: string[];      // Galería opcional de imágenes adicionales
  }
  
  export interface TransportOption {
    type: "car" | "public" | "tour";
    name: string;
    description: string;
    duration: string;
    cost: string;
    details: string[];
    icon: ComponentType<{ className?: string }>;
  }
  
  export interface TouristRoute {
    id: string;
    slug: string;
    title: string;
    tagline: string;
    description: string;
    longDescription: string;
    duration: string;
    durationHours: number;
    difficulty: "easy" | "moderate" | "challenging";
    bestTime: string;
    image: string;
    galleryImages: string[];
    icon: ComponentType<{ className?: string }>;
    color: string;
    stops: RouteStop[];
    transport: TransportOption[];
    whatToBring: string[];
    includes?: string[];
    estimatedBudget: {
      low: string;
      high: string;
      currency: string;
    };
    highlights: string[];
    warnings?: string[];
    accessibility: string;
    startPoint: string;
    endPoint: string;
  }
  
  // =============================================================================
  // RUTA 1: MALECÓN DEL RÍO
  // =============================================================================
  
  export const rutaMalecon: TouristRoute = {
    id: "malecon-rio",
    slug: "malecon-del-rio",
    title: "Malecón del Río",
    tagline: "Donde Barranquilla abraza al Magdalena",
    description: "5.5 km de paseo junto al río más importante de Colombia, con gastronomía, cultura y atardeceres inolvidables.",
    longDescription: "El Gran Malecón del Río es el sitio turístico más visitado de Barranquilla y uno de los más populares del mundo según TripAdvisor. Este recorrido de 5.5 kilómetros te lleva desde el emblemático centro de eventos Puerta de Oro hasta la icónica Aleta del Tiburón, pasando por zonas gastronómicas, parques, esculturas y miradores sobre el majestuoso río Magdalena.",
    duration: "4-6 horas",
    durationHours: 5,
    difficulty: "easy",
    bestTime: "Tarde (4-7 PM para el atardecer)",
    // ============================================
    // 🖼️ CAMBIA ESTAS IMÁGENES POR LAS TUYAS
    // ============================================
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FGran_Malecon_BAQ_4K_Enhanced.jpeg?alt=media&token=6ac2a348-503e-4cd9-b652-9a8bfd9489c1",
    galleryImages: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80"
    ],
    icon: Waves,
    color: "#007BC4", // Azul Barranquero
    startPoint: "Centro de Eventos Puerta de Oro",
    endPoint: "Aleta del Tiburón",
    stops: [
      {
        id: "puerta-oro",
        name: "Puerta de Oro",
        description: "Centro de convenciones y punto de partida del Malecón. Aquí encuentras el muelle para paseos en lancha por el río y los food trucks.",
        duration: "30 min",
        activities: [
          "Tomarse foto en el anfiteatro",
          "Ver el río Magdalena desde el muelle",
          "Paseo en lancha 'La Mita' (opcional)",
          "Conectar con el RíoBus Karakalí"
        ],
        tips: [
          "Los paseos en lancha cuestan aproximadamente $15.000-25.000 COP",
          "Hay WiFi gratis en todo el Malecón"
        ],
        icon: MapPin,
        coordinates: { lat: 10.9878, lng: -74.7889 },
        // ============================================
        // 🖼️ IMAGEN DE ESTA PARADA
        // ============================================
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPuerta%20de%20Oro.webp?alt=media&token=ae15f399-b7ca-494d-88d2-5f98ad721661",
        gallery: [
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
        ]
      },
      {
        id: "caiman-rio",
        name: "Caimán del Río",
        description: "El corazón gastronómico del Malecón. Un mercado con restaurantes que ofrecen lo mejor de la cocina caribeña con vista al río.",
        duration: "1-2 horas",
        activities: [
          "Almorzar mariscos frescos",
          "Probar el arroz con coco",
          "Disfrutar cócteles tropicales",
          "Escuchar música en vivo (fines de semana)"
        ],
        tips: [
          "Reserva en fin de semana",
          "Plato promedio: $35.000-50.000 COP",
          "Hay opciones vegetarianas"
        ],
        icon: Utensils,
        coordinates: { lat: 10.9912, lng: -74.7856 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FCaima%CC%81n%20del%20Ri%CC%81o.jpg?alt=media&token=0f01f68d-3dd0-4c86-acb5-76e187be0a1e",
        gallery: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
        ]
      },
      {
        id: "luna-rio",
        name: "Luna del Río",
        description: "La noria más grande de Colombia con 45 metros de altura. Vistas panorámicas de 360° de Barranquilla, el río y hasta el mar Caribe.",
        duration: "30-45 min",
        activities: [
          "Subir a la noria (cabinas climatizadas)",
          "Fotografía panorámica",
          "Ver el atardecer desde las alturas",
          "Experiencia romántica VIP disponible"
        ],
        tips: [
          "Entrada: $25.000 COP adultos, $20.000 niños",
          "Abre de 4 PM a 10 PM entre semana",
          "Mejor al atardecer"
        ],
        icon: Sun,
        coordinates: { lat: 10.9934, lng: -74.7823 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FLuna%20del%20Ri%CC%81o.png?alt=media&token=2654fe89-6bff-4044-83af-3c9303379877"
      },
      {
        id: "aleta-tiburon",
        name: "Aleta del Tiburón",
        description: "El ícono arquitectónico del Malecón. Esta estructura moderna de 25 metros ofrece las mejores vistas del río y es el punto de encuentro favorito de los locales.",
        duration: "30 min",
        activities: [
          "Fotografía en el mirador",
          "Ver el atardecer sobre el río",
          "Disfrutar la brisa del Magdalena",
          "Tomarse foto con la escultura"
        ],
        tips: [
          "Llega 30 min antes del atardecer",
          "Hay vendedores de raspao y bebidas",
          "Punto perfecto para drones (con permiso)"
        ],
        icon: Camera,
        coordinates: { lat: 10.9956, lng: -74.7801 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FAleta%20del%20Tiburo%CC%81n.jpeg?alt=media&token=a52edbc1-abbf-4f4a-9532-ca3567dc7277"
      }
    ],
    transport: [
      {
        type: "car",
        name: "Vehículo particular",
        description: "Hay parqueaderos en varios puntos del Malecón",
        duration: "Depende del origen",
        cost: "Parqueadero: $5.000-10.000 COP/hora",
        details: [
          "Parqueadero en Puerta de Oro",
          "Parqueadero en zona Caimán",
          "Zonas de parqueo en la vía"
        ],
        icon: Car
      },
      {
        type: "public",
        name: "Transmetro + Caminata",
        description: "Estación cercana con acceso peatonal al Malecón",
        duration: "Variable según origen",
        cost: "$2.800 COP pasaje",
        details: [
          "Estación más cercana: Pacho Galán",
          "10-15 min caminando hasta el Malecón",
          "Ruta segura y señalizada"
        ],
        icon: Bus
      }
    ],
    whatToBring: [
      "Protector solar",
      "Gorra o sombrero",
      "Agua",
      "Cámara",
      "Efectivo para vendedores ambulantes"
    ],
    estimatedBudget: {
      low: "50.000",
      high: "150.000",
      currency: "COP"
    },
    highlights: [
      "Atardeceres espectaculares",
      "Gastronomía caribeña",
      "Noria panorámica",
      "Paseos en lancha"
    ],
    warnings: [
      "Puede hacer mucho calor al mediodía",
      "Fines de semana muy concurrido"
    ],
    accessibility: "Rampas y senderos planos en todo el recorrido. Sillas de ruedas pueden circular sin problema."
  };
  
  // =============================================================================
  // RUTA 2: AVISTAMIENTO DE AVES
  // =============================================================================
  
  export const rutaAves: TouristRoute = {
    id: "avistamiento-aves",
    slug: "ruta-de-aves",
    title: "Ruta de las Aves",
    tagline: "Donde vuelan 150+ especies entre río, ciénaga y mar",
    description: "Descubre por qué Barranquilla es un 'aeropuerto 5 estrellas' para aves migratorias en este recorrido por el Ecoparque Ciénaga de Mallorquín.",
    longDescription: "El Atlántico es un corredor migratorio vital para aves de Norte y Sudamérica. En la Ciénaga de Mallorquín, declarada humedal Ramsar, conviven más de 150 especies incluyendo garzas, pelícanos, flamencos, águilas pescadoras y el endémico colibrí cienaguero.",
    duration: "5-7 horas",
    durationHours: 6,
    difficulty: "easy",
    bestTime: "Temprano (5:30-8:00 AM) o tarde (4:00-6:00 PM)",
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FEl%20Barranquero.jpg?alt=media&token=d2343956-d681-423f-b12e-ae29589f8fde",
    galleryImages: [
      "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80",
      "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=80",
      "https://images.unsplash.com/photo-1621631556801-ab521c0b7e32?w=800&q=80"
    ],
    icon: Bird,
    color: "#008D39", // Verde Bijao
    startPoint: "Ecoparque Ciénaga de Mallorquín",
    endPoint: "Playa Puerto Mocho",
    stops: [
      {
        id: "ecoparque-entrada",
        name: "Ecoparque Ciénaga de Mallorquín",
        description: "El pulmón verde de Barranquilla. 650 hectáreas de laguna costera, manglares y humedales protegidos como sitio Ramsar.",
        duration: "30 min",
        activities: [
          "Registro en el centro de visitantes",
          "Ver la galería educativa de aves",
          "Recibir mapa del sendero",
          "Conocer las especies del día"
        ],
        tips: [
          "Llega antes de las 7 AM para ver más aves",
          "El mejor horario es octubre-marzo (migración)"
        ],
        icon: MapPin,
        coordinates: { lat: 11.0234, lng: -74.8567 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FEcoparque%20Cie%CC%81naga%20de%20Mallorqui%CC%81n.jpg?alt=media&token=e37bf2fc-2a87-43da-811b-4e85823ead28"
      },
      {
        id: "sendero-manglar",
        name: "Sendero Manglar",
        description: "Recorrido elevado de 800 metros que atraviesa el ecosistema de manglar. Aquí habitan garzas, conirostros y el raro colibrí cienaguero.",
        duration: "1 hora",
        activities: [
          "Caminata por pasarelas elevadas",
          "Avistamiento de garzas y pelícanos",
          "Fotografía de naturaleza",
          "Identificación de flora nativa"
        ],
        tips: [
          "Lleva binoculares",
          "Camina despacio y en silencio",
          "Hay guías disponibles ($30.000 COP)"
        ],
        icon: Footprints,
        coordinates: { lat: 11.0256, lng: -74.8589 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FSendero%20Manglar.jpeg?alt=media&token=bf4b43af-9e61-44e1-a910-f640b72e2e1a"
      },
      {
        id: "torre-avistamiento",
        name: "Torre de Avistamiento",
        description: "Estructura de 11 metros con vistas panorámicas a la ciénaga. Punto ideal para ver flamencos, águilas pescadoras y pelícanos en vuelo.",
        duration: "45 min",
        activities: [
          "Subir a la torre de observación",
          "Avistamiento con telescopios",
          "Fotografía de aves en vuelo",
          "Contar especies (checklist disponible)"
        ],
        tips: [
          "Mejor hora: amanecer",
          "Hay telescopios disponibles",
          "No hagas ruidos fuertes"
        ],
        icon: Binoculars,
        coordinates: { lat: 11.0278, lng: -74.8601 },
        image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80"
      },
      {
        id: "puerto-mocho",
        name: "Playa Puerto Mocho",
        description: "Donde la ciénaga se encuentra con el mar. Playa tranquila accesible por el tren eléctrico del ecoparque.",
        duration: "2 horas",
        activities: [
          "Paseo en tren eléctrico",
          "Baño en el mar Caribe",
          "Almuerzo de pescado fresco",
          "Descanso bajo las enramadas"
        ],
        tips: [
          "El tren sale cada 30 min",
          "Lleva efectivo para el almuerzo",
          "Hay casetas con sombra"
        ],
        icon: Palmtree,
        coordinates: { lat: 11.0312, lng: -74.8534 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPlaya%20Puerto%20Mocho.jpg?alt=media&token=6720ecbc-84a7-42f0-b65f-8f6b6a101a5e"
      }
    ],
    transport: [
      {
        type: "car",
        name: "Vehículo particular",
        description: "Acceso por la vía Las Flores",
        duration: "30 min desde centro de Barranquilla",
        cost: "Parqueadero gratuito",
        details: [
          "Tomar Circunvalar hacia el norte",
          "Seguir señalización a Las Flores",
          "Entrada principal en Km 8"
        ],
        icon: Car
      },
      {
        type: "tour",
        name: "Tour organizado",
        description: "Incluye transporte y guía especializado",
        duration: "6-7 horas total",
        cost: "$80.000-120.000 COP por persona",
        details: [
          "Recogida en hotel",
          "Guía ornitólogo incluido",
          "Binoculares disponibles"
        ],
        icon: Bus
      }
    ],
    whatToBring: [
      "Binoculares",
      "Cámara con zoom",
      "Repelente de insectos",
      "Ropa cómoda y fresca",
      "Agua y snacks"
    ],
    estimatedBudget: {
      low: "30.000",
      high: "120.000",
      currency: "COP"
    },
    highlights: [
      "150+ especies de aves",
      "Humedal Ramsar",
      "Tren eléctrico",
      "Playa virgen"
    ],
    warnings: [
      "Llevar repelente - hay mosquitos",
      "No alimentar a las aves"
    ],
    accessibility: "El sendero elevado permite paso de sillas de ruedas. La torre tiene rampas hasta el segundo nivel."
  };
  
  // =============================================================================
  // RUTA 3: PLAYAS DEL ATLÁNTICO
  // =============================================================================
  
  export const rutaPlayas: TouristRoute = {
    id: "playas-caribe",
    slug: "ruta-de-playas",
    title: "Ruta de Playas",
    tagline: "18 km de costa caribeña a tu alcance",
    description: "De Salgar a Puerto Velero: las mejores playas del Atlántico, cada una con su propio encanto y sabor local.",
    longDescription: "El departamento del Atlántico cuenta con más de 90 kilómetros de costa sobre el Mar Caribe. Esta ruta te lleva por las playas más accesibles y hermosas, desde el histórico Castillo de Salgar hasta las aguas turquesas de Puerto Velero.",
    duration: "Día completo (8-10 horas)",
    durationHours: 9,
    difficulty: "easy",
    bestTime: "Todo el año. Evitar lluvias de octubre-noviembre",
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPlaya%20Pradomar.jpg?alt=media&token=3bb3c26d-de92-482d-963c-424701027bdb",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80"
    ],
    icon: Palmtree,
    color: "#EA5B13", // Naranja Salinas
    startPoint: "Castillo de Salgar, Puerto Colombia",
    endPoint: "Puerto Velero, Tubará",
    stops: [
      {
        id: "castillo-salgar",
        name: "Castillo de Salgar",
        description: "Fortín español del siglo XIX con vista espectacular al mar. Ahora alberga un restaurante de comida típica caribeña.",
        duration: "1 hora",
        activities: [
          "Recorrer el castillo histórico",
          "Desayuno con vista al mar",
          "Fotografía del amanecer",
          "Conocer la historia colonial"
        ],
        tips: [
          "Abre desde las 8 AM",
          "El desayuno típico cuesta $25.000-35.000 COP",
          "Está a solo 20 min de Barranquilla"
        ],
        icon: Coffee,
        coordinates: { lat: 11.0012, lng: -74.9456 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FCastillo%20de%20Salgar.jpg?alt=media&token=6e6f2e4d-90a0-43a6-bc64-5620f26b67b5"
      },
      {
        id: "playa-salgar",
        name: "Playa Salgar",
        description: "Playa familiar con oleaje moderado y buena infraestructura de casetas y restaurantes.",
        duration: "2 horas",
        activities: [
          "Baño en el mar",
          "Deportes de playa",
          "Almuerzo de mariscos",
          "Alquiler de kayaks"
        ],
        tips: [
          "Caseta: $20.000-30.000 COP/día",
          "Hay salvavidas",
          "Oleaje moderado - apto para niños"
        ],
        icon: Sun,
        coordinates: { lat: 11.0034, lng: -74.9478 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPlaya%20Salgar.jpg?alt=media&token=b0b3150b-7fd5-47ab-93ef-be5c2e800c56"
      },
      {
        id: "playa-pradomar",
        name: "Playa Pradomar",
        description: "La playa más exclusiva del Atlántico con clubes de playa y ambiente sofisticado.",
        duration: "2-3 horas",
        activities: [
          "Club de playa con piscina",
          "Cócteles y música",
          "Deportes náuticos",
          "Atardecer romántico"
        ],
        tips: [
          "Reservar en fines de semana",
          "Entrada a clubes: $50.000-100.000 COP",
          "Ambiente juvenil y animado"
        ],
        icon: Music,
        coordinates: { lat: 11.0156, lng: -74.9623 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPlaya%20Pradomar.jpg?alt=media&token=3bb3c26d-de92-482d-963c-424701027bdb"
      },
      {
        id: "puerto-velero",
        name: "Puerto Velero",
        description: "Bahía de aguas turquesas y tranquilas, perfecta para deportes náuticos y familias. El punto más hermoso de la costa atlanticense.",
        duration: "3-4 horas",
        activities: [
          "Paddle board y kayak",
          "Jet ski y banana boat",
          "Restaurantes con vista al mar",
          "Atardecer espectacular"
        ],
        tips: [
          "Aguas muy tranquilas - ideal para niños",
          "Mejor atardecer de la costa",
          "Hay hoteles y cabañas"
        ],
        icon: Palmtree,
        coordinates: { lat: 11.0234, lng: -74.9789 },
        image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FPuerto%20Velero.avif?alt=media&token=3a1f3feb-b5c9-426d-b883-471907acc431"
      }
    ],
    transport: [
      {
        type: "car",
        name: "Vehículo particular",
        description: "La mejor opción para recorrer todas las playas",
        duration: "20-40 min entre playas",
        cost: "Gasolina: $30.000-40.000 COP total",
        details: [
          "Carretera en buen estado",
          "Señalización clara",
          "Parqueaderos en cada playa"
        ],
        icon: Car
      },
      {
        type: "public",
        name: "Buses desde Barranquilla",
        description: "Buses frecuentes a Puerto Colombia y Tubará",
        duration: "30-60 min según destino",
        cost: "$3.000-6.000 COP por trayecto",
        details: [
          "Salen desde Terminal de Transporte",
          "Frecuencia cada 20-30 min",
          "Última salida: 6 PM"
        ],
        icon: Bus
      }
    ],
    whatToBring: [
      "Protector solar alto SPF",
      "Traje de baño",
      "Toalla",
      "Efectivo",
      "Snorkel (opcional)"
    ],
    estimatedBudget: {
      low: "80.000",
      high: "250.000",
      currency: "COP"
    },
    highlights: [
      "Castillo histórico",
      "Aguas cristalinas",
      "Deportes náuticos",
      "Gastronomía de mar"
    ],
    warnings: [
      "Usar protector solar - sol muy fuerte",
      "Cuidar objetos de valor"
    ],
    accessibility: "Acceso a playas con sillas especiales disponibles en Puerto Velero bajo reserva."
  };
  
  // =============================================================================
  // RUTA 4: CULTURAL - CARNAVAL Y ARTESANÍAS
  // =============================================================================
  
  export const rutaCultural: TouristRoute = {
    id: "cultura-carnaval",
    slug: "ruta-cultural",
    title: "Ruta Cultural",
    tagline: "Artesanías, poesía y el alma del Carnaval",
    description: "Conoce los pueblos donde nace el arte atlanticense: máscaras de Galapa, sombreros de Usiacurí y la casa del poeta Julio Flórez.",
    longDescription: "Esta ruta te lleva al corazón cultural del Atlántico. En Galapa descubrirás el origen de las máscaras del Carnaval de Barranquilla. En Usiacurí, el pueblo de los artesanos de palma de iraca y la casa museo del poeta Julio Flórez.",
    duration: "6-8 horas",
    durationHours: 7,
    difficulty: "easy",
    bestTime: "Todo el año. Especial en pre-Carnaval (enero-febrero)",
    image: "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RutasImages%2FMusel%20Del%20Carnaval.jpg?alt=media&token=dd713bbd-c9e2-49f0-9cdf-1e91c7d6f0f7",
    galleryImages: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
    ],
    icon: Palette,
    color: "#D31A2B", // Rojo Cayena
    startPoint: "Galapa (Talleres de máscaras)",
    endPoint: "Usiacurí (Casa Museo Julio Flórez)",
    stops: [
      {
        id: "galapa-talleres",
        name: "Talleres de Máscaras - Galapa",
        description: "Galapa es la cuna de las máscaras del Carnaval. Aquí familias de artesanos elaboran a mano las icónicas máscaras de marimonda, torito y otros personajes.",
        duration: "2 horas",
        activities: [
          "Visitar talleres familiares",
          "Ver el proceso de elaboración",
          "Comprar máscaras auténticas",
          "Taller de pintura (opcional)"
        ],
        tips: [
          "Llamar antes para confirmar apertura",
          "Máscaras desde $30.000 COP",
          "Mejor época: noviembre-febrero"
        ],
        icon: Palette,
        coordinates: { lat: 10.8934, lng: -74.8856 },
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
      },
      {
        id: "galapa-iglesia",
        name: "Centro Histórico de Galapa",
        description: "Pequeño pueblo colonial con iglesia del siglo XVIII y plaza principal típica del Caribe colombiano.",
        duration: "30 min",
        activities: [
          "Visitar la iglesia colonial",
          "Recorrer la plaza",
          "Probar jugos naturales",
          "Fotografía de arquitectura"
        ],
        tips: [
          "Iglesia abierta en horarios de misa",
          "Hay restaurantes de comida típica",
          "Pueblo tranquilo y seguro"
        ],
        icon: Landmark,
        coordinates: { lat: 10.8912, lng: -74.8834 },
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80"
      },
      {
        id: "usiacuri-artesanias",
        name: "Calle de los Artesanos - Usiacurí",
        description: "Más de 50 talleres donde artesanos tejen sombreros, bolsos y accesorios con palma de iraca. Tradición de más de 100 años.",
        duration: "2 horas",
        activities: [
          "Recorrer la calle principal",
          "Ver tejedoras en acción",
          "Comprar artesanías únicas",
          "Aprender técnicas de tejido"
        ],
        tips: [
          "Sombreros desde $40.000 COP",
          "Bolsos desde $25.000 COP",
          "Se puede regatear respetuosamente"
        ],
        icon: ShoppingBag,
        coordinates: { lat: 10.7512, lng: -74.9645 },
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
      },
      {
        id: "casa-julio-florez",
        name: "Casa Museo Julio Flórez",
        description: "Hogar del poeta más importante del Atlántico. Sus versos románticos y su historia de amor con Petrona te cautivarán.",
        duration: "1 hora",
        activities: [
          "Recorrer la casa del poeta",
          "Leer sus poemas más famosos",
          "Ver objetos personales",
          "Conocer la historia de amor con Petrona"
        ],
        tips: [
          "Entrada: $5.000 COP aprox.",
          "Guía incluido en la entrada",
          "Jardín con flores hermosas"
        ],
        icon: Camera,
        coordinates: { lat: 10.7523, lng: -74.9667 },
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
      }
    ],
    transport: [
      {
        type: "car",
        name: "Vehículo particular",
        description: "La forma más cómoda de hacer la ruta Galapa-Usiacurí",
        duration: "Galapa: 15 min | Usiacurí: 40 min desde Barranquilla",
        cost: "Gasolina: $20.000-30.000 COP aprox.",
        details: [
          "Galapa: tomar vía hacia Galapa por La Cordialidad",
          "Usiacurí: continuar por La Cordialidad hacia Sabanalarga",
          "Carreteras en buen estado"
        ],
        icon: Car
      },
      {
        type: "tour",
        name: "Tour cultural organizado",
        description: "Incluye transporte, guía y entradas",
        duration: "8 horas completas",
        cost: "$120.000-180.000 COP por persona",
        details: [
          "Recogida en hotel",
          "Almuerzo típico incluido",
          "Guía cultural especializado"
        ],
        icon: Bus
      }
    ],
    whatToBring: [
      "Efectivo para artesanías",
      "Cámara fotográfica",
      "Ropa fresca",
      "Zapatos cómodos",
      "Bolsa para compras"
    ],
    estimatedBudget: {
      low: "60.000",
      high: "200.000",
      currency: "COP"
    },
    highlights: [
      "Máscaras de Carnaval",
      "Artesanías en palma",
      "Casa del poeta",
      "Cultura viva"
    ],
    warnings: [
      "Algunos talleres cierran al mediodía",
      "Llevar efectivo - poco uso de tarjetas"
    ],
    accessibility: "Galapa tiene mejor acceso. En Usiacurí las calles son empedradas."
  };
  
  // =============================================================================
  // EXPORTACIÓN
  // =============================================================================
  
  export const allRoutes: TouristRoute[] = [
    rutaMalecon,
    rutaAves,
    rutaPlayas,
    rutaCultural
  ];
  
  export const getRouteBySlug = (slug: string): TouristRoute | undefined => {
    return allRoutes.find(route => route.slug === slug);
  };
  
  export const getRouteById = (id: string): TouristRoute | undefined => {
    return allRoutes.find(route => route.id === id);
  };