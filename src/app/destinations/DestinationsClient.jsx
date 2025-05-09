"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Compass,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  "Todos",
  "Spots Instagrameables",
  "Playas",
  "Historia",
  "Artesanías",
  "EcoTurismo",
  "Gastronomía",
  "Cultura",
];

const ITEMS_PER_PAGE = 10;

export default function DestinationsClient() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get("category") || "Todos";

  /* -------------- state -------------- */
  const [allItems, setAllItems] = useState([]);    // destinos + experiencias
  const [visible, setVisible] = useState(ITEMS_PER_PAGE);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(paramCategory);
  const [activeFilters, setActiveFilters] = useState(0);

  const inputRef = useRef(null);

  /* -------------- fetch Firestore -------------- */
  useEffect(() => {
    async function fetchCol(col, kind) {
      const snap = await getDocs(collection(db, col));
      return Promise.all(
        snap.docs.map(async (doc) => {
          const d = doc.data();

          const cats = Array.isArray(d.categories)
            ? d.categories
            : d.categories
            ? [d.categories]
            : [];

          const raw =
            (Array.isArray(d.imagePaths) && d.imagePaths[0]) ||
            d.imagePath ||
            "";
          let img = "/placeholder-destination.jpg";
          if (raw.startsWith("http")) img = raw;
          else if (raw) {
            try {
              img = await getDownloadURL(ref(storage, raw));
            } catch {
              console.warn("No image in Storage:", raw);
            }
          }

          return {
            kind,                 // "destino" | "experiencia"
            id: doc.id,
            name: d.name,
            description: d.description ?? "",
            tagline: d.tagline ?? "",
            address: d.address ?? "",
            openingTime: d.openingTime ?? "",
            categories: cats,
            image: img,
          };
        }),
      );
    }

    async function fetchAll() {
      try {
        const [dest, exp] = await Promise.all([
          fetchCol("destinations", "destino"),
          fetchCol("experiences", "experiencia"),
        ]);
        setAllItems([...dest, ...exp]);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    }
    fetchAll();
  }, []);

  /* -------------- filters & badge -------------- */
  useEffect(() => {
    let n = 0;
    if (search.trim()) n++;
    if (category !== "Todos") n++;
    setActiveFilters(n);
    setVisible(ITEMS_PER_PAGE);
  }, [search, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("Todos");
    inputRef.current?.focus();
  };

  const filtered = allItems.filter((it) => {
    const okCat = category === "Todos" || it.categories.includes(category);
    const text =
      (it.name + it.description + it.tagline).toLowerCase();
    const okSearch = text.includes(search.toLowerCase());
    return okCat && okSearch;
  });

  const itemsToShow = filtered.slice(0, visible);
  const loadMore = useCallback(
    () => setVisible((v) => v + ITEMS_PER_PAGE),
    [],
  );

  /* -------------- UI -------------- */
  return (
    <>
      {/* Buscador */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar destinos o experiencias..."
              className="w-full border rounded-xl py-3 pl-10 pr-4"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl py-2.5 px-4 bg-gray-100 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="text-red-600 underline text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {itemsToShow.length === 0 ? (
          <p className="text-center text-lg text-gray-500">
            No se encontraron resultados.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {itemsToShow.map((it, i) => (
              <motion.div
                key={`${it.kind}-${it.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group overflow-hidden rounded-2xl shadow-lg bg-white hover:-translate-y-1 transition"
              >
                <Link
                  href={
                    it.kind === "destino"
                      ? `/destinations/${it.id}`
                      : `/experiencias/${it.id}`
                  }
                >
                  <div className="relative h-56">
                    <Image
                      src={it.image}
                      alt={it.name}
                      fill
                      sizes="(max-width:768px)100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Compass size={12} />
                      {it.kind === "destino" ? "Destino" : "Experiencia"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1">{it.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {it.tagline || it.description.substring(0, 120)}
                    </p>

                    {it.address && (
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {it.address}
                      </div>
                    )}
                    {it.openingTime && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {it.openingTime}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {visible < filtered.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-primary text-white rounded-xl"
            >
              Ver más
            </button>
          </div>
        )}
      </section>
    </>
  );
}
