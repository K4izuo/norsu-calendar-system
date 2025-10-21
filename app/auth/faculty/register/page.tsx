"use client"

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FacultyRegistrationSubmission } from "@/hooks/useFacultyRegForm"
import { useCampuses, useOffices, useCourses } from "@/services/academicDataService"
import { FacultyFormSelectField } from "@/components/user-forms/faculty/faculty-form-field"
import { FacultySummary } from "@/components/user-forms/faculty/faculty-summary"
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/user-role"

export default function FacultyRegisterPage() {
  const router = useRouter();
  const { role } = useRole();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [agreed, setAgreed] = useState(false); // <-- Add this

  const {
    formData,
    missingFields,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    isFormValid
  } = FacultyRegistrationSubmission()

  const { campuses, loading: loadingCampuses, error: campusError } = useCampuses()
  const { offices, loading: loadingOffices, error: officeError } = useOffices()
  const { courses, loading: loadingCourses, error: courseError } = useCourses(formData.college_id)

  useEffect(() => {
    if (role !== 'faculty') {
      // If wrong role or no role, redirect to registration selection page
      router.push('/auth/register');
    } else {
      setIsAuthorized(true);
    }
  }, [role, router]);

  // Memoize form submission handler
  const onSubmit = useCallback(async () => {
    const success = await handleSubmit()
    if (success) {
      setTimeout(() => setActiveTab("details"), 700)
    }
  }, [handleSubmit, setActiveTab])

  const handleFacultyIDChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Filter out non-numeric characters
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Create a new synthetic event with the filtered value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: numericValue,
        name: e.target.name
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Call the original handler with our modified event
    handleInputChange(syntheticEvent);
  }, [handleInputChange]);

  if (isAuthorized !== true) {
    return null; // Return empty (no UI)
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-6 px-2 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
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
                    <Input
                      id="first_name"
                      name="first_name"
                      autoComplete="given-name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.first_name ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="middle_name" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Middle Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="middle_name"
                      name="middle_name"
                      autoComplete="additional-name"
                      placeholder="Enter middle name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.middle_name ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="last_name" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Last Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      autoComplete="family-name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.last_name ? "border-red-400" : "border-gray-200"} focus:border-ring`}
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
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.email ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="assignment_id" className="inline-flex pointer-events-none"> {/* Changed from facultyId to facultyID */}
                      <span className="pointer-events-auto">
                        Faculty ID <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="assignment_id"
                      name="assignment_id"
                      autoComplete="off"
                      placeholder="Enter faculty ID"
                      value={formData.assignment_id}
                      onChange={handleFacultyIDChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.assignment_id ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                </div>
                
                {/* Campus & College row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <FacultyFormSelectField
                      id="campus_id"
                      name="campus_id"
                      label="Campus"
                      placeholder="Select campus"
                      value={formData.campus_id}
                      onChange={(value) => handleSelectChange("campus_id", value)}
                      options={campuses}
                      loading={loadingCampuses}
                      error={campusError}
                      required
                      hasError={!!missingFields.campus_id}
                    />
                  </div>
                  <div className="flex-1">
                    <FacultyFormSelectField
                      id="college_id"
                      name="college_id"
                      label="College"
                      placeholder="Select college"
                      value={formData.college_id}
                      onChange={(value) => handleSelectChange("college_id", value)}
                      options={offices}
                      loading={loadingOffices}
                      error={officeError}
                      required
                      hasError={!!missingFields.college_id}
                    />
                  </div>
                </div>
                
                {/* Course row */}
                <FacultyFormSelectField
                  id="degree_course_id"
                  name="degree_course_id"
                  label="Course"
                  placeholder="Select course"
                  value={formData.degree_course_id}
                  onChange={(value) => handleSelectChange("degree_course_id", value)}
                  options={courses}
                  loading={loadingCourses}
                  error={courseError}
                  required
                  disabled={!formData.college_id}
                  hasError={!!missingFields.degree_course_id}
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
                    onClick={() => {
                      if (isFormValid()) {
                        setActiveTab("summary");
                      } else {
                        handleSubmit(true);
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
                formData={formData}
                campuses={campuses}
                offices={offices}
                courses={courses}
                isFormValid={!!isFormValid()}
                agreed={agreed} // <-- Pass agreed
                setAgreed={setAgreed} // <-- Pass setAgreed
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
                  onClick={onSubmit}
                  variant="default"
                  disabled={!isFormValid() || isSubmitting || !agreed} // <-- Disable if not agreed
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
  )
}