"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { 
  X, ChevronLeft, ChevronRight, MapPin, Plane, Umbrella, Shield, Info,
  Sparkles, Waves, Navigation, DollarSign, Mail
} from "lucide-react";
import { RiGovernmentLine } from "react-icons/ri";
import { ATLANTICO_INTERESTS, TRIP_TYPES, BUDGET_OPTIONS, TRAVEL_PACE, TRAVEL_DISTANCE, PREDEFINED_LOCATIONS } from "@/config/planner-options";
import { generateItinerary } from "@/services/itinerary-generator";
import { saveItineraryRequest } from "@/services/firebase-service";
import type { TravelerProfile } from "@/types/planner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const DEFAULT_PROFILE: TravelerProfile = {
  days: 3,
  startLocation: undefined,
  interests: [],
  tripType: "familia",
  budget: "moderado",
  travelPace: "moderado",
  maxDistance: "cerca",
  email: "",
};

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

function validateStep(stepIndex: number, profile: TravelerProfile): string | null {
  switch (stepIndex) {
    case 0:
      return profile.days < 1 || profile.days > 14 ? "Selecciona entre 1 y 14 días" : null;
    case 1:
      return null; // Ubicación opcional
    case 2:
      if (profile.interests.length === 0) return "Selecciona al menos un interés";
      if (profile.interests.length > 3) return `Máximo 3 intereses (tienes ${profile.interests.length})`;
      return null;
    case 3:
      return null; // Tipo de viaje siempre tiene valor
    case 4:
      return null; // Estilo siempre tiene valores
    case 5:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(profile.email) ? "Ingresa un email válido" : null;
    default:
      return null;
  }
}

