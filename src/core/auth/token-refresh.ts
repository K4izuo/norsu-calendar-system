import { apiClient } from "@/core/api/api-client";
import { setSessionExpiresAt } from "./auth";

const SESSION_TOUCH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let lastActivityTime = Date.now();
let isUpdating = false;

// Track user activity
export const setupActivityTracking = () => {
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  return () => {
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, updateActivity);
    });
  };
};

/**
 * Touch the SPA session so it doesn't idle out while the user is active.
 *
 * Hits POST /session/touch with no body. The Sanctum cookie session is sent
 * automatically via credentials: 'include'. The backend rotates the session
 * ID and returns a fresh `expires_at` we cache for the idle-timeout UI.
 */
const touchSession = async (): Promise<boolean> => {
  if (isUpdating) return false;
  isUpdating = true;

  try {
    const response = await apiClient.post<
      { message: string; expires_at: string },
      Record<string, never>
    >("/session/touch", {});

    if (response.error) {
      console.error("Session touch failed:", response.error);
      return false;
    }

    if (response.data?.expires_at) {
      setSessionExpiresAt(response.data.expires_at);
    }

    return true;
  } catch (error) {
    console.error("Session touch error:", error);
    return false;
  } finally {
    isUpdating = false;
  }
};

/**
 * Manually trigger a session touch (e.g. on sidebar interactions). Fire-and-forget.
 */
export const triggerTokenUpdate = (): void => {
  touchSession().catch((error) => {
    console.warn("Session touch failed (non-critical):", error);
  });
};

// Start automatic session touch on a timer
export const startTokenRefresh = () => {
  if (refreshTimer) return;

  refreshTimer = setInterval(async () => {
    const timeSinceActivity = Date.now() - lastActivityTime;

    // Only touch if the user was active in the last 30 minutes
    if (timeSinceActivity < 30 * 60 * 1000) {
      await touchSession();
    }
  }, SESSION_TOUCH_INTERVAL);
};

// Stop the touch timer
export const stopTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};
