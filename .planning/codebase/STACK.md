# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5.x - Full type-safe codebase
- TSX/JSX - React component syntax with TypeScript
- JavaScript - Configuration files (ESM modules)

**Secondary:**
- CSS - Styling with Tailwind CSS

## Runtime

**Environment:**
- Node.js (version not specified in package.json, inferred from Next.js 16.1.4 compatibility)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Next.js 16.1.4 - Full-stack React framework with Turbopack
- React 19.2.3 - UI framework
- React DOM 19.2.3 - DOM rendering

**Build/Dev:**
- Turbopack - Default build system for Next.js 16 (no custom webpack config needed)
- TypeScript 5.x - Compiler and type checking

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- PostCSS 4.x (@tailwindcss/postcss) - CSS processing
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.3.1 - Merge Tailwind classes intelligently

**Component UI:**
- Radix UI 1.4.3 - Headless component library
  - @radix-ui/react-avatar 1.1.11
  - @radix-ui/react-checkbox 1.3.3
  - @radix-ui/react-collapsible 1.1.12
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-dropdown-menu 2.1.16
  - @radix-ui/react-label 2.1.7
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-separator 1.1.8
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-tabs 1.1.13
  - @radix-ui/react-tooltip 1.2.8
- shadcn/ui - Component library built on Radix UI

**Forms & Validation:**
- react-hook-form 7.65.0 - Form state and validation management

**Animations & Motion:**
- framer-motion 12.23.12 - Advanced animations library
- motion 12.26.2 - Motion component library
- tw-animate-css 1.3.7 - Tailwind animation utilities

**Notifications/Feedback:**
- react-hot-toast 2.6.0 - Toast notifications
- sonner 2.0.7 - Alternative toast library

**Icons:**
- lucide-react 0.541.0 - Icon library

**Theme Management:**
- next-themes 0.4.6 - Dark mode and theme switching

**Data Fetching & State Management:**
- @tanstack/react-query 5.x - Server state management (from package-lock analysis)
- @tanstack/react-query-devtools 5.91.2 - Development tools for React Query

## Development Dependencies

**Linting & Code Quality:**
- ESLint 9.x - JavaScript/TypeScript linter
- @eslint/eslintrc 3.x - ESLint configuration compatibility layer
- eslint-config-next 15.5.0 - Next.js ESLint configuration

**Type Checking:**
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions
- @types/css-modules 1.0.5 - CSS modules type definitions

**Build Analysis:**
- @next/bundle-analyzer 15.1.4 - Bundle size analysis

**Browser Support:**
- baseline-browser-mapping 2.8.32 - Browser compatibility mapping

## Configuration

**Environment:**
- Environment variables stored in `.env.local` (not committed)
- Primary environment variable: `NEXT_PUBLIC_API_URL` - Backend API endpoint

**Build Configuration:**
- `next.config.ts` - Next.js configuration with:
  - Remote image optimization from Vercel Blob and Unsplash
  - Image formats: avif, webp
  - Strict React mode enabled
  - Security headers (HSTS, XSS protection, CSP)
  - Compression enabled
  - Production console.log removal
  - Optimistic client cache
  - Package import optimization for bundle splitting
  - Webpack build worker enabled
  - Turbopack default build system

**Styling Configuration:**
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin
- `tailwind.config.ts` - Tailwind CSS configuration (handled by shadcn/ui setup)
- `components.json` - shadcn/ui configuration:
  - Style: New York
  - Tailwind CSS with CSS variables (baseColor: neutral)
  - Icon library: Lucide
  - Component aliases configured

**Type Configuration:**
- `tsconfig.json`:
  - Target: ES2017
  - Module: ESNext
  - JSX: react-jsx
  - Strict mode enabled
  - Path aliases: `@/*` → `./src/*`

**Linting Configuration:**
- `eslint.config.mjs`:
  - Uses ESLint flat config (ESLint 9.x)
  - Extends: next/core-web-vitals, next/typescript
  - Ignores: node_modules, .next, out, build, next-env.d.ts

## Platform Requirements

**Development:**
- Node.js (compatible with Next.js 16.1.4, recommend Node 18+)
- npm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Production:**
- Node.js runtime
- Deployment target: Vercel-compatible (evident from image remotePatterns and Vercel Blob Storage references)
- Static file serving for public assets
- Environment: `NEXT_PUBLIC_API_URL` must be configured

---

*Stack analysis: 2026-02-23*
