import { z } from "zod"

const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/

export const deanSchema = z.object({
  first_name: z.string().min(1, "First name field is required").min(2, "Minimum 2 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  middle_name: z.string().min(1, "Middle name field is required").min(2, "Minimum 2 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  last_name: z.string().min(1, "Last name field is required").min(2, "Minimum 2 characters").regex(/^[A-Za-z\s]+$/, "Letters only"),
  email: z.string().min(1, "Email field is required").regex(emailPattern, "Please enter a valid email address"),
  assignment_id: z.string().min(1, "Dean ID field is required").min(8, "Minimum 8 characters"),
  campus_id: z.string().min(1, "Campus field is required"),
  office_id: z.string().min(1, "Office field is required"),
  role: z.string(),
})
