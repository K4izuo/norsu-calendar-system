// filepath: c:\Projects\norsu-calendar-system\src\hooks\useAccountForm.ts
import { useState, useRef, useCallback, useMemo } from "react"
import toast from "react-hot-toast"
import { AccountFormData } from "@/components/auth-register-form/AccountPageComponent"

export const useAccountForm = () => {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState<AccountFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({})
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    setMissingFields(prev => {
      if (prev[name]) {
        const updated = { ...prev }
        delete updated[name]
        return updated
      }
      return prev
    })
    
    if (name === "password" || name === "confirmPassword") {
      setPasswordError(null)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      
      typingTimeout.current = setTimeout(() => {
        setFormData(current => {
          if (
            (name === "confirmPassword" && current.password && value !== current.password) ||
            (name === "password" && current.confirmPassword && value !== current.confirmPassword)
          ) {
            setPasswordError("Passwords do not match")
          }
          return current
        })
      }, 600)
    }
  }, [])

  const checkFormFields = useCallback(() => {
    const missing: Record<string, boolean> = {}
    if (!formData.username.trim()) missing.username = true
    if (!formData.password.trim()) missing.password = true
    if (!formData.confirmPassword.trim()) missing.confirmPassword = true
    
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError("Passwords do not match")
      missing.password = true
      missing.confirmPassword = true
    }
    
    setMissingFields(missing)
    
    if (Object.keys(missing).length > 0) {
      Object.keys(missing).forEach((field, i) => {
        setTimeout(() => toast.error(`Missing or invalid: ${field}`), i * 200)
      })
      return false
    }
    return true
  }, [formData])

  const handleNext = useCallback(() => {
    if (checkFormFields()) setActiveTab("summary")
  }, [checkFormFields])

  const handleBack = useCallback(() => {
    setActiveTab("details")
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!checkFormFields()) return
    setIsSubmitting(true)
    const toastId = toast.loading("Creating account...")
    
    try {
      await new Promise(r => setTimeout(r, 1500)) // Simulating API call
      toast.success("Account created successfully!", { id: toastId })
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
      })
      setTimeout(() => setActiveTab("details"), 300)
    } catch (error) {
      toast.error("Something went wrong", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }, [checkFormFields])

  // Make sure this returns a boolean value
  const isFormValid = useMemo((): boolean => {
    return Boolean(
      formData.username.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword
    )
  }, [formData])

  return {
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
  }
}