/**
 * Loading state para /mapa
 */
export default function MapaLoading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      {/* Map skeleton */}
      <div className="absolute inset-0 bg-gray-100 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-shimmer" />

        {/* Marker placeholders */}
        <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-blue-200 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-blue-200 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-blue-200 rounded-full animate-pulse" />
      </div>

      {/* Loading indicator */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Cargando mapa...</p>
      </div>
    </div>
  );
}
