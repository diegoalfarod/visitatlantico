// File: src/lib/itinerarySchema.ts
// Validación con Zod del payload devuelto por IA
// ──────────────────────────────────────────────────────────────────────────────
import { z } from "zod";


export const StopSchema = z.object({
id: z.string().min(1),
name: z.string().min(1),
description: z.string().optional().default(""),
lat: z.number().finite(),
lng: z.number().finite(),
startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default("09:00"),
endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default(""),
durationMinutes: z.number().int().min(15).max(300).default(60),
tip: z.string().optional().default(""),
municipality: z.string().optional().default("Atlántico"),
category: z.string().optional().default("Attraction"),
imageUrl: z.string().url().optional(),
photos: z.array(z.string().url()).optional().default([]),
distance: z.number().nonnegative().optional().default(0),
type: z.enum(["destination", "experience", "restaurant", "transport"]).optional().default("destination"),
cost: z.number().nonnegative().optional().default(0),
rating: z.number().min(0).max(5).optional().default(4.5),
bestTimeToVisit: z.string().optional().default("Mañana"),
accessibility: z.string().optional().default("Accesible"),
weatherConsideration: z.string().optional().default(""),
localInsight: z.string().optional().default(""),
crowdLevel: z.enum(["low", "medium", "high"]).optional().default("medium"),
mustTry: z.array(z.string()).optional().default([]),
tags: z.array(z.string()).optional().default([]),
address: z.string().optional(),
website: z.string().url().optional(),
phone: z.string().optional(),
openingHours: z.record(z.array(z.tuple([z.string(), z.string()]))).optional(),
priceLevel: z.number().int().min(0).max(4).optional(),
});


export const ItinerarySchema = z.object({
itinerary: z.array(StopSchema).min(3, "Se requieren al menos 3 paradas"),
});


export type StopDTO = z.infer<typeof StopSchema>;
export type ItineraryDTO = z.infer<typeof ItinerarySchema>;