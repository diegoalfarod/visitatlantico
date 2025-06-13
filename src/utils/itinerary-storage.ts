// src/utils/itinerary-storage.ts
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';
import { useState, useEffect } from 'react';
import type { Stop } from '@/components/ItineraryStopCard';

interface SavedItinerary {
  id: string;
  shortId: string;
  days: number;
  answers: {
    days?: number;
    motivos?: string[];
    otros?: boolean;
    email?: string;
  };
  itinerary: Stop[];
  locationData?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  lastViewedAt?: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'visitatlantico_saved_itineraries';
const OFFLINE_QUEUE_KEY = 'visitatlantico_sync_queue';

export class ItineraryStorageService {
  static generateShortId(): string {
    return nanoid(10);
  }

  static async saveItinerary(
    days: number,
    answers: any,
    itinerary: Stop[],
    locationData?: any
  ): Promise<{ id: string; shortId: string; shareUrl: string }> {
    const shortId = this.generateShortId();
    const id = `itinerary_${Date.now()}_${shortId}`;
    
    const savedItinerary: SavedItinerary = {
      id,
      shortId,
      days,
      answers,
      itinerary,
      locationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    };

    this.saveToLocalStorage(savedItinerary);

    try {
      await this.saveToFirebase(savedItinerary);
    } catch (error) {
      console.error('Error guardando en Firebase:', error);
      this.addToSyncQueue(savedItinerary);
    }

    const shareUrl = `${window.location.origin}/itinerary/${shortId}`;
    
    return { id, shortId, shareUrl };
  }

  private static saveToLocalStorage(itinerary: SavedItinerary): void {
    try {
      const saved = this.getLocalItineraries();
      saved[itinerary.shortId] = itinerary;
      
      const entries = Object.entries(saved);
      if (entries.length > 50) {
        entries
          .sort(([, a], [, b]) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(50)
          .forEach(([key]) => delete saved[key]);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  private static getLocalItineraries(): Record<string, SavedItinerary> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private static async saveToFirebase(itinerary: SavedItinerary): Promise<void> {
    const docRef = doc(db, 'saved_itineraries', itinerary.shortId);
    await setDoc(docRef, {
      ...itinerary,
      serverTimestamp: new Date(),
      userAgent: navigator.userAgent,
      expiresAt: itinerary.answers.email 
        ? null 
        : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  static async loadItinerary(shortId: string): Promise<SavedItinerary | null> {
    const localItineraries = this.getLocalItineraries();
    const localItinerary = localItineraries[shortId];
    
    if (localItinerary) {
      localItinerary.viewCount++;
      localItinerary.lastViewedAt = new Date().toISOString();
      this.saveToLocalStorage(localItinerary);
    }

    try {
      const docRef = doc(db, 'saved_itineraries', shortId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const firebaseData = docSnap.data() as SavedItinerary;
        
        await updateDoc(docRef, {
          viewCount: (firebaseData.viewCount || 0) + 1,
          lastViewedAt: new Date().toISOString()
        });
        
        this.saveToLocalStorage(firebaseData);
        
        return firebaseData;
      }
    } catch (error) {
      console.error('Error cargando de Firebase:', error);
      if (localItinerary) {
        return localItinerary;
      }
    }
    
    return localItinerary || null;
  }

  static async getUserItineraries(email?: string): Promise<SavedItinerary[]> {
    const localItineraries = Object.values(this.getLocalItineraries());
    
    if (email) {
      return localItineraries
        .filter(it => it.answers.email === email)
        .sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
    
    return localItineraries.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  private static addToSyncQueue(itinerary: SavedItinerary): void {
    try {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const items = queue ? JSON.parse(queue) : [];
      items.push({
        type: 'save_itinerary',
        data: itinerary,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error agregando a cola de sincronización:', error);
    }
  }

  static async syncOfflineQueue(): Promise<void> {
    try {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queue) return;
      
      const items = JSON.parse(queue);
      const failedItems = [];
      
      for (const item of items) {
        try {
          if (item.type === 'save_itinerary') {
            await this.saveToFirebase(item.data);
          }
        } catch (error) {
          console.error('Error sincronizando item:', error);
          failedItems.push(item);
        }
      }
      
      if (failedItems.length > 0) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedItems));
      } else {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      }
    } catch (error) {
      console.error('Error sincronizando cola offline:', error);
    }
  }

  static async deleteItinerary(shortId: string): Promise<void> {
    const saved = this.getLocalItineraries();
    delete saved[shortId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    try {
      const docRef = doc(db, 'saved_itineraries', shortId);
      await updateDoc(docRef, {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error eliminando de Firebase:', error);
    }
  }

  static hasUnsyncedItineraries(): boolean {
    const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue).length > 0 : false;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      ItineraryStorageService.syncOfflineQueue();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useItineraryStorage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const saveItinerary = async (
    days: number,
    answers: any,
    itinerary: Stop[],
    locationData?: any
  ) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await ItineraryStorageService.saveItinerary(
        days,
        answers,
        itinerary,
        locationData
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando itinerario');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const loadItinerary = async (shortId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const itinerary = await ItineraryStorageService.loadItinerary(shortId);
      return itinerary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando itinerario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveItinerary,
    loadItinerary,
    saving,
    loading,
    error,
    isOnline
  };
}