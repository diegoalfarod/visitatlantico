// src/app/planner/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import ItineraryMap from "@/components/ItineraryMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import type { Stop } from "@/components/ItineraryStopCard";
import { motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  Share2,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateUniqueLink } from "utils/linkGenerator";

/* ─────────── tipos & helpers ─────────── */

type RawStop = Omit<Stop, "tip" | "municipality"> & { id: string };
type ApiResponse = { itinerary: RawStop[]; error?: string };

/** mapa simple para escribir estilos evitando readonly props  */
type WritableStyle = Record<string, string>;

declare global {
  interface Window {
    setPlannerLocation: (loc: { lat: number; lng: number } | null) => void;
    setGeoError: (msg: string | null) => void;
    setFetchingPlace: (flag: boolean) => void;
    setUserPlaceGlobal: (place: string | null) => void;
  }
}

const promptCards = [
  "Vivir el Carnaval de Barranquilla",
  "Ruta de museos y galerías",
  "Tour gastronómico costeño",
  "Playas paradisíacas y deportes acuáticos",
  "Pueblos patrimoniales y cultura indígena",
  "Senderismo y avistamiento de fauna",
  "Fotografía de paisajes y atardeceres",
  "Ruta de la música y la vida nocturna",
  "Arquitectura colonial e historia",
  "Experiencia de voluntariado ecológico",
];

/* ═════════════════ COMPONENTE ═════════════════ */

