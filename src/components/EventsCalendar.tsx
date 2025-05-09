"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Event } from "@/types/event";

export default function EventsCalendar({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Date | null>(null);

  const eventsOnDay = (d: Date) =>
    events.filter(
      (e) =>
        format(new Date(e.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"),
    );

  return (
    <>
      <Calendar
        locale={es as unknown as string}
        onClickDay={setSelected}
        tileContent={({ date }) =>
          eventsOnDay(date).length > 0 && (
            <span className="block w-1.5 h-1.5 rounded-full bg-[#E40E20] mx-auto mt-1" />
          )
        }
        prev2Label={null}
        next2Label={null}
        className="rounded-2xl border-none shadow-md"
      />

      {selected && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {eventsOnDay(selected).map((ev) => (
            <article
              key={ev.id}
              className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold">{ev.title}</h3>
              <p className="text-sm text-gray-600">{ev.location}</p>
              <p className="text-sm mt-2 line-clamp-2">{ev.summary}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
