"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import {
  User,
  Lock,
  Trash2,
  Pencil,
  UserCog,
  Camera,
  Building2,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/shared/components/context/auth-context";
import { useCurrentUser } from "@/shared/components/hooks/useCurrentUser";
import { useCampuses } from "@/features/calendar/services/academicDataService";
import { MyProfileContent } from "@/features/user-profile/components/my-profile-content";
import { PasswordSecurityContent } from "@/features/user-profile/components/password-security-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { getRoleLabelFromNumber } from "@/core/lib/role-utils";
import { usePageReady } from "@/shared/components/context/page-loading-context";

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
  const role = params.role as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

          {/* Change Cover button */}
          <button className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors cursor-pointer">
            <Camera className="w-3.5 h-3.5" />
            Change Cover
          </button>
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
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5 text-white" />
                </button>
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

            {/* Delete account — pushed to bottom */}
            <div className="mt-auto border-t px-4 py-4">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 p-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg h-10">
                <TabsTrigger
                  value="profile"
                  className="flex cursor-pointer items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="flex cursor-pointer items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  Password & Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <MyProfileContent
                  user={user}
                  role={role}
                  isLoading={isLoading}
                  campusName={campusName}
                  isCampusLoading={isCampusLoading}
                  campuses={campuses}
                  campusId={currentUser?.campus_id}
                />
              </TabsContent>

              <TabsContent value="password">
                <PasswordSecurityContent />
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      {/* Delete Account confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and all associated data will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