export default function PremiumPlannerPage() {
  /* wizard answers */
  const [answers, setAnswers] = useState<{
    days?: number;
    motivo?: string;
    ninos?: boolean;
    otros?: boolean;
  }>({});
  const [qIndex, setQIndex] = useState(0);

  /* ubicación */
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [userPlace, setUserPlace] = useState<string | null>(null);
  const [fetchingPlace, setFetchingPlace] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

 /* exponer setters para GPS-spoof (alias incluidos) */
if (typeof window !== "undefined") {
    // API actual
    window.setPlannerLocation = setLocation;
    window.setGeoError        = setGeoError;
    window.setFetchingPlace   = setFetchingPlace;
    window.setUserPlaceGlobal = setUserPlace;
  
    // 🔄 alias legacy para extensiones antiguas
    // @ts-expect-error legacy GPS-spoof alias
    window.setLocation = setLocation;
    // @ts-expect-error legacy GPS-spoof alias
    window.setUserPlace = setUserPlace;
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
  
  /* pasos wizard */
  const steps = [
    {
      label: "¿Cuántos días planeas visitar?",
      valid: answers.days !== undefined,
      element: (
        <select
          value={answers.days ?? ""}
          onChange={(e) =>
            setAnswers((a) => ({ ...a, days: Number(e.target.value) }))
          }
          className="w-full border-b-2 border-gray-300 pb-2 focus:border-red-500 outline-none text-lg"
        >
          <option value="" disabled>
            Selecciona días
          </option>
          {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d} día{d > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Cuéntanos qué te gustaría hacer o aprender",
      helper: "Elige un prompt o escribe tu propio motivo",
      valid: !!answers.motivo,
      element: (
        <>
          <input
            value={answers.motivo ?? ""}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, motivo: e.target.value }))
            }
            placeholder="Ej. Tour gastronómico costeño…"
            className="w-full border-b-2 border-gray-300 pb-2 focus:border-red-500 outline-none text-lg"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {promptCards.map((p) => (
              <button
                key={p}
                onClick={() => setAnswers((a) => ({ ...a, motivo: p }))}
                className={`p-4 rounded-2xl border transition text-left shadow-sm hover:shadow-lg ${
                  answers.motivo === p
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 hover:bg-red-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      ),
    },
    {
      label: "¿Viajas con niños?",
      valid: answers.ninos !== undefined,
      element: (
        <div className="flex gap-4">
          {["Sí", "No"].map((opt, i) => (
            <button
              key={opt}
              onClick={() => setAnswers((a) => ({ ...a, ninos: i === 0 }))}
              className={`flex-1 py-3 rounded-full text-lg font-medium transition ${
                answers.ninos === (i === 0)
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ),
    },
    {
      label: "¿Estás dispuesto a visitar otros municipios?",
      valid: answers.otros !== undefined,
      element: (
        <div className="flex gap-4">
          {["Sí", "No"].map((opt, i) => (
            <button
              key={opt}
              onClick={() => setAnswers((a) => ({ ...a, otros: i === 0 }))}
              className={`flex-1 py-3 rounded-full text-lg font-medium transition ${
                answers.otros === (i === 0)
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const next = () => qIndex < steps.length - 1 && setQIndex((i) => i + 1);
  const prev = () => qIndex > 0 && setQIndex((i) => i - 1);
  const progress = ((qIndex + 1) / steps.length) * 100;

  /* API & itinerario */
  const [itinerary, setItinerary] = useState<Stop[] | null>(null);
  const [view, setView] =
    useState<"questions" | "loading" | "itinerary">("questions");
  const pdfRef = useRef<HTMLDivElement>(null);

  const generateItinerary = async () => {
    if (!steps.every((s) => s.valid)) return;
    setView("loading");
    const profile = {
      Días: String(answers.days),
      Motivo: answers.motivo,
      "Viaja con niños": answers.ninos ? "Sí" : "No",
      "Otros municipios": answers.otros ? "Sí" : "No",
    };
    const res = await fetch("/api/itinerary/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, location }),
    });
    const { itinerary: raw } = (await res.json()) as ApiResponse;
    setItinerary(raw as Stop[]);
    setView("itinerary");
  };

  const handleShare = async () => {
    const link = await generateUniqueLink(itinerary);
    await navigator.clipboard.writeText(link);
    alert("Link copiado!");
  };

  /* descarga PDF sin colores oklch */
  const downloadPDF = async () => {
    if (!pdfRef.current) return;
  
    // 1. Clonar todo el contenido
    const clone = pdfRef.current.cloneNode(true) as HTMLElement;
  
    // 2. Eliminar estilos conflictivos (oklch, shadows, gradientes, etc.)
    clone.querySelectorAll("style").forEach((el) => {
      if (el.textContent?.includes("oklch(")) el.remove();
    });
  
    const isBad = (val: string): boolean => val.includes("oklch(");
    const replaceIfBad = (el: HTMLElement, prop: string) => {
      const current = getComputedStyle(el)[prop as keyof CSSStyleDeclaration] ?? "";
      if (typeof current === "string" && isBad(current)) {
        (el.style as unknown as WritableStyle)[prop] =
          prop.includes("background") || prop.includes("border")
            ? "#ffffff"
            : "#000000";
      }
    };
  
    clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const bgImg = getComputedStyle(el).backgroundImage;
      if (bgImg.includes("gradient") || isBad(bgImg)) {
        el.style.backgroundImage = "none";
      }
  
      const boxShadow = getComputedStyle(el).boxShadow;
      if (isBad(boxShadow)) el.style.boxShadow = "none";
  
      [
        "backgroundColor",
        "color",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "textDecorationColor",
        "columnRuleColor",
      ].forEach((p) => replaceIfBad(el, p));
  
      // Quitar props CSS personalizados con oklch
      const cs = getComputedStyle(el);
      for (let i = 0; i < cs.length; i++) {
        const key = cs.item(i);
        if (key.startsWith("--") && isBad(cs.getPropertyValue(key))) {
          el.style.setProperty(key, "inherit");
        }
      }
    });
  
    // 3. Expandir cualquier elemento con height: 0
    clone.querySelectorAll<HTMLElement>('[style*="height: 0"]').forEach((el) => {
      el.style.height = "auto";
      el.style.overflow = "visible";
      el.style.opacity = "1";
    });
  
    // 4. Ocultarlo fuera del viewport
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
  
    // 5. Convertir a canvas
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(clone);
  
    // 6. Generar PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const img = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("itinerario.pdf");
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
        {/* Barra animada de progreso */}
        <div className="relative w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute h-full bg-red-600 animate-pulse w-full" />
        </div>
  
        {/* Spinner opcional */}
        <Loader2 className="animate-spin w-10 h-10 text-red-600" />
  
        {/* Frase motivadora */}
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
    const perDay = Math.ceil(itinerary.length / (answers.days ?? 1));

    return (
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
                <Calendar /> {answers.days} días
              </span>
              <span className="flex items-center gap-2">
                <MapPin /> {itinerary.length} paradas
              </span>
              <span className="flex items-center gap-2">
                <Clock /> {totalH} h
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadPDF}
                className="bg-red-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <FileText className="mr-2" /> Descargar PDF
              </button>
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-5 py-3 rounded-full inline-flex items-center shadow hover:shadow-lg transition"
              >
                <Share2 className="mr-2" /> Compartir link
              </button>
            </div>
          </section>

          {/* mapa */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-96">
            <ItineraryMap stops={itinerary} userLocation={location} />
          </div>

          {/* timeline por día */}
          {Array.from({ length: answers.days ?? 1 }).map((_, d) => (
            <section
              key={d}
              className="bg-white p-8 rounded-3xl shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-semibold">Día {d + 1}</h3>
              <ItineraryTimeline
                stops={itinerary.slice(d * perDay, d * perDay + perDay)}
              />
            </section>
          ))}
        </div>
      </main>
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
