import { useCallback, useEffect, useRef, useState } from "react";

export function useTimedLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endsAtRef = useRef(0);

  const clearLoadingTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopLoading = useCallback(() => {
    clearLoadingTimer();
    endsAtRef.current = 0;
    setIsLoading(false);
  }, [clearLoadingTimer]);

  const syncWithElapsedTime = useCallback(() => {
    if (!endsAtRef.current) return;

    const remainingMs = endsAtRef.current - Date.now();
    if (remainingMs <= 0) {
      stopLoading();
      return;
    }

    clearLoadingTimer();
    timeoutRef.current = setTimeout(stopLoading, remainingMs);
  }, [clearLoadingTimer, stopLoading]);

  const startLoading = useCallback((durationMs: number) => {
    clearLoadingTimer();
    endsAtRef.current = Date.now() + durationMs;
    setIsLoading(true);
    timeoutRef.current = setTimeout(stopLoading, durationMs);
  }, [clearLoadingTimer, stopLoading]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) syncWithElapsedTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", syncWithElapsedTime);
    window.addEventListener("pageshow", syncWithElapsedTime);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", syncWithElapsedTime);
      window.removeEventListener("pageshow", syncWithElapsedTime);
      clearLoadingTimer();
    };
  }, [clearLoadingTimer, syncWithElapsedTime]);

  return { isLoading, startLoading, stopLoading };
}
