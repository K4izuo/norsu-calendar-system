import { useState, useEffect } from "react"
import type { RegisterOptions } from "react-hook-form"

interface AssetFormData {
  asset_name: string
  asset_type: string
  capacity: string
  location: string
  acquisition_date: string
  condition: string
}

interface ValidationRule {
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  min?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  required?: string
  validate?: (value: string) => boolean | string
}

export function useAssetFieldValidation(
  value: string,
  rules: RegisterOptions<AssetFormData>
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
    } else if (validationRule.maxLength && value.length > validationRule.maxLength.value) {
      errorMessage = validationRule.maxLength.message
    } else if (validationRule.pattern && !validationRule.pattern.value.test(value)) {
      errorMessage = validationRule.pattern.message
    } else if (validationRule.validate) {
      const result = validationRule.validate(value)
      if (typeof result === "string") {
        errorMessage = result
      }
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