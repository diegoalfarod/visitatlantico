export interface Stop {
    id: string;
    name: string;
    category: string; // CAMBIO: Asegúrate de que NO sea opcional
    description?: string;
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    duration: number;
    day: number;
    order: number;
    time?: string;
    tips?: string[];
    images?: string[];
    rating?: number;
    priceLevel?: number;
    openingHours?: string[];
    contact?: {
      phone?: string;
      website?: string;
    };
  }
  
  
  export interface SavedItinerary {
    id: string;
    shortId: string;
    title: string;
    days: number;
    stops: Stop[];
    profile: {
      motivos?: string[];
      otros?: boolean;
      email?: string;
    };
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    createdAt: string;
    expiresAt?: string;
    views: number;
    lastViewedAt?: string;
    isOffline?: boolean;
  }
  
  export interface ItineraryMetadata {
    id: string;
    shortId: string;
    title: string;
    days: number;
    totalStops: number;
    createdAt: string;
    thumbnail?: string;
  }