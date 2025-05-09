"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, List } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/types/event";
import EventGrid from "@/components/EventGrid";
import EventsCalendar from "@/components/EventsCalendar";
import Navbar from "@/components/Navbar";

type View = "list" | "calendar";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<View>("list");

  /* -------------------- Firestore -------------------- */
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setEvents(
          snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<Event, "id">) }) as Event,
          ),
        );
      } catch (err) {
        console.error("Firestore error:", err);
      }
    })();
  }, []);

  /* -------------------- Helper ---------------------- */
  const Btn = ({
    mode,
    label,
    icon,
  }: {
    mode: View;
    label: string;
    icon: ReactNode;
  }) => (
    <button
      onClick={() => setView(mode)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
        view === mode
          ? "bg-[#E40E20] text-white shadow"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  /* -------------------- UI -------------------------- */
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="relative h-[40vh] w-full">
          <Image
            src="/images/events-hero.jpg"
            alt="Hero eventos"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="font-fivo text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Eventos
            </h1>
          </div>
        </section>

        {/* SELECTOR */}
        <div className="flex gap-4 justify-center mt-10">
          <Btn mode="list" icon={<List size={18} />} label="Lista" />
          <Btn mode="calendar" icon={<CalendarDays size={18} />} label="Calendario" />
        </div>

        {/* CONTENIDO */}
        <section className="max-w-7xl mx-auto px-6 mt-10">
          {view === "list" ? (
            <EventGrid events={events} />
          ) : (
            <EventsCalendar events={events} />
          )}
        </section>
      </main>
    </>
  );
}
