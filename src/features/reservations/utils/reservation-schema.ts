import { z } from "zod";

const reservationBaseSchema = z.object({
  title_name: z
    .string()
    .min(1, "Event title field is required")
    .min(3, "Title must be at least 3 characters"),

  // asset may be undefined when nothing is selected (defaultValues: undefined)
  // .optional() so Zod accepts undefined; presence is enforced in superRefine.
  asset: z
    .object({
      id: z.coerce.number(),
      asset_name: z.string(),
      capacity: z.coerce.number(),
      facilities: z.array(z.string()).optional(),
      asset_type: z.string().optional(),
    })
    .optional(),

  time_start: z.string().min(1, "Start time field is required"),

  time_end: z.string().min(1, "End time field is required"),

  description: z
    .string()
    .min(1, "Description field is required")
    .min(10, "Description must be at least 10 characters"),

  // range is stored as "" (empty string) or number via the Controller onChange
  range: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z
      .number({ error: "Day(s) field is required" })
      .min(1, "Day(s) must be at least 1 day")
  ),

  people_tag: z
    .string()
    .min(1, "At least one person must be tagged")
    .min(3, "People tag must be at least 3 characters"),

  info_type: z.string().min(1, "Information type field is required"),

  category: z.string().min(1, "Category field is required"),

  date: z.string(),
});

export const reservationSchema = reservationBaseSchema.superRefine((data, ctx) => {
  // Mirrors asset RegisterOptions: required + validate({ asset_name })
  if (!data.asset) {
    ctx.addIssue({
      code: "custom",
      message: "Asset field is required",
      path: ["asset"],
    });
  } else if (!data.asset.asset_name) {
    ctx.addIssue({
      code: "custom",
      message: "Asset must have a name",
      path: ["asset"],
    });
  }

  // Mirrors time_end RegisterOptions validate.afterStart
  if (data.time_start && data.time_end && data.time_end <= data.time_start) {
    ctx.addIssue({
      code: "custom",
      message: "End time must be after start time",
      path: ["time_end"],
    });
  }
});

// Individual field schemas for real-time debounced validation
export const reservationFieldSchemas = reservationBaseSchema.shape;
