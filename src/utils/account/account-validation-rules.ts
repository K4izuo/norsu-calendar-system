import { RegisterOptions } from "react-hook-form"
import { AccountFormData } from "@/components/user-forms/account/account-page-form"

export const ACCOUNT_VALIDATION_RULES: Record<keyof AccountFormData, RegisterOptions<AccountFormData>> = {
  username: {
    required: "Username field is required",
    minLength: { value: 3, message: "Username must be at least 3 characters long" },
    pattern: { 
      value: /^[a-zA-Z0-9_]+$/, 
      message: "Username can only contain letters, numbers, and underscores" 
    }
  },
  password: {
    required: "Password field is required",
    minLength: { value: 8, message: "Password must be at least 8 characters long" },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  },
  confirmPassword: {
    required: "Please confirm your password field",
    validate: (value, formValues) => 
      value === formValues.password || "Passwords do not match"
  }
} as const