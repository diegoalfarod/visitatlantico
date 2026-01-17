/**
 * Breadcrumbs Component
 *
 * Navegación breadcrumb visual con Schema.org markup
 * Mejora UX y SEO mostrando la jerarquía de páginas
 */

"use client";

import Link from "next/link";
import { HiChevronRight, HiHome } from "react-icons/hi2";
import { BreadcrumbSchema } from "./schemas/OrganizationSchema";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Agregar "Inicio" al principio si no está
  const breadcrumbItems = [
    { name: "Inicio", url: "https://visitatlantico.com" },
    ...items,
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              const isFirst = index === 0;

              return (
                <li key={item.url} className="flex items-center">
                  {/* Separador (no mostrar antes del primero) */}
                  {!isFirst && (
                    <HiChevronRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                  )}

                  {/* Link o texto final */}
                  {isLast ? (
                    <span
                      className="font-semibold text-gray-900 line-clamp-1"
                      aria-current="page"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center text-gray-600 hover:text-orange-600 transition-colors line-clamp-1"
                    >
                      {isFirst && <HiHome className="w-4 h-4 mr-1 flex-shrink-0" />}
                      <span className="hover:underline">{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
