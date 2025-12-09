import React, { memo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Eye, User, Lock, EyeOff, Loader2, Check } from "lucide-react"
import { UseFormRegister, FieldErrors, RegisterOptions } from "react-hook-form"
import { LoginFormData } from "@/utils/login/login-validation-rules"

interface AdminLoginFormProps {
  showPassword: boolean
  rememberMe: boolean
  isLoading: boolean
  isSuccess: boolean
  formData: LoginFormData
  errors: FieldErrors<LoginFormData>
  onShowPasswordToggle: () => void
  onRememberMeChange: (checked: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  register: UseFormRegister<LoginFormData>
  validationRules: Record<keyof LoginFormData, RegisterOptions<LoginFormData>>
}

export const AdminLoginForm = memo(function AdminLoginForm({
  showPassword,
  rememberMe,
  isLoading,
  isSuccess,
  errors,
  onShowPasswordToggle,
  onRememberMeChange,
  onSubmit,
  register,
  validationRules
}: AdminLoginFormProps) {
  const getInputFieldStyles = (hasError: boolean) => {
    return hasError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-gray-500 focus:ring-gray-500/20"
  }

  return (
    <div className="p-5 sm:p-8 w-full flex flex-col justify-center">
      {/* Heading at the top */}
      <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
        <h1 className="text-2xl font-bold text-gray-800">Administrator Access</h1>
        <p className="text-gray-600 text-sm">Please enter your admin credentials</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-y-6 max-w-md mx-auto w-full">
        <div className="flex flex-col gap-y-2 w-full sm:w-[98%] md:w-[94%] mx-auto">
          {/* Username Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("username", validationRules.username)}
                id="username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                disabled={isLoading || isSuccess}
                className={`h-12 text-base sm:text-lg pl-[42px] pr-4 border-2 rounded-lg ${getInputFieldStyles(!!errors.username)} placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register("password", validationRules.password)}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                disabled={isLoading || isSuccess}
                className={`h-12 text-base sm:text-lg pl-[42px] pr-12 border-2 rounded-lg ${getInputFieldStyles(!!errors.password)} placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={onShowPasswordToggle}
                disabled={isLoading || isSuccess}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex mb-3 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={checked => onRememberMeChange(checked === true)}
                disabled={isLoading || isSuccess}
                className="border-2 cursor-pointer border-gray-300 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                Remember Me
              </label>
            </div>
            <Button
              variant="link"
              className="text-gray-600 hover:text-gray-800 cursor-pointer p-0 text-sm font-medium"
              type="button"
              disabled={isLoading || isSuccess}
            >
              Contact IT Support
            </Button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className={`w-full h-[50px] sm:h-[54px] font-semibold text-sm sm:text-base text-white rounded-lg shadow-lg transition-all duration-200 mb-3 flex items-center justify-center gap-x-2 ${isLoading || isSuccess
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : 'cursor-pointer bg-linear-to-br from-gray-400 via-gray-500 to-gray-700 hover:from-gray-500 hover:to-gray-800 hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
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
            ) : isSuccess ? (
              <>
                {/* <Check className="h-5 w-5" /> */}
                LOGIN
              </>
            ) : (
              "LOGIN"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
})

AdminLoginForm.displayName = "AdminLoginForm"