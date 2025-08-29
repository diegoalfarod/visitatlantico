import { MapPin, Plane, Umbrella, Waves, Heart, Users, DollarSign, 
    Star, Sunrise, Bike, Activity, Building, Map, Ship,
    PartyPopper, Fish, Music, Palmtree } from "lucide-react";

// Intereses específicos del Atlántico con mapeo para Google Places
export const ATLANTICO_INTERESTS = [
{ 
id: "carnaval_cultura",
label: "Carnaval y Tradiciones",
icon: PartyPopper,
description: "Museo del Carnaval, Casa del Carnaval, cultura local",
googleTypes: ["museum", "cultural_center", "art_gallery"],
geminiContext: "experiencias del Carnaval de Barranquilla, tradiciones culturales, museos",
searchQueries: ["Museo del Carnaval", "Casa del Carnaval", "La Troja"]
},
{
id: "playas_rio",
label: "Playas y Río Magdalena",
icon: Waves,
description: "Puerto Colombia, Salgar, Bocas de Ceniza",
googleTypes: ["beach", "natural_feature", "point_of_interest"],
geminiContext: "playas del Atlántico, malecón del río, actividades acuáticas",
searchQueries: ["Playa Puerto Colombia", "Bocas de Ceniza", "Malecón del Río"]
},
{
id: "gastronomia_local",
label: "Sabores Costeños",
icon: Fish,
description: "Comida de mar, arepas, cocadas, raspao",
googleTypes: ["restaurant", "food", "cafe"],
geminiContext: "gastronomía típica costeña, restaurantes de comida de mar, puestos callejeros tradicionales",
searchQueries: ["Restaurante La Cueva", "Mercado de Barranquillita", "Narcobollo"]
},
{
id: "vida_nocturna",
label: "Rumba y Música",
icon: Music,
description: "La Troja, salsa, champeta, vallenato",
googleTypes: ["night_club", "bar", "live_music_venue"],
geminiContext: "vida nocturna barranquillera, lugares de salsa y champeta, bares típicos",
searchQueries: ["La Troja", "Trucupey", "Froggys"]
},
{
id: "arquitectura_historia",
label: "Patrimonio Histórico",
icon: Building,
description: "El Prado, Teatro Amira, iglesias coloniales",
googleTypes: ["church", "monument", "historic_site"],
geminiContext: "arquitectura republicana, barrio El Prado, sitios históricos",
searchQueries: ["Teatro Amira de la Rosa", "Barrio El Prado", "Catedral Metropolitana"]
},
{
id: "naturaleza_aventura",
label: "Ecoturismo",
icon: Palmtree,
description: "Ciénaga de Mallorquín, Zoo de Barranquilla",
googleTypes: ["park", "zoo", "natural_reserve"],
geminiContext: "reservas naturales, avistamiento de aves, ecoturismo",
searchQueries: ["Zoo de Barranquilla", "Ciénaga de Mallorquín", "Parque Isla Salamanca"]
}
];

export const TRIP_TYPES = [
{ 
id: "solo_pareja", 
label: "Solo o en Pareja", 
icon: Heart, 
description: "Experiencias románticas o de autodescubrimiento",
googleContext: "lugares románticos, experiencias íntimas"
},
{ 
id: "familia", 
label: "Viaje Familiar", 
icon: Users, 
description: "Actividades para todas las edades",
googleContext: "family_friendly, actividades para niños"
},
{ 
id: "grupo", 
label: "Con Amigos", 
icon: Users, 
description: "Diversión grupal y aventuras",
googleContext: "actividades grupales, lugares amplios"
},
];

export const BUDGET_OPTIONS = [
{ 
id: "economico", 
label: "Económico", 
icon: DollarSign, 
description: "Mercados, street food, transporte público",
priceLevel: 1 
},
{ 
id: "moderado", 
label: "Moderado", 
icon: DollarSign, 
description: "Restaurantes locales, taxis, hoteles 3★",
priceLevel: 2 
},
{ 
id: "premium", 
label: "Premium", 
icon: Star, 
description: "Fine dining, hoteles 5★, experiencias VIP",
priceLevel: 3 
},
];

export const TRAVEL_PACE = [
{ 
id: "relajado", 
label: "Relajado", 
icon: Sunrise, 
description: "2-3 lugares por día, tiempo libre",
activitiesPerDay: 2,
mappedValue: "relaxed"
},
{ 
id: "moderado", 
label: "Moderado", 
icon: Bike, 
description: "3-4 lugares por día, buen balance",
activitiesPerDay: 3,
mappedValue: "normal"
},
{ 
id: "intenso", 
label: "Intenso", 
icon: Activity, 
description: "5+ lugares por día, máximo provecho",
activitiesPerDay: 5,
mappedValue: "packed"
},
];

export const TRAVEL_DISTANCE = [
{ 
id: "ciudad", 
label: "Solo Barranquilla", 
icon: Building, 
description: "Máximo 15 minutos de viaje",
radiusKm: 10,
mappedValue: "barranquilla"
},
{ 
id: "cerca", 
label: "Cercanías", 
icon: Map, 
description: "Hasta 45 minutos (Puerto Colombia, Soledad)",
radiusKm: 30,
mappedValue: "todo_atlantico"
},
{ 
id: "lejos", 
label: "Todo Atlántico", 
icon: Ship, 
description: "Incluye Usiacurí, Tubará, Juan de Acosta",
radiusKm: 80,
mappedValue: "todo_atlantico"
},
];

export const PREDEFINED_LOCATIONS = [
{ 
id: "barranquilla_centro", 
label: "Centro de Barranquilla", 
icon: MapPin,
description: "Zona hotelera y comercial",
coords: { lat: 10.9878, lng: -74.7889 }
},
{ 
id: "aeropuerto", 
label: "Aeropuerto E. Cortissoz", 
icon: Plane,
description: "Llegando al Atlántico",
coords: { lat: 10.8896, lng: -74.7808 }
},
{
id: "puerto_colombia",
label: "Puerto Colombia",
icon: Umbrella,
description: "Zona de playas",
coords: { lat: 10.9878, lng: -74.9547 }
},
{
id: "boca_de_ceniza",
label: "Bocas de Ceniza",
icon: Waves,
description: "Donde el río encuentra el mar",
coords: { lat: 11.0600, lng: -74.8500 }
}
];