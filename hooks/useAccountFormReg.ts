import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { AccountFormData } from "@/components/user-forms/account/account-page-form"
import { ACCOUNT_VALIDATION_RULES } from "@/utils/account/account-validation-rules"
import { showAccountErrorToast } from "@/utils/account/account-field-error-toast"

export function useAccountForm() {
  const [activeTab, setActiveTab] = useState("details")

  const form = useForm<AccountFormData>({
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { handleSubmit, watch, formState: { errors, isSubmitting, isValid }, reset, setError } = form
  const formData = watch()

  const validateAndProceed = useCallback((data: AccountFormData) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match"
      })
      showAccountErrorToast({}, formData, "Passwords do not match")
      return
    }
    setActiveTab("summary")
  }, [formData, setError])

  const handleNext = useCallback(() => {
    handleSubmit(validateAndProceed, (errors) => {
      showAccountErrorToast(errors, formData, null)
    })()
  }, [handleSubmit, validateAndProceed, formData])

  const handleBack = useCallback(() => {
    setActiveTab("details")
  }, [])

  const processSubmission = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Account created successfully!", { position: "top-center" })
      reset()
      setActiveTab("details")
    } catch (error) {
      toast.error("Failed to create account!", { position: "top-center" })
    }
  }, [reset])

  const onSubmit = useCallback(() => {
    handleSubmit(processSubmission, (errors) => {
      showAccountErrorToast(errors, formData, null)
    })()
  }, [handleSubmit, processSubmission, formData])

  return {
    form,
    formData,
    activeTab,
    errors,
    isSubmitting,
    isFormValid: isValid && Boolean(formData.username && formData.password && formData.confirmPassword),
    handleNext,
    handleBack,
    onSubmit,
    validationRules: ACCOUNT_VALIDATION_RULES
  }
}