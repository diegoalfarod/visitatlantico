"use client";

/**
 * Skeleton components para estados de carga
 *
 * Uso:
 * - SkeletonCard: Para DestinationCard, EventCard, etc.
 * - SkeletonHero: Para secciones hero
 * - SkeletonList: Para listas de items
 */

// =============================================================================
// SKELETON CARD - Para cards de destinos, eventos, rutas
// =============================================================================
export function SkeletonCard() {
  return (
    <div className="block rounded-2xl shadow-md overflow-hidden bg-white">
      {/* Image skeleton */}
      <div className="relative w-full h-48 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4">
          <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full">
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3">
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SKELETON HERO - Para secciones hero grandes
// =============================================================================
export function SkeletonHero() {
  return (
    <div className="relative w-full aspect-[16/9] bg-gray-200 animate-pulse overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-6 max-w-2xl px-8">
          {/* Title */}
          <div className="h-12 bg-white/20 rounded w-3/4 mx-auto" />
          <div className="h-12 bg-white/20 rounded w-2/3 mx-auto" />

          {/* Subtitle */}
          <div className="h-6 bg-white/20 rounded w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SKELETON LIST - Para listas de eventos, destinos
// =============================================================================
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 p-4 bg-white rounded-xl shadow-sm animate-pulse"
        >
          {/* Image */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-2/3">
              <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full">
              <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2">
              <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SKELETON GRID - Para grids de cards
// =============================================================================
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// =============================================================================
// SKELETON TEXT - Para bloques de texto
// =============================================================================
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        >
          <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SKELETON BUTTON - Para botones
// =============================================================================
export function SkeletonButton() {
  return (
    <div className="h-12 bg-gray-200 rounded-full animate-pulse w-40">
      <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded-full" />
    </div>
  );
}
