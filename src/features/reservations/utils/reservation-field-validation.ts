import { useState, useEffect } from "react"
import type { ZodType } from "zod"

interface ReservationFieldValidationOptions {
  validateEmpty?: boolean
}

export function useReservationFieldValidation(
  value: string | number,
  schema: ZodType,
  options?: ReservationFieldValidationOptions,
): string {
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!options?.validateEmpty && !value && value !== 0) {
      setError("")
      return
    }

    const result = schema.safeParse(value)
    if (result.success) {
      setError("")
      return
    }

    const errorMessage = result.error.issues[0]?.message || ""

    if (!errorMessage) {
      setError("")
      return
    }

    if (options?.validateEmpty && !value && value !== 0) {
      setError(errorMessage)
      return
    }

    const timeoutId = setTimeout(() => {
      setError(errorMessage)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [value, schema, options?.validateEmpty])

  return error
}
