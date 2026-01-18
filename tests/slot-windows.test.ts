import { describe, it, expect } from 'vitest'
import { buildServiceWindowsFromBaseSlots } from '@/lib/services/slot-windows.util'

function makeSlot(id: string, startISO: string, isAvailable = true) {
  const start = new Date(startISO)
  const end = new Date(start.getTime() + 15 * 60 * 1000)
  return {
    id,
    professional_id: 'p1',
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    is_available: isAvailable
  }
}

describe('buildServiceWindowsFromBaseSlots', () => {
  it('builds 60min window from four 15min base slots', () => {
    const base = [
      makeSlot('s1', '2026-01-27T11:00:00.000Z'),
      makeSlot('s2', '2026-01-27T11:15:00.000Z'),
      makeSlot('s3', '2026-01-27T11:30:00.000Z'),
      makeSlot('s4', '2026-01-27T11:45:00.000Z')
    ]

    const windows = buildServiceWindowsFromBaseSlots({
      baseSlots: base,
      durationMinutes: 60,
      slotStepMinutes: 15,
      now: '2026-01-27T09:00:00.000Z',
      closingTime: '18:00',
      timezone: 'UTC'
    })

    expect(windows.length).toBe(1)
    expect(windows[0].slot_ids).toEqual(['s1','s2','s3','s4'])
  })

  it('builds 30min windows (2 slots) and skips when a hole exists', () => {
    const base = [
      makeSlot('a1', '2026-01-27T11:00:00.000Z'),
      makeSlot('a2', '2026-01-27T11:15:00.000Z'),
      makeSlot('a3', '2026-01-27T11:30:00.000Z', false), // hole
      makeSlot('a4', '2026-01-27T11:45:00.000Z')
    ]

    const windows = buildServiceWindowsFromBaseSlots({
      baseSlots: base,
      durationMinutes: 30,
      slotStepMinutes: 15,
      now: '2026-01-27T09:00:00.000Z',
      closingTime: '18:00',
      timezone: 'UTC'
    })

    // expect windows from a1-a2 and a4 only (a3 is not available so a2-a3 invalid)
    expect(windows.length).toBe(1)
    expect(windows[0].slot_ids).toEqual(['a1','a2'])
  })

  it('respects closingTime and drops windows that exceed closing', () => {
    const base = [
      makeSlot('b1', '2026-01-27T17:00:00.000Z'),
      makeSlot('b2', '2026-01-27T17:15:00.000Z'),
      makeSlot('b3', '2026-01-27T17:30:00.000Z'),
      makeSlot('b4', '2026-01-27T17:45:00.000Z')
    ]

    // closing at 17:30 UTC -> windows beyond should be dropped
    const windows = buildServiceWindowsFromBaseSlots({
      baseSlots: base,
      durationMinutes: 60,
      slotStepMinutes: 15,
      now: '2026-01-27T09:00:00.000Z',
      closingTime: '17:30',
      timezone: 'UTC'
    })

    expect(windows.length).toBe(0)
  })
})
