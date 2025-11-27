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
  User,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/auth-context";
import { UserProfileModal } from "@/components/modal/user-profile-modal";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const pathname = usePathname();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
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
      <div className="flex-none w-64 bg-blue-900 text-white flex flex-col overflow-y-auto">
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
                Faculty
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-none px-4 pb-0 pt-0">
          <span className="h-[2px] w-full block bg-linear-to-r from-blue-700 via-white to-blue-700 rounded-full opacity-70"></span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/page/faculty/dashboard" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "dashboard" 
                      ? "bg-white text-blue-900" 
                      : "text-white hover:bg-blue-800"
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
                  href="/page/faculty/calendar" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "calendar" 
                      ? "bg-white text-blue-900" 
                      : "text-white hover:bg-blue-800"
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
                  href="/page/faculty/asset-management" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "asset-management" 
                      ? "bg-white text-blue-900" 
                      : "text-white hover:bg-blue-800"
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
        <div className="flex-none h-[80px] py-2 px-4 items-center bg-white shadow-sm w-full z-10 flex">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Search input */}
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
            
            {/* Right side: Notifications, user */}
            <div className="flex items-center gap-3">
              {/* Icon group with consistent styling */}
              <div className="flex items-center gap-3">
                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
                >
                  <Mail className="size-6 text-gray-600" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </Button>
                
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative cursor-pointer bg-white h-12 w-12 rounded-full border border-transparent hover:border-gray-300 hover:bg-white"
                >
                  <Bell className="size-6 text-gray-600" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </Button>
              </div>
              
              {/* User profile - with balanced spacing */}
              <div className="flex items-center ml-3 mr-4">
                <button 
                  className="flex items-center space-x-2"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700">{user?.first_name} {user?.last_name || ""}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6.5 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="User Profile"
      >
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-50 shadow-sm rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              Profile Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-800 font-medium">{user?.first_name} {user?.last_name || ""}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-gray-800">{user?.username || "N/A"}</p>
              </div>
              {user?.role && (
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-800 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-50 shadow-sm rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              Account Settings
            </h3>
            <p className="text-gray-600">
              Additional account settings and preferences can be configured here.
            </p>
          </div>
        </div>
      </UserProfileModal>
    </div>
  );
}