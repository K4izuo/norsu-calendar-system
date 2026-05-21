import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 proxy (the file formerly known as middleware.ts).
 *
 * Thin first-line guard for dashboard routes. If there's no Laravel session
 * cookie at all, redirect to /login before rendering anything. Real auth is
 * still enforced in two places:
 *  - The auth-context's /me call on mount (catches expired sessions)
 *  - The backend's `auth:sanctum` + `role:*` middleware (catches forged sessions)
 *
 * The proxy does NOT call /me from here — that would add a server round-trip
 * to every page navigation. It only checks cookie presence.
 */

const ROLE_SEGMENTS = [
  "admin",
  "dean",
  "staff",
  "student-director",
  "campus-director",
  "vpaa",
  "vpsas",
  "vpaf",
  "vprde",
  "head",
  "multimedia",
  "university-president",
];

// Laravel 12's default session cookie name uses hyphens (e.g. `laravel-session`).
// Older defaults / custom APP_NAMEs may produce underscores. Accept both so the
// frontend doesn't need to redeploy if the backend renames itself.
const SESSION_COOKIE_PATTERN = /[-_]session$/;

function hasSessionCookie(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (SESSION_COOKIE_PATTERN.test(cookie.name) && cookie.value.length > 0) {
      return true;
    }
  }
  return false;
}

function isProtectedPath(pathname: string): boolean {
  const first = pathname.split("/").filter(Boolean)[0];
  return first !== undefined && ROLE_SEGMENTS.includes(first);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api-proxy|sanctum|login|register|about|$).*)",
  ],
};
