"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface AccountFormData {
  username: string
  password: string
  confirmPassword: string
}

export default function StudentAccountPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState<AccountFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({})
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMissingFields(prev => {
      if (prev[name]) {
        const updated = { ...prev }
        delete updated[name]
        return updated
      }
      return prev
    })
    if (name === "password" || name === "confirmPassword") {
      setPasswordError(null)
      // Debounce password error check
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        if (
          formData.password &&
          formData.confirmPassword &&
          name === "confirmPassword" // Only check after confirmPassword changes
        ) {
          if (value !== formData.password) {
            setPasswordError("Passwords do not match")
          } else {
            setPasswordError(null)
          }
        }
        if (
          name === "password" &&
          formData.confirmPassword &&
          value !== formData.confirmPassword
        ) {
          setPasswordError("Passwords do not match")
        }
      }, 600)
    }
  }

  const checkFormFields = () => {
    const missing: Record<string, boolean> = {}
    if (!formData.username.trim()) missing.username = true
    if (!formData.password.trim()) missing.password = true
    if (!formData.confirmPassword.trim()) missing.confirmPassword = true
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match")
      missing.password = true
      missing.confirmPassword = true
    }
    setMissingFields(missing)
    if (Object.keys(missing).length > 0) {
      Object.keys(missing).forEach((field, i) => {
        setTimeout(() => toast.error(`Missing or invalid: ${field}`), i * 200)
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkFormFields()) return
    setIsSubmitting(true)
    const toastId = toast.loading("Creating account...")
    await new Promise(r => setTimeout(r, 1500))
    toast.success("Account created successfully!", { id: toastId })
    setIsSubmitting(false)
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
    })
    setTimeout(() => setActiveTab("details"), 300)
  }

  const isFormValid = () =>
    formData.username.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.password === formData.confirmPassword

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-600 rounded-full opacity-10 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500 rounded-full opacity-10 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-green-500 rounded-full opacity-10 -translate-x-12"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-lg relative p-2 sm:p-0"
      >
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Create Student Account</h1>
            <p className="text-gray-600 text-sm">Set your username and password to activate your account</p>
          </div>
          <Tabs value={activeTab} className="w-full">
            <div className="grid grid-cols-2 mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={{ cursor: "default", minWidth: "100px" }}
              >
                Account Details
              </div>
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "summary"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={{ cursor: "default", minWidth: "100px" }}
              >
                Summary
              </div>
            </div>
            <TabsContent value="details" className="space-y-6">
              <form className="flex flex-col gap-y-5" onSubmit={e => e.preventDefault()}>
                <div className="flex flex-col gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="username" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Username <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      autoComplete="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.username ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="password" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Password <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.password ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="confirmPassword" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Confirm Password <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.confirmPassword ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  {passwordError && (
                    <div className="text-red-500 text-sm mt-1">{passwordError}</div>
                  )}
                </div>
                <div className="flex mt-2 justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      if (checkFormFields()) setActiveTab("summary")
                    }}
                    variant="default"
                    className="text-base cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="summary" className="space-y-6">
              <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <User className="w-6 h-6 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">Account Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-gray-500">Username</p>
                    <p className="font-medium text-base">{formData.username || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Password</p>
                    <p className="font-medium text-base">
                      {formData.password || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${
                isFormValid()
                  ? 'bg-green-50 text-green-800'
                  : 'bg-yellow-50 text-yellow-800'
              }`}>
                {isFormValid() ? (
                  <span className="text-base">Ready for submission</span>
                ) : (
                  <span className="text-base">Please complete all required fields</span>
                )}
              </div>
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
                  onClick={handleSubmit}
                  variant="default"
                  disabled={!isFormValid() || isSubmitting}
                  className="text-base cursor-pointer py-2.5"
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
                    "Submit Account"
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