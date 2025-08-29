// src/types/planner.ts

export interface TravelerProfile {
    days: number;
    startLocation?: { lat: number; lng: number; name?: string } | string;
    interests: string[];
    tripType: string;
    budget: string;
    travelPace: string;
    maxDistance: string;
    email: string;
  }
  
  export interface ProcessedProfile {
    days: number;
    email: string;
    interests: string[];
    tripType: string;
    budget: string;
    pace: string;
    locationRange: string;
    startLocation?: { lat: number; lng: number; name?: string };
  }