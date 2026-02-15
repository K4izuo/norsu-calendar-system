export const ASSET_VALIDATION_RULES = {
  asset_name: {
    required: "Asset name is required",
    minLength: { value: 3, message: "Minimum 3 characters" },
    maxLength: { value: 100, message: "Maximum 100 characters" },
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return "Asset name cannot be empty or just whitespace";
      }
      return true;
    },
  },
  asset_type: {
    required: "Asset type is required",
  },
  capacity: {
    required: "Capacity is required",
    validate: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num)) {
        return "Capacity must be a valid number";
      }
      if (num < 1) {
        return "Capacity must be at least 1";
      }
      if (num > 10000) {
        return "Capacity cannot exceed 10,000";
      }
      return true;
    },
  },
  location: {
    required: "Location is required",
    minLength: { value: 3, message: "Minimum 3 characters" },
    maxLength: { value: 200, message: "Maximum 200 characters" },
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return "Location cannot be empty or just whitespace";
      }
      return true;
    },
  },
  acquisition_date: {
    required: "Acquisition date is required",
    validate: (value: string) => {
      if (!value) {
        return "Acquisition date is required";
      }
      const selectedDate = new Date(value);
      const today = new Date();

      if (selectedDate > today) {
        return "Acquisition date cannot be in the future " + today;
      }
      return true;
    },
  },
  condition: {
    required: "Condition is required",
  },
} as const;