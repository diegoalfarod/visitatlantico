// src/app/destinations/DestinationsClient.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";

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

  const [allDestinations, setAllDestinations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(paramCategory);
  const [activeFilters, setActiveFilters] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (paramCategory && CATEGORIES.includes(paramCategory)) {
      setCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const snap = await getDocs(collection(db, "destinations"));
        const data = await Promise.all(
          snap.docs.map(async (doc) => {
            const d = doc.data();
            const cats = Array.isArray(d.categories)
              ? d.categories
              : typeof d.categories === "string"
              ? [d.categories]
              : [];
            const rawPath = d.imagePath || "";
            const normalizedPath = rawPath.replace(/^\/\/+/, "");
            let imageUrl = "/placeholder-destination.jpg";
            if (normalizedPath) {
              try {
                imageUrl = await getDownloadURL(ref(storage, normalizedPath));
              } catch {
                /* fallback */
              }
            }
            return {
              id: doc.id,
              name: d.name,
              description: d.description,
              address: d.address,
              categories: cats,
              image: imageUrl,
              openingTime: d.openingTime,
              tagline: d.tagline,
            };
          })
        );
        setAllDestinations(data);
      } catch (err) {
        console.error("Error cargando destinos:", err);
      }
    }
    fetchDestinations();
  }, []);

  useEffect(() => {
    let cnt = 0;
    if (search.trim()) cnt++;
    if (category !== "Todos") cnt++;
    setActiveFilters(cnt);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search, category]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("Todos");
    searchInputRef.current?.focus();
  };

  const filtered = allDestinations.filter((dest) => {
    const okCat = category === "Todos" || dest.categories.includes(category);
    const okSearch =
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(search.toLowerCase());
    return okCat && okSearch;
  });

  const visibleItems = filtered.slice(0, visibleCount);
  const loadMore = useCallback(
    () => setVisibleCount((prev) => prev + ITEMS_PER_PAGE),
    []
  );

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/destinations-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-10" />
        <div className="relative z-20 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md"
          >
            Descubre el Atlántico
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-white/90"
          >
            Explora destinos mágicos y únicos que no sabías que existían
          </motion.p>
        </div>
      </section>

      {/* Filtros */}
      <section className="relative z-30 max-w-7xl mx-auto px-6 -mt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white dark:bg-gray-900/90 p-8 shadow-xl border border-white/30 backdrop-blur"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar destinos..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 py-3 pl-10 pr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-3">
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {activeFilters > 0 && (
                <button onClick={handleClearFilters} className="text-red-600 hover:underline text-sm">
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grid de destinos */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {visibleItems.length === 0 ? (
            <p className="text-center text-lg col-span-full text-gray-500 dark:text-gray-400">
              No se encontraron destinos con esos criterios.
            </p>
          ) : (
            visibleItems.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 border border-white/20 hover:-translate-y-1 transition transform"
              >
                <Link href={`/destinations/${dest.id}`}>
                  <div className="relative h-56">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!!dest.categories.length && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {dest.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-full shadow"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {dest.tagline || dest.description.substring(0, 120)}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{dest.address}</span>
                    </div>
                    {dest.openingTime && (
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{dest.openingTime}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
        {visibleCount < filtered.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Ver más
            </button>
          </div>
        )}
      </section>

      <InstagramFeed />
      <Footer />
    </>
  );
}
