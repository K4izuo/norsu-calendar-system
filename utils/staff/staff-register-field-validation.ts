import { useState, useEffect } from "react"
import type { RegisterOptions } from "react-hook-form"
import type { StaffRegisterFormData } from "@/interface/user-props"

interface ValidationRule {
  minLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  required?: string
}

export function useFieldValidation(
  value: string,
  rules: RegisterOptions<StaffRegisterFormData>
): string {
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!value) {
      setError("")
      return
    }

    const validationRule = rules as ValidationRule
    let errorMessage = ""

    // Check validations immediately
    if (validationRule.minLength && value.length < validationRule.minLength.value) {
      errorMessage = validationRule.minLength.message
    } else if (validationRule.pattern && !validationRule.pattern.value.test(value)) {
      errorMessage = validationRule.pattern.message
    }

    // If valid, clear error immediately
    if (!errorMessage) {
      setError("")
      return
    }

    // If invalid, debounce showing the error
    const timeoutId = setTimeout(() => {
      setError(errorMessage)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [value, rules])

  return error
}