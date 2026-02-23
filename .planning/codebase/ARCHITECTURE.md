# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Layered Feature-Based Architecture with Next.js 16 App Router

**Key Characteristics:**
- **Feature-isolated modules** - Each domain (auth, calendar, assets) is self-contained with components, services, hooks, types, and utilities
- **API-client-first data layer** - Centralized HTTP client with TanStack React Query for caching and state management
- **Context-based authentication** - Global auth state via React Context, synced with localStorage and cookies
- **Middleware-protected routing** - Next.js middleware (`src/proxy.ts`) enforces role-based access control and session validation
- **Server and client components** - Strategic use of "use client" for interactivity, server defaults for optimization

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: User interface and page composition
- Location: `src/app/` (Next.js app router pages) and `src/shared/components/`
- Contains: Page components (`page.tsx`), feature-specific components (modals, forms, cards), shared UI components (buttons, inputs, layouts)
- Depends on: Feature hooks, shared components, interfaces
- Used by: End users via routing

**Feature Layer (Business Logic):**
- Purpose: Domain-specific logic encapsulation (auth, calendar, assets, reservations, accounts)
- Location: `src/features/[feature]/` (e.g., `src/features/auth/`, `src/features/calendar/`)
- Contains:
  - `components/` - Feature-specific React components
  - `services/` - API integration and data operations
  - `hooks/` - Custom React hooks for state and side effects
  - `types/` - TypeScript interfaces for the feature
  - `utils/` - Helper functions (timezone, formatting, validation)
- Depends on: Core API client, interfaces, external libraries
- Used by: Presentation layer

**Core Layer (Infrastructure & Utilities):**
- Purpose: Cross-cutting concerns and fundamental utilities
- Location: `src/core/`
- Contains:
  - `api/api-client.ts` - Centralized HTTP client with auth token management, header caching, automatic logout on 401
  - `auth/` - Authentication state (token storage, expiry monitoring, token refresh)
  - `lib/` - Utilities (QueryProvider for TanStack React Query, role utilities, general utils)
- Depends on: Next.js, external HTTP client (fetch)
- Used by: Feature and presentation layers

**Shared Layer (Reusable Components & Utilities):**
- Purpose: Globally shared UI and contextual providers
- Location: `src/shared/components/`
- Contains:
  - `context/` - Global context providers (AuthContext, RoleProvider, NavigationContext)
  - `ui/` - UI component library (buttons, dialogs, badges, breadcrumbs)
  - `layouts/` - Layout wrappers (dashboards, containers)
  - `hooks/` - Shared custom hooks
  - `utils/` - Shared utility functions
- Depends on: Radix UI, Tailwind CSS, React
- Used by: All other layers

**Interface Layer (Type Definitions):**
- Purpose: Centralized TypeScript types and data contracts
- Location: `src/interface/user-props.ts`
- Contains: EventDetails, Reservation, ReservationAPIPayload, EventCardsListProps, AssetRegistrationData, etc.
- Depends on: None (foundational)
- Used by: Features, pages, components

## Data Flow

**Authentication Flow:**
1. User submits login credentials on `src/app/(auth)/login/page.tsx`
2. Form hooks (e.g., `src/features/auth/hooks/useLoginForm.ts`) call `authService.login()`
3. `authService` uses `apiClient.post()` to call `/users/login` endpoint
4. `apiClient` stores token, role, user ID in localStorage and cookies (via `src/core/auth/auth.ts`)
5. `AuthProvider` reads token and fetches user details from `/me` endpoint
6. User data is stored in AuthContext and localStorage
7. Next.js middleware (`src/proxy.ts`) validates session on each navigation and redirects to appropriate role dashboard

**Reservation Fetch Flow:**
1. Page component (e.g., public home page) mounts
2. Component calls `usePublicReservations()` from `src/features/calendar/services/reservation-service.ts`
3. Hook uses TanStack Query to fetch `/reservations/all` (public endpoint) via `apiClient.get()`
4. Data is cached with 2-minute staleTime
5. Component transforms API response into `EventDetails` format using `src/interface/user-props.ts`
6. Calendar component renders with filtered/upcoming events
7. User clicks event day → EventsListModal opens with selected day's events
8. User clicks event → EventInfoModal opens with full event details

**Reservation Creation Flow:**
1. User fills reservation form (e.g., on dashboard calendar page)
2. Form submission calls mutation (e.g., via `useReservations()` mutation hook)
3. Mutation sends POST to `/event/reservation` with `ReservationAPIPayload`
4. `apiClient` includes auth token in Authorization header
5. API response updates React Query cache via `queryClient.invalidateQueries()`
6. Component refetches reservations list
7. Success toast notification shown via react-hot-toast
8. Form resets, modal closes

