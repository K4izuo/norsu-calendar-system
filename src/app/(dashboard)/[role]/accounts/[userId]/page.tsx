"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Lock,
  Pencil,
  UserCog,
  Camera,
  Building2,
  ShieldCheck,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { apiClient } from "@/core/api/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCampuses } from "@/features/calendar/services/academicDataService";
import { authService } from "@/features/auth/services/auth-service";
import { AccountUpdateFormData } from "@/features/auth/types/auth.types";
import { getRoleLabelFromNumber } from "@/core/lib/role-utils";
import { ROLE_DISPLAY_NAMES } from "@/features/auth/types/auth.types";

// ── Types ──────────────────────────────────────────────────────────────────

interface AccountUser {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  role: number;
  campus_id?: string;
  created_at?: string;
}

interface AdminPasswordFormData {
  new_password: string;
  confirm_password: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function getFullName(user: AccountUser): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
  return parts.join(" ") || "—";
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

// ── Profile form ───────────────────────────────────────────────────────────

function ProfileTab({
  accountUser,
  role,
  campusName,
  isCampusLoading,
  campuses,
  userId,
}: {
  accountUser: AccountUser;
  role: string;
  campusName: string;
  isCampusLoading: boolean;
  campuses: { value: string; label: string }[];
  userId: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AccountUpdateFormData>({
    defaultValues: {
      first_name: accountUser.first_name ?? "",
      last_name: accountUser.last_name ?? "",
      email: accountUser.email ?? "",
      campus_id: accountUser.campus_id ?? "",
    },
  });

  useEffect(() => {
    reset({
      first_name: accountUser.first_name ?? "",
      last_name: accountUser.last_name ?? "",
      email: accountUser.email ?? "",
      campus_id: accountUser.campus_id ?? "",
    });
  }, [accountUser, reset]);

  const onSubmit = async (data: AccountUpdateFormData) => {
    setIsSaving(true);
    try {
      const response = await authService.updateAccount(userId, data);
      if (response.error) {
        toast.error(response.error, { position: "top-center" });
        return;
      }
      toast.success("Profile updated successfully!", { position: "top-center" });
      queryClient.invalidateQueries({ queryKey: ["accountUser", userId] });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile.", { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
      <div className="flex border-b pb-3 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <User className="w-4 h-4" strokeWidth={2.5} />
          Personal Information
        </h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name" className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                First Name
              </Label>
              <Input
                id="first_name"
                {...register("first_name", { required: "First name is required" })}
                className={errors.first_name ? "border-red-400" : ""}
              />
              {errors.first_name && (
                <p className="text-xs text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name" className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                Last Name
              </Label>
              <Input
                id="last_name"
                {...register("last_name", { required: "Last name is required" })}
                className={errors.last_name ? "border-red-400" : ""}
              />
              {errors.last_name && (
                <p className="text-xs text-red-500">{errors.last_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                Campus
              </Label>
              {role === "admin" && accountUser.role !== 0 ? (
                <Controller
                  name="campus_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Input
                  value={isCampusLoading ? "Loading…" : (campusName || "All Campuses")}
                  disabled
                  className="bg-gray-50 text-gray-400"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isSaving ? "Saving…" : "Update Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setIsEditing(false); }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">First Name</label>
            <div className="text-base font-medium text-gray-900">{accountUser.first_name || "—"}</div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Last Name</label>
            <div className="text-base font-medium text-gray-900">{accountUser.last_name || "—"}</div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Email Address</label>
            <div className="text-base font-medium text-gray-900">{accountUser.email || "—"}</div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Campus</label>
            <div className="text-base font-medium text-gray-900">
              {isCampusLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                campusName || "—"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password reset tab ─────────────────────────────────────────────────────

function PasswordTab({ userId }: { userId: number }) {
  const [isSaving, setIsSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminPasswordFormData>();

  const newPassword = watch("new_password", "");

  const onSubmit = async (data: AdminPasswordFormData) => {
    setIsSaving(true);
    try {
      const response = await apiClient.put<{ message: string }, { password: string }>(
        `users/${userId}`,
        { password: data.new_password }
      );
      if (response.error) {
        toast.error(response.error, { position: "top-center" });
        return;
      }
      toast.success("Password updated successfully!", { position: "top-center" });
      reset();
    } catch {
      toast.error("Failed to update password.", { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
      <div className="flex border-b pb-3 items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <Lock className="w-4 h-4" strokeWidth={2.5} />
          Reset Password
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_password" className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showNew ? "text" : "password"}
              {...register("new_password", {
                required: "New password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
              className={errors.new_password ? "border-red-400 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-xs text-red-500">{errors.new_password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm_password" className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              {...register("confirm_password", {
                required: "Please confirm the password",
                validate: (v) => v === newPassword || "Passwords do not match",
              })}
              className={errors.confirm_password ? "border-red-400 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-6"
        >
          {isSaving ? "Saving…" : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AccountProfilePage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as string;
  const userId = Number(params.userId);

  const { campuses, loading: campusesLoading } = useCampuses();

  const { data: accountUser, isLoading } = useQuery({
    queryKey: ["accountUser", userId],
    queryFn: async () => {
      const response = await apiClient.get<AccountUser>(`users/${userId}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

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
    <div className="flex flex-col gap-6 pb-10">
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

      {/* Main Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">

        {/* ── Cover Banner ── */}
        <div className="relative h-40 bg-linear-to-r from-blue-700 via-blue-500 to-indigo-500 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="ap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <pattern id="ap-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ap-grid)" />
            <rect width="100%" height="100%" fill="url(#ap-dots)" />
          </svg>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Accounts
          </button>

          {/* Change Cover */}
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
                    alt="Account Avatar"
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
                    {accountUser ? getFullName(accountUser) : "—"}
                  </h2>
                  <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    <UserCog className="w-3 h-3" />
                    {roleLabel}
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
          <div className="flex-1 p-8">
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
                    className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
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
