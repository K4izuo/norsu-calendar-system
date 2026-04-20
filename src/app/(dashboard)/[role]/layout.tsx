"use client";

import { useState, useEffect, useContext, useRef } from "react";
import {
  setupActivityTracking,
  startTokenRefresh,
  stopTokenRefresh,
} from "@/core/auth/token-refresh";
import { Search, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AuthContext } from "@/shared/components/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import UserProfile from "@/features/user-profile/components/user-profile";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import toast from "react-hot-toast";
import { getRoleLabelFromNumber } from "@/core/lib/role-utils";
import { Separator } from "@/shared/components/ui/separator";
import { usePathname } from "next/navigation";
import Loading from "@/app/(dashboard)/[role]/loading";
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

const pathRoleMap: Record<string, number> = { dean: 1, staff: 2, admin: 3 }

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const pathname = usePathname();

  const [showLoading, setShowLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const prevPathname = useRef<string | null>(null);

  const pathRole = pathRoleMap[pathname?.split("/")?.[1] ?? ""] ?? 3
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

  // Show loading on actual navigation, hide after fixed duration with fade
  useEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      setShowLoading(true);
      setFadeOut(false);
    }
    prevPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!showLoading) return;

    // Show spinner for 300ms, then fade out over 150ms
    const showTimer = setTimeout(() => setFadeOut(true), 150);
    const hideTimer = setTimeout(() => {
      setShowLoading(false);
      setFadeOut(false);
    }, 300);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [showLoading]);

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
          {showLoading && (
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

          {/* ✅ Content stays in normal flow - just fades when loading */}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
