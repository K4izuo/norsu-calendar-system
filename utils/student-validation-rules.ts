export const STUDENT_VALIDATION_RULES = {
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
  studentId: {
    required: "Student ID is required",
    minLength: { value: 8, message: "Please input your real student ID" }
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