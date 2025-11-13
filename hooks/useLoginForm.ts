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

  const { handleSubmit, watch, formState: { errors }, reset, setError } = form
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
      const response = await apiClient.post<{ token: string, user: any, role?: number }, LoginFormData>(
        "/users/login",
        data
      );

      if (response.error) {
        // Parse Laravel validation errors
        const errorMessage = response.error;
        
        // Check if it's a validation error with field-specific messages
        if (response.status === 422 && response.data) {
          const validationErrors = response.data as any;
          
          // Handle username error
          if (validationErrors.errors?.username) {
            setError('username', { 
              type: 'manual', 
              message: validationErrors.errors.username[0] 
            });
            toast.error('Invalid username', { position: "top-center" });
            return;
          }
          
          // Handle password error
          if (validationErrors.errors?.password) {
            setError('password', { 
              type: 'manual', 
              message: validationErrors.errors.password[0] 
            });
            toast.error('Invalid password', { position: "top-center" });
            return;
          }
        }
        
        // Check if error message contains specific field information
        if (errorMessage.toLowerCase().includes('username')) {
          setError('username', { type: 'manual', message: errorMessage });
          toast.error('Invalid username', { position: "top-center" });
        } else if (errorMessage.toLowerCase().includes('password')) {
          setError('password', { type: 'manual', message: errorMessage });
          toast.error('Invalid password', { position: "top-center" });
        } else {
          // Generic error for both fields or unknown error
          toast.error('The provided credentials are incorrect.', { position: "top-center" });
        }
        
        return;
      }

      toast.success("Login successful!", { position: "top-center" })
      
      // Token and role are already set in apiClient
      const role = response.data?.role;
      
      // Force refresh to trigger middleware with new token
      router.refresh();
      
      switch(role) {
        case 2: router.replace("/pages/faculty/dashboard"); break;
        case 3: router.replace("/pages/staff/dashboard"); break;
        case 4: router.replace("/pages/admin/dashboard"); break;
        default: router.replace("/pages/admin/dashboard"); break;
      }
      
      reset()
      setShowPassword(false)
      setRememberMe(false)

    } catch (error) {
      toast.error("Login failed! Please try again.", { position: "top-center" })
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