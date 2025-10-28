"use client"

import React, { useEffect, useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FacultyRegisterFormData } from "@/interface/faculty-events-props";
import { useCampuses, useOffices, useCourses } from "@/services/academicDataService";
import { FacultyFormSelectField } from "@/components/user-forms/register/faculty/faculty-form-field";
import { FacultySummary } from "@/components/user-forms/register/faculty/faculty-summary";
import { useRole } from "@/contexts/user-role";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

const FIELD_LABELS: Record<keyof FacultyRegisterFormData, string> = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  email: "Email",
  assignment_id: "Faculty ID",
  campus_id: "Campus",
  college_id: "College",
  degree_course_id: "Course",
  role: "Role",
};

export default function FacultyRegisterPage() {
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
  const [selectedCollege, setSelectedCollege] = useState("");
  const { courses, loading: loadingCourses, error: courseError } = useCourses(selectedCollege);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
    trigger,
    reset,
  } = useForm<FacultyRegisterFormData>({
    mode: "onChange",
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      assignment_id: "",
      campus_id: "",
      college_id: "",
      degree_course_id: "",
      role: "",
    },
  });

  useEffect(() => {
    if (role === "faculty") {
      setShouldRender(true);
    } else {
      router.replace("/auth/register");
    }
  }, [role, router]);

  React.useEffect(() => {
    const college_id = watch("college_id");
    setSelectedCollege(college_id);
    setValue("degree_course_id", "");
  }, [watch("college_id"), setValue]);

  const handleFacultyIDChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const numericValue = e.target.value.replace(/\D/g, "");
      onChange(numericValue);
    },
    []
  );

  const onSubmit = useCallback(
    async (data: FacultyRegisterFormData) => {
      const valid = await trigger();
      if (!valid) {
        Object.keys(errors).forEach((field, i) => {
          setTimeout(
            () => toast.error(`Missing or invalid: ${FIELD_LABELS[field as keyof FacultyRegisterFormData]}`),
            i * 200
          );
        });
        return;
      }
      try {
        const safeRole = role ?? "";
        const response = await apiClient.post<{ role?: number }, FacultyRegisterFormData>(
          "users/store",
          { ...data, role: safeRole }
        );
        if (response.error) {
          const errorMessage =
            response.error.toLowerCase().includes("email") && response.error.toLowerCase().includes("already")
              ? "Email is already registered."
              : response.error;
          toast.error(errorMessage, { duration: 5000 });
          return;
        }
        let successMsg = "Registration successful!";
        switch (response.data?.role) {
          case 1:
            successMsg = "Student registration successful!";
            break;
          case 2:
            successMsg = "Faculty registration successful!";
            break;
          case 3:
            successMsg = "Staff registration successful!";
            break;
        }
        toast.success(successMsg, { duration: 5000 });
        reset({
          ...getValues(),
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          assignment_id: "",
          campus_id: "",
          college_id: "",
          degree_course_id: "",
          role: "",
        });
        setActiveTab("details");
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed!", { duration: 5000 });
      }
    },
    [role, errors, trigger, getValues, reset]
  );

  if (!shouldRender) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600 rounded-full opacity-10 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500 rounded-full opacity-10 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-blue-500 rounded-full opacity-10 -translate-x-12"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-3xl relative p-2 sm:p-0"
      >
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Faculty Registration</h1>
            <p className="text-gray-600 text-sm">Fill in your details to register</p>
          </div>
          <Tabs value={activeTab} className="w-full">
            <div className="grid grid-cols-2 mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors min-w-[100px] ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Faculty Details
              </div>
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors min-w-[100px] ${
                  activeTab === "summary"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Summary
              </div>
            </div>
            <TabsContent value="details" className="space-y-6">
              <form className="flex flex-col gap-y-5" onSubmit={e => e.preventDefault()}>
                {/* Name row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="first_name" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        First Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Controller
                      name="first_name"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="first_name"
                          autoComplete="given-name"
                          placeholder="Enter first name"
                          className={`h-11 text-base border-2 rounded-lg ${
                            errors.first_name ? "border-red-400" : "border-gray-200"
                          } focus:border-ring`}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="middle_name" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Middle Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Controller
                      name="middle_name"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="middle_name"
                          autoComplete="additional-name"
                          placeholder="Enter middle name"
                          className={`h-11 text-base border-2 rounded-lg ${
                            errors.middle_name ? "border-red-400" : "border-gray-200"
                          } focus:border-ring`}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="last_name" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Last Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Controller
                      name="last_name"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="last_name"
                          autoComplete="family-name"
                          placeholder="Enter last name"
                          className={`h-11 text-base border-2 rounded-lg ${
                            errors.last_name ? "border-red-400" : "border-gray-200"
                          } focus:border-ring`}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* Email & Faculty ID row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="email" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Email <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: true,
                        validate: value => value.includes("@"),
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="Enter email"
                          className={`h-11 text-base border-2 rounded-lg ${
                            errors.email ? "border-red-400" : "border-gray-200"
                          } focus:border-ring`}
                        />
                      )}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="assignment_id" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Faculty ID <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Controller
                      name="assignment_id"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="assignment_id"
                          autoComplete="off"
                          placeholder="Enter faculty ID"
                          value={field.value}
                          onChange={e => handleFacultyIDChange(e, field.onChange)}
                          inputMode="numeric"
                          className={`h-11 text-base border-2 rounded-lg ${
                            errors.assignment_id ? "border-red-400" : "border-gray-200"
                          } focus:border-ring`}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* Campus & College row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Controller
                      name="campus_id"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <FacultyFormSelectField
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
                      name="college_id"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <FacultyFormSelectField
                          id="college_id"
                          name="college_id"
                          label="College"
                          placeholder="Select college"
                          value={field.value}
                          onChange={field.onChange}
                          options={offices}
                          loading={loadingOffices}
                          error={officeError}
                          required
                          hasError={!!errors.college_id}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* Course row */}
                <Controller
                  name="degree_course_id"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FacultyFormSelectField
                      id="degree_course_id"
                      name="degree_course_id"
                      label="Course"
                      placeholder="Select course"
                      value={field.value}
                      onChange={field.onChange}
                      options={courses}
                      loading={loadingCourses}
                      error={courseError}
                      required
                      disabled={!selectedCollege}
                      hasError={!!errors.degree_course_id}
                    />
                  )}
                />
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
                    onClick={async () => {
                      const valid = await trigger();
                      if (valid) setActiveTab("summary");
                      else {
                        Object.keys(errors).forEach((field, i) => {
                          setTimeout(
                            () => toast.error(`Missing or invalid: ${FIELD_LABELS[field as keyof FacultyRegisterFormData]}`),
                            i * 200
                          );
                        });
                      }
                    }}
                    variant="default"
                    className="text-base bg-indigo-600 hover:bg-indigo-500 cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="summary" className="space-y-6">
              <FacultySummary
                formData={{ ...getValues(), role: role ?? "" }}
                campuses={campuses}
                offices={offices}
                courses={courses}
                isFormValid={isValid}
                agreed={agreed}
                setAgreed={setAgreed}
                color="indigo"
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
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  variant="default"
                  disabled={!isValid || isSubmitting || !agreed}
                  className="text-base bg-indigo-600 hover:bg-indigo-500 cursor-pointer py-2.5"
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
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}