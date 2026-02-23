---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/calendar/components/norsu-calendar.tsx
  - src/features/calendar/components/calendar-header.tsx
  - src/features/calendar/components/calendar-day-cell.tsx
  - src/features/calendar/components/calendar-grid.tsx
  - src/features/calendar/hooks/use-calendar-navigation.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Calendar renders identically to before — same layout, classes, and Tailwind styles"
    - "Month navigation (prev/next/today) works as before"
    - "Mobile month/year select dropdown works as before"
    - "Day cells show event count and icons as before"
    - "Clicking a day cell calls onDaySelect with the correct CalendarDayType object"
    - "Mobile fixed bottom nav buttons work as before"
  artifacts:
    - path: "src/features/calendar/hooks/use-calendar-navigation.ts"
      provides: "Navigation state and handlers (direction, isNavigating, goToPrev, goToNext, goToToday)"
    - path: "src/features/calendar/components/calendar-header.tsx"
      provides: "CalendarHeader component — renders full top bar (nav controls, month/year title, Month button)"
    - path: "src/features/calendar/components/calendar-day-cell.tsx"
      provides: "CalendarDayCell component — renders a single day cell with event indicators"
    - path: "src/features/calendar/components/calendar-grid.tsx"
      provides: "CalendarGrid component — renders day-of-week labels + AnimatePresence grid of CalendarDayCell"
    - path: "src/features/calendar/components/norsu-calendar.tsx"
      provides: "Calendar root — composes all sub-components, unchanged public API"
  key_links:
    - from: "src/features/calendar/components/norsu-calendar.tsx"
      to: "src/features/calendar/hooks/use-calendar-navigation.ts"
      via: "useCalendarNavigation hook call"
    - from: "src/features/calendar/components/norsu-calendar.tsx"
      to: "src/features/calendar/components/calendar-header.tsx"
      via: "CalendarHeader JSX element"
    - from: "src/features/calendar/components/norsu-calendar.tsx"
      to: "src/features/calendar/components/calendar-grid.tsx"
      via: "CalendarGrid JSX element"
    - from: "src/features/calendar/components/calendar-grid.tsx"
      to: "src/features/calendar/components/calendar-day-cell.tsx"
      via: "CalendarDayCell JSX element in .map()"
---

<objective>
Refactor norsu-calendar.tsx into smaller, single-responsibility files without changing any behavior, UI layout, or Tailwind classes.

Purpose: Improve maintainability by separating navigation logic, header UI, day cell UI, and grid UI into focused files.
Output: 1 custom hook + 3 new component files + refactored norsu-calendar.tsx as the composition root.
</objective>

<execution_context>
@C:/Users/Kaiser/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/features/calendar/components/norsu-calendar.tsx
@src/features/calendar/utils/calendar-animations.ts
@src/features/calendar/utils/timezone-utils.ts
@src/interface/user-props.ts
@src/shared/components/utils/role-colors.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract useCalendarNavigation hook</name>
  <files>src/features/calendar/hooks/use-calendar-navigation.ts</files>
  <action>
Create `src/features/calendar/hooks/use-calendar-navigation.ts` — a new custom hook that extracts navigation logic from norsu-calendar.tsx.

The hook signature must be:

```ts
export function useCalendarNavigation(
  currentMonth: number,
  currentYear: number,
  onMonthYearChange: (month: number, year: number) => void
): {
  direction: number;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}
```

Move the following from norsu-calendar.tsx into this hook exactly as-is (no logic changes):
- `const [direction, setDirection] = useState(0)`
- `const [isNavigating, setIsNavigating] = useState(false)`
- `goToPreviousMonth` useCallback (including the 100ms setTimeout and isNavigating guard)
- `goToNextMonth` useCallback (including the 100ms setTimeout and isNavigating guard)
- `goToToday` useCallback (using getPhilippineMonth/getPhilippineYear and 100ms setTimeout)

Imports needed: `useState`, `useCallback` from react; `getPhilippineMonth`, `getPhilippineYear` from `@/features/calendar/utils/timezone-utils`.

Do NOT export `isNavigating` — it is internal to the hook. Only export `direction`, `goToPreviousMonth`, `goToNextMonth`, `goToToday`.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>File src/features/calendar/hooks/use-calendar-navigation.ts exists with correct hook signature and compiles without TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 2: Extract CalendarDayCell and CalendarGrid components</name>
  <files>
    src/features/calendar/components/calendar-day-cell.tsx
    src/features/calendar/components/calendar-grid.tsx
  </files>
  <action>
**calendar-day-cell.tsx**

Create `src/features/calendar/components/calendar-day-cell.tsx`.

Extract the `motion.div` day cell (lines 342-459 in norsu-calendar.tsx) into a component:

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";

interface CalendarDayCellProps {
  day: CalendarDayType;
  idx: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType) => void;
}

export function CalendarDayCell({ day, idx, roleColors, role, onDaySelect }: CalendarDayCellProps) {
  // paste the motion.div JSX from norsu-calendar.tsx here — no changes to JSX, classes, or logic
}
```

Copy the entire `motion.div` JSX block exactly — every className, every animation prop, every conditional expression. No changes.

---

**calendar-grid.tsx**

Create `src/features/calendar/components/calendar-grid.tsx`.

Extract the full calendar table section (day-of-week header + AnimatePresence grid):

```tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
import { calendarVariants } from "@/features/calendar/utils/calendar-animations";
import { CalendarDayCell } from "./calendar-day-cell";

