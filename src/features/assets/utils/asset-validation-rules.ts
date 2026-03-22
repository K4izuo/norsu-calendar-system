import { z } from "zod"

export const assetSchema = z.object({
  asset_name: z
    .string()
    .min(1, "Asset name is required")
    .min(3, "Minimum 3 characters")
    .max(100, "Maximum 100 characters")
    .refine(val => val.trim().length > 0, "Asset name cannot be empty or just whitespace"),
  asset_type: z.string().min(1, "Asset type is required"),
  capacity: z
    .string()
    .min(1, "Capacity is required")
    .refine(val => !isNaN(parseInt(val)), "Capacity must be a valid number")
    .refine(val => parseInt(val) >= 1, "Capacity must be at least 1")
    .refine(val => parseInt(val) <= 10000, "Capacity cannot exceed 10,000"),
  location: z
    .string()
    .min(1, "Location is required")
    .min(3, "Minimum 3 characters")
    .max(200, "Maximum 200 characters")
    .refine(val => val.trim().length > 0, "Location cannot be empty or just whitespace"),
  acquisition_date: z
    .string()
    .min(1, "Acquisition date is required")
    .refine(
      val => !val || new Date(val) <= new Date(),
      { message: `Acquisition date cannot be in the future ${new Date()}` }
    ),
  condition: z.string().min(1, "Condition is required"),
  campus_id: z.string().optional(),
  office_id: z.string().optional(),
})

export type AssetFormData = z.infer<typeof assetSchema>
