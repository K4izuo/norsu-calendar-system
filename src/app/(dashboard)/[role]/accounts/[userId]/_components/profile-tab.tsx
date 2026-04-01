"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { User, Pencil, AlertCircle } from "lucide-react";
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
import { accountUpdateSchema } from "@/features/accounts/utils/account-validation-rules";
import { AccountUser } from "./types";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  campus_id: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type Touched = Partial<Record<keyof FormData, boolean>>;

function getInitialData(accountUser: AccountUser): FormData {
  return {
    first_name: accountUser.first_name ?? "",
    last_name: accountUser.last_name ?? "",
    email: accountUser.email ?? "",
    campus_id: accountUser.campus_id ?? "",
  };
}

function validateFields(data: FormData, touched: Touched, requireCampus: boolean): FormErrors {
  const result = accountUpdateSchema.safeParse(data);
  const errs: FormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormData;
      if (touched[field] && !errs[field]) {
        errs[field] = issue.message;
      }
    }
  }
  if (requireCampus && touched.campus_id && !data.campus_id) {
    errs.campus_id = "Campus is required";
  }
  return errs;
}

function validateAll(data: FormData, requireCampus: boolean): FormErrors {
  const result = accountUpdateSchema.safeParse(data);
  const errs: FormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormData;
      if (!errs[field]) errs[field] = issue.message;
    }
  }
  if (requireCampus && !data.campus_id) {
    errs.campus_id = "Campus is required";
  }
  return errs;
}

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
  const [formData, setFormData] = useState<FormData>(() => getInitialData(accountUser));
  const [touched, setTouched] = useState<Touched>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const queryClient = useQueryClient();

  const showCampusSelect = role === "admin" && accountUser.role !== 0;

  useEffect(() => {
    setFormData(getInitialData(accountUser));
    setTouched({});
    setErrors({});
  }, [accountUser]);

  const handleChange = (field: keyof FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (touched[field]) {
      setErrors(validateFields(newData, touched, showCampusSelect));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const newTouched = { ...touched, [field]: true };
    setTouched(newTouched);
    setErrors(validateFields(formData, newTouched, showCampusSelect));
  };

  const handleCancel = () => {
    setFormData(getInitialData(accountUser));
    setTouched({});
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateAll(formData, showCampusSelect);
    if (Object.keys(allErrors).length > 0) {
      setTouched({ first_name: true, last_name: true, email: true, campus_id: true });
      setErrors(allErrors);
      return;
    }
    setIsSaving(true);
    try {
      const response = await authService.updateAccount(userId, formData as AccountUpdateFormData);
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

  const errorDiv = (msg: string) => (
    <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <p>{msg}</p>
    </div>
  );

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
              setFormData({ ...getInitialData(accountUser), campus_id: "" });
              setTouched({});
              setErrors({});
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
          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name" className="text-sm font-normal inline-block leading-none">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  onBlur={() => handleBlur("first_name")}
                  className={errors.first_name ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500 h-12" : "h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}
                />
                {errors.first_name && errorDiv(errors.first_name)}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name" className="text-sm font-normal inline-block leading-none">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  onBlur={() => handleBlur("last_name")}
                  className={errors.last_name ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500 h-12" : "h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}
                />
                {errors.last_name && errorDiv(errors.last_name)}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-normal inline-block leading-none">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500 h-12" : "h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}
                />
                {errors.email && errorDiv(errors.email)}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-normal inline-block leading-none">
                  Campus
                </Label>
                {role === "admin" && accountUser.role !== 0 ? (
                  <>
                    <Select
                      value={formData.campus_id}
                      onValueChange={(val) => {
                        handleChange("campus_id", val);
                        handleBlur("campus_id");
                      }}
                      onOpenChange={(open) => {
                        if (!open) handleBlur("campus_id");
                      }}
                    >
                      <SelectTrigger className={`h-12 ${errors.campus_id ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500 h-12" : "h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}`}>
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
                    {errors.campus_id && errorDiv(errors.campus_id)}
                  </>
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
                onClick={handleCancel}
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
