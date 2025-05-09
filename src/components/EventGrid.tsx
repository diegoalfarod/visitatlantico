"use client";

import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/types/event";

export default function EventGrid({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Aún no hay eventos para mostrar. ¡Vuelve pronto!
      </p>
    );
  }

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Próximos eventos
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <article
            key={ev.id}
            className="rounded-2xl overflow-hidden shadow-md bg-white transition hover:shadow-lg"
          >
            <div className="relative h-56 w-full">
              <Image
                src={ev.cover || "/images/placeholder.jpg"}
                alt={ev.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold mb-1">{ev.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {new Date(ev.date).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                • {ev.location}
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {ev.summary}
              </p>

              <Link
                href={`/events/${ev.id}`}
                className="inline-block mt-4 text-[#E40E20] font-medium hover:underline"
              >
                Ver detalles →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
