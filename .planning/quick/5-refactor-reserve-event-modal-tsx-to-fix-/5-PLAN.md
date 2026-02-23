---
phase: quick-5
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/reservations/components/reserve-event-modal.tsx
  - src/features/reservations/components/reserve-event-modal/modal-constants.ts
  - src/features/reservations/components/reserve-event-modal/modal-header.tsx
  - src/features/reservations/components/reserve-event-modal/modal-tab-bar.tsx
  - src/features/reservations/components/reserve-event-modal/modal-footer.tsx
  - src/features/reservations/hooks/useModalBehavior.ts
  - src/features/reservations/hooks/useModalAssetLoader.ts
  - src/features/reservations/hooks/useEditModePopulate.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "ReserveEventModal renders identically — no visible change to UI or layout"
    - "All Tailwind classes are preserved verbatim — no class names added, removed, or altered"
    - "Modal opens, tabs navigate (form → additional → summary), and close button works"
    - "Edit mode populates form fields correctly"
    - "Venue and vehicle asset modals open and load assets"
    - "npx tsc --noEmit passes with zero new errors"
    - "npm run build succeeds"
  artifacts:
    - path: "src/features/reservations/components/reserve-event-modal/modal-constants.ts"
      provides: "infoTypes, categories, peopleSuggestions, formattedAssets constants and formatDisplayDate utility"
      exports: ["infoTypes", "categories", "peopleSuggestions", "formattedAssets", "formatDisplayDate"]
    - path: "src/features/reservations/components/reserve-event-modal/modal-header.tsx"
      provides: "ModalHeader presentational component — icon, title, date, close button"
      exports: ["ModalHeader"]
    - path: "src/features/reservations/components/reserve-event-modal/modal-tab-bar.tsx"
      provides: "ModalTabBar presentational component — tab indicator strips"
      exports: ["ModalTabBar"]
    - path: "src/features/reservations/components/reserve-event-modal/modal-footer.tsx"
      provides: "ModalFooter presentational component — navigation and submit buttons"
      exports: ["ModalFooter"]
    - path: "src/features/reservations/hooks/useModalBehavior.ts"
      provides: "Scroll lock and escape key side effects for modal open/close"
      exports: ["useModalBehavior"]
    - path: "src/features/reservations/hooks/useModalAssetLoader.ts"
      provides: "Venue and vehicle asset loading state and effects"
      exports: ["useModalAssetLoader"]
    - path: "src/features/reservations/hooks/useEditModePopulate.ts"
      provides: "Edit mode form population effect"
      exports: ["useEditModePopulate"]
    - path: "src/features/reservations/components/reserve-event-modal.tsx"
      provides: "Slim orchestrator — wires hooks and sub-components"
      exports: ["ReserveEventModal"]
  key_links:
    - from: "src/features/reservations/components/reserve-event-modal.tsx"
      to: "src/features/reservations/components/reserve-event-modal/modal-header.tsx"
      via: "named import"
      pattern: "import.*ModalHeader.*modal-header"
    - from: "src/features/reservations/components/reserve-event-modal.tsx"
      to: "src/features/reservations/hooks/useModalAssetLoader.ts"
      via: "hook call"
      pattern: "useModalAssetLoader"
    - from: "src/features/reservations/components/reserve-event-modal.tsx"
      to: "src/features/reservations/hooks/useEditModePopulate.ts"
      via: "hook call"
      pattern: "useEditModePopulate"
---

<objective>
Refactor reserve-event-modal.tsx (550 lines) to fix single responsibility principle by extracting constants, presentational sub-components, and side-effect hooks into separate files — without changing any functionality, UI, layout, or Tailwind CSS classes.

Purpose: The modal currently mixes data constants, a formatting utility, three distinct side-effect concerns (scroll lock, escape key, asset loading), edit-mode population logic, and three blocks of presentational JSX into one file. Splitting these out makes each concern independently readable and maintainable.

Output:
- src/features/reservations/components/reserve-event-modal/modal-constants.ts (new)
- src/features/reservations/components/reserve-event-modal/modal-header.tsx (new)
- src/features/reservations/components/reserve-event-modal/modal-tab-bar.tsx (new)
- src/features/reservations/components/reserve-event-modal/modal-footer.tsx (new)
- src/features/reservations/hooks/useModalBehavior.ts (new)
- src/features/reservations/hooks/useModalAssetLoader.ts (new)
- src/features/reservations/hooks/useEditModePopulate.ts (new)
- src/features/reservations/components/reserve-event-modal.tsx (slimmed orchestrator)

