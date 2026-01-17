"use client";
export const dynamic = "force-dynamic";

import dynamicLoad from "next/dynamic";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";

/* Carga del componente cliente sin SSR */
const DestinationsClient = dynamicLoad(
  () => import("./DestinationsClient.jsx"),
  { 
    ssr: false,
    loading: () => <DestinationsLoadingSkeleton />,
  },
);

// =============================================================================
// Loading Skeleton
// =============================================================================
function DestinationsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Skeleton */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: '#0f0f1a',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
          <div className="animate-pulse">
            {/* Back link skeleton */}
            <div className="h-4 w-16 rounded bg-white/10 mb-12" />
            
            {/* Badge skeleton */}
            <div className="h-10 w-56 rounded-full bg-white/10 mb-8" />
            
            {/* Title skeleton */}
            <div className="h-16 w-96 max-w-full rounded-xl bg-white/10 mb-6" />
            
            {/* Description skeleton */}
            <div className="space-y-3 mb-12">
              <div className="h-5 w-full max-w-2xl rounded bg-white/10" />
              <div className="h-5 w-3/4 max-w-xl rounded bg-white/10" />
            </div>
            
            {/* Stats skeleton */}
            <div className="flex gap-10">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-10 w-16 rounded bg-white/10 mb-2" />
                  <div className="h-4 w-20 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-4 animate-pulse">
            {/* Search skeleton */}
            <div className="h-12 flex-1 max-w-md rounded-xl bg-slate-100" />
            
            {/* Filter chips skeleton */}
            <div className="hidden lg:flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-10 rounded-full bg-slate-100"
                  style={{ width: `${90 + Math.random() * 30}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Featured skeleton */}
        <div className="mb-16 animate-pulse">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="h-6 w-40 rounded bg-slate-200" />
          </div>
          <div className="rounded-3xl bg-slate-200 h-[420px]" />
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5">
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function DestinationsPage() {
  return (
    <>
      <main>
        <DestinationsClient />
      </main>
      <InstagramFeed />
      <Footer />
    </>
  );
}