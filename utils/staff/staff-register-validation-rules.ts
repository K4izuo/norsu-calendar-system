export const STAFF_VALIDATION_RULES = {
  first_name: {
    required: "First name field is required",
    minLength: { value: 3, message: "Please input your real first name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  middle_name: {
    required: "Middle name field is required",
    minLength: { value: 3, message: "Please input your real middle name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  last_name: {
    required: "Last name field is required",
    minLength: { value: 3, message: "Please input your real last name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  email: {
    required: "Email field is required",
    pattern: {
      value: /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/,
      message: "Please enter a valid email address"
    }
  },
  staffID: {
    required: "Staff ID field is required",
    minLength: { value: 8, message: "Please input your real staff ID" }
  },
  campus: {
    required: "Campus field is required"
  },
  office: {
    required: "Office field is required"
  }
} as const;