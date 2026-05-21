/**
 * Local auth caches for SPA cookie session.
 *
 * The actual session lives in an HttpOnly cookie set by the backend (Sanctum
 * SPA mode). JavaScript can't read it, and that's the point.
 *
 * What we DO cache here is non-sensitive identity (user metadata, role number,
 * session expiry) so the UI can render without an extra /me round-trip on every
 * mount. The source of truth is still the server — /me re-validates on every
 * page load through the auth context.
 */

const USER_KEY = "user";
const USER_ROLE_KEY = "user-role";
const USER_ID_KEY = "user-id";
const SESSION_EXPIRES_KEY = "session-expires-at";

interface CachedIdentityUser {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface CachedIdentity {
  user: CachedIdentityUser;
  role?: number;
}

export function cacheLoginIdentity(identity: CachedIdentity): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(identity.user));
    if (identity.role !== undefined) {
      localStorage.setItem(USER_ROLE_KEY, String(identity.role));
    }
    if (identity.user.id !== undefined) {
      localStorage.setItem(USER_ID_KEY, String(identity.user.id));
    }
  } catch {
    // localStorage can throw in private-browsing/quota-exceeded — ignore.
  }
}

export function setSessionExpiresAt(expiresAt: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_EXPIRES_KEY, expiresAt);
  } catch {
    // ignore
  }
}

export function getSessionExpiresAt(): Date | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_EXPIRES_KEY);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ROLE_KEY);
}

export function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_ID_KEY);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function clearAuthCaches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(SESSION_EXPIRES_KEY);
  // Legacy keys from the bearer-token era — remove so old sessions don't linger.
  localStorage.removeItem("auth-token");
  localStorage.removeItem("role");
}

/**
 * Legacy alias kept so existing logout call-sites continue to compile.
 * The session itself is killed server-side via POST /logout; this only
 * clears our local UI caches.
 */
export const removeAuthToken = clearAuthCaches;
