"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { Lock, Shield, Users, Settings, BarChart3, Database, User, Eye, EyeOff } from "lucide-react"

interface FormData {
  username: string
  password: string
}

interface FormErrors {
  username: string
  password: string
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({ username: "", password: "" })
  const [debouncedValues, setDebouncedValues] = useState({
    username: "",
    password: "",
  })

  // Debounce username validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues((prev) => ({ ...prev, username: formData.username }))
    }, 550)
    return () => clearTimeout(timer)
  }, [formData.username])

  // Debounce password validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues((prev) => ({ ...prev, password: formData.password }))
    }, 550)
    return () => clearTimeout(timer)
  }, [formData.password])

  // Validate username when debounced value changes
  useEffect(() => {
    if (debouncedValues.username) {
      if (!validateUsername(debouncedValues.username)) {
        setErrors((prev) => ({
          ...prev,
          username: "Username must be at least 3 characters long",
        }))
      } else {
        setErrors((prev) => ({ ...prev, username: "" }))
      }
    }
  }, [debouncedValues.username])

  // Validate password when debounced value changes
  useEffect(() => {
    if (debouncedValues.password) {
      if (!validatePassword(debouncedValues.password)) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 8 characters long",
        }))
      } else {
        setErrors((prev) => ({ ...prev, password: "" }))
      }
    }
  }, [debouncedValues.password])

  const validateUsername = (username: string) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = { username: "", password: "" }
    if (!formData.username) {
      newErrors.username = "Username is required"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    }
    setErrors(newErrors)
    if (formData.username && formData.password && validateUsername(formData.username)) {
      console.log("Admin logging in with:", { ...formData, rememberMe })
      // Redirect to admin dashboard after successful login
      // window.location.href = "/admin/dashboard"
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 font-['Poppins'] flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Background decorative elements - dark theme */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gray-700 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gray-600 rounded-full opacity-20 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-gray-700 rounded-full opacity-20 -translate-x-12"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full max-w-[375px] sm:max-w-xl md:max-w-3xl lg:max-w-[1000px] grid grid-cols-1 md:grid-cols-2 relative p-2 sm:p-0 border border-gray-700"
      >
        {/* Left Side - Hidden on mobile - Admin themed */}
        <div className="hidden md:flex bg-gradient-to-br from-gray-700 to-gray-800 p-4 sm:p-6 lg:p-8 text-white flex-col items-center justify-center relative min-h-[400px]">
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/10 rounded-full"></div>

          <div className="space-y-6 text-center z-10 flex flex-col items-center justify-center h-full">
            {/* Logo/Icon with Admin branding */}
            <div className="bg-white/20 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl inline-block backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                <Settings className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">AdminPortal Pro</h2>
              <p className="text-gray-100 text-lg">Administrative Control</p>
              <p className="text-gray-200 text-sm max-w-xs">Secure system management and administrative oversight</p>
            </div>

            {/* Admin-related features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-4 text-gray-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span className="text-xs">Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center bg-gray-800">
          {/* Heading at the top */}
          <div className="flex flex-col items-center mt-4 mb-7 gap-y-1">
            <h1 className="text-2xl font-bold text-white">Administrator Access</h1>
            <p className="text-gray-300 text-sm">Please enter your admin credentials</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-y-6 max-w-md mx-auto w-full">
            <div className="flex flex-col gap-y-2 w-full sm:w-[98%] md:w-[94%] mx-auto">
              {/* Username Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Admin Username"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    className="h-[50px] sm:h-[54px] text-base sm:text-lg pl-11 border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:border-gray-500 focus:ring-gray-500/20 transition-colors"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.username && <p className="text-red-400 text-sm ml-1">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Admin Password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="h-[50px] sm:h-[54px] text-base sm:text-lg pl-11 pr-9 border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:border-gray-500 focus:ring-gray-500/20 transition-colors"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm ml-1">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex mb-3 items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-2 border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Button variant="link" className="text-gray-300 hover:text-white p-0 text-sm font-medium" type="button">
                  Contact IT Support
                </Button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full cursor-pointer h-[50px] sm:h-[54px] font-semibold text-sm sm:text-base bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mb-6"
              >
                ACCESS ADMIN DASHBOARD
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
