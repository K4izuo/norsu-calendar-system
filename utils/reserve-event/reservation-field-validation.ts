import { useState, useEffect } from "react"
import type { RegisterOptions } from "react-hook-form"
import { ReservationFormData } from "@/interface/user-props"

interface ValidationRule {
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  min?: { value: number; message: string }
  max?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  required?: string
  validate?: (value: string | number) => boolean | string
}

export function useReservationFieldValidation<T extends keyof ReservationFormData>(
  value: string | number,
  rules: RegisterOptions<ReservationFormData, T>
): string {
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!value && value !== 0) {
      setError("")
      return
    }

    const validationRule = rules as unknown as ValidationRule
    let errorMessage = ""

    const stringValue = String(value)

    // Check validations immediately
    if (validationRule.minLength && stringValue.length < validationRule.minLength.value) {
      errorMessage = validationRule.minLength.message
    } else if (validationRule.maxLength && stringValue.length > validationRule.maxLength.value) {
      errorMessage = validationRule.maxLength.message
    } else if (validationRule.min && Number(value) < validationRule.min.value) {
      errorMessage = validationRule.min.message
    } else if (validationRule.max && Number(value) > validationRule.max.value) {
      errorMessage = validationRule.max.message
    } else if (validationRule.pattern && !validationRule.pattern.value.test(stringValue)) {
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