# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Current Status:** No testing framework configured

**Not Detected:**
- Jest config file (`jest.config.*`)
- Vitest config file (`vitest.config.*`)
- No `*.test.*` or `*.spec.*` files in `src/` directory
- No test dependencies in `package.json` (no jest, vitest, testing-library, etc.)

**Implications:**
- Unit tests not currently in place
- Integration tests not automated
- E2E tests not configured
- All quality assurance relies on manual testing or external tools

## Recommended Testing Setup

**Framework:** Vitest or Jest with React Testing Library

**Rationale:**
- Project uses Next.js 16+ (supports modern tooling)
- TypeScript strict mode enabled (good for test type safety)
- React 19 with hooks-heavy architecture benefits from component testing
- TanStack React Query extensively used (requires query client mocking)

## Testing Strategy (Prescriptive)

**When setting up testing, follow these patterns based on codebase structure:**

### Unit Tests Location

- Place test files co-located with source:
  - `src/core/api/api-client.ts` → `src/core/api/api-client.test.ts`
  - `src/core/lib/utils.ts` → `src/core/lib/utils.test.ts`
  - `src/features/accounts/utils/account-validation-rules.ts` → `src/features/accounts/utils/account-validation-rules.test.ts`

- Or in dedicated `__tests__` directory:
  - `src/core/api/__tests__/api-client.test.ts`
  - `src/features/accounts/utils/__tests__/account-validation-rules.test.ts`

**Naming Convention:**
- Test files: `*.test.ts` or `*.test.tsx`
- Snapshot files: `__snapshots__/ComponentName.test.tsx.snap`

### Test Suite Structure

**Pattern observed in dependency code (`@radix-ui`, `goober` tests):**

```typescript
// Basic test suite structure
describe("ComponentName or FunctionName", () => {
  describe("when condition", () => {
    it("should do something specific", () => {
      // Arrange
      const input = setupData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expectedValue);
    });
  });
});
```

## What to Test (Based on Codebase Patterns)

### Core API Client (`src/core/api/api-client.ts`)

**Test these functions:**
- `buildUrl()` - endpoint formatting
- `buildHeaders()` - header construction with caching
- `isPublicEndpoint()` - endpoint classification
- `isProtectedEndpoint()` - endpoint classification with regex patterns
- `apiClient.request()` - main request handler with error cases
- `apiClient.get()`, `post()`, `put()`, `delete()`, `patch()` - HTTP methods
- Authentication header injection
- 401 response handling (unauthorized flow)
- Error response parsing
- AbortSignal cancellation handling

**Example:**
```typescript
describe("apiClient", () => {
  describe("isPublicEndpoint", () => {
    it("should return true for login endpoint", () => {
      expect(isPublicEndpoint("users/login")).toBe(true);
    });

    it("should return false for protected endpoints", () => {
      expect(isPublicEndpoint("/me")).toBe(false);
    });
  });

  describe("request", () => {
    it("should return 401 error without token for protected endpoints", async () => {
      const result = await apiClient.request("assets/all", "GET");
      expect(result.status).toBe(401);
      expect(result.error).toBeDefined();
    });
  });
});
```

### Authentication Module (`src/core/auth/auth.ts`)

**Test these functions:**
- `setAuthToken()` - localStorage and cookie storage
- `getAuthToken()` - retrieval with expiry validation
- `setUserRole()`, `getUserRole()`
- `setUserId()`, `getUserId()`
- `removeAuthToken()` - cleanup
- Token expiry checking logic
- Cookie parsing

**Key patterns:**
- Mock `window`, `localStorage`, `document.cookie`
- Test token expiry edge cases (expired vs. valid)
- Verify both localStorage AND cookie are set/cleared

### Utility Functions (`src/core/lib/utils.ts`)

**Test `formatTime()` function:**
```typescript
describe("formatTime", () => {
  it("should format 24-hour time to 12-hour format", () => {
    expect(formatTime("14:30:00")).toBe("2:30 PM");
  });

  it("should handle midnight (00:00:00)", () => {
    expect(formatTime("00:00:00")).toBe("12:00 AM");
  });

  it("should return empty string for undefined", () => {
    expect(formatTime(undefined)).toBe("");
  });

  it("should return original string on parse error", () => {
    expect(formatTime("invalid")).toBe("invalid");
  });
});
```

