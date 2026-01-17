/**
 * BlogCard Component
 *
 * Card de preview para artículos de blog
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiArrowRight, HiClock, HiCalendar } from "react-icons/hi2";
import type { BlogPost } from "@/data/blog-posts";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
      >
        {/* Imagen */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Categoría badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              {post.category}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <HiCalendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <HiClock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          {/* Título */}
          <h3
            className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
          >
            {post.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
            {post.description}
          </p>

          {/* CTA */}
          <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:text-orange-700">
            <span>Leer artículo</span>
            <HiArrowRight className="ml-2 transform group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
