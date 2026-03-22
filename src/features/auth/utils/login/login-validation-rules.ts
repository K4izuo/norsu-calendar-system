import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username field is required")
    .min(3, "Username must be at least 3 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(1, "Password field is required")
    .min(8, "Password must be at least 8 characters long"),
})

export type LoginFormData = z.infer<typeof loginSchema>
