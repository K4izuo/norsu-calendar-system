<!-- BEGIN:nextjs-agent-rules -->
# NORSU Calendar System Agent Instructions

## Highest Priority: Next.js 16

This is not the older Next.js behavior most agents were trained on. The project uses Next.js 16 and React 19. Before changing any Next.js API, App Router convention, config option, metadata, image/font behavior, caching behavior, server/client boundary, route handler, proxy/middleware file, or build behavior, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices and prefer the local docs over memory.

## Project Overview

NORSU Calendar System is a private TypeScript web application for calendar events, reservations, assets, accounts, dashboards, and role-based user workflows.

Primary stack:
- Next.js 16 App Router with Turbopack.
- React 19.
- TypeScript with `strict` enabled.
- Tailwind CSS 4 and Radix UI primitives.
- TanStack Query for client/server data coordination.
- Zod and React Hook Form for validation-heavy workflows.
- `npm` is the canonical package manager because this repo has `package-lock.json`.

## Commands

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Production build: `npm run build`
- Start production server after build: `npm run start`
- Lint: `npm run lint`
- Analyze bundle: `npm run analyze`

There is no test script configured in `package.json` yet. Do not claim tests were run unless you added or used a real test command. For behavior changes, at minimum run `npm run lint`; run `npm run build` when touching routing, config, server/client boundaries, shared components, or anything likely to affect production compilation.

## Repository Structure

- `src/app/` contains App Router routes, layouts, templates, pages, loading states, and route-local components.
- `src/app/(dashboard)/[role]/` contains role-scoped dashboard routes.
- `src/app/_components/` and `src/app/_hooks/` contain app-level shared UI and hooks.
- `src/features/` contains domain-specific feature code such as accounts, assets, calendar, people, reservations, and user profile.
- `src/shared/components/` contains reusable UI primitives, layouts, contexts, hooks, and dashboard UI pieces.
- `src/core/` contains core auth, API client, query provider, role utilities, and common library code.
- `src/api/` contains frontend-facing API wrappers.
- `src/proxy.ts` and `next.config.ts` affect request/proxy behavior. Treat changes here as high risk.
- `public/` contains static assets.
- `docs/` contains project documentation.
- `.claude/agents/`, `.claude/rules/`, and `.claude/skills/` contain Claude Code project configuration.
- `.agents/skills/` is only for Codex project skills if that directory is created. Do not assume it exists.

## Agent Config

Claude Code reads `CLAUDE.md`, and this repo's `CLAUDE.md` imports this file with `@AGENTS.md`. Codex reads `AGENTS.md` directly.

Use ECC guidance when it is relevant:
- Consult `.claude/rules/common`, `.claude/rules/typescript`, and `.claude/rules/web` for standards.
- Use `.claude/skills` for Claude Code skills when the task matches.
- Use `.agents/skills` for Codex skills only if the folder exists.
- Prefer the existing project subagents in `.claude/agents` for code review, security review, and TypeScript review workflows.

## Engineering Rules

- Read the existing implementation before editing. Match the local pattern before introducing a new abstraction.
- Keep changes scoped to the user's request. Avoid drive-by refactors, dependency churn, and formatting-only edits in unrelated files.
- Prefer `@/` imports for source files when that is clearer than deep relative paths.
- Keep TypeScript strict. Avoid `any`; prefer precise types, `unknown` with narrowing, or existing project types.
- Keep components focused. Move reusable UI into `src/shared/components/` only when reuse is real.
- Keep feature-specific logic inside `src/features/<feature>/` unless it is genuinely shared.
- Use Zod or existing validation utilities for user input, form data, and API boundary data.
- Use TanStack Query patterns already present in the repo for async client data instead of ad hoc fetch state.
- Do not hardcode API URLs outside the existing API client/proxy patterns.

## Next.js And React Rules

- Server Components are the default. Add `"use client"` only when a component needs client state, effects, browser APIs, event handlers, or client-only libraries.
- Do not pass server-only values or non-serializable objects into Client Components.
- Keep route-level files aligned with App Router conventions: `page.tsx`, `layout.tsx`, `template.tsx`, `loading.tsx`, `not-found.tsx`.
- Before changing `next.config.ts`, confirm the option still exists in the local Next.js docs.
- Be careful with `images.remotePatterns`; only add trusted hosts that are required by the product.
- Preserve Turbopack compatibility. Do not add webpack-only assumptions unless the local docs and config support them.

## UI Rules

- Reuse existing primitives from `src/shared/components/ui/` before adding new UI primitives.
- Use Radix UI patterns already present in the project for dialogs, dropdowns, selects, tabs, tooltips, and similar controls.
- Use `lucide-react` for icons when an icon is needed.
- Keep dashboard/admin UI dense, clear, and task-focused. Avoid marketing-style hero sections inside operational screens.
- Ensure responsive layouts do not overlap, clip text, or create horizontal scroll on common mobile widths.
- Preserve accessibility basics: semantic elements, labels for form controls, keyboard-reachable interactive elements, and visible focus states.

## Security And Data Handling

- Never read, print, modify, or commit secrets from `.env`, `.env.local`, or other credential files unless the user explicitly asks and the action is necessary.
- Do not commit `test-accounts.json` contents into logs, docs, examples, or chat output.
- Validate role and permission-sensitive flows. This app has role-based routes; do not assume client-side checks are enough.
- Treat `/api-proxy/:path*` in `next.config.ts` as a sensitive backend integration. Do not change it without explaining the behavioral impact.
- Do not weaken headers in `next.config.ts` unless the user explicitly requests it and the security tradeoff is documented.

## Validation Policy

Before finishing a code change:
- Run `npm run lint` for all TypeScript/React changes.
- Run `npm run build` for changes to Next.js config, routing, layouts, metadata, server/client boundaries, shared UI, auth, proxying, or data fetching.
- If validation cannot be run, state exactly why and what remains unverified.
- If adding a new validation/test tool, add the script to `package.json` and document the command here.

## Git And Change Safety

- Do not overwrite user changes. Inspect existing diffs before making broad edits.
- Do not run destructive git commands such as `git reset --hard`, `git checkout --`, or force pushes unless explicitly requested.
- Keep commits, if requested, focused and explain user-visible impact.
- Do not add new production dependencies without a clear need and user approval.

## Documentation

- Update `README.md`, files in `docs/`, or this `AGENTS.md` when changing setup commands, architecture, validation policy, environment variables, or agent workflow expectations.
- Keep this file concise and operational. Move long procedures into docs or skills and reference them here.
<!-- END:nextjs-agent-rules -->
