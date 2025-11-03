import React from "react"
import { motion } from "framer-motion"
import { User } from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UseFormRegister, FieldErrors, RegisterOptions } from "react-hook-form"

// --- Shared Background Blobs Component ---
export const BgBlobs = React.memo(({
  color = "blue",
}: {
  color?: "green" | "blue" | "red"
}) => {
  // Use static classes to ensure they're included in the build
  const topLeftClass = color === "green" ? "bg-green-600" : color === "red" ? "bg-red-600" : "bg-blue-600"
  const bottomRightClass = color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-blue-500"
  const middleLeftClass = color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-blue-500"

  return (
    <>
      <div
        className={`absolute top-0 left-0 w-32 h-32 ${topLeftClass} rounded-full opacity-10 -translate-x-16 -translate-y-16`}
      />
      <div
        className={`absolute bottom-0 right-0 w-48 h-48 ${bottomRightClass} rounded-full opacity-10 translate-x-24 translate-y-24`}
      />
      <div
        className={`absolute top-1/2 left-0 w-24 h-24 ${middleLeftClass} rounded-full opacity-10 -translate-x-12`}
      />
    </>
  )
})

BgBlobs.displayName = "BgBlobs"

export interface AccountFormData {
  username: string
  password: string
  confirmPassword: string
}

export interface AccountPageProps {
  type: "student" | "faculty" | "staff"
  formData: AccountFormData
  activeTab: string
  passwordError: string | null
  isSubmitting: boolean
  isFormValid: boolean
  onNextClick: () => void
  onBackClick: () => void
  onSubmit: () => void
  register: UseFormRegister<AccountFormData>
  errors: FieldErrors<AccountFormData>
  validationRules: Record<keyof AccountFormData, RegisterOptions<AccountFormData>>
}

export const AccountPageLayout = React.memo(({
  type,
  formData,
  activeTab,
  passwordError,
  isSubmitting,
  isFormValid,
  onNextClick,
  onBackClick,
  onSubmit,
  register,
  errors,
  validationRules
}: AccountPageProps) => {
  const isStudent = type === "student"
  const isFaculty = type === "faculty"
  const isStaff = type === "staff"

  // Set theme color and accent color based on type
  const themeColor = isStudent ? "green" : isStaff ? "red" : "blue"
  const accentColor = isStudent ? "emerald" : isStaff ? "red" : "indigo"
  const titleText = `Create ${isStudent ? "Student" : isFaculty ? "Faculty" : "Staff"} Account`

  // Set background gradient based on type
  const bgGradient = isStudent
    ? "from-green-50 to-emerald-50"
    : isStaff
      ? "from-red-50 to-red-100"
      : "from-blue-50 to-indigo-50"

  return (
    <div className={`min-h-[100dvh] w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative font-['Poppins'] overflow-hidden`}>
      <BgBlobs color={isStudent ? "green" : isStaff ? "red" : "blue"} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-[97%] max-w-lg relative p-5 sm:p-8"
      >
        <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
          <h1 className="text-2xl font-bold text-gray-800">{titleText}</h1>
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
              <div className="flex flex-col gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <Label className="inline-block select-none">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("username", validationRules.username)}
                    id="username"
                    autoComplete="username"
                    placeholder="Enter a username"
                    className={`h-12 sm:h-11 text-base border-2 rounded-lg ${errors.username ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <Label htmlFor="password" className="inline-block select-none">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("password", validationRules.password)}
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter password"
                    className={`h-12 sm:h-11 text-base border-2 rounded-lg ${errors.password ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <Label htmlFor="confirmPassword" className="inline-block select-none">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("confirmPassword", validationRules.confirmPassword)}
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className={`h-12 sm:h-11 text-base border-2 rounded-lg ${errors.confirmPassword || passwordError ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                  />
                </div>
                {passwordError && (
                  <div className="text-red-500 text-sm mt-1">{passwordError}</div>
                )}
              </div>
              <div className="flex mt-4 justify-end">
                <Button
                  type="button"
                  onClick={onNextClick}
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
                <User className={`w-6 h-6 text-${accentColor}-500 mr-2`} />
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
                    {formData.password ? "••••••••" : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${
              isFormValid
                ? `bg-${themeColor}-50 text-${themeColor}-800`
                : 'bg-yellow-50 text-yellow-800'
            }`}>
              {isFormValid ? (
                <span className="text-base">Ready for submission</span>
              ) : (
                <span className="text-base">Please complete all required fields</span>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={onBackClick}
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
                disabled={!isFormValid || isSubmitting}
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
      </motion.div>
    </div>
  )
})

AccountPageLayout.displayName = "AccountPageLayout"