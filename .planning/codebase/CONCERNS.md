# Codebase Concerns

**Analysis Date:** 2026-02-23

## Tech Debt

**Large Component Files:**
- Issue: Multiple components exceed 500+ lines of code, violating single responsibility principle
  - `src/shared/components/ui/sidebar.tsx` (726 lines)
  - `src/features/calendar/components/event-info-modal.tsx` (573 lines)
  - `src/features/reservations/components/reserve-event-modal.tsx` (550 lines)
  - `src/features/reservations/hooks/useReserveEventForm.ts` (505 lines)
  - `src/features/calendar/components/norsu-calendar.tsx` (493 lines)
  - `src/app/page.tsx` (408 lines)
- Impact: Makes testing, maintenance, and modifications extremely difficult; increases likelihood of regressions. Cognitive load on developers is high.
- Fix approach: Extract smaller functional units into separate components/hooks. Break modals into sub-components for content, footer, header sections. Extract form logic into custom hooks with single responsibility.

**localStorage Direct Usage Without Abstraction:**
- Issue: Direct `localStorage` access scattered across multiple files without centralized abstraction layer
  - `src/core/auth/auth.ts` - Raw localStorage.setItem/getItem calls
  - `src/shared/components/context/auth-context.tsx` - Stores user data directly to localStorage
  - `src/app/page.tsx` - sessionStorage used for toast error tracking
- Impact: Difficult to test components in isolation; no single point of control for storage; no cache invalidation strategy; risk of data inconsistency if storage key names change.
- Fix approach: Create a `StorageService` abstraction layer that wraps all localStorage/sessionStorage operations. All components should use this service instead of accessing storage directly.

**Console Logging in Production Code:**
- Issue: Multiple console.error, console.warn, console.log statements in production code that should be removed or abstracted
  - `src/core/auth/token-refresh.ts` - console.error/warn/log used for debugging
  - `src/features/calendar/services/reservation-service.ts` - console.warn for asset fetch failures
  - `src/features/calendar/services/academicDataService.ts` - console.error for asset creation
  - `src/app/(dashboard)/[role]/asset-management/page.tsx` - console.log for asset clicks
  - Multiple other files scattered across codebase
- Impact: Exposes internal implementation details to users; clutters browser console; unprofessional appearance; no centralized logging strategy.
- Fix approach: Implement a logging service that respects NODE_ENV. Use structured logging. Remove all bare console calls. Route all logging through the service.

**Type Casting with `as unknown as ValidationRule`:**
- Issue: Type casting without proper type safety in `src/features/reservations/utils/reservation-field-validation.ts:27`
- Impact: Bypasses TypeScript type checking; can hide real type errors; makes code harder to debug.
- Fix approach: Improve type definitions to eliminate need for type casting. Use proper type guards instead.

## Known Bugs

**Duplicate Authentication Token Routes:**
- Symptoms: Multiple auth pages with similar functionality exist in different paths
  - Old structure: `src/app/auth/{role}/login`, `src/app/auth/{role}/register`
  - New structure: `src/app/(auth)/{login,register}` + `src/app/(dashboard)/[role]/`
  - Mixed usage creates confusion about which route is active
- Files: `src/app/auth/` (old), `src/app/(auth)/` (new), `src/app/(dashboard)/[role]/`
- Trigger: Users accessing old auth paths may get unexpected behavior or stale pages
- Workaround: Redirect old routes to new ones; but this creates technical debt of supporting two parallel systems
- Fix approach: Consolidate to single auth system. Remove old auth directory entirely. Ensure all links point to new (auth) directory.

**Hardcoded People Suggestions in Reserve Modal:**
- Symptoms: Fake hardcoded list of people in `src/features/reservations/components/reserve-event-modal.tsx:147-150`
- Files: `src/features/reservations/components/reserve-event-modal.tsx`
- Cause: Placeholder data that was never replaced with real API integration
- Impact: People tagging feature doesn't work with real data; users can only select fake names
- Workaround: Remove people tagging if not fully implemented; or implement API endpoint to fetch actual people
- Fix approach: Either remove the feature entirely or implement proper API integration for fetching available people to tag

**Inconsistent Status Mapping:**
- Symptoms: Status enum values are mapped inconsistently across the codebase
  - `getStatus()` in event-info-modal treats "OPEN" as "APPROVED" and "CLOSED" as "DECLINED" (non-standard mapping)
  - Files: `src/features/calendar/components/event-info-modal.tsx:42-55`
- Impact: Confusing behavior when event registration_status uses backend values instead of standard status values
- Trigger: Events with registration_status="OPEN" or "CLOSED" display incorrectly
- Fix approach: Establish single source of truth for status values. Use consistent enum throughout codebase.

