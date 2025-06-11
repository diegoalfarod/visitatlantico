"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ItineraryStop } from "@/types/itinerary";
import { reflowTimes } from "@/utils/itinerary";

interface PlannerProps {
  itineraryId: string;
}

interface SortableStopProps {
  stop: ItineraryStop;
  index: number;
  onStartChange: (time: string) => void;
  onDurationChange: (min: number) => void;
}

function SortableStop({ stop, index, onStartChange, onDurationChange }: SortableStopProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.li
      layout
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="font-semibold flex-1">{stop.title}</span>
        <input
          type="time"
          value={dayjs(stop.start).format("HH:mm")}
          onChange={(e) => onStartChange(e.target.value)}
          className="border rounded px-1 text-sm"
        />
        <input
          type="number"
          min={5}
          step={5}
          value={stop.durationMin}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="border rounded px-1 w-16 text-sm ml-2"
        />
      </div>
      {stop.location && <div className="text-sm text-gray-500">{stop.location}</div>}
    </motion.li>
  );
}

export default function ItineraryPlanner({ itineraryId }: PlannerProps) {
  const [stops, setStops] = useState<ItineraryStop[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "itineraries", itineraryId, "stops"),
      orderBy("start", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ItineraryStop, "id">) }));
      setStops(data);
    });
    return unsub;
  }, [itineraryId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const persist = async (updated: ItineraryStop[]) => {
    const batch = writeBatch(db);
    updated.forEach((s) => {
      const ref = doc(db, "itineraries", itineraryId, "stops", s.id);
      batch.update(ref, { start: s.start, durationMin: s.durationMin });
    });
    await batch.commit();
    setMessage("Itinerario actualizado");
    setTimeout(() => setMessage(null), 3000);
  };

  const applyAndSave = async (updated: ItineraryStop[]) => {
    const after = reflowTimes([...updated]);
    const changed = after.some((s, i) => s.start !== updated[i].start);
    setWarn(changed);
    setStops(after);
    await persist(after);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stops, oldIndex, newIndex);
    applyAndSave(reordered);
  };

  const updateStart = (idx: number, time: string) => {
    const [h, m] = time.split(":" ).map(Number);
    const base = dayjs(stops[idx].start);
    const updated = [...stops];
    updated[idx] = { ...updated[idx], start: base.hour(h).minute(m).second(0).format() };
    applyAndSave(updated);
  };

  const updateDuration = (idx: number, min: number) => {
    const updated = [...stops];
    updated[idx] = { ...updated[idx], durationMin: min };
    applyAndSave(updated);
  };

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {stops.map((s, i) => (
              <SortableStop
                key={s.id}
                stop={s}
                index={i}
                onStartChange={(t) => updateStart(i, t)}
                onDurationChange={(d) => updateDuration(i, d)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {warn && (
        <div className="text-amber-600 flex items-center gap-1">
          <span>⚠️</span> Se ajustaron horarios para evitar solapamientos.
        </div>
      )}
      {message && <div className="text-green-600">{message}</div>}
    </div>
  );
}
