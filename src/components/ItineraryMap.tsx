// File: src/components/ItineraryMap.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { Feature, LineString, GeoJsonProperties } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface ItineraryStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
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

    // initialize map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: userLocation
        ? [userLocation.lng, userLocation.lat]
        : stops.length
        ? [stops[0].lng, stops[0].lat]
        : [-74.9, 10.9],
      zoom: 11,
    });
    mapRef.current = map;

    map.on("load", () => {
      // draw route line
      if (stops.length > 1) {
        const coords: [number, number][] = stops.map((s) => [s.lng, s.lat]);
        const routeGeoJSON: Feature<LineString, GeoJsonProperties> = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        };
        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
        } else {
          map.addSource("route", { type: "geojson", data: routeGeoJSON });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#0065FF", "line-width": 4 },
          });
        }
      }

      // add stop markers
      stops.forEach((stop) => {
        const color = stop.type === "experience" ? "#10B981" : "#0065FF";
        const emoji = stop.type === "experience" ? "🎉" : "📍";
        const el = document.createElement("div");
        el.className = "marker";
        Object.assign(el.style, {
          backgroundColor: color,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          border: "2px solid white",
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

      // add user-location marker
      if (userLocation) {
        const userEl = document.createElement("div");
        Object.assign(userEl.style, {
          backgroundColor: "#FF5A5F",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          border: "2px solid white",
        });
        new mapboxgl.Marker(userEl)
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Tú estás aquí"))
          .addTo(map);
      }

      // adjust bounds
      const allCoords = [
        ...(userLocation ? [[userLocation.lng, userLocation.lat]] : []),
        ...stops.map((s) => [s.lng, s.lat]),
      ] as [number, number][];
      if (allCoords.length) {
        const bounds = allCoords.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
        );
        map.fitBounds(bounds, { padding: 50 });
      }
    });

    return () => {
      map.remove();
    };
  }, [stops, userLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg shadow-lg overflow-hidden"
    />
  );
}
