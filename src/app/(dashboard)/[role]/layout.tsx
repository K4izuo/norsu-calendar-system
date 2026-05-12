"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  setupActivityTracking,
  startTokenRefresh,
  stopTokenRefresh,
} from "@/core/auth/token-refresh";
import { Search } from "lucide-react";
// import { Mail } from "lucide-react";
// import { Button } from "@/shared/components/ui/button";
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
import { getDefaultPageForRole, getRoleLabelFromNumber, getRolePathFromNumber } from "@/core/lib/role-utils";
import { Separator } from "@/shared/components/ui/separator";
import { usePathname, useParams } from "next/navigation";
import Loading from "@/app/(dashboard)/[role]/loading";
import { PageLoadingContext } from "@/shared/components/context/page-loading-context";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { RESERVATIONS_STALE_TIME, QUEUE_STALE_TIME } from "@/features/calendar/services/reservation-service";
import { DASHBOARD_STATS_STALE_TIME } from "@/features/dashboard/services/dashboard-service";
import { USERS_STALE_TIME } from "@/features/accounts/services/account-service";
import { PEOPLE_STALE_TIME } from "@/features/people/services/people-service";
import { ASSETS_STALE_TIME } from "@/features/assets/services/asset-service";
import { ACTIVITY_LOGS_STALE_TIME } from "@/features/activity-logs/services/activity-log-service";
import { isReviewRole } from "@/features/reservations/utils/reservation-review";
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
  dashboard: {
    keys: (uid) => [['reservations', uid], ['dashboard-stats', uid]],
    staleMs: () => Math.min(RESERVATIONS_STALE_TIME, DASHBOARD_STATS_STALE_TIME),
  },
  calendar: { keys: (uid) => [['reservations', uid]], staleMs: () => RESERVATIONS_STALE_TIME },
  reservations: {
    keys: (uid, role) => {
      if (role === 3 || role === 11) return [['reservations', uid]];
      if (isReviewRole(role)) return [['reservation-queue', uid], ['reservations', uid]];
      return [['reservation-queue', uid]];
    },
    staleMs: (role) => {
      if (role === 3 || role === 11) return RESERVATIONS_STALE_TIME;
      if (isReviewRole(role)) return Math.min(QUEUE_STALE_TIME, RESERVATIONS_STALE_TIME);
      return QUEUE_STALE_TIME;
    },
  },
  'reservation-tracking': {
    keys: (uid) => [['reservations', uid]],
    staleMs: () => RESERVATIONS_STALE_TIME,
  },
  accounts: { keys: (uid) => [['users', uid]], staleMs: () => USERS_STALE_TIME },
  people: { keys: (uid) => [['people', uid]], staleMs: () => PEOPLE_STALE_TIME },
  'asset-management': { keys: (uid) => [['assets', uid]], staleMs: () => ASSETS_STALE_TIME },
  'activity-logs': { keys: (uid) => [['activity-logs', uid]], staleMs: () => ACTIVITY_LOGS_STALE_TIME },
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
  const [readySignal, setReadySignal] = useState(0);
  const prevPathname = useRef<string | null>(null);
  const forceNextNavigationOverlay = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  const setPageReady = useCallback(() => setIsPageReady(true), []);
  const showOverlay = useCallback(() => {
    setOverlayVisible(true);
    setFadeOut(false);
    setIsPageReady(false);
    setMinTimerDone(false);
    setReadySignal((signal) => signal + 1);
  }, []);

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
      const defaultPage = getDefaultPageForRole(actualRole);
      const targetPath = `/${expectedPath}/${defaultPage}`;
      if (!pathname.startsWith(targetPath)) {
        router.replace(targetPath);
      }
      return;
    }

    const universalPages = ['profile', 'settings', 'activity-logs'];
    const allowedPages: Record<number, string[]> = {
      3:  ['dashboard', 'calendar', 'reservations', 'reservation-tracking', 'accounts', 'people', 'asset-management'],
      5:  ['dashboard', 'calendar', 'reservations', 'reservation-tracking'],
      11: ['calendar', 'reservations'],
      12: ['dashboard', 'calendar', 'reservations', 'reservation-tracking', 'asset-management'],
    };
    const roleAllowed = allowedPages[actualRole] ?? ['calendar', 'reservations', 'reservation-tracking'];
    const pageSegment = pathname.split('/')[2];
    if (pageSegment && !universalPages.includes(pageSegment) && !roleAllowed.includes(pageSegment)) {
      const defaultPage = getDefaultPageForRole(actualRole);
      const targetPath = `/${roleSegment}/${defaultPage}`;
      if (!pathname.startsWith(targetPath)) {
        router.replace(targetPath);
      }
    }
  }, [isAuthLoading, user, roleSegment, pathname, router]);

  // Show overlay on navigation; skip it when the destination page has fresh cached data.
  useLayoutEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      const forceOverlay = forceNextNavigationOverlay.current;
      forceNextNavigationOverlay.current = false;
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
        showOverlay();
      }
    }
    prevPathname.current = pathname;
  }, [pathname, queryClient, showOverlay]);

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
        forceNextNavigationOverlay.current = true;
        showOverlay();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient, pathname, showOverlay]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-white px-2 shadow-xs sm:h-18 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-0 sm:gap-1">
            <SidebarTrigger className="-ml-1 size-9 shrink-0" />
            <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0 sm:mx-1" />

            <div className="flex min-w-0 flex-1 items-center sm:ml-1">
              <div className="relative w-full max-w-[13rem] sm:max-w-64 lg:max-w-80">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3">
                  <Search className="size-4 text-gray-400 sm:size-[18px]" />
                </div>
                <Input
                  type="search"
                  id="search"
                  className="block h-9 w-full rounded-lg border border-gray-300 bg-gray-50 py-1.5 pl-9 pr-3 text-sm focus:border-gray-500 focus:ring-gray-500 sm:h-10 sm:pl-10"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              {/*
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 cursor-pointer rounded-full border border-transparent bg-white hover:border-gray-300 hover:bg-white sm:h-12 sm:w-12"
              >
                <Mail className="size-5 text-gray-600 sm:size-6" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-500 sm:right-2.5 sm:top-2.5 sm:h-2.5 sm:w-2.5"></span>
              </Button>
              */}

              <NotificationBell />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative shrink-0">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Name"
                    width={32}
                    height={32}
                    className="size-8 cursor-pointer rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 sm:ring-4"
                  />
                  <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 sm:h-2.5 sm:w-2.5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[calc(100vw-1rem)] max-w-80 rounded-lg border-border bg-background shadow-lg sm:w-80"
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

        <div className="flex-1 bg-muted/50 flex flex-col gap-4 p-3 lg:p-6 overflow-y-auto overflow-x-hidden relative">
          <PageLoadingContext.Provider value={{ readySignal, setPageReady }}>
            {children}
          </PageLoadingContext.Provider>

          {overlayVisible && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                backgroundColor: "white",
                opacity: fadeOut ? 0 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              <Loading />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
