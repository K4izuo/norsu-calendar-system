"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar,
  CalendarClock,
  ChevronRight,
  Menu,
  Search,
  Bell,
  User,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Add toggle state
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname?.includes("/asset-management")) {
      setActiveTab("asset-management");
    } else if (pathname?.includes("/calendar")) {
      setActiveTab("calendar");
    } else {
      setActiveTab("dashboard");
    }
  }, [pathname]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar with overflow-y-auto to handle its own scrolling if needed */}
      <div className="flex-none w-64 bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="flex-none h-[80px] py-2 px-4 items-center justify-center flex">
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
          <span className="h-[2px] w-full block bg-gradient-to-r from-gray-700 via-white to-gray-700 rounded-full opacity-70"></span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/pages/admin/dashboard" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "dashboard" 
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
                  href="/pages/admin/calendar" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "calendar" 
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
                  href="/pages/admin/asset-management" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "asset-management" 
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
      
      {/* Main content with its own overflow handling */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Enhanced navbar with sidebar toggle */}
        <div className="flex-none h-[80px] py-2 px-4 items-center bg-white shadow-sm w-full z-10 flex">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Sidebar toggle and page title */}
            <div className="flex items-center">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                variant="ghost"
                size="icon"
                className="relative cursor-pointer bg-white h-12 w-12 rounded-full hover:bg-gray-100 mr-4"
                aria-label="Toggle sidebar"
              >
                <Menu className="size-6 text-gray-600" />
              </Button>
              
              {/* <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === "dashboard" ? "Admin Dashboard" : 
                 activeTab === "calendar" ? "Events Calendar" : 
                 "Asset Management System"}
              </h2> */}
            </div>
            
            {/* Right side: Search, notifications, user */}
            <div className="flex items-center gap-3">
              {/* Search bar - increased width */}
              <div className="relative hidden md:block mr-3 w-80"> {/* Changed mr-1.5 to mr-3 for balance */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <Input
                  type="search" 
                  className="block h-10 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:ring-gray-500 focus:border-gray-500 text-sm"
                  placeholder="Search..."
                />
              </div>
              
              {/* Icon group with consistent styling */}
              <div className="flex items-center gap-3"> {/* Changed gap-2 to gap-3 for consistency */}
                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative cursor-pointer bg-white h-12 w-12 rounded-full hover:bg-gray-100"
                >
                  <Mail className="size-6 text-gray-600" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </Button>
                
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative cursor-pointer bg-white h-12 w-12 rounded-full hover:bg-gray-100"
                >
                  <Bell className="size-6 text-gray-600" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </Button>
              </div>
              
              {/* User profile - with balanced spacing */}
              <div className="flex items-center ml-4 mr-4"> {/* Changed ml-2 mr-3 to ml-4 mr-4 */}
                <button className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700">Administrator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}