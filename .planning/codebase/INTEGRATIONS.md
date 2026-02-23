# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**Backend Calendar API:**
- Service: Custom REST API (NORSU calendar backend)
- Client: Native `fetch` API with custom wrapper
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (configured in `.env.local`)
- Default: `http://127.0.0.1:8000/api` (development)
- SDK/Client: `@/core/api/api-client.ts` - Custom API client with error handling, auth, and caching
- Authentication: Bearer token via Authorization header

**Image Services:**
- Vercel Blob Storage - Remote image hosting for public assets
  - Hostname: `ferf1mheo22r9ira.public.blob.vercel-storage.com`
  - Used for: Public image serving
- Unsplash - Free stock photography
  - Hostname: `images.unsplash.com`
  - Used for: UI design assets

## Data Storage

**Databases:**
- Backend storage (not accessible directly from frontend)
  - Managed by: Custom REST API at `NEXT_PUBLIC_API_URL`
  - Connection: HTTP/REST endpoints
  - Type: Unknown to frontend (likely SQL-based, inferred from reservation/asset schema)

**File Storage:**
- Vercel Blob Storage (remote images only)
- Local filesystem via public directory (static assets)
- No local file upload handling in frontend

**Caching:**
- React Query (@tanstack/react-query 5.x) - Client-side data caching
  - Default staleTime: 2 minutes
  - Default gcTime: 5 minutes
  - Query strategies: Structural sharing enabled
  - Request deduplication: Built-in
- Browser localStorage - Session persistence
  - Keys: `auth-token`, `user-role`, `user-id`, `token-expiry`
- Browser cookies - Token storage
  - `auth-token`: Bearer token (expires with token)
  - `user-role`: Numeric user role (expires with token)
  - `token-expiry`: Token expiration timestamp
  - `user-id`: Current user ID (expires with token)
  - Cookie settings: SameSite=Strict, path=/

## Authentication & Identity

**Auth Provider:**
- Custom Backend Authentication
  - Implementation: Token-based (Bearer token in Authorization header)
  - Endpoints:
    - POST `/users/login` - Login with credentials
    - POST `/users/store` - User registration
    - POST `/logout` - Logout (clears token)
    - POST `/refresh-token` - Token refresh
    - POST `/update-token-expiration` - Extend token expiry
    - GET `/me` - Get current authenticated user
  - Token storage: localStorage + cookies (SameSite=Strict)
  - Token expiry monitoring: `@/core/auth/token-expiry-monitor.tsx`
  - Token refresh management: `@/core/auth/token-refresh.ts`

**User Roles:**
- Admin
- Dean
- Staff
- Public (unauthenticated)

**Email Verification:**
- POST `/verify-email` - Verify email with token
- POST `/resend-verification` - Resend verification email

**Password Reset:**
- POST `/password/reset-request` - Request password reset
- POST `/password/reset` - Complete password reset with token

## Authorization & Protected Resources

**Public Endpoints (no authentication required):**
- GET `/campuses/all` - List all campuses
- GET `/offices/all` - List all offices
- GET `/courses/all` - List all courses
- GET `/reservations/all` - List all reservations
- GET `/reservations/assets/{id}` - Get asset details (public)

**Protected Endpoints (authentication required):**
- GET `/assets/all` - List user's assets
- POST `/assets/store` - Register new asset
- GET/PUT `/assets/{id}` - Asset details and updates
- GET/PUT `/reservations/{id}` - Single reservation (not the `/all` endpoint)
- POST `/event/reservation` - Create reservation

**Account Management:**
- GET `/users/{userId}` - User profile details
- PUT `/users/{userId}` - Update user account
- POST `/users/{userId}/change-password` - Change password

## Monitoring & Observability

**Error Tracking:**
- None detected - Errors logged to console in development only

**Logs:**
- Console logging (development environment only)
- Production logs removed by Next.js compiler (`removeConsole: {exclude: ['error', 'warn']}`)
- HTTP request logging: None detected

**Request Monitoring:**
- React Query DevTools (development only) - Query state inspection

## CI/CD & Deployment

**Hosting:**
- Vercel-compatible (evidenced by next-themes, image remotePatterns with Vercel Blob)
- Static export capable
- Server-side rendering enabled

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar config

**Deployment Scripts:**
- `npm run build` - Production build
- `npm run start` - Production server start
- `npm run dev` - Development server (with Turbo mode)

## Environment Configuration

**Required Environment Variables:**

**Development:**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

**Production:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (must be set)
- Node environment: `NODE_ENV=production` (automatic with `npm start`)

**Optional Environment Variables:**
- None detected beyond API URL

**Secrets Location:**
- `.env.local` - Not committed to git (in .gitignore)
- All secrets handled server-side by backend API
- Frontend has no sensitive credentials

## API Client Implementation

**Location:** `@/core/api/api-client.ts`

**Features:**
- Request methods: GET, POST, PUT, DELETE, PATCH
- Authorization: Bearer token (automatic from localStorage)
- Public/Protected endpoint detection (auto auth bypass for public endpoints)
- Error handling: 401 triggers auth:unauthorized event
- Request caching: Memoized header construction
- Request cancellation: AbortSignal support
- Automatic auth data storage: Token, role, user ID on successful login
- HTTP headers:
  - Accept: application/json
  - Content-Type: application/json
  - Cache-Control: public, max-age=120 (2 minutes)
  - Connection: keep-alive
  - Authorization: Bearer {token} (when authenticated)

## Data Services

**Authentication Service:** `@/features/auth/services/auth-service.ts`
- Endpoints: All auth-related endpoints
- Methods: login, register (Dean/Staff/Admin), logout, getCurrentUser, refreshToken, updateAccount, changePassword, verifyEmail, resendVerification, requestPasswordReset, resetPassword

**Reservation Service:** `@/features/calendar/services/reservation-service.ts`
- Endpoints: `/reservations/all`, `/reservations/{id}`, `/reservations/assets/{id}`
- Methods: Fetch reservations, approve reservation, decline reservation
- Caching strategy: 2-minute staleTime, 5-minute gcTime

**Asset Service:** `@/features/assets/services/asset-service.ts`
- Endpoints: `/assets/all`, `/assets/store`, `/assets/{id}`
- Methods: Fetch assets, create asset
- Caching strategy: 0 staleTime (fresh on mount), 5-minute gcTime

**Campus/Office/Course Services:** Various read-only endpoints
- GET `/campuses/all`
- GET `/offices/all`
- GET `/courses/all`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

**Event System:**
- Custom browser event: `auth:unauthorized` - Dispatched when 401 response received
- Purpose: Trigger logout flow across application

---

*Integration audit: 2026-02-23*
