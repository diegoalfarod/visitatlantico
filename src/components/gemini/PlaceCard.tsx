// PlaceCard.tsx
import Image from "next/image";
import { MapPin, Star, Navigation, Award, Clock, Phone, Globe, Heart } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import type { Place } from "@/types/geminiChat";

interface PlaceCardProps {
    place: Place;
    isMobile?: boolean;
    isDark?: boolean;
    fontSize: FontSize;
}

type FontSize = "text-sm" | "text-base" | "text-lg";

const PLACEHOLDER = "/placeholder-place.jpg";

// Haptic feedback
const hapticFeedback = () => {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
};

export function PlaceCard({ place, isMobile, isDark, fontSize }: PlaceCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    
    const imageUrl = !imageError && place.photo ? place.photo : PLACEHOLDER;
    const external = imageUrl.startsWith("http");

    const hasRating = typeof place.rating === "number" && place.rating > 0;
    const hasPrice = place.price_level && place.price_level > 0;
    const priceStr = "$".repeat(Math.min(place.price_level ?? 0, 4));

    const ratingColor = place.rating! >= 4.5
        ? "text-green-700 bg-green-50 border-green-200"
        : place.rating! >= 4.0
            ? "text-green-600 bg-green-50 border-green-200"
            : place.rating! >= 3.5
                ? "text-yellow-700 bg-yellow-50 border-yellow-200"
                : "text-orange-700 bg-orange-50 border-orange-200";

    const openMap = useCallback(() => {
        hapticFeedback();
        window.open(
            `https://www.google.com/maps/search/${encodeURIComponent(
                `${place.name} ${place.address || "Atlántico Colombia"}`
            )}`,
            "_blank"
        );
    }, [place.name, place.address]);

    const toggleFavorite = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        hapticFeedback();
        setIsFavorite(!isFavorite);
    }, [isFavorite]);

    const handleShare = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        hapticFeedback();
        
        if (navigator.share && isMobile) {
            try {
                await navigator.share({
                    title: place.name,
                    text: place.description || `Visita ${place.name} en Atlántico`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    }, [place, isMobile]);

    // Auto-collapse cuando se hace scroll
    useEffect(() => {
        if (!isExpanded) return;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    setIsExpanded(false);
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [isExpanded]);

    return (
        <div 
            ref={cardRef}
            className={`
                group snap-center shrink-0 transition-all duration-300
                ${isMobile ? 'w-[85vw] max-w-[340px]' : 'w-[280px] md:w-[320px]'}
                ${isExpanded ? 'scale-[1.02] shadow-2xl z-10' : ''}
            `}
            onClick={() => {
                if (isMobile) {
                    hapticFeedback();
                    setIsExpanded(!isExpanded);
                }
            }}
        >
            <div className={`
                relative rounded-2xl overflow-hidden
                ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} 
                shadow-lg hover:shadow-xl transition-all duration-300
                ${isMobile ? 'active:scale-[0.98]' : 'hover:scale-[1.02]'}
                border ${isDark ? 'border-gray-700' : 'border-gray-100'}
            `}>
                {/* Image container con aspect ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    
                    <Image
                        src={imageUrl}
                        alt={place.name}
                        fill
                        sizes="(max-width: 768px) 85vw, 320px"
                        unoptimized={external}
                        className={`object-cover transition-all duration-500 
                            ${imageLoading ? 'opacity-0' : 'opacity-100'}
                            ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}
                        onError={() => setImageError(true)}
                        onLoadingComplete={() => setImageLoading(false)}
                        priority={false}
                    />
                    
                    {/* Gradient overlay mejorado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            {hasRating && (
                                <div className={`
                                    px-3 py-1.5 rounded-full text-xs font-bold 
                                    backdrop-blur-md shadow-sm border ${ratingColor}
                                    animate-in fade-in duration-300
                                `}>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} fill="currentColor" />
                                        <span>{place.rating!.toFixed(1)}</span>
                                        {place.review_count && (
                                            <span className="text-[10px] opacity-80">
                                                ({place.review_count})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {hasPrice && (
                                <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md 
                                    text-xs font-bold text-gray-700 border border-white/50 shadow-sm">
                                    {priceStr}
                                </div>
                            )}
                        </div>

                        {/* Favorite button */}
                        <button
                            onClick={toggleFavorite}
                            className={`
                                h-10 w-10 rounded-full backdrop-blur-md shadow-sm
                                flex items-center justify-center transition-all
                                active:scale-95 ${isFavorite 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white/90 text-gray-700 hover:bg-white'
                                }
                            `}
                        >
                            <Heart 
                                size={18} 
                                fill={isFavorite ? "currentColor" : "none"}
                                className="transition-all duration-300"
                            />
                        </button>
                    </div>

                    {/* Bottom badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full 
                        bg-red-500/90 backdrop-blur-md shadow-sm flex items-center gap-1">
                        <Award size={12} className="text-white" />
                        <span className="text-white text-xs font-bold" style={{ fontFamily: 'Poppins' }}>
                            Recomendado
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-lg font-bold line-clamp-2 mb-1" 
                        style={{ color: isDark ? '#ffffff' : '#4A4F55', fontFamily: 'Poppins' }}>
                        {place.name}
                    </h3>

                    {place.category && (
                        <p className={`${fontSize} font-medium mb-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} style={{ fontFamily: 'Merriweather Sans' }}>
                            {place.category}
                        </p>
                    )}

                    {place.description && (
                        <p className={`
                            ${fontSize} ${isExpanded ? '' : 'line-clamp-2'} 
                            ${isDark ? 'text-gray-300' : 'text-gray-600'}
                            transition-all duration-300
                        `} style={{ fontFamily: 'Merriweather Sans' }}>
                            {place.description}
                        </p>
                    )}

                    {/* Expanded content */}
                    {isExpanded && (
                        <div className="mt-4 space-y-3 animate-in slide-in-from-bottom duration-300">
                            {place.hours && (
                                <div className="flex items-start gap-2 text-sm">
                                    <Clock size={16} className="text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Horario</p>
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            {place.hours}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {place.phone && (
                                <a 
                                    href={`tel:${place.phone}`}
                                    className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Phone size={16} className="text-gray-500" />
                                    <span>{place.phone}</span>
                                </a>
                            )}

                            {place.website && (
                                <a 
                                    href={place.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Globe size={16} className="text-gray-500" />
                                    <span>Sitio web</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Local tip con mejor diseño */}
                    {place.local_tip && (
                        <div className={`
                            mt-3 p-3 rounded-xl transition-all duration-300
                            ${isDark 
                                ? 'bg-yellow-900/20 border border-yellow-700/30' 
                                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                            }
                        `}>
                            <p className="text-xs font-medium flex items-start gap-1.5">
                                <span className="text-base">💡</span>
                                <span style={{ color: isDark ? '#fbbf24' : '#92400e', fontFamily: 'Merriweather Sans' }}>
                                    {place.local_tip}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Address */}
                    {place.address && (
                        <p className={`mt-3 text-xs flex items-start gap-1.5 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`} style={{ fontFamily: 'Merriweather Sans' }}>
                            <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{place.address}</span>
                        </p>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={openMap}
                            className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold 
                                flex items-center justify-center gap-1.5 shadow-sm
                                active:scale-95 transition-all duration-200"
                            style={{ backgroundColor: '#E40E20', fontFamily: 'Poppins' }}
                        >
                            <Navigation size={16} />
                            Cómo llegar
                        </button>
                        
                        {isMobile && (
                            <button
                                onClick={handleShare}
                                className={`
                                    px-4 py-2.5 rounded-xl text-sm font-bold
                                    flex items-center justify-center
                                    active:scale-95 transition-all duration-200
                                    ${isDark 
                                        ? 'bg-gray-700 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 15.938 18 15.482 18 15c0-.482.114-.938.316-1.342m0 2.684a3 3 0 110-2.684M4.684 9.342C4.886 8.938 5 8.482 5 8c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684" 
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}