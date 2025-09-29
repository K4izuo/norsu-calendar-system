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
  firstName: string
  middleName: string
  lastName: string
  email: string
  facultyId: string
  campus: string
  college: string
  course: string
}

export default function FacultyRegisterPage() {
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    facultyId: "",
    campus: "",
    college: "",
    course: "",
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
    if (!formData.firstName.trim()) missing.firstName = true
    if (!formData.middleName.trim()) missing.middleName = true
    if (!formData.lastName.trim()) missing.lastName = true
    if (!formData.email.trim() || !formData.email.includes("@")) missing.email = true
    if (!formData.facultyId.trim()) missing.studentId = true
    if (!formData.campus) missing.campus = true
    if (!formData.college) missing.college = true
    if (!formData.course) missing.course = true

    setMissingFields(missing)
    if (Object.keys(missing).length > 0) {
      Object.keys(missing).forEach((field, i) => {
        setTimeout(() => toast.error(`Missing or invalid: ${field}`), i * 200)
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
    await new Promise(r => setTimeout(r, 1500))
    toast.success("Registration successful!", { id: toastId })
    setIsSubmitting(false)
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      facultyId: "",
      campus: "",
      college: "",
      course: "",
    })
    setTimeout(() => setActiveTab("details"), 1000)
  }

  const isFormValid = () =>
    formData.firstName.trim() &&
    formData.middleName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.email.includes("@") &&
    formData.facultyId.trim() &&
    formData.campus &&
    formData.college &&
    formData.course

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
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
                className={`flex items-center justify-center py-2 px-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                style={{ cursor: "default", minWidth: "100px" }}
              >
                Faculty Details
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
                    <Label htmlFor="firstName" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        First Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.firstName ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="middleName" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Middle Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      autoComplete="additional-name"
                      placeholder="Enter middle name"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.middleName ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="lastName" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Last Name <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.lastName ? "border-red-400" : "border-gray-200"} focus:border-ring`}
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
                    <Label htmlFor="facultyId" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Faculty ID <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Input
                      id="facultyId"
                      name="facultyId"
                      autoComplete="off"
                      placeholder="Enter faculty ID"
                      value={formData.facultyId}
                      onChange={handleInputChange}
                      className={`h-11 text-base border-2 rounded-lg ${missingFields.studentId ? "border-red-400" : "border-gray-200"} focus:border-ring`}
                    />
                  </div>
                </div>
                {/* Campus & College row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label htmlFor="campus" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        Campus <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Select
                      value={formData.campus}
                      onValueChange={value => handleInputChange({ target: { name: "campus", value } } as any)}
                      name="campus"
                    >
                      <SelectTrigger
                        id="campus"
                        className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.campus ? "border-red-400" : "border-gray-200"}`}
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
                    <Label htmlFor="college" className="inline-flex pointer-events-none">
                      <span className="pointer-events-auto">
                        College <span className="text-red-500">*</span>
                      </span>
                    </Label>
                    <Select
                      value={formData.college}
                      onValueChange={value => handleInputChange({ target: { name: "college", value } } as any)}
                      name="college"
                    >
                      <SelectTrigger
                        id="college"
                        // autoComplete="off"
                        className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.college ? "border-red-400" : "border-gray-200"}`}
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
                  <Label htmlFor="course" className="inline-flex pointer-events-none">
                    <span className="pointer-events-auto">
                      Course <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <Select
                    value={formData.course}
                    onValueChange={value => handleInputChange({ target: { name: "course", value } } as any)}
                    name="course"
                  >
                    <SelectTrigger
                      id="course"
                      // autoComplete="off"
                      className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full ${missingFields.course ? "border-red-400" : "border-gray-200"}`}
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
                  <h3 className="text-lg font-medium text-gray-700">Faculty Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-base text-gray-500">Full Name</p>
                    <p className="font-medium text-base">{`${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim() || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Email</p>
                    <p className="font-medium text-base">{formData.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Faculty ID</p>
                    <p className="font-medium text-base">{formData.facultyId || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Campus</p>
                    <p className="font-medium text-base">{campusOptions.find(c => c.value === formData.campus)?.label || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">College</p>
                    <p className="font-medium text-base">{collegeOptions.find(c => c.value === formData.college)?.label || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">Course</p>
                    <p className="font-medium text-base">{courseOptions.find(c => c.value === formData.course)?.label || "Not selected"}</p>
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