"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Users, BarChart3, Database } from "lucide-react"
import { UserLoginForm } from "@/features/auth/components/login/user-login-form"
import { useLoginForm } from "@/features/auth/hooks/useLoginForm"

export default function UserLoginPage() {
  const {
    form,
    formData,
    errors,
    showPassword,
    rememberMe,
    isLoading: formLoading,
    isSuccess,
    handlePasswordToggle,
    handleRememberMeChange,
    handleSubmit,
    validationRules
  } = useLoginForm()

  return (
    <div className="min-h-dvh w-full bg-linear-to-br from-blue-50 to-indigo-50 font-['Poppins'] flex items-center justify-center py-6 px-3 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600 rounded-full opacity-20 -translate-x-24 -translate-y-24"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full opacity-10 translate-x-24 -translate-y-24"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500 rounded-full opacity-20 translate-x-24 translate-y-24"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full opacity-20 -translate-x-24 translate-y-24"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-4xl grid grid-cols-1 md:grid-cols-2 relative"
      >
        {/* Left Side - Hidden on mobile */}
        <div className="hidden md:flex bg-linear-to-br from-blue-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white flex-col items-center justify-center relative min-h-95">
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 lg:bottom-4 lg:left-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>

          <div className="space-y-6 text-center z-10 flex flex-col items-center justify-center h-full">
            {/* NORSU Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
              <div className="relative bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <Image
                  src="/images/norsu.png"
                  alt="Negros Oriental State University"
                  width={160}
                  height={160}
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-blue-100 text-base sm:text-lg font-medium">Calendar Management System</p>
            </div>

            {/* System features */}
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-4 text-blue-100">
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
                  <span className="text-xs">Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <UserLoginForm
          showPassword={showPassword}
          rememberMe={rememberMe}
          isLoading={formLoading}
          isSuccess={isSuccess}
          formData={formData}
          errors={errors}
          onShowPasswordToggle={handlePasswordToggle}
          onRememberMeChange={handleRememberMeChange}
          onSubmit={handleSubmit}
          register={form.register}
          validationRules={validationRules}
        />
      </motion.div>
    </div>
  )
}
