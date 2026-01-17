import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
import { blogPosts, getPostBySlug } from "@/data/blog-posts";
import { HiClock, HiCalendar, HiUser } from "react-icons/hi2";

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: `${post.title} | Blog VisitAtlántico`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Get other posts for related content (excluding current post)
  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug);

  return (
    <>
      {/* Schema.org */}
      <ArticleSchema article={post} />

      <main className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Blog", url: "https://visitatlantico.com/blog" },
            { name: post.title, url: `https://visitatlantico.com/blog/${post.slug}` },
          ]}
        />

        {/* Article Header */}
        <article className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.description}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-200">
              <span className="flex items-center gap-2">
                <HiUser className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{post.author}</span>
              </span>
              <span className="flex items-center gap-2">
                <HiCalendar className="w-5 h-5 text-orange-600" />
                <span>
                  {new Date(post.date).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <HiClock className="w-5 h-5 text-orange-600" />
                <span>{post.readTime} de lectura</span>
              </span>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-lg md:prose-xl max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                // Custom prose styles
                "--tw-prose-body": "#374151",
                "--tw-prose-headings": "#111827",
                "--tw-prose-links": "#EA5B13",
                "--tw-prose-bold": "#111827",
                "--tw-prose-counters": "#6B7280",
                "--tw-prose-bullets": "#6B7280",
                "--tw-prose-hr": "#E5E7EB",
                "--tw-prose-quotes": "#111827",
                "--tw-prose-quote-borders": "#EA5B13",
                "--tw-prose-code": "#111827",
              } as React.CSSProperties}
            />

            {/* Share Section (Optional - for future) */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-center">
                ¿Te gustó este artículo? Compártelo con tus amigos
              </p>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {otherPosts.length > 0 && (
          <RelatedContent
            title="Más Artículos del Blog"
            items={otherPosts.map((p) => ({
              title: p.title,
              description: p.description,
              url: `/blog/${p.slug}`,
              image: p.image,
              category: p.category,
            }))}
          />
        )}
      </main>
    </>
  );
}
