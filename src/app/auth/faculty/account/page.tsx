"use client"

import React from "react"
import { useAccountForm } from "@/hooks/useAccountRegForm"
import { AccountPageLayout } from "@/components/auth-register-form/AccountPageComponent"

export default function FacultyAccountPage() {
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
      type="faculty"
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