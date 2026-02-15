"use client";


import { CalendarClock } from "lucide-react";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Loading({ className = "" }: { className?: string }) {
  const params = useParams();
  
  // Ensure role is a valid UserRole type
  const role = useMemo(() => {
    const paramRole = params?.role as string;
    const validRoles: UserRole[] = ["dean", "staff", "admin", "public"];
    return (validRoles.includes(paramRole as UserRole) ? paramRole : "public") as UserRole;
  }, [params?.role]);
  
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 bg-white ${className}`}
    >
      <div className="relative h-16 w-16 flex items-center justify-center">
        {/* Hardware accelerated CSS spinner - using custom class to GUARANTEE rotation */}
        <div
          className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 animate-spin-loading ${roleColors.spinner}`}
          style={{
            willChange: "transform",
            transform: "translateZ(0)", // Force GPU acceleration
          }}
        />
        <CalendarClock
          className={`absolute inset-0 m-auto h-7 w-7 ${roleColors.icon}`}
        />
      </div>
    </div>
  );
}