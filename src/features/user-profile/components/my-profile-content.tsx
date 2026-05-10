"use client";

import { BookUser } from "lucide-react";
import type { User } from "@/shared/components/context/auth-context";

interface MyProfileContentProps {
  user: User | null;
  isLoading: boolean;
  campusName: string | null;
  isCampusLoading: boolean;
}

export function MyProfileContent({
  user,
  isLoading,
  campusName,
  isCampusLoading,
}: MyProfileContentProps) {
  if (isLoading) {
    return (
      <div className="flex border rounded-lg flex-col items-start self-stretch">
        <div className="flex border-b p-6 justify-between items-center self-stretch">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-6 w-full">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex border rounded-lg flex-col items-start self-stretch">
      <div className="flex border-b p-6 items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <BookUser className="w-4 h-4" strokeWidth={2.5} />
          Personal Information
        </h3>
      </div>

      <div className="p-6 w-full">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm text-gray-400 font-normal inline-block leading-none">
              First Name
            </label>
            <div className="text-base font-medium text-gray-900">
              {user?.first_name || "-"}
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm text-gray-400 font-normal inline-block leading-none">
              Last Name
            </label>
            <div className="text-base font-medium text-gray-900">
              {user?.last_name || "-"}
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm text-gray-400 font-normal inline-block leading-none">
              Email Address
            </label>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-900">
                {user?.email || "-"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                Verified
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-sm text-gray-400 font-normal inline-block leading-none">
              Campus
            </label>
            <div className="text-base font-medium capitalize text-gray-900">
              {isCampusLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                campusName || "-"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
