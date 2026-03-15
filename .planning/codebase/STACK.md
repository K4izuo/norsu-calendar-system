# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5 - All source code in `src/` directory
- JSX/TSX - React component syntax for UI components

**Secondary:**
- JavaScript (ES2017 target) - Configuration files and build tooling
- CSS - Styling via Tailwind CSS PostCSS plugin

## Runtime

**Environment:**
- Node.js - No specific version pinned (check package.json for runtime compatibility)

**Package Manager:**
- npm (v10+ implied by package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.4 - Full-stack React framework with Server Components, routing, and API middleware
- React 19.2.3 - UI library for component-based architecture
- React DOM 19.2.3 - React rendering to DOM

**UI & Styling:**
- Tailwind CSS 4 - Utility-first CSS framework via `@tailwindcss/postcss` (PostCSS plugin)
- Radix UI 1.4.3 - Unstyled, accessible component primitives
  - Individual Radix components: `@radix-ui/react-avatar` 1.1.11, `@radix-ui/react-dialog` 1.1.15, `@radix-ui/react-dropdown-menu` 2.1.16, `@radix-ui/react-select` 2.2.6, `@radix-ui/react-tabs` 1.1.13, `@radix-ui/react-checkbox` 1.3.3, and others
- class-variance-authority 0.7.1 - CSS-in-JS utility for managing component variants
- tailwind-merge 3.3.1 - Merge Tailwind CSS classes intelligently

**Animation:**
- Framer Motion 12.23.12 - Production-ready animation library
- Motion 12.26.2 - Motion specification library (companion to Framer Motion)

**Icons:**
- lucide-react 0.541.0 - Minimal icon library with React components

**Data & State:**
- TanStack React Query 5.91.2 - Server state management and data fetching
- react-hook-form 7.65.0 - Performant, flexible form state management
- next-themes 0.4.6 - Theme management (dark/light mode) for Next.js

**Notifications & Feedback:**
- react-hot-toast 2.6.0 - Toast notifications (configured in `src/app/layout.tsx`)
- sonner 2.0.7 - Toast/notification library (alternative toast solution)

**Utilities:**
- clsx 2.1.1 - Utility for constructing className strings

**Testing & Development:**
- ESLint 9 - JavaScript/TypeScript linting
- @eslint/eslintrc 3 - ESLint configuration utilities (flat config compatibility)
- eslint-config-next 15.5.0 - Next.js recommended ESLint rules and config
- TypeScript 5 - Static type checking and compilation
- @types/react 19 - TypeScript definitions for React 19
- @types/react-dom 19 - TypeScript definitions for React DOM 19
- @types/node 20 - TypeScript definitions for Node.js APIs
- @next/bundle-analyzer 15.1.4 - Webpack bundle analysis for production builds

**Build & Performance:**
- Turbopack - Next.js 16 default bundler (faster than Webpack, configured in `next.config.ts`)
- Next.js Compiler - Built-in optimizer with console log removal for production

## Key Dependencies

**Critical:**
- @tanstack/react-query - Powers all server state management and API data caching (see `src/core/lib/query-provider.tsx`)
- next - Core framework enabling file-based routing, SSR, and production-ready deployment
- typescript - Ensures type safety across entire codebase

**Infrastructure:**
- react, react-dom - Required for all UI rendering and interactivity
- @radix-ui packages - Provide accessible component foundations for all UI components

## Configuration

**Environment:**
- API Base URL: `process.env.NEXT_PUBLIC_API_URL` - Backend API endpoint (required for all API calls in `src/core/api/api-client.ts`)
- Development: `.env.local` file present (contains environment configuration)

**Build:**
- `next.config.ts` - Next.js configuration with:
  - Security headers (HSTS, X-Frame-Options, CSP, etc.)
  - Image optimization (AVIF, WebP formats)
  - React Strict Mode enabled
  - Console log removal in production
  - Compression enabled
  - Turbopack configuration
  - Package import optimization for code splitting

- `tsconfig.json` - TypeScript compiler options:
  - Target: ES2017
  - Module: ES modules (esnext)
  - Strict mode enabled
  - JSX: react-jsx
  - Path alias: `@/*` maps to `./src/*`

- `postcss.config.mjs` - PostCSS configuration using Tailwind CSS PostCSS plugin

- `components.json` - Shadcn/ui configuration:
  - Style: new-york
  - Icons: lucide-react
  - Component aliases configured in `src/components`, `src/ui`, `src/hooks`, `src/lib`

- `eslint.config.mjs` - ESLint flat config:
  - Extends: `next/core-web-vitals`, `next/typescript`
  - Ignores: `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`

## Platform Requirements

**Development:**
- Node.js (tested with npm v10+)
- npm or compatible package manager
- Modern browser with ES2017+ support

**Production:**
- Node.js runtime (Vercel, self-hosted, or container-based deployment)
- NEXT_PUBLIC_API_URL environment variable pointing to backend API (default: http://127.0.0.1:8000 based on comments)

---

*Stack analysis: 2026-03-15*
