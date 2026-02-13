import { apiClient } from './api-client';
import { getAuthToken, updateTokenExpiry } from './auth';

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

let refreshTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();
let isUpdating = false; // Prevent duplicate simultaneous updates

// Track user activity
export const setupActivityTracking = () => {
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  return () => {
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
  };
};

// Update token expiration (without changing the token)
const updateTokenExpiration = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token || isUpdating) return false;

  isUpdating = true;

  try {
    const response = await apiClient.post<{ message: string; expires_at: string }, { token: string }>('/update-token-expiration', { token });

    if (response.error) {
      console.error('Token expiration update failed:', response.error);
      return false;
    }

    // Update local cookie with new expiry
    if (response.data?.expires_at) {
      updateTokenExpiry(response.data.expires_at);
      console.log('Token expiration updated:', response.data.expires_at);
    }

    return true;
  } catch (error) {
    console.error('Token expiration update error:', error);
    return false;
  } finally {
    isUpdating = false;
  }
};

let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 30 * 1000; // Only update once every 30 seconds max

// Manually trigger token update (debounced and non-blocking for UI responsiveness)
// Uses requestIdleCallback to ensure it doesn't run during critical rendering (like modal open animations)
export const triggerTokenUpdate = (): void => {
  // Use requestIdleCallback if available, otherwise fallback to direct execution
  const runOnIdle = (typeof window !== 'undefined' && 'requestIdleCallback' in window)
    ? (cb: () => void) => window.requestIdleCallback(cb)
    : (cb: () => void) => cb();

  runOnIdle(() => {
    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounce timer - this ensures we don't make excessive API calls
    debounceTimer = setTimeout(() => {
      // Fire and forget - don't await, don't block UI
      updateTokenExpiration().catch(err => {
        console.error('Background token update failed:', err);
      });
    }, DEBOUNCE_DELAY);
  });
};

// Start automatic token expiration updates
export const startTokenRefresh = () => {
  if (refreshTimer) return;

  refreshTimer = setInterval(async () => {
    const timeSinceActivity = Date.now() - lastActivityTime;

    // Only update expiration if user was active in the last 30 minutes
    if (timeSinceActivity < 30 * 60 * 1000) {
      await updateTokenExpiration();
    }
  }, TOKEN_REFRESH_INTERVAL);
};

// Stop token refresh
export const stopTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};