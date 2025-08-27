//src/components/planner/PlannerPage.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  X, ChevronLeft, ChevronRight, MapPin, Calendar, Users, 
  Heart, DollarSign, Mail, Sparkles, Waves, Camera,
  Coffee, Trees, ShoppingBag, Music, Utensils, Building,
  Navigation, Plane, Home, Umbrella, Shield, Info,
  Clock, Star, Map, Activity
} from "lucide-react";
import { RiGovernmentLine, RiMapPin2Line, RiTimeLine } from "react-icons/ri";

/* ──────────────────────────────────────────────────────────────────────────
   Tipos de datos mejorados con ubicación
   ────────────────────────────────────────────────────────────────────────── */
export type UserLocation = {
  lat: number;
  lng: number;
  name?: string;
};

export type TravelerProfile = {
  days: number;
  startLocation?: UserLocation | string;
  locationRange: "barranquilla" | "todo_atlantico";
  interests: string[];
  tripType: "solo" | "pareja" | "familia" | "amigos" | "negocios";
  budget: "economico" | "moderado" | "premium";
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

/* ──────────────────────────────────────────────────────────────────────────
   Constantes consistentes con el sitio
   ────────────────────────────────────────────────────────────────────────── */
const PREDEFINED_LOCATIONS = [
  { 
    id: "barranquilla_centro", 
    label: "Centro de Barranquilla", 
    icon: MapPin,
    description: "Zona hotelera y comercial",
    coords: { lat: 10.9878, lng: -74.7889 }
  },
  { 
    id: "aeropuerto", 
    label: "Aeropuerto E. Cortissoz", 
    icon: Plane,
    description: "Llegando al Atlántico",
    coords: { lat: 10.8896, lng: -74.7808 }
  },
  {
    id: "puerto_colombia",
    label: "Puerto Colombia",
    icon: Umbrella,
    description: "Zona de playas",
    coords: { lat: 10.9878, lng: -74.9547 }
  },
  {
    id: "boca_de_ceniza",
    label: "Bocas de Ceniza",
    icon: Waves,
    description: "Donde el río encuentra el mar",
    coords: { lat: 11.0600, lng: -74.8500 }
  }
];

const INTERESTS = [
  { id: "relax", label: "Relax & Playa", icon: Waves },
  { id: "cultura", label: "Cultura e Historia", icon: Building },
  { id: "aventura", label: "Aventura", icon: MapPin },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "artesanias", label: "Artesanías", icon: Heart },
  { id: "ritmos", label: "Música y Baile", icon: Music },
  { id: "festivales", label: "Festivales", icon: Star },
  { id: "deportes-acuaticos", label: "Deportes Acuáticos", icon: Activity },
  { id: "ecoturismo", label: "Ecoturismo", icon: Trees },
  { id: "malecon", label: "Ruta Malecón", icon: Map },
];

const TRIP_TYPES = [
  { id: "solo", label: "Viajo Solo", icon: Users, description: "Aventura personal" },
  { id: "pareja", label: "En Pareja", icon: Heart, description: "Romance y experiencias" },
  { id: "familia", label: "Con Familia", icon: Users, description: "Actividades para todos" },
  { id: "amigos", label: "Con Amigos", icon: Users, description: "Diversión grupal" },
  { id: "negocios", label: "Negocios", icon: Building, description: "Viaje profesional" },
];

const BUDGET_OPTIONS = [
  { id: "economico", label: "Económico", icon: DollarSign, description: "Experiencias accesibles" },
  { id: "moderado", label: "Moderado", icon: DollarSign, description: "Confort y calidad" },
  { id: "premium", label: "Premium", icon: Star, description: "Lo mejor del Atlántico" },
];

const DEFAULT_PROFILE: TravelerProfile = {
  days: 3,
  startLocation: undefined,
  locationRange: "barranquilla",
  interests: [],
  tripType: "familia",
  budget: "moderado",
  email: "",
};

/* ──────────────────────────────────────────────────────────────────────────
   Utilidades de geolocalización
   ────────────────────────────────────────────────────────────────────────── */
