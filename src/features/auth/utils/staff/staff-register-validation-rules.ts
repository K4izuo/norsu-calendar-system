import { z } from "zod"

const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/

export const staffSchema = z.object({
  first_name: z.string().min(1, "First name field is required").min(3, "Minimum 3 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  middle_name: z.string().min(1, "Middle name field is required").min(3, "Minimum 3 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  last_name: z.string().min(1, "Last name field is required").min(3, "Minimum 3 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  email: z.string().min(1, "Email field is required").regex(emailPattern, "Please enter a valid email address"),
  assignment_id: z.string().min(1, "Staff ID field is required").min(8, "Minimum 8 characters"),
  campus_id: z.string().min(1, "Campus field is required"),
  office_id: z.string().min(1, "Office field is required"),
  role: z.string(),
})

export const staffWithCredentialsSchema = staffSchema
  .extend({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
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

export type StaffWithCredentialsFormData = z.infer<typeof staffWithCredentialsSchema>
