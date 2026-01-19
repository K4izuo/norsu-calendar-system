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
  color?: "blue" | "purple"
}) => {
  // Use static classes to ensure they're included in the build
  const topLeftClass = color === "purple" ? "bg-purple-600" : "bg-blue-600"
  const topRightClass = color === "purple" ? "bg-purple-500" : "bg-blue-500"
  const bottomLeftClass = color === "purple" ? "bg-purple-400" : "bg-blue-400"
  const bottomRightClass = color === "purple" ? "bg-purple-500" : "bg-blue-500"

  return (
    <>
      <div className={`absolute top-0 left-0 w-48 h-48 ${topLeftClass} rounded-full opacity-20 -translate-x-24 -translate-y-24`}></div>
      <div className={`absolute top-0 right-0 w-48 h-48 ${topRightClass} rounded-full opacity-10 translate-x-24 -translate-y-24`}></div>
      <div className={`absolute bottom-0 right-0 w-48 h-48 ${bottomRightClass} rounded-full opacity-20 translate-x-24 translate-y-24`}></div>
      <div className={`absolute bottom-0 left-0 w-48 h-48 ${bottomLeftClass} rounded-full opacity-20 -translate-x-24 translate-y-24`}></div>
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
  type: "dean" | "staff"
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
  
  // Theme configuration
  const themeConfig = {
    dean: {
      color: "blue",
      accentColor: "indigo", 
      bgGradient: "from-blue-50 to-indigo-50"
    },
    staff: {
      color: "purple",
      accentColor: "purple",
      bgGradient: "from-purple-50 to-purple-100"
    }
  }

  const theme = themeConfig[type]
  const titleText = `Create ${type === "dean" ? "dean" : "Staff"} Account`

  const getInputBorderClass = (fieldName: keyof AccountFormData) => {
    const hasError = errors[fieldName] || (fieldName === "confirmPassword" && passwordError)
    return hasError ? "border-red-400" : "border-gray-200"
  }

  const TabIndicator = ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => (
    <div
      className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
        isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
      }`}
      style={{ cursor: "default", minWidth: "100px" }}
    >
      {children}
    </div>
  )

  const FormField = ({ 
    name, 
    label, 
    type = "text", 
    placeholder 
  }: { 
    name: keyof AccountFormData
    label: string
    type?: string
    placeholder: string 
  }) => (
    <div className="flex-1 flex flex-col gap-1">
      <Label className="inline-block select-none">
        {label} <span className="text-red-500">*</span>
      </Label>
      <Input
        {...register(name, validationRules[name])}
        id={name}
        type={type}
        autoComplete={name === "username" ? "username" : "new-password"}
        placeholder={placeholder}
        className={`h-12 sm:h-11 text-base border-2 rounded-lg ${getInputBorderClass(name)} focus:border-ring`}
      />
    </div>
  )

  return (
    <div className={`min-h-dvh w-full bg-linear-to-br ${theme.bgGradient} flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative font-['Poppins'] overflow-hidden`}>
      <BgBlobs color={theme.color as "blue" | "purple"} />
      
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
            <TabIndicator isActive={activeTab === "details"}>Account Details</TabIndicator>
            <TabIndicator isActive={activeTab === "summary"}>Summary</TabIndicator>
          </div>
          <TabsContent value="details" className="space-y-6">
            <form className="flex flex-col gap-y-5" onSubmit={(e) => { e.preventDefault(); onNextClick(); }}>
              <div className="flex flex-col gap-4">
                <FormField 
                  name="username" 
                  label="Username" 
                  placeholder="Enter a username" 
                />
                <FormField 
                  name="password" 
                  label="Password" 
                  type="password" 
                  placeholder="Enter password" 
                />
                <FormField 
                  name="confirmPassword" 
                  label="Confirm Password" 
                  type="password" 
                  placeholder="Re-enter password" 
                />
                {passwordError && (
                  <div className="text-red-500 text-sm mt-1">{passwordError}</div>
                )}
              </div>
              <div className="flex mt-4 justify-end">
                <Button
                  type="submit"
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
                <User className={`w-6 h-6 text-${theme.accentColor}-500 mr-2`} />
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
                ? `bg-${theme.color}-50 text-${theme.color}-800`
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