**Role-Based Access Control Flow:**
1. Authenticated request is made
2. `src/proxy.ts` middleware intercepts request:
   - Reads `user-role` cookie (role number: 2=dean, 3=staff, 4=admin)
   - Converts role number to path via `getRolePathFromNumber()`
   - Validates user is accessing correct role path (e.g., dean user accessing /dean/* only)
   - If token expired, clears cookies and redirects to home with error flag
3. Protected pages render within role-specific layout
4. `RoleProvider` context shares role throughout component tree

**State Management:**
- **Authentication state:** React Context (AuthContext) + localStorage + cookies
- **Query state:** TanStack React Query with 2-minute staleTime, 5-minute gcTime
- **Local component state:** React useState for modals, form inputs, UI interactions
- **Global style state:** Tailwind CSS + class-variance-authority (CVA)

## Key Abstractions

**API Client (`src/core/api/api-client.ts`):**
- Purpose: Unified HTTP interface with authentication, error handling, caching
- Pattern: Singleton object with typed methods (get, post, put, delete, patch)
- Features:
  - Automatic token injection via `Authorization: Bearer` header
  - Public/protected endpoint detection
  - Header caching to reduce object allocations
  - 401 handling with logout trigger
  - AbortSignal support for request cancellation
- Usage: `apiClient.get<T>(endpoint, options)` returns `Promise<ApiResponse<T>>`

**Service Layer (Feature Services):**
- Purpose: Encapsulate domain API calls and mutations
- Pattern: Object export with async methods + custom React hooks
- Examples:
  - `src/features/auth/services/auth-service.ts` - login, register, logout, token refresh
  - `src/features/calendar/services/reservation-service.ts` - fetch/approve/decline reservations
  - `src/features/assets/services/` - asset CRUD operations
- Usage: Services call `apiClient` methods; hooks wrap services with TanStack Query

**Feature Hooks:**
- Purpose: Reusable logic for components with state and side effects
- Pattern: Custom React hooks prefixed with `use`, return typed data/functions
- Examples:
  - `useReservations()` - queries reservations with auth guard
  - `useLoginForm()` - manages login form state and submission
  - `usePublicReservations()` - queries public reservation data
- Usage: `const { data, error, loading } = useReservations()`

**Context Providers:**
- **AuthProvider** (`src/shared/components/context/auth-context.tsx`): Manages global user authentication state
- **RoleProvider** (`src/shared/components/context/user-role.tsx`): Provides role information throughout tree
- **QueryProvider** (`src/core/lib/query-provider.tsx`): Wraps app with TanStack React Query client
- Composition: Nested in `src/app/layout.tsx` → QueryProvider → AuthProvider → RoleProvider → children

## Entry Points

**Public Landing Page:**
- Location: `src/app/page.tsx`
- Triggers: Direct navigation to `/` or public routes
- Responsibilities:
  - Display public calendar with approved reservations
  - Show upcoming events list
  - Handle event info modals
  - Dynamic rendering to ensure Philippine timezone accuracy

**Authentication Pages:**
- Locations: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Triggers: User clicks login/register or attempts protected route without token
- Responsibilities:
  - Render login/registration forms
  - Call authService methods
  - Redirect to dashboard on success
  - Show error toasts on failure

**Dashboard Pages:**
- Location: `src/app/(dashboard)/[role]/dashboard/page.tsx` and siblings
- Triggers: Authenticated user navigates to role-based path
- Responsibilities:
  - Display role-specific dashboard with stats
  - Render navigation sidebar
  - Show calendar, reservations, assets, accounts based on role
  - Protected by middleware validation

**Layout Wrapper:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities:
  - Set up global providers (QueryProvider, AuthProvider, RoleProvider)
  - Configure fonts (Poppins)
  - Set metadata
  - Render Toaster for notifications

## Error Handling

**Strategy:** Multi-level error handling with user feedback

**Patterns:**
- **API errors:** Caught in `apiClient.request()`, returned as `{ error: string, status: number, data: null }`
- **Service errors:** Thrown from services, caught by React Query retry logic
- **Component errors:** Caught via error boundaries or conditional rendering
- **401 Unauthorized:** Handled specially - clears auth state, dispatches `auth:unauthorized` event, redirects to home
- **Network errors:** Retried with exponential backoff (max 2 attempts, up to 30 seconds)
- **User feedback:** Toast notifications via react-hot-toast (success, error, info)

## Cross-Cutting Concerns

**Logging:**
- Strategy: `console.log/warn/error` in development
- Currently minimal - no external logging service configured
- Performance logs marked with ⚡ comment in code

**Validation:**
- Location: Client-side validation in form hooks using react-hook-form
- No shared validation library - validation logic duplicated in feature hooks
- Backend validates all inputs

**Authentication:**
- Handled by AuthProvider context + middleware
- Token stored in localStorage and cookies
- Automatic expiry check via `token-expiry` cookie
- Middleware validates before every page load

**Performance Optimization:**
- React Query caching (2-minute staleTime, 5-minute gcTime)
- Memoization via `useMemo` and `useCallback` in components
- Header caching in apiClient to prevent object allocation
- Role path lookup caching in middleware (rolePathCache Map)
- Structural sharing in React Query to deduplicate identical requests
- Force-dynamic rendering on home page to ensure timezone accuracy

---

*Architecture analysis: 2026-02-23*
