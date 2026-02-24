# NORSU Calendar System — Stitch Design Brief

**Prepared for:** Google Stitch (generative UI)
**Target output:** High-fidelity desktop-first mockups, light mode, 1440px primary canvas
**Scope:** Full premium UI redesign for all screens — do not reference existing design; treat this as a greenfield redesign brief grounded in the codebase analysis below.

---

## 1. Project Context

**System name:** NORSU Calendar System
**Institution:** Negros Oriental State University (Philippines)
**Purpose:** University-wide event scheduling and asset reservation management. Enables faculty and staff to reserve venues, vehicles, and other campus assets for events; administrators to approve/decline requests and monitor usage.

**User roles:**
- **Admin** — Full system access: manages all accounts, assets, reservations, and generates reports
- **Dean** — Faculty management access: creates and manages reservations for their college/department, views calendar events
- **Staff** — Operational access: similar to Dean but for staff-specific workflows
- **Public** — Read-only calendar view at the landing page; no authentication required

**Core user flows:**
1. Public visitor views upcoming approved events on a calendar; no login needed
2. Dean/Staff logs in, browses calendar, clicks a date, opens a reservation form modal, submits for approval
3. Admin reviews pending reservation requests in a table, approves or declines
4. Admin registers new assets (venues, vehicles) via a multi-step modal form
5. All authenticated users can view their profile and change their password

**Why this redesign matters:**
The current UI is functional but built around 2018-era admin patterns (SB Admin 2-style colored-border stat cards, hardcoded hex colors, generic Bootstrap-like tables). The system serves a Philippine state university and should project institutional credibility, modern digital-first identity, and clarity under high cognitive load (scheduling + approval workflows require dense information display done well).

---

## 2. Design Direction

**Reference aesthetic:** Notion + Linear + Vercel Dashboard. NOT Bootstrap admin, NOT generic SaaS dashboard.

**Tone:** Premium institutional. Authoritative but approachable. Clean, airy, with purposeful use of color. University portals in Southeast Asia often feel dated — this one should feel like a flagship digital product.

**Key principles:**
- **Information density done right** — tables and forms must be scannable, not cramped
- **Role clarity** — the UI can subtly signal which role you're in without being heavy-handed
- **No decorative clutter** — every UI element must earn its place
- **Interaction quality** — animations are already in the codebase (Framer Motion); the redesign should show smooth transitions at the motion level, not just static states

**Primary reference screens (for Stitch):**
- Vercel Dashboard for the analytics/overview layout
- Linear for the sidebar and navigation pattern
- Notion for the subtle, clean form design
- Philippine Government portal design standards for institutional trust signals (NORSU seal, university colors)

---

## 3. Recommended Color System

**Primary anchor:** Deep navy blue — `#1E3A5F` (or `#1B3A6B`)
- This should be the dominant identity color: sidebar background, primary CTAs, key headings
- Inspired by NORSU's institutional blue; deeper and more sophisticated than the current blue-600/indigo-600 mix

**Accent / CTA:** Warm gold/amber — `#D97706` (Amber-600) or `#F59E0B` (Amber-400)
- Use sparingly: primary action buttons, active state highlights, important badges
- Common in Philippine university branding; creates warmth against the navy
- Do NOT use amber for semantic warning states — keep it as the brand accent only

