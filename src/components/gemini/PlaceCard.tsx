// placecard.tsx
import Image from "next/image";
import { MapPin, Star, Navigation, Award } from "lucide-react";
import { useState, useCallback } from "react";
import type { Place } from "@/types/geminiChat";

interface PlaceCardProps {
    place: Place;
    isMobile?: boolean;
    isDark?: boolean;
    fontSize: FontSize;
}

type FontSize = "text-sm" | "text-base" | "text-lg";

const PLACEHOLDER = "/placeholder-place.jpg";

export function PlaceCard({ place, isMobile, isDark, fontSize }: PlaceCardProps) {
    const [imageError, setImageError] = useState(false);
    const imageUrl = !imageError && place.photo ? place.photo : PLACEHOLDER;
    const external = imageUrl.startsWith("http");

    const hasRating = typeof place.rating === "number" && place.rating > 0;
    const hasPrice = place.price_level && place.price_level > 0;
    const priceStr = "$".repeat(Math.min(place.price_level ?? 0, 4));

    const ratingColor =
        place.rating! >= 4.5
            ? "text-green-700 bg-green-50 border-green-200"
            : place.rating! >= 4.0
                ? "text-green-600 bg-green-50 border-green-200"
                : place.rating! >= 3.5
                    ? "text-yellow-700 bg-yellow-50 border-yellow-200"
                    : "text-orange-700 bg-orange-50 border-orange-200";

    const openMap = useCallback(() => {
        window.open(
            `https://www.google.com/maps/search/${encodeURIComponent(
                `${place.name} ${place.address || "Atlántico Colombia"}`
            )}`,
            "_blank"
        );
    }, [place.name, place.address]);

    return (
        <div className={`group snap-start shrink-0 ${isMobile ? 'w-full' : 'w-[260px] md:w-[300px]'} rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-white'} shadow-sm hover:shadow-lg transition duration-300 border border-gray-200 hover:border-gray-300 overflow-hidden`}>
            <div className="relative h-[150px] md:h-[170px] w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={place.name}
                    fill
                    unoptimized={external}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {hasRating && (
                    <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${ratingColor}`}
                    >
                        <div className="flex items-center gap-1">
                            <Star size={12} fill="currentColor" />
                            <span>{place.rating!.toFixed(1)}</span>
                        </div>
                    </div>
                )}

                {hasPrice && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700 border border-gray-200">
                        {priceStr}
                    </div>
                )}

                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full" style={{ backgroundColor: '#E40E20' }}>
                    <Award size={10} className="text-white" />
                    <span className="text-white" style={{ fontFamily: 'Poppins', fontSize: '10px' }}>Recomendado</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-base font-bold line-clamp-2 font-poppins" style={{ color: '#4A4F55', fontFamily: 'Poppins' }}>{place.name}</h3>

                {place.category && <p className={`mt-0.5 ${fontSize} font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Merriweather Sans' }}>{place.category}</p>}

                {place.description && (
                    <p className={`mt-2 ${fontSize} line-clamp-2 font-merriweather-sans ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Merriweather Sans' }}>
                        {place.description}
                    </p>
                )}

                {place.local_tip && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-medium font-merriweather-sans" style={{ color: '#7A888C', fontFamily: 'Merriweather Sans' }}>
                            💡 Tip local: {place.local_tip}
                        </p>
                    </div>
                )}

                {place.address && (
                    <p className={`mt-3 text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Merriweather Sans' }}>
                        <MapPin size={12} className="text-gray-500" />
                        {place.address}
                    </p>
                )}

                <button
                    onClick={openMap}
                    className="mt-4 w-full text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                    style={{ backgroundColor: '#E40E20', fontFamily: 'Poppins' }}
                >
                    <Navigation size={14} />
                    Cómo llegar
                </button>
            </div>
        </div>
    );
}