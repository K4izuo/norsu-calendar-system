# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
norsu-calendar-system/
├── src/
│   ├── app/                           # Next.js App Router pages and layouts
│   │   ├── (auth)/                    # Public auth routes (login, register)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/               # Role-based protected dashboard routes
│   │   │   └── [role]/                # Dynamic role parameter (admin/dean/staff)
│   │   │       ├── layout.tsx         # Dashboard container with sidebar, header
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── calendar/page.tsx
│   │   │       ├── reservations/page.tsx
│   │   │       ├── asset-management/page.tsx
│   │   │       ├── accounts/page.tsx
│   │   │       └── profile/page.tsx
│   │   ├── auth/                      # Legacy auth routes (dean/, staff/, admin/)
│   │   │   ├── dean/
│   │   │   ├── staff/
│   │   │   └── admin/
│   │   ├── _components/               # Home page local components
│   │   ├── _hooks/                    # Home page local hooks
│   │   ├── about/page.tsx
│   │   ├── layout.tsx                 # Root layout (providers, toaster)
│   │   ├── page.tsx                   # Public home page
│   │   ├── globals.css                # Global Tailwind styles
│   │   └── favicon.ico
│   │
│   ├── features/                      # Feature modules (domain-driven)
│   │   ├── auth/                      # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── calendar/                  # Calendar display and management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/                 # timezone-utils.ts, etc.
│   │   ├── reservations/              # Event reservation feature
│   │   │   ├── components/
│   │   │   │   ├── reserve-event/
│   │   │   │   │   ├── modal/
│   │   │   │   │   ├── tabs/
│   │   │   │   │   └── assets/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── assets/                    # Asset management feature
│   │   │   ├── components/
│   │   │   │   └── asset-register-tab/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── accounts/                  # Account management feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── user-profile/              # User profile feature
│   │       ├── components/
│   │       ├── hooks/
│   │       └── types/
│   │
│   ├── core/                          # Core/infrastructure
│   │   ├── api/
│   │   │   └── api-client.ts          # Type-safe API client
│   │   ├── auth/
│   │   │   ├── auth.ts                # Token storage (localStorage/cookies)
│   │   │   ├── token-refresh.ts       # Background token refresh
│   │   │   └── token-expiry-monitor.tsx
│   │   └── lib/
│   │       ├── query-provider.tsx     # React Query provider config
│   │       ├── role-utils.ts          # Role number/path conversions
│   │       └── utils.ts               # General utilities
│   │
│   ├── shared/                        # Shared reusable components and utilities
│   │   ├── components/
│   │   │   ├── context/               # Global context providers
│   │   │   │   ├── auth-context.tsx   # Auth state and user data
│   │   │   │   ├── user-role.tsx      # Role context
│   │   │   │   └── navigation-context.tsx
│   │   │   ├── layouts/               # Reusable layout components
│   │   │   │   ├── app-sidebar.tsx
│   │   │   │   ├── nav-main.tsx
│   │   │   │   ├── nav-user.tsx
│   │   │   │   └── team-switcher.tsx
│   │   │   ├── hooks/                 # Shared custom hooks
│   │   │   ├── ui/                    # Radix UI + Tailwind components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── about-section.tsx
│   │   │   │   └── ... (20+ more UI components)
│   │   │   ├── user-dashboard-ui/     # Dashboard-specific UI
│   │   │   │   ├── dashboard/
│   │   │   │   ├── reservations/
│   │   │   │   └── asset-management/
│   │   │   ├── privacy/               # Legal components
│   │   │   │   └── terms-and-condition-modal.tsx
│   │   │   └── utils/                 # Shared utility functions
│   │
│   ├── interface/
│   │   └── user-props.ts              # Centralized TypeScript interfaces
│   │
│   ├── api/
│   │   └── facultyEventsApi.ts        # External API definitions
│   │
│   └── proxy.ts                       # Middleware proxy (exported as middleware)
│
├── public/
│   ├── images/                        # Static images
│   └── ... (favicon.ico, etc.)
│
├── .next/                             # Next.js build output (generated)
├── node_modules/                      # Dependencies (generated)
├── .planning/                         # GSD planning docs
├── .github/                           # GitHub workflows
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config
├── postcss.config.mjs                 # PostCSS config
├── tailwind.config.mjs                # Tailwind CSS config
├── components.json                    # Shadcn/ui config
├── eslint.config.mjs                  # ESLint config
└── README.md
```

## Directory Purposes

**`src/app/`**
- Purpose: Next.js App Router pages, layouts, and route structure
- Contains: Server and client components, page.tsx files, layout.tsx files, styling
- Key patterns: Route groups `(auth)` and `(dashboard)` for route organization, dynamic `[role]` parameter

**`src/features/`**
- Purpose: Feature modules organized by domain (auth, calendar, reservations, etc.)
- Contains: Feature-specific components, hooks, services, types, utilities
- Key pattern: Each feature is self-contained and can be developed independently

**`src/core/`**
- Purpose: Cross-cutting infrastructure and utilities
- Contains: API client, authentication logic, React Query setup, role utilities
- Key files: `api-client.ts` (centralized API requests), `auth.ts` (token management), `query-provider.tsx` (React Query setup)

**`src/shared/`**
- Purpose: Reusable components, contexts, and utilities shared across the app
- Contains: UI components, context providers, hooks, layouts
- Key files: `auth-context.tsx` (global auth state), `app-sidebar.tsx` (main navigation)

**`src/interface/`**
- Purpose: Centralized TypeScript type definitions
- Contains: Interfaces, types, payload schemas
- Key file: `user-props.ts` (all major domain interfaces)

**`src/api/`**
- Purpose: External API definitions and configuration
- Contains: API routes and endpoints
- Key file: `facultyEventsApi.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout that wraps entire app with providers (QueryProvider, AuthProvider, RoleProvider, Toaster)
- `src/app/page.tsx`: Public home page with public calendar display
- `src/app/(dashboard)/[role]/layout.tsx`: Protected dashboard layout with sidebar and header
- `src/app/(dashboard)/[role]/dashboard/page.tsx`: Role-specific dashboard
- `src/proxy.ts`: Middleware for authentication and route protection

