import { Lock, Eye, EyeOff, CircleCheckBig, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PasswordChangeFormData } from "@/features/auth/types/auth.types";
import { useUpdatePassword } from "@/features/user-profile/hooks/use-update-password";

function RequirementItem({
  checked,
  text,
}: {
  checked: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <CircleCheckBig
        className={`w-5 h-5 shrink-0 transition-colors duration-200 ${checked ? "text-green-600" : "text-[#e4e4e4]"}`}
      />
      <span
        className={`text-[15px] font-medium transition-colors duration-200 ${checked ? "text-gray-900" : "text-[#c9c9c9]"}`}
      >
        {text}
      </span>
    </div>
  );
}

export function PasswordSecurityContent() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { updatePassword, isLoading } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("new_password") || "";
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  const newPasswordReg = register("new_password", {
    required: "New password is required",
    validate: {
      length: (v) => v.length >= 8 || "Password must be at least 8 characters",
      upper: (v) => /[A-Z]/.test(v) || "Password must contain uppercase letter",
      lower: (v) => /[a-z]/.test(v) || "Password must contain lowercase letter",
      number: (v) => /[0-9]/.test(v) || "Password must contain number",
      punctuation: (v) =>
        /[^A-Za-z0-9]/.test(v) || "Password must contain punctuation",
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

    const success = await updatePassword(data);
    if (success) {
      reset();
    }
  };

  const inputClasses =
    "flex w-full h-[52px] items-center gap-3 self-stretch px-4 py-3 rounded-lg bg-white text-base text-gray-900 font-medium border-gray-200";

  return (
    <div className="flex border rounded-lg flex-col items-start self-stretch">
      <div className="flex border-b p-6 justify-between items-center self-stretch">
        <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
          <Lock className="w-4 h-4" strokeWidth={2.5} />
          Password & Security
        </h3>
      </div>

      <div className="p-6 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-xl flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1 w-full">
            <Label className="text-base">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                className={`${inputClasses} border ${errors.current_password ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}`}
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
              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{errors.current_password.message}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label className="text-base">New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                className={`${inputClasses} border ${errors.new_password ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}`}
                placeholder="Enter new password"
                name={newPasswordReg.name}
                ref={newPasswordReg.ref}
                onChange={newPasswordReg.onChange}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={(e) => {
                  newPasswordReg.onBlur(e);
                  setIsNewPasswordFocused(false);
                }}
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
            {(isNewPasswordFocused || newPassword.length > 0) && (
              <div className="flex flex-col gap-2.5 mt-2 transition-opacity duration-300">
                <RequirementItem
                  checked={newPassword.length >= 8}
                  text="At least 8 characters long."
                />
                <RequirementItem
                  checked={/[A-Z]/.test(newPassword)}
                  text="Contains uppercase letters."
                />
                <RequirementItem
                  checked={/[a-z]/.test(newPassword)}
                  text="Contains lowercase letters."
                />
                <RequirementItem
                  checked={/[0-9]/.test(newPassword)}
                  text="Contains numbers."
                />
                <RequirementItem
                  checked={/[^A-Za-z0-9]/.test(newPassword)}
                  text="Contains punctuation."
                />
              </div>
            )}
            {errors.new_password &&
              !isNewPasswordFocused &&
              newPassword.length === 0 && (
                <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{errors.new_password.message}</p>
                </div>
              )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <Label className="text-base">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                className={`${inputClasses} border ${errors.new_password_confirmation ? "border-red-500 focus-visible:ring-red-100 focus-visible:border-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150"}`}
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
              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{errors.new_password_confirmation.message}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer sm:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
