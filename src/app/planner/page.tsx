"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import type { Stop } from "@/components/ItineraryStopCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  Share2,
  FileText,
  Download,
  Shuffle,
  Settings,
  Navigation,
  Utensils,
  Umbrella,
  Route,
  Baby,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Sparkles,
  Check,
  Coffee,
} from "lucide-react";
import { generateUniqueLink } from "utils/linkGenerator";
import Image from "next/image";

/* ─────────── tipos & helpers ─────────── */

type ApiStop = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  startTime: string;
  durationMinutes: number;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  photos?: string[]; 
  type: "destination" | "experience";
};

type ApiResponse = { itinerary: ApiStop[]; error?: string };
type WritableStyle = Record<string, string>;

declare global {
  interface Window {
    setPlannerLocation: (loc: { lat: number; lng: number } | null) => void;
    setGeoError: (msg: string | null) => void;
    setFetchingPlace: (flag: boolean) => void;
    setUserPlaceGlobal: (place: string | null) => void;
  }
}

// Custom hook para preferencias de usuario
const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('visitatlantico_preferences');
    return saved ? JSON.parse(saved) : {
      favoriteCategories: [],
      avoidCategories: [],
      travelStyle: null,
      lastItineraries: []
    };
  });

  const updatePreferences = (updates: any) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('visitatlantico_preferences', JSON.stringify(newPrefs));
    }
  };

  return { preferences, updatePreferences };
};

/* ═════════════════ COMPONENTE PRINCIPAL ═════════════════ */

