import dayjs from 'dayjs'
import type { ItineraryStop } from '../types/itinerary'

export function reflowTimes(stops: ItineraryStop[]): ItineraryStop[] {
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1]
    const prevEnd = dayjs(prev.start).add(prev.durationMin, 'minute')
    if (dayjs(stops[i].start).isBefore(prevEnd)) {
      stops[i] = { ...stops[i], start: prevEnd.format() }
    }
  }
  return stops
}
