# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `AccountPageLayout.tsx`, `UserLoginForm.tsx`)
- Services and utilities: kebab-case with `.ts` extension (e.g., `asset-service.ts`, `account-validation-rules.ts`)
- Type/interface files: kebab-case with `.types.ts` suffix (e.g., `account.types.ts`, `asset.ts`, `auth.types.ts`)
- Hooks: camelCase starting with `use` prefix (e.g., `useAccountForm.ts`, `useAssets.ts`)
- Utility functions: kebab-case for the file but functions inside exported as is (e.g., `account-field-error-toast.ts` exports `showAccountErrorToast`)
- Context components: kebab-case with context suffix (e.g., `auth-context.tsx`)
- Pages (Next.js): kebab-case or lowercase directory names with `page.tsx` inside (e.g., `/dashboard/[role]/calendar/page.tsx`)

**Functions:**
- Component functions: PascalCase (e.g., `AccountPageLayout`, `UserLoginForm`)
- Regular functions: camelCase (e.g., `fetchAssets`, `buildHeaders`, `validateAndProceed`)
- Custom hooks: camelCase starting with `use` (e.g., `useAccountForm`, `useAssets`, `useCreateAsset`)
- Utility/helper functions: camelCase (e.g., `showAccountErrorToast`, `formatTime`, `storeAuthData`)
- Private helper functions: camelCase with underscore prefix sometimes used (e.g., standard pattern not strictly enforced)

**Variables:**
- Constants: UPPER_SNAKE_CASE when truly constant exports (e.g., `ACCOUNT_VALIDATION_RULES`, `REQUIRED_ACCOUNT_FIELDS`, `ACCOUNT_FIELD_LABELS`)
- Local variables and state: camelCase (e.g., `formData`, `activeTab`, `isSubmitting`)
- React state setters: camelCase with standard `useState` naming (e.g., `const [activeTab, setActiveTab] = useState()`)
- Type instances: camelCase (e.g., `formData`, `errors`, `headers`)

**Types:**
- Interfaces: PascalCase with optional suffix context (e.g., `AccountFormData`, `UserLoginFormProps`, `AccountPageProps`, `ApiResponse<T>`)
- Type aliases: PascalCase (e.g., `RequestMethod`, `Asset`)
- Generic parameters: Single uppercase letter or PascalCase (e.g., `<T>`, `<D>`)
- Enums: Not observed in codebase; use union types instead

## Code Style

**Formatting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- Uses Next.js core-web-vitals and TypeScript recommended presets
- No explicit Prettier configuration found; uses ESLint defaults
- Indentation: 2 spaces (inferred from codebase)
- Line length: No strict limit enforced, some lines exceed 80 characters

**Linting:**
- Framework: ESLint 9 (flat config format in `eslint.config.mjs`)
- Configuration: `eslint.config.mjs` extends:
  - `next/core-web-vitals`
  - `next/typescript`
