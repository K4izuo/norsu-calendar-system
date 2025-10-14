"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
// import { Label } from "@/components/ui/label"
import { AdminSummary } from "@/components/user-forms/admin/admin-summary"
// import toast from "react-hot-toast";
import { AdminFormField } from "@/components/user-forms/admin/admin-form-field"
import { useAdminRegForm } from "@/hooks/useAdminRegForm";

export default function AdminRegisterPage() {
  const {
    formData,
    missingFields,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    isFormValid,
  } = useAdminRegForm();

  const [activeTab, setActiveTab] = useState("details")

  const onSubmit = useCallback(async () => {
    const success = await handleSubmit()
    if (success) {
      setTimeout(() => setActiveTab("details"), 700)
    }
  }, [handleSubmit])

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative overflow-hidden font-['Poppins']">
      {/* Admin background blobs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gray-600 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gray-500 rounded-full opacity-20 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-gray-600 rounded-full opacity-20 -translate-x-12"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // Changed container to match faculty: white background, shadow, rounded, etc.
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-3xl relative p-2 sm:p-0"
      >
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Admin Registration</h1>
            <p className="text-gray-600 text-sm">Fill in your details to register</p>
          </div>
          <Tabs value={activeTab} className="w-full">
            <div className="grid grid-cols-2 mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors min-w-[100px] ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Admin Details
              </div>
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors min-w-[100px] ${
                  activeTab === "summary"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Summary
              </div>
            </div>
            <TabsContent value="details" className="space-y-6">
              <form className="flex flex-col gap-y-5" onSubmit={e => e.preventDefault()}>
                {/* Name row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <AdminFormField
                      id="first_name"
                      name="first_name"
                      label="First Name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      hasError={!!missingFields.first_name}
                    />
                  </div>
                  <div className="flex-1">
                    <AdminFormField
                      id="middle_name"
                      name="middle_name"
                      label="Middle Name"
                      placeholder="Enter middle name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      required
                      hasError={!!missingFields.middle_name}
                    />
                  </div>
                  <div className="flex-1">
                    <AdminFormField
                      id="last_name"
                      name="last_name"
                      label="Last Name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      hasError={!!missingFields.last_name}
                    />
                  </div>
                </div>
                
                {/* Email & Admin ID row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <AdminFormField
                      id="email"
                      name="email"
                      label="Email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      hasError={!!missingFields.email}
                      type="email"
                    />
                  </div>
                  <div className="flex-1">
                    <AdminFormField
                      id="adminID"
                      name="adminID"
                      label="Admin ID"
                      placeholder="Enter admin ID"
                      value={formData.adminID}
                      onChange={handleInputChange}
                      required
                      hasError={!!missingFields.adminID}
                    />
                  </div>
                </div>
                
                <div className="flex mt-1 justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      if (isFormValid()) {
                        setActiveTab("summary");
                      } else {
                        handleSubmit(true); // Just validate, don't submit
                      }
                    }}
                    variant="default"
                    className="text-base bg-gray-700 hover:bg-gray-600 cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="summary" className="space-y-6">
              <AdminSummary 
                formData={formData}
                isFormValid={isFormValid()}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  variant="outline"
                  className="text-base cursor-pointer py-2.5"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onSubmit}
                  variant="default"
                  disabled={!isFormValid() || isSubmitting}
                  className="text-base bg-gray-700 hover:bg-gray-600 cursor-pointer py-2.5"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2">
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
                      Processing...
                    </div>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}