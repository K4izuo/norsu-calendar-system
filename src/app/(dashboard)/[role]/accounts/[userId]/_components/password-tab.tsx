"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { apiClient } from "@/core/api/api-client";
import { AdminPasswordFormData } from "./types";

export function PasswordTab({ userId }: { userId: number }) {
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
        toast.error(response.error, { position: "top-right" });
        return;
      }
      toast.success("Password updated successfully!", { position: "top-right" });
      reset();
    } catch {
      toast.error("Failed to update password.", { position: "top-right" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex border rounded-lg flex-col items-start self-stretch">
      <div className="flex border-b p-6 items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <Lock className="w-4 h-4" strokeWidth={2.5} />
          Reset Password
        </h3>
      </div>

      <div className="p-6 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new_password" className="text-sm font-normal inline-block leading-none">
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
              className={errors.new_password ? "border-red-400 pr-10 h-12" : "pr-10 h-12"}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-xs text-red-500">{errors.new_password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm_password" className="text-sm font-normal inline-block leading-none">
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
              className={errors.confirm_password ? "border-red-400 pr-10 h-12" : "pr-10 h-12"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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
    </div>
  );
}
