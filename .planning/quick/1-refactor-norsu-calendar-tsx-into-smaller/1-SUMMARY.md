---
phase: quick
plan: 1
subsystem: calendar
tags: [refactor, components, hooks, calendar]
dependency_graph:
  requires: []
  provides:
    - src/features/calendar/hooks/use-calendar-navigation.ts
    - src/features/calendar/components/calendar-header.tsx
    - src/features/calendar/components/calendar-day-cell.tsx
    - src/features/calendar/components/calendar-grid.tsx
  affects:
    - src/features/calendar/components/norsu-calendar.tsx
tech_stack:
  added: []
  patterns:
    - Custom hook extraction (useCalendarNavigation)
    - Presentational component decomposition
    - Composition root pattern
key_files:
  created:
    - src/features/calendar/hooks/use-calendar-navigation.ts
    - src/features/calendar/components/calendar-header.tsx
    - src/features/calendar/components/calendar-day-cell.tsx
    - src/features/calendar/components/calendar-grid.tsx
  modified:
    - src/features/calendar/components/norsu-calendar.tsx
decisions:
  - setDirection exposed from useCalendarNavigation so CalendarHeader's mobile Select can update animation direction without prop-drilling a raw setState
metrics:
  duration: ~10 minutes
  completed: 2026-02-24
  tasks_completed: 3
  files_created: 4
  files_modified: 1
---

# Quick Task 1: Refactor norsu-calendar.tsx into Smaller Files — Summary

**One-liner:** Split 494-line monolithic Calendar component into 1 navigation hook + 3 focused components (CalendarHeader, CalendarDayCell, CalendarGrid) with norsu-calendar.tsx as a 189-line composition root.

## What Was Done

The `norsu-calendar.tsx` file was a single 494-line component containing navigation state, header UI, grid UI, and day cell UI all inline. This refactor separates concerns into focused files without changing any behavior, layout, or Tailwind classes.

## Files Created

### `src/features/calendar/hooks/use-calendar-navigation.ts`
Custom hook encapsulating:
- `direction` / `isNavigating` state
- `goToPreviousMonth`, `goToNextMonth`, `goToToday` callbacks (exact copies — 100ms debounce, isNavigating guard)
- `setDirection` exposed so CalendarHeader's mobile Select can compute animation direction

### `src/features/calendar/components/calendar-day-cell.tsx`
Renders a single calendar day cell. Accepts: `day`, `idx`, `roleColors`, `role`, `onDaySelect`. Contains all motion animation props, event indicator sub-elements (desktop icon+count, mobile icon, desktop "Event"/"Events..." text).

### `src/features/calendar/components/calendar-grid.tsx`
Renders the day-of-week label row + AnimatePresence grid. Uses `CalendarDayCell` in `.map()` replacing the inline `motion.div`. Accepts: `calendarDays`, `currentMonth`, `currentYear`, `direction`, `roleColors`, `role`, `onDaySelect`.

### `src/features/calendar/components/calendar-header.tsx`
Renders the full `div.grid.grid-cols-3` top bar: desktop prev/next arrows, Today button, mobile month/year Select dropdown, animated month/year title, Month view button.

## Refactored File

### `src/features/calendar/components/norsu-calendar.tsx` (494 → 189 lines)
Now a composition root that:
1. Calls `useCalendarNavigation` for navigation state/handlers
2. Keeps `calendarDays`, `monthNames`, `currentMonthYear` useMemo (unchanged)
3. Keeps `roleColors` useMemo
4. Renders `<CalendarHeader />`, `<CalendarGrid />`, and the mobile fixed bottom nav (kept inline — small and tightly coupled to navigation handlers)

Public `Calendar<T>` component API is 100% unchanged. `calendar page.tsx` requires no changes.

## Verification

- `npx tsc --noEmit` exits with 0 errors
- All 4 new files exist and are non-empty
- norsu-calendar.tsx no longer contains inline navigation state/callbacks or large header/grid JSX blocks
- calendar page.tsx import of `Calendar` from `norsu-calendar.tsx` is unchanged

## Commits

| Hash    | Message                                                                           |
| ------- | --------------------------------------------------------------------------------- |
| 940e66f | feat(quick-1): extract useCalendarNavigation hook                                 |
| 67b04b4 | feat(quick-1): extract CalendarDayCell and CalendarGrid components                |
| c55afbf | feat(quick-1): extract CalendarHeader, refactor norsu-calendar.tsx as composition root |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Exposed `setDirection` from hook**
- **Found during:** Task 1 (noticed during Task 3 planning)
- **Issue:** CalendarHeader's mobile Select `onValueChange` needs to call `setDirection` to set animation direction before calling `onMonthYearChange`. The plan's Task 3 action explicitly called this out.
- **Fix:** Hook returns `setDirection: React.Dispatch<React.SetStateAction<number>>` in addition to the four items listed in Task 1's signature. Task 3 already documented this requirement ("Update `useCalendarNavigation` to also return `setDirection`").
- **Files modified:** `src/features/calendar/hooks/use-calendar-navigation.ts`
- **Commit:** 940e66f

This was not a deviation from intent — the plan's Task 3 explicitly required it. It was implemented in Task 1 to keep the hook complete from the start.

## Self-Check: PASSED

All created files exist:
- FOUND: src/features/calendar/hooks/use-calendar-navigation.ts
- FOUND: src/features/calendar/components/calendar-header.tsx
- FOUND: src/features/calendar/components/calendar-day-cell.tsx
- FOUND: src/features/calendar/components/calendar-grid.tsx

All commits exist:
- FOUND: 940e66f
- FOUND: 67b04b4
- FOUND: c55afbf

TypeScript: 0 errors.
