// src/components/PlannerPage.tsx
// Planificador de viaje rediseñado - VisitAtlántico
// 4 pasos, branding consistente, preview antes de email

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  X,
  Mail,
  Map,
  Clock,
  DollarSign,
  Zap,
  Coffee,
  PartyPopper,
  Waves,
  Utensils,
  Music,
  Building2,
  Palette,
  TreePalm,
  ChevronDown,
  Star,
  Shield,
  Send
} from "lucide-react";

// =============================================================================
// CONSTANTES DE DISEÑO - BRANDING VISITATLÁNTICO
// =============================================================================

const COLORS = {
  primary: "#E40E20",
  rojoCayena: "#D31A2B",
  azulBarranquero: "#007BC4",
  naranjaSalinas: "#EA5B13",
  amarilloArepa: "#F39200",
  verdeBijao: "#008D39",
  beigeIraca: "#B8A88A",
  grisOscuro: "#4A4F55",
  grisMedio: "#7A858C",
  grisClaro: "#C1C5C8",
};

const EASE_CINEMATIC = [0.22, 1, 0.36, 1];

// =============================================================================
// DATOS DE CONFIGURACIÓN
// =============================================================================

const INTERESTS = [
  {
    id: "carnaval_cultura",
    label: "Carnaval y Folclor",
    tagline: "Vive la fiesta más grande de Colombia",
    icon: PartyPopper,
    color: COLORS.rojoCayena,
    image: "/images/interests/carnaval.jpg",
    preview: "Museo del Carnaval, Casa del Carnaval, talleres de máscaras"
  },
  {
    id: "playas_rio",
    label: "Playas y Río",
    tagline: "90 km de costa caribeña te esperan",
    icon: Waves,
    color: COLORS.azulBarranquero,
    image: "/images/interests/playas.jpg",
    preview: "Puerto Colombia, Pradomar, Malecón del Río, Bocas de Ceniza"
  },
  {
    id: "gastronomia_local",
    label: "Sabores Costeños",
    tagline: "Donde nació la arepa 'e huevo",
    icon: Utensils,
    color: COLORS.amarilloArepa,
    image: "/images/interests/gastronomia.jpg",
    preview: "Arroz de lisa, sancocho, butifarra, jugos naturales"
  },
  {
    id: "vida_nocturna",
    label: "Rumba y Música",
    tagline: "Salsa, champeta y vallenato",
    icon: Music,
    color: COLORS.naranjaSalinas,
    image: "/images/interests/rumba.jpg",
    preview: "La Troja, bares con música en vivo, rumba costeña"
  },
  {
    id: "historia_patrimonio",
    label: "Historia y Patrimonio",
    tagline: "La Puerta de Oro de Colombia",
    icon: Building2,
    color: COLORS.grisOscuro,
    image: "/images/interests/historia.jpg",
    preview: "Centro Histórico, Museo del Caribe, arquitectura republicana"
  },
  {
    id: "artesanias_tradiciones",
    label: "Artesanías",
    tagline: "Máscaras de Galapa, tejidos de Usiacurí",
    icon: Palette,
    color: COLORS.beigeIraca,
    image: "/images/interests/artesanias.jpg",
    preview: "Talleres de máscaras, tejidos de palma de iraca"
  },
  {
    id: "naturaleza_aventura",
    label: "Ecoturismo",
    tagline: "Donde el río Magdalena besa el mar",
    icon: TreePalm,
    color: COLORS.verdeBijao,
    image: "/images/interests/naturaleza.jpg",
    preview: "Ciénaga de Mallorquín, avistamiento de aves, Bocas de Ceniza"
  }
];

const TRIP_TYPES = [
  {
    id: "solo",
    label: "Viajero Solo",
    icon: "👤",
    description: "Explora a tu propio ritmo"
  },
  {
    id: "pareja",
    label: "En Pareja",
    icon: "💑",
    description: "Momentos románticos"
  },
  {
    id: "familia",
    label: "Familia",
    icon: "👨‍👩‍👧‍👦",
    description: "Diversión para todos"
  },
  {
    id: "amigos",
    label: "Con Amigos",
    icon: "👥",
    description: "Aventura grupal"
  }
];

