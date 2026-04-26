## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Next.js Best Practices

Apply ALL rules below when writing or reviewing ANY Next.js code in this project. These are Vercel's official best practices — non-negotiable, every task, every conversation.

---

### File Conventions

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI (must be 'use client')
├── not-found.tsx       # 404 UI
├── global-error.tsx    # Root error UI (must include <html><body>)
├── route.ts            # API endpoint
├── template.tsx        # Re-rendered layout
├── default.tsx         # Parallel route fallback
├── [slug]/             # Dynamic segment
├── [...slug]/          # Catch-all
├── [[...slug]]/        # Optional catch-all
└── (group)/            # Route group (no URL impact)
```

- Next.js 14-15: `middleware.ts` → `export function middleware()`
- Next.js 16+: `proxy.ts` → `export function proxy()`
- Prefix folders with `_` to exclude from routing

---

### RSC Boundaries

**Async Client Components are INVALID:**
```tsx
// Bad
'use client'
export default async function UserProfile() { ... }

// Good: fetch in server parent, pass data down
export default async function Page() {
  const user = await getUser()
  return <UserProfile user={user} />
}
```

**Non-serializable props to Client Components are INVALID:**

| Pattern | Valid? | Fix |
|---------|--------|-----|
| `'use client'` + `async function` | No | Fetch in server parent |
| Pass `() => {}` to client | No | Define in client or use Server Action |
| Pass `new Date()` to client | No | Use `.toISOString()` |
| Pass `new Map()` / `new Set()` | No | Convert to object/array |
| Pass class instance | No | Pass plain object |
| Pass Server Action | Yes | — |
| Pass string/number/boolean/plain object | Yes | — |

---

### Async Patterns (Next.js 15+)

`params`, `searchParams`, `cookies()`, `headers()` are ALL async — always await them:

```tsx
// Pages/Layouts
type Props = { params: Promise<{ slug: string }> }
export default async function Page({ params }: Props) {
  const { slug } = await params
}

// Route Handlers
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// Non-async components: use React.use()
import { use } from 'react'
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
}

// cookies/headers
const cookieStore = await cookies()
const headersList = await headers()
```

Migration codemod: `npx @next/codemod@latest next-async-request-api .`

---

### Directives

- `'use client'` — required for hooks, event handlers, browser APIs
- `'use server'` — marks Server Actions; can be passed to Client Components
- `'use cache'` — Next.js caching directive (requires `cacheComponents: true` in config)

---

### Data Patterns

**Decision tree:**
- Server Component read → fetch directly, no API needed
- Client Component mutation → Server Action
- Client Component read → pass from Server Component or Route Handler
- External webhook / REST API → Route Handler

**Avoid waterfalls — use `Promise.all` or Suspense:**
```tsx
// Good
const [user, posts] = await Promise.all([getUser(), getPosts()])

// Good: streaming
<Suspense fallback={<Skeleton />}><UserSection /></Suspense>
<Suspense fallback={<Skeleton />}><PostsSection /></Suspense>
```

**Server Actions for mutations:**
```tsx
'use server'
export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get('title') } })
  revalidatePath('/posts')
}
```

**Route Handlers — when to use vs Server Actions:**

| Use Case | Route Handlers | Server Actions |
|----------|----------------|----------------|
| Form submissions | No | Yes |
| Third-party webhooks | Yes | No |
| Public REST API | Yes | No |
| Internal data fetching | No (use RSC) | No (use RSC) |

---

### Route Handlers

- `route.ts` and `page.tsx` cannot coexist in the same folder
- No React hooks or DOM APIs in route handlers
- Dynamic params are async: `{ params }: { params: Promise<{ id: string }> }`

---

### Error Handling

- `error.tsx` must be `'use client'`
- `global-error.tsx` must include `<html>` and `<body>` tags
- **Never wrap `redirect()`, `notFound()`, `forbidden()`, `unauthorized()` in try-catch** — they throw internally; use `unstable_rethrow()` instead:

```tsx
import { unstable_rethrow } from 'next/navigation'
async function action() {
  try {
    redirect('/success')
  } catch (error) {
    unstable_rethrow(error) // re-throws Next.js internal errors
    return { error: 'Something went wrong' }
  }
}
```

---

### Metadata

- `metadata` export and `generateMetadata` are **Server Components only**
- Use `React.cache()` to avoid duplicate fetches between `generateMetadata` and page
- Viewport config must be separate from metadata
- Use title templates in root layout: `{ title: { default: 'Site', template: '%s | Site' } }`
- OG images: use `next/og` (NOT `@vercel/og`), avoid Edge runtime for OG

---

### Image Optimization

- **Always use `next/image`**, never `<img>`
- Remote domains must be in `next.config.js` `remotePatterns`
- Add `sizes` prop when using `fill` to prevent downloading the largest image
- Use `priority` for above-the-fold / LCP images
- Local images: dimensions auto-inferred. Remote images: must specify `width`/`height` or `fill`

---

### Font Optimization

- **Always use `next/font`**, never `<link>` tags or `@import` for Google Fonts
- Import fonts once in layout, not in every component
- Use CSS variables (`variable: '--font-inter'`) for Tailwind integration
- Always specify `subsets` to avoid loading all characters

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export default function RootLayout({ children }) {
  return <html className={inter.variable}><body>{children}</body></html>
}
```

---

### Bundling

- Browser-API packages in Server Components → use `dynamic(() => import(...), { ssr: false })`
- Native binding packages (sharp, bcrypt, canvas) → `serverExternalPackages: ['sharp']`
- ESM packages with issues → `transpilePackages: ['package']`
- Import CSS files, never `<link>` tags
- Don't add polyfills — Next.js includes `fetch`, `Promise`, `Array.from`, etc.

---

### Scripts

- **Always use `next/script`**, never native `<script>` tags
- Inline scripts require an `id` attribute
- Don't put `next/script` inside `next/head`
- Google Analytics → use `@next/third-parties/google` `<GoogleAnalytics>`

---

### Hydration Errors

Common causes:
- `window`/`document` in SSR → use `'use client'` + `useEffect` mounted check
- `new Date().toLocaleString()` → render on client only
- `Math.random()` / random IDs → use `useId()`
- Invalid HTML nesting (div inside p, p inside p)
- Third-party scripts modifying DOM → use `strategy="afterInteractive"`

---

### Suspense Boundaries

| Hook | Suspense Required |
|------|-------------------|
| `useSearchParams()` | Yes — always |
| `usePathname()` | Yes — in dynamic routes |
| `useParams()` | No |
| `useRouter()` | No |

Without Suspense around `useSearchParams`, the entire page becomes CSR.

---

### Parallel & Intercepting Routes

- Every `@slot` folder **must have a `default.tsx`** returning `null` — without it, refresh causes 404
- Close modals with `router.back()`, NOT `router.push()` or `<Link>`
- Matchers: `(.)` same level, `(..)` one level up, `(...)` from root

---

### Runtime Selection

- Default to Node.js runtime (no config needed)
- Only use `export const runtime = 'edge'` if the project already uses it or there's a specific latency requirement

---

### Self-Hosting

- Use `output: 'standalone'` for Docker deployments
- Multi-instance ISR requires a custom cache handler (Redis/S3) — filesystem cache breaks across instances
- Always set `HOSTNAME="0.0.0.0"` in containers
- Copy `public/` and `.next/static/` separately — not included in standalone output
- Include a health check: `app/api/health/route.ts`

---

### Debug Tricks

- Next.js 16+: `/_next/mcp` endpoint available in dev for AI-assisted debugging
- Use `next build --debug-build-paths "/route"` to rebuild specific routes without full rebuild

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