- Ignores: `node_modules/**`, `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. React imports: `import React, { ... } from "react"`
2. Third-party library imports: `import { ... } from "lucide-react"`, `import { motion } from "framer-motion"`
3. React Hook Form and form libraries
4. UI component imports: `import { Button } from "@/shared/components/ui/button"`
5. Context/provider imports: `import { useAuth } from "@/shared/components/context/auth-context"`
6. Feature-level imports: `import { useAccountForm } from "@/features/accounts/hooks/useAccountForm"`
7. Type imports: `import type { AccountFormData } from "@/features/accounts/types/account.types"`
8. Utility imports: `import { formatTime } from "@/core/lib/utils"`
9. Service imports: `import { apiClient } from "@/core/api/api-client"`

**Path Aliases:**
- `@/*`: Maps to `./src/*` (configured in `tsconfig.json`)
- Use this alias for all imports to enable consistent module resolution
- Recommended pattern: absolute imports using `@/` prefix rather than relative paths

**Import Style:**
- Use named imports for specific exports: `import { Button } from "@/shared/components/ui/button"`
- Use type imports for TypeScript-only imports: `import type { LoginFormData } from "@/features/auth/utils/login/login-validation-rules"`
- Avoid barrel file exports in most cases (except for component collections)

## Error Handling

**Patterns:**
- API responses use consistent structure: `{ data: T | null, error: string | null, status: number }`
- Always check `response.error` before accessing `response.data`
- Throw Error with meaningful message in service functions when data is missing
- Use toast notifications for user-facing errors via `react-hot-toast`
- Console logging for development debugging: `console.error()`, `console.log()`, `console.warn()`
- React Query handles retry logic with configurable retry counts
- Form errors: Use React Hook Form's `FieldErrors` pattern with display via toast

**Error Handling Example:**
```typescript
// API service pattern
const response = await apiClient.get<Asset[]>('/assets/all');
if (response.error) {
  throw new Error(response.error);
}
if (!response.data || response.data.length === 0) {
  return [];
}
return response.data;

// Form error handling
try {
  await submitForm(data);
  toast.success("Success message");
} catch (error) {
  console.error("Error context:", error);
  toast.error(error instanceof Error ? error.message : "Unknown error");
}
```

## Logging

**Framework:** `console` methods (built-in) and `react-hot-toast` for UI notifications

**Patterns:**
- Development: Use `console.log()` for informational logging
- Warnings: Use `console.warn()` for non-critical issues (e.g., `console.warn('Token refresh failed (non-critical):', error)`)
- Errors: Use `console.error()` for critical failures (e.g., `console.error("Error loading user data:", error)`)
- Production: Console logs are removed except `error` and `warn` (configured in `next.config.ts`)
- UI notifications: Use `toast.success()`, `toast.error()` from `react-hot-toast` with position and duration options
- Example: `toast.success('Asset registered successfully!', { position: 'top-right', duration: 4000 })`

## Comments

**When to Comment:**
- Complex logic or algorithms: Document intent, not what the code does
- Non-obvious workarounds or fixes: Include context markers like `⚡ PERFORMANCE:` or `✅ CRITICAL FIX:`
- Form validation rules: Document requirements above the rules definition
- Component prop interfaces: Always document via JSDoc
- Performance optimizations: Mark with emoji prefix (⚡) for visibility

**JSDoc/TSDoc:**
- Used extensively for interface documentation (see `account.types.ts`)
- Format: Multi-line comment above declaration with description
- Example:
```typescript
/**
 * Form data for account creation/management
 * Used in account registration and profile update forms
 */
export interface AccountFormData {
  username: string
  password: string
  confirmPassword: string
}
```

**Comment Markers:**
- `⚡ PERFORMANCE:` - Performance optimizations or improvements
- `✅ CRITICAL FIX:` - Important fixes or critical behavior
- `🔒 SECURITY:` - Security-related code in `next.config.ts`
- Standard comments for logic explanation

## Function Design

**Size:** Keep functions focused and under 50 lines when possible. Longer functions are acceptable for complex layout components (e.g., `AccountPageLayout` is 256 lines as it combines multiple sub-components).

**Parameters:**
- Use destructuring for object parameters: `({ type, formData, activeTab }: AccountPageProps)`
- Generic type parameters for flexibility: `request<T, D = unknown>(...)`
- Optional trailing parameters with defaults
- Callback functions as props: `onSubmit: () => void`, `onNextClick: () => void`

**Return Values:**
- Explicit return types on all functions
- Services return wrapped responses: `Promise<ApiResponse<T>>`
- Hooks return object with multiple values: `{ form, formData, errors, isSubmitting, ... }`
- React components return `JSX.Element`
- Nullable returns documented in response interface

## Module Design

**Exports:**
- Named exports preferred for functions and components
- Default exports for page components (Next.js pages)
- Type exports using `export type` syntax
- Constant exports for shared configuration (e.g., `ACCOUNT_VALIDATION_RULES`)

**Barrel Files:**
- Minimal use observed; mostly avoided
- Used in `@/shared/components/ui/` for component collections
- Example: Components imported directly like `import { Button } from "@/shared/components/ui/button"`

**Feature Structure:**
Each feature module follows consistent pattern:
```
features/[feature-name]/
  ├── components/      # React components specific to feature
  ├── hooks/           # Custom hooks for feature logic
  ├── services/        # API calls and data services
  ├── types/           # TypeScript interfaces and types
  └── utils/           # Utility functions and helpers
```

**Code Organization:**
- Section headers with `===` borders for large files (e.g., account.types.ts)
- Logical grouping of related functionality
- Utilities organized by domain/feature rather than by type
- Services and hooks grouped with their domain features

## Memo and Performance

**React Memo:**
- Used on functional components to prevent unnecessary re-renders: `export const UserLoginForm = memo(function UserLoginForm({ ... })`
- Applied to components with stable props to optimize performance
- Function names preserved after memo wrapping for better debugging

**Re-render Optimization:**
- `useCallback` used to memoize callbacks: `const handleNext = useCallback(() => { ... }, [handleSubmit, validateAndProceed, formData])`
- Dependency arrays specified explicitly
- Form state managed locally in hooks to reduce component re-renders

---

*Convention analysis: 2026-02-23*
