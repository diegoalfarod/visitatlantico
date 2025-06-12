"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import type { Stop } from "@/components/ItineraryStopCard";
import { motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  FileText,
  Share2,
  Download,
} from "lucide-react";
import { generateUniqueLink } from "utils/linkGenerator";

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

declare global {
  interface Window {
    setPlannerLocation: (loc: { lat: number; lng: number } | null) => void;
    setGeoError: (msg: string | null) => void;
    setFetchingPlace: (flag: boolean) => void;
    setUserPlaceGlobal: (place: string | null) => void;
  }
}


/* ═════════════════ COMPONENTE ═════════════════ */

export default function PremiumPlannerPage() {
  /* preguntas y respuestas */
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);

  /* ubicación */
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userPlace, setUserPlace] = useState<string | null>(null);
  const [fetchingPlace, setFetchingPlace] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  /* exponer setters para GPS-spoof */
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

  /* cargar preguntas al iniciar */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/itinerary/profile', { method: 'POST' });
        const data = await res.json();
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setAnswers(Array(data.questions.length).fill(''));
        }
      } catch (err) {
        console.error('Error cargando preguntas:', err);
      }
    };
    load();
  }, []);

  /* pasos wizard */
  const steps = questions.map((q, i) => ({
    label: q,
    valid: !!answers[i],
    element: (
      <input
        value={answers[i] ?? ""}
        onChange={(e) => {
          const copy = [...answers];
          copy[i] = e.target.value;
          setAnswers(copy);
        }}
        className="w-full border-b-2 border-gray-300 pb-2 focus:border-red-500 outline-none text-lg"
      />
    ),
  }));

  const next = () => qIndex < steps.length - 1 && setQIndex((i) => i + 1);
  const prev = () => qIndex > 0 && setQIndex((i) => i - 1);
  const progress = steps.length
    ? ((qIndex + 1) / steps.length) * 100
    : 0;

  /* API & itinerario */
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [view, setView] =
    useState<"questions" | "loading" | "itinerary">("questions");
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleReorder = useCallback((from: number, to: number) => {
    setItinerary((curr) => {
      if (!curr) return curr;
      const updated = [...curr];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      return updated;
    });
  }, []);

  useEffect(() => {
    if (navigator.onLine) return;
    caches
      .open('itinerary-cache')
      .then((c) => c.match('/offline-itinerary'))
      .then(async (res) => {
        if (res) {
          const data = await res.json();
          if (data.itinerary) setItinerary(data.itinerary);
          if (data.days) setAnswers(a => ({ ...a, days: data.days }));
          setView('itinerary');
        }
      });
  }, []);

 

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  }

  const generateItinerary = async () => {
    if (!steps.every((s) => s.valid)) return;
    setView("loading");
    const payload = { questions, answers };
    
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qa: payload,
          location: location
            ? {
                lat: location.lat,
                lng: location.lng,
              }
            : null,
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

      // Filtrar paradas inválidas
      const validStops = apiStops.filter(stop => 
        stop.id && stop.lat && stop.lng && stop.description && stop.type
      );

      if (!validStops.length) {
        throw new Error("No se encontraron destinos válidos");
      }

      // Ordenar por hora
      const sortedStops = [...validStops].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      // Convertir a tipo Stop
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
      const url = await generateUniqueLink(
        itinerary,
        parseInt(answers[1] || '1', 10) || 1
      );
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
      // 1. Clonar y limpiar el contenido
      const clone = pdfRef.current.cloneNode(true) as HTMLElement;
      
      // Limpiar elementos interactivos
      clone.querySelectorAll('button, input, select, .map-container').forEach(el => el.remove());
      
      // Reemplazar el mapa interactivo con un placeholder estático
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
  
      // 2. Crear HTML completo
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
      <!-- Header -->
      <div class="header">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0;">Tu Aventura Generada</h1>
        ${userPlace ? `<p style="margin-top: 0.5rem; font-size: 1rem;">📍 ${userPlace}</p>` : ''}
      </div>
      
      <!-- Contenido clonado -->
      ${clone.innerHTML}
    </div>
  </body>
  </html>`;
  
      // 3. Enviar HTML al servidor para generar PDF
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
  
      // 4. Descargar el PDF
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

  /* ═════ vista loading ════ */
  if (view === "loading") {
    const frases = [
      "🧠 Generando experiencias inolvidables…",
      "🌅 Buscando atardeceres mágicos…",
      "🥥 Consultando a las iguanas locales…",
      "🚣‍♀️ Ajustando los remos del plan…",
      "🗺️ Calculando rutas con sabor caribeño…",
    ];
    const randomFrase = frases[Math.floor(Math.random() * frases.length)];
  
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50 px-4 text-center space-y-6">
        <div className="relative w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute h-full bg-red-600 animate-pulse w-full" />
        </div>
  
        <Loader2 className="animate-spin w-10 h-10 text-red-600" />
  
        <p className="text-gray-700 text-lg font-medium animate-pulse">
          {randomFrase}
        </p>
      </div>
    );
  }  

  /* ═════ vista itinerario ════ */
  if (view === "itinerary" && itinerary) {
    const totalH = Math.round(
      itinerary.reduce((s, t) => s + t.durationMinutes, 0) / 60
    );
    const days = parseInt(answers[1] || '1', 10) || 1;
    const perDay = Math.ceil(itinerary.length / days);

    return (
      <DndProvider backend={HTML5Backend}>
      <main ref={pdfRef} className="min-h-screen bg-blue-50 pb-16">
        {/* HERO */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold">Tu Aventura Generada</h1>
            {userPlace && <p className="mt-2 text-lg">📍 {userPlace}</p>}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-12 space-y-10">
          {/* resumen */}
          <section className="bg-white p-8 rounded-3xl shadow-2xl space-y-6">
            <h2 className="text-3xl font-bold">Resumen</h2>
            <div className="flex flex-wrap gap-6 text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar /> {days} día{days > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-2">
                <MapPin /> {itinerary.length} paradas
              </span>
              <span className="flex items-center gap-2">
                <Clock /> {totalH} h
              </span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleSaveChanges()}
                className="bg-blue-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <FileText className="mr-2" /> Guardar cambios
              </button>
              <button
                onClick={downloadPDF}
                className="bg-green-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <Download className="mr-2" /> Guardar PDF
              </button>
              <button
                onClick={saveOffline}
                className="bg-blue-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <Download className="mr-2" /> Usar sin conexión
              </button>
              <button
                onClick={handleShare}
                className="bg-purple-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <Share2 className="mr-2" /> Compartir link
              </button>
            </div>
          </section>

          {/* mapa */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-96 map-container">
            <ItineraryMap stops={itinerary} userLocation={location} />
          </div>

          {/* timeline por día */}
          {Array.from({ length: days }).map((_, d) => {
            const dayStops = itinerary.slice(d * perDay, (d + 1) * perDay);
            return (
              <section
                key={d}
                className="bg-white p-8 rounded-3xl shadow-2xl space-y-6"
              >
                <h3 className="text-2xl font-semibold">Día {d + 1}</h3>
                <ItineraryTimeline
                  stops={dayStops}
                  editable
                  offset={d * perDay}
                  onMove={handleReorder}
                  onChange={(newStops) => {
                    const updated = [...itinerary];
                    updated.splice(d * perDay, newStops.length, ...newStops);
                    setItinerary(updated);
                  }}
                />
              </section>
            );
          })}
        </div>
      </main>
      </DndProvider>
    );
  }

  /* ═════ wizard ════ */
  const step = steps[qIndex];
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 pb-16">
      {/* hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold">Descubre el Atlántico</h1>
        </div>
      </div>

      {/* progress */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1 text-right">
          Paso {qIndex + 1} de {steps.length}
        </p>
      </div>

      {/* card */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-2xl space-y-10"
        >
          {/* pregunta */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{step.label}</h2>
            {step.helper && (
              <p className="text-sm text-gray-500">{step.helper}</p>
            )}
            {step.element}
          </div>

          {/* ubicación toggle */}
          <div className="space-y-2">
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
                  className={`dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition ${
                    useLocation ? "translate-x-6" : ""
                  }`}
                />
              </div>
              <span className="text-lg">
                Generar plan turístico basado en mi ubicación actual
              </span>
            </label>

            {fetchingPlace && (
              <p className="text-gray-600 flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detectando ubicación…
              </p>
            )}
            {geoError && <p className="text-red-600 text-sm">{geoError}</p>}
            {userPlace && !fetchingPlace && !geoError && (
              <p className="text-sm text-gray-700">📍 {userPlace}</p>
            )}
          </div>

          {/* navegación */}
          <div className="flex justify-between">
            <button
              onClick={prev}
              disabled={qIndex === 0}
              className="text-gray-500 hover:text-gray-700"
            >
              Anterior
            </button>

            {qIndex < steps.length - 1 ? (
              <button
                onClick={next}
                disabled={!step.valid}
                className="bg-red-600 text-white px-6 py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={generateItinerary}
                disabled={!step.valid}
                className="bg-red-600 text-white px-6 py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-50"
              >
                Generar itinerario
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}