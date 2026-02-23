---
phase: quick-4
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/reservations/hooks/useReserveEventForm.ts
  - src/features/reservations/hooks/useFormNormalizers.ts
  - src/features/reservations/hooks/usePeopleTagging.ts
  - src/features/reservations/hooks/useAssetSelection.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "useReserveEventForm.ts returns the exact same API (all same keys in the returned object)"
    - "normalizeTime and normalizeDate are defined once and reused — not duplicated"
    - "People tagging state and handlers live in usePeopleTagging.ts"
    - "Asset selection modal state and handlers live in useAssetSelection.ts"
    - "reserve-event-modal.tsx compiles without changes (no import changes)"
    - "npx tsc --noEmit passes with zero errors"
  artifacts:
    - path: "src/features/reservations/hooks/useFormNormalizers.ts"
      provides: "normalizeTime and normalizeDate utility functions"
      exports: ["normalizeTime", "normalizeDate"]
    - path: "src/features/reservations/hooks/usePeopleTagging.ts"
      provides: "People tagging state and handlers"
      exports: ["usePeopleTagging"]
    - path: "src/features/reservations/hooks/useAssetSelection.ts"
      provides: "Asset modal selection state and handlers"
      exports: ["useAssetSelection"]
    - path: "src/features/reservations/hooks/useReserveEventForm.ts"
      provides: "Slim orchestrator composing sub-hooks"
      exports: ["useReserveEventForm"]
  key_links:
    - from: "src/features/reservations/hooks/useReserveEventForm.ts"
      to: "src/features/reservations/hooks/useFormNormalizers.ts"
      via: "named import"
      pattern: "import.*normalizeTime.*normalizeDate.*useFormNormalizers"
    - from: "src/features/reservations/hooks/useReserveEventForm.ts"
      to: "src/features/reservations/hooks/usePeopleTagging.ts"
      via: "hook call"
      pattern: "usePeopleTagging"
    - from: "src/features/reservations/hooks/useReserveEventForm.ts"
      to: "src/features/reservations/hooks/useAssetSelection.ts"
      via: "hook call"
      pattern: "useAssetSelection"
---

<objective>
Refactor useReserveEventForm.ts to fix the single responsibility principle by extracting three focused units without changing any external behaviour.

Purpose: The 506-line hook mixes date normalization utilities (duplicated in two places), people-tagging state, asset-selection state, conflict-checking logic, and submission logic into one file. Splitting into focused files removes the duplication and makes each concern independently readable.

Output:
- src/features/reservations/hooks/useFormNormalizers.ts (new)
- src/features/reservations/hooks/usePeopleTagging.ts (new)
- src/features/reservations/hooks/useAssetSelection.ts (new)
- src/features/reservations/hooks/useReserveEventForm.ts (slimmed orchestrator)

The public API of useReserveEventForm — every key in the returned object — must remain identical. reserve-event-modal.tsx must not require any changes.
</objective>

<execution_context>
@C:/Users/Kaiser/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/features/reservations/hooks/useReserveEventForm.ts
@src/features/reservations/components/reserve-event-modal.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract useFormNormalizers, usePeopleTagging, and useAssetSelection into separate files</name>
  <files>
    src/features/reservations/hooks/useFormNormalizers.ts
    src/features/reservations/hooks/usePeopleTagging.ts
    src/features/reservations/hooks/useAssetSelection.ts
  </files>
  <action>
Read src/features/reservations/hooks/useReserveEventForm.ts in full before writing anything.

Create src/features/reservations/hooks/useFormNormalizers.ts:
- Export two named functions: normalizeTime and normalizeDate.
- Copy the implementations verbatim from the FIRST occurrence in useReserveEventForm.ts (the ones inside onSubmitForm). They are pure functions with no dependencies on React or any hook state.
- normalizeTime(time: string): string — pads hour/minute, returns "00:00" for empty input.
- normalizeDate(dateStr: string): string — handles YYYY-MM-DD pass-through, ISO split, and UTC fallback. Returns "" for empty/invalid input.
- No default export. No other code.

Create src/features/reservations/hooks/usePeopleTagging.ts:
- This hook owns all people-tagging state and handlers currently living in useReserveEventForm:
  - State: tagInput (string), taggedPeople ({ id: string; name: string }[]), showDropdown (boolean)
  - Ref: peopleFieldRef (useRef<HTMLInputElement>(null))
  - Handlers: handleTagInputChange, handleTagSelect, handleRemoveTag
  - Setter: setTaggedPeople (expose it so the parent hook can reset it and edit-mode population in reserve-event-modal.tsx still works)
- The hook receives no props.
- Return shape (exact names required — reserve-event-modal.tsx destructures these):
  {
    tagInput,
    taggedPeople,
    showDropdown,
    setShowDropdown,
    peopleFieldRef,
    setTaggedPeople,
    handleTagInputChange,
    handleTagSelect,
    handleRemoveTag,
  }
- Import React, useRef, useState from "react".

Create src/features/reservations/hooks/useAssetSelection.ts:
- This hook owns asset-selection modal state and handlers:
  - State: showVenueModal (boolean), showVehicleModal (boolean)
  - Handler: handleAssetChange(value: string) — sets showVenueModal/showVehicleModal based on parseInt(value)
  - Handler: handleAssetItemSelect(asset: { id: number; asset_name: string; asset_type: string; capacity: number }) — calls setValue and closes both modals
