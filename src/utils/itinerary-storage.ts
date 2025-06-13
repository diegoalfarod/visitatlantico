import { SavedItinerary, ItineraryMetadata } from '@/types/itinerary';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'visitatlantico_itineraries';
const MAX_ITINERARIES = 50;
const EXPIRY_DAYS = 180; // 6 meses

export class ItineraryStorage {
  // Generar ID corto único
  static generateShortId(): string {
    return nanoid(10); // Genera IDs como "V1StGXR8_Z"
  }

  // Guardar en localStorage
  static saveLocal(itinerary: SavedItinerary): void {
    try {
      const stored = this.getAllLocal();
      
      // Remover si ya existe
      const filtered = stored.filter(it => it.shortId !== itinerary.shortId);
      
      // Agregar al inicio
      const updated = [itinerary, ...filtered];
      
      // Limitar a MAX_ITINERARIES
      const limited = updated.slice(0, MAX_ITINERARIES);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  // Obtener todos los itinerarios locales
  static getAllLocal(): SavedItinerary[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const itineraries = JSON.parse(stored) as SavedItinerary[];
      
      // Filtrar expirados
      const now = new Date().toISOString();
      return itineraries.filter(it => !it.expiresAt || it.expiresAt > now);
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
      return [];
    }
  }

  // Obtener metadatos para lista
  static getMetadataList(): ItineraryMetadata[] {
    const itineraries = this.getAllLocal();
    return itineraries.map(it => ({
      id: it.id,
      shortId: it.shortId,
      title: it.title,
      days: it.days,
      totalStops: it.stops.length,
      createdAt: it.createdAt,
      thumbnail: it.stops[0]?.imageUrl
    }));
  }

  // Obtener un itinerario por shortId
  static getByShortId(shortId: string): SavedItinerary | null {
    const itineraries = this.getAllLocal();
    return itineraries.find(it => it.shortId === shortId) || null;
  }

  // Actualizar última vista
  static updateLastViewed(shortId: string): void {
    const itinerary = this.getByShortId(shortId);
    if (itinerary) {
      itinerary.lastViewedAt = new Date().toISOString();
      itinerary.views = (itinerary.views || 0) + 1;
      this.saveLocal(itinerary);
    }
  }

  // Eliminar itinerario
  static delete(shortId: string): void {
    const stored = this.getAllLocal();
    const filtered = stored.filter(it => it.shortId !== shortId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  // Limpiar caché viejo
  static cleanupOld(): void {
    const stored = this.getAllLocal();
    const now = new Date().toISOString();
    const valid = stored.filter(it => !it.expiresAt || it.expiresAt > now);
    
    if (valid.length < stored.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
  }

  // Generar título automático
  static generateTitle(profile: any, days: number): string {
    const motivos = profile.motivos || [];
    const fecha = new Date().toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short' 
    });
    
    if (motivos.length > 0) {
      const motivoLabel = this.getMotivosLabel(motivos[0]);
      return `${motivoLabel} - ${days} día${days > 1 ? 's' : ''} (${fecha})`;
    }
    
    return `Aventura ${days} día${days > 1 ? 's' : ''} - ${fecha}`;
  }

  private static getMotivosLabel(motivo: string): string {
    const labels: Record<string, string> = {
      "relax": "Relax Total",
      "cultura": "Tour Cultural",
      "aventura": "Aventura Activa",
      "gastronomia": "Ruta Gastronómica",
      "artesanias": "Artesanías Locales",
      "ritmos": "Ritmos y Baile",
      "festivales": "Festivales",
      "deportes-acuaticos": "Deportes Acuáticos",
      "avistamiento": "Avistamiento de Aves",
      "ecoturismo": "Ecoturismo",
      "malecon": "Ruta del Malecón",
      "playas-urbanas": "Playas Urbanas",
      "historia-portuaria": "Historia Portuaria",
      "arte-urbano": "Arte Urbano",
      "sabores-marinos": "Sabores Marinos",
      "vida-nocturna": "Vida Nocturna",
      "bienestar": "Bienestar & Spa",
      "mixto": "Experiencia Mixta"
    };
    
    return labels[motivo] || "Aventura";
  }
}
