import React, { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Eye,
  User,
  Lock,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { LoginFormData } from "@/features/auth/utils/login/login-validation-rules";
import { loginSchema } from "@/features/auth/utils/login/login-validation-rules";
import { useFieldValidation } from "@/features/auth/utils/login/login-field-validation";

interface UserLoginFormProps {
  showPassword: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  formData: LoginFormData;
  errors: FieldErrors<LoginFormData>;
  onShowPasswordToggle: () => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<LoginFormData>;
}

export const UserLoginForm = memo(function UserLoginForm({
  showPassword,
  rememberMe,
  isLoading,
  isSuccess,
  formData,
  errors,
  onShowPasswordToggle,
  onRememberMeChange,
  onSubmit,
  register,
}: UserLoginFormProps) {
  // Real-time validation with debounce
  const usernameError = useFieldValidation(formData.username, loginSchema.shape.username);
  const passwordError = useFieldValidation(formData.password, loginSchema.shape.password);

  // Server errors take priority over client-side validation
  const displayErrors = {
    username: errors.username?.message || usernameError,
    password: errors.password?.message || passwordError,
  };

  const getInputFieldStyles = (hasError: boolean) =>
    hasError
      ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500"
      : "border-gray-300 focus:border-gray-500 focus:ring-gray-500/20";

  const isDisabled = isLoading || isSuccess;

  return (
    <div className="p-5 sm:p-8 w-full flex flex-col justify-center">
      {/* Heading at the top */}
      <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-600 text-sm">
          Please enter your credentials to continue
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-y-6 max-w-md mx-auto w-full"
      >
        <div className="flex flex-col gap-y-2 w-full sm:w-[98%] md:w-[83%] mx-auto">
          {/* Username Field */}
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                {...register("username")}
                id="username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                disabled={isDisabled}
                className={`h-12 transition-all duration-150 text-base sm:text-lg pl-10.5 pr-4 border rounded-lg ${getInputFieldStyles(!!errors.username)} placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {displayErrors.username && (
              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{displayErrors.username}</p>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                disabled={isDisabled}
                className={`h-12 transition-all duration-150 text-base sm:text-lg pl-10.5 pr-12 border rounded-lg ${getInputFieldStyles(!!errors.password)} placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={onShowPasswordToggle}
                disabled={isDisabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {displayErrors.password && (
              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{displayErrors.password}</p>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex mb-3 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  onRememberMeChange(checked === true)
                }
                disabled={isDisabled}
                className="border-2 cursor-pointer border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Remember Me
              </label>
            </div>
            <Button
              variant="link"
              className="text-gray-600 hover:text-blue-600 cursor-pointer p-0 text-sm font-medium"
              type="button"
              disabled={isDisabled}
            >
              Contact IT Support
            </Button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className={`w-full mb-3 h-12 font-semibold text-sm sm:text-base text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-x-2 ${isLoading
              ? "bg-gray-400 cursor-not-allowed opacity-70"
              : "cursor-pointer bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transform hover:scale-[1.02]"
              }`}
            disabled={isDisabled}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" />
                <span>You&apos;re in!</span>
              </>
            ) : isLoading ? (
              <>
                <span className="animate-spin">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
                Logging in...
              </>
            ) : (
              "LOGIN"
            )}
          </Button>
        </div>
      </form>

      {/* Register Link remove the mb-3 on the login button then uncomment these */}
      {/* <div className="mt-2.5 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="text-blue-600 cursor-pointer hover:text-blue-800 p-0 font-semibold"
            type="button"
          >
            Register now!
          </Button>
        </p>
      </div> */}
    </div>
  );
});

UserLoginForm.displayName = "UserLoginForm";
