import toast from "react-hot-toast";
import type { FieldErrors } from "react-hook-form";
import type { StudentRegisterFormData } from "@/interface/user-props";

export const FIELD_LABELS: Record<keyof StudentRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  assignment_id: "Student ID",
  campus_id: "Campus",
  college_id: "College",
  degree_course_id: "Course",
  role: "Role",
};

export const REQUIRED_FIELDS: Array<keyof StudentRegisterFormData> = [
  "first_name",
  "middle_name",
  "last_name",
  "email",
  "assignment_id",
  "campus_id",
  "college_id",
  "degree_course_id",
  "role",
];

export const SELECT_FIELDS = [
  "campus_id",
  "college_id",
  "degree_course_id",
] as const;

export function showFieldErrorToast(
  errors: FieldErrors<StudentRegisterFormData>,
  values: StudentRegisterFormData
) {
  const missingFields = REQUIRED_FIELDS.filter(field => !values[field]);
  if (missingFields.length === REQUIRED_FIELDS.length) {
    toast.error("Missing: Please fill up all the required fields.");
    return;
  }

  const errorKeys = Object.keys(errors) as Array<keyof StudentRegisterFormData>;

  if (errorKeys.length > 0) {
    const firstErrorKey = errorKeys[0];
    const errorObj = errors[firstErrorKey];
    const message =
      errorObj && typeof errorObj.message === "string"
        ? errorObj.message
        : `Missing or invalid: ${FIELD_LABELS[firstErrorKey]}`;

    // Count other missing fields, excluding the first error field if present
    const otherMissingFields = missingFields.filter(field => field !== firstErrorKey);
    const otherMissing = otherMissingFields.length;

    // Determine field type for message
    const isSelect = SELECT_FIELDS.includes(firstErrorKey as typeof SELECT_FIELDS[number]);
    const fieldType = isSelect ? "select field" : "input field";

    if (otherMissing > 0) {
      toast.error(
        `${message} and ${otherMissing} other${otherMissing > 1 ? "s" : ""} ${fieldType}${otherMissing > 1 ? "s" : ""}`
      );
    } else {
      toast.error(message);
    }
    return;
  }

  // Or show the first missing field if any
  if (missingFields.length > 0) {
    const firstMissing = missingFields[0];
    const otherMissingFields = missingFields.slice(1);
    const otherMissing = otherMissingFields.length;
    const isSelect = SELECT_FIELDS.includes(firstMissing as typeof SELECT_FIELDS[number]);
    const fieldType = isSelect ? "select field" : "input field";
    if (otherMissing > 0) {
      toast.error(
        `Missing or invalid: ${FIELD_LABELS[firstMissing]} and ${otherMissing} other${otherMissing > 1 ? "s" : ""} ${fieldType}${otherMissing > 1 ? "s" : ""}`
      );
    } else {
      toast.error(`Missing or invalid: ${FIELD_LABELS[firstMissing]}`);
    }
  }
}