### Form Validation (`src/features/accounts/utils/account-validation-rules.ts`)

**Test validation rules:**
```typescript
describe("ACCOUNT_VALIDATION_RULES", () => {
  describe("username", () => {
    it("should require username", () => {
      const rule = ACCOUNT_VALIDATION_RULES.username;
      expect(rule.required).toBeDefined();
    });

    it("should enforce minimum length of 3", () => {
      expect(ACCOUNT_VALIDATION_RULES.username.minLength.value).toBe(3);
    });

    it("should only allow alphanumeric and underscore", () => {
      const pattern = ACCOUNT_VALIDATION_RULES.username.pattern.value;
      expect(pattern.test("valid_name")).toBe(true);
      expect(pattern.test("invalid-name")).toBe(false);
    });
  });

  describe("password", () => {
    it("should require lowercase, uppercase, and number", () => {
      const pattern = ACCOUNT_VALIDATION_RULES.password.pattern.value;
      expect(pattern.test("ValidPass1")).toBe(true);
      expect(pattern.test("validpass1")).toBe(false); // missing uppercase
    });
  });
});
```

### Custom Hooks (React Testing Library)

**For `useCurrentUser()` hook (`src/shared/components/hooks/useCurrentUser.ts`):**

```typescript
describe("useCurrentUser", () => {
  it("should fetch user profile when userId exists", async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });

  it("should return null when no userId", () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper });
    expect(result.current.user).toBeNull();
  });
});
```

### React Components

**For simple presentational components like `HomeNavbar` (`src/app/_components/home-navbar.tsx`):**

```typescript
describe("HomeNavbar", () => {
  it("should render navigation bar", () => {
    const { getByText } = render(
      <HomeNavbar onScrollToAbout={() => {}} />
    );
    expect(getByText("NORSU Calendar System")).toBeInTheDocument();
  });

  it("should call onScrollToAbout when ABOUT is clicked", () => {
    const mockScroll = vi.fn();
    const { getByText } = render(
      <HomeNavbar onScrollToAbout={mockScroll} />
    );

    fireEvent.click(getByText("ABOUT"));
    expect(mockScroll).toHaveBeenCalled();
  });
});
```

## Mocking Strategy

**API Mocking:**
- Mock `apiClient` in most component tests
- Use React Query's `QueryClient` with `MemoryStorage`
- Never make real HTTP requests in tests

**Example mocking pattern:**
```typescript
vi.mock("@/core/api/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Usage in test:
import { apiClient } from "@/core/api/api-client";
vi.mocked(apiClient.get).mockResolvedValue({
  data: mockAsset,
  error: null,
  status: 200
});
```

**Browser APIs Mocking:**
```typescript
beforeEach(() => {
  // Mock localStorage
  Storage.prototype.getItem = vi.fn((key) => {
    if (key === "auth-token") return "test-token";
    return null;
  });

  // Mock document.cookie
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "auth-token=test; user-role=1"
  });
});
```

**React Query Setup:**
```typescript
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={testQueryClient}>
    {children}
  </QueryClientProvider>
);

const { result } = renderHook(() => useAssets(), { wrapper });
```

## What NOT to Mock

**Keep these real in tests:**
- Validation logic (e.g., regex patterns in `account-validation-rules.ts`)
- Utility functions (e.g., `formatTime()`, `cn()`)
- React hooks behavior (useEffect, useState - use Testing Library)
- React component rendering

## Test Coverage Goals

**No explicit coverage target enforced**, but recommend:
- **Core API client:** 80%+ (critical for data flow)
- **Authentication module:** 90%+ (security-sensitive)
- **Utility functions:** 100% (small surface area)
- **Validation rules:** 100% (deterministic)
- **Custom hooks:** 70%+ (integration testing can cover some)
- **Components:** 50%+ (focus on critical user flows)

## Running Tests (When Configured)

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

---

*Testing analysis: 2026-03-15*