## Security Considerations

**Authentication Token Storage in localStorage:**
- Risk: Storing authentication tokens in localStorage makes them vulnerable to XSS attacks. `localStorage` is accessible to any JavaScript on the page.
- Files: `src/core/auth/auth.ts` (setAuthToken, getAuthToken), `src/shared/components/context/auth-context.tsx`
- Current mitigation: Tokens stored with `SameSite=Strict` cookie attribute; separate token-expiry cookie for validation
- Recommendations:
  1. Prefer httpOnly cookies for token storage (not accessible to JavaScript)
  2. If localStorage must be used, implement Content Security Policy (CSP) headers
  3. Add mechanism to detect localStorage tampering (integrity checks)
  4. Implement token encryption if storing sensitive data in localStorage

**Direct Document.cookie Manipulation:**
- Risk: Using `document.cookie = ...` directly is error-prone and doesn't validate cookie attributes
- Files: `src/core/auth/auth.ts` (lines 7, 10, 20, 70, 87, 90, 93, 107-110)
- Current mitigation: SameSite=Strict attribute is set
- Recommendations:
  1. Use a cookie library (js-cookie) for safer, validated cookie operations
  2. Add utility function to abstract cookie operations
  3. Validate expiry dates before setting cookies
  4. Add ability to rotate cookie names to prevent tampering