The public API of ReserveEventModal — its props interface ModalProps — must remain identical. No other files are touched.
</objective>

<execution_context>
@C:/Users/Kaiser/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/features/reservations/components/reserve-event-modal.tsx
@src/features/reservations/hooks/useReserveEventForm.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract constants, presentational components, and side-effect hooks into separate files</name>
  <files>
    src/features/reservations/components/reserve-event-modal/modal-constants.ts
    src/features/reservations/components/reserve-event-modal/modal-header.tsx
    src/features/reservations/components/reserve-event-modal/modal-tab-bar.tsx
    src/features/reservations/components/reserve-event-modal/modal-footer.tsx
    src/features/reservations/hooks/useModalBehavior.ts
    src/features/reservations/hooks/useModalAssetLoader.ts
    src/features/reservations/hooks/useEditModePopulate.ts
  </files>
  <action>
Read src/features/reservations/components/reserve-event-modal.tsx in full before writing anything. All JSX, Tailwind classes, inline styles, and logic must be copied verbatim — do not rewrite, simplify, or change anything.

--- Create src/features/reservations/components/reserve-event-modal/modal-constants.ts ---

Export the following verbatim from the original file:
- const infoTypes: { value: string; label: string }[] — the three-element array (public/private/restricted)
- const categories: { value: string; label: string }[] — the four-element array (academic/social/sports/other)
- const peopleSuggestions: { id: string; name: string }[] — the five-element array (John Doe etc.)
- const formattedAssets — the useMemo-computed array with id 1 "Venue". In the constant file this is a plain const (not a useMemo), since it has no reactive dependencies:
  export const formattedAssets = [{ id: 1, asset_name: "Venue", capacity: 0 }];
- function formatDisplayDate(dateStr: string | undefined): string — copy verbatim from the original. Include the try/catch and all branches. No default export. No other code. No React import needed.

--- Create src/features/reservations/hooks/useModalBehavior.ts ---

This hook owns the two modal side effects currently in reserve-event-modal.tsx:
1. Scroll lock — when isOpen becomes true, sets document.body.style.overflow = "hidden"; cleans up by resetting to "".
2. Escape key handler — adds a "keydown" listener when isOpen is true; calls onClose() when e.key === "Escape"; removes listener on cleanup.

