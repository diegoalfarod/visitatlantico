// File: src/utils/itinerary-helpers.ts

import { 
  Utensils, 
  Camera, 
  Anchor, 
  Music, 
  Coffee, 
  Landmark, 
  MapPin,
  Star,
  Waves,
  TreePine,
  ShoppingBag,
  Heart,
  Mountain,
  Wine,
  Beer,
  IceCream,
  Pizza,
  Fish,
  Building,
  Palette,
  PartyPopper,
  Church,
  Trees,
  Flower,
  Gift,
  Moon,
  Building2,
  Activity,
  Brain,
  Sailboat,
  Plane,
  Train,
  Hotel,
  BedDouble,
  Tent,
  Hospital,
  Pill,
  CreditCard,
  University,
  Library,
  School,
  Eye,
  Bird,
  Gamepad2,
  Dice1,
  Trophy,
  Dumbbell,
  Sparkles,
  Film,
  Store,
  Droplets,
  Bike,
  Package,
  Globe,
  Calendar,
  Clock,
  Navigation,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
  Grid,
  List,
  MoreVertical,
  GripVertical,
  PlusCircle,
  Search,
  Shuffle,
  Settings,
  Download,
  Share2,
  FileText,
  Loader2,
  ArrowLeft,
  Home,
  Menu,
  Maximize2
} from "lucide-react";
import React from "react";

