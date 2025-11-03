"use client"

import React from "react"
import { AccountPageLayout } from "@/components/user-forms/account/account-page-form"
import { ACCOUNT_VALIDATION_RULES } from "@/utils/account-validation-rules"
import { useAccountForm } from "@/hooks/useAccountFormReg"

export default function StaffAccountPage() {
  const { form, formData, activeTab, isSubmitting, isFormValid, handleNext, handleBack, onSubmit } = useAccountForm()

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
      validationRules={ACCOUNT_VALIDATION_RULES}
    />
  )
}