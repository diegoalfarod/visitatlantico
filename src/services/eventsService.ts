// =============================================================================
// Events Service - Firebase Firestore
// =============================================================================

import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy,
    limit,
    Timestamp,
    DocumentData
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  import type { Event } from "@/types/event";
  
  const COLLECTION_NAME = "events";
  
  // =============================================================================
  // HELPERS
  // =============================================================================
  
  function docToEvent(doc: DocumentData): Event {
    const data = doc.data();
    return {
      id: doc.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || "",
      description: data.description || "",
      dates: data.dates || "",
      // Convertir Timestamps a strings
      dateStart: data.dateStart?.toDate?.().toISOString().split('T')[0] || data.dateStart || "",
      dateEnd: data.dateEnd?.toDate?.().toISOString().split('T')[0] || data.dateEnd || "",
      time: data.time || "",
      location: data.location || "",
      municipality: data.municipality || "",
      address: data.address || "",
      image: data.image || "",
      gallery: data.gallery || [],
      isFree: data.isFree || false,
      price: data.price || "",
      featured: data.featured || false,
      category: data.category || "",
      tags: data.tags || [],
      // ⬇️ FIX: Convertir GeoPoint a objeto plano
      coordinates: data.coordinates ? {
        lat: data.coordinates.latitude,
        lng: data.coordinates.longitude
      } : null,
      organizer: data.organizer || "",
      contact: data.contact ? {
        phone: data.contact.phone || "",
        email: data.contact.email || "",
        website: data.contact.website || ""
      } : data.contact,
      // Convertir Timestamps a ISO strings
      createdAt: data.createdAt?.toDate?.().toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
    };
  }
  
  // =============================================================================
  // QUERIES
  // =============================================================================
  
  /**
   * Get all events ordered by date
   */
  export async function getAllEvents(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, orderBy("dateStart", "asc"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docToEvent);
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }
  
  /**
   * Get a single event by slug
   */
  export async function getEventBySlug(slug: string): Promise<Event | null> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return docToEvent(snapshot.docs[0]);
    } catch (error) {
      console.error("Error fetching event by slug:", error);
      return null;
    }
  }
  
  /**
   * Get a single event by ID
   */
  export async function getEventById(id: string): Promise<Event | null> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(eventRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return docToEvent(snapshot);
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      return null;
    }
  }
  
  /**
   * Get upcoming events (from today onwards)
   */
  export async function getUpcomingEvents(limitCount?: number): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const eventsRef = collection(db, COLLECTION_NAME);
      
      let q = query(
        eventsRef, 
        where("dateStart", ">=", today),
        orderBy("dateStart", "asc")
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEvent);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  }
  
  /**
   * Get featured events
   */
  export async function getFeaturedEvents(limitCount: number = 4): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef, 
        where("featured", "==", true),
        orderBy("dateStart", "asc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEvent);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      return [];
    }
  }
  
  /**
   * Get events by month (format: "2025-03")
   */
  export async function getEventsByMonth(month: string): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, orderBy("dateStart", "asc"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(docToEvent)
        .filter(event => event.dateStart.startsWith(month));
    } catch (error) {
      console.error("Error fetching events by month:", error);
      return [];
    }
  }
  
  /**
   * Get events by category
   */
  export async function getEventsByCategory(category: string): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef, 
        where("category", "==", category),
        orderBy("dateStart", "asc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToEvent);
    } catch (error) {
      console.error("Error fetching events by category:", error);
      return [];
    }
  }
  
  /**
   * Get related events (same category or municipality, excluding current)
   */
  export async function getRelatedEvents(event: Event, limitCount: number = 3): Promise<Event[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, orderBy("dateStart", "asc"), limit(20));
      const snapshot = await getDocs(q);
      
      const allEvents = snapshot.docs.map(docToEvent);
      
      // Filter related events
      const related = allEvents.filter(e => 
        e.id !== event.id && 
        (e.category === event.category || e.municipality === event.municipality)
      );
      
      return related.slice(0, limitCount);
    } catch (error) {
      console.error("Error fetching related events:", error);
      return [];
    }
  }