import { useState, useEffect } from "react"
import type { RegisterOptions } from "react-hook-form"
import type { LoginFormData } from "./login-validation-rules"

interface ValidationRule {
  minLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  required?: string
}

export function useFieldValidation(
  value: string,
  rules: RegisterOptions<LoginFormData>
): string {
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!value) {
      setError("")
      return
    }

    const validationRule = rules as ValidationRule

    // Check minLength
    if (validationRule.minLength && value.length < validationRule.minLength.value) {
      setError(validationRule.minLength.message)
      return
    }

    // Check pattern
    if (validationRule.pattern && !validationRule.pattern.value.test(value)) {
      setError(validationRule.pattern.message)
      return
    }

    setError("")
  }, [value, rules])

  return error
}