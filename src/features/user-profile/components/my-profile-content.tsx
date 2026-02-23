import { BookUser } from "lucide-react";
import { User } from "@/shared/components/context/auth-context";

interface MyProfileContentProps {
  user: User | null;
  role: string;
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
  return (
    <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
      <div className="flex border-b pb-3 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <BookUser className="w-4 h-4" strokeWidth={2.5} />
          Personal Information
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            First Name
          </label>
          <div className="text-base font-medium text-gray-900 border-gray-100 pb-2">
            {isLoading ? (
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              user?.first_name || "—"
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            Last Name
          </label>
          <div className="text-base font-medium text-gray-900 border-gray-100 pb-2">
            {isLoading ? (
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              user?.last_name || "—"
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            Email Address
          </label>
          <div className="flex items-center gap-3 border-gray-100 pb-2">
            {isLoading ? (
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-base font-medium text-gray-900">
                  {user?.email || "—"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            Campus
          </label>
          <div className="text-base font-medium capitalize text-gray-900 border-gray-100 pb-2">
            {isCampusLoading ? (
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            ) : (
              campusName || "—"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
