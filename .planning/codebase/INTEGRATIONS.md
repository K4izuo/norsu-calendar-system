# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**Backend API:**
- REST API backend at configurable endpoint
  - SDK/Client: Native Fetch API wrapper in `src/core/api/api-client.ts`
  - Auth: Bearer token via `Authorization` header
  - Base URL: `process.env.NEXT_PUBLIC_API_URL` (environment variable)
  - Default/Example: `http://127.0.0.1:8000` (see comment in api-client.ts)

**Faculty Events API:**
- External faculty events endpoint
  - Location: `src/api/facultyEventsApi.ts`
  - Method: Fetch API
  - Purpose: Retrieves faculty event details with optional date filtering

## Data Storage

**Databases:**
- Not directly integrated - Backend API handles all persistence
- Storage approach: API-first (data lives on backend server)

**Client-Side Storage:**
- Local Storage - Stores authentication tokens and user metadata:
  - `auth-token` - JWT or session token
  - `user-role` - User role identifier (numeric)
  - `user-id` - User ID (numeric)
  - Implementation: `src/core/auth/auth.ts`

- HTTP Cookies - Redundant storage for auth (SameSite=Strict security):
  - `auth-token` - Same as localStorage
  - `user-role` - Same as localStorage
  - `token-expiry` - ISO timestamp for token expiration check
  - `user-id` - Same as localStorage
  - Expiration: 15 minutes (or custom via `expires_at` from API)

**File Storage:**
- Vercel Blob Storage (remote image hosting only)
  - Hostname: `ferf1mheo22r9ira.public.blob.vercel-storage.com`
  - Purpose: Serves pre-optimized images
  - Configured in `next.config.ts` as allowed image remote pattern

- Unsplash (external image source for placeholders/public images)
  - Hostname: `images.unsplash.com`
  - Purpose: Public domain images
  - Configured in `next.config.ts` as allowed image remote pattern

**Caching:**
- TanStack React Query - Client-side data caching
  - Stale time: 2 minutes
  - Cache retention (gcTime): 5 minutes
  - Configuration: `src/core/lib/query-provider.tsx`
  - Dev tools: `@tanstack/react-query-devtools` available in development

## Authentication & Identity

**Auth Provider:**
- Custom token-based authentication
  - Implementation: Server-side API issues JWT/bearer tokens on login
  - Token storage: localStorage + httpOnly cookies
  - Token expiration: 15 minutes (configurable via API response)

**Login Endpoints:**
- `users/login` - Primary login endpoint (public)
  - Request: Credentials
  - Response: `{ token, role, user: { id }, expires_at }`
  - Stored: Token, role, user ID, and expiry timestamp

- `users/store` - User registration endpoint (public)
  - Request: Registration details
  - Response: User creation response

**Token Management:**
- Auto-expiry: Checked on token retrieval from localStorage
- Refresh: `/update-token-expiration` endpoint for token refresh (protected)
- Logout: `logout` endpoint clears all auth data locally via `src/core/auth/auth.ts`

**User Roles:**
- Role-based routing and access control
  - Roles stored as numeric values in localStorage and cookies
  - Example roles: admin (1?), dean (2?), staff (3?) - inferred from route structure
  - App routes: `src/app/(auth)/login/page.tsx`, `src/app/auth/{role}/login/page.tsx`

**Email Verification:**
- Public endpoints for email flow:
  - `verify-email` - Verify user email (public)
  - `resend-verification` - Resend verification link (public)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service (Sentry, Rollbar, etc.) configured

**Logs:**
- Console logging approach:
  - Production: Console error/warn preserved, info/debug logs removed
  - Development: All console methods available
  - Configuration: `next.config.ts` removeConsole compiler option

**React Query DevTools:**
- Development only visual debugging
  - Location: `src/core/lib/query-provider.tsx`
  - Enabled: `process.env.NODE_ENV === 'development'`
  - Position: Bottom of viewport

## CI/CD & Deployment

**Hosting:**
- Next.js deployment target (compatible with Vercel, self-hosted, Docker)
- Vercel services referenced (Blob Storage, implied Vercel deployment)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI service configured

**Build Process:**
- Commands available in `package.json`:
  - `npm run dev` - Development with Turbo
  - `npm run build` - Production build
  - `npm run start` - Start production server
  - `npm run lint` - ESLint
  - `npm run analyze` - Bundle analysis via `@next/bundle-analyzer`

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL (critical, used in every API call)

**Optional env vars:**
- `NODE_ENV` - Automatically set by Next.js build/dev/start
- `ANALYZE` - Enable bundle analysis when `true` (used in `npm run analyze`)

**Secrets location:**
- `.env.local` file (Git-ignored, contains local secrets)
- Environment variables at deployment (Vercel, Docker, etc.)

## API Endpoints Summary

**Public (No Auth Required):**
- `users/login` - POST login
- `users/store` - POST register
- `verify-email` - GET/POST email verification
- `resend-verification` - POST resend verification
- `campuses/all` - GET list of campuses
- `offices/all` - GET list of offices
- `degreeCourse/` - GET degree courses
- `reservations/all` - GET all public reservations
- `reservations/assets/{id}` - GET assets for reservation

**Protected (Auth Required):**
- `/me` - GET current user profile
- `logout` - POST logout
- `assets/all` - GET user assets
- `assets/store` - POST create asset
- `assets/{id}` - GET/PUT/DELETE specific asset
- `event/reservation` - POST create reservation
- `reservations/{id}` - GET specific reservation
- `reservations/{id}/move` - PATCH move reservation
- `/update-token-expiration` - POST refresh token expiry

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Not detected - No outbound webhook calls identified

---

*Integration audit: 2026-03-15*
