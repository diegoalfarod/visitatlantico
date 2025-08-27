export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ShareClient from "./share-client";

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-6 text-gray-500">
            <span className="inline-block w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
            <span>Cargando itinerario…</span>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-6 w-48 rounded bg-gray-200 animate-pulse mb-4" />
            <div className="h-4 w-80 rounded bg-gray-200 animate-pulse mb-6" />
            <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </main>
      }
    >
      <ShareClient />
    </Suspense>
  );
}
