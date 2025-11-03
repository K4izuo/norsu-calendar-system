import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { AccountFormData } from "@/components/user-forms/account/account-page-form"
// import { ACCOUNT_VALIDATION_RULES } from "@/utils/account-validation-rules"
import { showAccountErrorToast } from "@/utils/account-field-error-toast"
import toast from "react-hot-toast"
import { apiClient } from "@/lib/api-client"

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

  const { handleSubmit, watch, formState: { errors, isSubmitting, isValid }, trigger, reset } = form

  const formData = watch()

  const handleNext = useCallback(async () => {
    const valid = await trigger()
    if (valid) {
      setActiveTab("summary")
    } else {
      showAccountErrorToast(errors, formData, null)
    }
  }, [trigger, errors, formData])

  const handleBack = useCallback(() => {
    setActiveTab("details")
  }, [])

  const onSubmit = useCallback(async (data: AccountFormData) => {
    try {
      const response = await apiClient.post("account/create", {
        username: data.username,
        password: data.password,
      })
      
      if (response.error) {
        toast.error(response.error, { duration: 5000 })
        return
      }
      
      toast.success("Account created successfully!", { duration: 5000 })
      reset()
      setActiveTab("details")
    } catch (error) {
      console.error("Account creation error:", error)
      toast.error("Account creation failed!", { duration: 5000 })
    }
  }, [reset])

  return {
    form,
    formData,
    activeTab,
    isSubmitting,
    isFormValid: isValid && Boolean(formData.username && formData.password && formData.confirmPassword),
    handleNext,
    handleBack,
    onSubmit: handleSubmit(onSubmit),
  }
}