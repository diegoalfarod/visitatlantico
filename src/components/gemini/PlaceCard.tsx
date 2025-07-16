import Image from "next/image";
import { MapPin, Star, Navigation, Award } from "lucide-react";
import { useState } from "react";
import type { Place } from "@/types/geminiChat";

const PLACEHOLDER = "/placeholder-place.jpg";

export function PlaceCard({ place }: { place: Place }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = !imageError && place.photo ? place.photo : PLACEHOLDER;
  const external = imageUrl.startsWith("http");

  /* -------- helpers -------- */
  const hasRating = typeof place.rating === "number" && place.rating > 0;
  const hasPrice = place.price_level && place.price_level > 0;
  const getPriceDisplay = (l: number) => "$".repeat(Math.min(l, 4));
  const getRatingColor = (r: number) => {
    if (r >= 4.5) return "text-green-700 bg-green-50 border-green-200";
    if (r >= 4.0) return "text-green-600 bg-green-50 border-green-200";
    if (r >= 3.5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-orange-700 bg-orange-50 border-orange-200";
  };
  const openDirections = () =>
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(
        `${place.name} ${place.address || "Atlántico Colombia"}`
      )}`,
      "_blank"
    );

  return (
    <div className="group snap-start w-[280px] md:w-[320px] shrink-0 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 overflow-hidden">
      {/* Header Image */}
      <div className="relative h-[160px] md:h-[180px] w-full overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={place.name}
          fill
          unoptimized={external} // evita la optimización para enlaces externos
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* rating */}
        {hasRating && (
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${getRatingColor(
              place.rating!
            )}`}
          >
            <div className="flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              <span>{place.rating!.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* price */}
        {hasPrice && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700 border border-gray-200">
            {getPriceDisplay(place.price_level!)}
          </div>
        )}

        {/* badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-red-600 text-xs font-medium flex items-center gap-1">
          <Award size={10} className="text-white" />
          <span className="text-white">Recomendado</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors duration-200 font-poppins">
          {place.name}
        </h3>

        {place.category && (
          <p className="mt-1 text-xs text-gray-600 font-medium font-poppins">
            {place.category}
          </p>
        )}

        {place.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 font-merriweather-sans">
            {place.description}
          </p>
        )}

        {place.local_tip && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium font-merriweather-sans">
              💡 Tip local: {place.local_tip}
            </p>
          </div>
        )}

        {place.address && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-1 flex items-center gap-1 font-merriweather-sans">
            <MapPin size={12} className="flex-shrink-0 text-gray-500" />
            {place.address}
          </p>
        )}

        <button
          onClick={openDirections}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 font-poppins"
        >
          <Navigation size={14} />
          <span>Cómo llegar</span>
        </button>
      </div>
    </div>
  );
}
