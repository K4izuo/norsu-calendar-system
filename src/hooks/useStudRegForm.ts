import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { StudentRegisterFormData } from "@/interface/faculty-events-props";
import { apiClient } from "@/lib/api-client";

// Field validation mapping for error messages
const FIELD_LABELS: Record<keyof StudentRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  studentID: "Student ID",
  campus_id: "Campus",
  college_id: "College",
  degree_course_id: "Course",
  role: "Role", // Add this to fix TypeScript error
};

// Initial form state
const INITIAL_FORM_STATE: StudentRegisterFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  studentID: "",
  campus_id: "",
  college_id: "",
  degree_course_id: "",
  role: "student", // Add default role
};

export function StudentRegistrationSubmission(initialRole?: string) {
  const [formData, setFormData] = useState<StudentRegisterFormData>({
    ...INITIAL_FORM_STATE,
    role: initialRole || "student" // Use provided role or default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<Partial<Record<keyof StudentRegisterFormData, boolean>>>({});

  // Generic field change handler (works for both inputs and selects)
  const handleFieldChange = useCallback((name: keyof StudentRegisterFormData, value: string) => {
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
    handleFieldChange(name as keyof StudentRegisterFormData, value);
  }, [handleFieldChange]);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const missing: Partial<Record<keyof StudentRegisterFormData, boolean>> = {};
    
    // Check required fields
    if (!formData.first_name.trim()) missing.first_name = true;
    if (!formData.middle_name.trim()) missing.middle_name = true;
    if (!formData.last_name.trim()) missing.last_name = true;
    if (!formData.studentID.trim()) missing.studentID = true;
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
        const key = field as keyof StudentRegisterFormData;
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
    
    // Create persistent loading toast
    const toastId = toast.loading("Registering student...", {
      duration: Infinity,
    });

    try {
      // API call with role included
      const response = await apiClient.post<{message?: string}, StudentRegisterFormData>(
        'users/store', 
        formData // This now includes the role field
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
      formData.studentID.trim() &&
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