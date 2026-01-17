import { SkeletonGrid } from "@/components/loading/SkeletonCard";

/**
 * Loading state para /ruta23
 */
export default function Ruta23Loading() {
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Hero skeleton */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded w-3/4 animate-pulse">
                <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-full animate-pulse">
                <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse">
                <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-square rounded-3xl bg-gray-200 animate-pulse overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse">
            <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>
        </div>

        <SkeletonGrid count={9} />
      </div>
    </div>
  );
}
