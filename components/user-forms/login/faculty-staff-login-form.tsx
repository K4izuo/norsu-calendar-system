import React, { memo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Eye, User, Lock, EyeOff, Loader2 } from "lucide-react"
import { UseFormRegister, FieldErrors, RegisterOptions } from "react-hook-form"
import { LoginFormData } from "@/utils/login/login-validation-rules"

interface LoginFormLayoutProps {
  type: "faculty" | "staff"
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

export const LoginFormLayout = memo(function LoginFormLayout({
  type,
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
}: LoginFormLayoutProps) {
  // Theme configuration based on user type
  const themeConfig = {
    faculty: {
      title: "Welcome Faculty",
      buttonStyle: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
      checkboxStyle: "border-2 cursor-pointer border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
      linkStyle: "text-blue-600 cursor-pointer hover:text-blue-700",
      inputStyle: "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
    },
    staff: {
      title: "Welcome Staff",
      buttonStyle: "bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700",
      checkboxStyle: "border-2 cursor-pointer border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500",
      linkStyle: "text-purple-600 cursor-pointer hover:text-purple-700",
      inputStyle: "border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
    }
  }

  const theme = themeConfig[type]
  const buttonHeight = type === "faculty" ? "h-12" : "h-[50px] sm:h-[54px]"

  const getInputFieldStyles = (hasError: boolean) => {
    return hasError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : theme.inputStyle
  }

  return (
    <div className="p-5 sm:p-8 w-full flex flex-col justify-center">
      {/* Heading at the top */}
      <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
        <h1 className="text-2xl font-bold text-gray-800">{theme.title}</h1>
        <p className="text-gray-600 text-sm">Please enter your login credentials</p>
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
                className={`h-12 text-base sm:text-lg pl-[42px] pr-4 border-2 rounded-lg ${getInputFieldStyles(!!errors.username)} placeholder:text-gray-400`}
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
                className={`h-12 text-base sm:text-lg pl-[42px] pr-12 border-2 rounded-lg ${getInputFieldStyles(!!errors.password)} placeholder:text-gray-400`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={onShowPasswordToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors focus:outline-none"
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
                className={theme.checkboxStyle}
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember Me
              </label>
            </div>
            <Button
              variant="link"
              className={`${theme.linkStyle} p-0 text-sm font-medium`}
              type="button"
            >
              Forgot Password?
            </Button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className={`w-full cursor-pointer ${buttonHeight} font-semibold text-sm sm:text-base ${theme.buttonStyle} rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mb-3 flex items-center justify-center gap-x-2`}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Logging in...
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

LoginFormLayout.displayName = "LoginFormLayout"