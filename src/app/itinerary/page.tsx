"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LZString from "lz-string";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Copy, Check, ArrowLeft, Map } from "lucide-react";

import ItineraryMap from "@/components/ItineraryMap";
import MultiDayItinerary from "@/components/MultiDayItinerary";

type Stop = {
  id?: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  startTime?: string;
  durationMinutes?: number;
  tip?: string;
  municipality?: string;
  category?: string;
  imageUrl?: string;
  imagePath?: string;
  image?: string;
  photos?: string[];
  distance?: number;
  type?: "destination" | "experience";
};

type DecodedData = {
  itinerary: Stop[];
  days?: number;
};

const resolveImageUrl = (s: Stop): string | undefined => {
  const candidates = [s.imageUrl, s.imagePath, s.image, ...(Array.isArray(s.photos) ? s.photos : [])].filter(Boolean) as string[];
  return candidates[0];
};

export default function ItinerarySharePage() {
  const router = useRouter();
  const params = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DecodedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true); // ✅ visible por defecto
  const [copied, setCopied] = useState(false);

  // Header fijo: medimos su alto para dejar un "spacer" y evitar solapamiento
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState<number>(80);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderH(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Decodificar ?d=... (offline)
  const decodedFromD = useMemo<DecodedData | null>(() => {
    try {
      const d = params.get("d");
      if (!d) return null;
      const raw = LZString.decompressFromEncodedURIComponent(d);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.itinerary || !Array.isArray(parsed.itinerary)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [params]);

  // Cargar datos: 1) d=...  2) shortId=...
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      if (decodedFromD) {
        setData(decodedFromD);
        setLoading(false);
        return;
      }

      const shortId = params.get("shortId");
      if (shortId) {
        try {
          const res = await fetch(`/api/itinerary/${encodeURIComponent(shortId)}`, { cache: "no-store" });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || "No fue posible cargar el itinerario");
          }
          const json = await res.json();
          const itinerary: Stop[] = (json.stops || json.itinerary || []).map((s: Stop) => ({
            ...s,
            imageUrl: resolveImageUrl(s) || s.imageUrl || s.imagePath || s.image,
          }));
          setData({
            itinerary,
            days: json.days ?? json.profile?.days ?? (json.meta?.days ?? undefined),
          });
          setLoading(false);
          return;
        } catch (e: any) {
          setError(e?.message || "No fue posible cargar el itinerario");
          setLoading(false);
          return;
        }
      }

      setError("Enlace inválido");
      setLoading(false);
    })();
  }, [decodedFromD, params]);

  const days = data?.days ?? 1;
  const daysLabel = days === 0 ? "Modo exploración" : `${days} día${days > 1 ? "s" : ""}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("No se pudo copiar el enlace.");
    }
  }, []);

  // ---- UI ----
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6 text-gray-500">
          <ArrowLeft className="w-5 h-5 cursor-pointer hover:text-gray-700" onClick={() => router.push("/")} />
          <span>Cargando itinerario…</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="h-4 w-80 rounded bg-gray-200 animate-pulse mb-6" />
          <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700 mb-2">
            {error || "Enlace inválido"}
          </h1>
          <p className="text-sm text-red-700/80">
            Verifica el link o crea tu propio itinerario.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2.5 rounded-full bg-gray-900 text-white hover:bg-black transition"
            >
              Volver al inicio
            </button>
            <button
              onClick={() => router.push("/planner")}
              className="px-4 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              Crear mi itinerario
            </button>
          </div>
        </div>
      </main>
    );
  }

  const itinerary: Stop[] =
    (data.itinerary || []).map((s) => ({
      ...s,
      imageUrl: resolveImageUrl(s) || s.imageUrl,
    })) || [];

  return (
    <main className="relative">
      {/* ===== Header FIJO debajo del navbar ===== */}
      <div
        ref={headerRef}
        className="fixed left-0 right-0 z-30"
        style={{ top: "var(--navbar-height, 80px)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-4 sm:px-6 py-3 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/planner")}
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800"
                title="Volver a planificar"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Planificar de nuevo</span>
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Tu itinerario
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs sm:text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> {daysLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5" /> {itinerary.length} lugares
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMap((v) => !v)}
                className={`p-2 rounded-lg border transition ${
                  showMap ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-600"
                }`}
                title="Ver mapa"
              >
                <Map className="w-5 h-5" />
              </button>

              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
                title="Copiar enlace"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar enlace"}
              </button>

              <button
                onClick={() => router.push("/")}
                className="hidden sm:inline-flex items-center rounded-lg bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black transition"
              >
                Inicio
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spacer para que el contenido no quede debajo del header fijo */}
      <div style={{ height: headerH + 16 }} />

      {/* ===== Contenido ===== */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Mapa (✅ visible por defecto) */}
        <AnimatePresence initial={false}>
          {showMap && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "20rem", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden rounded-2xl border border-gray-200 shadow"
            >
              <div className="h-80">
                <ItineraryMap
                  stops={itinerary as any}
                  userLocation={null}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline (misma UI/UX que tu Full View) */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <MultiDayItinerary
              itinerary={itinerary as any}
              onItineraryUpdate={() => {}}
              days={days || 1}
              userLocation={null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