**Configuration:**
- `tsconfig.json`: TypeScript configuration with `@/*` path alias pointing to `src/`
- `next.config.ts`: Next.js configuration
- `postcss.config.mjs`: PostCSS configuration for Tailwind
- `components.json`: Shadcn/ui component library config
- `eslint.config.mjs`: ESLint rules

**Core Logic:**
- `src/core/api/api-client.ts`: Central API client with type-safe endpoints and auth token handling
- `src/core/auth/auth.ts`: Token storage in localStorage and cookies with expiry management
- `src/core/auth/token-refresh.ts`: Background token refresh mechanism
- `src/core/lib/query-provider.tsx`: React Query configuration (2-min stale time, 5-min GC)
- `src/interface/user-props.ts`: All domain interfaces (EventDetails, Reservation, etc.)

**Global State:**
- `src/shared/components/context/auth-context.tsx`: Provides user, isAuthenticated, login/logout functions
- `src/shared/components/context/user-role.tsx`: Provides current user role to component tree
- `src/shared/components/layouts/app-sidebar.tsx`: Navigation sidebar component

**Features:**
- `src/features/auth/`: Login, registration, form handling
- `src/features/calendar/`: Calendar display, event listing, timezone utilities
- `src/features/reservations/`: Reservation creation, management, event booking
- `src/features/assets/`: Asset registration and management
- `src/features/accounts/`: Account creation and management
- `src/features/user-profile/`: User profile display and editing

## Naming Conventions

**Files:**

- **React Components:** PascalCase ending in `.tsx` (e.g., `EventCard.tsx`, `UserProfile.tsx`)
- **TypeScript Files:** camelCase or PascalCase in `.ts` (e.g., `auth.ts`, `RoleUtils.ts`)
- **Hooks:** Prefix with `use` in camelCase (e.g., `usePublicCalendarData.ts`, `useAssetRegistrationForm.ts`)
- **Context Files:** Suffix with `context.tsx` (e.g., `auth-context.tsx`, `user-role.tsx`)
- **Services:** Suffix with `service.ts` in camelCase (e.g., `asset-service.ts`)
- **Utilities:** Suffix with `utils.ts` or standalone names (e.g., `timezone-utils.ts`, `role-utils.ts`)
- **Types/Interfaces:** Separate file with `.ts` extension in `types/` directory (e.g., `account.types.ts`)

**Directories:**

- **Features:** Lowercase, kebab-case for multi-word (e.g., `user-profile/`, `asset-management/`)
- **Components:** Lowercase or PascalCase depending on content structure
- **Utilities:** Lowercase, kebab-case (e.g., `timezone-utils/`, `validation-rules/`)

## Where to Add New Code

**New Feature:**
- Create directory: `src/features/[feature-name]/`
- Add structure: `components/`, `hooks/`, `services/`, `types/`, `utils/`
- Primary code: `src/features/[feature-name]/components/`, `src/features/[feature-name]/services/`
- Tests: Co-located with source files (not yet in codebase)
- Example: For a new "notifications" feature, create `src/features/notifications/` with subdirectories

**New Component:**
- Shared across features: `src/shared/components/ui/` or `src/shared/components/layouts/`
- Feature-specific: `src/features/[feature-name]/components/`
- Named: PascalCase.tsx with component logic and related utilities

**New Page:**
- Public routes: `src/app/[page-name]/page.tsx`
- Auth routes: `src/app/(auth)/[page-name]/page.tsx`
- Protected routes: `src/app/(dashboard)/[role]/[page-name]/page.tsx`

**New Service/API Logic:**
- Location: `src/features/[feature-name]/services/[service-name].ts`
- Use `apiClient` from `src/core/api/api-client.ts`
- Return type-safe responses using interfaces from `src/interface/user-props.ts`
- Example: `src/features/reservations/services/reservation-service.ts`

**New Hook:**
- Location: `src/features/[feature-name]/hooks/use[HookName].ts`
- Use React Query for data fetching: `useQuery()`, `useMutation()`
- Expose simplified API to components
- Example: `src/features/calendar/hooks/useCalendarEvents.ts`

**Utilities:**
- Shared utilities: `src/shared/components/utils/` or `src/core/lib/`
- Feature utilities: `src/features/[feature-name]/utils/`
- Separate files for different concerns: `validation.ts`, `transformers.ts`, `formatters.ts`

## Special Directories

**`src/.next/`**
- Purpose: Next.js build output
- Generated: Yes (do not modify)
- Committed: No (in .gitignore)

**`src/node_modules/`**
- Purpose: npm dependencies
- Generated: Yes (from package-lock.json)
- Committed: No (in .gitignore)

**`public/`**
- Purpose: Static assets (images, fonts, etc.)
- Generated: No
- Committed: Yes
- Accessed: Root-relative paths (e.g., `/images/avatar.jpg`)

**`src/app/_components/` and `src/app/_hooks/`**
- Purpose: Local components and hooks for home page only
- Pattern: Prefix with `_` to exclude from Next.js routing

**`src/features/[feature]/types/`**
- Purpose: Feature-specific type definitions
- Pattern: Supplement centralized types in `src/interface/user-props.ts`
- Example: `src/features/assets/types/asset.ts`

---

*Structure analysis: 2026-03-15*
