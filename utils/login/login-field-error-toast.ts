import toast from "react-hot-toast"
import type { FieldErrors } from "react-hook-form"
import type { LoginFormData } from "@/utils/login/login-validation-rules"

export const LOGIN_FIELD_LABELS: Record<keyof LoginFormData, string> = {
  username: "Username",
  password: "Password",
}

export const REQUIRED_LOGIN_FIELDS: Array<keyof LoginFormData> = [
  "username",
  "password",
]

export function showLoginErrorToast(
  errors: FieldErrors<LoginFormData>,
  values: LoginFormData
) {
  const missingFields = REQUIRED_LOGIN_FIELDS.filter(field => !values[field])
  
  if (missingFields.length === REQUIRED_LOGIN_FIELDS.length) {
    toast.error("Please fill up all the required fields.", { position: "top-center" })
    return
  }

  const errorKeys = Object.keys(errors) as Array<keyof LoginFormData>

  if (errorKeys.length > 0) {
    const firstErrorKey = errorKeys[0]
    const errorObj = errors[firstErrorKey]
    const message =
      errorObj && typeof errorObj.message === "string"
        ? errorObj.message
        : `${LOGIN_FIELD_LABELS[firstErrorKey]} is required`

    toast.error(message, { position: "top-center" })
    return
  }

  if (missingFields.length > 0) {
    const firstMissing = missingFields[0]
    toast.error(`${LOGIN_FIELD_LABELS[firstMissing]} is required`, { position: "top-center" })
  }
}