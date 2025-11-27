"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Shield, Users, Settings, BarChart3, Database } from "lucide-react"
import { AdminLoginForm } from "@/components/user-forms/login/admin-login-form"
import { useLoginForm } from "@/hooks/useLoginForm"

export default function AdminLoginPage() {
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
    <div className="min-h-dvh w-full bg-linear-to-br from-gray-50 to-gray-100 font-['Poppins'] flex items-center justify-center py-6 px-3 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gray-900 rounded-full opacity-20 -translate-x-24 -translate-y-24"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-gray-800 rounded-full opacity-10 translate-x-24 -translate-y-24"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gray-800 rounded-full opacity-20 translate-x-24 translate-y-24"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-900 rounded-full opacity-20 -translate-x-24 translate-y-24"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-4xl grid grid-cols-1 md:grid-cols-2 relative"
      >
        {/* Left Side - Hidden on mobile */}
        <div className="hidden md:flex bg-linear-to-br from-gray-700 to-gray-800 p-4 sm:p-6 lg:p-8 text-white flex-col items-center justify-center relative min-h-[380px]">
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/10 rounded-full"></div>

          <div className="space-y-6 text-center z-10 flex flex-col items-center justify-center h-full">
            {/* Logo/Icon with Academic branding */}
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

            {/* Academic-related features */}
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
        <AdminLoginForm
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
