import { cache } from "react";
import { cookies } from "next/headers";

/**
 * Server-side helper for fetching the current user inside RSC layouts/pages.
 *
 * Why this exists:
 *   The browser's session cookie is HttpOnly — JS can't read it. But a Next.js
 *   Server Component running in Node CAN read it via `cookies()` from
 *   next/headers, and forward it to the Laravel backend's /me endpoint.
 *
 *   Wrapped in React's `cache()` so multiple Server Components rendering in
 *   the same request only trigger one /me round-trip.
 *
 * What Sanctum needs to recognize this as a stateful (cookie) request:
 *   - The forwarded `Cookie` header (so the session can be looked up)
 *   - A `Referer` header whose domain matches SANCTUM_STATEFUL_DOMAINS on
 *     the backend (defaults include localhost:3000)
 */

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8000";
const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

interface ServerUserPayload {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  campus_id?: string;
  office_id?: string;
  assignment_id?: string;
  office?: {
    id: number;
    name: string;
    oversight_vp_id: number | null;
  };
}

interface ServerUserResponse {
  user: ServerUserPayload;
  role: number | null;
  expires_at?: string;
}

export interface ServerCurrentUser extends ServerUserPayload {
  role: number;
  expires_at?: string;
}

export const getCurrentUserOnServer = cache(
  async (): Promise<ServerCurrentUser | null> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) {
      return null;
    }

    try {
      const response = await fetch(`${INTERNAL_API_URL}/api/me`, {
        method: "GET",
        headers: {
          cookie: cookieHeader,
          referer: `${FRONTEND_URL}/`,
          accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as ServerUserResponse;
      if (data.role === null || data.role === undefined) {
        return null;
      }

      return {
        ...data.user,
        role: data.role,
        expires_at: data.expires_at,
      };
    } catch {
      return null;
    }
  }
);
