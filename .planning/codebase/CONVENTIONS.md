# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `HomeNavbar.tsx`, `AccountPageForm.tsx`)
- Utilities: camelCase (e.g., `account-validation-rules.ts`, `use-error-toast.ts`)
- Hooks: camelCase prefixed with `use` (e.g., `useAccountForm.ts`, `useCurrentUser.ts`)
- Types/Interfaces: PascalCase (e.g., `account.types.ts`, `user-props.ts`)
- Services: camelCase with `-service` suffix (e.g., `asset-service.ts`)
- API modules: camelCase (e.g., `api-client.ts`, `facultyEventsApi.ts`)

**Functions:**
- React components: PascalCase (e.g., `export default function HomeNavbar() {}`)
- Custom hooks: camelCase with `use` prefix (e.g., `export function useAccountForm()`)
- Utility functions: camelCase (e.g., `buildUrl()`, `buildHeaders()`, `formatTime()`)
- Service functions: camelCase (e.g., `fetchAssets()`, `createAsset()`, `storeAuthData()`)
- Handler functions: `handle` prefix (e.g., `handleUnauthorized()`, `handleNext()`, `handleBack()`)
- Validation functions: `validate` or `is` prefix (e.g., `isPublicEndpoint()`, `isProtectedEndpoint()`)

