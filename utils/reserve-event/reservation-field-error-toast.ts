import toast from "react-hot-toast";
import type { FieldErrors } from "react-hook-form";
import type { ReservationFormData } from "@/interface/user-props";

const FIELD_LABELS: Record<string, string> = {
  title_name: "Event title",
  asset: "Asset selection",
  timeEnd: "End time",
  description: "Description",
  peopleTag: "People tag", // Add people tag label
  infoType: "Information type",
  category: "Category",
};

const FORM_FIELDS = ["title_name", "asset", "timeEnd", "description"];
const ADDITIONAL_FIELDS = ["people", "infoType", "category"]; // Put people first for priority

function isMissingField(field: string, values: ReservationFormData): boolean {
  const value = values[field as keyof ReservationFormData];
  
  if (field === "asset") return !value;
  if (field === "timeEnd") return !value || value === values.time_start;
  if (typeof value === "string") return !value.trim();
  return !value;
}

function getErrorMessage(field: string, errors: FieldErrors<ReservationFormData>): string {
  const error = errors[field as keyof ReservationFormData];
  if (error?.message) return error.message as string;
  return `${FIELD_LABELS[field]} is missing`;
}

export function showFormTabErrorToast(
  errors: FieldErrors<ReservationFormData>,
  values: ReservationFormData
) {
  // Find first error in priority order
  const firstErrorField = FORM_FIELDS.find(field => 
    errors[field as keyof ReservationFormData] || isMissingField(field, values)
  );

  if (!firstErrorField) return;

  const message = getErrorMessage(firstErrorField, errors);
  const otherMissingCount = FORM_FIELDS
    .filter(field => field !== firstErrorField && isMissingField(field, values))
    .length;

  if (otherMissingCount > 0) {
    const fieldText = otherMissingCount === 1 ? "field is missing" : "fields are missing";
    toast.error(`${message} and ${otherMissingCount} other ${fieldText}`);
  } else {
    toast.error(message);
  }
}

export function showAdditionalTabErrorToast(
  errors: FieldErrors<ReservationFormData>,
  values: ReservationFormData,
  taggedPeople: { id: string; name: string }[]
) {
  const missingPeople = taggedPeople.length === 0;
  
  // Check for people tag first (highest priority)
  if (missingPeople) {
    const otherMissingCount = ADDITIONAL_FIELDS
      .filter(field => field !== "people" && isMissingField(field, values))
      .length;

    if (otherMissingCount > 0) {
      const fieldText = otherMissingCount === 1 ? "field is missing" : "fields are missing";
      toast.error(`People tag is missing and ${otherMissingCount} other ${fieldText}`);
    } else {
      toast.error("People tag is missing");
    }
    return;
  }
  
  // Then check for form field errors in priority order
  const firstErrorField = ADDITIONAL_FIELDS
    .filter(field => field !== "people") // Exclude people since we checked it above
    .find(field => 
      errors[field as keyof ReservationFormData] || isMissingField(field, values)
    );

  if (firstErrorField) {
    const message = getErrorMessage(firstErrorField, errors);
    const otherMissingCount = ADDITIONAL_FIELDS
      .filter(field => field !== firstErrorField && field !== "people" && isMissingField(field, values))
      .length;

    if (otherMissingCount > 0) {
      const fieldText = otherMissingCount === 1 ? "field is missing" : "fields are missing";
      toast.error(`${message} and ${otherMissingCount} other ${fieldText}`);
    } else {
      toast.error(message);
    }
  }
}