const BUDGET_OPTIONS = [
  {
    id: "economico",
    label: "Económico",
    icon: DollarSign,
    description: "~$80k/día",
    details: "Comida local, transporte público"
  },
  {
    id: "moderado",
    label: "Moderado",
    icon: DollarSign,
    description: "~$180k/día",
    details: "Buenos restaurantes, taxis"
  },
  {
    id: "premium",
    label: "Premium",
    icon: Star,
    description: "$350k+/día",
    details: "Experiencias VIP, fine dining"
  }
];

const PACE_OPTIONS = [
  {
    id: "relajado",
    label: "Relajado",
    icon: Coffee,
    activitiesPerDay: "2-3 lugares",
    description: "Tiempo para improvisar"
  },
  {
    id: "moderado",
    label: "Moderado",
    icon: MapPin,
    activitiesPerDay: "3-4 lugares",
    description: "Buen balance"
  },
  {
    id: "intenso",
    label: "Intenso",
    icon: Zap,
    activitiesPerDay: "5+ lugares",
    description: "Máximo provecho"
  }
];

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const START_LOCATIONS = [
  { id: "barranquilla_centro", label: "Centro de Barranquilla", icon: Building2 },
  { id: "aeropuerto", label: "Aeropuerto", icon: MapPin },
  { id: "puerto_colombia", label: "Puerto Colombia", icon: Waves },
];

// =============================================================================
// TIPOS
// =============================================================================

interface PlannerState {
  // Paso 1: Días y ubicación
  days: number;
  startLocation: string;
  
  // Paso 2: Intereses
  interests: string[];
  
  // Paso 3: Estilo
  tripType: string;
  budget: string;
  pace: string;
  
  // Paso 4: Email
  email: string;
}

