"use client";

import { useState, useEffect, useContext } from "react";
import {
  Search,
  Bell,
  CircleUserRound,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/auth-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserProfile from "@/components/ui/user-profile";
import toast from "react-hot-toast";
import { getRoleLabelFromNumber } from "@/lib/role-utils";
import { Separator } from "@/components/ui/separator"
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Loading from "./loading";

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface UserData {
  name: string;
  role: number;
}

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const pathname = usePathname();

  // ✅ Track both queries AND mutations
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  // ✅ CRITICAL FIX: Simplified loading state management
  const [showLoading, setShowLoading] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    name: "User",
    role: 4
  });

  useEffect(() => {
    try {
      if (user) {
        const roleValue = typeof user.role === 'string' ? parseInt(user.role, 10) : Number(user.role);

        setUserData({
          name:
            `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
            user.username ||
            "User",
          role: roleValue || 4,
        });
        return;
      }

      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("user-role");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const parsedRole = storedRole ? Number(storedRole) : 4;

        setUserData({
          name:
            `${parsedUser.first_name ?? ""} ${parsedUser.last_name ?? ""}`.trim() ||
            parsedUser.username ||
            "User",
          role: parsedRole || 4,
        });
        return;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error(
        "Error loading user data: " +
        (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }, [user]);

  // ✅ CRITICAL FIX: Show loading INSTANTLY on pathname change
  useEffect(() => {
    setShowLoading(true);
  }, [pathname]);

  // ✅ CRITICAL FIX: Hide loading only when ALL queries AND mutations are done
  useEffect(() => {
    const isLoading = isFetching > 0 || isMutating > 0;

    if (!isLoading && showLoading) {
      // ✅ Small delay to ensure React has finished mounting the new page
      // This prevents infinite loop on pages with no queries (Dashboard, Accounts)
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isFetching, isMutating, showLoading]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex shadow h-18 shrink-0 items-center justify-between gap-2 border-b bg-white px-4">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
              >
                <Mail className="size-6 text-gray-600" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
              >
                <Bell className="size-6 text-gray-600" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white focus:outline-none"
                >
                  <CircleUserRound className="size-7 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-70 sm:w-80 bg-background border-border rounded-lg shadow-lg"
              >
                <UserProfile
                  name={userData.name}
                  role={getRoleLabelFromNumber(userData.role)}
                  avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 bg-muted/50 flex flex-col gap-4 p-3 sm:p-6 overflow-y-auto overflow-x-hidden relative">
          {/* ✅ CRITICAL FIX: Loading overlay that COMPLETELY covers content when active */}
          {showLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'white',
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