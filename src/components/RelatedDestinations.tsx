// src/components/RelatedDestinations.tsx

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import { MapPin } from "lucide-react";

interface Props {
  category: string;
  currentId: string;
}

interface FirestoreDest {
  name: string;
  tagline?: string;
  description: string;
  address: string;
  categories?: string[] | string;
  imagePath?: string;
}

interface Destination {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  address: string;
  image: string;
}

export default function RelatedDestinations({ category, currentId }: Props) {
  const [items, setItems] = useState<Destination[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const snap: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "destinations")
        );

        const all = await Promise.all(
          snap.docs.map(async (doc) => {
            const d = doc.data() as FirestoreDest;

            // normalize categories into array
            const cats: string[] = Array.isArray(d.categories)
              ? d.categories
              : typeof d.categories === "string"
              ? [d.categories]
              : [];

            // skip if not same category or is current
            if (!cats.includes(category) || doc.id === currentId) return null;

            // fetch image URL
            const raw = d.imagePath ?? "";
            const norm = raw.replace(/^\/+/, "");
            let url = "";
            if (norm) {
              try {
                url = await getDownloadURL(ref(storage, norm));
              } catch {
                console.error("Error loading image for", doc.id);
              }
            }

            return {
              id: doc.id,
              name: d.name,
              tagline: d.tagline,
              description: d.description,
              address: d.address,
              image: url || "/placeholder-destination.jpg",
            } as Destination;
          })
        );

        // filter out null and take first 4
        const related = all.filter((x): x is Destination => x !== null);
        setItems(related.slice(0, 4));
      } catch (err) {
        console.error("Error loading related destinations:", err);
      }
    }

    if (category) {
      fetchRelated();
    }
  }, [category, currentId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Destinos similares
        </h2>
        <Link
          href="/destinations"
          className="text-primary hover:underline text-sm font-medium"
        >
          Ver todos los destinos
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((dest) => (
          <div
            key={dest.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/destinations/${dest.id}`}>  
              <div className="relative aspect-video">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {dest.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 inline" /> {dest.address}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
