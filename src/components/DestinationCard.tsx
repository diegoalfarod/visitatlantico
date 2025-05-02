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
      className="block rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
    >
      {image ? (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Sin imagen</span>
        </div>
      )}
      <div className="p-4 bg-white">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-gray-600 mt-2">{tagline}</p>
      </div>
    </Link>
  );
}
