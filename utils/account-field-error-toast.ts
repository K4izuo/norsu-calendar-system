import toast from "react-hot-toast";
import type { FieldErrors } from "react-hook-form";
import type { AccountFormData } from "@/components/user-forms/account/account-page-form";

export const ACCOUNT_FIELD_LABELS: Record<keyof AccountFormData, string> = {
  username: "Username",
  password: "Password",
  confirmPassword: "Confirm Password",
};

export const REQUIRED_ACCOUNT_FIELDS: Array<keyof AccountFormData> = [
  "username",
  "password", 
  "confirmPassword",
];

export function showAccountErrorToast(
  errors: FieldErrors<AccountFormData>,
  values: AccountFormData,
  passwordError: string | null
) {
  // Check for password mismatch first
  if (passwordError) {
    toast.error(passwordError);
    return;
  }

  const missingFields = REQUIRED_ACCOUNT_FIELDS.filter(field => !values[field]);
  if (missingFields.length === REQUIRED_ACCOUNT_FIELDS.length) {
    toast.error("Missing: Please fill up all the required fields.");
    return;
  }

  const errorKeys = Object.keys(errors) as Array<keyof AccountFormData>;

  if (errorKeys.length > 0) {
    const firstErrorKey = errorKeys[0];
    const errorObj = errors[firstErrorKey];
    const message =
      errorObj && typeof errorObj.message === "string"
        ? errorObj.message
        : `Missing or invalid: ${ACCOUNT_FIELD_LABELS[firstErrorKey]}`;

    // Count other missing fields, excluding the first error field if present
    const otherMissingFields = missingFields.filter(field => field !== firstErrorKey);
    const otherMissing = otherMissingFields.length;

    if (otherMissing > 0) {
      toast.error(
        `${message} and ${otherMissing} other${otherMissing > 1 ? "s" : ""} field${otherMissing > 1 ? "s" : ""}`
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
    
    if (otherMissing > 0) {
      toast.error(
        `Missing or invalid: ${ACCOUNT_FIELD_LABELS[firstMissing]} and ${otherMissing} other${otherMissing > 1 ? "s" : ""} field${otherMissing > 1 ? "s" : ""}`
      );
    } else {
      toast.error(`Missing or invalid: ${ACCOUNT_FIELD_LABELS[firstMissing]}`);
    }
  }
}