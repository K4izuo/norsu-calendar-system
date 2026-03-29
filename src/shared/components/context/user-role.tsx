"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Role = 'dean' | 'staff' | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === 'undefined') return null;
    return (sessionStorage.getItem('register-role') as Role) ?? null;
  });

  const setRoleWithPersist = useCallback((newRole: Role) => {
    if (newRole) {
      sessionStorage.setItem('register-role', newRole);
    } else {
      sessionStorage.removeItem('register-role');
    }
    setRole(newRole);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleWithPersist }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}