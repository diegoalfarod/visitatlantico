export interface Stop {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    durationMinutes: number;
    tip?: string;
    municipality: string;
    startTime: string;
    category?: string;
    imageUrl?: string;
    photos?: string[];
    distance?: number;
    type: "destination" | "experience";
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