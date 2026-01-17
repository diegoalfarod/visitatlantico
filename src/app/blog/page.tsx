import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogCard from "@/components/BlogCard";
import RelatedContent from "@/components/RelatedContent";
import { BlogPostingListSchema } from "@/components/schemas/ArticleSchema";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog de Turismo del Atlántico | Guías y Consejos de Viaje",
  description:
    "Descubre guías de viaje, consejos de turismo y curiosidades sobre el Atlántico Colombia. Carnaval, playas, gastronomía, eventos y más. Blog oficial de VisitAtlántico.",
  keywords: [
    "blog turismo atlántico",
    "guías de viaje barranquilla",
    "consejos turismo colombia",
    "qué hacer en barranquilla",
    "turismo caribe colombiano",
  ],
  openGraph: {
    title: "Blog VisitAtlántico | Guías y Consejos de Viaje",
    description:
      "Guías de viaje, tips de turismo y curiosidades del Caribe colombiano. Descubre el Atlántico con nosotros.",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
    languages: {
      "es-CO": "/es/blog",
      "en-US": "/en/blog",
    },
  },
};

export default function BlogPage() {
  return (
    <>
      {/* Schema.org */}
      <BlogPostingListSchema posts={blogPosts} />

      <main className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Blog", url: "https://visitatlantico.com/blog" },
          ]}
        />

        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Blog de Turismo del{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Atlántico
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Guías de viaje, consejos prácticos y curiosidades sobre el Caribe
              colombiano. Descubre todo lo que necesitas saber para vivir
              experiencias inolvidables en el Atlántico.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full" />
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
              {blogPosts.map((post, index) => (
                <BlogCard key={post.slug} post={post} index={index} />
              ))}
            </div>

            {/* Message when more posts come */}
            {blogPosts.length === 2 && (
              <div className="mt-16 text-center">
                <p className="text-gray-600 text-lg">
                  📝 Más artículos próximamente...
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent
          title="Explora el Atlántico"
          items={[
            {
              title: "Carnaval de Barranquilla 2026",
              description:
                "Guía completa del segundo carnaval más grande del mundo. Fechas, eventos y consejos.",
              url: "/carnaval",
              image: "/images/carnaval-batalla-flores.jpg",
              category: "Eventos",
            },
            {
              title: "Playas del Atlántico",
              description:
                "Descubre playas Blue Flag, kitesurf y paraísos caribeños cerca de Barranquilla.",
              url: "/playas",
              image: "/images/playas-atlantico-hero.jpg",
              category: "Playas",
            },
            {
              title: "Ruta 23 Gastronómica",
              description:
                "Sabores auténticos del Caribe: 18 festivales, 900+ artesanos y tradición.",
              url: "/ruta23",
              image:
                "https://firebasestorage.googleapis.com/v0/b/visitatlantico-f5c09.firebasestorage.app/o/RUTA23%20-%20IMAGE%201.png?alt=media&token=cd2eebdd-020a-41f8-9703-e1ac3d238534",
              category: "Gastronomía",
            },
          ]}
        />
      </main>
    </>
  );
}
