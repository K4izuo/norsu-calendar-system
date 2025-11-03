import { RegisterOptions } from "react-hook-form"
import { AccountFormData } from "@/components/user-forms/account/account-page-form"

export const ACCOUNT_VALIDATION_RULES: Record<keyof AccountFormData, RegisterOptions<AccountFormData>> = {
  username: {
    required: "Username is missing",
    minLength: { value: 3, message: "Username must be at least 3 characters" },
    pattern: { 
      value: /^[A-Za-z0-9._-]+$/, 
      message: "Username can only contain letters, numbers, dots, hyphens, and underscores" 
    }
  },
  password: {
    required: "Password is missing",
    minLength: { value: 8, message: "Password must be at least 8 characters" },
    pattern: { 
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: "Password must contain uppercase, lowercase, number, and special character"
    }
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value, formValues) => 
      value === formValues.password || "Passwords do not match"
  }
} as const