export type Role = "user" | "assistant";

export interface Place {
  id: string;
  name: string;
  address: string;
  rating: number;
  price_level: number;
  description: string;
  local_tip: string;
  category: "Restaurant" | "Hotel" | "Attraction" | "Beach" | "Nightlife";
  photo?: string;           // 👈 NUEVO
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  places?: Place[];
}
