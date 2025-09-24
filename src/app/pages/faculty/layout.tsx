"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar,
  CalendarClock,
  ChevronRight
} from "lucide-react";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname?.includes("/asset-management")) {
      setActiveTab("asset-management");
    } else if (pathname?.includes("/events")) {
      setActiveTab("events");
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
                Faculty/Staff
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-none px-4 pb-0 pt-0">
          <span className="h-[2px] w-full block bg-gradient-to-r from-blue-700 via-white to-blue-700 rounded-full opacity-70"></span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/pages/faculty/dashboard" 
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
                  href="/pages/faculty/events" 
                  className={`flex items-center px-3 py-3 rounded-md transition-all ${
                    activeTab === "events" 
                      ? "bg-white text-blue-900" 
                      : "text-white hover:bg-blue-800"
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  <span className="font-medium">Events</span>
                  {activeTab === "events" && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </Link>
              </li>
              
              <li>
                <Link 
                  href="/pages/faculty/asset-management" 
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
          {/* Empty navbar */}
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}