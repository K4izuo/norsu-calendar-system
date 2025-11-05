export const FACULTY_VALIDATION_RULES = {
  first_name: {
    required: "First name is missing",
    minLength: { value: 3, message: "Please input your real first name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  middle_name: {
    required: "Middle name is missing",
    minLength: { value: 3, message: "Please input your real middle name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  last_name: {
    required: "Last name is missing",
    minLength: { value: 3, message: "Please input your real last name" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Letters only" }
  },
  email: {
    required: "Email is missing",
    pattern: {
      value: /^[A-Za-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|[a-z]+\.edu\.ph)$/,
      message: "Please enter a valid email address"
    }
  },
  facultyID: {
    required: "Faculty ID is missing",
    minLength: { value: 8, message: "Please input your real faculty ID" }
  },
  campus: {
    required: "Campus is missing"
  },
  college: {
    required: "College is missing"
  },
  course: {
    required: "Course is missing"
  }
} as const;