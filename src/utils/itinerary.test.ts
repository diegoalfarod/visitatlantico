import { describe, expect, it } from 'vitest'
import { reflowTimes } from './itinerary'
import type { ItineraryStop } from '../types/itinerary'

describe('reflowTimes', () => {
  it('adjusts overlapping stops', () => {
    const stops: ItineraryStop[] = [
      { id: '1', title: 'A', start: '2025-06-12T09:00', durationMin: 60 },
      { id: '2', title: 'B', start: '2025-06-12T09:30', durationMin: 30 },
      { id: '3', title: 'C', start: '2025-06-12T10:30', durationMin: 30 },
    ]
    const result = reflowTimes([...stops])
    expect(result[1].start).not.toBe(stops[1].start)
    const end1 = new Date(result[0].start).getTime() + result[0].durationMin * 60000
    expect(new Date(result[1].start).getTime()).toBe(end1)
  })

  it('propagates duration change', () => {
    const stops: ItineraryStop[] = [
      { id: '1', title: 'A', start: '2025-06-12T09:00', durationMin: 60 },
      { id: '2', title: 'B', start: '2025-06-12T10:00', durationMin: 30 },
    ]
    stops[0].durationMin = 90
    const result = reflowTimes([...stops])
    const expectedStart = new Date(stops[0].start).getTime() + 90*60000
    expect(new Date(result[1].start).getTime()).toBe(expectedStart)
  })
})
