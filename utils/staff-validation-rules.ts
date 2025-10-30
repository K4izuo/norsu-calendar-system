export const STAFF_VALIDATION_RULES = {
  name: {
    required: "This field is required",
    minLength: { value: 2, message: "Please input your real name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/,
      message: "Please enter a valid email address"
    }
  },
  staffID: {
    required: "Staff ID is required",
    minLength: { value: 8, message: "Please input your real staff ID" }
  },
  campus: {
    required: "Campus is missing"
  },
  office: {
    required: "Office is missing"
  }
} as const;