Hook signature: useModalBehavior({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): void
- Returns nothing.
- Copy the effect bodies verbatim from lines 191-208 of the original.
- Import { useEffect } from "react".

--- Create src/features/reservations/hooks/useModalAssetLoader.ts ---

This hook owns all asset loading state and effects currently in reserve-event-modal.tsx:

State (copy types verbatim):
- loadingVenueAssets: boolean, initial false
- loadingVehicleAssets: boolean, initial false
- venueAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[], initial []
- vehicleAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[], initial []

Effects (copy verbatim from lines 210-280):
- When showVenueModal changes to true: set loadingVenueAssets true, setTimeout 1000ms, map assets to venueAssetsData or use hardcoded fallback, set venueAssets, set loadingVenueAssets false.
- When showVehicleModal changes to true: same pattern for vehicle assets.

Hook signature:
useModalAssetLoader({
  showVenueModal,
  showVehicleModal,
  assets,
}: {
  showVenueModal: boolean;
  showVehicleModal: boolean;
  assets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[] | undefined;
}): {
  loadingVenueAssets: boolean;
  loadingVehicleAssets: boolean;
  venueAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[];
  vehicleAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[];
}

Import { useEffect, useState } from "react". No other imports.

--- Create src/features/reservations/hooks/useEditModePopulate.ts ---

This hook owns the edit mode form population effect (lines 166-189 of the original).

When editMode is true, eventData is present, and isOpen becomes true: call setValue for each form field and call setTaggedPeople with the mapped people array.

Copy the effect body verbatim — do not change any field names, fallback values, or conditionals.

Hook signature:
useEditModePopulate({
  editMode,
  eventData,
  isOpen,
  setValue,
  setTaggedPeople,
}: {
  editMode: boolean;
  eventData: EventDetails | undefined;
  isOpen: boolean;
  setValue: UseFormSetValue&lt;ReservationFormData&gt;;
  setTaggedPeople: (people: { id: string; name: string }[]) => void;
}): void

Imports needed:
- import { useEffect } from "react"
- import { UseFormSetValue } from "react-hook-form"
- import { EventDetails } from "@/features/calendar/types/calendar.types"
- import { ReservationFormData } from "@/interface/user-props" (check that this is the correct type used by useReserveEventForm's setValue — if the import path differs in the original file use whatever is correct there)

--- Create src/features/reservations/components/reserve-event-modal/modal-header.tsx ---

"use client";

Extract the sticky header block (lines 324-361 of the original) as a presentational component.

Props interface:
interface ModalHeaderProps {
  editMode: boolean;
  displayDate: string;
  onClose: () => void;
}

Component: export function ModalHeader({ editMode, displayDate, onClose }: ModalHeaderProps)

Copy the JSX block verbatim — every className, every inline style, every conditional, every icon import (Edit, CalendarDays, X from "lucide-react"), Button from "@/shared/components/ui/button". Do not simplify or reformat.

--- Create src/features/reservations/components/reserve-event-modal/modal-tab-bar.tsx ---

"use client";

Extract the tab indicator bar block (lines 366-380 of the original) as a presentational component.

Props interface:
interface ModalTabBarProps {
  tabOrder: string[];
  tabLabels: Record&lt;string, string&gt;;
  activeTab: string;
}

Component: export function ModalTabBar({ tabOrder, tabLabels, activeTab }: ModalTabBarProps)

Wrap the existing div (the grid grid-cols-3 div) in a React fragment. Copy JSX verbatim — every className, every conditional class string, every inline style. No additional wrappers.

--- Create src/features/reservations/components/reserve-event-modal/modal-footer.tsx ---

"use client";

Extract the sticky footer block (lines 430-526 of the original) as a presentational component.

Props interface:
interface ModalFooterProps {
  activeTab: string;
  isSubmitting: boolean;
  isCheckingConflict: boolean;
  editMode: boolean;
  setActiveTab: (tab: string) => void;
  handleFormTabNext: () => void;
  handleAdditionalTabNext: () => void;
}

Component: export function ModalFooter({ activeTab, isSubmitting, isCheckingConflict, editMode, setActiveTab, handleFormTabNext, handleAdditionalTabNext }: ModalFooterProps)

Copy the JSX block verbatim — every className, all three conditional blocks (activeTab === "form", "additional", "summary"), every icon import (Loader2, ArrowLeft, ArrowRight, SendHorizontal from "lucide-react"), Button from "@/shared/components/ui/button". The outer wrapper div (sticky bottom-0 ...) is included in this component.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -40</automated>
    <manual>Confirm 7 new files exist. Check that none of them have lint errors for missing imports.</manual>
  </verify>
  <done>
    All 7 new files exist. npx tsc --noEmit introduces no new errors from the new files (pre-existing errors in other parts of the codebase are acceptable but no regressions from this work).
  </done>
</task>

<task type="auto">
  <name>Task 2: Slim down reserve-event-modal.tsx to compose the extracted pieces</name>
  <files>
    src/features/reservations/components/reserve-event-modal.tsx
  </files>
  <action>
Rewrite reserve-event-modal.tsx as a slim orchestrator. The component's public props interface (ModalProps) must remain identical. The rendered output must be byte-for-byte identical — no className changes, no structural JSX changes, no behavioral changes.

Steps:

1. Add imports for all new files:
   import { infoTypes, categories, peopleSuggestions, formattedAssets, formatDisplayDate } from "./reserve-event-modal/modal-constants"
   import { ModalHeader } from "./reserve-event-modal/modal-header"
   import { ModalTabBar } from "./reserve-event-modal/modal-tab-bar"
   import { ModalFooter } from "./reserve-event-modal/modal-footer"
   import { useModalBehavior } from "@/features/reservations/hooks/useModalBehavior"
   import { useModalAssetLoader } from "@/features/reservations/hooks/useModalAssetLoader"
   import { useEditModePopulate } from "@/features/reservations/hooks/useEditModePopulate"

2. Remove from this file (now owned by extracted files):
   - const infoTypes = [...]
   - const categories = [...]
   - const formatDisplayDate function
   - const peopleSuggestions = [...] (was inline in JSX, now imported)
   - The formattedAssets useMemo (replace with the imported constant)
   - The scroll lock useEffect
   - The escape key useEffect
   - The venue asset loading useEffect + loadingVenueAssets state + venueAssets state
   - The vehicle asset loading useEffect + loadingVehicleAssets state + vehicleAssets state
   - The edit mode population useEffect

3. Replace with hook calls in the component body:
   useModalBehavior({ isOpen, onClose });
   useEditModePopulate({ editMode, eventData, isOpen, setValue, setTaggedPeople });
   const { loadingVenueAssets, loadingVehicleAssets, venueAssets, vehicleAssets } = useModalAssetLoader({
     showVenueModal,
     showVehicleModal,
     assets,
   });
   const displayDate = useMemo(() => formatDisplayDate(eventDate), [eventDate]);

4. Replace the sticky header JSX block with:
   &lt;ModalHeader editMode={editMode} displayDate={displayDate} onClose={onClose} /&gt;

5. Replace the tab indicator bar div (grid grid-cols-3 ...) with:
   &lt;ModalTabBar tabOrder={tabOrder} tabLabels={tabLabels} activeTab={activeTab} /&gt;

6. Replace the sticky footer JSX block with:
   &lt;ModalFooter
     activeTab={activeTab}
     isSubmitting={isSubmitting}
     isCheckingConflict={isCheckingConflict}
     editMode={editMode}
     setActiveTab={setActiveTab}
     handleFormTabNext={handleFormTabNext}
     handleAdditionalTabNext={handleAdditionalTabNext}
   /&gt;

7. Keep in this file:
   - "use client" directive
   - All remaining imports (React hooks: useRef, useMemo; motion/AnimatePresence; Tabs/TabsContent; the three tab content components; AssetsVenueModal; AssetsVehicleModal; useAssets; useReserveEventForm; type imports)
   - ModalProps interface
   - contentRef = useRef&lt;HTMLDivElement&gt;(null)
   - All destructured values from useReserveEventForm(...)
   - useAssets() call
   - tabOrder and tabLabels definitions
   - The if (!isOpen) return null guard
   - The AnimatePresence/motion wrapper, the form, and the TabsContent blocks (with the three tab components wired exactly as before)
   - AssetsVenueModal and AssetsVehicleModal at the bottom of the JSX

8. Remove unused React imports after the refactor: useState is no longer needed (all state moved out). Keep useRef and useMemo. Keep useEffect only if any effect remains — after extraction there should be none, so remove useEffect from the import.

9. Do NOT change any prop passing to ReserveEventFormTab, ReserveEventAdditionalTab, ReserveEventSummaryTab, AssetsVenueModal, AssetsVehicleModal. Those must remain identical.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -40</automated>
    <manual>Confirm reserve-event-modal.tsx is now significantly shorter. Confirm no other files were modified (git diff --name-only should show only the 8 listed files).</manual>
  </verify>
  <done>
    npx tsc --noEmit passes with zero errors. reserve-event-modal.tsx is substantially shorter (target ~80-120 lines). git diff --name-only shows exactly the 8 files listed in files_modified.
  </done>
</task>

<task type="auto">
  <name>Task 3: Final verification — build check</name>
  <files></files>
  <action>
Run the full build to confirm nothing is broken end-to-end. Do not modify any files in this task unless a genuine error from this refactoring is found.

Commands to run in order:
1. npx tsc --noEmit — must produce zero errors
2. npm run build — must complete without errors (all static pages generated)

If either command fails, read the error output carefully. Only fix errors introduced by this refactoring. Most likely failure modes:
- Missing import in one of the new files (add the correct import)
- Type mismatch on a prop passed to a new component (use the exact type from the original)
- ReservationFormData import path incorrect in useEditModePopulate.ts (check what useReserveEventForm.ts imports and use the same path)
- assets type mismatch in useModalAssetLoader (check the return type of useAssets())

Fix any issues, then re-run both commands to confirm clean output.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    npx tsc --noEmit exits 0. npm run build completes successfully. No functionality has changed — only file organisation.
  </done>
</task>

</tasks>

<verification>
After all tasks complete:
- src/features/reservations/components/reserve-event-modal/ directory contains 4 files: modal-constants.ts, modal-header.tsx, modal-tab-bar.tsx, modal-footer.tsx
- src/features/reservations/hooks/ contains 3 new files: useModalBehavior.ts, useModalAssetLoader.ts, useEditModePopulate.ts
- reserve-event-modal.tsx is ~80-120 lines (down from 550)
- git diff --name-only shows exactly 8 files changed (the 7 new files + reserve-event-modal.tsx)
- No other files touched
- npx tsc --noEmit: zero errors
- npm run build: succeeds
- All Tailwind classes in the sub-components are verbatim copies from the original
</verification>

<success_criteria>
Seven new files created. reserve-event-modal.tsx reduced to a clean orchestrator. All Tailwind classes and JSX structure preserved verbatim in sub-components. ModalProps interface unchanged. TypeScript compiles clean. Build succeeds. No other files modified.
</success_criteria>

<output>
After completion, create .planning/quick/5-refactor-reserve-event-modal-tsx-to-fix-/5-SUMMARY.md using the summary template at @C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</output>
