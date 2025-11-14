import { apiClient } from './api-client';
import { getAuthToken, removeAuthToken } from './auth';

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

let refreshTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();

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
  if (!token) return false;

  try {
    const response = await apiClient.post<{ message: string; expires_at: string }, { token: string }>('/update-token-expiration', { token });

    if (response.error) {
      console.error('Token expiration update failed');
      return false;
    }

    console.log('Token expiration updated:', response.data?.expires_at);
    return true;
  } catch (error) {
    console.error('Token expiration update error:', error);
    return false;
  }
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