import React, { memo, useState } from "react";
import { User } from "lucide-react";
import { StudentRegisterFormData } from "@/interface/faculty-events-props";
import { OptionType } from "@/services/academicDataService";
import { TermsAndConditionModal } from "@/components/privacy/terms-and-condition-modal";
import { Checkbox } from "@/components/ui/checkbox"; // <-- Import shadcn/ui Checkbox

type StudentSummaryProps = {
  formData: StudentRegisterFormData;
  campuses: OptionType[];
  offices: OptionType[];
  courses: OptionType[];
  isFormValid: boolean;
  agreed: boolean;
  setAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  color?: "emerald" | "indigo" | "yellow";
};

export const StudentSummary = memo(function StudentSummary({
  formData,
  campuses,
  offices,
  courses,
  isFormValid,
  agreed,
  setAgreed,
  color = "emerald",
}: StudentSummaryProps) {
  const [termsOpen, setTermsOpen] = useState(false);

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
            <p className="font-medium text-base">{formData.assignment_id || "Not provided"}</p>
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
        {/* Terms and Condition Checkbox */}
        <div className="mt-6 flex items-center">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => {
              // Only allow checking via the checkbox itself
              if (!checked) {
                setAgreed(false);
              } else if (!agreed) {
                setTermsOpen(true);
              }
            }}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 cursor-pointer"
          />
          <span
            className="ml-3 text-base text-gray-700 cursor-pointer select-none"
            onClick={() => setTermsOpen(true)}
          >
            I have read and agree to the{" "}
            <span className="underline text-emerald-600">Terms & Conditions</span>
          </span>
        </div>
        <TermsAndConditionModal
          isOpen={termsOpen}
          onClose={() => setTermsOpen(false)}
          onAgree={() => setAgreed(true)}
          agreed={agreed} // <-- Add this line!
          color={color}
        />
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