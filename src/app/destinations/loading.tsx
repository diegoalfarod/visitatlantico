import { SkeletonGrid } from "@/components/loading/SkeletonCard";

/**
 * Loading state para /destinations
 *
 * Next.js automáticamente muestra este componente
 * mientras la página principal se carga
 */
export default function DestinationsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="relative h-[40vh] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse">
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse">
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>
        </div>

        {/* Grid */}
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
