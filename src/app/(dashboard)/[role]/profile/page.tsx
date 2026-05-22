"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import {
  UserCog,
  Building2,
  ShieldCheck,
  CalendarDays,
  Map,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/shared/components/context/auth-context";
import { useCurrentUser } from "@/shared/components/hooks/useCurrentUser";
import { useCampuses } from "@/features/calendar/services/academicDataService";
import { MyProfileContent } from "@/features/user-profile/components/my-profile-content";
import { getRoleLabelFromNumber } from "@/core/lib/role-utils";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { getRouteParam } from "@/core/lib/route-params";
import { useReservationMapSetting } from "@/shared/components/hooks/useReservationMapSetting";

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function InfoRow({
  icon: Icon,
  label,
  value,
  loading,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  loading?: boolean;
  badge?: "active";
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {loading ? (
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-0.5" />
        ) : badge === "active" ? (
          <span className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-sm font-semibold text-gray-800">{value}</span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const role = getRouteParam(params, "role");

  const { user, isLoading } = useAuth();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const { campuses, loading: campusesLoading } = useCampuses();

  usePageReady(isLoading || userLoading || campusesLoading);

  const campusName = currentUser?.campus_id
    ? (campuses.find((c) => c.value === String(currentUser.campus_id))?.label ?? "—")
    : role === "admin"
      ? "All Campuses"
      : "—";

  const isCampusLoading = userLoading || campusesLoading;

  const isAdmin = currentUser?.role === 3;
  const { mapEnabled, toggle } = useReservationMapSetting();

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Profile" },
        ]}
      />

      {/* Main Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">

        {/* ── Cover Banner ── */}
        <div className="relative h-40 bg-linear-to-r from-blue-700 via-blue-500 to-indigo-500 overflow-hidden">
          {/* Geometric SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

        </div>

        {/* ── Two-column body ── */}
        <div className="flex items-start">

          {/* ── Left Panel ── */}
          <div className="w-75 shrink-0 flex flex-col border-r min-h-145">

            {/* Avatar + name + role */}
            <div className="flex flex-col items-center px-6 pb-4">
              <div className="-mt-12 relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-blue-100 ring-2 ring-blue-200">
                  <Image
                    src="/images/norsu.png"
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center gap-2 mt-3">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-base font-bold text-gray-900 text-center">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    <UserCog className="w-3 h-3" />
                    {getRoleLabelFromNumber(currentUser?.role ?? 0) || role}
                  </span>
                </>
              )}
            </div>

            {/* Info rows */}
            <div className="flex flex-col px-5 py-2 border-t">
              <InfoRow
                icon={Building2}
                label="Campus"
                value={campusName}
                loading={isCampusLoading}
              />
              <InfoRow
                icon={UserCog}
                label="Role"
                value={getRoleLabelFromNumber(currentUser?.role ?? 0)}
                loading={userLoading}
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
                value={formatMemberSince(currentUser?.created_at)}
                loading={userLoading}
              />
            </div>

            {/* Admin-only: System Settings */}
            {isAdmin && (
              <div className="flex flex-col px-5 py-3 border-t">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  System Settings
                </p>
                <div className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Map className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-800 leading-snug">
                        Reservation Map
                      </span>
                      <span className="text-[11px] text-gray-400 leading-snug">
                        {mapEnabled ? "Showing map + timeline" : "Timeline only"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={mapEnabled}
                    onClick={() => toggle(!mapEnabled)}
                    className={`relative shrink-0 inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      mapEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        mapEnabled ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 p-8">
            <MyProfileContent
              user={user}
              isLoading={isLoading}
              campusName={campusName}
              isCampusLoading={isCampusLoading}
            />
          </div>

        </div>
      </div>

    </div>
  );
}
