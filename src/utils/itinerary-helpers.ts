import { Utensils, Camera, Anchor, Music, Coffee, Landmark, MapPin } from "lucide-react";
import React from "react";

// Función para obtener el ícono de categoría
export const getCategoryIcon = (c?: string) => {
  if (!c) return React.createElement(MapPin, { className: "w-4 h-4" });
  const cat = c.toLowerCase();
  if (cat.match(/gastronomía|restaurante|comida/)) 
    return React.createElement(Utensils, { className: "w-4 h-4" });
  if (cat.match(/fotografía|paisaje/)) 
    return React.createElement(Camera, { className: "w-4 h-4" });
  if (cat.match(/playa|mar/)) 
    return React.createElement(Anchor, { className: "w-4 h-4" });
  if (cat.match(/música|fiesta/)) 
    return React.createElement(Music, { className: "w-4 h-4" });
  if (cat.match(/café|descanso/)) 
    return React.createElement(Coffee, { className: "w-4 h-4" });
  if (cat.match(/museo|cultura|arte/)) 
    return React.createElement(Landmark, { className: "w-4 h-4" });
  return React.createElement(MapPin, { className: "w-4 h-4" });
};

// Funciones de conversión de tiempo
export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (min: number) =>
  `${Math.floor(min / 60)
    .toString()
    .padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;

export const formatTime = (t: string) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
};