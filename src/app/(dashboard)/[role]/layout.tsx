"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  setupActivityTracking,
  startTokenRefresh,
  stopTokenRefresh,
} from "@/core/auth/token-refresh";
import { Search, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/shared/components/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import UserProfile from "@/features/user-profile/components/user-profile";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import toast from "react-hot-toast";
import { getRoleLabelFromNumber, getRolePathFromNumber } from "@/core/lib/role-utils";
import { Separator } from "@/shared/components/ui/separator";
import { usePathname, useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/[role]/loading";
import { PageLoadingContext, consumeNavigationOverlay, scheduleNavigationOverlay } from "@/shared/components/context/page-loading-context";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { RESERVATIONS_STALE_TIME, QUEUE_STALE_TIME } from "@/features/calendar/services/reservation-service";
import { USERS_STALE_TIME } from "@/features/accounts/services/account-service";
import { PEOPLE_STALE_TIME } from "@/features/people/services/people-service";
import { ASSETS_STALE_TIME } from "@/features/assets/services/asset-service";
import { ACTIVITY_LOGS_STALE_TIME } from "@/features/activity-logs/services/activity-log-service";
import Image from "next/image";
import { AppSidebar } from "@/shared/components/layouts/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";

interface UserData {
  name: string;
  role: number;
}

const pathRoleMap: Record<string, number> = {
  dean: 1,
  staff: 2,
  admin: 3,
  'student-director': 4,
  'campus-director': 5,
  vpaa: 6,
  vpsas: 7,
  vpaf: 8,
  vprde: 9,
  head: 10,
  multimedia: 11,
  'university-president': 12,
}

const SEGMENT_QUERY_STALE: Record<string, {
  keys: (uid: string | number, role: number) => unknown[][]
  staleMs: (role: number) => number
}> = {
  dashboard:          { keys: (uid) => [['reservations', uid]],           staleMs: () => RESERVATIONS_STALE_TIME },
  calendar:           { keys: (uid) => [['reservations', uid]],           staleMs: () => RESERVATIONS_STALE_TIME },
  reservations:       {
    keys: (uid, role) => (role === 3 || role === 11) ? [['reservations', uid]] : [['reservation-queue', uid]],
    staleMs: (role) => (role === 3 || role === 11) ? RESERVATIONS_STALE_TIME : QUEUE_STALE_TIME,
  },
  accounts:           { keys: (uid) => [['users', uid]],                  staleMs: () => USERS_STALE_TIME },
  people:             { keys: (uid) => [['people', uid]],                 staleMs: () => PEOPLE_STALE_TIME },
  'asset-management': { keys: (uid) => [['assets', uid]],                 staleMs: () => ASSETS_STALE_TIME },
  'activity-logs':    { keys: (uid) => [['activity-logs', uid]],          staleMs: () => ACTIVITY_LOGS_STALE_TIME },
}

function hasCachedFreshData(
  queryClient: QueryClient,
  segment: string,
  userId: string | number | undefined,
  role: number,
): boolean {
  if (!userId) return false
  const config = SEGMENT_QUERY_STALE[segment]
  if (!config) return false
  const now = Date.now()
  const staleMs = config.staleMs(role)
  return config.keys(userId, role).every((key) => {
    const state = queryClient.getQueryState(key as readonly unknown[])
    if (!state || state.data === undefined) return false
    if (state.isInvalidated) return false
    return now - state.dataUpdatedAt < staleMs
  })
}

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const params = useParams();
  const roleSegment = (params.role as string) ?? "";
  const pathname = usePathname();
  const router = useRouter();

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isPageReady, setIsPageReady] = useState(true);
  const [minTimerDone, setMinTimerDone] = useState(true);
  const prevPathname = useRef<string | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  const setPageReady = useCallback(() => setIsPageReady(true), []);

  const pathRole = pathRoleMap[roleSegment] ?? 3
  const pathRoleRef = useRef(pathRole)
  pathRoleRef.current = pathRole

  const [userData, setUserData] = useState<UserData>({
    name: "User",
    role: pathRole,
  });

  useEffect(() => {
    try {
      if (user) {
        const roleValue =
          typeof user.role === "string"
            ? parseInt(user.role, 10)
            : Number(user.role);

        setUserData({
          name:
            `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
            user.username ||
            "User",
          role: roleValue || pathRoleRef.current,
        });
        return;
      }

      if (typeof window === "undefined") return;

      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("user-role");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const parsedRole = storedRole ? Number(storedRole) : 3;

        setUserData({
          name:
            `${parsedUser.first_name ?? ""} ${parsedUser.last_name ?? ""}`.trim() ||
            parsedUser.username ||
            "User",
          role: parsedRole || 3,
        });
        return;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error(
        "Error loading user data: " +
        (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }, [user]);

  // Role URL guard — redirect if user navigates to a different role's path,
  // or to a page their role is not allowed to access.
  // NOTE: must guard on `user` (not `userData.role`) so we never redirect based
  // on the stale localStorage value that gets applied before the API responds.
  useEffect(() => {
    if (isAuthLoading || !user) return;

    const actualRole = typeof user.role === "string"
      ? parseInt(user.role, 10) || pathRoleRef.current
      : Number(user.role) || pathRoleRef.current;

    const expectedRoleNumber = pathRoleMap[roleSegment];

    // Wrong role segment entirely (e.g. dean visiting /admin/...)
    if (expectedRoleNumber !== undefined && expectedRoleNumber !== actualRole) {
      const expectedPath = getRolePathFromNumber(actualRole);
      const targetPath = `/${expectedPath}/calendar`;
      if (!pathname.startsWith(targetPath)) {
        router.replace(targetPath);
      }
      return;
    }

    const universalPages = ['profile', 'settings', 'activity-logs'];
    const allowedPages: Record<number, string[]> = {
      3: ['dashboard', 'calendar', 'reservations', 'accounts', 'people', 'asset-management'],
      11: ['calendar', 'reservations'],
      12: ['dashboard', 'calendar', 'reservations', 'asset-management'],
    };
    const roleAllowed = allowedPages[actualRole] ?? ['calendar', 'reservations'];
    const pageSegment = pathname.split('/')[2];
    if (pageSegment && !universalPages.includes(pageSegment) && !roleAllowed.includes(pageSegment)) {
      const targetPath = `/${roleSegment}/calendar`;
      if (!pathname.startsWith(targetPath)) {
        router.replace(targetPath);
      }
    }
  }, [isAuthLoading, user, roleSegment, pathname, router]);

  // Show overlay on navigation; skip it when the destination page has fresh cached data.
  // consumeNavigationOverlay() forces the overlay after mutations even if data exists.
  useLayoutEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      const forceOverlay = consumeNavigationOverlay();
      const pageSegment = pathname.split('/')[2] ?? '';
      const currentUser = userRef.current;
      const userId = currentUser?.id;
      const role = typeof currentUser?.role === 'string'
        ? parseInt(currentUser.role, 10) || pathRoleRef.current
        : Number(currentUser?.role) || pathRoleRef.current;
      const fresh = !forceOverlay && hasCachedFreshData(queryClient, pageSegment, userId, role);
      if (fresh) {
        setOverlayVisible(false);
        setFadeOut(false);
        setIsPageReady(true);
        setMinTimerDone(true);
      } else {
        setOverlayVisible(true);
        setFadeOut(false);
        setIsPageReady(false);
        setMinTimerDone(false);
      }
    }
    prevPathname.current = pathname;
  }, [pathname, queryClient]);

  // 300ms floor for first-visit loads (no cached data) — ensures the spinner is
  // visible long enough to be seen before the overlay hides.
  useEffect(() => {
    if (!overlayVisible) return;
    const timer = setTimeout(() => setMinTimerDone(true), 300);
    return () => clearTimeout(timer);
  }, [overlayVisible]);

  // Hide overlay once BOTH the page data is ready AND the minimum time has passed.
  useEffect(() => {
    if (!isPageReady || !minTimerDone || !overlayVisible) return;
    setFadeOut(true);
    const hide = setTimeout(() => {
      setOverlayVisible(false);
      setFadeOut(false);
    }, 150);
    return () => clearTimeout(hide);
  }, [isPageReady, minTimerDone, overlayVisible]);

  // Setup token refresh and activity tracking
  useEffect(() => {
    const cleanupActivityTracking = setupActivityTracking();
    startTokenRefresh();

    return () => {
      cleanupActivityTracking();
      stopTokenRefresh();
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const pageSegment = pathname.split('/')[2] ?? '';
      if (!SEGMENT_QUERY_STALE[pageSegment]) return;
      const currentUser = userRef.current;
      const userId = currentUser?.id;
      const role = typeof currentUser?.role === 'string'
        ? parseInt(currentUser.role, 10) || pathRoleRef.current
        : Number(currentUser?.role) || pathRoleRef.current;
      const fresh = hasCachedFreshData(queryClient, pageSegment, userId, role);
      if (!fresh) {
        scheduleNavigationOverlay();
        setOverlayVisible(true);
        setFadeOut(false);
        setIsPageReady(false);
        setMinTimerDone(false);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient, pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex shadow-xs h-18 shrink-0 items-center justify-between gap-2 border-b bg-white px-4">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />

            <div className="flex items-center ml-2">
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <Input
                  type="search"
                  id="search"
                  className="block h-10 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
              >
                <Mail className="size-6 text-gray-600" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              </Button>

              <NotificationBell />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative shrink-0">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Name"
                    width={30}
                    height={30}
                    className="rounded-full cursor-pointer ring-4 ring-white dark:ring-zinc-900 object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-70 sm:w-80 bg-background border-border rounded-lg shadow-lg"
              >
                <UserProfile
                  name={userData.name}
                  role={getRoleLabelFromNumber(userData.role)}
                // avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 min-h-0 bg-muted/50 flex flex-col gap-4 p-3 lg:p-6 overflow-y-auto overflow-x-hidden relative">
          {overlayVisible && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "white",
                opacity: fadeOut ? 0 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              <Loading />
            </div>
          )}

          <PageLoadingContext.Provider value={{ setPageReady }}>
            {children}
          </PageLoadingContext.Provider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