// Función para obtener el ícono de categoría - VERSIÓN MEJORADA
export const getCategoryIcon = (category?: string) => {
  if (!category) return React.createElement(Star, { className: "w-4 h-4" });
  
  const lowerCategory = category.toLowerCase();
  
  // Mapeo de categorías a iconos
  const iconMap: Record<string, React.ReactElement> = {
    // Comida y bebida
    'gastronomía': React.createElement(Utensils, { className: "w-4 h-4" }),
    'restaurante': React.createElement(Utensils, { className: "w-4 h-4" }),
    'comida': React.createElement(Utensils, { className: "w-4 h-4" }),
    'café': React.createElement(Coffee, { className: "w-4 h-4" }),
    'cafetería': React.createElement(Coffee, { className: "w-4 h-4" }),
    'bar': React.createElement(Wine, { className: "w-4 h-4" }),
    'cervecería': React.createElement(Beer, { className: "w-4 h-4" }),
    'panadería': React.createElement(Coffee, { className: "w-4 h-4" }),
    'heladería': React.createElement(IceCream, { className: "w-4 h-4" }),
    'pizzería': React.createElement(Pizza, { className: "w-4 h-4" }),
    
    // Actividades y deportes
    'playa': React.createElement(Waves, { className: "w-4 h-4" }),
    'mar': React.createElement(Waves, { className: "w-4 h-4" }),
    'surf': React.createElement(Waves, { className: "w-4 h-4" }),
    'deportes acuáticos': React.createElement(Anchor, { className: "w-4 h-4" }),
    'buceo': React.createElement(Fish, { className: "w-4 h-4" }),
    'pesca': React.createElement(Fish, { className: "w-4 h-4" }),
    'senderismo': React.createElement(Mountain, { className: "w-4 h-4" }),
    'ciclismo': React.createElement(Bike, { className: "w-4 h-4" }),
    'gimnasio': React.createElement(Dumbbell, { className: "w-4 h-4" }),
    
    // Cultura y entretenimiento
    'museo': React.createElement(Building, { className: "w-4 h-4" }),
    'galería': React.createElement(Palette, { className: "w-4 h-4" }),
    'arte': React.createElement(Palette, { className: "w-4 h-4" }),
    'teatro': React.createElement(Building, { className: "w-4 h-4" }),
    'cine': React.createElement(Film, { className: "w-4 h-4" }),
    'música': React.createElement(Music, { className: "w-4 h-4" }),
    'concierto': React.createElement(Music, { className: "w-4 h-4" }),
    'festival': React.createElement(PartyPopper, { className: "w-4 h-4" }),
    'carnaval': React.createElement(PartyPopper, { className: "w-4 h-4" }),
    'fiesta': React.createElement(Music, { className: "w-4 h-4" }),
    
    // Lugares históricos
    'histórico': React.createElement(Landmark, { className: "w-4 h-4" }),
    'monumento': React.createElement(Landmark, { className: "w-4 h-4" }),
    'iglesia': React.createElement(Church, { className: "w-4 h-4" }),
    'cultura': React.createElement(Landmark, { className: "w-4 h-4" }),
    'patrimonio': React.createElement(Landmark, { className: "w-4 h-4" }),
    
    // Naturaleza
    'parque': React.createElement(Trees, { className: "w-4 h-4" }),
    'jardín': React.createElement(Flower, { className: "w-4 h-4" }),
    'bosque': React.createElement(TreePine, { className: "w-4 h-4" }),
    'reserva natural': React.createElement(TreePine, { className: "w-4 h-4" }),
    'naturaleza': React.createElement(TreePine, { className: "w-4 h-4" }),
    'montaña': React.createElement(Mountain, { className: "w-4 h-4" }),
    'cascada': React.createElement(Droplets, { className: "w-4 h-4" }),
    
    // Compras
    'compras': React.createElement(ShoppingBag, { className: "w-4 h-4" }),
    'mercado': React.createElement(Store, { className: "w-4 h-4" }),
    'artesanías': React.createElement(Gift, { className: "w-4 h-4" }),
    'souvenirs': React.createElement(Gift, { className: "w-4 h-4" }),
    'centro comercial': React.createElement(ShoppingBag, { className: "w-4 h-4" }),
    
    // Vida nocturna
    'vida nocturna': React.createElement(Moon, { className: "w-4 h-4" }),
    'discoteca': React.createElement(Music, { className: "w-4 h-4" }),
    'club': React.createElement(Music, { className: "w-4 h-4" }),
    'rooftop': React.createElement(Building2, { className: "w-4 h-4" }),
    
    // Bienestar
    'spa': React.createElement(Heart, { className: "w-4 h-4" }),
    'masajes': React.createElement(Heart, { className: "w-4 h-4" }),
    'yoga': React.createElement(Activity, { className: "w-4 h-4" }),
    'meditación': React.createElement(Brain, { className: "w-4 h-4" }),
    'bienestar': React.createElement(Heart, { className: "w-4 h-4" }),
    
    // Transporte
    'puerto': React.createElement(Anchor, { className: "w-4 h-4" }),
    'marina': React.createElement(Sailboat, { className: "w-4 h-4" }),
    'aeropuerto': React.createElement(Plane, { className: "w-4 h-4" }),
    'estación': React.createElement(Train, { className: "w-4 h-4" }),
    
    // Alojamiento
    'hotel': React.createElement(Hotel, { className: "w-4 h-4" }),
    'hostal': React.createElement(BedDouble, { className: "w-4 h-4" }),
    'camping': React.createElement(Tent, { className: "w-4 h-4" }),
    
    // Otros
    'fotografía': React.createElement(Camera, { className: "w-4 h-4" }),
    'paisaje': React.createElement(Camera, { className: "w-4 h-4" }),
    'mirador': React.createElement(Eye, { className: "w-4 h-4" }),
    'zoológico': React.createElement(Bird, { className: "w-4 h-4" }),
    'acuario': React.createElement(Fish, { className: "w-4 h-4" }),
    'parque de atracciones': React.createElement(Gamepad2, { className: "w-4 h-4" }),
    'casino': React.createElement(Dice1, { className: "w-4 h-4" }),
    'estadio': React.createElement(Trophy, { className: "w-4 h-4" }),
    'piscina': React.createElement(Waves, { className: "w-4 h-4" }),
    'descanso': React.createElement(Coffee, { className: "w-4 h-4" }),
    'relax': React.createElement(Sparkles, { className: "w-4 h-4" }),
  };
  
  // Buscar coincidencia exacta primero
  if (iconMap[lowerCategory]) {
    return iconMap[lowerCategory];
  }
  
  // Buscar coincidencia parcial si no hay coincidencia exacta
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return icon;
    }
  }
  
  // Icono por defecto
  return React.createElement(MapPin, { className: "w-4 h-4" });
};