- The hook receives one prop: setValue (React Hook Form's setValue for ReservationFormData).
- Import type ReservationFormData from "@/interface/user-props". Use UseFormSetValue<ReservationFormData> from "react-hook-form" as the type for setValue.
- Return shape (exact names required):
  {
    showVenueModal,
    setShowVenueModal,
    showVehicleModal,
    setShowVehicleModal,
    handleAssetChange,
    handleAssetItemSelect,
  }
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -30</automated>
    <manual>Confirm three new files exist in src/features/reservations/hooks/</manual>
  </verify>
  <done>
    Three new files exist. npx tsc --noEmit reports zero errors for the new files (existing errors elsewhere are acceptable but no new errors introduced by the new files).
  </done>
</task>

<task type="auto">
  <name>Task 2: Slim down useReserveEventForm.ts to compose the extracted hooks</name>
  <files>
    src/features/reservations/hooks/useReserveEventForm.ts
  </files>
  <action>
Rewrite useReserveEventForm.ts as a slim orchestrator. The returned object must be byte-for-byte identical in its key names to the original — reserve-event-modal.tsx must compile without any changes.

Steps:

1. Add imports for the three new hooks:
   import { normalizeTime, normalizeDate } from "./useFormNormalizers"
   import { usePeopleTagging } from "./usePeopleTagging"
   import { useAssetSelection } from "./useAssetSelection"

2. Remove the internal declarations of normalizeTime, normalizeDate (both inline copies inside onSubmitForm and handleFormTabNext), tagInput state, taggedPeople state, showDropdown state, peopleFieldRef ref, handleTagInputChange, handleTagSelect, handleRemoveTag, showVenueModal state, showVehicleModal state, handleAssetChange, handleAssetItemSelect.

3. Call usePeopleTagging() at the top of the hook body. Destructure all keys from its return value.

4. Call useAssetSelection(setValue) after the react-hook-form setup (setValue comes from form destructuring). Destructure all keys from its return value.

5. In onSubmitForm: replace the two inline normalizeTime/normalizeDate function definitions with calls to the imported normalizeTime and normalizeDate.

6. In handleFormTabNext: replace the two inline normalizeTime/normalizeDate function definitions with calls to the imported normalizeTime and normalizeDate.

7. The return statement must remain identical — spread nothing, list every key explicitly as before. Verify the list matches the original exactly:
   form, control, errors, isSubmitting, register, watch, activeTab, setActiveTab,
   showVenueModal, setShowVenueModal, showVehicleModal, setShowVehicleModal,
   tagInput, taggedPeople, showDropdown, setShowDropdown, peopleFieldRef,
   watchedAsset, getValues, setValue, setTaggedPeople,
   handleAssetChange, handleAssetItemSelect,
   handleTagInputChange, handleTagSelect, handleRemoveTag,
   isFormValid, handleFormTabNext, handleAdditionalTabNext,
   handleFormSubmit, resetForm, validationRules, isCheckingConflict

8. In resetForm and the isOpen useEffect reset block, the setTaggedPeople and setTagInput calls are now sourced from usePeopleTagging — they are already in scope from the destructuring in step 3, so no change to logic is needed.

9. The ReservationResponse interface and UseReserveEventFormProps interface remain in this file (they are not exported elsewhere).

10. getCurrentTime() utility function remains in this file (used only here).

Do NOT change reserve-event-modal.tsx.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit 2>&1 | head -40</automated>
    <manual>Confirm reserve-event-modal.tsx was not touched. Diff useReserveEventForm.ts to confirm return object keys are unchanged.</manual>
  </verify>
  <done>
    npx tsc --noEmit passes with zero errors. useReserveEventForm.ts no longer contains duplicate normalizeTime/normalizeDate definitions. reserve-event-modal.tsx is unchanged. All 4 files in hooks/ are present.
  </done>
</task>

<task type="auto">
  <name>Task 3: Final verification — build check</name>
  <files></files>
  <action>
Run the full build to confirm nothing is broken end-to-end. Do not modify any files in this task.

Commands to run in order:
1. npx tsc --noEmit — must produce zero errors
2. npm run build — must complete without errors (all static pages generated)

If either command fails, read the error output carefully and fix the root cause in the relevant hook file. The most likely failures are:
- Type mismatch on setValue prop passed to useAssetSelection (use UseFormSetValue<ReservationFormData> from react-hook-form)
- Missing import for a type used in the new files
- A key missing or renamed in the useReserveEventForm return object

Fix any issues, then re-run both commands to confirm clean output.
  </action>
  <verify>
    <automated>cd C:/Projects/norsu-calendar-system && npx tsc --noEmit && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    npx tsc --noEmit exits 0. npm run build completes successfully and generates all static pages. No functionality has changed — only file organisation.
  </done>
</task>

</tasks>

<verification>
After all tasks complete:
- src/features/reservations/hooks/ contains exactly 4 files: useReserveEventForm.ts, useFormNormalizers.ts, usePeopleTagging.ts, useAssetSelection.ts
- useReserveEventForm.ts no longer contains any inline normalizeTime or normalizeDate function body
- usePeopleTagging.ts contains tagInput, taggedPeople, showDropdown state
- useAssetSelection.ts contains showVenueModal, showVehicleModal state
- reserve-event-modal.tsx is unmodified (git diff shows no changes to it)
- npx tsc --noEmit: zero errors
- npm run build: succeeds
</verification>

<success_criteria>
Four files in hooks/ directory. normalizeTime/normalizeDate defined once in useFormNormalizers.ts and imported (not duplicated). People tagging and asset selection concerns in dedicated hook files. useReserveEventForm.ts is a composition root. reserve-event-modal.tsx unchanged. TypeScript compiles clean. Build succeeds.
</success_criteria>

<output>
After completion, create .planning/quick/4-refactor-usereserveeventform-ts-to-fix-s/4-SUMMARY.md using the summary template at @C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</output>
