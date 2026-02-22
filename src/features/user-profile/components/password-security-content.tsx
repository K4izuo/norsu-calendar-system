import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { apiClient } from "@/core/api/api-client";
import { PasswordChangeFormData } from "@/features/auth/types/auth.types";

export function PasswordSecurityContent() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    if (data.new_password !== data.new_password_confirmation) {
      setError("new_password_confirmation", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await apiClient.put<
        { message: string },
        PasswordChangeFormData
      >("users/update-password", data);

      if (response.error) {
        toast.error(response.error, { position: "top-center" });
        return;
      }

      toast.success(
        response.data?.message || "Password updated successfully!",
        {
          position: "top-center",
        },
      );
      reset();
    } catch (err) {
      console.error("Password update error:", err);
      toast.error("Failed to update password. Please try again.", {
        position: "top-center",
      });
    }
  };

  const inputClasses =
    "flex w-full h-[52px] items-center gap-3 self-stretch px-4 py-3 rounded-lg bg-white text-base text-gray-900 font-medium border-gray-200";

  return (
    <div className="flex border p-6 rounded-lg flex-col items-start gap-8 self-stretch">
      <div className="flex border-b pb-6 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <Lock className="w-4 h-4" strokeWidth={2.5} />
          Password & Security
        </h3>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 w-full">
          <Label className="text-base">Current Password</Label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              className={`${inputClasses} ${errors.current_password ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : ""}`}
              placeholder="Enter current password"
              {...register("current_password", {
                required: "Current password is required",
              })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.current_password && (
            <span className="text-red-500 text-sm font-medium ml-1">
              {errors.current_password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Label className="text-base">New Password</Label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              className={`${inputClasses} ${errors.new_password ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : ""}`}
              placeholder="Enter new password"
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.new_password && (
            <span className="text-red-500 text-sm font-medium ml-1">
              {errors.new_password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Label className="text-base">Confirm New Password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              className={`${inputClasses} ${errors.new_password_confirmation ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : ""}`}
              placeholder="Confirm new password"
              {...register("new_password_confirmation", {
                required: "Please confirm your new password",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.new_password_confirmation && (
            <span className="text-red-500 text-sm font-medium ml-1">
              {errors.new_password_confirmation.message}
            </span>
          )}
        </div>

        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer sm:w-auto px-8 h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
