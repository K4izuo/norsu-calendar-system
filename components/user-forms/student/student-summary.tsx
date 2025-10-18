import React, { memo } from "react";
import { User } from "lucide-react";
import { StudentRegisterFormData } from "@/interface/faculty-events-props";
import { OptionType } from "@/services/academicDataService";

type StudentSummaryProps = {
  formData: StudentRegisterFormData;
  campuses: OptionType[];
  offices: OptionType[];
  courses: OptionType[];
  isFormValid: boolean;
};

export const StudentSummary = memo(function StudentSummary({
  formData,
  campuses,
  offices,
  courses,
  isFormValid,
}: StudentSummaryProps) {
  return (
    <>
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <User className="w-6 h-6 text-emerald-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-700">Student Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Full Name</p>
            <p className="font-medium text-base">
              {`${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim() ||
                "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Email</p>
            <p className="font-medium text-base">{formData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Student ID</p>
            <p className="font-medium text-base">{formData.studentID || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Campus</p>
            <p className="font-medium text-base">
              {campuses.find((c) => c.value === formData.campus_id)?.label || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">College</p>
            <p className="font-medium text-base">
              {offices.find((o) => o.value === formData.college_id)?.label || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Course</p>
            <p className="font-medium text-base">
              {courses.find((c) => c.value === formData.degree_course_id)?.label || "Not selected"}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`mt-6 p-3 rounded-md flex items-center justify-center ${
          isFormValid
            ? "bg-green-50 text-green-800"
            : "bg-yellow-50 text-yellow-800"
        }`}
      >
        {isFormValid ? (
          <span className="text-base">Ready for submission</span>
        ) : (
          <span className="text-base">Please complete all required fields</span>
        )}
      </div>
    </>
  );
});