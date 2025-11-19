// components/auth/TokenExpiryMonitor.tsx
"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken } from '@/lib/auth';

export function TokenExpiryMonitor() {
  const router = useRouter();

  const checkTokenExpiry = useCallback(() => {
    // Get token expiry from cookies
    const cookies = document.cookie.split(';');
    const expiryCookie = cookies.find(c => c.trim().startsWith('token-expiry='));
    
    if (!expiryCookie) {
      return;
    }

    const expiryValue = expiryCookie.split('=')[1];
    const expiryDate = new Date(expiryValue);
    const now = new Date();

    // If token has expired
    if (expiryDate <= now) {
      // Clear all auth data
      removeAuthToken();
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token-expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Redirect to main page
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkTokenExpiry();

    // Check every second for precise expiry detection
    const interval = setInterval(checkTokenExpiry, 1000);

    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkTokenExpiry]);

  return null; // This component doesn't render anything
}