"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import {
  User,
  Lock,
  // Users,
  // UserPlus,
  // Bell,
  // CreditCard,
  // Download,
  Trash2,
  // MapPin,
  Pencil,
  UserPen,
  UserCog,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/shared/components/context/auth-context";
import { useCurrentUser } from "@/shared/components/hooks/useCurrentUser";
import { useCampuses } from "@/features/calendar/services/academicDataService";
import { MyProfileContent } from "@/features/user-profile/components/my-profile-content";
import { PasswordSecurityContent } from "@/features/user-profile/components/password-security-content";

export default function ProfilePage() {
  const params = useParams();
  const role = params.role as string;
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { user, isLoading } = useAuth();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const { campuses, loading: campusesLoading } = useCampuses();

  const campusName = currentUser?.campus_id
    ? (campuses.find((c) => c.value === String(currentUser.campus_id))?.label ??
      "—")
    : role === "admin"
      ? "All Campuses"
      : "—";

  const isCampusLoading = userLoading || campusesLoading;

  const sidebarItems: {
    id: "profile" | "password";
    label: string;
    icon: LucideIcon;
  }[] = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "password", label: "Password & Security", icon: Lock },
    // { id: "teams", label: "Teams", icon: Users },

    // { label: "Team Member", icon: UserPlus },
    // { label: "Notifications", icon: Bell },
    // { label: "Billing", icon: CreditCard },
    // { label: "Data Export", icon: Download },
  ];

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Profile" },
        ]}
      />

      <div className="flex w-full min-h-[800px] items-start self-stretch bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-10">
        {/* profile sidebar */}
        <div className="flex w-[280px] py-6 flex-col items-start self-stretch border-r">
          <div className="flex flex-col items-start gap-1 self-stretch px-2">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex cursor-pointer w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 focus:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors group">
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-medium">Delete Account</span>
            </button>
          </div>
        </div>

        {/* profile content */}
        <div className="flex p-8 flex-col items-start gap-8 flex-1 self-stretch custom-scrollbar overflow-y-auto">
          {/* Header Section */}
          <div className="flex justify-between items-start self-stretch">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                  {/* Avatar Placeholder */}
                  <Image
                    src="/images/norsu.png" // Using existing logo as fallback/placeholder
                    alt="User Profile"
                    width={96}
                    height={96}
                    className="object-cover opacity-80"
                  />
                </div>
                <button className="absolute cursor-pointer bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm hover:bg-blue-700 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-gray-500 flex items-center gap-1 text-sm font-medium capitalize">
                      <UserCog className="w-4 h-4" />
                      {role}
                    </p>
                  </>
                )}
                {/* <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Leeds, United Kingdom</span>
                </div> */}
              </div>
            </div>
            <Button
              variant="outline"
              className="flex cursor-pointer items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg px-4"
            >
              <UserPen className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          {activeTab === "profile" ? (
            <MyProfileContent
              user={user}
              role={role}
              isLoading={isLoading}
              campusName={campusName}
              isCampusLoading={isCampusLoading}
            />
          ) : (
            <PasswordSecurityContent />
          )}

          {/* Address */}
          {/* <div className="flex flex-col items-start gap-8 self-stretch">
            <div className="flex justify-between items-center self-stretch">
              <h3 className="text-lg font-bold text-gray-900">Address</h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline">
                Edit Address
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
              <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Country
                </label>
                <div className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  United Kingdom
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  City/State
                </label>
                <div className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Leeds, East London
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Postal Code
                </label>
                <div className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  ERT 2354
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-0">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Tax ID
                </label>
                <div className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  AS4645756
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
