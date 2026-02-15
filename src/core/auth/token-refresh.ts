import { apiClient } from '@/core/api/api-client';
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

// Manually trigger token update (for user actions like sidebar clicks)
// Fire-and-forget - doesn't block the caller
export const triggerTokenUpdate = (): void => {
  // Don't await - let it run in background
  updateTokenExpiration().catch((error) => {
    // Silently log failures - token refresh is not critical
    console.warn('Token refresh failed (non-critical):', error);
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