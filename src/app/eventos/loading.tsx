import { SkeletonHero, SkeletonGrid } from "@/components/loading/SkeletonCard";

/**
 * Loading state para /eventos
 */
export default function EventosLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050a14' }}>
      {/* Hero skeleton */}
      <div className="relative" style={{ height: 'clamp(400px, 55vh, 600px)' }}>
        <SkeletonHero />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Title */}
        <div className="mb-8 space-y-4">
          <div className="h-12 bg-white/5 rounded w-64 animate-pulse">
            <div className="h-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer rounded" />
          </div>
        </div>

        {/* Event cards skeleton */}
        <div className="flex gap-5 overflow-hidden pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
            >
              <div className="relative aspect-[3/4] rounded-2xl bg-white/5 animate-pulse overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
