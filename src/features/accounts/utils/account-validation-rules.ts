import { z } from "zod"

const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/

export const accountUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters long"),
  last_name: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters long"),
  email: z.string().min(1, "Email field is required").regex(emailPattern, "Please enter a valid email address"),
  campus_id: z.string().optional(),
})

export const accountLoginSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username field is required")
      .min(3, "Username must be at least 3 characters long")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
      .string()
      .min(1, "Password field is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password field"),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })
