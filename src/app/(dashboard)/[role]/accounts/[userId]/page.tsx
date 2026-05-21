"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams, useRouter } from "next/navigation";
import {
  UserCog,
  Building2,
  ShieldCheck,
  CalendarDays,
  ArrowLeft,
  User,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { useCampuses } from "@/features/calendar/services/academicDataService";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { ROLE_DISPLAY_NAMES } from "@/features/auth/types/auth.types";
import { getRoleLabelFromNumber } from "@/core/lib/role-utils";
import { AccountUser } from "./_components/types";
import { InfoRow, formatMemberSince, getFullName } from "./_components/info-row";
import { ProfileTab } from "./_components/profile-tab";
import { PasswordTab } from "./_components/password-tab";
import { getRouteParam } from "@/core/lib/route-params";

export default function AccountProfilePage() {
  const params = useParams();
  const router = useRouter();
  const role = getRouteParam(params, "role");
  const userId = Number(getRouteParam(params, "userId"));

  const {
    campuses,
    loading: campusesLoading,
    isFetching: campusesFetching,
  } = useCampuses();

  const {
    data: accountUser,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["accountUser", userId],
    queryFn: async () => {
      const response = await apiClient.get<AccountUser>(`users/${userId}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  usePageReady(isLoading || campusesLoading, isFetching || campusesFetching);

  const campusName = accountUser?.campus_id
    ? (campuses.find((c) => c.value === String(accountUser.campus_id))?.label ?? "—")
    : accountUser?.role === 0
      ? "All Campuses"
      : "—";

  const isCampusLoading = isLoading || campusesLoading;

  const roleLabel =
    accountUser?.role !== undefined
      ? (ROLE_DISPLAY_NAMES[accountUser.role as keyof typeof ROLE_DISPLAY_NAMES] ??
        getRoleLabelFromNumber(accountUser.role))
      : "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Accounts", href: `/${role}/accounts` },
          {
            label: isLoading
              ? "Loading…"
              : accountUser
                ? `${accountUser.first_name} ${accountUser.last_name}`
                : "Account Profile",
          },
        ]}
      />

      {/* Back button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 bg-white text-gray-500 hover:text-gray-800 w-fit -mt-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Accounts
      </Button>

      {/* Two-panel layout */}
      <div className="flex items-start gap-6">

        {/* ── Left Panel ── */}
        <div className="w-72 shrink-0 bg-white text-card-foreground border shadow-xs rounded-xl overflow-hidden">

          {/* Avatar section */}
          <div className="flex flex-col items-center p-6 border-b">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 ring-2 ring-blue-200 shadow-sm">
                <Image
                  src="/images/norsu.png"
                  alt="Account Avatar"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="text-base font-bold text-gray-900 text-center">
                  {accountUser ? getFullName(accountUser) : "—"}
                </h2>
                <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  <UserCog className="w-3 h-3" />
                  {roleLabel}
                </span>
              </>
            )}
          </div>

          {/* Info rows */}
          <div className="flex flex-col px-5 py-3">
            <InfoRow
              icon={Building2}
              label="Campus"
              value={campusName}
              loading={isCampusLoading}
            />
            <InfoRow
              icon={UserCog}
              label="Role"
              value={roleLabel}
              loading={isLoading}
            />
            <InfoRow
              icon={ShieldCheck}
              label="Account Status"
              value="Active"
              badge="active"
            />
            <InfoRow
              icon={CalendarDays}
              label="Member Since"
              value={formatMemberSince(accountUser?.created_at)}
              loading={isLoading}
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 bg-white text-card-foreground border shadow-xs rounded-xl overflow-hidden">
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : accountUser ? (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg h-10">
                  <TabsTrigger
                    value="profile"
                    className="flex cursor-pointer items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="flex cursor-pointer items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <ProfileTab
                    accountUser={accountUser}
                    role={role}
                    campusName={campusName}
                    isCampusLoading={isCampusLoading}
                    campuses={campuses}
                    userId={userId}
                  />
                </TabsContent>

                <TabsContent value="password">
                  <PasswordTab userId={userId} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Account not found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
