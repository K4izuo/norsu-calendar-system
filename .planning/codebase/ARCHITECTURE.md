# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Modern Next.js 16 full-stack application with role-based access control using server/client separation with middleware-based routing and feature-driven modular architecture.

**Key Characteristics:**
- Next.js App Router with server and client components
- Middleware-based authentication and authorization via `middleware.ts` (exported as `proxy.ts`)
- Feature-driven folder structure with self-contained feature modules
- React Query (TanStack Query) for server state management with 2-minute cache strategy
- Cookie-based token storage with automatic expiry monitoring and refresh
- Radix UI + Tailwind CSS for UI layer
- Type-safe API client with endpoint categorization (public/protected)
- Role-based dashboard with dynamic route parameters

## Layers

**Presentation Layer (View & UI):**
- Purpose: Render user interfaces and handle user interactions
- Location: `src/app/`, `src/shared/components/`, `src/features/*/components/`
- Contains: Page components, layouts, UI components, modals, forms
- Depends on: Features (hooks, services), shared components, core/auth context
- Used by: Browser/client

**Feature/Business Logic Layer:**
- Purpose: Encapsulate domain-specific functionality in self-contained modules
- Location: `src/features/[feature-name]/`
- Contains: Components, hooks, services, types, utilities for each feature (auth, calendar, assets, reservations, accounts, user-profile)
- Depends on: Core API client, shared utilities, types from interface/
- Used by: Pages and other features

**Core/Infrastructure Layer:**
- Purpose: Provide cross-cutting concerns and foundational services
- Location: `src/core/`
- Contains: API client (`api-client.ts`), authentication (`auth.ts`, `token-refresh.ts`), utilities (`role-utils.ts`), React Query provider
- Depends on: External packages (fetch, cookies, localStorage)
- Used by: Features, services, API routes

**Interface/Types Layer:**
- Purpose: Define and centralize all TypeScript interfaces and types
- Location: `src/interface/user-props.ts`
- Contains: EventDetails, Reservation, EventsListModalProps, DeanRegisterFormData, ReservationAPIPayload, MoveReservationPayload, etc.
- Depends on: None (types only)
- Used by: All layers

**Shared/Common Layer:**
- Purpose: Provide reusable components, contexts, hooks, and utilities
- Location: `src/shared/`
- Contains: Context providers (AuthContext, RoleProvider, QueryProvider), UI component library, hooks, layouts, utilities
- Depends on: Core utilities
- Used by: Features, pages, all UI components

**API Integration Layer:**
- Purpose: Handle external API communication and data transformation
- Location: `src/core/api/api-client.ts`, `src/api/`, `src/features/*/services/`
- Contains: Type-safe API client, endpoints, request/response handling
- Depends on: Types, authentication
- Used by: Features, hooks (via React Query mutations/queries)

## Data Flow

**Authentication Flow:**

1. User submits login form (email/password)
2. Form component (`src/features/auth/components/login/`) calls API via service
3. Service uses `apiClient.post('users/login', credentials)` from `src/core/api/api-client.ts`
4. API response contains `token`, `role`, `user.id`, `expires_at`
5. `storeAuthData()` in api-client triggers `setAuthToken()`, `setUserRole()`, `setUserId()` from `src/core/auth/auth.ts`
6. Auth data stored in both localStorage (client persistence) and cookies (middleware access)
7. Middleware (`src/proxy.ts`) checks token expiry and validates role-based routes
8. AuthContext (`src/shared/components/context/auth-context.tsx`) updates global user state
9. RoleProvider enforces role-based UI rendering
10. Redirect to role-specific dashboard (e.g., `/admin/dashboard`)

**Calendar Data Flow (Public & Authenticated):**

1. Page component (`src/app/(dashboard)/[role]/calendar/page.tsx` or `src/app/page.tsx`) renders
2. Component calls custom hook (`usePublicCalendarData()` or role-specific hook) from `src/features/calendar/hooks/`
3. Hook uses React Query `useQuery()` to fetch calendar events
4. Query calls `src/core/api/api-client.ts` GET endpoint (public: `reservations/all`)
5. Type-safe response mapped to `EventDetails[]` from `src/interface/user-props.ts`
6. Component receives: `loading`, `error`, `upcomingEvents`, `selectedDayEvents`, `getEventsForDate()`
7. User clicks on event → component calls `handleEventClick()` → modal opens with `EventDetails`
8. User clicks on calendar day → `handleDaySelect()` → modal shows events for that day
9. Query provider caches data for 2 minutes (staleTime), revalidates on reconnect

**Reservation Creation Flow:**

1. User fills reservation form in modal (`src/features/reservations/components/`)
2. Form validates using `react-hook-form` with rules from `src/features/reservations/utils/`
3. User submits → service method `createReservation()` called
4. Service calls `apiClient.post('event/reservation', payloadData)`
5. Payload matches `ReservationAPIPayload` interface
6. API client checks authorization (protected endpoint)
7. Auth token attached to Authorization header
8. Success response triggers toast notification (react-hot-toast)
9. React Query invalidates calendar queries to refetch data
10. UI updates with new reservation visible in calendar

**Token Expiry & Refresh Flow:**

1. Token stored with `expires_at` timestamp
2. `setupActivityTracking()` monitors user activity (dashboard layout effect)
3. `startTokenRefresh()` sets up interval to check expiry (every 30 seconds)
4. If token expires within 5 minutes, proactive refresh triggered
5. `POST /update-token-expiration` called via `apiClient`
6. Response updates token expiry via `updateTokenExpiry()`
7. Cookies re-set with new expiry time
8. If token expired when making request → `handleUnauthorized()` clears storage and redirects to home
9. User sees toast: "session_expired" error flag in URL

