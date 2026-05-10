import type { EventDetails } from "@/interface/user-props"

type SpanPosition = "single" | "start" | "middle" | "end"

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00")
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

/**
 * Builds a date→events map that expands multi-day events across all their span days.
 *
 * Ordering guarantee: events that START on a given day are inserted before
 * continuation entries, so dayEvents[0] (the visible pill) is always the
 * day's own event when one exists.
 *
 * Only processes approved events — callers should pre-filter if needed.
 */
export function buildSpanEventsByDate(events: EventDetails[]): Map<string, EventDetails[]> {
  const map = new Map<string, EventDetails[]>()

  // First pass: start-day entries (appear first in each day's list)
  for (const event of events) {
    const range = Math.max(1, event.range || 1)
    const spanPosition: SpanPosition = range === 1 ? "single" : "start"
    const entry: EventDetails = { ...event, spanPosition }

    const existing = map.get(event.date)
    if (existing) {
      existing.push(entry)
    } else {
      map.set(event.date, [entry])
    }
  }

  // Second pass: continuation entries (appear after start-day entries)
  for (const event of events) {
    const range = Math.max(1, event.range || 1)
    if (range <= 1) continue

    for (let dayOffset = 1; dayOffset < range; dayOffset++) {
      const dateStr = addDays(event.date, dayOffset)
      const spanPosition: SpanPosition = dayOffset === range - 1 ? "end" : "middle"
      const entry: EventDetails = { ...event, spanPosition }

      const existing = map.get(dateStr)
      if (existing) {
        existing.push(entry)
      } else {
        map.set(dateStr, [entry])
      }
    }
  }

  return map
}