**API Client Doesn't Validate JSON Response:**
- Risk: `response.json().catch(() => null)` in `src/core/api/api-client.ts:160` silently ignores JSON parse errors
- Files: `src/core/api/api-client.ts`
- Current mitigation: Checks for `response.ok` before parsing
- Recommendations:
  1. Log JSON parse errors for debugging (don't silently ignore)
  2. Return explicit error indicating malformed response
  3. Implement response validation schema (use zod, io-ts, etc.)
  4. Set maximum payload size limits

**No Input Validation on Form Fields:**
- Risk: Form validation rules are defined but there's no mention of server-side validation enforcement
- Files: `src/features/reservations/utils/reservation-validation-rules.ts`, `src/features/accounts/utils/account-validation-rules.ts`
- Current mitigation: Client-side validation only
- Recommendations:
  1. Implement server-side validation that matches client rules
  2. Never trust client-side validation alone
  3. Sanitize all user inputs before storing
  4. Use parameterized queries to prevent injection

**Public Endpoints Mixed with Protected:**
- Risk: Easy to accidentally expose protected functionality by misconfiguring endpoint protection
- Files: `src/core/api/api-client.ts:78-117` (publicEndpoints and isProtectedEndpoint logic)
- Current mitigation: Inline endpoint checks in apiClient
- Recommendations:
  1. Create explicit endpoint registry with protection levels
  2. Use middleware pattern for consistent auth checks
  3. Default to PROTECTED; only explicitly mark as PUBLIC
  4. Add integration tests to verify endpoint protection

## Performance Bottlenecks

**Inefficient Asset Fetching in Calendar:**
- Problem: Assets are fetched separately for each reservation, causing N+1 query problem on frontend
- Files: `src/app/page.tsx:62-66`, `src/app/(dashboard)/[role]/calendar/page.tsx:79-80`
- Cause: For each reservation in `usePublicAssets()`, a separate fetch may occur
- Current approach: Uses useAssets hook to batch fetch, but data structure may still cause multiple requests
- Improvement path:
  1. Batch all asset IDs and fetch once instead of per-reservation
  2. Implement asset caching at query level
  3. Consider denormalizing asset data into reservation response from backend
  4. Add request deduplication to React Query

**Large Sidebar Component with Complex CSS:**
- Problem: `src/shared/components/ui/sidebar.tsx` (726 lines) has extensive CSS-in-JS with many data attributes and class selectors
- Files: `src/shared/components/ui/sidebar.tsx`
- Cause: All sidebar variants, states, and responsive behavior crammed into single component
- Impact: Slow re-renders when sidebar state changes; difficult to tree-shake unused styles
- Improvement path:
  1. Extract variant definitions to CSS file
  2. Use CSS modules instead of inline className strings
  3. Memoize sub-components (SidebarMenu, SidebarGroup, etc.)
  4. Lazy load mobile sidebar implementation

**React Query Header Cache Never Purges:**
- Problem: Header cache in `src/core/api/api-client.ts:26-58` only purges first key when > 100 items
- Files: `src/core/api/api-client.ts`
- Cause: Basic FIFO eviction with no TTL or LRU strategy
- Impact: Memory leaks over time; cache could grow unbounded if many different headers are used
- Improvement path:
  1. Implement LRU (least recently used) cache instead of simple FIFO
  2. Add TTL to cached headers (e.g., clear after 1 hour)
  3. Add metrics to monitor cache hit rate
  4. Consider if caching headers is necessary (React Query has its own caching)

**Form Validation on Every Mount:**
- Problem: `useReserveEventForm` and similar form hooks re-validate on mount/re-render
- Files: `src/features/reservations/hooks/useReserveEventForm.ts:80-104`
- Cause: setValue with shouldValidate flags called on dependency changes
- Impact: Unnecessary validation computations; slower form interactions
- Improvement path:
  1. Separate data initialization from validation logic
  2. Only validate on user input, not on mount
  3. Use onTouched validation mode instead of onChange
  4. Memoize validation rule sets

## Fragile Areas

**Event Status Determination Function:**
- Files: `src/features/calendar/components/event-info-modal.tsx:42-55`, `src/features/calendar/components/events-list-modal.tsx` (similar logic)
- Why fragile:
  1. Status mapping logic is duplicated across multiple components
  2. Hardcoded string comparisons ("OPEN", "CLOSED", "PENDING", "APPROVED", "DECLINED")
  3. No centralized enum or status service
  4. Logic depends on registration_status field existing and being exact case
- Safe modification: Extract to shared utility function or status service. Use enum for status values. Add unit tests for all status combinations.
- Test coverage: Gaps in unit tests for different status values and edge cases

**Date/Time Parsing:**
- Files: `src/features/calendar/utils/timezone-utils.ts`, `src/features/calendar/components/event-info-modal.tsx:64-96`
- Why fragile:
  1. Multiple utility functions doing date parsing independently (formatDate, getStartedAgo, etc.)
  2. Using try-catch with silent fallbacks (returns null/original value)
  3. Timezone handling is complex with Philippine timezone logic
  4. String parsing vulnerable to format mismatches
- Safe modification: Create comprehensive timezone service with unit tests. Use date library (date-fns, Day.js). Validate date formats before parsing.
- Test coverage: No evidence of tests for timezone utilities or date formatting edge cases

**Asset Selection and Modal State Management:**
- Files: `src/features/reservations/components/reserve-event-modal.tsx`, `src/features/reservations/hooks/useReserveEventForm.ts`
- Why fragile:
  1. Multiple modal states (showVenueModal, showVehicleModal) managed in hook
  2. Asset data flows through multiple props and callbacks
  3. Form state entangled with UI state (activeTab, modals)
  4. No clear data flow pattern
- Safe modification: Separate form state from UI state. Use context for asset selection. Add E2E tests for modal interactions.
- Test coverage: No unit tests for form hook; integration testing only

**Authentication Token Expiry:**
- Files: `src/core/auth/token-expiry-monitor.tsx`, `src/core/auth/token-refresh.ts`, `src/core/auth/auth.ts`
- Why fragile:
  1. Token expiry tracked in multiple places (cookie, localStorage)
  2. Manual expiry checks in getAuthToken function
  3. Refresh logic depends on correct cookie format
  4. Race conditions possible between refresh and request
- Safe modification: Implement single token manager service. Add request queue to prevent multiple refresh calls. Add comprehensive token lifecycle tests.
- Test coverage: No test files found for auth logic

## Scaling Limits

**Sidebar Menu Performance with Many Items:**
- Current capacity: Component works fine with tens of menu items; not tested with 100+
- Limit: Each menu item creates separate event listeners; memory pressure grows linearly
- Scaling path:
  1. Implement virtual scrolling for menu items
  2. Use event delegation instead of per-item listeners
  3. Lazy load submenu items
  4. Consider pagination for very large menus

**Calendar Grid with Many Reservations:**
- Current capacity: Page loads with 100+ reservations; display slows with 500+
- Limit: All events rendered simultaneously; re-renders cascade when any state changes
- Scaling path:
  1. Implement pagination or date range filtering
  2. Lazy load events (virtualization)
  3. Use windowing library (react-window)
  4. Cache event data with proper invalidation

**React Query Cache Size:**
- Current capacity: System works with normal usage; cache grows unbounded over time
- Limit: With 10,000+ queries cached, memory pressure increases significantly
- Scaling path:
  1. Set gcTime (garbage collection time) more aggressively
  2. Implement query key patterns to group related queries
  3. Add cache size monitoring/limits
  4. Consider infinite query patterns for paginated data

## Dependencies at Risk

**No React Query Version Lock:**
- Risk: TanStack React Query updated to latest versions automatically; breaking changes possible in minor updates
- Impact: Silent breakage if query hooks API changes
- Migration plan:
  1. Pin React Query to specific version with `^` not `~`
  2. Run tests in CI before upgrading dependencies
  3. Add dependency update automation with testing (Dependabot)
  4. Monitor changelog for breaking changes

**Framer Motion Animation Performance:**
- Risk: Heavy use of motion components for modals could cause frame drops on slower devices
- Files: `src/features/calendar/components/event-info-modal.tsx`, `src/features/reservations/components/reserve-event-modal.tsx`, `src/features/reservations/components/confirmation-modal.tsx`
- Impact: Poor UX on mobile devices or older machines
- Recommendations:
  1. Test animations on low-end devices
  2. Implement `prefers-reduced-motion` media query support
  3. Consider simpler CSS animations as fallback
  4. Profile animation performance with DevTools

**Next.js 16 with React 19 (Cutting Edge Stack):**
- Risk: Very new versions may have stability issues not yet discovered by community
- Files: Package dependencies in `package.json`
- Impact: Potential undiscovered bugs; limited community support
- Recommendations:
  1. Monitor Next.js and React changelogs closely
  2. Have rollback plan for previous stable versions
  3. Test thoroughly in staging before production deployment
  4. Join early adopter communities to catch issues early

## Missing Critical Features

**No Error Boundary Component:**
- Problem: Application lacks React Error Boundary to catch component render errors
- Blocks: Cannot gracefully handle component crashes; entire app may become unusable if any component errors
- Fix approach: Implement Error Boundary wrapper around layout. Display fallback UI with error details and recovery option.

**No Request Timeout Configuration:**
- Problem: API requests may hang indefinitely with no timeout
- Files: `src/core/api/api-client.ts` - fetch requests have no timeout
- Blocks: Slow network or unresponsive API can freeze entire app
- Fix approach: Add AbortController timeout (30-60 seconds). Implement exponential backoff. Show timeout error to user.

**No Offline Support:**
- Problem: Application doesn't work when user goes offline
- Blocks: Users cannot see cached data or queue actions for later
- Fix approach: Implement service worker for offline caching. Use React Query offline handling. Queue mutations when offline.

**No Activity/Idle Timeout:**
- Problem: Authenticated sessions never expire due to inactivity
- Blocks: Users can leave browser open and session remains active indefinitely
- Fix approach: Implement idle detector. Prompt user before 15 min idle. Auto-logout after 30 min idle. Extend session on activity.

**No Audit Logging:**
- Problem: No record of who approved/declined reservations or when
- Blocks: Cannot trace changes or detect suspicious activity
- Fix approach: Implement audit log service. Log all state-changing operations. Store in backend database. Provide admin audit view.

## Test Coverage Gaps

**No Unit Tests for Core Services:**
- What's not tested:
  - `src/core/api/api-client.ts` - Request/response handling, error cases, authentication
  - `src/core/auth/auth.ts` - Token storage, expiry logic, cleanup
  - `src/features/calendar/services/reservation-service.ts` - Data fetching, mutation hooks
  - `src/features/calendar/utils/timezone-utils.ts` - Date/timezone calculations
- Files: All of src/core/ and src/features/ service directories
- Risk: Bug fixes and refactoring without confidence; regressions propagate to UI
- Priority: High - these services are used by many components

**No Component Integration Tests:**
- What's not tested:
  - Modal interactions (open/close/submit flows)
  - Form submission with error handling
  - Calendar date selection and reservation creation
  - Authentication flow (login, logout, session expiry)
- Files: Modal components, page components, auth flow
- Risk: Complex user flows break silently; regressions in multi-step processes
- Priority: High

**No End-to-End Tests:**
- What's not tested:
  - Complete reservation workflow (create -> approve/decline)
  - Calendar navigation and event filtering
  - User registration and login
  - Asset management operations
- Files: Entire application flow
- Risk: Production bugs affect real users
- Priority: Medium (consider after unit/integration tests)

**No Performance Tests:**
- What's not tested:
  - Calendar rendering with 500+ events
  - Modal animation performance on low-end devices
  - API response time and caching effectiveness
  - Bundle size regressions
- Files: Performance-critical components
- Risk: Invisible performance degradation over time
- Priority: Medium

**No Accessibility Tests:**
- What's not tested:
  - Keyboard navigation
  - Screen reader compatibility
  - Focus management in modals
  - Color contrast ratios
  - Form labels and ARIA attributes
- Files: All UI components
- Risk: Application unusable for users with disabilities; potential legal liability
- Priority: Medium

---

*Concerns audit: 2026-02-23*
