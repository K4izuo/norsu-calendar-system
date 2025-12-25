"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  ChevronRight,
  Search,
  Bell,
  CircleUserRound,
  Mail,
  Users,
  University
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/auth-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import UserProfile from "@/components/ui/user-profile";
import toast from "react-hot-toast"

interface UserData {
  name: string;
  role: number;
}

const ROLE_MAP: Record<number, string> = {
  2: "Faculty",
  3: "Staff",
  4: "Admin"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const pathname = usePathname();
  const auth = useContext(AuthContext);
  const user = auth?.user;
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

      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const parsedRole = storedRole ? Number(JSON.parse(storedRole)) : 4;

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

  useEffect(() => {
    if (pathname?.includes("/asset-management")) {
      setActiveTab("asset-management");
    } else if (pathname?.includes("/calendar")) {
      setActiveTab("calendar");
    } else if (pathname?.includes("/reservations")) {
      setActiveTab("reservations");
    } else if (pathname?.includes("/accounts")) {
      setActiveTab("accounts");
    } else {
      setActiveTab("dashboard");
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f7]">
      <div className="flex-none w-64 bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="flex-none h-20 py-2 px-4 items-center justify-center flex">
          <div className="flex items-center justify-center w-full">
            <Image
              src="/images/norsu.png"
              alt="Negros Oriental State University Logo"
              width={150}
              height={150}
              priority
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col ml-3">
              <h1 className="font-semibold text-base text-white truncate">
                Admin
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-none px-4 pb-0 pt-0">
          <span className="h-0.5 w-full block bg-linear-to-r from-gray-700 via-white to-gray-700 rounded-full opacity-70"></span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/page/admin/dashboard"
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${activeTab === "dashboard"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-gray-800"
                    }`}
                >
                  <LayoutDashboard size={20} className="mr-3" />
                  <span className="font-medium">Dashboard</span>
                  {activeTab === "dashboard" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/page/admin/calendar"
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${activeTab === "calendar"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-gray-800"
                    }`}
                >
                  <Calendar size={20} className="mr-3" />
                  <span className="font-medium">Calendar</span>
                  {activeTab === "calendar" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/page/admin/reservations"
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${activeTab === "reservations"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-gray-800"
                    }`}
                >
                  <University size={20} className="mr-3" />
                  <span className="font-medium">Reservations</span>
                  {activeTab === "reservations" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/page/admin/accounts"
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${activeTab === "accounts"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-gray-800"
                    }`}
                >
                  <Users size={20} className="mr-3" />
                  <span className="font-medium">Accounts</span>
                  {activeTab === "accounts" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/page/admin/asset-management"
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${activeTab === "asset-management"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-gray-800"
                    }`}
                >
                  <CalendarClock size={20} className="mr-3" />
                  <span className="font-medium">Asset Management</span>
                  {activeTab === "asset-management" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-none h-20 py-2 px-4 items-center bg-white shadow-sm w-full z-10 flex">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center ml-2">
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <Input
                  type="search"
                  id="search"
                  className="block h-11 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 text-sm"
                  placeholder="Search..."
                />
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
                  className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
                >
                  <UserProfile
                    name={userData.name}
                    role={ROLE_MAP[userData.role] || "User"}
                    avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}