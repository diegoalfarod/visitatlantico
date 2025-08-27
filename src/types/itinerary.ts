// File: src/types/itinerary.ts
// Tipos compartidos para el planner
// ──────────────────────────────────────────────────────────────────────────────
export interface Stop {
  id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  photos?: string[];
  distance?: number; // km entre este y el anterior (opcional)
  type?: "destination" | "experience" | "restaurant" | "transport";
  cost?: number;
  rating?: number;
  bestTimeToVisit?: string;
  accessibility?: string;
  weatherConsideration?: string;
  localInsight?: string;
  crowdLevel?: "low" | "medium" | "high";
  mustTry?: string[];
  tags?: string[];
  // enriquecimientos opcionales
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: Record<string, [string, string][]>; // ej: { mon: [["09:00","17:00"]] }
  priceLevel?: number; // 0-4
  }
  
  
  export interface LocationResult {
  lat: number;
  lng: number;
  address?: string;
  }
  
  
  export interface ItineraryResponse {
  itinerary: Stop[];
  }