export default function PremiumPlannerPage() {
  const router = useRouter();
  
  /* wizard answers */
  const [answers, setAnswers] = useState<{
    days?: number;
    motivo?: string;
    otros?: boolean;
    email?: string;
  }>({});
  const [qIndex, setQIndex] = useState(0);

  /* ubicación */
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userPlace, setUserPlace] = useState<string | null>(null);
  const [fetchingPlace, setFetchingPlace] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  /* preferencias de usuario */
  const { preferences, updatePreferences } = useUserPreferences();

  /* exponer setters para GPS */
  if (typeof window !== "undefined") {
    window.setPlannerLocation = setLocation;
    window.setGeoError = setGeoError;
    window.setFetchingPlace = setFetchingPlace;
    window.setUserPlaceGlobal = setUserPlace;
  }

  /* efecto ubicación */
  useEffect(() => {
    if (!useLocation) {
      setLocation(null);
      setUserPlace(null);
      setGeoError(null);
      return;
    }

    let cancelled = false;
    setFetchingPlace(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return;

        setGeoError(null);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);

        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=place&access_token=${token}`
          );
          if (!resp.ok) throw new Error(`Mapbox status ${resp.status}`);

          const js = await resp.json();
          const place = js.features?.[0]?.place_name;
          setUserPlace(place ?? "Ubicación detectada");
        } catch (err) {
          console.error("Error en Mapbox:", err);
          setGeoError("No se pudo geocodificar la ubicación.");
        } finally {
          setFetchingPlace(false);
        }
      },
      (err) => {
        if (cancelled) return;

        setFetchingPlace(false);
        setUseLocation(false);
        setLocation(null);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado."
            : "No se pudo obtener la posición."
        );
      }
    );

    return () => {
      cancelled = true;
    };
  }, [useLocation]);

  /* pasos wizard mejorados */
  const steps = [
    {
      label: "¿Cuánto tiempo tienes?",
      valid: answers.days !== undefined,
      element: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { days: 1, label: "Un día", icon: "☀️" },
            { days: 2, label: "Fin de semana", icon: "🌅" },
            { days: 3, label: "Puente", icon: "🏖️" },
            { days: 5, label: "Semana", icon: "🗓️" },
          ].map((opt) => (
            <motion.button
              key={opt.days}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAnswers({ ...answers, days: opt.days })}
              className={`p-6 rounded-2xl border-2 transition-all ${
                answers.days === opt.days
                  ? "border-red-600 bg-red-50 scale-105 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-2">{opt.icon}</div>
              <div className="font-semibold">{opt.label}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Qué tipo de experiencia buscas?",
      helper: "Elige la que más te atraiga",
      valid: !!answers.motivo,
      element: (
        <div className="space-y-3">
          {[
            { id: "relax", emoji: "🏖️", title: "Relax total", desc: "Playas, spa y descanso" },
            { id: "cultura", emoji: "🎭", title: "Inmersión cultural", desc: "Museos, historia y tradiciones" },
            { id: "aventura", emoji: "🚣", title: "Aventura activa", desc: "Deportes y naturaleza" },
            { id: "gastronomia", emoji: "🍤", title: "Sabores locales", desc: "Comida típica y mercados" },
            { id: "mixto", emoji: "✨", title: "De todo un poco", desc: "Experiencia variada" },
          ].map((exp) => (
            <motion.button
              key={exp.id}
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnswers({ ...answers, motivo: exp.title })}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                answers.motivo === exp.title
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "bg-white border border-gray-200 hover:shadow-md"
              }`}
            >
              <span className="text-3xl">{exp.emoji}</span>
              <div className="text-left flex-1">
                <div className="font-semibold">{exp.title}</div>
                <div className={`text-sm ${
                  answers.motivo === exp.title ? "text-red-100" : "text-gray-500"
                }`}>
                  {exp.desc}
                </div>
              </div>
              {answers.motivo === exp.title && (
                <Check className="w-5 h-5" />
              )}
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Quieres explorar otros municipios?",
      valid: answers.otros !== undefined,
      element: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: true, label: "Sí, aventurémonos", icon: "🚗", desc: "Conoce más lugares" },
            { value: false, label: "No, cerca está bien", icon: "🏘️", desc: "Solo Barranquilla" }
          ].map((opt) => (
            <motion.button
              key={String(opt.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAnswers({ ...answers, otros: opt.value })}
              className={`p-6 rounded-2xl border-2 transition-all ${
                answers.otros === opt.value
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-4xl mb-3">{opt.icon}</div>
              <div className="font-semibold mb-1">{opt.label}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Cómo te contactamos?",
      helper: "Te enviaremos tu itinerario personalizado",
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || ""),
      element: (
        <div className="max-w-md mx-auto">
          <input
            type="email"
            value={answers.email ?? ""}
            onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
            placeholder="tu@email.com"
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 focus:outline-none transition-all"
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            No spam, solo tu itinerario 🎉
          </p>
        </div>
      ),
    },
  ];

  const next = () => qIndex < steps.length - 1 && setQIndex((i) => i + 1);
  const prev = () => qIndex > 0 && setQIndex((i) => i - 1);

  /* API & itinerario */
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [view, setView] = useState<"questions" | "loading" | "itinerary">("questions");
  const pdfRef = useRef<HTMLDivElement>(null);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const handleStopsReorder = (newStops: Stop[]) => {
    setItinerary(newStops);
  };

  const generateItinerary = async () => {
    if (!steps.every((s) => s.valid)) return;
    setView("loading");
    
    // Guardar preferencias del usuario
    updatePreferences({
      travelStyle: answers.motivo,
      lastItineraries: [...(preferences.lastItineraries || []), {
        date: new Date().toISOString(),
        days: answers.days,
        style: answers.motivo
      }].slice(-5) // Mantener solo los últimos 5
    });
    
    const profile = {
      Días: String(answers.days),
      Motivo: answers.motivo,
      "Otros municipios": answers.otros ? "Sí" : "No",
      Email: answers.email,
    };
    
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profile, 
          location: location ? { 
            lat: location.lat, 
            lng: location.lng 
          } : null
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const { itinerary: apiStops, error } = (await res.json()) as ApiResponse;
      
      if (error || !apiStops?.length) {
        throw new Error(error || "No se recibieron destinos");
      }

      const validStops = apiStops.filter(stop => 
        stop.id && stop.lat && stop.lng && stop.description && stop.type
      );

      if (!validStops.length) {
        throw new Error("No se encontraron destinos válidos");
      }

      const sortedStops = [...validStops].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      const processedItinerary: Stop[] = sortedStops.map((apiStop, index) => ({
        id: apiStop.id,
        name: apiStop.name || `Destino ${index + 1}`,
        description: apiStop.description,
        lat: apiStop.lat,
        lng: apiStop.lng,
        durationMinutes: apiStop.durationMinutes || 60,
        tip: apiStop.tip || `Consejo: ${apiStop.name || 'este lugar'}`,
        municipality: apiStop.municipality || "Ubicación desconocida",
        startTime: apiStop.startTime,
        category: apiStop.category || "attraction",
        imageUrl: apiStop.imageUrl || "/default-place.jpg",
        photos: apiStop.photos, 
        distance: location ? calculateDistance(
          location.lat, 
          location.lng, 
          apiStop.lat, 
          apiStop.lng
        ) : 0,
        type: apiStop.type
      }));
      
      setItinerary(processedItinerary);
      setView("itinerary");
    } catch (error) {
      console.error("Error generando itinerario:", error);
      alert(
        error instanceof Error ? error.message :
        "Error al generar el itinerario. Por favor intenta con otros parámetros."
      );
      setView("questions");
    }
  };

  const handleShare = async () => {
    if (!itinerary?.length) return alert("Itinerario vacío");
    try {
      const url = await generateUniqueLink(itinerary, answers.days ?? 1);
      await navigator.clipboard.writeText(url);
      alert("Link copiado ✅");
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el link");
    }
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) {
      alert("No se encontró el contenido del itinerario.");
      return;
    }
  
    try {
      const clone = pdfRef.current.cloneNode(true) as HTMLElement;
      
      clone.querySelectorAll('button, input, select, .map-container').forEach(el => el.remove());
      
      const mapPlaceholder = `<div class="map-static" style="height:400px;background:#eee;display:flex;align-items:center;justify-content:center;border-radius:1rem;margin:1rem 0">
        <div style="text-align:center">
          <h3 style="color:#333">Mapa del Itinerario</h3>
          <p style="color:#666">${userPlace || 'Ubicación principal'}</p>
        </div>
      </div>`;
      
      const mapContainer = clone.querySelector('.map-container');
      if (mapContainer) {
        mapContainer.outerHTML = mapPlaceholder;
      }
  
      const html = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Itinerario de Viaje - ${userPlace || 'Atlántico'}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                     Ubuntu, Cantarell, sans-serif;
        background-color: #f8fafc;
        color: #1e293b;
        padding: 20px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      .header {
        background: #dc2626;
        color: white;
        padding: 4rem 1rem;
        text-align: center;
        margin-bottom: 20px;
      }
      .card {
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        break-inside: avoid;
      }
      .timeline-item {
        border-left: 2px solid #dc2626;
        padding-left: 1.5rem;
        margin: 1.5rem 0;
      }
      @media print {
        body { 
          background: white;
          padding: 0;
        }
        .header { 
          padding: 2rem 1rem;
        }
        .card {
          box-shadow: none;
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0;">Tu Aventura Generada</h1>
        ${userPlace ? `<p style="margin-top: 0.5rem; font-size: 1rem;">📍 ${userPlace}</p>` : ''}
      </div>
      
      ${clone.innerHTML}
    </div>
  </body>
  </html>`;
  
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      });
  
      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerario-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  /* ═════ vista loading mejorada ════ */
  if (view === "loading") {
    return <LoadingItinerary profile={answers} />;
  }

  /* ═════ vista itinerario mejorada ════ */
  if (view === "itinerary" && itinerary) {
    const totalH = Math.round(
      itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
    );
    const days = answers.days ?? 1;
    const perDay = Math.ceil(itinerary.length / days);

    return (
      <main ref={pdfRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
        {/* HERO */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold"
            >
              Tu Aventura Generada
            </motion.h1>
            {userPlace && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-lg"
              >
                📍 {userPlace}
              </motion.p>
            )}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm"
            >
              <Shuffle className="w-4 h-4" />
              Arrastra las actividades para personalizar tu itinerario
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-12 space-y-10">
          {/* resumen mejorado */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-2xl space-y-6"
          >
            <h2 className="text-3xl font-bold">Resumen de tu aventura</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-red-600" />
                <p className="text-2xl font-bold">{days}</p>
                <p className="text-sm text-gray-500">día{days > 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-red-600" />
                <p className="text-2xl font-bold">{itinerary.length}</p>
                <p className="text-sm text-gray-500">paradas</p>
              </div>
              <div className="space-y-2">
                <Clock className="w-8 h-8 mx-auto text-red-600" />
                <p className="text-2xl font-bold">{totalH}</p>
                <p className="text-sm text-gray-500">horas</p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadPDF}
                className="flex-1 bg-green-600 text-white px-5 py-3 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition"
              >
                <Download className="mr-2" /> Guardar para offline
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare} 
                className="flex-1 bg-purple-600 text-white px-5 py-3 rounded-full inline-flex items-center justify-center shadow hover:shadow-lg transition"
              >
                <Share2 className="mr-2" /> Compartir
              </motion.button>
            </div>
          </motion.section>

          {/* mapa */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden h-96 map-container"
          >
            <ItineraryMap stops={itinerary} userLocation={location} />
          </motion.div>

          {/* timeline por día mejorado */}
          {Array.from({ length: days }).map((_, d) => {
            const dayStops = itinerary.slice(d * perDay, (d + 1) * perDay);
            return (
              <motion.section
                key={d}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + d * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-2xl space-y-6"
              >
                <DaySummaryCard day={d + 1} stops={dayStops} />
                <ItineraryTimeline 
                  stops={dayStops} 
                  userLocation={location}
                  onStopsReorder={(newStops) => {
                    const newItinerary = [...itinerary];
                    newStops.forEach((stop, idx) => {
                      const globalIdx = d * perDay + idx;
                      if (globalIdx < newItinerary.length) {
                        newItinerary[globalIdx] = stop;
                      }
                    });
                    setItinerary(newItinerary);
                  }}
                />
              </motion.section>
            );
          })}
        </div>

        {/* Panel de ajustes rápidos */}
        <QuickCustomize itinerary={itinerary} onUpdate={setItinerary} />
      </main>
    );
  }

  /* ═════ wizard mejorado ════ */
  const step = steps[qIndex];
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 pb-16">
      {/* hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-extrabold"
          >
            Descubre el Atlántico
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-red-100"
          >
            Creamos tu itinerario perfecto con IA ✨
          </motion.p>
        </div>
      </div>

      {/* progress mejorado */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-full p-2 shadow-lg">
          <div className="flex items-center justify-between">
            {steps.map((_, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    idx <= qIndex
                      ? "bg-red-600 text-white scale-110"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {idx < qIndex ? <Check className="w-5 h-5" /> : idx + 1}
                </motion.div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      idx < qIndex ? "bg-red-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* card mejorado */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-12 rounded-3xl shadow-2xl space-y-10"
          >
            {/* Smart suggestions basadas en preferencias anteriores */}
            {preferences.lastItineraries?.length > 0 && qIndex === 1 && (
              <SmartSuggestions preferences={preferences} />
            )}

            <WizardStep step={step} qIndex={qIndex} answers={answers} />

            {/* ubicación toggle mejorado */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <label className="inline-flex items-center cursor-pointer space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={useLocation}
                    onChange={(e) => setUseLocation(e.target.checked)}
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      useLocation ? "bg-red-600" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition shadow-md ${
                      useLocation ? "translate-x-6" : ""
                    }`}
                  />
                </div>
                <span className="text-lg">
                  Personalizar según mi ubicación actual 📍
                </span>
              </label>

              {fetchingPlace && (
                <p className="text-gray-600 flex items-center gap-2 text-sm mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detectando ubicación…
                </p>
              )}
              {geoError && <p className="text-red-600 text-sm mt-2">{geoError}</p>}
              {userPlace && !fetchingPlace && !geoError && (
                <p className="text-sm text-gray-700 mt-2">📍 {userPlace}</p>
              )}
            </motion.div>

            {/* navegación mejorada */}
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prev}
                disabled={qIndex === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </motion.button>

              {qIndex < steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  disabled={!step.valid}
                  className="bg-red-600 text-white px-8 py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateItinerary}
                  disabled={!step.valid}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generar mi aventura
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ═════════════════ COMPONENTES AUXILIARES ═════════════════ */

// Función helper para recalcular timings
const recalculateTimings = (stops: Stop[]): Stop[] => {
  let current = 9 * 60; // 09:00 en minutos
  return stops.map((stop, idx) => {
    if (idx > 0) {
      current += 30; // 30 min de viaje entre paradas
    }
    const startTime = `${Math.floor(current / 60).toString().padStart(2, "0")}:${(current % 60).toString().padStart(2, "0")}`;
    current += stop.durationMinutes || 60;
    return { ...stop, startTime };
  });
};

// Componente de paso del wizard
const WizardStep = ({ step, qIndex, answers }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.h2
          key={step.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          {step.label}
        </motion.h2>
        {step.helper && (
          <p className="text-gray-500">{step.helper}</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {step.element}
      </motion.div>
    </motion.div>
  );
};

// Sugerencias inteligentes
const SmartSuggestions = ({ preferences }: any) => {
  if (!preferences.lastItineraries?.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-blue-50 rounded-xl"
    >
      <p className="text-sm font-medium mb-2 text-blue-800">
        💡 Basado en tus viajes anteriores
      </p>
      <div className="flex gap-2 flex-wrap">
        {preferences.favoriteCategories?.map((cat: string) => (
          <span
            key={cat}
            className="px-3 py-1 bg-white rounded-full text-sm shadow-sm"
          >
            {cat}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Vista de loading mejorada
const LoadingItinerary = ({ profile }: any) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "🤖 Analizando tus preferencias...",
    "📍 Buscando los mejores lugares según tu perfil...",
    "🗺️ Optimizando rutas y horarios...",
    "⭐ Añadiendo recomendaciones especiales...",
    "✨ Finalizando tu aventura perfecta..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <MapPin className="w-full h-full text-red-600 opacity-20" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full opacity-30" />
            </motion.div>
          </div>

          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-gray-700"
          >
            {messages[currentMessage]}
          </motion.p>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p>Creando itinerario de <strong>{profile.Días || 1} días</strong></p>
            <p>Enfocado en: <strong>{profile.Motivo || "Experiencia variada"}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resumen visual del día
const DaySummaryCard = ({ day, stops }: { day: number; stops: Stop[] }) => {
  const totalMinutes = stops.reduce((sum, stop) => sum + stop.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const categories = Array.from(new Set(stops.map(s => s.category || "General")));
  
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Día {day}</h3>
        <div className="flex gap-2">
          {stops.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2.5 h-2.5 bg-white rounded-full opacity-70"
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold">{stops.length}</p>
          <p className="text-sm opacity-90">Lugares</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{totalHours}h {minutes > 0 ? `${minutes}m` : ''}</p>
          <p className="text-sm opacity-90">Duración</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{categories.length}</p>
          <p className="text-sm opacity-90">Categorías</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 flex-wrap">
        {categories.map(cat => (
          <span
            key={cat}
            className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm"
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};

// Panel de ajustes rápidos
const QuickCustomize = ({ itinerary, onUpdate }: { itinerary: Stop[]; onUpdate: (stops: Stop[]) => void }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakForm, setBreakForm] = useState({
    name: "",
    description: "",
    duration: 30
  });
  const router = useRouter();

  const handleAddBreak = () => {
    if (!breakForm.name.trim()) {
      alert("Por favor ingresa un nombre para el descanso");
      return;
    }

    // Crear nueva parada de descanso
    const breakStop: Stop = {
      id: `break-${Date.now()}`,
      name: breakForm.name,
      description: breakForm.description || "Tiempo para descansar",
      lat: itinerary[Math.floor(itinerary.length / 2)]?.lat || 10.9, // Usar coordenadas del medio del itinerario
      lng: itinerary[Math.floor(itinerary.length / 2)]?.lng || -74.9,
      startTime: "12:00", // Se recalculará con el resto
      durationMinutes: breakForm.duration,
      category: "Descanso",
      municipality: "Tu ubicación",
      distance: 0,
      type: "experience",
      imageUrl: "/images/rest-placeholder.jpg",
      tip: "Aprovecha para hidratarte y recargar energías"
    };

    // Insertar el descanso en el medio del itinerario
    const midPoint = Math.floor(itinerary.length / 2);
    const updatedItinerary = [
      ...itinerary.slice(0, midPoint),
      breakStop,
      ...itinerary.slice(midPoint)
    ];

    // Recalcular tiempos
    const recalculated = recalculateTimings(updatedItinerary);
    
    onUpdate(recalculated);
    setShowBreakModal(false);
    setBreakForm({ name: "", description: "", duration: 30 });
    setShowPanel(false);
  };

  const handleRegenerate = () => {
    if (confirm("¿Estás seguro de que quieres generar un nuevo itinerario? Se perderán los cambios actuales.")) {
      router.refresh();
      window.location.reload();
    }
  };

  const quickActions = [
    {
      id: "add-break",
      icon: <Coffee className="w-5 h-5" />,
      label: "Agregar Descanso",
      action: () => {
        setShowBreakModal(true);
        setShowPanel(false);
      }
    },
    {
      id: "regenerate",
      icon: <Sparkles className="w-5 h-5" />,
      label: "Re-Generar Ruta",
      action: handleRegenerate
    }
  ];

  return (
    <>
      <motion.button
        className="fixed bottom-24 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 right-6 bg-white rounded-2xl shadow-2xl p-4 z-40 w-64"
          >
            <h3 className="font-semibold mb-3">Ajustes rápidos</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ x: 5 }}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-all"
                >
                  <div className="text-red-600">{action.icon}</div>
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para agregar descanso */}
      <AnimatePresence>
        {showBreakModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBreakModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Agregar Descanso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del descanso *
                  </label>
                  <input
                    type="text"
                    value={breakForm.name}
                    onChange={(e) => setBreakForm({ ...breakForm, name: e.target.value })}
                    placeholder="Ej: Almuerzo, Café, Siesta..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={breakForm.description}
                    onChange={(e) => setBreakForm({ ...breakForm, description: e.target.value })}
                    placeholder="Ej: Parada para almorzar en un restaurante local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos)
                  </label>
                  <select
                    value={breakForm.duration}
                    onChange={(e) => setBreakForm({ ...breakForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora 30 min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBreakModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBreak}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};