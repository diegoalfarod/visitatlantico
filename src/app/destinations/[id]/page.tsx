// src/app/destinations/[id]/page.tsx

import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Camera,
  Clock,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

// Generate dynamic metadata per destination
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const snap = await getDoc(doc(db, "destinations", id));
  if (!snap.exists()) {
    return { title: "Destino no encontrado - VisitAtlántico" };
  }
  const d = snap.data();
  const title = `${d.name} – VisitAtlántico`;
  const description = d.tagline || d.description?.slice(0, 150) || "Explora este destino en Atlántico, Colombia.";
  let imageUrl = "";
  if (d.imagePath) {
    try {
      imageUrl = await getDownloadURL(ref(storage, d.imagePath.replace(/^\/+/, "")));
    } catch {}
  }
  const url = `https://visitatlantico.com/destinations/${id}`;

  return {
    title,
    description,
    metadataBase: new URL("https://visitatlantico.com"),
    alternates: {
      canonical: url,
      languages: {
        es: url,
        en: `https://en.visitatlantico.com/destinations/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "VisitAtlántico",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: d.name }]
        : [],
      locale: "es_CO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function DestinationDetail({ params }: PageProps) {
  const { id } = params;

  const snap = await getDoc(doc(db, "destinations", id));
  if (!snap.exists()) {
    notFound();
    return null;
  }
  const d = snap.data();

  let imageUrl = "";
  if (d.imagePath) {
    try {
      imageUrl = await getDownloadURL(ref(storage, d.imagePath.replace(/^\/+/, "")));
    } catch (e) {
      console.error("Error obteniendo imagen:", e);
    }
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    d.address
  )}`;

  return (
    <>
      {/* JSON-LD Structured Data for TouristDestination */}
      <Script
        id="ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: d.name,
            description: d.description,
            image: imageUrl,
            address: d.address,
            url: `https://visitatlantico.com/destinations/${id}`,
          }),
        }}
      />

      <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        {/* Hero */}
        <div className="relative h-[70vh] w-full overflow-hidden">
          {imageUrl ? (
            <>
              <div className="absolute inset-0 bg-black/30 z-10" />
              <Image
                src={imageUrl}
                alt={d.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600" />
          )}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 text-white">
            <div className="max-w-5xl mx-auto">
              {d.categories?.[0] && (
                <span className="bg-primary/80 px-3 py-1 rounded-full text-xs font-medium">
                  {d.categories[0]}
                </span>
              )}
              <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-2">
                {d.name}
              </h1>
              <p className="text-xl md:text-2xl font-light max-w-2xl text-gray-100">
                {d.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-2">
              <Link href="/destinations" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors px-3 py-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Destinos
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {d.name}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold">Sobre este lugar</h2>
                </header>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {d.description}
                  </p>
                </div>
              </section>

              {/* Gallery */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Fotos y videos</h2>
                  <button className="text-primary hover:underline text-sm font-medium flex items-center">
                    <Camera className="w-4 h-4 mr-1" /> Ver galería completa
                  </button>
                </header>
                <div className="p-6">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={d.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-gray-400">
                        Video del lugar (próximamente)
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-36 p-6">
                <h2 className="text-xl font-bold mb-4">Información</h2>
                <InfoRow icon={<MapPin className="w-5 h-5 text-primary" />}>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-primary hover:underline">
                    {d.address}
                  </a>
                </InfoRow>
                <InfoRow icon={<Clock className="w-5 h-5 text-primary" />}>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="text-base font-medium">
                    {d.openingTime || "Todos los días, 9:00 – 18:00"}
                  </p>
                </InfoRow>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-6 w-full py-3 bg-primary text-white text-center rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Cómo llegar
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 flex items-start gap-4 border-b last:border-none border-gray-100 dark:border-gray-700">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
