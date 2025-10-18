import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

export type StaffRegisterFormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  staffID: string;
  campus_id: string;
  office_id: string;
};

const FIELD_LABELS: Record<keyof StaffRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  staffID: "Staff ID",
  campus_id: "Campus",
  office_id: "Office",
};

const INITIAL_FORM_STATE: StaffRegisterFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  staffID: "",
  campus_id: "",
  office_id: "",
};

export function StaffRegistrationSubmission() {
  const [formData, setFormData] = useState<StaffRegisterFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<Partial<Record<keyof StaffRegisterFormData, boolean>>>({});

  const handleFieldChange = useCallback((name: keyof StaffRegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setMissingFields(prev => {
      if (!prev[name]) return prev;
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof StaffRegisterFormData, value);
  }, [handleFieldChange]);

  const validateForm = useCallback(() => {
    const missing: Partial<Record<keyof StaffRegisterFormData, boolean>> = {};

    if (!formData.first_name.trim()) missing.first_name = true;
    if (!formData.middle_name.trim()) missing.middle_name = true;
    if (!formData.last_name.trim()) missing.last_name = true;
    if (!formData.staffID.trim()) missing.staffID = true;
    if (!formData.campus_id) missing.campus_id = true;
    if (!formData.office_id) missing.office_id = true;
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true;

    setMissingFields(missing);

    const errorCount = Object.keys(missing).length;
    if (errorCount > 0) {
      Object.keys(missing).forEach((field, i) => {
        const key = field as keyof StaffRegisterFormData;
        setTimeout(() => toast.error(`Missing or invalid: ${FIELD_LABELS[key]}`), i * 200);
      });
      return false;
    }

    return true;
  }, [formData]);

  const submitForm = useCallback(async (validateOnly = false) => {
    if (!validateForm()) return false;
    if (validateOnly) return true;

    setIsSubmitting(true);
    const toastId = toast.loading("Registering staff...", { duration: Infinity });

    try {
      const response = await apiClient.post<{ message?: string }, StaffRegisterFormData>(
        "users/store-staff",
        formData
      );

      if (response.error) {
        const errorMessage = response.error.toLowerCase().includes("email") &&
          response.error.toLowerCase().includes("already")
          ? "Email is already registered."
          : response.error;

        toast.error(errorMessage, { id: toastId, duration: 5000 });
        setIsSubmitting(false);
        return false;
      }

      if (!response.data) {
        toast.error("Registration could not be confirmed", { id: toastId, duration: 5000 });
        setIsSubmitting(false);
        return false;
      }

      toast.success(response.data.message || "Registration successful!", { id: toastId, duration: 5000 });
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      toast.error("Registration failed!", { id: toastId, duration: 5000 });
      setIsSubmitting(false);
      return false;
    }
  }, [formData, validateForm]);

  const isFormValid = useCallback(() => {
    return Boolean(
      formData.first_name.trim() &&
      formData.middle_name.trim() &&
      formData.last_name.trim() &&
      formData.email.trim() &&
      formData.email.includes("@") &&
      formData.staffID.trim() &&
      formData.campus_id &&
      formData.office_id
    );
  }, [formData]);

  return {
    formData,
    setFormData,
    missingFields,
    isSubmitting,
    handleInputChange,
    handleSelectChange: handleFieldChange,
    handleSubmit: submitForm,
    isFormValid,
  };
}