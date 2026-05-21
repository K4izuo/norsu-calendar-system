"use client";

import { useEffect, useCallback } from "react";
import { clearAuthCaches, getSessionExpiresAt } from "@/core/auth/auth";

/**
 * Watches the cached session expiry timestamp. When it's in the past, clears
 * local caches and bounces the user back to the landing page so they can log
 * in again. The actual server-side session is invalidated by Sanctum once
 * idle past `SESSION_LIFETIME`; this just keeps the UI honest in between.
 */
export function TokenExpiryMonitor() {
  const checkExpiry = useCallback(() => {
    const expiry = getSessionExpiresAt();
    if (!expiry) return;
    if (expiry <= new Date()) {
      clearAuthCaches();
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkExpiry();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkExpiry]);

  return null;
}
