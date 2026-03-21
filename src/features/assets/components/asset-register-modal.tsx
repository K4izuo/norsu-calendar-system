"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, PackagePlus, Package } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Tabs, TabsContent } from "@/shared/components/ui/tabs"
import { AssetDetailsTab } from "@/features/assets/components/asset-register-tab/asset-form-tab"
import { AssetSummaryTab } from "@/features/assets/components/asset-register-tab/asset-summary-tab"
import { useAssetRegistrationForm } from "@/features/assets/hooks/useAssetRegistrationForm"
import { AssetRegistrationData, AssetRegistrationPayload } from "@/interface/user-props"
import { useCampuses, useOffices, useCreateAsset } from "@/features/calendar/services/academicDataService"
import { useCurrentUser } from "@/shared/components/hooks/useCurrentUser"
import { getUserRole } from "@/core/auth/auth"

const assetTypes = [
  { value: "venue", label: "Venue" },
  // { value: "vehicle", label: "Vehicle" },
  // { value: "equipment", label: "Equipment" },
  // { value: "facility", label: "Facility" },
]

const conditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "under_renovation", label: "Under Renovation" },
]

interface AssetRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: AssetRegistrationPayload) => Promise<void> | void
  editMode?: boolean
  assetData?: AssetRegistrationData
}

export function AssetRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  editMode = false,
  assetData
}: AssetRegistrationModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Get current user data
  const { user } = useCurrentUser()

  // Get role from localStorage as fallback
  const userRoleStr = getUserRole()
  const userRoleNum = userRoleStr ? parseInt(userRoleStr, 10) : user?.role || 0

  // Determine roles - ADJUST THESE NUMBERS BASED ON YOUR SYSTEM
  // Example: 1=student, 2=dean, 3=staff, 4=admin (check your backend/database)
  const isAdmin = userRoleNum === 4
  const isDeanOrStaff = userRoleNum === 2 || userRoleNum === 3

  // These hooks will return cached data instantly if prefetched
  const { campuses, loading: loadingCampuses, error: campusError } = useCampuses()
  const { offices, loading: loadingOffices, error: officeError } = useOffices()
  const { mutateAsync: createAsset, isPending: isCreating } = useCreateAsset()

  const handleAssetSubmit = async (data: AssetRegistrationPayload) => {
    if (onSubmit) {
      await onSubmit(data)
    } else {
      await createAsset(data)
    }
  }

  const {
    control,
    errors,
    isSubmitting,
    register,
    watch,
    handleFormSubmit,
    getValues,
    activeTab,
    setActiveTab,
    isFormValid,
    handleDetailsTabNext,
  } = useAssetRegistrationForm({
    onSubmit: handleAssetSubmit,
    onClose,
    isOpen,
    editMode,
    assetData,
    defaultCampusId: isDeanOrStaff ? user?.campus_id : undefined,
    defaultOfficeId: isDeanOrStaff ? user?.office_id : undefined,
    isAdmin,
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const tabOrder: ("details" | "summary")[] = ["details", "summary"]
  const tabLabels: Record<"details" | "summary", string> = {
    details: "Asset Details",
    summary: "Summary",
  }

  const isLoading = onSubmit ? isSubmitting : (isSubmitting || isCreating)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
          }}
        />

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            type: "tween",
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative w-full max-w-2xl sm:mx-4 mx-px max-h-[92vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Package strokeWidth={2.5} className="w-8 h-8 text-gray-800" />
                ) : (
                  <PackagePlus strokeWidth={2.5} className="w-8 h-8 text-gray-800" />
                )}
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                  {editMode ? "Update Asset" : "Register Asset"}
                </h2>
              </div>
              <Button
                onClick={e => {
                  e.stopPropagation()
                  onClose()
                }}
                size="sm"
                className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>

          <form className="flex flex-col flex-1" onSubmit={handleFormSubmit}>
            <div className="overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4 flex-1 max-h-[calc(91vh-155px)]">
              <Tabs value={activeTab} className="w-full">
                <div className="grid grid-cols-2 mb-4 sm:mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
                  {tabOrder.map(tab => (
                    <div
                      key={tab}
                      className={`flex items-center justify-center py-2 px-2 sm:py-2.5 sm:px-4 rounded-md text-base font-medium transition-colors ${activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                        }`}
                      style={{ cursor: "default", minWidth: "100px" }}
                    >
                      {tabLabels[tab]}
                    </div>
                  ))}
                </div>

                <TabsContent value="details" className="space-y-4 sm:space-y-6">
                  <AssetDetailsTab
                    control={control}
                    errors={errors}
                    register={register}
                    watch={watch}
                    assetTypes={assetTypes}
                    conditionOptions={conditionOptions}
                    campuses={campuses}
                    offices={offices}
                    loadingCampuses={loadingCampuses}
                    loadingOffices={loadingOffices}
                    campusError={campusError}
                    officeError={officeError}
                    isAdmin={isAdmin}
                  // isDeanOrStaff={isDeanOrStaff} i uncomment ni if needed
                  // userCampusId={user?.campus_id}
                  // userOfficeId={user?.office_id}
                  />
                </TabsContent>

                <TabsContent value="summary" className="space-y-4 sm:space-y-6">
                  <AssetSummaryTab
                    formData={getValues()}
                    assetTypes={assetTypes}
                    conditionOptions={conditionOptions}
                    campuses={campuses}
                    offices={offices}
                    isFormValid={isFormValid()}
                    isAdmin={isAdmin}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-end">
              {activeTab === "details" && (
                <Button
                  type="button"
                  onClick={handleDetailsTabNext}
                  variant="default"
                  className="text-base cursor-pointer py-2.5"
                >
                  Next
                </Button>
              )}
              {activeTab === "summary" && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    variant="outline"
                    className="text-base cursor-pointer py-2.5"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isLoading}
                    className="text-base cursor-pointer py-2.5"
                  >
                    {isLoading ? (
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
                      editMode ? "Update Asset" : "Register Asset"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}