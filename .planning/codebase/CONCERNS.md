# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Hardcoded setTimeout Delays:**
- Issue: Multiple components use fixed setTimeout delays (2000ms, 700ms, 300ms, 8000ms) for loading state management instead of promise-based completion detection
- Files: `src/app/page.tsx`, `src/features/accounts/hooks/useAccountFormReg.ts`, `src/api/facultyEventsApi.ts`, `src/features/auth/hooks/useAdminRegForm.ts`, `src/features/auth/hooks/useDeanRegForm.ts`, `src/features/auth/hooks/useStaffRegForm.ts`
- Impact: Unpredictable loading states, poor UX if API responses vary in speed, state mismatches with actual data availability
- Fix approach: Replace with proper async/await patterns and React Query state management (already partially implemented in reservation-service.ts as reference)

**Loose Type Safety with `unknown`:**
- Issue: Multiple event handlers and drag-drop handlers use `unknown` type instead of proper EventDetails interface
- Files: `src/features/calendar/components/calendar-day-cell.tsx`, `src/app/(dashboard)/[role]/calendar/page.tsx`
- Impact: Type checking bypassed, potential runtime errors from missing properties
- Fix approach: Replace `unknown` with proper type definitions, extract generic event types to interface

**Multiple Event Listeners on Window Without Cleanup:**
- Issue: Event listeners for drag operations attach to `window` directly without proper cleanup in some cases
- Files: `src/features/calendar/components/calendar-day-cell.tsx` (lines 57-68)
- Impact: Memory leaks, event handler pile-up after multiple component mounts/unmounts
- Fix approach: Ensure all event listeners are cleaned up in useEffect return handlers

**Token Storage Duplicated in localStorage AND cookies:**
- Issue: Auth tokens stored redundantly in both localStorage (sync) and cookies (with expiry). They can drift out of sync if one is cleared
- Files: `src/core/auth/auth.ts` (lines 1-111)
- Impact: Inconsistent auth state, potential security exposure if one storage method is compromised
- Fix approach: Consolidate to single storage mechanism - recommend cookies with httpOnly flag (requires backend change) or localStorage with proper expiry tracking

## Known Bugs

**Token Expiry Monitor Aggressive Interval:**
- Symptoms: CPU usage spike every second, excessive cookie parsing overhead
- Files: `src/core/auth/token-expiry-monitor.tsx` (line 45)
- Trigger: Component mounts, runs `setInterval(checkTokenExpiry, 1000)` continuously
- Workaround: Increase interval to 30-60 seconds; check only on visibility change
- Impact: Battery drain on mobile, unnecessary DOM parsing

**Incomplete Event Data in Confirmation Modal:**
- Symptoms: "Unknown User" appears when reserved_by_user relationship missing
- Files: `src/features/reservations/components/confirmation-modal.tsx` (line 64), `src/features/reservations/utils/reservation-conflict-check.ts` (line 102)
- Trigger: When API response omits user relationship data
- Impact: Poor UX, confusing conflict display
- Fix approach: Ensure API always includes user relationships or handle gracefully with fallback names

**Race Condition in Token Update:**
- Symptoms: Multiple simultaneous token refresh requests to backend
- Files: `src/core/auth/token-refresh.ts` (lines 31-32)
- Trigger: User activity events + interval timer firing simultaneously
- Current mitigation: `isUpdating` flag prevents duplicates
- Impact: Could cause token state inconsistencies if backend doesn't handle idempotently
- Safe modification: Ensure backend `/update-token-expiration` is idempotent

**Console Logging in Production:**
- Symptoms: Sensitive information (token updates, registration errors) logged to browser console
- Files: `src/core/auth/token-refresh.ts`, `src/core/auth/auth.ts`, multiple registration hooks
- Impact: Security risk, credentials/tokens visible in logs
- Fix approach: Remove console.log/error from auth flows, use error boundaries or toast notifications only

## Security Considerations

**Direct localStorage Access for Auth Tokens:**
- Risk: Tokens accessible to XSS attacks if JS is compromised
- Files: `src/core/auth/auth.ts` (entire file), `src/shared/components/context/auth-context.tsx`
- Current mitigation: Tokens also stored in cookies with SameSite=Strict
- Recommendations:
  1. Move to httpOnly cookies (backend change required)
  2. Implement Content Security Policy to prevent XSS
  3. Add token rotation on each request

**Manual Cookie Parsing:**
- Risk: Malformed cookie handling could expose parsing vulnerabilities
- Files: `src/core/auth/token-expiry-monitor.tsx` (line 13), `src/core/auth/auth.ts` (line 31)
- Current mitigation: Basic string parsing with indexOf/split
- Recommendations: Use library like js-cookie for safe parsing

