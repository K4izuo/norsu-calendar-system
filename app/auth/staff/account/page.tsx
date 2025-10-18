"use client"

import React from "react"
// You need to create a useStaffAccountForm hook similar to useAccountRegForm
import { useAccountForm } from "@/hooks/useAccountRegForm"
import { AccountPageLayout } from "@/components/auth-register-form/account-page-form"

export default function StaffAccountPage() {
  const {
    activeTab,
    formData,
    isSubmitting,
    missingFields,
    passwordError,
    isFormValid,
    handleInputChange,
    handleNext,
    handleBack,
    handleSubmit
  } = useAccountForm()

  return (
    <AccountPageLayout
      type="staff"
      formData={formData}
      activeTab={activeTab}
      missingFields={missingFields}
      passwordError={passwordError}
      isSubmitting={isSubmitting}
      isFormValid={isFormValid}
      onInputChange={handleInputChange}
      onNextClick={handleNext}
      onBackClick={handleBack}
      onSubmit={handleSubmit}
    />
  )
}