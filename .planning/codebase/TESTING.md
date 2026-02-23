# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Status:** No testing framework currently configured

**Framework:**
- Jest, Vitest, or similar: NOT installed
- React Testing Library: NOT installed
- Cypress/E2E testing: NOT installed

**Run Commands:**
- No test commands defined in `package.json`
- `npm run lint` - ESLint linting only (not testing)
- Testing infrastructure needs to be established

## Test File Organization

**Current State:** No test files found in source directory (`src/`)

**Note:** While `node_modules/` contains many `.test.tsx` and `.spec.js` files (from dependencies like `@radix-ui/*`, `goober`, `next`), the codebase itself has zero test files.

**Expected Pattern (when testing is added):**
- Test file location: Co-located with source in same directory
- Naming convention: `[module].test.ts` or `[module].test.tsx`
- Example structure:
```
src/features/accounts/
  ├── hooks/
  │   ├── useAccountFormReg.ts
  │   └── useAccountFormReg.test.ts
  ├── utils/
  │   ├── account-validation-rules.ts
  │   └── account-validation-rules.test.ts
  └── components/
      ├── account-page-form.tsx
      └── account-page-form.test.tsx
```

## Test Structure

**Current Implementation:** NOT APPLICABLE - No tests present

**When Testing is Added, Use Pattern:**
```typescript
describe('ComponentName or FunctionName', () => {
  // Setup
  beforeEach(() => {
    // Initialize test state, mocks
  });

  // Teardown
  afterEach(() => {
    // Clean up mocks, state
  });

  describe('specific behavior', () => {
    it('should perform expected action', () => {
      // Arrange
      const input = { /* setup */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

**Setup Pattern:**
- Initialize mocks before each test with `beforeEach`
- Reset module mocks between tests to prevent state leakage
- Set up providers (QueryClient, Context) for component tests

**Teardown Pattern:**
- Clear all mocks with `jest.clearAllMocks()` or `vi.clearAllMocks()`
- Reset component state
- Cleanup React Query cache

**Assertion Pattern:**
- Use framework-specific assertions (Jest matchers or Vitest)
- Test behavior, not implementation
- Include both positive and negative test cases

## Mocking

**Framework:** NOT CONFIGURED (when implemented, recommend Jest or Vitest)

**Patterns to Implement:**

**API Mocking:**
```typescript
// Mock apiClient for service tests
jest.mock('@/core/api/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

// In test:
(apiClient.get as jest.Mock).mockResolvedValue({
  data: expectedData,
  error: null,
  status: 200
});
```

**React Query Mocking:**
```typescript
// Wrap component with QueryClient for tests
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

// Render component with provider
render(
  <QueryClientProvider client={queryClient}>
    <ComponentUnderTest />
  </QueryClientProvider>
);
```

**Context Mocking:**
```typescript
// Mock auth context for components needing authentication
jest.mock('@/shared/components/context/auth-context', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, role: 1 },
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  }))
}));
```

**React Hook Form Mocking:**
```typescript
// Mock form functions in tests
const mockRegister = jest.fn((name) => ({
  name,
  ref: jest.fn(),
}));

const mockHandleSubmit = jest.fn((onValid) => (e) => {
  e.preventDefault();
  onValid({});
});
```

**What to Mock:**
- External API calls (all `apiClient` calls)
- React Query hooks and cache
- Authentication context and auth state
- Third-party services (toast notifications in some cases)
- Custom hooks that depend on above

**What NOT to Mock:**
- Utility functions (formatTime, cn, etc.) - test them directly
- Validation rules - test the actual validation logic
- Component rendering libraries (React, React DOM)
- Standard library functions

## Fixtures and Factories

**Status:** No fixture/factory patterns currently used

**Recommended Pattern (when implementing):**

**Test Data Factory:**
```typescript
// src/features/accounts/__tests__/fixtures/account.fixtures.ts
export const createMockAccountFormData = (overrides?: Partial<AccountFormData>): AccountFormData => ({
  username: 'testuser',
  password: 'TestPassword123',
  confirmPassword: 'TestPassword123',
  ...overrides
});

export const createMockUserAccount = (overrides?: Partial<UserAccount>): UserAccount => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 2,
  ...overrides
});
```

**API Response Fixtures:**
```typescript
// src/core/api/__tests__/fixtures/api-response.fixtures.ts
export const createMockApiResponse = <T>(data: T, error: string | null = null) => ({
  data,
  error,
  status: error ? 400 : 200
});

