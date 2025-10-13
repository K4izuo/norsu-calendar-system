import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

// Define the admin form data structure
export type AdminRegisterFormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  facultyID: string;
};

// Field labels for error messages
const FIELD_LABELS: Record<keyof AdminRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  facultyID: "Admin ID",
};

// Initial form state
const INITIAL_FORM_STATE: AdminRegisterFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  facultyID: "",
};

export function useAdminRegForm() {
  const [formData, setFormData] = useState<AdminRegisterFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<Partial<Record<keyof AdminRegisterFormData, boolean>>>({});

  // Generic field change handler
  const handleFieldChange = useCallback((name: keyof AdminRegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setMissingFields(prev => {
      if (!prev[name]) return prev;
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // For input elements
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof AdminRegisterFormData, value);
  }, [handleFieldChange]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const missing: Partial<Record<keyof AdminRegisterFormData, boolean>> = {};

    if (!formData.first_name.trim()) missing.first_name = true;
    if (!formData.middle_name.trim()) missing.middle_name = true;
    if (!formData.last_name.trim()) missing.last_name = true;
    if (!formData.facultyID.trim()) missing.facultyID = true;
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true;

    setMissingFields(missing);

    if (Object.keys(missing).length > 0) {
      Object.keys(missing).forEach((field, i) => {
        const key = field as keyof AdminRegisterFormData;
        setTimeout(() => toast.error(`Missing or invalid: ${FIELD_LABELS[key]}`), i * 200);
      });
      return false;
    }
    return true;
  }, [formData]);

  // Submission handler
  const submitForm = useCallback(async (validateOnly = false) => {
    if (!validateForm()) return false;
    if (validateOnly) return true;

    setIsSubmitting(true);

    // Simulate API call
    const toastId = toast.loading("Registering admin...", { duration: Infinity });
    
    try {
      // API call
      const response = await apiClient.post<{message?: string}, AdminRegisterFormData>(
        'users/store', 
        formData
      );
      
      // Handle API errors
      if (response.error) {
        const errorMessage = response.error.toLowerCase().includes("email") && 
            response.error.toLowerCase().includes("already")
          ? "Email is already registered."
          : response.error;
        
        // Replace loading toast with error
        toast.error(errorMessage, { 
          id: toastId,
          duration: 5000 // Show error for 5 seconds
        });
        setIsSubmitting(false);
        return false;
      }

      // Check for response data
      if (!response.data) {
        toast.error("Registration could not be confirmed", { 
          id: toastId,
          duration: 5000 // Show error for 5 seconds
        });
        console.log("Empty API response:", response);
        setIsSubmitting(false);
        return false;
      }

      // Replace loading toast with success message
      toast.success(response.data.message || "Registration successful!", { 
        id: toastId,
        duration: 5000 // Show success for 5 seconds
      });
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitting(false);
      return true;
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed!", { 
        id: toastId,
        duration: 5000 // Show error for 5 seconds
      });
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
      formData.facultyID.trim()
    );
  }, [formData]);

  return {
    formData,
    setFormData,
    missingFields,
    isSubmitting,
    handleInputChange,
    handleFieldChange,
    handleSubmit: submitForm,
    isFormValid,
  };
}