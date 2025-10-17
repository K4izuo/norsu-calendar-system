"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'student' | 'faculty' | 'staff' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for stored user on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      // Define public and protected routes
      const authRoutes = ['/auth/login', '/auth/register', '/auth/student/register', '/auth/faculty/register', '/auth/staff/register'];
      const protectedRoutes = ['/dashboard', '/calendar', '/profile']; // Add your protected routes
      
      if (user && authRoutes.some(route => pathname?.startsWith(route))) {
        // Redirect authenticated users away from auth pages
        router.replace('/dashboard');
      } else if (!user && protectedRoutes.some(route => pathname?.startsWith(route))) {
        // Redirect unauthenticated users away from protected pages
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    router.replace('/dashboard');
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
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