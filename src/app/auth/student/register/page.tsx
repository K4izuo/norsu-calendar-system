"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  User
} from "lucide-react"

const campusOptions = [
  { value: "main", label: "Main Campus" },
  { value: "east", label: "East Campus" },
  { value: "west", label: "West Campus" },
]
const collegeOptions = [
  { value: "cas", label: "College of Arts & Sciences" },
  { value: "coe", label: "College of Education" },
  { value: "cba", label: "College of Business Administration" },
]
const courseOptions = [
  { value: "bsit", label: "BS Information Technology" },
  { value: "bsed", label: "BSEd English" },
  { value: "bsa", label: "BS Accountancy" },
]

interface FormData {
  first_name: string
  middle_name: string
  last_name: string
  email: string
  studentId: string
  campus_id: string
  college_id: string
  degree_course_id: string
}

const fieldLabelMap: Record<string, string> = {
  first_name: "first name",
  middle_name: "middle name",
  last_name: "last name",
  email: "email",
  studentId: "student ID",
  campus_id: "campus",
  college_id: "college",
  degree_course_id: "course",
}

export default function StudentRegisterPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    studentId: "",
    campus_id: "",
    college_id: "",
    degree_course_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMissingFields(prev => {
      if (prev[name]) {
        const updated = { ...prev }
        delete updated[name]
        return updated
      }
      return prev
    })
  }

  const checkFormFields = () => {
    const missing: Record<string, boolean> = {}
    if (!formData.first_name.trim()) missing.first_name = true
    if (!formData.middle_name.trim()) missing.middle_name = true
    if (!formData.last_name.trim()) missing.last_name = true
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true
    if (!formData.studentId.trim()) missing.studentId = true
    if (!formData.campus_id) missing.campus_id = true
    if (!formData.college_id) missing.college_id = true
    if (!formData.degree_course_id) missing.degree_course_id = true

    setMissingFields(missing)
    if (Object.keys(missing).length > 0) {
      Object.keys(missing).forEach((field, i) => {
        const label = fieldLabelMap[field] || field
        setTimeout(() => toast.error(`Missing or invalid: ${label}`), i * 200)
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkFormFields()) return
    setIsSubmitting(true)
    const toastId = toast.loading("Registering student...")

    // --- Place your API call here ---
    try {
      // Example using fetch:
      await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      // --- End API call ---
      toast.success("Registration successful!", { id: toastId })
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        studentId: "",
        campus_id: "",
        college_id: "",
        degree_course_id: "",
      })
      setTimeout(() => setActiveTab("details"), 300)
    } catch (error) {
      toast.error("Registration failed!", { id: toastId })
    }
    setIsSubmitting(false)
  }

  const isFormValid = () =>
    formData.first_name.trim() &&
    formData.middle_name.trim() &&
    formData.last_name.trim() &&
    formData.email.trim() &&
    formData.email.includes("@") &&
    formData.studentId.trim() &&
    formData.campus_id &&
    formData.college_id &&
    formData.degree_course_id

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-32 h-32 bg-green-600 rounded-full opacity-10 -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500 rounded-full opacity-10 translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-24 h-24 bg-green-500 rounded-full opacity-10 -translate-x-12"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-[96%] max-w-3xl relative p-2 sm:p-0"
      >
        <div className="p-4 sm:p-8 w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mt-1.5 mb-7 gap-y-0.5">
            <h1 className="text-2xl font-bold text-gray-800">Student Registration</h1>
            <p className="text-gray-600 text-sm">Fill in your details to register</p>
          </div>
          <Tabs value={activeTab} className="w-full">
            <div className="grid grid-cols-2 mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={{ cursor: "default", minWidth: "100px" }}
              >
                Student Details
              </div>
              <div
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "summary"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={{ cursor: "default", minWidth: "100px" }}
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
                {/* Email & Student ID row */}
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
                    <Label htmlFor="studentId" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Student ID <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      autoComplete="off"
                      placeholder="Enter student ID"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.studentId ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                </div>
                {/* Campus & College row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="campus_id" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Campus <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Select
                      value={formData.campus_id}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, campus_id: value }))
                      }
                      name="campus_id"
                    >
                      <SelectTrigger
                        id="campus_id"
                        className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.campus_id ? "border-red-400" : "border-gray-200"}`}
                      >
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="college_id" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        College <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Select
                      value={formData.college_id}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, college_id: value }))
                      }
                      name="college_id"
                    >
                      <SelectTrigger
                        id="college_id"
                        className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.college_id ? "border-red-400" : "border-gray-200"}`}
                      >
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {collegeOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Course row (below) */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="degree_course_id" className="inline-flex pointer-events-none">
                    <span className="pointer-events-auto">
                      Course <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <Select
                    value={formData.degree_course_id}
                    onValueChange={value =>
                        setFormData(prev => ({ ...prev, degree_course_id: value }))
                      }
                    name="degree_course_id"
                  >
                    <SelectTrigger
                      id="degree_course_id"
                      className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.degree_course_id ? "border-red-400" : "border-gray-200"}`}
                    >
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex mt-2 justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      if (checkFormFields()) setActiveTab("summary")
                    }}
                    variant="default"
                    className="text-base cursor-pointer py-2.5"
                  >
                    Next
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="summary" className="space-y-6">
              <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {/* Student icon added here */}
                  <User className="w-6 h-6 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">Student Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-gray-500">Full Name</p>
                    <p className="font-medium text-base">{`${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim() || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Email</p>
                    <p className="font-medium text-base">{formData.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Student ID</p>
                    <p className="font-medium text-base">{formData.studentId || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Campus</p>
                    <p className="font-medium text-base">{campusOptions.find(c => c.value === formData.campus_id)?.label || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">College</p>
                    <p className="font-medium text-base">{collegeOptions.find(c => c.value === formData.college_id)?.label || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Course</p>
                    <p className="font-medium text-base">{courseOptions.find(c => c.value === formData.degree_course_id)?.label || "Not selected"}</p>
                  </div>
                </div>
              </div>
              <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${
                isFormValid()
                  ? 'bg-green-50 text-green-800'
                  : 'bg-yellow-50 text-yellow-800'
              }`}>
                {isFormValid() ? (
                  <>
                    <span className="text-base">Ready for submission</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">Please complete all required fields</span>
                  </>
                )}
              </div>
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
                  onClick={handleSubmit}
                  variant="default"
                  disabled={!isFormValid() || isSubmitting}
                  className="text-base cursor-pointer py-2.5"
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