import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FacultyRegisterFormData } from "@/interface/faculty-events-props";
import { apiClient } from "@/lib/api-client";

// Field validation mapping for error messages
const FIELD_LABELS: Record<keyof FacultyRegisterFormData, string> = {
  first_name: "first name",
  middle_name: "middle name",
  last_name: "last name",
  email: "email",
  facultyID: "faculty ID", // Changed from facultyId to facultyID
  campus_id: "campus",
  college_id: "college",
  degree_course_id: "course",
};

// Initial form state
const INITIAL_FORM_STATE: FacultyRegisterFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  facultyID: "", // Changed from facultyId to facultyID
  campus_id: "",
  college_id: "",
  degree_course_id: "",
};

export function FacultyRegistrationSubmission() {
  const [formData, setFormData] = useState<FacultyRegisterFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<Partial<Record<keyof FacultyRegisterFormData, boolean>>>({});

  // Generic field change handler (works for both inputs and selects)
  const handleFieldChange = useCallback((name: keyof FacultyRegisterFormData, value: string) => {
    setFormData(prev => {
      // Special case: reset course when college changes
      if (name === "college_id") {
        return { ...prev, [name]: value, degree_course_id: "" };
      }
      return { ...prev, [name]: value };
    });
    
    // Clear validation error when field is updated
    setMissingFields(prev => {
      if (!prev[name]) return prev;
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Convenience handler for input elements
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof FacultyRegisterFormData, value);
  }, [handleFieldChange]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const missing: Partial<Record<keyof FacultyRegisterFormData, boolean>> = {};
    
    // Check required fields
    if (!formData.first_name.trim()) missing.first_name = true;
    if (!formData.middle_name.trim()) missing.middle_name = true;
    if (!formData.last_name.trim()) missing.last_name = true;
    if (!formData.facultyID.trim()) missing.facultyID = true; // Changed from facultyId to facultyID
    if (!formData.campus_id) missing.campus_id = true;
    if (!formData.college_id) missing.college_id = true;
    if (!formData.degree_course_id) missing.degree_course_id = true;
    
    // Email validation
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true;

    setMissingFields(missing);
    
    // Show validation error toasts
    const errorCount = Object.keys(missing).length;
    if (errorCount > 0) {
      Object.keys(missing).forEach((field, i) => {
        const key = field as keyof FacultyRegisterFormData;
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
    
    // Create persistent loading toast with explicit duration and no auto-dismiss
    const toastId = toast.loading("Registering faculty...", {
      duration: Infinity, // Never auto-dismiss
    });

    try {
      // API call
      const response = await apiClient.post<{message?: string}, FacultyRegisterFormData>(
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
      formData.facultyID.trim() && // Changed from facultyId to facultyID
      formData.campus_id &&
      formData.college_id &&
      formData.degree_course_id
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