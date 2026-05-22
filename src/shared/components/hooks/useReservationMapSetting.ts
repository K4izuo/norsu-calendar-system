"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "norsu:reservation-map-enabled";

export function useReservationMapSetting() {
  const [mapEnabled, setMapEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setMapEnabled(e.newValue === null ? true : e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggle = useCallback((enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    setMapEnabled(enabled);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: String(enabled) }));
  }, []);

  return { mapEnabled, toggle };
}