function isInAtlantico(coords: { lat: number; lng: number }): boolean {
  const atlanticoBounds = {
    north: 11.1500,
    south: 10.3000,
    east: -74.6000,
    west: -75.2000
  };
  
  return (
    coords.lat >= atlanticoBounds.south &&
    coords.lat <= atlanticoBounds.north &&
    coords.lng >= atlanticoBounds.west &&
    coords.lng <= atlanticoBounds.east
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Validación
   ────────────────────────────────────────────────────────────────────────── */
function validateStep(stepIndex: number, profile: TravelerProfile): string | null {
  switch (stepIndex) {
    case 0:
      return profile.days < 1 || profile.days > 30 ? "Selecciona entre 1 y 30 días" : null;
    case 1:
      return null; // Ubicación es opcional
    case 2:
      return null; // La ubicación siempre tiene un valor por defecto
    case 3:
      return profile.interests.length === 0 ? "Selecciona al menos un interés" : null;
    case 4:
      return null; // Trip type siempre tiene valor
    case 5:
      return null; // Budget siempre tiene valor
    case 6:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(profile.email) ? "Ingresa un email válido" : null;
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Componente principal - Estilo consistente con el sitio
   ────────────────────────────────────────────────────────────────────────── */
export default function PlannerPage({ open, onOpenChange }: Props) {
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  /* ── Función para solicitar ubicación ── */
  const requestLocationPermission = useCallback(async () => {
    setLocationStatus('requesting');
    setLocationMessage(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no disponible');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      if (isInAtlantico(coords)) {
        setProfile(p => ({ 
          ...p, 
          startLocation: {
            ...coords,
            name: "Mi ubicación actual"
          }
        }));
        setLocationStatus('granted');
        setLocationMessage("¡Perfecto! Ya estás en el Atlántico");
        
        setTimeout(() => {
          setStep(s => s + 1);
          setLocationMessage(null);
        }, 2000);
      } else {
        setLocationStatus('granted');
        setLocationMessage("Parece que aún no estás en el Atlántico. ¡Te esperamos pronto!");
        setProfile(p => ({ 
          ...p, 
          startLocation: "barranquilla_centro"
        }));
      }
    } catch (error) {
      setLocationStatus('error');
      setLocationMessage("No hay problema, puedes elegir un punto de inicio abajo");
    }
  }, []);

  /* ── Animación de entrada/salida ── */
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* ── Navegación ── */
  const totalSteps = 7;
  const canGoBack = step > 0;
  const isLastStep = step === totalSteps - 1;

  const goNext = useCallback(() => {
    // Para el paso 1 (ubicación), permitir continuar si ya hay una selección
    if (step === 1 && (profile.startLocation || locationStatus === 'granted')) {
      setError(null);
      setStep(step + 1);
      return;
    }
    
    const err = validateStep(step, profile);
    if (err) {
      setError(err);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setError(null);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  }, [step, profile, locationStatus]);

  const goBack = useCallback(() => {
    setError(null);
    setLocationMessage(null);
    if (step > 0) setStep(step - 1);
  }, [step]);

  const close = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onOpenChange(false);
      setStep(0);
      setError(null);
      setLocationStatus('idle');
      setLocationMessage(null);
    }, 300);
  }, [onOpenChange]);

  const handleSubmit = async () => {
    const err = validateStep(step, profile);
    if (err) {
      setError(err);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Importación dinámica de Firebase
      const { initializeApp, getApps } = await import("firebase/app");
      const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      
      const firebaseConfig = {
        apiKey: "AIzaSyB_KbSPZjdXgR_u8r-c6NZ8oxR85loKvUU",
        authDomain: "visitatlantico-f5c09.firebaseapp.com",
        projectId: "visitatlantico-f5c09",
        storageBucket: "visitatlantico-f5c09.firebasestorage.app",
        messagingSenderId: "1097999694057",
        appId: "1:1097999694057:web:2e01d75dabe931d24dd878",
        measurementId: "G-P11NC2E1RQ"
      };
      
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);
      
      // 1. Guardar solicitud inicial en Firebase
      const itineraryRequestData = {
        days: profile.days,
        email: profile.email,
        startLocation: profile.startLocation 
          ? typeof profile.startLocation === 'object'
            ? {
                lat: profile.startLocation.lat,
                lng: profile.startLocation.lng,
                name: profile.startLocation.name || 'Ubicación actual'
              }
            : profile.startLocation
          : null,
        locationRange: profile.locationRange,
        interests: profile.interests || [],
        tripType: profile.tripType,
        budget: profile.budget,
        createdAt: serverTimestamp(),
        status: 'pending',
        source: 'web_planner',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        screenSize: typeof window !== 'undefined' 
          ? `${window.screen.width}x${window.screen.height}` 
          : null,
        completionTime: Date.now(),
        stepsCompleted: totalSteps,
        language: 'es'
      };
      
      console.log("Guardando solicitud inicial...");
      const docRef = await addDoc(collection(db, "itinerarios_creados"), itineraryRequestData);
      const requestId = docRef.id;
      console.log("Solicitud guardada con ID:", requestId);
      
      // 2. Llamar al endpoint para generar el itinerario
      console.log("Generando itinerario con IA...");
      const generateResponse = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            ...profile,
            itineraryRequestId: requestId
          },
          preferences: {
            pace: 'normal',
            timePreference: 'normal'
          }
        })
      });
      
      if (!generateResponse.ok) {
        throw new Error('Error al generar el itinerario');
      }
      
      const { itinerary, itineraryId } = await generateResponse.json();
      console.log("Itinerario generado exitosamente:", itineraryId);
      
      // 3. Actualizar el estado del documento
      await addDoc(collection(db, "itinerarios_creados", requestId, "updates"), {
        status: 'completed',
        generatedItineraryId: itineraryId,
        updatedAt: serverTimestamp()
      });
      
      // 4. Guardar en localStorage para acceso rápido
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastItinerary', JSON.stringify({
          id: itineraryId,
          requestId,
          itinerary,
          profile,
          createdAt: Date.now()
        }));
      }
      
      // 5. Cerrar modal y navegar al itinerario
      setIsSubmitting(false);
      close();
      
      // NAVEGACIÓN CORREGIDA: Redirigir directamente al itinerario
      if (typeof window !== 'undefined') {
        // Opción 1: Navegación directa (recomendada)
        window.location.href = `/itinerary/${itineraryId}`;
        
        // Opción 2: Abrir en nueva pestaña (alternativa)
        // window.open(`/itinerary/${itineraryId}`, '_blank');
      }
      
    } catch (error: any) {
      console.error("Error completo:", error);
      setIsSubmitting(false);
      
      let errorMessage = "Error al generar el itinerario.";
      
      if (error.message?.includes('Firebase')) {
        errorMessage = "Error de conexión con la base de datos.";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Error de conexión con el servidor.";
      } else if (error.code === 'permission-denied') {
        errorMessage = "No tienes permisos para esta acción.";
      }
      
      setError(errorMessage);
      alert(`${errorMessage}\n\nPor favor intenta nuevamente o contacta soporte.`);
    }
  };

  /* ── Progress Bar ── */
  const progressPercentage = ((step + 1) / totalSteps) * 100;

  /* ── Step Components ── */
  const steps = [
    // Step 0: Días
    {
      title: "¿Cuántos días vienes al Atlántico?",
      subtitle: "Diseñaremos el itinerario perfecto para tu tiempo",
      content: (
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <span className="text-5xl font-bold text-gray-900">
                {profile.days}
              </span>
              <span className="text-2xl ml-2 text-gray-600">
                {profile.days === 1 ? 'día' : 'días'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={profile.days}
              onChange={(e) => setProfile(p => ({ ...p, days: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 día</span>
              <span>30 días</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[1, 3, 5, 7].map(d => (
              <button
                key={d}
                onClick={() => setProfile(p => ({ ...p, days: d }))}
                className={`py-3 rounded-full font-semibold transition-all duration-300 ${
                  profile.days === d
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {d} {d === 1 ? 'día' : 'días'}
              </button>
            ))}
          </div>
        </div>
      )
    },
    
    // Step 1: Ubicación actual (OPCIONAL)
    {
      title: "¿Desde dónde comenzamos?",
      subtitle: "Optimizaremos tu ruta según tu punto de partida",
      content: (
        <div className="space-y-3">
          {/* Botón de ubicación actual */}
          <button
            onClick={requestLocationPermission}
            disabled={locationStatus === 'requesting'}
            className={`w-full p-3 border rounded-xl transition-all duration-300 ${
              locationStatus === 'requesting' 
                ? 'border-gray-300 bg-gray-50'
                : profile.startLocation && typeof profile.startLocation === 'object'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                locationStatus === 'requesting' 
                  ? 'bg-gray-200' 
                  : profile.startLocation && typeof profile.startLocation === 'object'
                  ? 'bg-red-600'
                  : 'bg-gray-800'
              }`}>
                {locationStatus === 'requesting' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Navigation size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-gray-900">
                  {locationStatus === 'requesting' 
                    ? 'Obteniendo ubicación...'
                    : profile.startLocation && typeof profile.startLocation === 'object'
                    ? '📍 Usando tu ubicación actual'
                    : 'Usar mi ubicación actual'}
                </p>
                <p className="text-xs text-gray-600">
                  Recomendado si ya estás aquí
                </p>
              </div>
            </div>
          </button>

          {/* Mensaje de estado */}
          {locationMessage && (
            <div className={`p-2 rounded-lg text-xs border ${
              locationStatus === 'granted' 
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {locationMessage}
            </div>
          )}

          {/* Separador */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">o elige un punto</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Puntos predefinidos - 2x2 grid más compacto */}
          <div className="grid grid-cols-2 gap-2">
            {PREDEFINED_LOCATIONS.map((location) => {
              const Icon = location.icon;
              const isSelected = profile.startLocation === location.id;
              return (
                <button
                  key={location.id}
                  onClick={() => setProfile(p => ({ ...p, startLocation: location.id }))}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-red-600' : 'bg-gray-700'
                    }`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-xs text-gray-900 truncate">{location.label}</p>
                      <p className="text-[10px] text-gray-600 truncate">{location.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Botón de omitir */}
          <button
            onClick={() => {
              setProfile(p => ({ ...p, startLocation: undefined }));
              goNext();
            }}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Omitir este paso →
          </button>

          {/* Nota de privacidad más compacta */}
          <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded border border-gray-200">
            <Shield size={12} className="text-gray-400 mt-0.5" />
            <p className="text-[10px] text-gray-600">
              Tu ubicación solo se usa para rutas. No la guardamos.
            </p>
          </div>
        </div>
      )
    },
    
    // Step 2: Alcance del viaje
    {
      title: "¿Qué tanto quieres explorar?",
      subtitle: "Podemos enfocarnos en Barranquilla o todo el departamento",
      content: (
        <div className="grid gap-4">
          <button
            onClick={() => setProfile(p => ({ ...p, locationRange: "barranquilla" }))}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              profile.locationRange === "barranquilla"
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                profile.locationRange === "barranquilla" ? 'bg-red-600' : 'bg-gray-800'
              }`}>
                <MapPin size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900">Solo Barranquilla</h3>
                <p className="text-sm text-gray-600 mt-1">
                  La Puerta de Oro: cultura, gastronomía y el río Magdalena
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setProfile(p => ({ ...p, locationRange: "todo_atlantico" }))}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              profile.locationRange === "todo_atlantico"
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                profile.locationRange === "todo_atlantico" ? 'bg-red-600' : 'bg-gray-800'
              }`}>
                <Map size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900">Todo el Atlántico</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Playas de Puerto Colombia, pueblos históricos y aventuras
                </p>
              </div>
            </div>
          </button>
        </div>
      )
    },
    
    // Step 3: Intereses
    {
      title: "¿Qué te gustaría experimentar?",
      subtitle: "Selecciona todos tus intereses",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {INTERESTS.map((interest) => {
            const Icon = interest.icon;
            const isSelected = profile.interests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => {
                  setProfile(p => ({
                    ...p,
                    interests: isSelected
                      ? p.interests.filter(i => i !== interest.id)
                      : [...p.interests, interest.id]
                  }));
                }}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-red-600' : 'bg-gray-800'}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {interest.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )
    },
    
    // Step 4: Tipo de viaje
    {
      title: "¿Con quién viajas?",
      subtitle: "Personalizaremos las actividades según tu compañía",
      content: (
        <div className="space-y-2.5">
          {TRIP_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = profile.tripType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setProfile(p => ({ ...p, tripType: type.id as any }))}
                className={`w-full p-3 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-red-600' : 'bg-gray-800'
                  }`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm text-gray-900">{type.label}</h3>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                  {isSelected && (
                    <ChevronRight size={18} className="text-red-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )
    },
    
    // Step 5: Presupuesto
    {
      title: "¿Cuál es tu presupuesto?",
      subtitle: "Te recomendaremos lugares acordes a tu rango",
      content: (
        <div className="space-y-3">
          {BUDGET_OPTIONS.map((budget) => {
            const Icon = budget.icon;
            const isSelected = profile.budget === budget.id;
            return (
              <button
                key={budget.id}
                onClick={() => setProfile(p => ({ ...p, budget: budget.id as any }))}
                className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-red-600' : 'bg-gray-800'
                  }`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{budget.label}</h3>
                    <p className="text-xs text-gray-600">{budget.description}</p>
                  </div>
                  {isSelected && (
                    <ChevronRight size={18} className="text-red-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )
    },
    
    // Step 6: Email
    {
      title: "¿Dónde enviamos tu itinerario?",
      subtitle: "Te llegará personalizado y listo para usar",
      content: (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="tu@email.com"
              value={profile.email}
              onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none transition-colors text-lg"
              autoFocus
            />
          </div>

          {/* Preview del itinerario */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Tu itinerario incluirá:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {profile.startLocation && (
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✓</span>
                  <span>
                    Rutas optimizadas desde {
                      typeof profile.startLocation === 'object' 
                        ? 'tu ubicación actual'
                        : PREDEFINED_LOCATIONS.find(l => l.id === profile.startLocation)?.label
                    }
                  </span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span>
                Agenda día por día con horarios optimizados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span>
                Recomendaciones gastronómicas según presupuesto
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span>
                Tips locales y cómo llegar a cada lugar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span>
                Mapa interactivo con todos los puntos
              </li>
            </ul>
          </div>

          {/* Resumen de preferencias */}
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Tu viaje:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700">
                {profile.days} {profile.days === 1 ? 'día' : 'días'}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700">
                {TRIP_TYPES.find(t => t.id === profile.tripType)?.label}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700">
                Presupuesto {profile.budget}
              </span>
            </div>
          </div>
        </div>
      )
    },
  ];

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
      />

      {/* Modal */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-4 top-1/2 -translate-y-1/2 z-[80] max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-gray-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header - Estilo consistente con el sitio */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white border-b border-gray-700">
          <button
            onClick={close}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/40 transition"
          >
            <X size={18} />
          </button>
          
          {/* Badge oficial */}
          <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-800/30 text-red-400 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
            <RiGovernmentLine className="text-sm" />
            <span>Sistema Oficial de Planificación</span>
          </div>
          
          <div className="pr-8">
            <h2 className="text-2xl font-bold mb-1" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
              Planifica tu <span className="text-yellow-400">Viaje</span>
            </h2>
            <p className="text-gray-300 text-sm">Tu aventura personalizada en el Atlántico</p>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Paso {step + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(90vh - 280px)', minHeight: '300px' }}>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {steps[step].title}
              </h3>
              <p className="text-gray-600 text-sm">
                {steps[step].subtitle}
              </p>
            </div>
            
            {steps[step].content}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-200 flex gap-3">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${
              canGoBack
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ChevronLeft size={18} />
              Atrás
            </div>
          </button>
          
          {!isLastStep ? (
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-full font-semibold bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2">
                Siguiente
                <ChevronRight size={18} />
              </div>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full font-semibold bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <RiMapPin2Line size={18} />
                  Crear mi itinerario
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Custom styles consistentes con el sitio */}
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
        }
      `}</style>
    </>
  );
}