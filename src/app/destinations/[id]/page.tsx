// src/app/destinations/[id]/page.tsx

import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
  Navigation,
  Clock,
  Tag,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationActions from "@/components/DestinationActions";
import RelatedDestinations from "@/components/RelatedDestinations";

interface Props {
  params: { id: string };
}

export default async function DestinationDetail({ params }: Props) {
  const { id } = params;
  const snap = await getDoc(doc(db, "destinations", id));
  if (!snap.exists()) notFound();

  const d = snap.data();
  const rawPath = d.imagePath ?? "";
  const normalized = rawPath.replace(/^\/+/, "");
  let imageUrl = "";
  if (normalized) {
    try {
      imageUrl = await getDownloadURL(ref(storage, normalized));
    } catch (e) {
      console.error("Error cargando imagen:", e);
    }
  }

  const categoriesList = Array.isArray(d.categories)
    ? d.categories.join(", ")
    : d.categories ?? "";

  const firstCategory = Array.isArray(d.categories)
    ? d.categories[0]
    : typeof d.categories === "string"
    ? d.categories
    : "";

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    d.address
  )}`;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
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
              quality={90}
              unoptimized
            />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600" />
        )}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 text-white">
          <div className="max-w-5xl mx-auto w-full">
            {firstCategory && (
              <span className="bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                {firstCategory}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-white mt-4 mb-2">
              {d.name}
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-2xl text-gray-100">
              {d.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link
              href="/destinations"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-1"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Destinos
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
              {d.name}
            </span>
          </div>
          <div className="flex gap-1">
            <DestinationActions name={d.name} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sobre este lugar
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {d.description}
                  </p>
                </div>
              </section>

              {/* Media Section */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Fotos y videos
                  </h2>
                  <button className="text-primary hover:underline text-sm font-medium flex items-center">
                    <Camera className="w-4 h-4 mr-1" /> Ver galería completa
                  </button>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={d.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>Video del lugar (próximamente)</span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white dark:hover:bg-black transition-colors">
                        <svg
                          className="w-8 h-8 text-primary"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={`Gallery image ${i}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Imagen {i}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column Info Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-36">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Información
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dirección
                      </p>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-primary hover:underline"
                      >
                        {d.address}
                      </a>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Horario
                      </p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {d.openingTime || "Todos los días, 9:00 - 18:00"}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Teléfono
                      </p>
                      <a
                        href={`tel:${d.phone}`}
                        className="text-base font-medium text-gray-900 dark:text-white"
                      >
                        {d.phone}
                      </a>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <a
                        href={`mailto:${d.email}`}
                        className="text-base font-medium text-primary hover:underline"
                      >
                        {d.email}
                      </a>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sitio Web
                      </p>
                      <a
                        href={d.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-primary hover:underline"
                      >
                        {d.website}
                      </a>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Categorías
                      </p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {categoriesList}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Navigation className="w-4 h-4 inline-block mr-2" /> Cómo llegar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Destinations */}
        <RelatedDestinations category={firstCategory} currentId={id} />
      </main>

      <Footer />
    </div>
  );
}