**API Response Data Type Casting:**
- Risk: Unsafe casting of API responses without validation
- Files: `src/core/api/api-client.ts` (line 170), multiple service files
- Impact: Could accept malformed data from compromised API
- Fix approach: Implement Zod/io-ts schema validation on API responses

**Cross-Origin Cookie Vulnerability:**
- Risk: credentials: 'include' in fetch requests (line 141 of api-client.ts) sends cookies to all origins
- Files: `src/core/api/api-client.ts` (line 141)
- Impact: Could leak auth cookies to unintended endpoints
- Fix approach: Verify API_BASE_URL origin matches expected domain, validate before fetch

## Performance Bottlenecks

**Calendar Day Cell Component Size (362 lines):**
- Problem: Single component handles dragging, events, multiple sub-renders, callbacks
- Files: `src/features/calendar/components/calendar-day-cell.tsx`
- Cause: Mixed concerns - event display, drag state, visual feedback all in one
- Improvement path: Split into DraggableEventPill (already separated), EventList, and DroppableZone sub-components; memoize with React.memo

**Event Info Modal Complex Rendering (555 lines):**
- Problem: Large component with extensive conditional rendering, status calculations, confirmation flows
- Files: `src/features/calendar/components/event-info-modal.tsx`
- Cause: All modal logic (approve, decline, move) in single component with heavy DOM
- Improvement path: Extract confirmation, move, and status displays to separate modal sub-components

**Sidebar Component Size (726 lines):**
- Problem: Massive UI component with collapse state, context, keyboard shortcuts, all styling
- Files: `src/shared/components/ui/sidebar.tsx`
- Cause: Radix UI template includes extensive responsive logic and state management
- Improvement path: Break into logical sub-components (SidebarNav, SidebarCollapse, etc.)

**useReserveEventForm Hook Complexity (431 lines):**
- Problem: Single hook manages form state, validation, asset selection, people tagging, conflict checking
- Files: `src/features/reservations/hooks/useReserveEventForm.ts`
- Cause: Multiple concerns bundled together
- Improvement path: Extract people-tagging, asset-selection, conflict-checking into separate hooks

**Full Reservation Data Fetch on Every Approval:**
- Problem: Invalidating entire 'reservations' query key refetches all data after single approval
- Files: `src/features/calendar/services/reservation-service.ts` (lines 286-294)
- Cause: React Query invalidation breadth, no targeted updates
- Improvement path: Use optimistic updates, only invalidate affected reservation IDs

**Header Cache Without TTL:**
- Problem: Header cache can grow unbounded (capped at 100 entries manually)
- Files: `src/core/api/api-client.ts` (lines 26-55)
- Cause: Cache key includes auth token and custom headers, creating unique entries for each auth state
- Improvement path: Implement proper LRU cache with TTL, don't cache auth-dependent headers

## Fragile Areas

**Reservation Conflict Detection Logic:**
- Files: `src/features/reservations/utils/reservation-conflict-check.ts`
- Why fragile: Multiple date/time normalization steps (lines 29-57) create edge cases; timezone handling relies on manual string parsing; status comparison is case-sensitive
- Safe modification: Add comprehensive unit tests for timezone edge cases, ISO date parsing, status comparisons; use strict typing for status enum
- Test coverage: None detected - this is critical business logic with no tests

**Token Expiry Monitoring System:**
- Files: `src/core/auth/token-expiry-monitor.tsx`, `src/core/auth/token-refresh.ts`, `src/core/auth/auth.ts`
- Why fragile: Three separate components maintain token state (cookies, localStorage, monitor interval); expiry detection relies on exact time comparison
- Safe modification: Add smoke tests for: token expiration timing, multiple monitor instances, redirect on expiry; ensure clock skew tolerance
- Test coverage: Critical auth flow has zero test coverage

**Reservation Form Validation:**
- Files: `src/features/reservations/hooks/useReserveEventForm.ts`, `src/features/reservations/utils/reservation-validation-rules.ts`
- Why fragile: Validation rules loaded dynamically, error toasts shown with timeout sequencing, form reset scattered across multiple effects
- Safe modification: Centralize validation schema, make error display deterministic, consolidate form reset logic
- Test coverage: No test files found

**API Client Error Handling:**
- Files: `src/core/api/api-client.ts` (lines 148-192)
- Why fragile: Error classification relies on string matching (error.message.includes), no structured error codes from backend
- Safe modification: Add error code enum, create specific error classes for different failure modes
- Test coverage: No mocking/testing infrastructure