interface CalendarGridProps {
  calendarDays: CalendarDayType[];
  currentMonth: number;
  currentYear: number;
  direction: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType) => void;
}

export function CalendarGrid({ calendarDays, currentMonth, currentYear, direction, roleColors, role, onDaySelect }: CalendarGridProps) {
  // paste the "Calendar table" section JSX exactly from norsu-calendar.tsx
  // Use CalendarDayCell in the .map() replacing the inline motion.div
}
```

Copy the outer `div.flex.flex-col` wrapper, the day-of-week label row, and the AnimatePresence + motion.div grid exactly as written. Replace the inner `motion.div` per-day with `<CalendarDayCell day={day} idx={idx} roleColors={roleColors} role={role} onDaySelect={onDaySelect} />`.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>Both files exist. All Tailwind classes and animation props are identical to the original. TypeScript compiles without errors.</done>
</task>

<task type="auto">
  <name>Task 3: Extract CalendarHeader and update norsu-calendar.tsx as composition root</name>
  <files>
    src/features/calendar/components/calendar-header.tsx
    src/features/calendar/components/norsu-calendar.tsx
  </files>
  <action>
**calendar-header.tsx**

Create `src/features/calendar/components/calendar-header.tsx`.

Extract the "Calendar header" `div.grid.grid-cols-3` block (lines 199-310 in norsu-calendar.tsx) into a component:

```tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/shared/components/ui/select";
import { headerVariants } from "@/features/calendar/utils/calendar-animations";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  currentMonthYear: string;
  monthNames: string[];
  direction: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthYearChange: (month: number, year: number) => void;
  setDirection: (d: number) => void;
}

export function CalendarHeader({ ... }: CalendarHeaderProps) {
  // paste the outer div.grid.grid-cols-3 JSX exactly — no changes to classes or logic
  // The mobile Select onValueChange sets direction and calls onMonthYearChange
  // setDirection is needed for the mobile Select's direction calculation
}
```

Copy the entire JSX block exactly. Every className, every motion prop, every conditional expression — unchanged.

---

**norsu-calendar.tsx (refactored as composition root)**

Rewrite norsu-calendar.tsx so it:
1. Calls `useCalendarNavigation(currentMonth, currentYear, onMonthYearChange)` to get `{ direction, goToPreviousMonth, goToNextMonth, goToToday }`. The internal `setDirection` needed by CalendarHeader's mobile Select must also be exposed — update the hook to also return `setDirection`.
2. Keeps `calendarDays` useMemo and `monthNames` useMemo and `currentMonthYear` useMemo (unchanged logic).
3. Keeps `roleColors` useMemo.
4. Returns JSX:
   ```tsx
   <div className="flex flex-col w-full flex-1">
     <CalendarHeader ... />
     <CalendarGrid ... />
     {/* Mobile fixed bottom nav — keep exactly as-is */}
     <div className="sm:hidden">...</div>
   </div>
   ```
5. The mobile fixed bottom nav div (lines 467-491) stays directly in norsu-calendar.tsx — it is small enough and tightly coupled to goToPreviousMonth/goToNextMonth.

The public component API (props interface) must remain 100% identical. The exported name `Calendar` stays the same.

Update `useCalendarNavigation` to also return `setDirection: React.Dispatch<React.SetStateAction<number>>` so CalendarHeader can update direction on mobile Select change.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -50</automated>
    <manual>Open the calendar page in the browser (http://localhost:3000), verify the calendar renders with correct layout, month navigation buttons work, clicking a day opens the events modal, and the mobile bottom nav appears on narrow viewport.</manual>
  </verify>
  <done>
    - norsu-calendar.tsx composes CalendarHeader, CalendarGrid, and mobile nav using the extracted components/hook.
    - `npx tsc --noEmit` exits with 0 errors.
    - Exported `Calendar` component props interface is unchanged.
    - No Tailwind classes changed anywhere.
  </done>
</task>

</tasks>

<verification>
Run `npx tsc --noEmit` from the project root — must exit with 0 TypeScript errors.

Check that the following files exist and are non-empty:
- src/features/calendar/hooks/use-calendar-navigation.ts
- src/features/calendar/components/calendar-header.tsx
- src/features/calendar/components/calendar-day-cell.tsx
- src/features/calendar/components/calendar-grid.tsx

Check that norsu-calendar.tsx no longer contains the inline navigation state/handlers or the large header/grid JSX blocks.

Confirm the original calendar page (src/app/(dashboard)/[role]/calendar/page.tsx) requires no changes — it imports `Calendar` from `norsu-calendar.tsx` and that export is unchanged.
</verification>

<success_criteria>
- 4 new files created (1 hook + 3 components)
- norsu-calendar.tsx reduced to a composition root (~60-80 lines)
- `npx tsc --noEmit` passes with 0 errors
- No Tailwind class changes anywhere
- No functional changes — onDaySelect, getEventsForDate, onMonthYearChange all work identically
- calendar page.tsx untouched
</success_criteria>

<output>
After completion, create `.planning/quick/1-refactor-norsu-calendar-tsx-into-smaller/1-SUMMARY.md` following the summary template.
</output>
