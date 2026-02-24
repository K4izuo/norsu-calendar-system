---
phase: quick-6
plan: 1
subsystem: design
tags: [design, ui, stitch, ux, redesign]
dependency_graph:
  requires: []
  provides: [stitch-prompt.md]
  affects: [future UI implementation tasks]
tech_stack:
  added: []
  patterns: []
key_files:
  created:
    - .planning/stitch-prompt.md
  modified: []
decisions:
  - "Deep navy #1E3A5F as primary brand color anchoring NORSU institutional identity"
  - "Amber #D97706 as accent/CTA color for Philippine university branding warmth"
  - "Slate scale (not gray) for all neutrals — more cohesive with navy primary"
  - "SB Admin 2 colored-left-border stat card pattern flagged as highest-priority anti-pattern to replace"
  - "Dashboard and Reservations table marked P0 — most impactful and most visible design debt"
  - "Plus Jakarta Sans recommended for headings over Inter — humanist and warmer for institutional context"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-02-24"
  tasks_completed: 1
  files_created: 1
---

# Phase quick-6 Plan 1: Analyze UI Codebase and Create Stitch Design Brief Summary

**One-liner:** Produced a 417-line Stitch design brief covering all 13 NORSU Calendar System UI surfaces with deep navy + amber color system, Plus Jakarta Sans typography, and per-page improvement briefs prioritized by design debt severity.

---

## What Was Produced

**File:** `.planning/stitch-prompt.md`
**Line count:** 417 lines (target was 150+)
**Sections:** 9 structured sections covering full design context

The brief is self-contained — a designer (or Stitch session) reading it cold has everything needed to produce high-fidelity mockups without codebase access.

---

## Codebase Analysis Performed

The following files were read and analyzed before writing the prompt:

**Pages (all 13 surfaces):**
- `src/app/page.tsx` — Public home with calendar + sidebar layout
- `src/app/_components/home-navbar.tsx` — Bare white navbar, no brand identity
- `src/app/_components/upcoming-events-sidebar.tsx` — Simple list, no visual hierarchy
- `src/shared/components/ui/about-section.tsx` — Placeholder copy, real team photos
- `src/app/(auth)/login/page.tsx` — Blue/indigo gradient split-card login
- `src/app/(auth)/register/page.tsx` — Role selection (Dean/Staff cards)
- `src/app/auth/dean/login/page.tsx` — Dean-specific login panel
- `src/app/auth/admin/login/page.tsx` — Admin login with gray-700/800 gradient
- `src/app/(dashboard)/[role]/layout.tsx` — Dashboard shell (SidebarProvider + SidebarInset)
- `src/app/(dashboard)/[role]/dashboard/page.tsx` — 4 stat cards with ad-hoc hex colors
- `src/app/(dashboard)/[role]/calendar/page.tsx` — Calendar + EventsListModal
- `src/app/(dashboard)/[role]/reservations/page.tsx` — Filterable reservations table
- `src/app/(dashboard)/[role]/asset-management/page.tsx` — Assets table + add button
- `src/app/(dashboard)/[role]/accounts/page.tsx` — Stub (shows "User Accounts" text only)
- `src/app/(dashboard)/[role]/profile/page.tsx` — Profile sidebar + content tabs

**Key components analyzed:**
- `src/shared/components/user-dashboard-ui/dashboard/stat-card.tsx` — SB Admin 2 border-l-8 pattern confirmed
- `src/shared/components/user-dashboard-ui/reservations/reservation-table.tsx` — Hardcoded bg-[#f1f2f4] header
- `src/shared/components/layouts/app-sidebar.tsx` — shadcn sidebar defaults, no custom branding
- `src/features/reservations/components/reserve-event-modal.tsx` — 3-tab modal, Framer Motion animation
- `src/features/assets/components/asset-register-modal.tsx` — 2-tab modal, matching structure
- `src/features/calendar/components/norsu-calendar.tsx` — Role-color system for today indicator
- `src/app/globals.css` — CSS custom properties, OKLCH color tokens, no custom brand tokens

---

## Key Design Decisions Encoded in the Brief

1. **Primary color:** Deep navy `#1E3A5F` — anchors NORSU institutional identity, replaces the inconsistent blue-600/indigo-600/indigo-700 mix currently scattered across pages.

2. **Accent color:** Warm gold/amber `#D97706` — for CTAs and highlights. Common in Philippine university branding. Kept separate from semantic amber used for "Pending" status.

3. **Neutral scale:** Slate (not gray) — more cohesive with navy, better contrast ratios, semantic naming.

4. **Highest-priority anti-pattern:** The SB Admin 2 colored-left-border stat card (border-l-8 with inline style `borderLeftColor`) is identified as P0 design debt. Replace with flat white cards + icon-in-square pattern.

5. **Typography:** Plus Jakarta Sans for headings (warmer, more humanist than Inter), Inter for body. Eliminates current inconsistency (Poppins on login, system-default everywhere else).

6. **Login unification:** All 4 login pages (user, dean, staff, admin) should share one component with role-specific left panel text only — currently they have slightly different structures and branding.

7. **Empty states:** Identified as completely missing across Reservations, Assets, and Calendar — the brief specifies illustration + heading + body + CTA pattern for all empty states.

---

## Pages Covered

| # | Surface | Priority | Key Issue |
|---|---------|----------|-----------|
| 1 | Public home (/) | P2 | No brand identity, bare navbar |
| 2 | Public about section | P4 | Placeholder copy, fictional founders still referenced |
| 3 | User login (/login) | P1 | Inconsistent with dean/staff/admin login |
| 4 | Register role selection (/register) | P4 | Minimal styling, blue/purple split looks arbitrary |
| 5 | Dean/Staff registration | P4 | No progress indicator, plain form |
| 6 | Dashboard (/[role]/dashboard) | P0 | SB Admin 2 stat cards, ad-hoc hex values |
| 7 | Calendar (/[role]/calendar) | P1 | Functional but lacks visual prominence |
| 8 | Reservations table | P0 | Hardcoded bg-[#f1f2f4], no empty state illustration |
| 9 | Accounts page | P3 | Stub only — blank page with "User Accounts" text |
| 10 | Asset Management | P3 | Table-heavy, needs empty state + row actions |
| 11 | Profile | P3 | NORSU logo used as avatar placeholder |
| 12 | Reserve Event Modal | P2 | Tab bar styling inconsistent with other modals |
| 13 | Asset Register Modal | P2 | Matches ReserveEventModal pattern, needs refinement |

---

## Recommended Next Step

1. Open `.planning/stitch-prompt.md`
2. Paste the full content into a Stitch session (Google Stitch)
3. Start with P0 screens: Dashboard and Reservations Table
4. Generate 1440px desktop-first screens for each of the 9 priority surfaces listed in Section 8
5. Export mockups and use them as the reference for a UI implementation phase

---

## Deviations from Plan

None. Plan executed exactly as written.

---

## Self-Check: PASSED

- `.planning/stitch-prompt.md` exists: FOUND
- Line count 417 (>150): PASSED
- Contains "NORSU": PASSED
- Contains "color": PASSED
- Contains "dashboard"/"Dashboard": PASSED
- Commit 86f9717 exists: VERIFIED