## Scaling Limits

**React Query Cache Strategy:**
- Current capacity: Individual asset queries cached for 5 minutes (staleTime), header cache max 100 entries
- Limit: With hundreds of reservations × assets, query cache could consume significant memory; stale queries pile up
- Scaling path: Implement pagination in reservation fetching, add cache size limits, use query de-duplication

**Token Refresh Interval Check:**
- Current capacity: 1 interval per 5 minutes per user session
- Limit: Each active session runs `setInterval(checkTokenExpiry, 1000)` - 60 timer callbacks per minute per tab
- Scaling path: Change to longer intervals (60 seconds), use visibility API only, consolidate to single shared worker

**Sidebar Responsive State Management:**
- Current capacity: Cookie-based sidebar state, no server-side persistence
- Limit: State resets on logout or new session; multi-device users get inconsistent UI state
- Scaling path: Persist sidebar preference to user profile on backend

## Dependencies at Risk

**Framer Motion Version Discrepancy:**
- Risk: Both "framer-motion" (^12.23.12) and "motion" (^12.26.2) installed - conflicting versions
- Files: `package.json` (lines 28, 30)
- Impact: May cause animation library conflicts, larger bundle
- Migration plan: Remove "motion" dependency, use only "framer-motion"; verify all animations still work

**Next.js 16 Early Adoption:**
- Risk: "next": "^16.1.4" is very recent, potential for undocumented breaking changes
- Files: `package.json` (line 31)
- Impact: Community maturity lower, fewer Stack Overflow solutions, potential bugs in framework
- Migration plan: No immediate action needed, monitor GitHub issues; have rollback plan to 15.x if critical issues found

**Radix UI Avatar Component Mismatch:**
- Risk: "@radix-ui/react-avatar": "^1.1.11" may have breaking changes in future 2.x versions
- Files: `package.json` (line 14)
- Impact: Future major versions could require component API changes
- Migration plan: Pin to exact version if stability critical, monitor Radix UI changelog

**No Testing Framework:**
- Risk: Zero test infrastructure (no Jest, Vitest, Playwright config)
- Files: package.json (no test dependencies)
- Impact: Critical business logic (conflicts, approvals, token expiry) untested; refactoring risk extremely high
- Migration plan: Add Jest + React Testing Library, start with critical path tests (auth, reservations)

## Missing Critical Features

**API Error Recovery:**
- Problem: No retry logic for transient failures (network timeouts, 5xx errors)
- Blocks: Failed API calls show generic error, user must manually retry
- Solution: Add exponential backoff retry logic to apiClient, already partially implemented for specific queries

**Audit Logging:**
- Problem: No tracking of who approved/declined/moved reservations or when
- Blocks: Can't audit reservation decisions, can't debug approval chains
- Solution: Add audit log table to backend, log all mutation operations

**Bulk Reservation Operations:**
- Problem: Can only approve/decline/move one reservation at a time
- Blocks: Admin managing 50+ pending reservations must do 50+ clicks
- Solution: Add select-all and bulk action buttons to reservations list

**Two-Factor Authentication:**
- Problem: Single login credential only
- Blocks: Account security limited to password strength
- Solution: Add TOTP/SMS 2FA support to auth flow

## Test Coverage Gaps

**Reservation Conflict Logic:**
- What's not tested: Date/time normalization (especially timezone edge cases), overlapping time ranges, asset ID matching
- Files: `src/features/reservations/utils/reservation-conflict-check.ts`
- Risk: High - core business logic for double-booking prevention
- Priority: High

**Authentication Flow:**
- What's not tested: Token refresh timing, cookie sync, logout side effects, auth state persistence across page reloads
- Files: `src/core/auth/` (entire directory)
- Risk: High - security-critical path
- Priority: High

**Calendar Event Rendering:**
- What's not tested: Event display with various asset counts, drag-and-drop interactions, modal open/close
- Files: `src/features/calendar/components/`
- Risk: Medium - core user interaction
- Priority: Medium

**API Response Handling:**
- What's not tested: Error cases, malformed responses, network failures, header caching behavior
- Files: `src/core/api/api-client.ts`
- Risk: High - all data goes through this layer
- Priority: High

**Form Validation:**
- What's not tested: Field validation rules, error message sequencing, form submission with conflicts
- Files: `src/features/reservations/hooks/useReserveEventForm.ts`, validation utilities
- Risk: Medium - user data integrity
- Priority: Medium

---

*Concerns audit: 2026-03-15*
