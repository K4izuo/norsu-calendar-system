"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/core/api/api-client";
import { clearAuthCaches, cacheLoginIdentity, setSessionExpiresAt } from "@/core/auth/auth";
import { getDefaultPageForRole, getRolePathFromNumber } from "@/core/lib/role-utils";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: number;
  office?: {
    id: number;
    name: string;
    oversight_vp_id: number | null;
  };
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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ⚡ PERFORMANCE: Memoize actions to prevent re-renders
  const login = useCallback((userData: User) => {
    setUser(userData);
    cacheLoginIdentity({ user: { ...userData, id: Number(userData.id) }, role: userData.role });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthCaches();
    router.replace("/login");
  }, [router]);

  // SPA cookie auth: /me is the source of truth. We always ask the server who
  // the current user is — if there's no session cookie or it's expired, the
  // backend returns 401 and we leave `user` as null.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<{
          user: Omit<User, "role">;
          role: number;
          expires_at?: string;
        }>("/me");

        if (response.status === 401) {
          clearAuthCaches();
          setUser(null);
          return;
        }

        if (response.error || !response.data) {
          clearAuthCaches();
          setUser(null);
          return;
        }

        const userData: User = {
          ...response.data.user,
          role: response.data.role,
        };
        cacheLoginIdentity({ user: { ...userData, id: Number(userData.id) }, role: userData.role });
        if (response.data.expires_at) {
          setSessionExpiresAt(response.data.expires_at);
        }
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        clearAuthCaches();
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
      clearAuthCaches();
      // Optional: Redirect to login or home if needed, but the 401 source might handle it
      // router.replace('/auth/login');
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const authRoutes = [
        "/auth/login",
        "/auth/register",
        "/auth/dean/register",
        "/auth/staff/register",
      ];
      const protectedRoutes = [
        "/admin", "/dean", "/staff",
        "/student-director", "/campus-director",
        "/vpaa", "/vpsas", "/vpaf", "/vprde", "/head",
        "/multimedia", "/university-president",
      ];

      if (user && authRoutes.some((route) => pathname?.startsWith(route))) {
        const storedRole = Number(localStorage.getItem("user-role") || "3");
        const rolePath = getRolePathFromNumber(storedRole);
        const defaultPage = getDefaultPageForRole(storedRole);
        router.replace(`/${rolePath}/${defaultPage}`);
      } else if (!user && protectedRoutes.some((route) => pathname?.startsWith(route))) {
        router.replace("/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  // ⚡ PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  // Only re-create when actual values change
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: user as User, // Type assertion to fix linter error
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
