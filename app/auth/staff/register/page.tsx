"use client"

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { StaffRegisterFormData } from "@/interface/user-props";
import { useCampuses, useOffices } from "@/services/academicDataService";
import { StaffFormSelectField } from "@/components/user-forms/register/staff/staff-form-field";
import { StaffSummary } from "@/components/user-forms/register/staff/staff-summary";
import { useRole } from "@/contexts/user-role";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { showFieldErrorToast } from "@/utils/staff-field-error-toast";
import { STAFF_VALIDATION_RULES } from "@/utils/staff-validation-rules";
import { StaffFormInput } from "@/components/user-forms/register/staff/staff-input-field";

const TABS = [
  { value: "details", label: "Staff Details" },
  { value: "summary", label: "Summary" },
] as const;

const ROLE_SUCCESS_MESSAGES: Record<number, string> = {
  1: "Student registration successful!",
  2: "Faculty registration successful!",
  3: "Staff registration successful!",
};

export default function StaffRegisterPage() {
  const router = useRouter();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState("details");
  const [agreed, setAgreed] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Always call hooks first!
  const {
    campuses,
    loading: loadingCampuses,
    error: campusError,
  } = useCampuses();
  const {
    offices,
    loading: loadingOffices,
    error: officeError,
  } = useOffices();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid },
    trigger,
    reset,
  } = useForm<StaffRegisterFormData>({
    mode: "onChange",
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      assignment_id: "",
      campus_id: "",
      office_id: "",
      role: "",
    },
  });

  useEffect(() => {
    if (role === "staff") {
      setShouldRender(true);
    } else {
      router.replace("/auth/register");
    }
  }, [role, router]);

  // Numeric only for staff ID
  const handleStaffIDChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const numericValue = e.target.value.replace(/\D/g, "");
      onChange(numericValue);
    },
    []
  );

  const onSubmit = useCallback(
    async (data: StaffRegisterFormData) => {
      try {
        const response = await apiClient.post<{ role?: number }, StaffRegisterFormData>(
          "users/store",
          { ...data, role: role || "staff" }
        );
        if (response.error) {
          const errorMessage =
            response.error.toLowerCase().includes("email") && response.error.toLowerCase().includes("already")
              ? "Email is already registered."
              : response.error;
          toast.error(errorMessage, { duration: 5000 });
          return;
        }
        const successMsg = response.data?.role
          ? ROLE_SUCCESS_MESSAGES[response.data.role] ?? "Registration successful!"
          : "Registration successful!";
        toast.success(successMsg, { duration: 5000 });
        reset();
        setActiveTab("details");
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed!", { duration: 5000 });
      }
    },
    [role, reset]
  );

  const handleNextClick = useCallback(async () => {
    const valid = await trigger();
    if (valid) {
      setActiveTab("summary");
    } else {
      showFieldErrorToast(errors, { ...getValues(), role: role ?? "" });
    }
  }, [trigger, errors, getValues, role]);

  const formDataWithRole = useMemo(
    () => ({ ...getValues(), role: role ?? "" }),
    [getValues, role, activeTab] // <-- Add activeTab here!
  );

  if (!shouldRender) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-yellow-50 to-yellow-50 flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full opacity-10 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-500 rounded-full opacity-10 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-10 -translate-x-12"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-3xl relative p-2 sm:p-0"
      >
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Staff Registration</h1>
            <p className="text-gray-600 text-sm">Fill in your details to register</p>
          </div>
          <Tabs value={activeTab} className="w-full">
            <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
                {TABS.map(tab => (
                  <div
                    key={tab.value}
                    className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors min-w-[100px] ${
                      activeTab === tab.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
              <TabsContent value="details" className="space-y-6">
                {/* Name row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <StaffFormInput
                    name="first_name"
                    label="First Name"
                    control={control}
                    rules={STAFF_VALIDATION_RULES.name}
                    errors={errors}
                    autoComplete="given-name"
                    placeholder="Enter first name"
                  />
                  <StaffFormInput
                    name="middle_name"
                    label="Middle Name"
                    control={control}
                    rules={STAFF_VALIDATION_RULES.name}
                    errors={errors}
                    autoComplete="additional-name"
                    placeholder="Enter middle name"
                  />
                  <StaffFormInput
                    name="last_name"
                    label="Last Name"
                    control={control}
                    rules={STAFF_VALIDATION_RULES.name}
                    errors={errors}
                    autoComplete="family-name"
                    placeholder="Enter last name"
                  />
                </div>
                {/* Email & Staff ID row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <StaffFormInput
                    name="email"
                    label="Email"
                    control={control}
                    rules={STAFF_VALIDATION_RULES.email}
                    errors={errors}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email"
                  />
                  <StaffFormInput
                    name="assignment_id"
                    label="Staff ID"
                    control={control}
                    rules={STAFF_VALIDATION_RULES.staffID}
                    errors={errors}
                    autoComplete="off"
                    placeholder="Enter staff ID"
                    inputMode="numeric"
                    onChange={e => handleStaffIDChange(e as React.ChangeEvent<HTMLInputElement>, value => setValue("assignment_id", value))}
                  />
                </div>
                {/* Campus & Office row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Controller
                      name="campus_id"
                      control={control}
                      rules={STAFF_VALIDATION_RULES.campus}
                      render={({ field }) => (
                        <StaffFormSelectField
                          id="campus_id"
                          name="campus_id"
                          label="Campus"
                          placeholder="Select campus"
                          value={field.value}
                          onChange={field.onChange}
                          options={campuses}
                          loading={loadingCampuses}
                          error={campusError}
                          required
                          hasError={!!errors.campus_id}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Controller
                      name="office_id"
                      control={control}
                      rules={STAFF_VALIDATION_RULES.office}
                      render={({ field }) => (
                        <StaffFormSelectField
                          id="office_id"
                          name="office_id"
                          label="Office"
                          placeholder="Select office"
                          value={field.value}
                          onChange={field.onChange}
                          options={offices}
                          loading={loadingOffices}
                          error={officeError}
                          required
                          hasError={!!errors.office_id}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex mt-2 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-base cursor-pointer py-2.5"
                    onClick={() => window.history.back()}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextClick}
                    variant="default"
                    className="text-base bg-yellow-500 hover:bg-yellow-400 cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="summary" className="space-y-6">
                <StaffSummary
                  formData={formDataWithRole}
                  campuses={campuses}
                  offices={offices}
                  isFormValid={isValid}
                  agreed={agreed}
                  setAgreed={setAgreed}
                  color="yellow"
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    variant="outline"
                    className="text-base cursor-pointer py-2.5"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={!isValid || isSubmitting || !agreed}
                    className="text-base bg-yellow-500 hover:bg-yellow-400 cursor-pointer py-2.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <span className="animate-spin mr-2">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </span>
                        Processing...
                      </div>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}