export default function PlannerPage({ open, onOpenChange }: Props) {
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Restaurar progreso guardado
  useEffect(() => {
    if (typeof window !== 'undefined' && open) {
      const saved = sessionStorage.getItem('plannerProgress');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          // Solo restaurar si tiene menos de 30 minutos
          if (Date.now() - data.timestamp < 30 * 60 * 1000) {
            setProfile(data.profile);
            setStep(data.step);
          }
        } catch (e) {
          console.error('Error restaurando progreso:', e);
        }
      }
    }
  }, [open]);

  // Guardar progreso
  useEffect(() => {
    if (typeof window !== 'undefined' && open) {
      sessionStorage.setItem('plannerProgress', JSON.stringify({
        profile,
        step,
        timestamp: Date.now()
      }));
    }
  }, [profile, step, open]);

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

  const totalSteps = 6;
  const canGoBack = step > 0;
  const isLastStep = step === totalSteps - 1;

  const goNext = useCallback(() => {
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
      setProfile(DEFAULT_PROFILE);
      sessionStorage.removeItem('plannerProgress');
    }, 300);
  }, [onOpenChange]);

  const handleSubmit = async () => {
    const err = validateStep(step, profile);
    if (err) {
      setError(err);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos timeout
    
    try {
      // 1. Guardar solicitud en Firebase
      const requestId = await saveItineraryRequest(profile);
      console.log("Solicitud guardada con ID:", requestId);
      
      // 2. Generar itinerario usando el servicio
      const result = await generateItinerary(profile, requestId, controller.signal);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al generar el itinerario');
      }
      
      // 3. Guardar en localStorage para acceso rápido
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastItinerary', JSON.stringify({
          id: result.itineraryId,
          requestId,
          itinerary: result.itinerary,
          profile,
          createdAt: Date.now()
        }));
      }
      
      // 4. Limpiar sessionStorage
      sessionStorage.removeItem('plannerProgress');
      
      // 5. Cerrar modal y navegar
      setIsSubmitting(false);
      close();
      
      if (typeof window !== 'undefined') {
        window.location.href = `/itinerary/${result.itineraryId}`;
      }
      
    } catch (error: any) {
      console.error("Error completo:", error);
      setIsSubmitting(false);
      
      let errorMessage = "Error al generar el itinerario.";
      
      if (error.name === 'AbortError') {
        errorMessage = "La generación tardó demasiado. Por favor intenta nuevamente.";
      } else if (error.message?.includes('Firebase')) {
        errorMessage = "Error de conexión con la base de datos.";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Error de conexión con el servidor.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const progressPercentage = ((step + 1) / totalSteps) * 100;

  // Steps definidos en el componente para mantener reactividad
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
              max="14"
              value={profile.days}
              onChange={(e) => setProfile(p => ({ ...p, days: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 día</span>
              <span>14 días</span>
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

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> {
                profile.days <= 2 ? "Perfecto para conocer lo esencial de Barranquilla" :
                profile.days <= 4 ? "Ideal para Barranquilla y playas cercanas" :
                profile.days <= 7 ? "Tiempo para explorar todo el departamento con calma" :
                "Podrás vivir el Atlántico como un local"
              }
            </p>
          </div>
        </div>
      )
    },
    
    // Step 1: Ubicación
    {
      title: "¿Desde dónde comenzamos?",
      subtitle: "Optimizaremos tu ruta según tu punto de partida",
      content: (
        <div className="space-y-3">
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

          {locationMessage && (
            <div className={`p-2 rounded-lg text-xs border ${
              locationStatus === 'granted' 
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {locationMessage}
            </div>
          )}

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">o elige un punto</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

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

          <button
            onClick={() => {
              setProfile(p => ({ 
                ...p, 
                startLocation: 'barranquilla_centro'
              }));
              goNext();
            }}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Omitir este paso →
          </button>

          <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded border border-gray-200">
            <Shield size={12} className="text-gray-400 mt-0.5" />
            <p className="text-[10px] text-gray-600">
              Tu ubicación solo se usa para rutas. No la guardamos.
            </p>
          </div>
        </div>
      )
    },
    
    // Step 2: Intereses
    {
      title: "¿Qué te llama del Atlántico?",
      subtitle: "Elige hasta 3 experiencias principales",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm text-gray-600">
              {profile.interests.length}/3 seleccionados
            </span>
            {profile.interests.length > 0 && (
              <button
                onClick={() => setProfile(p => ({ ...p, interests: [] }))}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar selección
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ATLANTICO_INTERESTS.map((interest) => {
              const Icon = interest.icon;
              const isSelected = profile.interests.includes(interest.id);
              const isDisabled = !isSelected && profile.interests.length >= 3;
              
              return (
                <button
                  key={interest.id}
                  onClick={() => {
                    if (isDisabled) return;
                    setProfile(p => ({
                      ...p,
                      interests: isSelected
                        ? p.interests.filter(i => i !== interest.id)
                        : [...p.interests, interest.id]
                    }));
                  }}
                  disabled={isDisabled}
                  className={`p-3 rounded-xl border transition-all duration-300 relative ${
                    isSelected
                      ? 'border-red-500 bg-red-50 ring-2 ring-red-500 ring-opacity-30'
                      : isDisabled
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2.5 rounded-lg ${
                      isSelected ? 'bg-red-600' : isDisabled ? 'bg-gray-400' : 'bg-gray-800'
                    }`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-semibold text-center leading-tight ${
                        isSelected ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {interest.label}
                      </p>
                      <p className="text-[10px] text-gray-500 text-center leading-tight">
                        {interest.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">
                            {profile.interests.indexOf(interest.id) + 1}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-700">
              💡 <strong>Tip:</strong> El orden importa. Tu primera selección tendrá prioridad en el itinerario.
            </p>
          </div>
        </div>
      )
    },
    
    // Step 3: Tipo de viaje
    {
      title: "¿Cómo viajas?",
      subtitle: "Personalizaremos las actividades según tu grupo",
      content: (
        <div className="space-y-3">
          {TRIP_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = profile.tripType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setProfile(p => ({ ...p, tripType: type.id as any }))}
                className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-500 ring-opacity-20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-red-600' : 'bg-gray-800'
                  }`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
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
    
    // Step 4: Estilo combinado
    {
      title: "Define tu estilo de viaje",
      subtitle: "Ajustaremos todo a tus preferencias",
      content: (
        <div className="space-y-6">
          {/* Presupuesto */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Presupuesto</h4>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((budget) => {
                const isSelected = profile.budget === budget.id;
                return (
                  <button
                    key={budget.id}
                    onClick={() => setProfile(p => ({ ...p, budget: budget.id as any }))}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`${isSelected ? 'text-red-600' : 'text-gray-600'}`}>
                        {Array.from({ length: budget.priceLevel }, (_, i) => (
                          <DollarSign key={i} size={20} className="inline" />
                        ))}
                      </div>
                      <span className="text-xs font-medium">{budget.label}</span>
                      <span className="text-[10px] text-gray-500 text-center">{budget.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ritmo */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Ritmo del viaje</h4>
            <div className="grid grid-cols-3 gap-2">
              {TRAVEL_PACE.map((pace) => {
                const Icon = pace.icon;
                const isSelected = profile.travelPace === pace.id;
                return (
                  <button
                    key={pace.id}
                    onClick={() => setProfile(p => ({ ...p, travelPace: pace.id as any }))}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon size={20} className={isSelected ? 'text-red-600' : 'text-gray-600'} />
                      <span className="text-xs font-medium">{pace.label}</span>
                      <span className="text-[10px] text-gray-500 text-center">{pace.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distancia */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">¿Qué tanto explorar?</h4>
            <div className="space-y-2">
              {TRAVEL_DISTANCE.map((distance) => {
                const Icon = distance.icon;
                const isSelected = profile.maxDistance === distance.id;
                return (
                  <button
                    key={distance.id}
                    onClick={() => setProfile(p => ({ ...p, maxDistance: distance.id as any }))}
                    className={`w-full p-3 rounded-lg border transition-all duration-300 ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isSelected ? 'text-red-600' : 'text-gray-600'} />
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-gray-900">{distance.label}</span>
                        <p className="text-xs text-gray-500">{distance.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )
    },
    
    // Step 5: Email
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

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 border border-red-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-red-600" />
              Tu itinerario personalizado incluirá:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✓</span>
                <span>
                  <strong>{profile.days} {profile.days === 1 ? 'día' : 'días'}</strong> con{' '}
                  {TRAVEL_PACE.find(p => p.id === profile.travelPace)?.activitiesPerDay || 3} 
                  {' '}actividades diarias
                </span>
              </li>
              {profile.interests.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✓</span>
                  <span>
                    Enfocado en: {profile.interests.map(id => 
                      ATLANTICO_INTERESTS.find(i => i.id === id)?.label
                    ).filter(Boolean).join(', ')}
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✓</span>
                <span>
                  Lugares {BUDGET_OPTIONS.find(b => b.id === profile.budget)?.label.toLowerCase()} 
                  {' '}en un radio de {TRAVEL_DISTANCE.find(d => d.id === profile.maxDistance)?.radiusKm}km
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✓</span>
                <span>Mapa interactivo con rutas optimizadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✓</span>
                <span>Tips locales y horarios de cada lugar</span>
              </li>
            </ul>
          </div>

          <div className="text-center text-xs text-gray-500">
            <Shield size={16} className="inline mr-1" />
            Generado con IA y datos oficiales del Atlántico
          </div>
        </div>
      )
    },
  ];

  if (!open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={close}
      />

      <div
        ref={sheetRef}
        className={`fixed inset-x-4 top-1/2 -translate-y-1/2 z-[80] max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-gray-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white border-b border-gray-700">
          <button
            onClick={close}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/40 transition"
          >
            <X size={18} />
          </button>
          
          <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-800/30 text-red-400 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
            <RiGovernmentLine className="text-sm" />
            <span>Sistema Oficial de Planificación</span>
          </div>
          
          <div className="pr-8">
            <h2 className="text-2xl font-bold mb-1">
              Planifica tu <span className="text-yellow-400">Viaje</span>
            </h2>
            <p className="text-gray-300 text-sm">Tu aventura personalizada en el Atlántico</p>
          </div>
          
          <div className="mt-4">
            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Paso {step + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>

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

        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

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
              className="flex-1 py-3 rounded-full font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg transition-all duration-300"
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
              className="flex-1 py-3 rounded-full font-semibold bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generando tu itinerario...</span>
                  </div>
                  <span className="text-[10px] opacity-80">(esto puede tomar 1-2 minutos)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  Crear mi itinerario
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #dc2626, #f97316);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #dc2626, #f97316);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          border: 2px solid white;
        }
      `}</style>
    </>
  );
}