import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { DeanRegisterFormData } from "@/interface/user-props";
import { apiClient } from "@/core/api/api-client";
import { useRole } from "@/shared/components/context/user-role";

// Field validation mapping for error messages
const FIELD_LABELS: Record<keyof DeanRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  assignment_id: "Dean ID",
  campus_id: "Campus",
  office_id: "Office",
  role: "Role"
};

// Initial form state
const INITIAL_FORM_STATE: Omit<DeanRegisterFormData, 'role'> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  assignment_id: "",
  campus_id: "",
  office_id: "",
};

export function DeanRegistrationSubmission() {
  const { role } = useRole();

  // Get role from our context on initial render
  const [formData, setFormData] = useState<DeanRegisterFormData>(() => {
    return {
      ...INITIAL_FORM_STATE,
      role: role as string
    };
  });

  // Update form data when role changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: role as string
    }));
  }, [role]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<Partial<Record<keyof DeanRegisterFormData, boolean>>>({});

  // Generic field change handler (works for both inputs and selects)
  const handleFieldChange = useCallback((name: keyof DeanRegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when field is updated
    setMissingFields(prev => {
      if (!prev[name]) return prev;
      const newFields = { ...prev };
      delete newFields[name];
      return newFields;
    });
  }, []);

  // Convenience handler for input elements
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof DeanRegisterFormData, value);
  }, [handleFieldChange]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const missing: Partial<Record<keyof DeanRegisterFormData, boolean>> = {};

    // Check required fields
    if (!formData.first_name.trim()) missing.first_name = true;
    if (!formData.middle_name.trim()) missing.middle_name = true;
    if (!formData.last_name.trim()) missing.last_name = true;
    if (!formData.assignment_id.trim()) missing.assignment_id = true;
    if (!formData.campus_id) missing.campus_id = true;
    if (!formData.office_id) missing.office_id = true;

    // Email validation
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true;

    setMissingFields(missing);

    // Show validation error toasts
    const errorCount = Object.keys(missing).length;
    if (errorCount > 0) {
      Object.keys(missing).forEach((field, i) => {
        const key = field as keyof DeanRegisterFormData;
        setTimeout(() => toast.error(`Missing or invalid: ${FIELD_LABELS[key]}`), i * 200);
      });
      return false;
    }

    return true;
  }, [formData]);

  // Form submission handler
  const submitForm = useCallback(async (validateOnly = false) => {
    // Validate form first
    if (!validateForm()) return false;

    // Skip actual submission if we're only validating
    if (validateOnly) return true;

    // Begin submission
    setIsSubmitting(true);

    try {
      // API call
      const response = await apiClient.post<{ role?: number }, DeanRegisterFormData>(
        'users/store',
        formData
      );

      // Handle API errors
      if (response.error) {
        const errorMessage = response.error.toLowerCase().includes("email") &&
          response.error.toLowerCase().includes("already")
          ? "Email is already registered."
          : response.error;

        toast.error(errorMessage, { duration: 5000 });
        setIsSubmitting(false);
        return false;
      }

      let successMsg = "Registration successful!";

      switch (response.data?.role) {
        case 1: successMsg = "Student registration successful!"; break;
        case 2: successMsg = "Faculty registration successful!"; break;
        case 3: successMsg = "Staff registration successful!"; break;
      }

      toast.success(successMsg, { duration: 5000 });
      setFormData(prev => ({
        ...INITIAL_FORM_STATE,
        role: prev.role // Preserve the current role when resetting
      }));
      setIsSubmitting(false);
      return true;

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed!", { duration: 5000 });
      setIsSubmitting(false);
      return false;
    }
  }, [formData, validateForm]);

  // Quick validation for UI feedback
  const isFormValid = useCallback(() => {
    return Boolean(
      formData.first_name.trim() &&
      formData.middle_name.trim() &&
      formData.last_name.trim() &&
      formData.email.trim() &&
      formData.email.includes("@") &&
      formData.assignment_id.trim() &&
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