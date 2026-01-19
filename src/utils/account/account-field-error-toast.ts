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
  const missingFields = REQUIRED_ACCOUNT_FIELDS.filter(field => !values[field]);
  
  if (missingFields.length === REQUIRED_ACCOUNT_FIELDS.length) {
    toast.error("Please fill up all the required fields.", { position: "top-center" });
    return;
  }

  if (passwordError) {
    toast.error(passwordError, { position: "top-center" });
    return;
  }

  const errorKeys = Object.keys(errors) as Array<keyof AccountFormData>;

  if (errorKeys.length > 0) {
    const firstErrorKey = errorKeys[0];
    const errorObj = errors[firstErrorKey];
    const message =
      errorObj && typeof errorObj.message === "string"
        ? errorObj.message
        : `${ACCOUNT_FIELD_LABELS[firstErrorKey]} is required`;

    toast.error(message, { position: "top-center" });
    return;
  }

  if (missingFields.length > 0) {
    const firstMissing = missingFields[0];
    toast.error(`${ACCOUNT_FIELD_LABELS[firstMissing]} is required`, { position: "top-center" });
  }
}