"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/core/api/api-client';
import { getAuthToken, removeAuthToken } from '@/core/auth/auth';

type Role = 'dean' | 'staff';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: Role;
}

// ⚡ PERFORMANCE: Split context into state and actions for better optimization
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (userData: User) => void;
  logout: () => void;
}

interface AuthContextType extends AuthState, AuthActions {}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ⚡ PERFORMANCE: Memoize actions to prevent re-renders
  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    removeAuthToken();
    router.replace('/auth/login');
  }, [router]);

  // Fetch user data from backend if token exists
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // ⚡ PERFORMANCE: /me endpoint is now cached via React Query in api-client
        // Fetch fresh user data from backend
        const response = await apiClient.get<{ user: User; role: number }>('/me');

        if (response.error || !response.data) {
          // Token invalid, clear everything
          removeAuthToken();
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Update localStorage with fresh data
          const userData = response.data.user;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        removeAuthToken();
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Listen for 401 unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('user');
      removeAuthToken();
      // Optional: Redirect to login or home if needed, but the 401 source might handle it
      // router.replace('/auth/login'); 
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router]);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const authRoutes = ['/auth/login', '/auth/register', '/auth/dean/register', '/auth/staff/register'];
      // const protectedRoutes = ['/pages/dean', '/pages/staff', '/pages/admin', '/dashboard', '/calendar', '/profile'];
      
      if (user && authRoutes.some(route => pathname?.startsWith(route))) {
        router.replace('/pages/admin/dashboard');
      }
      // else if (!user && protectedRoutes.some(route => pathname?.startsWith(route))) {
      //   router.replace('/auth/login');
      // }
    }
  }, [user, isLoading, pathname, router]);

  // ⚡ PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  // Only re-create when actual values change
  const contextValue = useMemo<AuthContextType>(() => ({
    user: user as User, // Type assertion to fix linter error
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}