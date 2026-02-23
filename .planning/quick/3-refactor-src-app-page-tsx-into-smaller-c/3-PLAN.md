---
phase: quick-3
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/page.tsx
  - src/app/_hooks/use-public-calendar-data.ts
  - src/app/_hooks/use-error-toast.ts
  - src/app/_components/home-navbar.tsx
  - src/app/_components/upcoming-events-sidebar.tsx
  - src/app/_components/home-modals.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "page.tsx renders without errors and UI is pixel-identical to before"
    - "Navbar displays correctly with ABOUT scroll link and NORSU logo"
    - "Upcoming events sidebar shows loading/error/empty/populated states"
    - "Calendar renders with correct Philippine timezone on mount"
    - "Clicking a day opens EventsListModal with correct events"
    - "Clicking an event opens EventInfoModal with correct details"
    - "URL ?error= param triggers toast notification and clears the param"
  artifacts:
    - path: "src/app/_hooks/use-public-calendar-data.ts"
      provides: "Data fetching, event transformation, day-select logic"
    - path: "src/app/_hooks/use-error-toast.ts"
      provides: "URL error param toast handler"
    - path: "src/app/_components/home-navbar.tsx"
      provides: "Navbar component with logo, title, ABOUT button"
    - path: "src/app/_components/upcoming-events-sidebar.tsx"
      provides: "Sidebar with upcoming events list, loading/error/empty states"
    - path: "src/app/_components/home-modals.tsx"
      provides: "EventsListModal + EventInfoModal wrapper"
    - path: "src/app/page.tsx"
      provides: "Thin composition root assembling all components"
  key_links:
    - from: "src/app/page.tsx"
      to: "src/app/_hooks/use-public-calendar-data.ts"
      via: "usePublicCalendarData hook import"
    - from: "src/app/page.tsx"
      to: "src/app/_hooks/use-error-toast.ts"
      via: "useErrorToast hook import"
    - from: "src/app/page.tsx"
      to: "src/app/_components/home-modals.tsx"
      via: "HomeModals component with modal state props"
    - from: "src/app/_hooks/use-public-calendar-data.ts"
      to: "src/features/calendar/services/reservation-service"
      via: "usePublicReservations, usePublicAssets imports"
---

<objective>
Refactor src/app/page.tsx into smaller, focused files following the Single Responsibility Principle. The 408-line page component mixes data fetching, event transformation, URL error handling, navbar markup, sidebar markup, and modal state into a single file. Extract these into custom hooks and co-located components without changing any UI, styles, or functionality.

Purpose: Reduce cognitive load when maintaining page.tsx. Each file has one clear reason to change.
Output: 5 new files (2 hooks, 3 components) + a slimmed-down page.tsx that is a pure composition root.
</objective>

<execution_context>
@C:/Users/Kaiser/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/app/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract usePublicCalendarData and useErrorToast hooks</name>
  <files>
    src/app/_hooks/use-public-calendar-data.ts
    src/app/_hooks/use-error-toast.ts
  </files>
  <action>
Create the directory src/app/_hooks/ and write two hook files.

**src/app/_hooks/use-error-toast.ts**
Extract the URL error param toast logic from the useEffect in page.tsx (lines 69-103).
- "use client" directive at top
- Import { useEffect } from "react" and { toast } from "react-hot-toast"
- Export default function useErrorToast(): void
- Body is the exact useEffect block as-is (no logic changes)

**src/app/_hooks/use-public-calendar-data.ts**
Extract all data, memos, and callbacks from page.tsx except: mounted/today/currentMonth/currentYear state (timezone init), modal open/close state, and the scrollToAbout handler. Specifically move:
- Imports: usePublicReservations, usePublicAssets, getPhilippineYear, getPhilippineMonth, getPhilippineDay, useMemo, useCallback, EventDetails, CalendarDayType, isEventFinished helper function
- The hook accepts: { currentMonth, currentYear } as parameters (needed for selectedDayEvents)
- The hook accepts: { selectedDay } as a parameter (needed for selectedDayEvents)
- Returns: { reservations, loading, error, assets, allEvents, upcomingEvents, calendarEvents, getEventsForDate, selectedDayEvents }

Preserve every memo dependency array exactly as-is. Do NOT change any logic, filtering, sorting, or mapping. Mark the file "use client".

The isEventFinished helper is a module-level function in this file (not exported), identical to the one in page.tsx.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -40</automated>
    <manual>Check that both hook files exist and TypeScript reports no errors in them</manual>
  </verify>
  <done>Both hook files exist with no TypeScript errors. usePublicCalendarData returns the same data shape as before. useErrorToast encapsulates the URL param effect.</done>
</task>

<task type="auto">
  <name>Task 2: Extract HomeNavbar, UpcomingEventsSidebar, and HomeModals components</name>
  <files>
    src/app/_components/home-navbar.tsx
    src/app/_components/upcoming-events-sidebar.tsx
    src/app/_components/home-modals.tsx
  </files>
  <action>
Create the directory src/app/_components/ and write three component files. Copy JSX exactly — zero Tailwind class changes, zero structural changes.

**src/app/_components/home-navbar.tsx**
Extract the Navbar div (lines 239-292 in page.tsx: the outer `div` with className starting "relative bg-white px-2 ...").
- "use client" directive
- Props: `{ onScrollToAbout: (e: React.MouseEvent<HTMLAnchorElement>) => void }`
- Imports: Image from "next/image", Button from "@/shared/components/ui/button", Link from "next/link"
- Export default function HomeNavbar({ onScrollToAbout })
- JSX is the exact navbar block. Replace the inline `scrollToAbout` reference with `onScrollToAbout`.

