export const RESERVATION_VALIDATION_RULES = {
  title: {
    required: "Event title is missing",
    minLength: { value: 3, message: "Event title must be at least 3 characters" }
  },
  asset: {
    required: "Asset selection is missing",
    validate: (value: any) => value !== null || "Asset selection is missing"
  },
  timeStart: {
    required: "Start time is missing"
  },
  timeEnd: {
    required: "End time is missing",
    validate: (value: string, formValues: any) => {
      if (!value) return "End time is missing";
      if (!formValues.timeStart) return true;
      return value > formValues.timeStart || "End time must be greater than start time";
    }
  },
  description: {
    required: "Description is missing",
    minLength: { value: 10, message: "Description must be at least 10 characters" }
  },
  range: {
    required: "Range is missing",
    min: { value: 1, message: "Range must be at least 1 day" },
    validate: (value: any) => {
      if (!value) return "Range is missing";
      return value >= 1 || "Range must be at least 1 day";
    }
  },
  infoType: {
    required: "Information type is missing"
  },
  category: {
    required: "Category is missing"
  },
  people: {
    required: "People tag is missing",
    validate: (value: string) => {
      if (!value || value.trim() === "") return "People tag is missing";
      return true;
    }
  }
} as const;