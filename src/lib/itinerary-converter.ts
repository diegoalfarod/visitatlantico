// src/lib/itinerary-converter.ts

interface ItineraryStop {
    id: string;
    day: number;
    dayTitle: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    category: string;
    categories: string[];
    municipality: string;
    lat: number;
    lng: number;
    tip?: string;
    mustTry?: string[];
    estimatedCost: number;
    crowdLevel: string;
    imageUrl?: string;
    rating?: number;
    address?: string;
    distance: number;
    travelTime?: number;
    smartScore?: number;
    type: 'destination' | 'restaurant' | 'break' | 'coffee';
  }
  
  interface Activity {
    id: string;
    name: string;
    description: string;
    time: string;
    duration: string;
    location: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    category: string;
    tips?: string[];
    pricing?: string;
    googlePlaceId?: string;
    rating?: number;
    photos?: string[];
  }
  
  interface DayItinerary {
    day: number;
    date: string;
    title: string;
    description: string;
    activities: Activity[];
    meals?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
  }
  
  export function convertItineraryToFrontendFormat(
    stops: ItineraryStop[],
    profile: any
  ): { days: DayItinerary[] } {
    // Si no hay stops, retornar estructura vacía pero válida
    if (!stops || stops.length === 0) {
      const emptyDays: DayItinerary[] = [];
      for (let i = 1; i <= profile.days; i++) {
        emptyDays.push({
          day: i,
          date: getDateForDay(i),
          title: `Día ${i}`,
          description: 'No hay actividades programadas',
          activities: []
        });
      }
      return { days: emptyDays };
    }
  
    // Agrupar stops por día
    const stopsByDay = new Map<number, ItineraryStop[]>();
    
    for (const stop of stops) {
      if (!stopsByDay.has(stop.day)) {
        stopsByDay.set(stop.day, []);
      }
      stopsByDay.get(stop.day)!.push(stop);
    }
    
    // Convertir a formato del frontend
    const days: DayItinerary[] = [];
    
    for (let dayNum = 1; dayNum <= profile.days; dayNum++) {
      const dayStops = stopsByDay.get(dayNum) || [];
      
      // Ordenar por hora de inicio
      dayStops.sort((a, b) => {
        const timeA = parseInt(a.startTime.replace(':', ''));
        const timeB = parseInt(b.startTime.replace(':', ''));
        return timeA - timeB;
      });
      
      // Identificar comidas
      const meals: any = {};
      const activities: Activity[] = [];
      
      for (const stop of dayStops) {
        // Convertir stop a activity
        const activity: Activity = {
          id: stop.id || `stop_${dayNum}_${activities.length}`,
          name: stop.name,
          description: stop.description || '',
          time: stop.startTime,
          duration: `${stop.durationMinutes} min`,
          location: {
            address: stop.address || `${stop.municipality}, Atlántico`,
            coordinates: {
              lat: stop.lat,
              lng: stop.lng
            }
          },
          category: stop.category || 'general',
          tips: stop.tip ? [stop.tip] : undefined,
          pricing: stop.estimatedCost > 0 ? 
            formatPrice(stop.estimatedCost) : 
            'Entrada gratuita',
          rating: stop.rating,
          photos: stop.imageUrl ? [stop.imageUrl] : undefined
        };
        
        // Agregar tips adicionales si existen
        if (stop.mustTry && stop.mustTry.length > 0) {
          activity.tips = [
            ...(activity.tips || []),
            ...stop.mustTry
          ];
        }
        
        // Clasificar como comida o actividad regular
        if (stop.type === 'restaurant') {
          const hour = parseInt(stop.startTime.split(':')[0]);
          
          if (hour >= 6 && hour <= 10) {
            meals.breakfast = stop.name;
          } else if (hour >= 11 && hour <= 15) {
            meals.lunch = stop.name;
          } else if (hour >= 18) {
            meals.dinner = stop.name;
          }
        }
        
        activities.push(activity);
      }
      
      // Crear el día
      const dayItinerary: DayItinerary = {
        day: dayNum,
        date: getDateForDay(dayNum),
        title: dayStops[0]?.dayTitle || `Día ${dayNum} - Explorando el Atlántico`,
        description: generateDayDescription(dayStops, profile),
        activities,
        meals: Object.keys(meals).length > 0 ? meals : undefined
      };
      
      days.push(dayItinerary);
    }
    
    return { days };
  }
  
  function formatPrice(amount: number): string {
    if (amount === 0) return 'Gratis';
    if (amount < 10000) return `$${amount.toLocaleString('es-CO')}`;
    return `$${Math.round(amount / 1000)}k`;
  }
  
  function getDateForDay(dayNumber: number): string {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayNumber - 1);
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return targetDate.toLocaleDateString('es-CO', options);
  }
  
  function generateDayDescription(stops: ItineraryStop[], profile: any): string {
    if (stops.length === 0) {
      return 'Día libre para explorar a tu ritmo';
    }
    
    const categories = [...new Set(stops.map(s => s.category))];
    const municipalities = [...new Set(stops.map(s => s.municipality))];
    
    let description = `Visitarás ${stops.length} lugares`;
    
    if (municipalities.length === 1) {
      description += ` en ${municipalities[0]}`;
    } else if (municipalities.length > 1) {
      description += ` entre ${municipalities.join(' y ')}`;
    }
    
    // Agregar enfoque del día
    if (categories.includes('playa')) {
      description += ', incluyendo tiempo en la playa';
    } else if (categories.includes('museo')) {
      description += ', con enfoque cultural';
    } else if (categories.includes('restaurant')) {
      description += ', degustando la gastronomía local';
    }
    
    return description + '.';
  }
  
  export function validateItineraryData(data: any): boolean {
    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      console.error('Datos de itinerario inválidos: no es un objeto');
      return false;
    }
    
    // Verificar si es el formato antiguo (con stops directos)
    if (Array.isArray(data.itinerary) && !data.days) {
      console.log('Formato antiguo detectado, necesita conversión');
      return true; // Necesita conversión pero es válido
    }
    
    // Verificar formato nuevo
    if (!Array.isArray(data.days)) {
      console.error('Datos de itinerario inválidos: falta array de días');
      return false;
    }
    
    // Validar cada día
    for (const day of data.days) {
      if (!day.activities || !Array.isArray(day.activities)) {
        console.error(`Día ${day.day} no tiene actividades válidas`);
        return false;
      }
    }
    
    return true;
  }