/**
 * Article Schema (Schema.org)
 *
 * Structured data para artículos de blog
 * Mejora apariencia en Google News y búsquedas
 */

import type { BlogPost } from "@/data/blog-posts";

interface ArticleSchemaProps {
  article: BlogPost;
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `https://visitatlantico.com${article.image}`,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: article.author,
      url: "https://visitatlantico.com",
    },
    publisher: {
      "@type": "Organization",
      name: "VisitAtlántico",
      logo: {
        "@type": "ImageObject",
        url: "https://visitatlantico.com/images/logo.png",
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://visitatlantico.com/blog/${article.slug}`,
    },
    keywords: article.keywords.join(", "),
    articleSection: article.category,
    wordCount: article.content.split(" ").length,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
    />
  );
}

/**
 * BlogPosting Schema para listas de artículos
 */
export function BlogPostingListSchema({ posts }: { posts: BlogPost[] }) {
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: post.title,
        image: `https://visitatlantico.com${post.image}`,
        datePublished: post.date,
        author: {
          "@type": "Organization",
          name: post.author,
        },
        url: `https://visitatlantico.com/blog/${post.slug}`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
    />
  );
}