**Variables:**
- React state: camelCase (e.g., `activeTab`, `isSubmitting`, `formData`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MOBILE_BREAKPOINT`, `ACCOUNT_VALIDATION_RULES`)
- Loop variables: camelCase (e.g., `item`, `user`, `asset`)
- Boolean flags: `is`, `has`, `can` prefix (e.g., `isMobile`, `isAuthenticated`, `hasShown`)

**Types:**
- Interfaces: PascalCase (e.g., `HomeNavbarProps`, `UserAccount`, `EventDetails`)
- Type aliases: PascalCase (e.g., `RequestMethod`, `ApiResponse`)
- Enums: PascalCase (not used in codebase - prefer literal unions)
- Discriminated unions: PascalCase (e.g., `EventStatus = "pending" | "approved" | "decline"`)

**Props interfaces:**
- Named as `[ComponentName]Props` (e.g., `HomeNavbarProps`, `AccountPageFormProps`)
- Exported from same file as component or in types directory

## Code Style

**Formatting:**
- No explicit prettier config file detected; using Next.js defaults
- Inferred settings based on code:
  - 2-space indentation (consistent throughout)
  - Semicolons at end of statements
  - Double quotes for strings (except JSX attributes where single is used)
  - Trailing commas in objects/arrays

**Linting:**
- ESLint enabled with Next.js configuration (`eslint.config.mjs`)
- Extends: `next/core-web-vitals` and `next/typescript`
- Run: `npm run lint`
- Ignores: `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`

**Strict TypeScript:**
- `strict: true` in `tsconfig.json`
- `noEmit: true` - type checking only, no emit
- Path alias configured: `@/*` → `./src/*`
- Type safety enforced across all `.ts` and `.tsx` files

## Import Organization

**Order:**
1. External dependencies (React, Next.js, third-party packages)
   - Example: `import React from "react"`
   - Example: `import { useForm } from "react-hook-form"`
   - Example: `import { useQuery } from "@tanstack/react-query"`

2. Internal absolute imports using `@/` alias
   - Example: `import { apiClient } from "@/core/api/api-client"`
   - Example: `import { useAuth } from "@/shared/components/context/auth-context"`
   - Example: `import { ACCOUNT_VALIDATION_RULES } from "@/features/accounts/utils/account-validation-rules"`

3. Relative imports (rarely used due to `@/` alias preference)

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)
- All internal imports use absolute `@/` paths, avoiding relative paths like `../`

**Type imports:**
- Imported alongside values: `import { type ClassValue } from "clsx"`
- Or inline: `interface HomeNavbarProps { ... }`

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations: `await apiClient.get()`, `response.json()`
- Error responses modeled as return values, not exceptions: `{ data: T | null, error: string | null, status: number }`
- API client returns discriminated error objects:
  ```typescript
  return {
    data: null,
    error: 'Authentication required. Please log in.',
    status: 401
  };
  ```
- Hooks throw errors to be caught by React Query's error handling: `throw new Error(response.error)`
- Toast notifications used for user-facing errors: `toast.error(message)`
- Silent failures in catch blocks: `await response.json().catch(() => null)`
- User-friendly error messages mapped for display:
  ```typescript
  const messages: Record<string, string> = {
    session_expired: "Session expired. Please log in again.",
    unauthorized: "Access denied. Please log in to view this page.",
  };
  ```

## Logging

**Framework:** `console` (no external logging library) + Toast notifications (`react-hot-toast`)

**Patterns:**
- Inline comments with emoji markers for special cases:
  - `// ⚡ PERFORMANCE:` - Performance optimization notes
  - `// ✅ CRITICAL FIX:` - Critical fixes and important changes
  - `// Note:` - General notes about logic
- Console logging not visible in production (relies on error boundary + toast)
- User-facing feedback via toast notifications:
  ```typescript
  toast.success("Account created successfully!", { position: "top-center" })
  toast.error("Failed to create account!", { position: "top-center" })
  ```

## Comments

**When to Comment:**
- Complex logic requiring explanation (e.g., authentication flow, caching strategy)
- Performance optimizations with reasoning
- Critical fixes that address subtle bugs
- External API endpoint patterns
- Special cases in conditionals
- Inline comments for non-obvious code

**JSDoc/TSDoc:**
- Used in types file: `src/features/accounts/types/account.types.ts`
- Block-level JSDoc for interfaces and types:
  ```typescript
  /**
   * Form data for account creation/management
   * Used in account registration and profile update forms
   */
  export interface AccountFormData { ... }
  ```
- Section headers in type files:
  ```typescript
  // ============================================================================
  // Account Form Data
  // ============================================================================
  ```
- Minimal JSDoc on functions; prefer self-documenting code

## Function Design

**Size:**
- Most functions 20-50 lines
- Larger functions (100+ lines) found in page components (`src/app/page.tsx`: 171 lines)
- Utility functions kept under 30 lines
- API handlers in `api-client.ts` break logic into named helper functions

**Parameters:**
- Generics used for type safety: `async request<T, D = unknown>(...)`
- Callback parameters explicitly typed: `(errors) => showAccountErrorToast(errors, formData, null)`
- Destructured from objects when multiple: `{ handleSubmit, watch, formState: { errors } }`
- Options objects for configuration: `RequestOptions<D>`, `customOptions: Omit<RequestOptions, 'body'>`

**Return Values:**
- Explicit return types on all functions
- Service functions return typed promises: `Promise<Asset>`, `Promise<Asset[]>`
- Hooks return object with named properties: `{ data, isLoading, error, refetch }`
- Never implicit `any` returns
- Nullable returns explicitly typed: `string | null`, `T | null`

## Module Design

**Exports:**
- Default export for React components: `export default function ComponentName() {}`
- Named exports for utilities, hooks, types: `export const functionName = () => {}`
- Named exports for types: `export interface InterfaceName { ... }`
- Constants exported with `export const`: `export const API_BASE_URL = ...`

**Barrel Files:**
- Not extensively used; imports are typically specific file imports
- Example structure: `src/features/accounts/` has no index.ts barrel file
- Prefer explicit imports from specific files over barrel files

**Service Pattern:**
- Service files export pure functions (no hooks):
  ```typescript
  const fetchAssets = async (): Promise<Asset[]> => { ... }
  const createAsset = async (data: AssetRegistrationPayload): Promise<Asset> => { ... }
  ```
- Custom hooks wrap service functions and handle React Query:
  ```typescript
  export const useAssets = () => {
    return useQuery({ queryKey: ['assets'], queryFn: fetchAssets, ... });
  };
  ```

**Hook Pattern:**
- Hooks combine multiple concerns (data fetching, form handling, state management)
- Example `useAccountForm()`:
  - Uses `useForm()` from react-hook-form
  - Manages form state and validation
  - Returns form object, handlers, and validation rules
  - Calls utility functions for errors: `showAccountErrorToast()`

---

*Convention analysis: 2026-03-15*