**Neutral scale:** Slate (not gray)
- `slate-50` (#F8FAFC) — page background
- `slate-100` (#F1F5F9) — table header rows, secondary backgrounds
- `slate-200` (#E2E8F0) — borders, dividers
- `slate-500` (#64748B) — secondary text, muted labels
- `slate-700` (#334155) — primary body text
- `slate-900` (#0F172A) — headings, high-contrast text

**Semantic colors (status indicators):**
- **Green** `#16A34A` / bg `#DCFCE7` — Approved, Available, Success
- **Amber** `#D97706` / bg `#FEF3C7` — Pending, Maintenance, Warning
- **Red** `#DC2626` / bg `#FEE2E2` — Declined, Unavailable, Error
- **Blue** `#2563EB` / bg `#DBEAFE` — Informational, In Progress

**Surface colors:**
- Card background: pure white `#FFFFFF`
- Page background: off-white `#F8FAFC` (slate-50)
- Sidebar background: deep navy `#1E3A5F`
- Sidebar text: white / slate-200
- Header bar: white with 1px slate-200 bottom border (no shadow)

**What to avoid:**
- The current ad-hoc hex values (`#4E73DF`, `#4edf88`) that exist only in the stat cards — replace entirely
- The blue-to-indigo gradient on the login left panel — replace with flat navy or a subtle brand illustration
- Mixed purple/teal/blue role-color system — consolidate to a single brand palette

---

## 4. Typography System

**Heading font:** Plus Jakarta Sans (preferred) or Inter
- Humanist, modern, slightly warmer than Inter
- Use for all h1–h4 level headings, modal titles, stat values
- Weights: 600 (semibold) for subheadings, 700 (bold) for primary headings

**Body font:** Inter
- Use for all body text, labels, table cells, form fields
- Weights: 400 (regular) for body, 500 (medium) for labels and secondary headings

**Monospace (if needed):** JetBrains Mono
- Use only for IDs, reference numbers, codes — not for general content

**Type scale:**
- `xs` (11px) — badge text, table sub-labels
- `sm` (13px) — table body text, form helper text
- `base` (15px) — body text, form field text, sidebar nav items
- `lg` (18px) — card section headings, modal section titles
- `xl` (20px) — page titles, modal primary headings
- `2xl` (24px) — dashboard stat values
- `3xl–4xl` (30–36px) — landing page hero text only

**Typography rules:**
- No UPPERCASE tracking-wide for stat card titles (current bad pattern) — use sentence case or title case
- No mixed font families within the same component
- Consistent line height: 1.5 for body, 1.2 for headings

---

## 5. Component Patterns to Follow

### Sidebar (App Navigation)
- Background: deep navy `#1E3A5F`
- Top: NORSU logo (white) + "NORSU Calendar" wordmark
- Nav items: white/slate-200 text, amber left-border indicator for active state
- Collapsed state: icon-only with amber active indicator
- Footer: user avatar + name + role badge (small pill)
- No TeamSwitcher dropdown — role is clear from context

### Header Bar
- Background: pure white
- Height: 64px (reduce from current 72px)
- Left: sidebar toggle + breadcrumb trail
- Right: notification bell (with unread count badge), mail icon, user avatar
- Search: move to a command palette (CMD+K) instead of always-visible input bar
- Border: 1px solid slate-200 bottom border (no box shadow)

### Stat Cards (Dashboard)
**Replace** the SB Admin 2-era colored-left-border pattern entirely.

New pattern: Flat white cards, 16px radius, subtle 1px slate-200 border, no left border accent.
- Top row: icon in a small colored square (navy or amber), stat label in slate-500 (sentence case)
- Center: large stat value in slate-900 (2xl font, bold)
- Bottom row: trend indicator (green arrow up / red arrow down) + comparison text ("vs last month")
- Icon colors: navy for user-related, amber for event-related, green for approved, red for pending issues

### Tables
- Header row: slate-100 background, slate-500 text, 13px medium weight
- Body rows: white background, slate-700 text, 15px
- Row hover: slate-50 background transition (100ms)
- Status badges: pill-shaped (rounded-full), semantic colors defined above
- Empty state: centered illustration placeholder + primary heading + secondary text + CTA button
- Pagination: bottom-right, simple prev/next with page count

### Cards
- Background: white
- Border: 1px solid slate-200
- Border radius: 12px (rounded-xl)
- Padding: 24px
- Shadow: none (border is sufficient) — only elevation-1 shadow on modals

### Badges / Status Pills
- Rounded-full, 5px vertical padding, 10px horizontal padding
- APPROVED: green background (#DCFCE7), green text (#15803D), green dot
- PENDING: amber background (#FEF3C7), amber text (#B45309), amber dot
- DECLINED: red background (#FEE2E2), red text (#991B1B), red dot
- AVAILABLE: same as APPROVED
- MAINTENANCE: same as PENDING
- UNAVAILABLE: same as DECLINED

### Modals
- Max-width: 864px (wide) or 640px (narrow forms)
- Backdrop: black 40% opacity blur
- Header: border-bottom 1px slate-200, icon + title left-aligned, X close button right
- Tab bar: pill-style tabs at top, not underline style
- Footer: sticky bottom bar with Back + Next/Submit buttons
- Animation: slide-up 200ms ease-out (already implemented, keep it)

### Forms
- Label: slate-700, 13px medium, above the field
- Input: white background, 1px slate-300 border, 10px radius, 40px height, focus ring in navy
- Select: same as Input
- Error state: red border, red error text below field
- Required indicator: asterisk in red, not "(required)" text

### Calendar Day Cell
- Today: navy background, white date number
- Has-event indicator: amber dot below the date number (single dot for 1 event, filled circle for 2+)
- Non-current month days: slate-300 text, dimmed
- Hover: slate-100 background
- Selected: navy outline border

---

## 6. Page-by-Page Improvement Briefs

### Surface 1: Public Home (/)
**Current state:** Bare white navbar with centered logo + title text. Calendar card and upcoming events sidebar on a gray background. No branding identity beyond the logo. About section below the fold.

**Target improvements:**
- Navbar: Add a thin navy top bar (4px) as a brand strip. Logo left-aligned. Title "NORSU Calendar System" center. "About" nav link and a "Sign In" button right-aligned (currently hidden — reveal it).
- Hero: Replace the flat gray `bg-muted/50` with a subtle diagonal navy-to-slate gradient or a soft pattern (university feel). The calendar card should appear elevated with a clean white card on this background.
- Upcoming Events sidebar: Replace the plain `bg-gray-50` list items with timeline-style event entries — colored left accent bar (amber), event title bold, date below in slate-500.
- Empty state for upcoming events: Add an illustration or icon + "No upcoming events this month" message styled properly.
- Overall: 1440px desktop — calendar takes ~70% width, sidebar takes ~30%.

### Surface 2: Public About Section
**Current state:** Placeholder copy with fictional founders ("Alex Rivera and Elena Chen"). Stats grid with made-up numbers. Real team photos but copy/layout feels generic.

**Target improvements:**
- Update hero quote to something NORSU-specific: "Streamlining campus event management for Negros Oriental State University"
- Stats grid: Show real-sounding institutional stats (founding year, number of campuses, system users, events managed per semester)
- Team cards: Keep the real team photos and names (Cris Justine Oracion, Dexter Orcullo, Kenneth Lei Munez). Update role descriptions to be more specific.
- Layout: Two-column grid with the narrative card on left, image + stats on right (keep current structure, improve typography and whitespace).
- The "How It Started" framing is wrong for a student project — change to "About the System" or "Our Mission".

### Surface 3: User Login (/login)
**Current state:** Split card — blue-to-indigo gradient left panel with NORSU logo and decorative circles, login form on right. Uses Poppins font. Different from Dean/Staff login visually (same structure but minor differences).

**Target improvements:**
- Left panel: Replace gradient with flat deep navy `#1E3A5F`. Remove decorative circles. Add NORSU logo (larger, white), university name, and a one-sentence description ("Manage campus events and reservations").
- Add 3 feature bullets with icons (Calendar Events, Asset Booking, Real-time Approval) in muted white below the description.
- Right panel: Clean white form. "Welcome back" heading in slate-900 (xl, bold). Username and password fields with proper labels. "Forgot password?" link. Primary CTA button in navy. Below button: link to register page.
- Unify all login pages (user, dean, staff, admin) into one consistent component with role-specific left panel text only.
- Admin login left panel: Use slate-800 instead of navy. Shield icon + "System Administration" title.

### Surface 4: Register Role Selection (/register)
**Current state:** Minimal page with a plain white card, a "SELECT USER TO REGISTER" heading, and two role cards (Dean in blue, Staff in purple).

**Target improvements:**
- Full-page layout matching the login page aesthetic (navy top bar, centered card).
- Replace the "SELECT USER TO REGISTER" text with "Create your account" as heading.
- Role selection cards: Larger, icon-forward. Dean card with GraduationCap icon, brief description of what the Dean role can do. Staff card with Briefcase icon, description.
- Hover state: amber border glow, not the current blue/purple color split.
- Add a back link to the landing page.

### Surface 5: Dean/Staff Registration (/auth/dean/register, /auth/staff/register)
**Current state:** Multi-step form with "form" tab and "summary" tab. Minimal styling.

**Target improvements:**
- Progress indicator at the top: step 1 (Personal Details) and step 2 (Review & Submit) shown as a horizontal progress track with navy active state.
- Form fields: Clean Inter font, proper labels, grouped into logical sections (Personal Info, Academic Info) with subtle section dividers.
- Summary tab: Card-style review with key-value pairs, organized into the same sections as the form.
- Submit button: Navy background, amber hover.

### Surface 6: Dashboard (/[role]/dashboard)
**Current state:** 4 stat cards with SB Admin 2 colored-left-border pattern using ad-hoc hex values (#4E73DF, #4edf88, #fbbf24, #f87171). Line chart (Assets Overview) and bar chart (Users) below, both currently showing as empty placeholder containers with no real chart rendering visible.

**Target improvements — HIGHEST PRIORITY:**
- Stat cards: Replace entirely with the new flat white card pattern described in Section 5. Icons in small navy/amber squares. No colored left borders. Trend indicators below the value.
  - Card 1: Total Users — navy icon, up-trend green
  - Card 2: Total Events — amber icon, stat value
  - Card 3: Upcoming Events — calendar icon, amber
  - Card 4: Pending Requests — clock icon, red dot for urgency
- Charts section: Two-column layout below stat cards.
  - Left (wider, ~60%): "Reservations Over Time" — area chart with navy fill, slate-200 grid lines. Filter dropdown (This Month / This Quarter / This Year).
  - Right (narrower, ~40%): "Asset Utilization" — horizontal bar chart or donut chart. Color-coded by asset type.
- Charts should use the brand color palette, not generic Chart.js defaults.
- Add a "Recent Reservations" mini-table below the charts showing the 5 most recent reservations with status badges.

### Surface 7: Calendar (/[role]/calendar)
**Current state:** Full-calendar inside a white card with border. Month navigation (prev/next, today button). Days with event dots. Role-colored today cell (blue for admin/dean, purple for staff, teal for public). Clicking a day opens an EventsListModal which can also open the ReserveEventModal.

**Target improvements:**
- Calendar card: Remove the existing `bg-white border rounded-md shadow` wrapper — the calendar should have breathing room, not feel boxed.
- Day cells: Navy circle for today. Amber dot(s) for event indicators. Larger dot for days with 3+ events.
- Month navigation: Left-right chevrons styled as subtle pill buttons. "Today" button in navy outline.
- Header: Month/year displayed in xl bold. A small legend showing what amber dots mean.
- EventsListModal: Show events as timeline cards (time on left, event name + asset on right). "Reserve New Event" CTA button prominent at the bottom of the modal.

### Surface 8: Reservations Table (/[role]/reservations)
**Current state:** Filter bar (status dropdown + search input + MoreVertical kebab) above a shadcn Table. Table headers use bg-[#f1f2f4] hardcoded. Status column shows colored pill badges (green/yellow/red). Empty state shows plain text "No reservations found". Clicking a row opens an EventInfoModal.

**Target improvements — HIGHEST PRIORITY:**
- Toolbar: Filter dropdown left-aligned. Search input right-aligned with a clear button. Add a date range filter button. Remove the MoreVertical kebab (it does nothing currently).
- Table header: Use slate-100 (not the hardcoded #f1f2f4). Column names in slate-500, 13px, medium weight.
- Status badges: Pill-shaped per component spec above. Replace the current `rounded-md` with `rounded-full`.
- Row actions: Add a subtle "View" icon button on hover in the rightmost column (currently no row action buttons visible).
- Empty state: Add an illustration (calendar with a checkmark, or an empty inbox illustration). Below: "No reservations found" in slate-700 bold, "Try adjusting your filters or create a new reservation" in slate-500, plus a "Create Reservation" CTA.
- EventInfoModal (detail view): Two-column layout inside the modal. Left: event title, date, time, status badge. Right: asset used, capacity, submitted by, approved/declined by. Action buttons at the bottom (Approve / Decline for admin, Request Changes for dean/staff).

### Surface 9: Accounts (/[role]/accounts)
**Current state:** Page is essentially empty — shows a plain "User Accounts" text div. No form or table implemented yet.

**Target improvements:**
- This is an opportunity to design from scratch with no technical constraints.
- Layout: Toolbar with search + "Add User" button. Below: a user accounts table.
- Table columns: Avatar (initials), Full Name, Email, Role (badge), Campus, Status (Active/Inactive badge), Date Created, Actions.
- "Add User" button: Opens a slide-over panel (not a modal) with a user registration form.
- Role badge styles: Navy for Admin, amber for Dean, slate for Staff.
- Empty state: Same illustration pattern as Reservations.

### Surface 10: Asset Management (/[role]/asset-management)
**Current state:** Toolbar with status filter, type filter, and search input. "Add new asset" button (navy, with PackagePlus icon). AssetsTable below. AssetRegistrationModal opens on button click.

**Target improvements:**
- Toolbar: Keep the filter + search pattern. Improve the "Add new asset" button to be more prominent — amber background, "Register Asset" label.
- Table: Add an asset thumbnail/icon column (first column). Show asset type as a pill badge (Venue, Vehicle, Equipment, Facility). Status badge uses semantic colors. Condition shows as a discrete indicator (dot + text).
- Row hover: Show "Edit" and "Archive" icon buttons in the actions column.
- Empty state: Matching pattern with the other tables.

### Surface 11: Profile (/[role]/profile)
**Current state:** Two-panel layout — 280px left sidebar with "My Profile" and "Password & Security" tabs (and a "Delete Account" danger button). Right panel shows avatar (currently using NORSU logo as placeholder), user name/role, and profile fields.

**Target improvements:**
- Left sidebar: Wider (320px). Add a subtle user summary card at the top (avatar + name + role badge). Nav items styled as the component spec.
- Avatar: Replace the NORSU logo placeholder with a proper avatar component — initials-based fallback (navy background, white initials) or uploaded photo.
- Profile content: Organize fields into cards — "Personal Information" card, "Academic Information" card (campus, office, department). Each card has an "Edit" button top-right.
- Password & Security tab: Current password, new password, confirm new password fields in a clean card. Add password strength indicator below the new password field. "Save Changes" button at the bottom.
- Delete Account: Move to a "Danger Zone" section at the very bottom — red outlined card, clear warning text, confirmation required.

### Surface 12: Reserve Event Modal
**Current state:** Three-tab modal (Event Details, Additional Info, Summary). Full-screen overlay. Animated entry (slide-up, 250ms). Header shows "Reserve Event" / "Edit Event" title + date. Tab bar is a segmented control. Footer has Back/Next/Submit buttons.

**Target improvements:**
- Width: 900px max (increase from current ~864px Tailwind arbitrary value).
- Tab bar: Keep the three-tab structure. Style tabs as outlined pill tabs with navy active state and amber underline indicator.
- Event Details tab: Two-column form layout for wider screens (Event Name full-width, then Date+Time side by side, then Asset selector full-width).
- Additional Info tab: Clean two-column grid for Info Type and Category selectors. People Tag field with typeahead — show selected tags as navy pill chips with an X remove button.
- Summary tab: Card-style review sections for each form group, not a raw data dump. Show a green checkmark header when all fields are valid.
- Footer: Sticky bottom bar. Back button is text/ghost style. Next/Submit is navy filled. When checking for conflicts, show a spinner inside the button.

### Surface 13: Asset Register Modal
**Current state:** Two-tab modal (Asset Details, Summary). Narrow width (max-w-2xl). Header with PackagePlus icon + "Register Asset" title. Form fields for asset name, type, campus, office, capacity, condition, etc.

**Target improvements:**
- Match the visual pattern of the ReserveEventModal for consistency.
- Header: Asset-specific icon (Building2 for venue, Truck for vehicle) determined by selected asset type.
- Asset Details tab: Section groups — "Basic Info" (name, type), "Location" (campus, office), "Details" (capacity, condition).
- Summary tab: Key-value review in a card, organized by the same sections.
- Submit button: Amber CTA for contrast with the navy theme.

---

## 7. What NOT to Do

- **Do not use SB Admin 2 patterns:** No colored left-border stat cards. No Bootstrap-era design tokens.
- **Do not mix ad-hoc hex values with Tailwind classes:** All colors must come from the design token system defined above.
- **Do not use UPPERCASE tracking-wide for card titles:** It reads as dated. Use sentence case or title case.
- **Do not use generic placeholder illustrations:** Commit to a consistent illustration style (line art or flat icon-based, not stock photos).
- **Do not use more than 2 font weights in a single component:** Pick semibold for headings, regular for body.
- **Do not add dark mode:** The system does not implement dark mode. Avoid adding it.
- **Do not use gradient backgrounds for the dashboard:** Flat white cards on off-white backgrounds. Gradients are reserved for the login left panel only.
- **Do not add decorative circles/blobs:** The current login pages have floating translucent circles in the background — remove this in the redesign. Clean, flat design only.
- **Do not make tables feel cramped:** Row height should be at least 52px. Give cells horizontal padding of 16–24px.
- **Do not use colored borders as primary visual differentiation:** The colored-left-border stat card pattern is the anti-pattern. Use color in icons and badges, not borders.

---

## 8. Stitch-Specific Instructions

**Output format:** High-fidelity desktop-first screens. Each screen at 1440px × 900px canvas (or 1440 × auto for scrollable pages).

**Priority screens to generate (in order):**
1. Dashboard page (all 4 stat cards + charts + recent reservations table)
2. Reservations table page (full table with status badges + toolbar + empty state variant)
3. Calendar page (full calendar + EventsListModal open state)
4. Public home page (navbar + calendar + upcoming events sidebar)
5. Login page (unified design, split layout)
6. Reserve Event Modal (Event Details tab open)
7. Asset Management page (table with sample data)
8. Profile page (My Profile tab active)
9. About page / public section

**For each screen:**
- Show realistic sample data (not Lorem ipsum or "Loading...")
- NORSU Calendar System branding visible (logo, institution name)
- One screen showing empty state (specifically: Reservations with no results)
- Show the sidebar in both expanded (full labels) and collapsed (icon-only) states in separate frames

**Sidebar active state examples to show:**
- Dashboard active (admin role)
- Reservations active (dean role)
- Calendar active (staff role)

**Modal screens:**
- Reserve Event Modal — Event Details tab (with sample filled form data)
- Reserve Event Modal — Summary tab (green valid state)
- EventInfoModal — APPROVED reservation detail

**Spacing and layout rules:**
- Use 8px grid system throughout
- Card padding: 24px
- Section gaps: 24px
- Component gaps within sections: 12–16px
- Page content padding from sidebar: 32px horizontal, 24px vertical

**Interaction states to show:**
- Default, hover, active, disabled, error for all interactive elements
- Table row hover state
- Sidebar collapsed state
- Mobile is out of scope for this design pass — desktop-first only

---

## 9. Summary of Priorities

| Priority | Screen | Reason |
|----------|--------|--------|
| P0 | Dashboard | Most-visited screen; current stat cards are the most visually dated element |
| P0 | Reservations table | Core workflow for Admin; highest information density |
| P1 | Calendar | Core workflow for all authenticated roles |
| P1 | Login page | First impression for all users |
| P2 | Public home | Entry point for the public-facing role |
| P2 | Reserve Event Modal | Core user action; complex multi-tab form |
| P3 | Asset Management | Admin workflow; table-heavy |
| P3 | Profile page | Low-frequency; still needs polish |
| P4 | Register flow | Occasional use; needs visual unification |
| P4 | About section | Marketing/credibility; needs placeholder copy removed |
| P4 | Accounts page | Not yet implemented; opportunity to design from scratch |

---

*End of brief. A designer reading this document cold should have everything needed to generate complete, accurate mockups without access to the codebase.*
