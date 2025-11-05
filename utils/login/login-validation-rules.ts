import { RegisterOptions } from "react-hook-form"

export interface LoginFormData {
  username: string
  password: string
}

export const LOGIN_VALIDATION_RULES: Record<keyof LoginFormData, RegisterOptions<LoginFormData>> = {
  username: {
    required: "Username is required",
    minLength: { value: 3, message: "Username must be at least 3 characters long" },
    pattern: { 
      value: /^[a-zA-Z0-9_]+$/, 
      message: "Username can only contain letters, numbers, and underscores" 
    }
  },
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters long" }
  }
} as const