"use client"

import type React from "react"
import { AccountPageLayout } from "@/components/user-forms/account/account-page-form"
import { useAccountForm } from "@/hooks/useAccountFormReg"

export default function StaffAccountPage() {
  const { 
    form, 
    formData, 
    activeTab, 
    errors,
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