**src/app/_components/upcoming-events-sidebar.tsx**
Extract the sidebar div (lines 300-346: the `div` with className "w-full text-card-foreground border lg:w-[320px]...").
- "use client" directive
- Props interface UpcomingEventsSidebarProps: `{ loading: boolean; error: string | null; upcomingEvents: { title: string; date: string }[] }`
- Imports: React (no extra imports needed beyond JSX)
- Export default function UpcomingEventsSidebar({ loading, error, upcomingEvents })
- JSX is the exact sidebar block as-is.

**src/app/_components/home-modals.tsx**
Extract both modal usages (lines 376-405).
- "use client" directive
- Props interface HomeModalsProps: `{ modalOpen: boolean; onModalClose: () => void; eventInfoModalOpen: boolean; onEventInfoModalClose: () => void; selectedDay: CalendarDayType | null; currentMonth: number; currentYear: number; monthNames: string[]; selectedDayEvents: EventDetails[]; onEventClick: (event: EventDetails) => void; eventsListLoading: boolean; showRecent: boolean; setShowRecent: (v: boolean) => void; selectedEvent: EventDetails | undefined; eventInfoLoading: boolean }`
- Imports: EventsListModal, EventInfoModal, CalendarDayType, EventDetails
- Export default function HomeModals(props: HomeModalsProps)
- JSX is the exact two modal blocks. Replace all references to use props destructuring.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -40</automated>
    <manual>Check that all three component files exist and TypeScript reports no errors</manual>
  </verify>
  <done>All three component files exist. TypeScript type-checks cleanly. No JSX or class changes from the original.</done>
</task>

<task type="auto">
  <name>Task 3: Slim down page.tsx to a composition root</name>
  <files>src/app/page.tsx</files>
  <action>
Rewrite page.tsx to be a thin composition root that wires together all extracted pieces. The result should retain only: timezone init state (mounted, today, currentMonth, currentYear), modal open/close state (modalOpen, eventInfoModalOpen, selectedEvent, selectedDay, eventInfoLoading, showRecent, eventsListLoading), useErrorToast() call, usePublicCalendarData({ currentMonth, currentYear, selectedDay }) call, the handleEventClick / handleDaySelect / handleMonthYearChange / scrollToAbout callbacks, and the return JSX.

In the return JSX, replace:
- The inline navbar block with `<HomeNavbar onScrollToAbout={scrollToAbout} />`
- The inline sidebar block with `<UpcomingEventsSidebar loading={loading} error={error} upcomingEvents={upcomingEvents} />`
- The two modal blocks with `<HomeModals modalOpen={modalOpen} onModalClose={() => setModalOpen(false)} eventInfoModalOpen={eventInfoModalOpen} onEventInfoModalClose={() => setEventInfoModalOpen(false)} selectedDay={selectedDay} currentMonth={currentMonth} currentYear={currentYear} monthNames={monthNames} selectedDayEvents={selectedDayEvents} onEventClick={handleEventClick} eventsListLoading={eventsListLoading} showRecent={showRecent} setShowRecent={setShowRecent} selectedEvent={selectedEvent} eventInfoLoading={eventInfoLoading} />`

Keep the Calendar section div and AboutSection import exactly as-is (no changes to the calendar card wrapper or AboutSection usage).

Add imports for HomeNavbar, UpcomingEventsSidebar, HomeModals from ./_components/*.
Add imports for usePublicCalendarData, useErrorToast from ./_hooks/*.

Remove imports that are now only used in the extracted files: usePublicReservations, usePublicAssets, getPhilippineYear, getPhilippineMonth, getPhilippineDay, useMemo (if no longer used in page.tsx), useCallback (keep if still used for handlers).

Keep: export const dynamic = 'force-dynamic' at top.
Keep: monthNames useMemo in page.tsx (used for modal title string in HomeModals props — passed as prop).

Do NOT touch any Tailwind classes, layout structure, or logic for the Calendar section, CalendarSkeleton, or AboutSection.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -60</automated>
    <manual>Run `npm run dev` and open http://localhost:3000 — verify navbar, sidebar, calendar, and both modals look and behave identically to before</manual>
  </verify>
  <done>TypeScript reports zero errors. page.tsx is under ~120 lines. The app renders identically: navbar, sidebar, calendar, click-a-day modal, click-an-event modal, URL error toast all work.</done>
</task>

</tasks>

<verification>
After all tasks complete:
1. `npx tsc --noEmit` exits with zero errors
2. `npm run build` completes without errors
3. All 5 new files exist in src/app/_hooks/ and src/app/_components/
4. page.tsx is significantly slimmed (target ~100-120 lines vs original 408)
5. No Tailwind classes were changed anywhere
6. No functionality was changed — same data flow, same event handlers, same modal behavior
</verification>

<success_criteria>
- 2 hook files extracted: use-public-calendar-data.ts, use-error-toast.ts
- 3 component files extracted: home-navbar.tsx, upcoming-events-sidebar.tsx, home-modals.tsx
- page.tsx reduced to a thin composition root assembling all pieces
- Zero TypeScript errors
- Zero UI/functionality changes — app behaves identically
</success_criteria>

<output>
After completion, create `.planning/quick/3-refactor-src-app-page-tsx-into-smaller-c/3-SUMMARY.md`
</output>