export const mockAssetResponse = {
  data: {
    id: 1,
    asset_name: 'Lab Computer',
    asset_type: 'Equipment',
    location: 'Room 101',
    capacity: 1,
  },
  error: null,
  status: 200
};
```

**Test Data Location:**
- Place fixture files in `__tests__/fixtures/` directory adjacent to source
- One fixture file per domain/feature
- Keep fixtures simple and reusable across test files

## Coverage

**Requirements:** Not enforced

**Current State:**
- No test coverage enforcement
- No `.nycrc` or coverage configuration
- No CI pipeline running coverage checks

**Recommended Setup (when implementing):**
```bash
# Run coverage report
npm run test:coverage

# Configuration in jest.config.js or package.json:
"jest": {
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.types.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

## Test Types

**Unit Tests (when implemented):**
- Scope: Individual functions, utilities, validation rules
- Approach: Test in isolation with mocked dependencies
- Location: `src/features/[feature]/utils/__tests__/`
- Examples to test:
  - Validation rules in `account-validation-rules.ts`
  - Utility transformers in `asset-transformers.ts`
  - Helper functions like `formatTime()`, `cn()`
  - Constants and constants-based logic

**Integration Tests (when implemented):**
- Scope: Multiple components working together, API client with mock server
- Approach: Test realistic user flows with minimal mocks
- Location: `src/features/[feature]/__tests__/`
- Examples to test:
  - Forms with validation and submission
  - Hooks with React Query
  - Context providers with multiple consumers
  - Multi-step workflows (e.g., account creation form with tabs)

**E2E Tests:**
- Framework: NOT IMPLEMENTED (recommend Playwright or Cypress)
- Scope: Full user workflows through the UI
- Examples: Login flow, create asset flow, calendar navigation

## Common Patterns

**Async Testing:**
```typescript
it('should fetch assets successfully', async () => {
  // Mock the API
  (apiClient.get as jest.Mock).mockResolvedValue({
    data: [{ id: 1, asset_name: 'Test Asset' }],
    error: null,
    status: 200
  });

  // Render hook
  const { result } = renderHook(() => useAssets());

  // Wait for loading to complete
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Assert
  expect(result.current.assets).toHaveLength(1);
});
```

**Error Testing:**
```typescript
it('should handle API errors gracefully', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(
    new Error('Network error')
  );

  const { result } = renderHook(() => useAssets());

  await waitFor(() => {
    expect(result.current.error).toBe('Network error');
  });

  expect(result.current.assets).toEqual([]);
});
```

**Form Testing Pattern:**
```typescript
it('should validate form fields', async () => {
  const { getByRole, getByText } = render(
    <AccountPageLayout
      type="dean"
      formData={{ username: '', password: '', confirmPassword: '' }}
      activeTab="details"
      errors={{}}
      register={mockRegister}
      validationRules={ACCOUNT_VALIDATION_RULES}
      onNextClick={jest.fn()}
      // ... other props
    />
  );

  const submitButton = getByRole('button', { name: /next/i });
  fireEvent.click(submitButton);

  // Should show validation error
  await waitFor(() => {
    expect(getByText(/username is required/i)).toBeInTheDocument();
  });
});
```

**Hook Testing (with React Query):**
```typescript
it('should create asset and refetch on success', async () => {
  const queryClient = new QueryClient();
  const { result } = renderHook(
    () => useCreateAsset(),
    { wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )}
  );

  act(() => {
    result.current.mutate({ /* asset data */ });
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
});
```

## Testing Infrastructure TODO

The codebase currently lacks testing infrastructure. To implement comprehensive testing:

1. **Install testing dependencies:**
   - Choose framework: Jest or Vitest
   - Install testing library for React
   - Mock library (usually included with Jest/Vitest)

2. **Create configuration:**
   - `jest.config.js` or `vitest.config.ts`
   - Configure coverage thresholds
   - Set up module mocking

3. **Create fixture/factory patterns:**
   - Establish test data fixtures
   - Create mock builders for complex objects

4. **Establish CI/CD integration:**
   - Run tests on pull requests
   - Enforce minimum coverage
   - Fail builds on test failures

5. **Write baseline tests:**
   - Start with utility function tests
   - Progress to service/hook tests
   - Add component tests last (typically most brittle)

---

*Testing analysis: 2026-02-23*