**State Management:**

- **Global Auth State:** `AuthContext` in `src/shared/components/context/auth-context.tsx` provides `user`, `isAuthenticated`, `logout()`, and auth functions
- **Query State:** React Query cache per endpoint with 2-minute stale time, 5-minute garbage collection
- **Local Component State:** React `useState()` for UI state (modals, loading, selected items)
- **Browser Storage:** localStorage for persistence (auth-token, user-role, user-id), cookies for middleware access
- **Role Context:** `RoleProvider` wraps app to make current user role available to all components

## Key Abstractions

**Feature Module:**
- Purpose: Self-contained business logic domain (e.g., auth, calendar, assets)
- Examples: `src/features/auth/`, `src/features/calendar/`, `src/features/reservations/`
- Pattern: Each feature has `components/`, `hooks/`, `services/`, `types/`, `utils/` subdirectories

**Service:**
- Purpose: Encapsulate API communication and complex business logic
- Examples: `src/features/assets/services/asset-service.ts`, `src/features/auth/services/`
- Pattern: Export static/default functions that call `apiClient` methods

**Custom Hook:**
- Purpose: Reusable React logic combining queries, state, and side effects
- Examples: `src/features/calendar/hooks/usePublicCalendarData()`, `useAssetRegistrationForm()`
- Pattern: Wrap React Query usage, expose simplified API to components

**Context Provider:**
- Purpose: Make global state available to component tree
- Examples: `AuthContext`, `RoleProvider`, `QueryProvider`
- Location: `src/shared/components/context/`

**Type Definition:**
- Purpose: Centralize TypeScript interfaces for type safety
- Location: `src/interface/user-props.ts` (main file) and `src/features/*/types/`
- Pattern: API payloads, UI props, domain models

## Entry Points

**Root Entry Point:**
- Location: `src/app/layout.tsx`
- Triggers: Server startup (Next.js hydration)
- Responsibilities: Wrap entire app with providers (QueryProvider, AuthProvider, RoleProvider), set up Toaster

**Public Home Page:**
- Location: `src/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Render public calendar, upcoming events sidebar, about section; force-dynamic to ensure Philippine timezone accuracy

**Authentication Pages:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/auth/[role]/login/`, `src/app/auth/[role]/register/`
- Triggers: Public routes before login
- Responsibilities: Render role-specific login/register forms

**Role Dashboard Layout:**
- Location: `src/app/(dashboard)/[role]/layout.tsx`
- Triggers: Protected routes under `/(dashboard)/[role]/*`
- Responsibilities: Render app sidebar, header with user dropdown, search, notifications; set up token refresh; show loading state during navigation

**Role Dashboard Pages:**
- Location: `src/app/(dashboard)/[role]/dashboard/page.tsx`, `/calendar/page.tsx`, `/reservations/page.tsx`, `/accounts/page.tsx`, etc.
- Triggers: Protected routes
- Responsibilities: Fetch and render feature-specific content

**Middleware/Proxy:**
- Location: `src/proxy.ts` (exported via Next.js middleware.ts)
- Triggers: All requests
- Responsibilities: Check authentication, validate token expiry, enforce role-based route access, redirect unauthorized users

## Error Handling

**Strategy:** Multi-layered with user feedback via toast notifications and graceful degradation

**Patterns:**

- **API Client Level:** All requests return `ApiResponse<T>` with `{ data, error, status }` structure. 401 responses clear auth and trigger `auth:unauthorized` event. Network errors return error message.
- **Hook Level:** Custom hooks catch API errors and expose `error` state. Components check and display error states.
- **Component Level:** Forms validate and show field-level error messages. API errors shown as toast notifications via `react-hot-toast`.
- **Route Protection:** Middleware (`src/proxy.ts`) redirects unauthorized/expired-session users to home with error query param.
- **Token Expiry:** Proactive refresh prevents sudden logouts. If refresh fails, user redirected to login.

## Cross-Cutting Concerns

**Logging:** Console logging for development (visible in browser DevTools and server logs). No centralized logging service detected.

**Validation:**
- Client-side: `react-hook-form` with custom validation rules per feature (e.g., `src/features/assets/utils/asset-validation-rules.ts`)
- Server-side: API validation (external server)
- Field-level error toasts: `src/features/assets/utils/asset-field-error-toast.ts`

**Authentication:**
- JWT token stored in localStorage and cookies
- Middleware enforces routes
- AuthContext provides global state
- Token refresh runs in background
- Session expiry monitored and handled gracefully

**Authorization:**
- Role-based access control via `getRolePathFromNumber()`, `getRoleLabelFromNumber()` in `src/core/lib/role-utils.ts`
- Dynamic routes `[role]` ensure users only access their role's dashboard
- Middleware validates user's role matches route
- UI shows/hides features based on role

**Caching:**
- React Query: 2-minute stale time, 5-minute garbage collection
- API client: Header cache limited to 100 entries (performance optimization)
- Middleware: Role path lookup cached in Map

**Performance:**
- API client caches headers to avoid object recreation
- Abortable requests via AbortSignal
- Structural sharing in React Query to deduplicate identical requests
- Lazy loading of components via dynamic imports (app routing)
- Force-dynamic on home page to ensure server-side Philippine time calculation

---

*Architecture analysis: 2026-03-15*
