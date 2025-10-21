import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { StaffRegisterFormData } from "@/interface/faculty-events-props";
import { useRole } from "@/contexts/user-role";

const FIELD_LABELS: Record<keyof StaffRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  assignment_id: "Staff ID", // <-- Changed
  campus_id: "Campus",
  office_id: "Office",
  role: "Role"
};

const INITIAL_FORM_STATE: Omit<StaffRegisterFormData, 'role'> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  assignment_id: "", // <-- Changed
  campus_id: "",
  office_id: "",
};

export function StaffRegistrationSubmission() {
  const { role } = useRole();
      
  // Get role from our context on initial render
  const [formData, setFormData] = useState<StaffRegisterFormData>(() => {
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
    if (!formData.assignment_id.trim()) missing.assignment_id = true;
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
      const response = await apiClient.post<{ role?: number }, StaffRegisterFormData>(
        "users/store",
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

      let successMsg = "Registration successful!";

      switch(response.data?.role) {
        case 1: successMsg = "Student registration successful!"; break;
        case 2: successMsg = "Faculty registration successful!"; break;
        case 3: successMsg = "Staff registration successful!"; break;
      }

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