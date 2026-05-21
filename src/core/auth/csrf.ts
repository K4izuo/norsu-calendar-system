/**
 * Sanctum CSRF helpers for SPA cookie auth.
 *
 * Flow:
 * 1. Before any state-changing request (POST/PUT/PATCH/DELETE), ensureCsrfCookie()
 *    is called. It does GET /sanctum/csrf-cookie which makes Laravel set the
 *    XSRF-TOKEN cookie (readable by JS) plus the session cookie (HttpOnly).
 * 2. readXsrfToken() reads the XSRF-TOKEN cookie value so the api-client can
 *    echo it back in the X-XSRF-TOKEN header — that's how Laravel validates CSRF.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Sanctum's CSRF endpoint lives at the host root (NOT under /api or /api-proxy).
 *
 * - For a full URL like `http://localhost:8000/api`, strip the trailing `/api`
 *   so we end up at `http://localhost:8000/sanctum/csrf-cookie`.
 * - For a relative same-origin path like `/api-proxy`, drop it entirely and
 *   call `/sanctum/csrf-cookie` against the frontend origin — Next.js rewrites
 *   that to the backend's root `/sanctum/csrf-cookie`.
 */
function deriveSanctumOrigin(apiUrl: string): string {
  // Full URL case: strip trailing /api
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
    return apiUrl.replace(/\/api\/?$/, "");
  }
  // Same-origin proxy case (e.g. "/api-proxy"): use empty so the resulting
  // call is `/sanctum/csrf-cookie` against the current frontend host.
  return "";
}

const SANCTUM_ORIGIN = deriveSanctumOrigin(API_BASE_URL);
const CSRF_COOKIE_URL = `${SANCTUM_ORIGIN}/sanctum/csrf-cookie`;

const XSRF_COOKIE_NAME = "XSRF-TOKEN";

let inflight: Promise<void> | null = null;

export function readXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${XSRF_COOKIE_NAME}=`;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(prefix));
  if (!cookie) return null;
  const raw = cookie.slice(prefix.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function invalidateCsrfCookie(): void {
  inflight = null;
}

export async function ensureCsrfCookie(): Promise<void> {
  if (inflight) return inflight;
  if (readXsrfToken()) return;

  inflight = (async () => {
    try {
      await fetch(CSRF_COOKIE_URL, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
