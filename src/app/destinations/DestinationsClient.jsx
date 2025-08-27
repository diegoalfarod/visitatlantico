//src/app/destinations/destinationsClient.jsx

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  MapPin,
  Calendar,
  Leaf,
  Compass,
  Waves,
  Landmark,
  Trees,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/* ===== Config ===== */

const STATIC_ORDER = [
  "Todos",
  "EcoTurismo",
  "Playas",
  "Cultura",
  "Naturaleza",
  "Gastronomía",
  "Aventura",
  "Historia",
  "Familia",
  "Deportes",
  "Nocturna",
  "Bienestar",
  "Festivales",
  "Romántico",
  "Avistamiento",
  "Compras",
  "Fotografía",
  "Náutica",
  "Acuáticos",
  "Pesca",
  "Arte",
  "Spots Instagrameables",
  "Artesanías",
];

const ICON_BY_CATEGORY = {
  EcoTurismo: Leaf,
  Playas: Waves,
  Cultura: Landmark,
  Naturaleza: Trees,
  Todos: Compass,
};

const ITEMS_PER_PAGE = 12;
const INITIAL_VISIBLE_CHIPS = 5;
const STEP_VISIBLE_CHIPS = 5;

/* ===== Helpers ===== */
const parseFilterParam = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const serializeFilterParam = (arr) => (arr.length ? arr.join(",") : undefined);

/* ===== Component ===== */

