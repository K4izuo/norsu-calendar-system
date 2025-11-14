"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { getAuthToken, removeAuthToken } from '@/lib/auth';

type Role = 'faculty' | 'staff';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user data from backend if token exists
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          setIsLoading(false);
          return;
        }

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

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const authRoutes = ['/auth/login', '/auth/register', '/auth/student/register', '/auth/faculty/register', '/auth/staff/register'];
      const protectedRoutes = ['/pages/faculty', '/pages/staff', '/pages/admin', '/dashboard', '/calendar', '/profile'];
      
      if (user && authRoutes.some(route => pathname?.startsWith(route))) {
        router.replace('/pages/admin/dashboard');
      } else if (!user && protectedRoutes.some(route => pathname?.startsWith(route))) {
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    removeAuthToken();
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user: user as User, // Type assertion to fix linter error
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
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