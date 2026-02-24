---
phase: quick-6
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/stitch-prompt.md
autonomous: true
requirements: [QUICK-6]
must_haves:
  truths:
    - "A detailed Stitch prompt file exists at .planning/stitch-prompt.md"
    - "The prompt describes the NORSU Calendar System accurately (what it does, who uses it, all pages)"
    - "The prompt specifies a premium, modern design direction with concrete color, typography, and layout guidance"
    - "Every major page/view is listed with its current state and what improvement is needed"
    - "The prompt is self-contained — a designer reading it cold understands the full picture"
  artifacts:
    - path: ".planning/stitch-prompt.md"
      provides: "Complete Stitch design prompt for premium UI redesign"
      min_lines: 150
  key_links:
    - from: ".planning/stitch-prompt.md"
      to: "src/features/*, src/app/*, src/shared/components/*"
      via: "Describes every major UI surface identified in codebase analysis"
      pattern: "page|screen|component|color|typography"
---

<objective>
Analyze all existing UI components, color scheme, typography, layout patterns, and pages in the NORSU Calendar System codebase, then produce a comprehensive Stitch prompt that a designer can use to generate premium production-quality UI mockups.

Purpose: The current UI is functional but lacks a cohesive premium design identity. This prompt arms Stitch (Google's generative UI tool) with the full context needed to redesign each page to a professional, modern standard.

Output: `.planning/stitch-prompt.md` — a single, self-contained Stitch prompt file.
</objective>

<execution_context>
@C:/Users/Kaiser/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kaiser/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Analyze UI codebase and write stitch-prompt.md</name>
  <files>.planning/stitch-prompt.md</files>
  <action>
    Synthesize the full UI analysis gathered from the codebase and write a detailed Stitch prompt at `.planning/stitch-prompt.md`.

    **Codebase findings to encode in the prompt:**

    SYSTEM OVERVIEW:
    - Name: NORSU Calendar System (Negros Oriental State University)
    - Purpose: University event scheduling and reservation management
    - Roles: Admin, Dean, Staff (authenticated dashboard), Public (read-only calendar)
    - Tech stack: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui (Radix primitives), Framer Motion, Lucide icons

    CURRENT COLOR SCHEME (to reference as baseline, not preserve):
    - Primary blues: blue-600 / indigo-600 / indigo-700 for Dean role and login hero
    - Staff accent: purple-400 to purple-600 gradient
    - Public/calendar accent: teal-500
    - Admin: gray-800 (muted, no strong accent)
    - Stat cards: ad-hoc inline colors — #4E73DF (blue), #4edf88 (green), #fbbf24 (amber), #f87171 (red)
    - Backgrounds: white cards on bg-muted/50 (light gray), bg-[#f1f2f4] table headers
    - No dark mode implemented

    CURRENT TYPOGRAPHY (to reference):
    - Font: system default (no explicit font family on most pages; login page uses Poppins via class)
    - Headings: font-semibold / font-bold / font-extrabold, sizes ranging 2xl to 6xl
    - Body: text-sm / text-base, text-gray-500 / text-gray-600 / text-muted-foreground
    - Labels: UPPERCASE tracking-wide for stat card titles (bad practice — inconsistent with rest)

    CURRENT LAYOUT PATTERNS:
    - Dashboard shell: SidebarProvider + SidebarInset, collapsible icon sidebar (shadcn sidebar)
    - Top header bar: bg-white, h-18, shadow, with search input + notification icons + avatar dropdown
    - Content area: bg-muted/50, p-3 lg:p-6, overflow-y-auto
    - Cards: bg-white, rounded-md, shadow-sm, border, p-6
    - Tables: shadcn Table with bg-[#f1f2f4] header rows, white body rows, hover:bg-gray-50
    - Stat cards: border-l-8 colored left border, icon on right — SB Admin 2 style (dated)
    - Public homepage: split layout — 320px sidebar (upcoming events) + full-width calendar card

    CURRENT PAGES INVENTORY:
    1. Public home (/) — Navbar + calendar + upcoming-events sidebar + about section
    2. Public about section — Team cards, stats grid (4.2 years, 50+ projects, 1.2k+ users, 200+ institutions)
    3. Login (/login or /auth/dean/login, /auth/staff/login) — Split card, gradient left panel with logo, form right
    4. Register (/auth/dean/register, /auth/staff/register) — Tabbed multi-step form (form tab, summary tab)
    5. Admin login (/auth/admin/login) — Separate admin login
    6. Dashboard (/[role]/dashboard) — 4 stat cards grid + line chart (assets) + bar chart (users)
    7. Calendar (/[role]/calendar) — Full calendar with event dots, month navigation, role-colored today
    8. Reservations (/[role]/reservations) — Filterable/searchable table, click row to open event info modal
    9. Accounts (/[role]/accounts) — Account management page (form-based)
    10. Asset Management (/[role]/asset-management) — Asset table (name, type, location, capacity, status, condition, date)
    11. Profile (/[role]/profile) — User profile + password security tabs
    12. Reserve Event Modal — Multi-tab modal (event form, additional info, assets/vehicles/venues, summary)
    13. Asset Register Modal — Multi-tab modal (form, summary)

    CURRENT DESIGN PROBLEMS TO CALL OUT IN PROMPT:
    - Stat cards use SB Admin 2 era colored-left-border pattern (feels dated, 2018-era admin)
    - No design system color tokens — ad-hoc hex values (#4E73DF) mixed with Tailwind classes
    - Login pages have inconsistent styling (user login vs dean/staff login look different)
    - Public home navbar is bare white with no visual identity beyond logo
    - Table headers use hardcoded bg-[#f1f2f4] — not a semantic token
    - Calendar dots and role-color system is functional but not visually prominent enough
    - Sidebar uses shadcn defaults — no custom branding
    - Charts (line/bar) use generic styling — no branded color palette
    - About section copy is clearly placeholder text (fictional founders)
    - No empty states with illustrations — plain text "No reservations found"

    **What to write in the prompt:**

    Structure the `.planning/stitch-prompt.md` with these sections:
    1. Project context (what the system does, who uses it, why it matters for a university)
    2. Design direction (modern institutional — think Notion + Linear + university portal, NOT generic Bootstrap admin)
    3. Recommended color system (specific primary, secondary, accent, semantic colors for university context)
    4. Typography system (specific font stack recommendations)
    5. Component patterns to follow (cards, tables, badges, modals, sidebar)
    6. Page-by-page improvement briefs (for each of the 13 surfaces listed above)
    7. What NOT to do (anti-patterns to avoid)
    8. Stitch-specific instructions (telling Stitch to generate high-fidelity, desktop-first, light mode screens)

    For the recommended color palette, suggest:
    - Primary: NORSU institutional color context — deep navy blue (#1E3A5F or similar) as anchor
    - Accent: Warm gold/amber (#F59E0B or #D97706) for highlights, CTAs — common in Philippine university branding
    - Neutral: Slate-based gray scale (slate-50 through slate-900)
    - Semantic: Green for approved/available, Amber for pending/maintenance, Red for declined/unavailable, Blue for informational
    - Surface: Pure white cards on off-white (#F8FAFC) background

    For typography, suggest:
    - Heading font: Inter or Plus Jakarta Sans (modern, humanist, legible at all sizes)
    - Body font: Inter (consistent, widely used in SaaS/admin products)
    - Monospace: JetBrains Mono (for IDs, codes if needed)

    Write the prompt in a direct, instructional tone — Stitch should treat this as a design brief from a product team. Include specific screen dimensions (1440px desktop primary), specific component examples, and clear priorities (dashboard and reservations table are highest priority for redesign).
  </action>
  <verify>
    <automated>node -e "const fs = require('fs'); const content = fs.readFileSync('.planning/stitch-prompt.md', 'utf8'); const lines = content.split('\n').length; console.log('Lines:', lines); if (lines < 150) throw new Error('Prompt too short: ' + lines + ' lines'); if (!content.includes('NORSU')) throw new Error('Missing NORSU context'); if (!content.includes('color')) throw new Error('Missing color section'); if (!content.includes('dashboard') || !content.includes('Dashboard')) throw new Error('Missing dashboard page'); console.log('PASS');"</automated>
    <manual>Open .planning/stitch-prompt.md and verify it reads like a complete design brief — someone unfamiliar with the codebase should understand exactly what to design.</manual>
  </verify>
  <done>
    `.planning/stitch-prompt.md` exists, is at least 150 lines, covers all 13 UI surfaces, specifies color system, typography, component patterns, and per-page improvement briefs. The file is ready to paste directly into Stitch.
  </done>
</task>

</tasks>

<verification>
Run the automated verify command from Task 1. Confirm the file exists and is substantive.
</verification>

<success_criteria>
- `.planning/stitch-prompt.md` exists and is comprehensive (150+ lines)
- All major pages/views are described with current state and target improvement
- Color palette, typography, and component patterns are concretely specified
- The prompt is self-contained and actionable for a Stitch session
</success_criteria>

<output>
After completion, create `.planning/quick/6-analyze-ui-codebase-and-create-stitch-pr/6-SUMMARY.md` documenting:
- What was produced (stitch-prompt.md path, line count)
- Key design decisions encoded in the prompt
- Pages covered
- Recommended next step (paste prompt into Stitch, generate screens, implement)
</output>