// Funciones de conversión de tiempo - MEJORADAS CON VALIDACIÓN
export const toMin = (time: string): number => {
  if (!time || typeof time !== 'string' || !time.includes(':')) return 0;
  
  const parts = time.split(':');
  if (parts.length !== 2) return 0;
  
  const [h, m] = parts.map(Number);
  
  // Validar que sean números válidos
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return 0;
  }
  
  return h * 60 + m;
};

export const toHHMM = (minutes: number): string => {
  // Validar entrada
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return "00:00";
  }
  
  // Manejar días completos (24 horas = 1440 minutos)
  const totalMinutes = minutes % 1440;
  
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const formatTime = (time: string): string => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return "--:--";
  }
  
  const parts = time.split(':');
  if (parts.length !== 2) return "--:--";
  
  const [h, m] = parts.map(Number);
  
  // Validar que sean números válidos
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return "--:--";
  }
  
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

// Función auxiliar para calcular la duración entre dos tiempos
export const calculateDuration = (startTime: string, endTime: string): number => {
  const startMin = toMin(startTime);
  const endMin = toMin(endTime);
  
  // Si el tiempo final es menor que el inicial, asumimos que cruza la medianoche
  if (endMin < startMin) {
    return (1440 - startMin) + endMin; // 1440 = 24 * 60
  }
  
  return endMin - startMin;
};

// Función para agregar minutos a un tiempo
export const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const baseMinutes = toMin(time);
  const totalMinutes = baseMinutes + minutesToAdd;
  return toHHMM(totalMinutes);
};

// Función para validar si un tiempo está en formato correcto
export const isValidTimeFormat = (time: string): boolean => {
  if (!time || typeof time !== 'string') return false;
  
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

// Función para obtener el período del día
export const getTimePeriod = (time: string): string => {
  const minutes = toMin(time);
  const hour = Math.floor(minutes / 60);
  
  if (hour >= 5 && hour < 12) return "Mañana";
  if (hour >= 12 && hour < 17) return "Tarde";
  if (hour >= 17 && hour < 21) return "Noche";
  return "Madrugada";
};

// Función para formatear duración en texto legible
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${mins}min`;
};

// Función para calcular el tiempo total de un itinerario
export const calculateTotalTime = (stops: Array<{ durationMinutes: number }>): { hours: number; minutes: number; totalMinutes: number } => {
  const totalMinutes = stops.reduce((sum, stop) => sum + (stop.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalMinutes };
};

// Función para obtener color según el tipo de actividad
export const getActivityTypeColor = (type: string): { primary: string; secondary: string; light: string; border: string; text: string } => {
  const colors: Record<string, { primary: string; secondary: string; light: string; border: string; text: string }> = {
    destination: {
      primary: "bg-blue-600",
      secondary: "bg-blue-500",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    experience: {
      primary: "bg-green-600",
      secondary: "bg-green-500",
      light: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    break: {
      primary: "bg-amber-600",
      secondary: "bg-amber-500",
      light: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    transport: {
      primary: "bg-gray-600",
      secondary: "bg-gray-500",
      light: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
    }
  };
  
  return colors[type] || colors.experience;
};

// Exportar todos los iconos que podrían necesitarse
export {
  Utensils,
  Camera,
  Anchor,
  Music,
  Coffee,
  Landmark,
  MapPin,
  Star,
  Waves,
  TreePine,
  ShoppingBag,
  Heart,
  Mountain,
  Wine,
  Beer,
  IceCream,
  Pizza,
  Fish,
  Building,
  Palette,
  PartyPopper,
  Church,
  Trees,
  Flower,
  Gift,
  Moon,
  Building2,
  Activity,
  Brain,
  Sailboat,
  Plane,
  Train,
  Hotel,
  BedDouble,
  Tent,
  Hospital,
  Pill,
  CreditCard,
  University,
  Library,
  School,
  Eye,
  Bird,
  Gamepad2,
  Dice1,
  Trophy,
  Dumbbell,
  Sparkles,
  Film,
  Store,
  Droplets,
  Bike,
  Package,
  Globe,
  Calendar,
  Clock,
  Navigation,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
  Grid,
  List,
  MoreVertical,
  GripVertical,
  PlusCircle,
  Search,
  Shuffle,
  Settings,
  Download,
  Share2,
  FileText,
  Loader2,
  ArrowLeft,
  Home,
  Menu,
  Maximize2
};