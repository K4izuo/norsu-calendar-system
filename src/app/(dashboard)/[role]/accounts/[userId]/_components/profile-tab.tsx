"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { User, Pencil } from "lucide-react";
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
import { authService } from "@/features/auth/services/auth-service";
import { AccountUpdateFormData } from "@/features/auth/types/auth.types";
import { AccountUser } from "./types";

export function ProfileTab({
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
        toast.error(response.error, { position: "top-right" });
        return;
      }
      toast.success("Profile updated successfully!", { position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["accountUser", userId] });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile.", { position: "top-right" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex border rounded-lg flex-col items-start self-stretch">
      <div className="flex border-b p-6 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <User className="w-4 h-4" strokeWidth={2.5} />
          Personal Information
        </h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset({
                first_name: accountUser.first_name ?? "",
                last_name: accountUser.last_name ?? "",
                email: accountUser.email ?? "",
                campus_id: "",
              });
              setIsEditing(true);
            }}
            className="flex cursor-pointer items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="p-6 w-full">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name" className="text-sm font-normal inline-block leading-none">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  {...register("first_name", { required: "First name is required" })}
                  className={errors.first_name ? "border-red-400 h-12" : "h-12"}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500">{errors.first_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name" className="text-sm font-normal inline-block leading-none">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  {...register("last_name", { required: "Last name is required" })}
                  className={errors.last_name ? "border-red-400 h-12" : "h-12"}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500">{errors.last_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-normal inline-block leading-none">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                  })}
                  className={errors.email ? "border-red-400 h-12" : "h-12"}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal inline-block leading-none">
                  Campus
                </Label>
                {role === "admin" && accountUser.role !== 0 ? (
                  <Controller
                    name="campus_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger className="h-12">
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
                    className="bg-gray-50 text-gray-400 h-12"
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
              <label className="text-sm text-gray-400 font-normal inline-block leading-none">First Name</label>
              <div className="text-base font-medium text-gray-900">{accountUser.first_name || "—"}</div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-normal inline-block leading-none">Last Name</label>
              <div className="text-base font-medium text-gray-900">{accountUser.last_name || "—"}</div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-normal inline-block leading-none">Email Address</label>
              <div className="text-base font-medium text-gray-900">{accountUser.email || "—"}</div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400 font-normal inline-block leading-none">Campus</label>
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
    </div>
  );
}