interface PlannerPageProps {
  // Soportar ambos patrones de props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Legacy props
  isOpen?: boolean;
  onClose?: () => void;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function PlannerPage({ 
  open, 
  onOpenChange,
  isOpen: legacyIsOpen,
  onClose: legacyOnClose 
}: PlannerPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plannerStartTime = useRef<number>(Date.now());
  
  // Normalizar props (soportar ambos patrones)
  const isOpen = open ?? legacyIsOpen ?? false;
  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false);
    } else if (legacyOnClose) {
      legacyOnClose();
    }
  }, [onOpenChange, legacyOnClose]);
  
  const [state, setState] = useState<PlannerState>({
    days: 3,
    startLocation: "barranquilla_centro",
    interests: [],
    tripType: "",
    budget: "moderado",
    pace: "moderado",
    email: ""
  });

  // Resetear cuando se abre
  useEffect(() => {
    if (isOpen) {
      plannerStartTime.current = Date.now();
    }
  }, [isOpen]);

  // Restaurar progreso guardado
  useEffect(() => {
    const saved = sessionStorage.getItem('plannerProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < 30 * 60 * 1000) { // 30 min
          setState(data.state);
          setCurrentStep(data.step);
        }
      } catch (e) {
        console.error('Error restaurando progreso:', e);
      }
    }
  }, []);

  // Guardar progreso
  useEffect(() => {
    if (currentStep > 1 || state.interests.length > 0) {
      sessionStorage.setItem('plannerProgress', JSON.stringify({
        state,
        step: currentStep,
        timestamp: Date.now()
      }));
    }
  }, [state, currentStep]);

  // Handlers
  const updateState = useCallback((updates: Partial<PlannerState>) => {
    setState(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const toggleInterest = useCallback((interestId: string) => {
    setState(prev => {
      const current = prev.interests;
      if (current.includes(interestId)) {
        return { ...prev, interests: current.filter(i => i !== interestId) };
      }
      if (current.length >= 3) {
        return prev; // Máximo 3
      }
      return { ...prev, interests: [...current, interestId] };
    });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const nextStep = useCallback(() => {
    // Validar paso actual
    if (currentStep === 1 && (!state.days || state.days < 1)) {
      setError('Selecciona cuántos días');
      return;
    }
    if (currentStep === 2 && state.interests.length === 0) {
      setError('Selecciona al menos un interés');
      return;
    }
    if (currentStep === 3 && !state.tripType) {
      setError('Selecciona cómo viajas');
      return;
    }

    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, 4));
    setError(null);
  }, [currentStep, state]);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  }, []);

  const generateItinerary = useCallback(async () => {
    // Validar email
    if (!state.email || !state.email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            days: state.days,
            email: state.email,
            interests: state.interests,
            tripType: state.tripType,
            budget: state.budget,
            travelPace: state.pace,
            startLocation: state.startLocation
          },
          // Analytics data
          analytics: {
            sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            device: {
              type: /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 
                    /ipad|tablet/i.test(navigator.userAgent) ? 'tablet' : 'desktop',
              os: navigator.platform,
              browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                       navigator.userAgent.includes('Safari') ? 'Safari' : 
                       navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other',
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight
            },
            traffic: {
              source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
              medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
              campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
              referrer: document.referrer || undefined
            },
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isNewUser: !localStorage.getItem('va_visit_count'),
            visitCount: parseInt(localStorage.getItem('va_visit_count') || '0') + 1,
            funnelTime: Date.now() - plannerStartTime.current
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error generando itinerario');
      }

      // Guardar en localStorage para acceso rápido
      localStorage.setItem('lastItinerary', JSON.stringify({
        id: data.itineraryId,
        itinerary: data.itinerary,
        profile: state,
        createdAt: Date.now()
      }));

      // Enviar email con el itinerario (no bloqueante)
      if (state.email) {
        fetch('/api/send-itinerary-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.email,
            itineraryId: data.itineraryId,
            profile: {
              days: state.days,
              tripType: state.tripType,
              budget: state.budget,
              interests: state.interests,
              pace: state.pace
            },
            itinerary: data.itinerary
          })
        }).then(res => {
          if (res.ok) {
            console.log('📧 Email enviado exitosamente');
          } else {
            console.warn('⚠️ Error enviando email');
          }
        }).catch(err => {
          console.warn('⚠️ Error enviando email:', err);
        });
      }

      // Limpiar progreso guardado
      sessionStorage.removeItem('plannerProgress');

      // Redirigir a la página del itinerario
      router.push(`/itinerary/${data.itineraryId}`);
      handleClose();

    } catch (err: any) {
      console.error('Error generando itinerario:', err);
      setError(err.message || 'Error al generar tu itinerario. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }, [state, router, handleClose]);

  // Calcular progreso
  const progress = (currentStep / 4) * 100;

  // Variantes de animación
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: EASE_CINEMATIC }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      transition: { duration: 0.3, ease: EASE_CINEMATIC }
    }),
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: EASE_CINEMATIC }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Map className="w-5 h-5" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-josefin">
                Planifica tu Aventura
              </h2>
              <p className="text-sm text-gray-500">
                Paso {currentStep} de 4
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.naranjaSalinas})` 
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 1 && (
              <Step1DaysLocation
                key="step1"
                state={state}
                updateState={updateState}
                variants={stepVariants}
                direction={direction}
              />
            )}
            {currentStep === 2 && (
              <Step2Interests
                key="step2"
                state={state}
                toggleInterest={toggleInterest}
                variants={stepVariants}
                direction={direction}
              />
            )}
            {currentStep === 3 && (
              <Step3Style
                key="step3"
                state={state}
                updateState={updateState}
                variants={stepVariants}
                direction={direction}
              />
            )}
            {currentStep === 4 && (
              <Step4Preview
                key="step4"
                state={state}
                updateState={updateState}
                variants={stepVariants}
                direction={direction}
              />
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          {/* Next / Generate button */}
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.naranjaSalinas})` 
              }}
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={generateItinerary}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.verdeBijao}, ${COLORS.azulBarranquero})` 
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Itinerario</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// PASO 1: DÍAS Y UBICACIÓN
// =============================================================================

function Step1DaysLocation({ 
  state, 
  updateState, 
  variants, 
  direction 
}: { 
  state: PlannerState; 
  updateState: (updates: Partial<PlannerState>) => void;
  variants: any;
  direction: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-8"
    >
      {/* Días */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          ¿Cuántos días de aventura caribeña?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Selecciona la duración de tu viaje
        </p>

        <div className="flex flex-wrap gap-3">
          {DAYS_OPTIONS.map((day) => (
            <button
              key={day}
              onClick={() => updateState({ days: day })}
              className={`
                w-14 h-14 rounded-2xl font-bold text-lg transition-all
                ${state.days === day 
                  ? 'text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={state.days === day ? { 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.naranjaSalinas})` 
              } : {}}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Tip dinámico */}
        <motion.div
          key={state.days}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-start gap-2"
        >
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {state.days === 1 && "Perfecto para conocer lo esencial de Barranquilla"}
            {state.days === 2 && "Tiempo ideal para Barranquilla + un día de playa"}
            {state.days === 3 && "El balance perfecto: cultura, playa y gastronomía"}
            {state.days >= 4 && state.days <= 5 && "Podrás explorar el Atlántico a fondo"}
            {state.days >= 6 && "Una inmersión completa en la cultura caribeña"}
          </span>
        </motion.div>
      </div>

      {/* Ubicación inicial */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          ¿Desde dónde empezamos?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Optimizaremos las rutas según tu ubicación
        </p>

        <div className="space-y-2">
          {START_LOCATIONS.map((location) => {
            const Icon = location.icon;
            const isSelected = state.startLocation === location.id;
            
            return (
              <button
                key={location.id}
                onClick={() => updateState({ startLocation: location.id })}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                  ${isSelected 
                    ? 'border-[#E40E20] bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isSelected ? 'bg-[#E40E20] text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${isSelected ? 'text-[#E40E20]' : 'text-gray-700'}`}>
                  {location.label}
                </span>
                {isSelected && (
                  <Check className="w-5 h-5 ml-auto text-[#E40E20]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// PASO 2: INTERESES
// =============================================================================

function Step2Interests({ 
  state, 
  toggleInterest, 
  variants, 
  direction 
}: { 
  state: PlannerState; 
  toggleInterest: (id: string) => void;
  variants: any;
  direction: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 font-josefin">
          ¿Qué te emociona del Atlántico?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona hasta 3 experiencias • {state.interests.length}/3
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTERESTS.map((interest) => {
            const Icon = interest.icon;
            const isSelected = state.interests.includes(interest.id);
            const isDisabled = !isSelected && state.interests.length >= 3;
            
            return (
              <motion.button
                key={interest.id}
                onClick={() => !isDisabled && toggleInterest(interest.id)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden
                  ${isSelected 
                    ? 'border-transparent shadow-lg' 
                    : isDisabled
                      ? 'border-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                style={isSelected ? { 
                  borderColor: interest.color,
                  backgroundColor: `${interest.color}10`
                } : {}}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: interest.color }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: isSelected ? interest.color : `${interest.color}20`,
                      color: isSelected ? 'white' : interest.color
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-sm"
                      style={{ color: isSelected ? interest.color : '#1f2937' }}
                    >
                      {interest.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {interest.tagline}
                    </p>
                  </div>
                </div>

                {/* Preview on selection */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t text-xs text-gray-600"
                      style={{ borderColor: `${interest.color}30` }}
                    >
                      <span className="font-medium" style={{ color: interest.color }}>
                        Incluye:
                      </span>{' '}
                      {interest.preview}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// PASO 3: ESTILO DE VIAJE
// =============================================================================

function Step3Style({ 
  state, 
  updateState, 
  variants, 
  direction 
}: { 
  state: PlannerState; 
  updateState: (updates: Partial<PlannerState>) => void;
  variants: any;
  direction: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-8"
    >
      {/* Tipo de viaje */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          ¿Cómo viajas?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRIP_TYPES.map((type) => {
            const isSelected = state.tripType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => updateState({ tripType: type.id })}
                className={`
                  p-4 rounded-2xl border-2 transition-all text-center
                  ${isSelected 
                    ? 'border-[#E40E20] bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className={`font-medium text-sm ${isSelected ? 'text-[#E40E20]' : 'text-gray-700'}`}>
                  {type.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {type.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Presupuesto */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          Tu presupuesto
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((option) => {
            const isSelected = state.budget === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => updateState({ budget: option.id })}
                className={`
                  p-4 rounded-2xl border-2 transition-all text-center
                  ${isSelected 
                    ? 'border-[#E40E20] bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`font-semibold ${isSelected ? 'text-[#E40E20]' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ritmo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          ¿A qué ritmo?
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {PACE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = state.pace === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => updateState({ pace: option.id })}
                className={`
                  p-4 rounded-2xl border-2 transition-all text-center
                  ${isSelected 
                    ? 'border-[#E40E20] bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-[#E40E20]' : 'text-gray-500'}`} 
                />
                <div className={`font-semibold text-sm ${isSelected ? 'text-[#E40E20]' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.activitiesPerDay}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// PASO 4: PREVIEW Y EMAIL
// =============================================================================

function Step4Preview({ 
  state, 
  updateState, 
  variants, 
  direction 
}: { 
  state: PlannerState; 
  updateState: (updates: Partial<PlannerState>) => void;
  variants: any;
  direction: number;
}) {
  const selectedInterests = INTERESTS.filter(i => state.interests.includes(i.id));
  const selectedTripType = TRIP_TYPES.find(t => t.id === state.tripType);
  const selectedBudget = BUDGET_OPTIONS.find(b => b.id === state.budget);

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-6"
    >
      {/* Preview Card */}
      <div 
        className="p-5 rounded-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.azulBarranquero}08)`,
          border: '1px solid rgba(228, 14, 32, 0.1)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: COLORS.primary }} />
          <h3 className="font-semibold text-gray-900">Tu aventura en el Atlántico</h3>
        </div>

        <div className="space-y-3">
          {/* Duración */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              <strong className="text-gray-900">{state.days} días</strong> de exploración
            </span>
          </div>

          {/* Tipo de viaje */}
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Viaje {selectedTripType?.label.toLowerCase()}
            </span>
          </div>

          {/* Presupuesto */}
          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Presupuesto {selectedBudget?.label.toLowerCase()} ({selectedBudget?.description})
            </span>
          </div>

          {/* Intereses */}
          <div className="flex items-start gap-3 text-sm">
            <Heart className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map(interest => (
                <span 
                  key={interest.id}
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: interest.color }}
                >
                  {interest.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview de lugares */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Tu itinerario incluirá:</strong>
          </p>
          <ul className="mt-2 space-y-1">
            {selectedInterests.slice(0, 2).map(interest => (
              <li key={interest.id} className="text-sm text-gray-600 flex items-center gap-2">
                <Check className="w-3 h-3" style={{ color: interest.color }} />
                {interest.preview.split(',')[0]}
              </li>
            ))}
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <Check className="w-3 h-3 text-gray-400" />
              Restaurantes locales recomendados
            </li>
            <li className="text-sm text-gray-600 flex items-center gap-2">
              <Check className="w-3 h-3 text-gray-400" />
              Horarios optimizados y tips locales
            </li>
          </ul>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-josefin">
          ¿Dónde te enviamos tu itinerario?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Recibirás tu itinerario completo por email
        </p>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={state.email}
            onChange={(e) => updateState({ email: e.target.value })}
            placeholder="tu@email.com"
            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#E40E20] focus:outline-none transition-colors text-gray-900"
          />
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Datos seguros</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Generado con IA</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}