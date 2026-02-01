"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  // ⚡ PERFORMANCE: Memoize actions (already done - good!)
  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  // ⚡ PERFORMANCE: Memoize context value to prevent re-renders
  const contextValue = useMemo<NavigationContextType>(() => ({
    isNavigating,
    startNavigation,
    endNavigation
  }), [isNavigating, startNavigation, endNavigation]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}