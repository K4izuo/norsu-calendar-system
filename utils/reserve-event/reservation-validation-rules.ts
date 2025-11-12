export const RESERVATION_VALIDATION_RULES = {
  title: {
    required: "Event title field is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" }
  },
  asset: {
    required: "Asset field is required",
    validate: (value: { id: number; asset_name: string; capacity: number } | null) => {
      if (!value) return "Please select an asset";
      if (!value.asset_name) return "Asset must have a name";
      return true;
    }
  },
  timeStart: {
    required: "Start time field is required"
  },
  timeEnd: {
    required: "End time field is required",
    validate: {
      afterStart: (value: string, formValues: any) => {
        if (!formValues.timeStart) return true;
        return value > formValues.timeStart || "End time must be after start time";
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
  people: {
    required: "At least one person must be tagged"
  },
  infoType: {
    required: "Information type field is required"
  },
  category: {
    required: "Category field is required"
  }
} as const;