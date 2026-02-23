# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```
norsu-calendar-system/
├── src/
│   ├── app/                        # Next.js 16 app router (pages & layouts)
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/            # Protected dashboard route group
│   │   │   └── [role]/             # Role-based dynamic routes (dean, staff, admin)
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── calendar/page.tsx
│   │   │       ├── reservations/page.tsx
│   │   │       ├── accounts/page.tsx
│   │   │       ├── asset-management/page.tsx
│   │   │       └── profile/page.tsx
│   │   ├── about/page.tsx
│   │   ├── auth/                   # Legacy auth paths (deprecated, kept for backward compat)
│   │   │   ├── admin/login/page.tsx
│   │   │   ├── dean/
│   │   │   └── staff/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Public landing page with calendar
│   │   ├── globals.css             # Global styles (Tailwind)
│   │   └── favicon.ico
│   │
│   ├── core/                       # Infrastructure & cross-cutting concerns
│   │   ├── api/
│   │   │   └── api-client.ts       # Centralized HTTP client with auth, caching, error handling
│   │   ├── auth/
│   │   │   ├── auth.ts             # Token storage (localStorage/cookies), getters/setters
│   │   │   ├── token-expiry-monitor.tsx  # Monitors token expiry
│   │   │   └── token-refresh.ts    # Token refresh logic
│   │   └── lib/
│   │       ├── query-provider.tsx  # TanStack React Query provider with config
│   │       ├── role-utils.ts       # Role number to path mapping (2→dean, 3→staff, 4→admin)
│   │       └── utils.ts            # General utility functions
│   │
│   ├── features/                   # Feature modules (domain-isolated)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   │   ├── user-login-form.tsx
│   │   │   │   │   └── dean-staff-login-form.tsx
│   │   │   │   └── register/
│   │   │   │       ├── dean/
│   │   │   │       │   ├── dean-input-field.tsx
│   │   │   │       │   ├── dean-select-field.tsx
│   │   │   │       │   └── dean-summary.tsx
│   │   │   │       └── staff/
│   │   │   │           ├── staff-input-field.tsx
│   │   │   │           ├── staff-select-field.tsx
│   │   │   │           └── staff-summary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLoginForm.ts
│   │   │   │   ├── useDeanRegForm.ts
│   │   │   │   ├── useStaffRegForm.ts
│   │   │   │   └── useAdminRegForm.ts
│   │   │   ├── services/
│   │   │   │   └── auth-service.ts  # Login, register, logout, token refresh
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── utils/
│   │   │       ├── login/
│   │   │       ├── dean/
│   │   │       └── staff/
│   │   │
│   │   ├── calendar/
│   │   │   ├── components/
│   │   │   │   ├── norsu-calendar.tsx      # Main calendar UI
│   │   │   │   ├── events-list-modal.tsx
│   │   │   │   ├── event-info-modal.tsx
│   │   │   │   └── events-list-card.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useHandleReservations.ts
│   │   │   ├── services/
│   │   │   │   ├── reservation-service.ts  # Fetch/approve/decline reservations
│   │   │   │   └── academicDataService.ts
│   │   │   ├── types/
│   │   │   │   └── calendar.types.ts
│   │   │   └── utils/
│   │   │       ├── timezone-utils.ts
│   │   │       └── calendar-animations.ts
│   │   │
│   │   ├── reservations/
│   │   │   ├── components/
│   │   │   │   ├── reserve-event-tab/
│   │   │   │   └── reserve-event-assets/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   └── asset-register-tab/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   └── user-profile/
│   │       ├── components/
│   │       └── types/
│   │
│   ├── shared/                     # Reusable components & utilities
│   │   └── components/
│   │       ├── context/
│   │       │   ├── auth-context.tsx         # Global authentication state
│   │       │   ├── user-role.tsx            # Global role provider
│   │       │   └── navigation-context.tsx   # Navigation state
│   │       ├── ui/
│   │       │   ├── button.tsx
│   │       │   ├── dialog.tsx
│   │       │   ├── input.tsx
│   │       │   ├── badge.tsx
│   │       │   ├── page-breadcrumb.tsx
│   │       │   ├── skeleton.tsx
│   │       │   └── about-section.tsx
│   │       ├── layouts/
│   │       │   ├── dashboard-layout.tsx     # Sidebar + main content
│   │       │   └── app-layout.tsx
│   │       ├── hooks/
│   │       ├── privacy/
│   │       ├── user-dashboard-ui/           # Pre-built dashboard components
│   │       │   ├── dashboard/
│   │       │   │   ├── stat-card.tsx
│   │       │   │   ├── assets-line-chart.tsx
│   │       │   │   └── users-bar-chart.tsx
│   │       │   ├── reservations/
│   │       │   └── asset-management/
│   │       └── utils/
│   │
│   ├── interface/
│   │   └── user-props.ts            # Centralized TypeScript type definitions
│   │
│   ├── api/
│   │   └── facultyEventsApi.ts      # API wrapper (deprecated, use services instead)
│   │
│   └── proxy.ts                     # Next.js middleware for routing & auth
│
├── public/
│   └── images/
│       └── norsu.png                # NORSU university logo
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── .eslintrc.json
└── .env                             # Environment configuration (secrets)
```

## Directory Purposes

**`src/app/`**
- Purpose: Next.js app router - defines pages and routes
- Contains: Route groups `(auth)`, `(dashboard)` with `page.tsx` files, root layout, global styles
- Key files:
  - `layout.tsx` - Wraps entire app with providers (QueryProvider, AuthProvider, RoleProvider, Toaster)
  - `page.tsx` - Public landing page with calendar
  - `(dashboard)/[role]/` - Protected pages accessed after auth (dashboard, calendar, reservations, etc.)

**`src/core/api/`**
- Purpose: Centralized HTTP communication layer
- Contains: `api-client.ts` - typed request methods, auth token injection, caching, error handling
- Usage: All service layers call through apiClient

**`src/core/auth/`**
- Purpose: Authentication state persistence and lifecycle management
- Contains: Token/role/userId storage (localStorage + cookies), expiry monitoring, token refresh
- Key exports: `setAuthToken()`, `getAuthToken()`, `removeAuthToken()`, `setUserRole()`, `getUserRole()`

**`src/core/lib/`**
- Purpose: Shared infrastructure utilities
- Key files:
  - `query-provider.tsx` - TanStack React Query initialization and configuration
  - `role-utils.ts` - Maps role numbers (2/3/4) to paths (dean/staff/admin)
  - `utils.ts` - General helpers (date formatting, string utilities)

**`src/features/auth/`**
- Purpose: Authentication domain - login, registration, account management
- Organization:
  - `components/` - Login forms (user, dean/staff), registration forms per role
  - `services/` - authService with login/register/logout methods
  - `hooks/` - Form state management (useLoginForm, useDeanRegForm, etc.)
  - `types/` - Shared TypeScript interfaces (LoginFormData, RegisterResponse, etc.)

**`src/features/calendar/`**
- Purpose: Calendar display and event management
- Organization:
  - `components/` - Calendar UI, event modals, events list
  - `services/` - Fetch/approve/decline reservations, academic data fetching
  - `hooks/` - Reservation mutations and queries
  - `utils/` - Timezone helpers (Philippines), calendar animations

**`src/features/reservations/`**
- Purpose: Event reservation creation and management (user-initiated)
- Organization:
  - `components/` - Reservation form tabs, asset selection UI
  - `hooks/` - Reserve event mutations
  - `types/` - Reservation form data structures

**`src/features/assets/`**
- Purpose: Asset/facility management (admin/staff)
- Organization:
  - `components/` - Asset registration form tab
  - `services/` - Asset CRUD operations
  - `types/` - Asset data structures

**`src/features/accounts/`**
- Purpose: User account management (admin)
- Organization:
  - `components/` - Account list, user management UI
  - `types/` - Account data structures

**`src/features/user-profile/`**
- Purpose: User profile viewing and editing
- Contains: Profile components and types

**`src/shared/components/`**
- Purpose: Globally reusable components and contexts
- Key subdirectories:
  - `context/` - AuthContext (user state), RoleProvider (role sharing), NavigationContext
  - `ui/` - Radix UI + custom button, input, dialog, badge, breadcrumb components (Shadcn-style)
  - `layouts/` - DashboardLayout (sidebar + main), AppLayout wrappers
  - `hooks/` - Custom hooks usable anywhere (useMediaQuery, etc.)
  - `user-dashboard-ui/` - Pre-built dashboard components (charts, stat cards)

**`src/interface/`**
- Purpose: Centralized TypeScript type definitions
- Contains: EventDetails, Reservation, ReservationAPIPayload, all form data types
- Strategy: Single source of truth for data contracts across all features

**`src/api/`**
- Purpose: API integration (deprecated - use feature services instead)
- Contains: facultyEventsApi.ts (legacy)

**`src/proxy.ts`**
- Purpose: Next.js middleware for routing and authentication
- Responsibilities:
  - Validates auth token on protected routes
  - Checks token expiry via `token-expiry` cookie
  - Redirects based on user role to correct dashboard
  - Prevents auth users from accessing login/register pages
  - Returns error query params on unauthorized access

**`public/images/`**
- Purpose: Static assets
- Contains: NORSU university logo for navbar

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout with all global providers
- `src/app/page.tsx` - Public landing page (calendar + events)
- `src/app/(auth)/login/page.tsx` - User login
- `src/app/(auth)/register/page.tsx` - User registration
- `src/app/(dashboard)/[role]/dashboard/page.tsx` - Role-based dashboard

**Configuration:**
- `src/core/lib/query-provider.tsx` - TanStack React Query settings (staleTime, gcTime, retry logic)
- `src/core/api/api-client.ts` - HTTP request configuration, auth header building, public/protected endpoint detection
- `src/proxy.ts` - Middleware routing rules, role validation, token expiry checks
- `package.json` - Dependencies (React 19, Next 16, Radix UI, TanStack Query)

**Core Logic:**
- `src/features/[feature]/services/` - Domain API integration (auth-service.ts, reservation-service.ts, etc.)
- `src/features/[feature]/hooks/` - Custom hooks wrapping services with React Query
- `src/shared/components/context/` - Global state providers (auth, role)
- `src/core/auth/auth.ts` - Authentication state persistence

**Testing:**
- Not found - no test files in codebase

## Naming Conventions

**Files:**
- **Pages:** `page.tsx` (Next.js convention, lowercase)
- **Components:** `PascalCase.tsx` (e.g., `norsu-calendar.tsx`, `event-info-modal.tsx`)
- **Hooks:** `use[Feature].ts` (e.g., `useLoginForm.ts`, `useReservations.ts`)
- **Services:** `[domain]-service.ts` (e.g., `auth-service.ts`, `reservation-service.ts`)
- **Types:** `[domain].types.ts` (e.g., `auth.types.ts`, `calendar.types.ts`)
- **Utils:** descriptive names with hyphens (e.g., `timezone-utils.ts`, `calendar-animations.ts`)

**Directories:**
- **Feature folders:** lowercase, singular or plural based on content (e.g., `auth`, `calendar`, `reservations`, `assets`)
- **Sub-folders:** lowercase with hyphens (e.g., `user-profile`, `asset-management`, `reserve-event-tab`)
- **Route groups:** parentheses notation `(auth)`, `(dashboard)` following Next.js convention

**Functions & Variables:**
- **camelCase** for functions, variables, hooks
- **PascalCase** for components and classes
- **SCREAMING_SNAKE_CASE** for constants (e.g., `PUBLIC_ROUTES`, `ROLE_CONFIG`)

## Where to Add New Code

**New Feature:**
- Create `src/features/[feature-name]/` directory
- Add subdirectories: `components/`, `hooks/`, `services/`, `types/`, `utils/`
- Define types in `types/[feature].types.ts`
- Create service in `services/[feature]-service.ts` calling `apiClient`
- Create custom hooks in `hooks/use[Feature].ts` wrapping service with TanStack Query
- Export reusable components from `components/`
- Link feature to pages in `src/app/(dashboard)/[role]/[feature]/page.tsx`

**New Component (Feature):**
- Implementation: `src/features/[feature]/components/[component-name].tsx`
- Export from feature barrel if reused
- Use shared components from `src/shared/components/ui/` for styling

**New Component (Shared):**
- Implementation: `src/shared/components/ui/[component-name].tsx` or appropriate subdirectory
- Use Radix UI primitives + Tailwind CSS for styling
- Export from `src/shared/components/` if globally reusable

**Utilities:**
- Shared helpers: `src/shared/components/utils/[utility-name].ts`
- Feature-specific: `src/features/[feature]/utils/[utility-name].ts`
- Infrastructure: `src/core/lib/[utility-name].ts`

**Types:**
- Global/cross-feature types: `src/interface/user-props.ts`
- Feature-specific: `src/features/[feature]/types/[feature].types.ts`

## Special Directories

**`src/app/(auth)/` and `src/app/(auth)/`**
- Purpose: Route grouping to organize auth and dashboard routes
- Generated: No - manually created
- Committed: Yes

**`.next/`**
- Purpose: Next.js build output and dev server artifacts
- Generated: Yes (during `npm run dev` or `npm run build`)
- Committed: No (in .gitignore)

**`node_modules/`**
- Purpose: npm dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**`public/`**
- Purpose: Static assets served directly by Next.js (images, favicons, etc.)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-02-23*
