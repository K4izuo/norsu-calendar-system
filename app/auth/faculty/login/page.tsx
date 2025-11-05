"use client"

import type React from "react"
import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Users, Award, Clock } from "lucide-react"
import { LoginFormLayout } from "@/components/user-forms/login/login-page-form"
import { useLoginForm } from "@/hooks/useLoginForm"

export default function FacultyLoginPage() {
  const {
    form,
    formData,
    errors,
    showPassword,
    rememberMe,
    isLoading,
    handlePasswordToggle,
    handleRememberMeChange,
    handleSubmit,
    validationRules
  } = useLoginForm()

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-blue-50 to-indigo-50 font-['Poppins'] flex items-center justify-center py-6 px-3 sm:px-4 lg:px-6 relative overflow-hidden">
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
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white flex-col items-center justify-center relative min-h-[400px]">
          {/* Decorative circles */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white/10 rounded-full"></div>

          <div className="space-y-6 text-center z-10 flex flex-col items-center justify-center h-full">
            {/* Logo/Icon with Academic branding */}
            <div className="bg-white/20 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl inline-block backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">EduPortal Pro</h2>
              <p className="text-blue-100 text-lg">Faculty & Staff Portal</p>
              <p className="text-blue-200 text-sm max-w-xs">
                Manage courses, track student progress, and collaborate with colleagues
              </p>
            </div>

            {/* Academic-related features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Classes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Schedule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">Grades</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <LoginFormLayout
          type="faculty"
          showPassword={showPassword}
          rememberMe={rememberMe}
          isLoading={isLoading}
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
