"use client";

import { BookUser, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { User } from "@/shared/components/context/auth-context";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { AccountUpdateFormData } from "@/features/auth/types/auth.types";
import { useUpdateProfile } from "@/features/user-profile/hooks/use-update-profile";
import { OptionType } from "@/features/calendar/services/academicDataService";

interface MyProfileContentProps {
  user: User | null;
  role: string;
  isLoading: boolean;
  campusName: string | null;
  isCampusLoading: boolean;
  campuses: OptionType[];
  campusId?: string;
}

export function MyProfileContent({
  user,
  role,
  isLoading,
  campusName,
  isCampusLoading,
  campuses,
  campusId,
}: MyProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateProfile, isLoading: isSaving } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AccountUpdateFormData>({
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      campus_id: campusId ?? "",
    },
  });

  // Populate form once user data is available
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        campus_id: campusId ?? "",
      });
    }
  }, [user, campusId, reset]);

  const onSubmit = async (data: AccountUpdateFormData) => {
    const success = await updateProfile(data);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
        <div className="flex border-b pb-3 justify-between items-center self-stretch">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
      <div className="flex border-b pb-3 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <BookUser className="w-4 h-4" strokeWidth={2.5} />
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
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                  })}
                  className={errors.email ? "border-red-400 pr-20" : "pr-20"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-tight pointer-events-none">
                  Verified
                </span>
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {role !== "admin" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Campus
                </Label>
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
              </div>
            )}

            {role === "admin" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                  Campus
                </Label>
                <Input value="All Campuses" disabled className="bg-gray-50 text-gray-400" />
              </div>
            )}
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
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              First Name
            </label>
            <div className="text-base font-medium text-gray-900">
              {user?.first_name || "—"}
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Last Name
            </label>
            <div className="text-base font-medium text-gray-900">
              {user?.last_name || "—"}
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Email Address
            </label>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-900">
                {user?.email || "—"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                Verified
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Campus
            </label>
            <div className="text-base font-medium capitalize text-gray-900">
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
