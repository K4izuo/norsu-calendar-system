import React from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { LoginFormData, LOGIN_VALIDATION_RULES } from "@/utils/login/login-validation-rules"
import { showLoginErrorToast } from "@/utils/login/login-field-error-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export const useLoginForm = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const { handleSubmit, watch, formState: { errors }, reset } = form
  const formData = watch()

  const handlePasswordToggle = () => {
    setShowPassword(v => !v)
  }

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      const response = await apiClient.post<{ message?: string }, LoginFormData>(
        "users/login",
        data
      );
      if (response.error) {
        toast.error(response.error, { position: "top-center" })
        return
      }
      toast.success("Login successful!", { position: "top-center" })
      reset()
      setShowPassword(false)
      setRememberMe(false)
      router.replace("/pages/admin/dashboard")
    } catch (error) {
      toast.error("Login failed!", { position: "top-center" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit, (errors) => {
      showLoginErrorToast(errors, formData)
    })()
  }

  return {
    form,
    formData,
    errors,
    showPassword,
    rememberMe,
    isLoading,
    handlePasswordToggle,
    handleRememberMeChange,
    handleSubmit: handleFormSubmit,
    validationRules: LOGIN_VALIDATION_RULES
  }
}