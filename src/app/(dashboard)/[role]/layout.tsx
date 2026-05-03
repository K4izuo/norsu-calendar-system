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
import { PageLoadingContext } from "@/shared/components/context/page-loading-context";
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


export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const roleSegment = (params.role as string) ?? "";
  const pathname = usePathname();
  const router = useRouter();

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isPageReady, setIsPageReady] = useState(true);
  const [minTimerDone, setMinTimerDone] = useState(true);
  const prevPathname = useRef<string | null>(null);
  const hasCachedDataRef = useRef(false);

  const setPageReady = useCallback(() => setIsPageReady(true), []);
  const reportHasData = useCallback(() => { hasCachedDataRef.current = true; }, []);

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

    const allowedPages: Record<number, string[]> = {
      3:  ['dashboard', 'calendar', 'reservations', 'accounts', 'people', 'asset-management'],
      11: ['calendar', 'reservations'],
      12: ['dashboard', 'calendar', 'reservations', 'asset-management'],
    };
    const roleAllowed = allowedPages[actualRole] ?? ['calendar', 'reservations'];
    const pageSegment = pathname.split('/')[2];
    if (pageSegment && !roleAllowed.includes(pageSegment)) {
      const targetPath = `/${roleSegment}/calendar`;
      if (!pathname.startsWith(targetPath)) {
        router.replace(targetPath);
      }
    }
  }, [isAuthLoading, user, roleSegment, pathname, router]);

  // Show overlay on navigation — but only when the page has no cached data.
  // Pages call reportHasData() in their useLayoutEffect, which React fires before
  // this parent useLayoutEffect, so hasCachedDataRef is already set when we read it.
  // Cached pages: overlay is skipped entirely → instant navigation.
  // Uncached pages: overlay shows until data arrives.
  useLayoutEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      if (hasCachedDataRef.current) {
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
      hasCachedDataRef.current = false;
    }
    prevPathname.current = pathname;
  }, [pathname]);

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
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

        <div className="flex-1 bg-muted/50 flex flex-col gap-4 p-3 lg:p-6 overflow-y-auto overflow-x-hidden relative">
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

          <PageLoadingContext.Provider value={{ setPageReady, reportHasData }}>
            {children}
          </PageLoadingContext.Provider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
