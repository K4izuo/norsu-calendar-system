import { useState, useEffect } from "react"
import type { ZodType } from "zod"

export function useFieldValidation(value: string, schema: ZodType): string {
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!value) {
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

    const timeoutId = setTimeout(() => {
      setError(errorMessage)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [value, schema])

  return error
}
