import { RegisterOptions } from "react-hook-form";
import { ReservationFormData } from "@/interface/user-props";

type ValidationRules = {
  [K in keyof ReservationFormData]: RegisterOptions<ReservationFormData, K>;
};

export const RESERVATION_VALIDATION_RULES: ValidationRules = {
  title_name: {
    required: "Event title field is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" }
  },
  asset: {
    required: "Asset field is required",
    validate: (value) => {
      if (!value) return "Please select an asset";
      if (!value.asset_name) return "Asset must have a name";
      return true;
    }
  },
  time_start: {
    required: "Start time field is required"
  },
  time_end: {
    required: "End time field is required",
    validate: {
      afterStart: (value, formValues) => {
        if (!formValues.time_start) return true;
        return value > formValues.time_start || "End time must be after start time";
      }
    }
  },
  description: {
    required: "Description field is required",
    minLength: { value: 10, message: "Description must be at least 10 characters" }
  },
  range: {
    required: "Range field is required",
    min: { value: 1, message: "Range must be at least 1 day" }
  },
  people_tag: {
    required: "At least one person must be tagged"
  },
  info_type: {
    required: "Information type field is required"
  },
  category: {
    required: "Category field is required"
  },
  date: {}
} as const;