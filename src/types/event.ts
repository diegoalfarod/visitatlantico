// =============================================================================
// Event Types - VisitAtlántico
// =============================================================================

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description?: string;
  dates: string;
  dateStart: string;
  dateEnd?: string;
  time?: string;
  location: string;
  municipality: string;
  address?: string;
  image: string;
  gallery?: string[];
  isFree?: boolean;
  price?: string;
  featured?: boolean;
  category?: EventCategory;
  tags?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  organizer?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type EventCategory = 
  | "carnaval"
  | "gastronomia"
  | "cultural"
  | "musica"
  | "deportes"
  | "religioso"
  | "ferias"
  | "otro";

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; emoji: string }> = {
  carnaval: { label: "Carnaval", emoji: "🎭" },
  gastronomia: { label: "Gastronomía", emoji: "🍽️" },
  cultural: { label: "Cultural", emoji: "🎨" },
  musica: { label: "Música", emoji: "🎵" },
  deportes: { label: "Deportes", emoji: "⚽" },
  religioso: { label: "Religioso", emoji: "⛪" },
  ferias: { label: "Ferias", emoji: "🎪" },
  otro: { label: "Otro", emoji: "📅" },
};