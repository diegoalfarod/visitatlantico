"use client";
import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/data/destinations";

type CardProps = Pick<Destination, "id" | "name" | "tagline" | "image">;

export default function DestinationCard({
  id,
  name,
  tagline,
  image,
}: CardProps) {
  return (
    <Link
      href={`/destinations/${id}`}
      className="group block rounded-2xl shadow-md overflow-hidden transition-all duration-500 ease-premium hover:scale-105 hover:shadow-premium"
    >
      {image ? (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-premium group-hover:scale-110"
            unoptimized
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Sin imagen</span>
        </div>
      )}
      <div className="p-4 bg-white transition-colors duration-300 group-hover:bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-primary">
          {name}
        </h3>
        <p className="text-gray-600 mt-2 transition-colors duration-300">{tagline}</p>
      </div>
    </Link>
  );
}
