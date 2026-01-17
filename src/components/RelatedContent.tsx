/**
 * RelatedContent Component
 *
 * Componente de interlinking estratégico para SEO
 * Muestra contenido relacionado al final de las páginas para mejorar:
 * - Crawlability (Google indexa mejor)
 * - Internal linking (mejora PageRank distribution)
 * - User engagement (reduce bounce rate)
 * - Anchor text optimization (keywords contextuales)
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";

interface RelatedItem {
  title: string;
  description: string;
  url: string;
  image: string;
  category?: string;
}

interface RelatedContentProps {
  title?: string;
  items: RelatedItem[];
  className?: string;
}

export default function RelatedContent({
  title = "Explora más del Atlántico",
  items,
  className = "",
}: RelatedContentProps) {
  return (
    <section className={`py-16 bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full" />
        </div>

        {/* Grid de contenido relacionado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.url}
                className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Imagen */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Categoría badge */}
                  {item.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors"
                    style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:text-orange-700">
                    <span>Leer más</span>
                    <HiArrowRight className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
