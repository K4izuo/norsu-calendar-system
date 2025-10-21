import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { StudentRegisterFormData } from "@/interface/faculty-events-props";
import { apiClient } from "@/lib/api-client";
import { useRole } from "@/contexts/user-role";

// Field validation mapping for error messages
const FIELD_LABELS: Record<keyof StudentRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  assignment_id: "Student ID", // <-- Changed
  campus_id: "Campus",
  college_id: "College",
  degree_course_id: "Course",
  role: "Role",
};

// Initial form state without role
const INITIAL_FORM_STATE: Omit<StudentRegisterFormData, 'role'> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  assignment_id: "", // <-- Changed
  campus_id: "",
  college_id: "",
  degree_course_id: "",
};

export function StudentRegistrationSubmission() {
  const { role } = useRole();
  
  // Get role from our context on initial render
  const [formData, setFormData] = useState<StudentRegisterFormData>(() => {
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
    if (!formData.assignment_id.trim()) missing.assignment_id = true;
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
      const response = await apiClient.post<{role?: number}, StudentRegisterFormData>(
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

      // Show success toast based on role from API response
      let successMsg = "Registration successful!";
      if (response.data?.role === 1) successMsg = "Student registration successful!";
      else if (response.data?.role === 2) successMsg = "Faculty registration successful!";
      else if (response.data?.role === 3) successMsg = "Staff registration successful!";

      toast.success(successMsg, { 
        id: toastId,
        duration: 5000 // Show success for 5 seconds
      });
      setFormData(prev => ({
        ...INITIAL_FORM_STATE,
        role: prev.role // Preserve the current role when resetting
      }));
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
      formData.assignment_id.trim() &&
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