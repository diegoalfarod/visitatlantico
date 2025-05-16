// File: src/components/ItineraryMap.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { Feature, LineString, GeoJsonProperties } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface ItineraryStop {
  id: string;
  name: string;
  lat: number | string;
  lng: number | string;
  startTime: string;
  durationMinutes: number;
  description: string;
  type: "destination" | "experience";
}

interface Props {
  stops: ItineraryStop[];
  userLocation?: { lat: number; lng: number } | null;
}

export default function ItineraryMap({ stops, userLocation }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // ───── normalizar coordenadas de paradas (filtrar NaN) ─────
    const sanitizedStops = stops
      .map((s) => ({
        ...s,
        lat: Number(s.lat),
        lng: Number(s.lng),
      }))
      .filter((s) => !isNaN(s.lat) && !isNaN(s.lng));

    // centro inicial: userLocation ▸ primera parada ▸ fallback B/quilla
    const initialCenter: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : sanitizedStops.length
      ? [sanitizedStops[0].lng, sanitizedStops[0].lat]
      : [-74.9, 10.9]; // Barranquilla aprox.

    // ───── crear mapa ─────
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: initialCenter,
      zoom: 11,
    });
    mapRef.current = map;

    map.on("load", () => {
      /* ─────────── Línea de ruta ─────────── */
      if (sanitizedStops.length > 1) {
        const coords = sanitizedStops.map<[number, number]>((s) => [
          s.lng,
          s.lat,
        ]);

        const routeGeoJSON: Feature<LineString, GeoJsonProperties> = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        };

        map.addSource("route", { type: "geojson", data: routeGeoJSON });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#0065FF", "line-width": 4 },
        });
      }

      /* ─────────── Marcadores de paradas ─────────── */
      sanitizedStops.forEach((stop) => {
        const color = stop.type === "experience" ? "#10B981" : "#0065FF";
        const emoji = stop.type === "experience" ? "🎉" : "📍";

        const el = document.createElement("div");
        Object.assign(el.style, {
          backgroundColor: color,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "white",
        });
        el.textContent = emoji;

        new mapboxgl.Marker(el)
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${stop.name}</strong><br/>
               ${stop.startTime} — ${stop.durationMinutes} min<br/>
               ${stop.description}`
            )
          )
          .addTo(map);
      });

      /* ─────────── Marcador de ubicación del usuario ─────────── */
      if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
        const userEl = document.createElement("div");
        Object.assign(userEl.style, {
          backgroundColor: "#FF5A5F",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
        });

        new mapboxgl.Marker(userEl)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setText("Tú estás aquí")
          )
          .addTo(map);
      }

      /* ─────────── Ajustar límites del mapa ─────────── */
      const coords: [number, number][] = [
        ...(userLocation
          ? ([[userLocation.lng, userLocation.lat]] as [number, number][])
          : []),
        ...sanitizedStops.map<[number, number]>((s) => [s.lng, s.lat]),
      ];

      if (coords.length) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 50 });
      }
    });

    return () => map.remove();
  }, [stops, userLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg shadow-lg overflow-hidden"
    />
  );
}
