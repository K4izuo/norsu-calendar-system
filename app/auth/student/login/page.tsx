"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { Lock, Bike, Route, MapPin, Trophy, Timer, User, Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { StudentFormField } from "@/components/user-forms/login/student/student-form-field"

interface FormData {
  username: string
  password: string
}

export default function StudentLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    // clearErrors,
    formState: { errors },
    watch,
    reset, // <-- Add this
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { username: "", password: "" },
  })

  // const usernameValue = watch("username")
  // const passwordValue = watch("password")

  // Custom validation functions
  const validateUsername = (username: string) =>
    username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
  const validatePassword = (password: string) => password.length >= 8

  const onSubmit = async (data: FormData) => {
    let hasError = false

    if (!data.username.trim()) {
      setError("username", { type: "manual", message: "Username is required" })
      toast.error("Username is required", { position: "top-center" })
      hasError = true
    }
    if (!data.password.trim()) {
      setError("password", { type: "manual", message: "Password is required" })
      toast.error("Password is required", { position: "top-center" })
      hasError = true
    }
    if (data.username.trim() && !validateUsername(data.username)) {
      setError("username", { type: "manual", message: "Username must be at least 3 characters long" })
      toast.error("Username must be at least 3 characters long", { position: "top-center" })
      hasError = true
    }
    if (data.password.trim() && !validatePassword(data.password)) {
      setError("password", { type: "manual", message: "Password must be at least 8 characters long" })
      toast.error("Password must be at least 8 characters long", { position: "top-center" })
      hasError = true
    }
    if (hasError) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Login successful!", { position: "top-center" })
      reset() // <-- Reset the form fields
      // window.location.href = "/dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-6 px-2.5 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-600 rounded-full opacity-10 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500 rounded-full opacity-10 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-green-500 rounded-full opacity-10 -translate-x-12"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-4xl grid grid-cols-1 md:grid-cols-2 relative"
      >
        {/* Left Side - Hidden on mobile */}
        <div className="hidden md:flex bg-gradient-to-br from-green-600 to-emerald-700 p-4 sm:p-6 lg:p-8 text-white flex-col items-center justify-center relative min-h-[400px]">
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/10 rounded-full"></div>

          <div className="space-y-6 text-center z-10 flex flex-col items-center justify-center h-full">
            {/* Logo/Icon with BikeRider branding */}
            <div className="bg-white/20 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl inline-block backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <Bike className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                <Route className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">BikeRider Pro</h2>
              <p className="text-green-100 text-lg">Cycling Tracking System</p>
              <p className="text-green-200 text-sm max-w-xs">
                Track your rides, monitor performance, and connect with the cycling community
              </p>
            </div>

            {/* Cycling-related features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-4 text-green-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Routes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs">Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs">Achievements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-5 sm:p-8 w-full flex flex-col justify-center">
          {/* Heading at the top */}
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Welcome Student</h1>
            <p className="text-gray-600 text-sm">Please enter your login credentials</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6 max-w-md mx-auto w-full">
            <div className="flex flex-col gap-y-2 w-full sm:w-[98%] md:w-[94%] mx-auto">
              {/* Username Field */}
              <StudentFormField
                id="username"
                type="text"
                placeholder="Username"
                icon={User}
                hasError={!!errors.username}
                errorMessage={errors.username?.message}
                autoComplete="username"
                {...register("username")}
              />

              {/* Password Field */}
              <StudentFormField
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                icon={Lock}
                hasError={!!errors.password}
                errorMessage={errors.password?.message}
                autoComplete="current-password"
                {...register("password")}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex mb-4 items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={checked => setRememberMe(checked === true)}
                    className="border-2 cursor-pointer border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Button
                  variant="link"
                  className="text-green-600 cursor-pointer hover:text-green-700 p-0 text-sm font-medium"
                  type="button"
                >
                  Forgot Password?
                </Button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full cursor-pointer h-12 font-semibold text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mb-3.5 flex items-center justify-center gap-x-2"
                disabled={isLoading}
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
      </motion.div>
    </div>
  )
}
