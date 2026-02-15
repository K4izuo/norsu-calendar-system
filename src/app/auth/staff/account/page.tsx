"use client"

import type React from "react"
import { AccountPageLayout } from "@/features/accounts/components/account-page-form"
import { useAccountForm } from "@/features/accounts/hooks/useAccountFormReg"

export default function StaffAccountPage() {
  const { 
    form, 
    formData, 
    activeTab, 
    isSubmitting, 
    isFormValid, 
    handleNext, 
    handleBack, 
    onSubmit,
    validationRules
  } = useAccountForm()

  return (
    <AccountPageLayout
      type="staff"
      formData={formData}
      activeTab={activeTab}
      passwordError={null}
      isSubmitting={isSubmitting}
      isFormValid={isFormValid}
      onNextClick={handleNext}
      onBackClick={handleBack}
      onSubmit={onSubmit}
      register={form.register}
      errors={form.formState.errors}
      validationRules={validationRules}
    />
  )
}