export default function DestinationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lee ?filter=EcoTurismo,Playas si viene desde SustainabilityBanner u otra navegación
  const filtersFromUrl = parseFilterParam(searchParams.get("filter"));

  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]); // multi-select
  const [visible, setVisible] = useState(ITEMS_PER_PAGE);
  const [activeFilters, setActiveFilters] = useState(0);

  // chips: cuántos mostrar
  const [visibleChips, setVisibleChips] = useState(INITIAL_VISIBLE_CHIPS);

  const inputRef = useRef(null);

  /* ==== Offset para NavBar fijo ==== */
  const sectionStyle = {
    paddingTop: "calc(var(--navbar-height, 80px) + 16px)",
  };

  /* ==== Fetch Firestore (destinations + experiences) ==== */
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

          // imagen: URL directa o path de Storage
          const raw =
            (Array.isArray(d.imagePaths) && d.imagePaths[0]) ||
            d.imagePath ||
            "";
          let img = "/placeholder-destination.jpg";
          if (typeof raw === "string" && raw.startsWith("http")) {
            img = raw;
          } else if (raw) {
            try {
              img = await getDownloadURL(ref(storage, raw));
            } catch {
              console.warn("No image in Storage:", raw);
            }
          }

          return {
            kind, // "destino" | "experiencia"
            id: doc.id,
            name: d.name ?? "",
            description: d.description ?? "",
            tagline: d.tagline ?? "",
            address: d.address ?? "",
            openingTime: d.openingTime ?? "",
            categories: (cats || []).filter(Boolean),
            image: img,
          };
        })
      );
    }

    async function fetchAll() {
      try {
        const [dest, exp] = await Promise.all([
          fetchCol("destinations", "destino"),
          fetchCol("experiences", "experiencia"),
        ]);
        const merged = [...dest, ...exp].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" })
        );
        setAllItems(merged);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    }

    fetchAll();
  }, []);

  /* ==== Filtros iniciales desde URL (solo al montar) ==== */
  useEffect(() => {
    if (filtersFromUrl.length) {
      setSelectedCats(filtersFromUrl);
      // si hay más de 5 seleccionadas, aumentamos chips visibles para que se vean
      if (filtersFromUrl.length > INITIAL_VISIBLE_CHIPS) {
        setVisibleChips(Math.ceil(filtersFromUrl.length / STEP_VISIBLE_CHIPS) * STEP_VISIBLE_CHIPS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: solo 1 vez

  /* ==== Sincroniza URL cuando cambian los filtros ==== */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const serialized = serializeFilterParam(selectedCats);
    if (serialized) params.set("filter", serialized);
    else params.delete("filter");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCats, pathname, router, searchParams]);

  /* ==== Badge de nº de filtros activos y reset de paginación ==== */
  useEffect(() => {
    let n = 0;
    if (search.trim()) n++;
    if (selectedCats.length > 0) n++;
    setActiveFilters(n);
    setVisible(ITEMS_PER_PAGE); // reset paginación cuando cambien filtros/búsqueda
  }, [search, selectedCats]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCats([]);
    setVisibleChips(INITIAL_VISIBLE_CHIPS);
    inputRef.current?.focus();
  };

  /* ==== Construye lista de categorías dinámicamente (manteniendo orden predefinido) ==== */
  const dynamicCategories = useMemo(() => {
    const found = new Set();
    for (const it of allItems) {
      for (const c of it.categories || []) found.add(c);
    }
    // Mezcla orden estático + encontradas
    const combined = Array.from(new Set([...STATIC_ORDER, ...found]));
    // Asegura "Todos" primero
    if (combined[0] !== "Todos") {
      const idx = combined.indexOf("Todos");
      if (idx > -1) combined.splice(idx, 1);
      combined.unshift("Todos");
    }
    return combined;
  }, [allItems]);

  /* ==== Define chips visibles (siempre mostrando las seleccionadas) ==== */
  const chipsToShow = useMemo(() => {
    const base = dynamicCategories.slice(0, visibleChips);
    // Asegura que las seleccionadas (excepto "Todos") estén visibles
    const extraSelected = selectedCats.filter(
      (c) => c !== "Todos" && !base.includes(c)
    );
    return [...base, ...extraSelected];
  }, [dynamicCategories, visibleChips, selectedCats]);

  /* ==== Filtrado + búsqueda (multi-select OR) ==== */
  const filtered = useMemo(() => {
    const byFilter =
      selectedCats.length === 0
        ? allItems
        : allItems.filter((it) =>
            (it.categories || []).some((c) => selectedCats.includes(c))
          );

    const q = search.trim().toLowerCase();
    if (!q) return byFilter;

    return byFilter.filter((it) => {
      const text = `${it.name} ${it.description} ${it.tagline} ${it.address} ${(it.categories || []).join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [allItems, selectedCats, search]);

  const itemsToShow = useMemo(
    () => filtered.slice(0, visible),
    [filtered, visible]
  );

  const loadMore = useCallback(() => {
    setVisible((v) => v + ITEMS_PER_PAGE);
  }, []);

  /* ==== Toggle de chips ==== */
  const toggleChip = (cat) => {
    if (cat === "Todos") {
      // "Todos" limpia selección
      setSelectedCats([]);
      return;
    }
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  /* ===== UI ===== */
  return (
    <section className="relative w-full bg-white" style={sectionStyle}>
      {/* Encabezado + buscador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Descubre Atlántico
            </h1>
            <p className="text-gray-600 mt-1">
              Explora destinos y experiencias por categoría{" "}
              {activeFilters > 0 && (
                <span className="text-gray-500">
                  ({activeFilters} filtro{activeFilters > 1 ? "s" : ""} activo
                  {activeFilters > 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>

        {/* Buscador */}
          <div className="w-full md:w-[420px]">
            <label className="relative block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-400"
                placeholder="Buscar por nombre, municipio, categoría…"
              />
            </label>
          </div>
        </div>

        {/* Filtros (píldoras, multi-select) */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
           {/* Chip "Todos" */}
{(() => {
  const TodosIcon = ICON_BY_CATEGORY["Todos"] || Compass;
  const isActive = selectedCats.length === 0;

  return (
    <button
      onClick={() => toggleChip("Todos")}
      className={[
        "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm border transition-all",
        isActive
          ? "bg-green-600 text-white border-green-600 shadow-sm"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
      ].join(" ")}
    >
      <TodosIcon className="w-4 h-4" />
      Todos
    </button>
  );
})()}

            {chipsToShow
              .filter((c) => c !== "Todos")
              .map((cat) => {
                const active = selectedCats.includes(cat);
                const Icon = ICON_BY_CATEGORY[cat] || Compass;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleChip(cat)}
                    className={[
                      "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm border transition-all",
                      active
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                  </button>
                );
              })}
          </div>

          {/* Controles de chips (ver más / menos / solo 5 / limpiar) */}
          <div className="flex items-center gap-3 mt-3">
            {visibleChips < dynamicCategories.length && (
              <button
                onClick={() => setVisibleChips((n) => n + STEP_VISIBLE_CHIPS)}
                className="text-sm text-gray-700 hover:text-gray-900 underline"
              >
                Ver más
              </button>
            )}

            {visibleChips > INITIAL_VISIBLE_CHIPS && (
              <>
                <button
                  onClick={() =>
                    setVisibleChips((n) =>
                      Math.max(INITIAL_VISIBLE_CHIPS, n - STEP_VISIBLE_CHIPS)
                    )
                  }
                  className="text-sm text-gray-700 hover:text-gray-900 underline"
                >
                  Ver menos
                </button>

                <button
                  onClick={() => setVisibleChips(INITIAL_VISIBLE_CHIPS)}
                  className="text-sm text-gray-700 hover:text-gray-900 underline"
                >
                  Solo 5
                </button>
              </>
            )}

            {(selectedCats.length > 0 || search.trim()) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {itemsToShow.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-600">
              No encontramos resultados para tu búsqueda.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Intenta con otro término o cambia el filtro.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {itemsToShow.map((it, idx) => (
              <motion.article
                key={`${it.kind}-${it.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.35 }}
                className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white"
              >
                <Link
                  href={
                    it.kind === "destino"
                      ? `/destinations/${it.id}`
                      : `/experiencias/${it.id}`
                  }
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                    <Image
                      src={it.image}
                      alt={it.name}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {it.address || (it.categories?.[0] ?? "Atlántico")}
                      </span>
                      {it.categories?.length > 0 && (
                        <>
                          <span className="mx-1.5">•</span>
                          <span className="truncate">
                            {it.categories.slice(0, 3).join(" · ")}
                            {it.categories.length > 3
                              ? ` +${it.categories.length - 3}`
                              : ""}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {it.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {it.tagline || it.description}
                    </p>

                    {it.openingTime && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {it.openingTime}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Paginación “Ver más” */}
        {visible < filtered.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Ver más
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
